import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "StudyDebt Backend API"
    assert data["status"] == "online"

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_ai_health_endpoint():
    response = client.get("/api/ai/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "provider" in data
    assert "model" in data

def test_summarize_screenshot():
    payload = {
        "extracted_text": "Java Arrays: int[] arr = new int[10]; Arrays are fixed in size and allocated contiguously.",
        "subject_hint": "Computer Science",
        "target_review_minutes": 10,
    }
    response = client.post("/api/ai/summarize-screenshot", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "title" in data
    assert "gist" in data
    assert "knowledgeCheck" in data
    assert len(data["knowledgeCheck"]["options"]) == 4

def test_generate_microstudy():
    payload = {
        "topic_title": "B-Tree Indexing",
        "subject": "Databases",
        "duration_minutes": 10,
        "energy_level": "medium",
        "mode": "understand",
    }
    response = client.post("/api/ai/generate-microstudy", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "objective" in data
    assert "explanation" in data
    assert "practiceQuestion" in data
    assert "knowledgeCheck" in data

def test_generate_quiz():
    payload = {
        "topic_title": "Recursion",
        "subject": "Computer Science",
        "question_count": 2,
    }
    response = client.post("/api/ai/generate-quiz", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["questions"]) >= 1

def test_plan_week():
    payload = {
        "workload_description": "Finish Java arrays and revise linear algebra matrices.",
        "target_window": "3_days",
        "start_date": "2026-10-24",
        "days_count": 3,
        "daily_available_minutes": {
            "2026-10-24": 60,
            "2026-10-25": 45,
            "2026-10-26": 60,
        },
    }
    response = client.post("/api/ai/plan-week", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "tasks" in data
    assert len(data["tasks"]) > 0
