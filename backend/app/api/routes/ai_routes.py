from fastapi import APIRouter, HTTPException
from app.schemas.ai import (
    ScreenshotSummarizeRequest,
    SmartOverviewResponse,
    MicroLearningRequest,
    MicroLearningResponse,
    QuizGenerateRequest,
    QuizGenerateResponse,
    WeeklyPlanRequest,
    WeeklyPlanResponse,
    AIHealthResponse,
)
from app.services.ai_service import ai_service

router = APIRouter(prefix="/api/ai", tags=["AI Inference"])

@router.get("/health", response_model=AIHealthResponse)
async def get_ai_health():
    """Check connectivity to configured open-weight model runtime."""
    return await ai_service.check_health()

@router.post("/summarize-screenshot", response_model=SmartOverviewResponse)
async def summarize_screenshot_endpoint(req: ScreenshotSummarizeRequest):
    """Generate structured educational Smart Overview from extracted screenshot text."""
    if not req.extracted_text.strip():
        raise HTTPException(status_code=400, detail="Extracted text cannot be empty.")
    return await ai_service.summarize_screenshot(
        extracted_text=req.extracted_text,
        subject_hint=req.subject_hint or "",
        target_minutes=req.target_review_minutes or 10,
    )

@router.post("/generate-microstudy", response_model=MicroLearningResponse)
async def generate_microstudy_endpoint(req: MicroLearningRequest):
    """Generate an adaptive micro-learning session tailored to time & energy level."""
    return await ai_service.generate_micro_learning(
        topic_title=req.topic_title,
        subject=req.subject,
        duration_minutes=req.duration_minutes,
        energy_level=req.energy_level,
        mode=req.mode,
        description=req.description or "",
        objectives=req.learning_objectives or [],
        material_context=req.material_context or "",
    )

@router.post("/generate-quiz", response_model=QuizGenerateResponse)
async def generate_quiz_endpoint(req: QuizGenerateRequest):
    """Generate multiple-choice practice quiz questions."""
    return await ai_service.generate_quiz(
        topic_title=req.topic_title,
        subject=req.subject,
        content=req.content or "",
        count=req.question_count,
    )

@router.post("/plan-week", response_model=WeeklyPlanResponse)
async def plan_weekly_study_endpoint(req: WeeklyPlanRequest):
    """Generate an actionable weekly study schedule from natural language tasks."""
    return await ai_service.plan_weekly_workload(
        workload=req.workload_description,
        target_window=req.target_window,
        start_date=req.start_date,
        days_count=req.days_count,
        daily_capacities=req.daily_available_minutes,
    )
