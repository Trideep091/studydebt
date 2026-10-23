from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes.ai_routes import router as ai_router
from app.api.routes.ocr_routes import router as ocr_router

app = FastAPI(
    title=settings.app_name,
    description="Open-Weight AI Study Recovery Service for StudyDebt",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(ai_router)
app.include_router(ocr_router)

@app.get("/")
async def root():
    return {
        "app": "StudyDebt Backend API",
        "tagline": "Your backlog, under control.",
        "status": "online",
        "provider": settings.ai_provider,
    }

@app.get("/health")
async def health():
    return {"status": "ok"}
