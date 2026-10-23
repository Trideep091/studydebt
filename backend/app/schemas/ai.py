from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class QuizQuestionSchema(BaseModel):
    question: str
    options: List[str]
    answerIndex: int
    explanation: str

class DefinitionItemSchema(BaseModel):
    term: str
    explanation: str

# Screenshot Overview Schemas
class ScreenshotSummarizeRequest(BaseModel):
    extracted_text: str
    image_base64: Optional[str] = None
    subject_hint: Optional[str] = None
    target_review_minutes: Optional[int] = 10

class SmartOverviewResponse(BaseModel):
    title: str
    gist: str
    mainConcepts: List[str]
    definitionsAndFormulas: List[DefinitionItemSchema] = []
    keyTakeaways: List[str]
    actionItems: List[str] = []
    knowledgeCheck: QuizQuestionSchema
    tags: List[str] = []
    estimatedMinutes: int = 10
    sourceExtractedText: Optional[str] = None
    isOcrComplete: bool = True

# Micro-learning Session Schemas
class MicroLearningRequest(BaseModel):
    topic_title: str
    subject: str
    description: Optional[str] = ""
    learning_objectives: Optional[List[str]] = []
    duration_minutes: int = 10  # 5, 10, 15, 25
    energy_level: str = "medium"  # low, medium, high
    mode: str = "understand"  # understand, practice, revise, catchup
    material_context: Optional[str] = None

class MicroLearningResponse(BaseModel):
    objective: str
    explanation: str
    example: str
    practiceQuestion: QuizQuestionSchema
    knowledgeCheck: QuizQuestionSchema

# Quiz Generation Schemas
class QuizGenerateRequest(BaseModel):
    topic_title: str
    subject: str
    content: Optional[str] = ""
    question_count: int = 3
    difficulty: str = "medium"

class QuizGenerateResponse(BaseModel):
    questions: List[QuizQuestionSchema]

# Answer Evaluation Schemas
class AnswerEvaluationRequest(BaseModel):
    question: str
    options: Optional[List[str]] = []
    student_answer: str
    correct_answer: Optional[str] = None
    context: Optional[str] = None

class AnswerEvaluationResponse(BaseModel):
    is_correct: bool
    score: int  # 0 to 100
    explanation: str
    key_takeaway: str
    next_step_recommendation: str

# Weekly Plan Generation Schemas
class WeeklyPlanRequest(BaseModel):
    workload_description: str
    target_window: str = "7_days"  # 2_days, 3_days, 7_days, custom
    start_date: str  # YYYY-MM-DD
    days_count: int = 7
    daily_available_minutes: Dict[str, int] = Field(default_factory=dict)
    existing_topics: Optional[List[Dict]] = []

class PlannedTaskItem(BaseModel):
    id: str
    title: str
    subject: str
    date: str  # YYYY-MM-DD
    durationMinutes: int
    priority: str  # low, medium, high, urgent
    status: str = "pending"
    linkedTopicId: Optional[str] = None
    notes: Optional[str] = None

class WeeklyPlanResponse(BaseModel):
    id: str
    targetWindow: str
    startDate: str
    endDate: str
    dailyCapacityMinutes: Dict[str, int]
    tasks: List[PlannedTaskItem]
    originalPrompt: Optional[str] = None
    summary: str

# Health Check Schema
class AIHealthResponse(BaseModel):
    status: str
    provider: str
    model: str
    endpoint: str
    is_connected: bool
    details: Optional[str] = None
