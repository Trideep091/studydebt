import json

SYSTEM_INSTRUCTION = """You are StudyDebt's Open-Weight Educational AI Engine.
Your mission is to help overwhelmed students recover from academic chaos.
You produce clear, concise, highly structured educational material.
Always respond strictly with a valid JSON object matching the requested schema.
Do NOT include markdown formatting (like ```json ... ```) or conversational preamble.
Provide purely the JSON output."""

def build_screenshot_summary_prompt(extracted_text: str, subject_hint: str = "", target_minutes: int = 10) -> str:
    return f"""Analyze the following extracted content from a student's educational screenshot or lecture notes.
Subject hint: {subject_hint or 'General Academic'}
Target review duration: {target_minutes} minutes

Extracted Source Content:
\"\"\"
{extracted_text}
\"\"\"

Produce a valid JSON object with EXACTLY this structure:
{{
  "title": "Clear descriptive title for this study resource",
  "gist": "A 1-2 sentence plain-language summary of what this teaches",
  "mainConcepts": ["Concept 1", "Concept 2", "Concept 3"],
  "definitionsAndFormulas": [
    {{"term": "Term or Formula name", "explanation": "Clear definition or meaning"}}
  ],
  "keyTakeaways": [
    "Key takeaway point 1",
    "Key takeaway point 2"
  ],
  "actionItems": [
    "Concrete follow-up practice step 1"
  ],
  "knowledgeCheck": {{
    "question": "A multiple-choice question testing understanding of this screenshot",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answerIndex": 0,
    "explanation": "Why this answer is correct based on the material"
  }},
  "tags": ["tag1", "tag2"],
  "estimatedMinutes": {target_minutes}
}}
"""

def build_micro_learning_prompt(
    topic_title: str,
    subject: str,
    duration_minutes: int,
    energy_level: str,
    mode: str,
    description: str = "",
    objectives: list = None,
    material_context: str = ""
) -> str:
    objectives_str = ", ".join(objectives) if objectives else "Master core fundamentals"
    
    return f"""Design a focused {duration_minutes}-minute micro-learning session for a student.
Topic: {topic_title}
Subject: {subject}
Student Energy Level: {energy_level} (Adjust density and tone accordingly)
Session Mode: {mode} (understand / practice / revise / catchup)
Context/Notes: {description}
Learning Objectives: {objectives_str}
Reference Material: {material_context or 'None provided'}

CRITICAL GUIDELINES:
- For a {duration_minutes}-minute session with {energy_level} energy, ensure the reading is concise and achievable.
- Provide a crystal-clear explanation, 1 concrete illustrative example or code snippet, 1 practice check question, and 1 final knowledge check question.

Produce a valid JSON object with EXACTLY this structure:
{{
  "objective": "Concise learning objective for this {duration_minutes}-minute session",
  "explanation": "Clear, engaging breakdown of the concept tailored to {energy_level} energy",
  "example": "A concrete real-world example, code block, or formula application",
  "practiceQuestion": {{
    "question": "A multiple choice practice question to verify understanding midway",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answerIndex": 0,
    "explanation": "Detailed step-by-step reasoning"
  }},
  "knowledgeCheck": {{
    "question": "Final knowledge check multiple choice question",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answerIndex": 1,
    "explanation": "Why this option is correct"
  }}
}}
"""

def build_quiz_prompt(topic_title: str, subject: str, content: str = "", count: int = 3) -> str:
    return f"""Create a quiz with {count} high-quality multiple choice questions.
Topic: {topic_title}
Subject: {subject}
Study Notes / Material:
\"\"\"
{content}
\"\"\"

Produce a valid JSON object with EXACTLY this structure:
{{
  "questions": [
    {{
      "question": "Question text here?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "answerIndex": 0,
      "explanation": "Clear explanation of the correct choice"
    }}
  ]
}}
"""

def build_weekly_plan_prompt(
    workload: str,
    target_window: str,
    start_date: str,
    days_count: int,
    daily_capacities: dict
) -> str:
    capacities_str = json.dumps(daily_capacities)
    return f"""A student needs a manageable study plan for their academic workload.
Workload description:
\"\"\"
{workload}
\"\"\"
Target Window: {target_window} ({days_count} days starting from {start_date})
Daily Available Study Time in Minutes: {capacities_str}

Break large topics into bite-sized actionable tasks (15 to 45 minutes each).
Distribute tasks across the dates starting from {start_date} up to {days_count} days.
Ensure the total minutes assigned to any day does not excessively exceed that day's available capacity.

Produce a valid JSON object with EXACTLY this structure:
{{
  "summary": "Brief encouraging summary of this weekly strategy",
  "tasks": [
    {{
      "id": "task-1",
      "title": "Specific actionable study task",
      "subject": "Subject name",
      "date": "{start_date}",
      "durationMinutes": 25,
      "priority": "high",
      "status": "pending",
      "notes": "Short focus tip for this task"
    }}
  ]
}}
"""
