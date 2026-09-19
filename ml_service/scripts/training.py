import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, mean_absolute_error, r2_score
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from xgboost import XGBClassifier, XGBRegressor
def train_models(dataset_path, models_dir):
    os.makedirs(models_dir, exist_ok=True)
    
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}. Please run generate_data.py first.")
        
    df = pd.read_csv(dataset_path)
    
    # Define features for both models
    feature_cols = ['user_skill', 'topic_skill', 'difficulty_numeric', 'acceptance_rate', 'attempts', 'hints_used']
    
    X = df[feature_cols]
    y_class = df['success']
    y_reg = df['time_taken']
    
    print("--- TRAINING SUCCESS PREDICTION CLASSIFIER ---")
    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X, y_class, test_size=0.2, random_state=42, stratify=y_class)
    
    classifiers = {
        "LogisticRegression": LogisticRegression(max_iter=1000),
        "RandomForestClassifier": RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42),
        "XGBClassifier": XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42)
    }
    
    best_c_name = None
    best_c_score = -1
    best_c_model = None
    c_metrics = {}
    
    for name, clf in classifiers.items():
        clf.fit(X_train_c, y_train_c)
        preds = clf.predict(X_test_c)
        acc = accuracy_score(y_test_c, preds)
        f1 = f1_score(y_test_c, preds)
        print(f"{name} -> Accuracy: {acc:.4f}, F1-Score: {f1:.4f}")
        
        c_metrics[name] = {"Accuracy": acc, "F1": f1}
        
        # We optimize for F1-score as it represents balance in classifier performance
        if f1 > best_c_score:
            best_c_score = f1
            best_c_name = name
            best_c_model = clf
            
    print(f"Selected Classifier: {best_c_name} with F1-Score of {best_c_score:.4f}")
    joblib.dump(best_c_model, os.path.join(models_dir, 'success_model.joblib'))
    
    print("\n--- TRAINING SOLVE-TIME PREDICTION REGRESSOR ---")
    X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(X, y_reg, test_size=0.2, random_state=42)
    
    regressors = {
        "LinearRegression": LinearRegression(),
        "RandomForestRegressor": RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42),
        "XGBRegressor": XGBRegressor(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42)
    }
    
    best_r_name = None
    best_r_score = -9999
    best_r_model = None
    r_metrics = {}
    
    for name, reg in regressors.items():
        reg.fit(X_train_r, y_train_r)
        preds = reg.predict(X_test_r)
        mae = mean_absolute_error(y_test_r, preds)
        r2 = r2_score(y_test_r, preds)
        print(f"{name} -> MAE: {mae:.4f} mins, R² Score: {r2:.4f}")
        
        r_metrics[name] = {"MAE": mae, "R2": r2}
        
        # We optimize for higher R² score
        if r2 > best_r_score:
            best_r_score = r2
            best_r_name = name
            best_r_model = reg
            
    print(f"Selected Regressor: {best_r_name} with R² Score of {best_r_score:.4f}")
    joblib.dump(best_r_model, os.path.join(models_dir, 'time_model.joblib'))
    
    # Save training metadata / metrics summary for visualization
    metadata = {
        "classifier_metrics": c_metrics,
        "selected_classifier": best_c_name,
        "regressor_metrics": r_metrics,
        "selected_regressor": best_r_name,
        "feature_names": feature_cols
    }
    joblib.dump(metadata, os.path.join(models_dir, 'model_metadata.joblib'))
    print("Models and metadata successfully saved!")
if __name__ == "__main__":
    train_models(
        "ml_service/data/submissions_dataset.csv",
        "ml_service/app/models"
    )
