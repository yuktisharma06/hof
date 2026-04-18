"""
InterviewMesh ML Service — FastAPI
Provides: Peer Matching, Anomaly Detection, Knowledge Tracing, Code Evaluation, NLP Feedback
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import numpy as np
from models.matching import PeerMatcher
from models.anomaly import AnomalyDetector
from models.knowledge_tracing import KnowledgeTracer
from models.code_evaluator import CodeEvaluator
from models.feedback_generator import FeedbackGenerator
from models.resume_parser import ResumeParser

app = FastAPI(title="InterviewMesh ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models
peer_matcher = PeerMatcher()
anomaly_detector = AnomalyDetector()
knowledge_tracer = KnowledgeTracer()
code_evaluator = CodeEvaluator()
feedback_generator = FeedbackGenerator()
resume_parser = ResumeParser()


# ─── SCHEMAS ────────────────────────────────────────────────────────────────────
class MatchRequest(BaseModel):
    user_id: str
    user_skills: List[str]
    user_elo: float
    user_rating: float
    improvement_trend: float
    candidates: List[Dict]


class AnomalyRequest(BaseModel):
    typing_speed_avg: float
    typing_speed_std: float
    paste_count: int
    tab_switches: int
    solve_time: float
    avg_solve_time: float
    code_similarity: float = 0.0


class RoadmapRequest(BaseModel):
    user_id: str
    skill_levels: Dict[str, float]
    session_history: List[Dict] = []


class CodeEvalRequest(BaseModel):
    code: str
    language: str = "python"
    question_id: str = ""
    optimal_complexity: str = ""


class FeedbackRequest(BaseModel):
    session_data: Dict
    user_performance: Dict
    code_quality: Dict = {}


class ResumeRequest(BaseModel):
    resume_text: str


# ─── ENDPOINTS ──────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "healthy", "models_loaded": True}


@app.post("/match")
def match_peers(req: MatchRequest):
    matches = peer_matcher.rank_peers(
        user_skills=req.user_skills,
        user_elo=req.user_elo,
        user_rating=req.user_rating,
        improvement_trend=req.improvement_trend,
        candidates=req.candidates
    )
    return {"matches": matches}


@app.post("/anomaly")
def detect_anomaly(req: AnomalyRequest):
    result = anomaly_detector.detect(
        typing_speed_avg=req.typing_speed_avg,
        typing_speed_std=req.typing_speed_std,
        paste_count=req.paste_count,
        tab_switches=req.tab_switches,
        solve_time=req.solve_time,
        avg_solve_time=req.avg_solve_time,
        code_similarity=req.code_similarity
    )
    return result


@app.post("/roadmap")
def get_roadmap(req: RoadmapRequest):
    roadmap = knowledge_tracer.get_roadmap(
        skill_levels=req.skill_levels,
        session_history=req.session_history
    )
    return roadmap


@app.post("/evaluate")
def evaluate_code(req: CodeEvalRequest):
    result = code_evaluator.evaluate(
        code=req.code,
        language=req.language,
        optimal_complexity=req.optimal_complexity
    )
    return result


@app.post("/feedback")
def generate_feedback(req: FeedbackRequest):
    result = feedback_generator.generate(
        session_data=req.session_data,
        user_performance=req.user_performance,
        code_quality=req.code_quality
    )
    return result


@app.post("/resume")
def parse_resume(req: ResumeRequest):
    result = resume_parser.parse(req.resume_text)
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
