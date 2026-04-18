"""
AI-Powered Peer Matching using XGBoost Ranking
Uses learning-to-rank to find ideal practice partners based on
skill complementarity, Elo proximity, and improvement trends.
"""
import numpy as np
from xgboost import XGBClassifier


class PeerMatcher:
    def __init__(self):
        # Pre-train a simple model on synthetic data
        self.model = XGBClassifier(
            n_estimators=50,
            max_depth=4,
            learning_rate=0.1,
            use_label_encoder=False,
            eval_metric='logloss'
        )
        self._train_on_synthetic()

    def _train_on_synthetic(self):
        """Train on synthetic match data to bootstrap the model."""
        np.random.seed(42)
        n_samples = 500

        # Features: skill_overlap, elo_diff, rating_diff, improvement_diff, sessions_diff
        X = np.column_stack([
            np.random.uniform(0, 1, n_samples),      # skill_overlap
            np.random.uniform(0, 500, n_samples),     # elo_diff
            np.random.uniform(0, 2, n_samples),       # rating_diff
            np.random.uniform(-0.3, 0.3, n_samples),  # improvement_diff
            np.random.uniform(0, 50, n_samples),      # sessions_diff
        ])

        # Good matches: high overlap, low elo diff, low rating diff
        y = (
            (X[:, 0] > 0.3) &
            (X[:, 1] < 300) &
            (X[:, 2] < 1.5) &
            (np.abs(X[:, 3]) < 0.2)
        ).astype(int)

        self.model.fit(X, y)

    def _compute_features(self, user_skills, user_elo, user_rating, improvement_trend, candidate):
        """Extract pairwise features between user and candidate."""
        cand_skills = candidate.get('skills', [])
        overlap = len(set(user_skills) & set(cand_skills)) / max(len(set(user_skills) | set(cand_skills)), 1)
        elo_diff = abs(user_elo - candidate.get('elo', 1400))
        rating_diff = abs(user_rating - candidate.get('avgRating', 4.0))
        improvement_diff = improvement_trend - candidate.get('improvementTrend', 0.1)
        sessions_diff = abs(candidate.get('sessionsCompleted', 0) - 20)

        return [overlap, elo_diff, rating_diff, improvement_diff, sessions_diff]

    def rank_peers(self, user_skills, user_elo, user_rating, improvement_trend, candidates):
        """Rank candidates by predicted match quality."""
        if not candidates:
            return []

        features = []
        for c in candidates:
            feat = self._compute_features(user_skills, user_elo, user_rating, improvement_trend, c)
            features.append(feat)

        X = np.array(features)
        probabilities = self.model.predict_proba(X)[:, 1]

        results = []
        for i, c in enumerate(candidates):
            cand_skills = c.get('skills', [])
            complementary = [s for s in cand_skills if s not in user_skills][:3]
            shared = [s for s in cand_skills if s in user_skills][:3]

            results.append({
                **c,
                'matchScore': round(float(probabilities[i]), 3),
                'compatibility': {
                    'skillOverlap': round(len(set(user_skills) & set(cand_skills)) / max(len(set(user_skills) | set(cand_skills)), 1), 2),
                    'eloDiff': abs(user_elo - c.get('elo', 1400)),
                    'complementary': complementary,
                    'shared': shared
                }
            })

        results.sort(key=lambda x: x['matchScore'], reverse=True)
        return results
