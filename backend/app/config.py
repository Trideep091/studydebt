import os
from pydantic import BaseModel

class Settings(BaseModel):
    # App Settings
    app_name: str = "StudyDebt AI Gateway"
    environment: str = os.getenv("ENVIRONMENT", "development")
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000", "*"]

    # AI Provider Settings: 'ollama' or 'openai_compatible'
    ai_provider: str = os.getenv("AI_PROVIDER", "ollama")
    
    # Ollama settings
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    ollama_model: str = os.getenv("OLLAMA_MODEL", "llama3.2")
    
    # OpenAI-compatible open-weight endpoint (Groq, vLLM, Together, etc.)
    openai_compatible_base_url: str = os.getenv("OPENAI_COMPATIBLE_BASE_URL", "https://api.together.xyz/v1")
    openai_compatible_api_key: str = os.getenv("OPENAI_COMPATIBLE_API_KEY", "")
    openai_compatible_model: str = os.getenv("OPENAI_COMPATIBLE_MODEL", "meta-llama/Llama-3.3-70B-Instruct-Turbo")

    # Request timeouts
    request_timeout_seconds: float = float(os.getenv("AI_TIMEOUT_SECONDS", "45.0"))

settings = Settings()
