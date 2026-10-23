import json
import re
import logging
from typing import Any, Dict, Optional
import httpx

from app.config import settings
from app.schemas.ai import (
    SmartOverviewResponse,
    MicroLearningResponse,
    QuizGenerateResponse,
    AnswerEvaluationResponse,
    WeeklyPlanResponse,
    AIHealthResponse,
    QuizQuestionSchema,
    DefinitionItemSchema,
    PlannedTaskItem,
)
from app.services.prompt_templates import (
    SYSTEM_INSTRUCTION,
    build_screenshot_summary_prompt,
    build_micro_learning_prompt,
    build_quiz_prompt,
    build_weekly_plan_prompt,
)

logger = logging.getLogger("studydebt.ai")

def clean_json_response(raw_text: str) -> str:
    """Strip markdown backticks, preambles, and postambles to extract valid JSON."""
    cleaned = raw_text.strip()
    # Match ```json ... ``` or ``` ... ```
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
    if match:
        cleaned = match.group(1).strip()
    return cleaned

class AIService:
    def __init__(self):
        self.provider = settings.ai_provider
        self.ollama_url = settings.ollama_base_url
        self.ollama_model = settings.ollama_model
        self.openai_url = settings.openai_compatible_base_url
        self.openai_key = settings.openai_compatible_api_key
        self.openai_model = settings.openai_compatible_model
        self.timeout = settings.request_timeout_seconds

    async def check_health(self) -> AIHealthResponse:
        """Test connection to the configured inference engine."""
        if self.provider == "ollama":
            url = f"{self.ollama_url}/api/tags"
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        data = resp.json()
                        models = [m.get("name", "") for m in data.get("models", [])]
                        return AIHealthResponse(
                            status="online",
                            provider="ollama",
                            model=self.ollama_model,
                            endpoint=self.ollama_url,
                            is_connected=True,
                            details=f"Ollama connected. Available models: {', '.join(models) if models else 'none loaded yet'}",
                        )
                    else:
                        return AIHealthResponse(
                            status="degraded",
                            provider="ollama",
                            model=self.ollama_model,
                            endpoint=self.ollama_url,
                            is_connected=False,
                            details=f"Ollama returned status {resp.status_code}",
                        )
            except Exception as e:
                return AIHealthResponse(
                    status="offline",
                    provider="ollama",
                    model=self.ollama_model,
                    endpoint=self.ollama_url,
                    is_connected=False,
                    details=f"Could not connect to Ollama at {self.ollama_url}. Using local educational engine. Run 'ollama serve' to enable local inference.",
                )
        else:
            # OpenAI-compatible endpoint
            url = f"{self.openai_url}/models"
            headers = {}
            if self.openai_key:
                headers["Authorization"] = f"Bearer {self.openai_key}"
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    resp = await client.get(url, headers=headers)
                    if resp.status_code in [200, 404]:
                        return AIHealthResponse(
                            status="online",
                            provider="openai_compatible",
                            model=self.openai_model,
                            endpoint=self.openai_url,
                            is_connected=True,
                            details="OpenAI-compatible inference endpoint reachable.",
                        )
                    else:
                        return AIHealthResponse(
                            status="error",
                            provider="openai_compatible",
                            model=self.openai_model,
                            endpoint=self.openai_url,
                            is_connected=False,
                            details=f"Endpoint returned status code {resp.status_code}",
                        )
            except Exception as e:
                return AIHealthResponse(
                    status="offline",
                    provider="openai_compatible",
                    model=self.openai_model,
                    endpoint=self.openai_url,
                    is_connected=False,
                    details=f"Connection failed: {str(e)}",
                )

    async def _invoke_model(self, prompt: str) -> Optional[str]:
        """Invoke configured inference model, returning raw text or None if unreachable."""
        if self.provider == "ollama":
            url = f"{self.ollama_url}/api/generate"
            payload = {
                "model": self.ollama_model,
                "prompt": f"{SYSTEM_INSTRUCTION}\n\n{prompt}",
                "stream": False,
                "format": "json",
            }
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        return data.get("response", "")
            except Exception as e:
                logger.warning(f"Ollama inference error: {e}")
                return None
        else:
            url = f"{self.openai_url}/chat/completions"
            headers = {"Content-Type": "application/json"}
            if self.openai_key:
                headers["Authorization"] = f"Bearer {self.openai_key}"
            payload = {
                "model": self.openai_model,
                "messages": [
                    {"role": "system", "content": SYSTEM_INSTRUCTION},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.2,
                "response_format": {"type": "json_object"},
            }
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    resp = await client.post(url, json=payload, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["choices"][0]["message"]["content"]
            except Exception as e:
                logger.warning(f"OpenAI compatible inference error: {e}")
                return None

        return None

    # =========================================================
    # 1. SCREENSHOT SUMMARIZATION & SMART OVERVIEW
    # =========================================================
    async def summarize_screenshot(
        self,
        extracted_text: str,
        subject_hint: str = "",
        target_minutes: int = 10,
    ) -> SmartOverviewResponse:
        prompt = build_screenshot_summary_prompt(extracted_text, subject_hint, target_minutes)
        raw_output = await self._invoke_model(prompt)

        if raw_output:
            try:
                parsed = json.loads(clean_json_response(raw_output))
                return SmartOverviewResponse(
                    title=parsed.get("title", "Study Overview"),
                    gist=parsed.get("gist", "Overview extracted from study material."),
                    mainConcepts=parsed.get("mainConcepts", ["Key Concept"]),
                    definitionsAndFormulas=[
                        DefinitionItemSchema(**d) for d in parsed.get("definitionsAndFormulas", [])
                    ],
                    keyTakeaways=parsed.get("keyTakeaways", ["Review key takeaways"]),
                    actionItems=parsed.get("actionItems", ["Practice one problem"]),
                    knowledgeCheck=QuizQuestionSchema(**parsed.get("knowledgeCheck")),
                    tags=parsed.get("tags", [subject_hint or "Study"]),
                    estimatedMinutes=parsed.get("estimatedMinutes", target_minutes),
                    sourceExtractedText=extracted_text,
                    isOcrComplete=True,
                )
            except Exception as e:
                logger.error(f"Failed to parse model JSON: {e}")

        # Deterministic Grounded Fallback
        lines = [l.strip() for l in extracted_text.splitlines() if l.strip()]
        first_line = lines[0] if lines else "Study Material"
        title = first_line[:60] if len(first_line) > 10 else f"{subject_hint or 'Topic'} Summary"
        snippet = " ".join(lines[:4]) if lines else "Educational study excerpt."

        return SmartOverviewResponse(
            title=title,
            gist=snippet[:240] + ("..." if len(snippet) > 240 else ""),
            mainConcepts=[lines[i][:50] for i in range(min(3, len(lines)))] if lines else ["Core concept"],
            definitionsAndFormulas=[
                DefinitionItemSchema(term="Key Principle", explanation="Fundamental rule discussed in source text.")
            ],
            keyTakeaways=[
                "Understand the primary definitions and scope.",
                "Review the practical examples in the material.",
            ],
            actionItems=["Test your memory with the knowledge check question below."],
            knowledgeCheck=QuizQuestionSchema(
                question=f"What is the primary topic addressed in '{title}'?",
                options=[
                    f"Understanding {title}",
                    "Unrelated administrative policies",
                    "Generic unrelated notes",
                    "Historical timeline only",
                ],
                answerIndex=0,
                explanation="The provided notes focus directly on understanding this concept.",
            ),
            tags=[subject_hint or "Study", "Review", "Notes"],
            estimatedMinutes=target_minutes,
            sourceExtractedText=extracted_text,
            isOcrComplete=True,
        )

    # =========================================================
    # 2. MICRO-LEARNING SESSION GENERATION
    # =========================================================
    async def generate_micro_learning(
        self,
        topic_title: str,
        subject: str,
        duration_minutes: int,
        energy_level: str,
        mode: str,
        description: str = "",
        objectives: list = None,
        material_context: str = "",
    ) -> MicroLearningResponse:
        prompt = build_micro_learning_prompt(
            topic_title, subject, duration_minutes, energy_level, mode, description, objectives, material_context
        )
        raw_output = await self._invoke_model(prompt)

        if raw_output:
            try:
                parsed = json.loads(clean_json_response(raw_output))
                return MicroLearningResponse(
                    objective=parsed.get("objective", f"Understand {topic_title}"),
                    explanation=parsed.get("explanation", ""),
                    example=parsed.get("example", ""),
                    practiceQuestion=QuizQuestionSchema(**parsed.get("practiceQuestion")),
                    knowledgeCheck=QuizQuestionSchema(**parsed.get("knowledgeCheck")),
                )
            except Exception as e:
                logger.error(f"Failed to parse micro-learning JSON: {e}")

        # Deterministic Grounded Fallback
        is_low_energy = energy_level == "low"
        explanation = (
            f"Let's keep things gentle and clear. {topic_title} in {subject} is fundamentally about "
            f"breaking down complex ideas into manageable steps. "
            f"{description if description else 'Focus on the essential rule and how it is applied in practice.'}"
        )
        example = (
            f"Example for {topic_title}:\n"
            f"Suppose you encounter a standard problem. First identify the inputs, apply the core principle, "
            f"and verify the expected result step-by-step."
        )

        return MicroLearningResponse(
            objective=f"Master key fundamentals of {topic_title} in {duration_minutes} minutes.",
            explanation=explanation,
            example=example,
            practiceQuestion=QuizQuestionSchema(
                question=f"When applying {topic_title}, what is the recommended first step?",
                options=[
                    "Identify the inputs and verify constraints",
                    "Skip directly to guesswork",
                    "Ignore the base conditions",
                    "Assume all cases are identical",
                ],
                answerIndex=0,
                explanation="Correct! Checking inputs and constraints prevents systematic errors.",
            ),
            knowledgeCheck=QuizQuestionSchema(
                question=f"Which statement best characterizes {topic_title}?",
                options=[
                    "It provides a structured, verifiable approach to solving problems in this domain.",
                    "It cannot be tested or validated mathematically.",
                    "It is obsolete and has no practical applications.",
                    "It requires skipping foundational concepts entirely.",
                ],
                answerIndex=0,
                explanation="Well done! A structured approach makes learning scalable and debt-free.",
            ),
        )

    # =========================================================
    # 3. QUIZ GENERATION
    # =========================================================
    async def generate_quiz(
        self,
        topic_title: str,
        subject: str,
        content: str = "",
        count: int = 3,
    ) -> QuizGenerateResponse:
        prompt = build_quiz_prompt(topic_title, subject, content, count)
        raw_output = await self._invoke_model(prompt)

        if raw_output:
            try:
                parsed = json.loads(clean_json_response(raw_output))
                questions = [QuizQuestionSchema(**q) for q in parsed.get("questions", [])]
                if questions:
                    return QuizGenerateResponse(questions=questions)
            except Exception as e:
                logger.error(f"Quiz parsing error: {e}")

        # Fallback quiz
        return QuizGenerateResponse(
            questions=[
                QuizQuestionSchema(
                    question=f"What is the core objective of studying {topic_title}?",
                    options=[
                        f"Gaining deep conceptual clarity in {subject}",
                        "Memorizing without understanding",
                        "Avoiding practice exercises",
                        "Postponing revision indefinitely",
                    ],
                    answerIndex=0,
                    explanation=f"Conceptual clarity in {subject} leads to long-term retention.",
                ),
                QuizQuestionSchema(
                    question=f"How should an unexpected edge case in {topic_title} be handled?",
                    options=[
                        "Validate against defined boundary conditions",
                        "Ignore it and assume success",
                        "Delete the problem statement",
                        "Treat all outputs as arbitrary",
                    ],
                    answerIndex=0,
                    explanation="Boundary condition verification is essential in rigorous academic study.",
                ),
            ]
        )

    # =========================================================
    # 4. WEEKLY STUDY PLAN GENERATION
    # =========================================================
    async def plan_weekly_workload(
        self,
        workload: str,
        target_window: str,
        start_date: str,
        days_count: int,
        daily_capacities: dict,
    ) -> WeeklyPlanResponse:
        prompt = build_weekly_plan_prompt(workload, target_window, start_date, days_count, daily_capacities)
        raw_output = await self._invoke_model(prompt)

        if raw_output:
            try:
                parsed = json.loads(clean_json_response(raw_output))
                tasks = [PlannedTaskItem(**t) for t in parsed.get("tasks", [])]
                if tasks:
                    from datetime import datetime, timedelta
                    start_dt = datetime.strptime(start_date, "%Y-%m-%d")
                    end_dt = start_dt + timedelta(days=days_count - 1)
                    return WeeklyPlanResponse(
                        id=f"plan-{int(datetime.now().timestamp())}",
                        targetWindow=target_window,
                        startDate=start_date,
                        endDate=end_dt.strftime("%Y-%m-%d"),
                        dailyCapacityMinutes=daily_capacities,
                        tasks=tasks,
                        originalPrompt=workload,
                        summary=parsed.get("summary", "Personalized weekly schedule designed for steady progress."),
                    )
            except Exception as e:
                logger.error(f"Weekly plan parsing error: {e}")

        # Deterministic Grounded Schedule Generator
        from datetime import datetime, timedelta
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = start_dt + timedelta(days=days_count - 1)

        # Parse tasks from sentences or comma-separated fragments
        raw_items = [
            i.strip()
            for i in re.split(r"[,;\n\.]+", workload)
            if len(i.strip()) > 3
        ]
        if not raw_items:
            raw_items = ["Review backlog study topics", "Practice core exercises", "Revision check"]

        tasks = []
        for idx, item in enumerate(raw_items):
            day_offset = idx % days_count
            task_date = (start_dt + timedelta(days=day_offset)).strftime("%Y-%m-%d")
            prio = "urgent" if idx == 0 else "high" if idx < 3 else "medium"
            duration = 25 if idx % 2 == 0 else 20
            tasks.append(
                PlannedTaskItem(
                    id=f"task-gen-{idx + 1}",
                    title=item[:65],
                    subject="Study Plan",
                    date=task_date,
                    durationMinutes=duration,
                    priority=prio,
                    status="pending",
                    notes=f"Step {idx + 1} of your academic recovery sprint.",
                )
            )

        return WeeklyPlanResponse(
            id=f"plan-{int(datetime.now().timestamp())}",
            targetWindow=target_window,
            startDate=start_date,
            endDate=end_dt.strftime("%Y-%m-%d"),
            dailyCapacityMinutes=daily_capacities,
            tasks=tasks,
            originalPrompt=workload,
            summary="Schedule balanced across available days to eliminate study debt without burnout.",
        )

ai_service = AIService()
