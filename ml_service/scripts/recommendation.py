import os
import joblib
import pandas as pd
import numpy as np
class RecommendationEngine:
    def __init__(self, models_dir="ml_service/app/models"):
        self.models_dir = models_dir
        self.success_model_path = os.path.join(models_dir, 'success_model.joblib')
        self.time_model_path = os.path.join(models_dir, 'time_model.joblib')
        self.metadata_path = os.path.join(models_dir, 'model_metadata.joblib')
        
        self.success_model = None
        self.time_model = None
        self.metadata = None
        self.load_models()
    def load_models(self):
        if os.path.exists(self.success_model_path):
            self.success_model = joblib.load(self.success_model_path)
        if os.path.exists(self.time_model_path):
            self.time_model = joblib.load(self.time_model_path)
        if os.path.exists(self.metadata_path):
            self.metadata = joblib.load(self.metadata_path)
    def get_recommendations(self, user_skills, target_difficulty, solved_problem_ids, problems_pool, limit=5):
        """
        user_skills: dict e.g. {"Arrays": 0.8, "DP": 0.3, ...}
        target_difficulty: str ("Easy", "Medium", "Hard") or None
        solved_problem_ids: list of strings/ints
        problems_pool: list of dicts representing all problems in DB
        limit: int, number of recommendations to return
        """
        if not self.success_model or not self.time_model:
            # Fallback if models are not trained yet
            print("Models not loaded. Using fallback recommendation (simplistic heuristic).")
            return self._fallback_recommendations(user_skills, target_difficulty, solved_problem_ids, problems_pool, limit)
        # Filter out already solved problems
        candidates = [p for p in problems_pool if str(p['problem_id']) not in [str(x) for x in solved_problem_ids]]
        
        if not candidates:
            return []
        difficulty_map = {"Easy": 1, "Medium": 2, "Hard": 3}
        
        recommendations = []
        
        for problem in candidates:
            # Extract features for prediction
            topic = problem['topic']
            prob_difficulty = problem['difficulty']
            difficulty_num = difficulty_map.get(prob_difficulty, 2)
            acceptance_rate = problem.get('acceptance_rate', 0.5)
            
            # User topic skill (defaults to overall user average skill if topic not found)
            topic_skill = user_skills.get(topic, np.mean(list(user_skills.values())) if user_skills else 0.5)
            user_skill_avg = np.mean(list(user_skills.values())) if user_skills else 0.5
            
            # Predict features:
            # feature_cols = ['user_skill', 'topic_skill', 'difficulty_numeric', 'acceptance_rate', 'attempts', 'hints_used']
            # We assume a standard initial attempt profile for a new problem (1 attempt, 0 hints)
            features = pd.DataFrame([[
                user_skill_avg,
                topic_skill,
                difficulty_num,
                acceptance_rate,
                1, # attempts
                0  # hints_used
            ]], columns=['user_skill', 'topic_skill', 'difficulty_numeric', 'acceptance_rate', 'attempts', 'hints_used'])
            
            # Success Probability
            try:
                if hasattr(self.success_model, "predict_proba"):
                    success_prob = self.success_model.predict_proba(features)[0][1]
                else:
                    success_prob = float(self.success_model.predict(features)[0])
            except Exception as e:
                success_prob = 0.5
                
            # Predicted Solve Time
            try:
                predicted_time = float(self.time_model.predict(features)[0])
            except Exception as e:
                predicted_time = 30.0
            # Calculate Recommendation Score
            # 1. Difficulty Fit: Target success rate around 70% (Zone of Proximal Development)
            diff_fit = 1.0 - abs(success_prob - 0.70)
            
            # 2. Learning Value: Higher weight for topics where the user has lower skill scores
            learning_value = 1.0 - topic_skill
            
            # 3. Preference alignment (if user specifically asked for a difficulty)
            diff_match = 1.0 if target_difficulty == prob_difficulty else 0.5
            if target_difficulty is None:
                diff_match = 1.0
                
            # Combine scores
            score = (0.4 * diff_fit) + (0.4 * learning_value) + (0.2 * diff_match)
            
            # Generate Explainable AI (XAI) comments
            reasons = []
            if topic_skill < 0.5:
                reasons.append(f"This targets '{topic}', which is currently one of your weaker areas ({int(topic_skill * 100)}% skill score).")
            else:
                reasons.append(f"Allows you to reinforce your solid '{topic}' skill ({int(topic_skill * 100)}% score).")
                
            if 0.6 <= success_prob <= 0.8:
                reasons.append(f"Based on your profile, you have an optimal success probability ({int(success_prob * 100)}%), meaning it is challenging but highly solvable.")
            elif success_prob > 0.8:
                reasons.append(f"High success confidence ({int(success_prob * 100)}%), perfect for building momentum and speed.")
            else:
                reasons.append(f"Low predicted success probability ({int(success_prob * 100)}%). Solving this will push your limits and maximize learning.")
            reasons.append(f"Estimated solve time: {int(predicted_time)} minutes.")
            recommendations.append({
                "problem_id": problem['problem_id'],
                "title": problem['title'],
                "difficulty": prob_difficulty,
                "topic": topic,
                "acceptance_rate": acceptance_rate,
                "success_prob": round(success_prob, 2),
                "predicted_time": int(predicted_time),
                "reco_score": round(score, 3),
                "explanations": reasons
            })
            
        # Sort recommendations by score descending
        recommendations.sort(key=lambda x: x['reco_score'], reverse=True)
        return recommendations[:limit]
    def _fallback_recommendations(self, user_skills, target_difficulty, solved_problem_ids, problems_pool, limit):
        candidates = [p for p in problems_pool if str(p['problem_id']) not in [str(x) for x in solved_problem_ids]]
        
        # Heuristic sorting:
        # Prioritize weakest topics first
        weakest_topics = sorted(user_skills.keys(), key=lambda t: user_skills[t])
        
        fallback_recs = []
        for p in candidates:
            topic = p['topic']
            diff = p['difficulty']
            
            # simple score
            topic_index = weakest_topics.index(topic) if topic in weakest_topics else len(weakest_topics)
            # higher score if topic is weaker (lower index)
            topic_score = 1.0 - (topic_index / max(1, len(weakest_topics)))
            
            diff_score = 1.0 if target_difficulty == diff else 0.5
            score = 0.7 * topic_score + 0.3 * diff_score
            
            # Simple predictions
            diff_times = {"Easy": 15, "Medium": 30, "Hard": 50}
            diff_success = {"Easy": 0.85, "Medium": 0.65, "Hard": 0.40}
            
            fallback_recs.append({
                "problem_id": p['problem_id'],
                "title": p['title'],
                "difficulty": diff,
                "topic": topic,
                "acceptance_rate": p.get('acceptance_rate', 0.5),
                "success_prob": diff_success.get(diff, 0.6),
                "predicted_time": diff_times.get(diff, 30),
                "reco_score": score,
                "explanations": [
                    f"Recommended fallback focusing on '{topic}'.",
                    f"Heuristic estimated solve time is {diff_times.get(diff, 30)} minutes."
                ]
            })
            
        fallback_recs.sort(key=lambda x: x['reco_score'], reverse=True)
        return fallback_recs[:limit]
