"""
Bayesian Knowledge Tracing (BKT) for Adaptive Learning Roadmap
Tracks mastery probability per topic and recommends next learning steps.
"""
import numpy as np
from typing import Dict, List


class KnowledgeTracer:
    # BKT parameters per topic (can be learned from data)
    DEFAULT_PARAMS = {
        'p_init': 0.3,     # Initial probability of mastery
        'p_learn': 0.15,   # Probability of transitioning from unlearned to learned
        'p_guess': 0.25,   # Probability of correct answer when not mastered
        'p_slip': 0.1,     # Probability of incorrect answer when mastered
    }

    TOPIC_PREREQUISITES = {
        'arrays': [],
        'strings': ['arrays'],
        'hash-maps': ['arrays'],
        'two-pointers': ['arrays'],
        'sliding-window': ['arrays', 'two-pointers'],
        'linked-lists': ['arrays'],
        'sorting': ['arrays'],
        'stacks': ['arrays'],
        'queues': ['arrays'],
        'recursion': ['arrays'],
        'trees': ['recursion'],
        'graphs': ['arrays', 'recursion'],
        'bfs': ['graphs', 'queues'],
        'dfs': ['graphs', 'stacks', 'recursion'],
        'dynamic-programming': ['arrays', 'recursion'],
        'backtracking': ['recursion'],
        'greedy': ['arrays', 'sorting'],
        'bit-manipulation': ['arrays'],
        'math': [],
        'heap': ['arrays', 'trees'],
        'system-design': ['arrays', 'hash-maps', 'trees', 'graphs'],
    }

    def __init__(self):
        self.params = self.DEFAULT_PARAMS

    def _update_mastery(self, prior: float, correct: bool) -> float:
        """Bayesian update of mastery probability given observation."""
        p_learn = self.params['p_learn']
        p_guess = self.params['p_guess']
        p_slip = self.params['p_slip']

        if correct:
            # P(mastered | correct) using Bayes theorem
            p_correct_given_mastered = 1 - p_slip
            p_correct_given_not = p_guess
            p_correct = prior * p_correct_given_mastered + (1 - prior) * p_correct_given_not
            posterior = (prior * p_correct_given_mastered) / max(p_correct, 1e-8)
        else:
            # P(mastered | incorrect)
            p_incorrect_given_mastered = p_slip
            p_incorrect_given_not = 1 - p_guess
            p_incorrect = prior * p_incorrect_given_mastered + (1 - prior) * p_incorrect_given_not
            posterior = (prior * p_incorrect_given_mastered) / max(p_incorrect, 1e-8)

        # Learning transition
        updated = posterior + (1 - posterior) * p_learn
        return min(max(updated, 0.01), 0.99)

    def get_roadmap(self, skill_levels: Dict[str, float], session_history: List[Dict] = None):
        """Generate adaptive learning roadmap based on current mastery levels."""
        # Process session history to update mastery via BKT
        mastery = {}
        for topic, level in skill_levels.items():
            mastery[topic] = level

        # Apply BKT updates from session history
        if session_history:
            for session in session_history:
                topics = session.get('topicsCovered', [])
                score = session.get('score', 0.5)
                correct = score > 0.6
                for topic in topics:
                    prior = mastery.get(topic, self.params['p_init'])
                    mastery[topic] = self._update_mastery(prior, correct)

        # Build roadmap
        topics = []
        for topic in self.TOPIC_PREREQUISITES:
            level = mastery.get(topic, self.params['p_init'])
            prereqs = self.TOPIC_PREREQUISITES[topic]
            prereqs_met = all(mastery.get(p, 0) > 0.4 for p in prereqs)

            status = 'mastered' if level > 0.8 else 'strong' if level > 0.6 else 'developing' if level > 0.35 else 'weak'

            topics.append({
                'topic': topic,
                'mastery': round(level, 3),
                'status': status,
                'prerequisites': prereqs,
                'prerequisitesMet': prereqs_met,
                'recommended': level < 0.6 and prereqs_met,
                'priority': round((1 - level) * (1.5 if prereqs_met else 0.5), 3)
            })

        topics.sort(key=lambda x: x['priority'], reverse=True)

        weak_areas = [t['topic'] for t in topics if t['mastery'] < 0.4]
        strong_areas = [t['topic'] for t in topics if t['mastery'] > 0.7]
        recommended = [t for t in topics if t['recommended']]

        # Build next topic suggestion
        next_topic = recommended[0]['topic'] if recommended else (weak_areas[0] if weak_areas else 'arrays')

        # Revision suggestions: strong topics that haven't been practiced recently
        revision = [t['topic'] for t in topics if 0.5 < t['mastery'] < 0.75][:3]

        return {
            'roadmap': topics,
            'nextTopic': next_topic,
            'weakAreas': weak_areas,
            'strongAreas': strong_areas,
            'revisionSuggestions': revision,
            'overallMastery': round(np.mean([t['mastery'] for t in topics if t['topic'] in mastery]), 3) if mastery else 0.3
        }
