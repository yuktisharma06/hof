"""
ML-Based Anomaly Detection using Isolation Forest
Detects cheating patterns: unusual typing speeds, excessive pasting,
tab switching, and solve time anomalies.
"""
import numpy as np
from sklearn.ensemble import IsolationForest


class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.1,
            random_state=42
        )
        self._train_on_synthetic()
        self.feature_names = [
            'typing_speed_avg', 'typing_speed_std', 'paste_count',
            'tab_switches', 'solve_time_ratio', 'code_similarity'
        ]

    def _train_on_synthetic(self):
        """Train on synthetic normal behavior data."""
        np.random.seed(42)
        n_normal = 400

        # Normal behavior patterns
        normal_data = np.column_stack([
            np.random.normal(60, 15, n_normal),      # typing_speed_avg (WPM)
            np.random.normal(10, 5, n_normal),        # typing_speed_std
            np.random.poisson(2, n_normal),           # paste_count
            np.random.poisson(3, n_normal),           # tab_switches
            np.random.normal(1.0, 0.3, n_normal),    # solve_time_ratio (actual/avg)
            np.random.uniform(0, 0.3, n_normal),     # code_similarity to known solutions
        ])

        self.model.fit(normal_data)

    def detect(self, typing_speed_avg, typing_speed_std, paste_count,
               tab_switches, solve_time, avg_solve_time, code_similarity=0.0):
        """Detect anomalous behavior and return score with explanation."""
        solve_time_ratio = solve_time / max(avg_solve_time, 1)

        features = np.array([[
            typing_speed_avg, typing_speed_std, paste_count,
            tab_switches, solve_time_ratio, code_similarity
        ]])

        # Isolation Forest: -1 = anomaly, 1 = normal
        prediction = self.model.predict(features)[0]
        raw_score = self.model.score_samples(features)[0]

        # Convert to 0-1 anomaly score (higher = more anomalous)
        anomaly_score = max(0, min(1, 0.5 - raw_score))

        # Generate human-readable explanation
        explanations = []
        if typing_speed_avg > 120:
            explanations.append(f"Unusually high typing speed ({typing_speed_avg:.0f} WPM)")
        if typing_speed_avg < 15:
            explanations.append(f"Very low typing speed ({typing_speed_avg:.0f} WPM) — possible copy-paste")
        if paste_count > 8:
            explanations.append(f"Excessive paste events ({paste_count})")
        if tab_switches > 15:
            explanations.append(f"High tab switching ({tab_switches} times)")
        if solve_time_ratio < 0.3:
            explanations.append(f"Solved {solve_time_ratio:.1f}x faster than average")
        if code_similarity > 0.8:
            explanations.append(f"Code similarity to known solution: {code_similarity:.0%}")

        if not explanations:
            explanations.append("No concerning patterns detected")

        return {
            "anomaly_score": round(float(anomaly_score), 3),
            "is_anomaly": prediction == -1,
            "explanation": "; ".join(explanations),
            "details": {
                "typing_speed": {"value": typing_speed_avg, "status": "normal" if 20 < typing_speed_avg < 120 else "flagged"},
                "paste_behavior": {"value": paste_count, "status": "normal" if paste_count < 8 else "flagged"},
                "tab_switches": {"value": tab_switches, "status": "normal" if tab_switches < 15 else "flagged"},
                "solve_time": {"value": round(solve_time_ratio, 2), "status": "normal" if 0.3 < solve_time_ratio < 3 else "flagged"},
                "code_similarity": {"value": round(code_similarity, 2), "status": "normal" if code_similarity < 0.8 else "flagged"}
            }
        }
