import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import pandas as pd
import numpy as np
# Import recommendation engine
from .recommendation import RecommendationEngine
app = FastAPI(title="AI LeetCode Coach ML API", version="1.0.0")
# Enable CORS for communication with Node MERN backend and React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Initialize Recommendation Engine
reco_engine = RecommendationEngine(models_dir="ml_service/app/models")
# Input Schemas
class PredictionRequest(BaseModel):
    user_skill: float
    topic_skill: float
    difficulty_numeric: int
    acceptance_rate: float
    attempts: int
    hints_used: int
class PredictionResponse(BaseModel):
    success_probability: float
    predicted_time: float
class ProblemItem(BaseModel):
    problem_id: str
    title: str
    difficulty: str
    topic: str
    acceptance_rate: float
class RecommendationRequest(BaseModel):
    user_skills: Dict[str, float]
    target_difficulty: Optional[str] = None
    solved_problem_ids: List[str]
    problems: List[ProblemItem]
class SkillUpdateRequest(BaseModel):
    current_skill: float
    success: bool
    difficulty_numeric: int
    hints_used: int
class SkillUpdateResponse(BaseModel):
    updated_skill: float
@app.get("/")
def read_root():
    models_loaded = reco_engine.success_model is not None and reco_engine.time_model is not None
    return {
        "status": "online",
        "service": "AI LeetCode ML API",
        "models_loaded": models_loaded,
        "selected_classifier": reco_engine.metadata.get("selected_classifier") if reco_engine.metadata else None,
        "selected_regressor": reco_engine.metadata.get("selected_regressor") if reco_engine.metadata else None
    }
@app.post("/predict", response_model=PredictionResponse)
def predict(req: PredictionRequest):
    if not reco_engine.success_model or not reco_engine.time_model:
        # Fallback values
        diff_times = {1: 15.0, 2: 30.0, 3: 50.0}
        diff_probs = {1: 0.85, 2: 0.65, 3: 0.40}
        
        prob = diff_probs.get(req.difficulty_numeric, 0.6)
        time_taken = diff_times.get(req.difficulty_numeric, 30.0)
        
        # Simple adjustment
        prob = np.clip(prob + (req.user_skill - 0.5) * 0.3 - 0.05 * req.attempts + 0.05 * req.hints_used, 0.05, 0.95)
        time_taken = np.clip(time_taken * (1.5 - req.user_skill) * (1.0 + 0.1 * req.attempts), 5.0, 90.0)
        
        return PredictionResponse(
            success_probability=float(prob),
            predicted_time=float(time_taken)
        )
        
    # Convert input to DataFrame for models
    features = pd.DataFrame([[
        req.user_skill,
        req.topic_skill,
        req.difficulty_numeric,
        req.acceptance_rate,
        req.attempts,
        req.hints_used
    ]], columns=['user_skill', 'topic_skill', 'difficulty_numeric', 'acceptance_rate', 'attempts', 'hints_used'])
    
    try:
        # Success probability prediction
        if hasattr(reco_engine.success_model, "predict_proba"):
            success_prob = reco_engine.success_model.predict_proba(features)[0][1]
        else:
            success_prob = float(reco_engine.success_model.predict(features)[0])
            
        # Time taken prediction
        predicted_time = float(reco_engine.time_model.predict(features)[0])
        
        return PredictionResponse(
            success_probability=float(success_prob),
            predicted_time=float(predicted_time)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model prediction error: {str(e)}")
@app.post("/recommend")
def recommend_problems(req: RecommendationRequest):
    # Convert ProblemItems schema to lists of dicts
    problems_pool = [
        {
            "problem_id": p.problem_id,
            "title": p.title,
            "difficulty": p.difficulty,
            "topic": p.topic,
            "acceptance_rate": p.acceptance_rate
        }
        for p in req.problems
    ]
    
    try:
        recs = reco_engine.get_recommendations(
            user_skills=req.user_skills,
            target_difficulty=req.target_difficulty,
            solved_problem_ids=req.solved_problem_ids,
            problems_pool=problems_pool,
            limit=5
        )
        return {"recommendations": recs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation computation error: {str(e)}")
@app.post("/update-skill", response_model=SkillUpdateResponse)
def update_skill(req: SkillUpdateRequest):
    """
    Implements a Knowledge Tracing update rule.
    If the user solves a problem successfully, skill improves.
    If they fail, skill decreases.
    Adjustments are scaled by difficulty and hints used.
    """
    current = req.current_skill
    success = req.success
    diff = req.difficulty_numeric # 1: Easy, 2: Medium, 3: Hard
    hints = req.hints_used
    
    # Learning parameters
    base_learning_rate = 0.15
    base_slip_rate = 0.08
    
    if success:
        # Solving a harder problem yields higher skill gains
        # Hints used reduce the credit given to learning gain
        hint_penalty = max(0.2, 1.0 - 0.25 * hints)
        gain = base_learning_rate * (1.0 - current) * (diff / 2.0) * hint_penalty
        updated = current + gain
    else:
        # Failing an easy problem drops skill score more heavily than failing a hard one
        slip_weight = (4 - diff) / 2.0  # Easy (diff=1) -> weight=1.5; Hard (diff=3) -> weight=0.5
        loss = base_slip_rate * current * slip_weight
        updated = current - loss
        
    # Clip skill score between 0.05 and 1.00
    updated = float(np.clip(updated, 0.05, 1.0))
    return SkillUpdateResponse(updated_skill=round(updated, 3))
@app.post("/retrain")
def retrain_models():
    """
    Allows triggers to retrain the ML models if submissions_dataset.csv changes
    """
    try:
        from .training import train_models
        train_models(
            "ml_service/data/submissions_dataset.csv",
            "ml_service/app/models"
        )
        # Reload models
        reco_engine.load_models()
        return {"status": "success", "message": "Models successfully retrained and reloaded."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model retraining failed: {str(e)}")
