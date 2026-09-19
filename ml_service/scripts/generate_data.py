import os
import pandas as pd
import numpy as np
def generate_synthetic_data(output_path, num_samples=8000):
    np.random.seed(42)
    
    # User types
    # 0: Beginner (skills centered around 0.3)
    # 1: Intermediate (skills centered around 0.6)
    # 2: Advanced (skills centered around 0.85)
    user_types = np.random.choice([0, 1, 2], size=num_samples, p=[0.4, 0.4, 0.2])
    
    # User baseline skills
    user_skills = np.zeros(num_samples)
    user_skills[user_types == 0] = np.random.normal(0.3, 0.1, size=sum(user_types == 0))
    user_skills[user_types == 1] = np.random.normal(0.6, 0.1, size=sum(user_types == 1))
    user_skills[user_types == 2] = np.random.normal(0.85, 0.08, size=sum(user_types == 2))
    user_skills = np.clip(user_skills, 0.1, 1.0)
    
    # Topic specific skill (correlated with user skill, but with variance per problem topic)
    topic_skills = user_skills + np.random.normal(0, 0.15, size=num_samples)
    topic_skills = np.clip(topic_skills, 0.05, 1.0)
    
    # Problem difficulties (1: Easy, 2: Medium, 3: Hard)
    difficulties = np.random.choice([1, 2, 3], size=num_samples, p=[0.35, 0.45, 0.20])
    
    # Problem acceptance rates (typically Easy has high, Hard has low)
    base_acceptance = {1: 0.70, 2: 0.45, 3: 0.25}
    acceptance_rates = np.array([base_acceptance[d] + np.random.normal(0, 0.1) for d in difficulties])
    acceptance_rates = np.clip(acceptance_rates, 0.1, 0.95)
    
    # Attempts before success/failure (more attempts for harder problems, and lower skill)
    attempts = np.zeros(num_samples, dtype=int)
    for i in range(num_samples):
        # Base attempts
        difficulty_weight = difficulties[i] * 1.5
        skill_weight = (1.0 - user_skills[i]) * 2.5
        mean_attempts = max(1.0, difficulty_weight + skill_weight + np.random.normal(0, 0.5))
        attempts[i] = int(np.random.poisson(mean_attempts)) + 1
    attempts = np.clip(attempts, 1, 8)
    
    # Hints used (0, 1, 2, 3)
    # Higher difficulty and lower skill leads to more hints used
    hints = np.zeros(num_samples, dtype=int)
    for i in range(num_samples):
        prob_hint = (difficulties[i]/3.0) * (1.0 - user_skills[i])
        hints[i] = np.random.choice([0, 1, 2, 3], p=[
            max(0.0, 1.0 - prob_hint),
            min(1.0, prob_hint * 0.6),
            min(1.0, prob_hint * 0.3),
            min(1.0, prob_hint * 0.1)
        ] / np.sum([
            max(0.0, 1.0 - prob_hint),
            min(1.0, prob_hint * 0.6),
            min(1.0, prob_hint * 0.3),
            min(1.0, prob_hint * 0.1)
        ]))
    
    # Calculate success probability:
    # High skill, high acceptance, low difficulty, more hints -> higher success
    # Logit formula:
    logit = (
        3.0 * user_skills +
        2.5 * topic_skills -
        3.0 * (difficulties - 1) +
        2.0 * acceptance_rates +
        0.8 * hints -
        0.5 * attempts -
        0.8
    )
    success_prob = 1 / (1 + np.exp(-logit))
    success = np.random.binomial(1, success_prob)
    
    # Solve time (minutes)
    # Base times: Easy = 15m, Medium = 30m, Hard = 50m
    base_time = np.array([12.0, 28.0, 48.0])[difficulties - 1]
    
    # Adjust time based on skills, attempts, hints
    # Lower skill -> more time
    # More attempts -> more time
    # More hints -> less time (since hints give shortcut, or more time because they were stuck. Let's make hints reduce time slightly once they use them, but stuck factor dominates)
    time_taken = base_time * (1.5 - user_skills) * (1.0 + 0.15 * attempts) + np.random.normal(0, 5, size=num_samples)
    
    # If failed, time taken is usually capped at a high limit (e.g., 45-60m)
    for i in range(num_samples):
        if success[i] == 0:
            time_taken[i] = base_time[i] * 1.5 + np.random.normal(10, 5)
            
    # Clip times to realistic values
    time_taken = np.clip(time_taken, 5.0, 90.0)
    
    # Create DataFrame
    df = pd.DataFrame({
        'user_skill': user_skills,
        'topic_skill': topic_skills,
        'difficulty_numeric': difficulties,
        'acceptance_rate': acceptance_rates,
        'attempts': attempts,
        'hints_used': hints,
        'success': success,
        'time_taken': time_taken
    })
    
    # Make sure folder exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Generated {num_samples} samples at {output_path}")
    print(df.head())
    print("\nSuccess distribution:")
    print(df['success'].value_counts(normalize=True))
    print("\nMean time taken by difficulty:")
    print(df.groupby('difficulty_numeric')['time_taken'].mean())
if __name__ == "__main__":
    generate_synthetic_data("ml_service/data/submissions_dataset.csv")

