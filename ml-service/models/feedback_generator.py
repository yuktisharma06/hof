"""
NLP-Based Feedback Generator
Generates human-like post-session feedback with strengths, weaknesses, and actionable improvements.
"""
import random


class FeedbackGenerator:
    STRENGTH_TEMPLATES = {
        'high_score': [
            "Excellent problem-solving skills demonstrated throughout the session.",
            "Strong algorithmic thinking with clear solution approach.",
            "Impressive ability to break down complex problems into manageable steps."
        ],
        'fast_solve': [
            "Quick time-to-solution shows deep understanding of the concepts.",
            "Efficient problem decomposition led to a fast solution.",
        ],
        'clean_code': [
            "Code is well-structured and readable.",
            "Good use of meaningful variable names and clean formatting.",
            "Clean, modular code that follows best practices."
        ],
        'communication': [
            "Clear communication of thought process during problem-solving.",
            "Good collaboration skills — actively discussed approach with peer.",
            "Explained edge cases and trade-offs effectively."
        ]
    }

    WEAKNESS_TEMPLATES = {
        'low_score': [
            "Some difficulty with the core algorithm — review the fundamentals.",
            "The approach could be more systematic — try breaking problems into smaller pieces.",
        ],
        'slow_solve': [
            "Took longer than expected — practice timed problem-solving.",
            "Consider planning the approach before coding to save time.",
        ],
        'poor_style': [
            "Code readability could be improved — use descriptive variable names.",
            "Consider adding comments to explain non-obvious logic.",
            "Some code sections could be refactored for clarity."
        ],
        'edge_cases': [
            "Edge cases were not fully addressed — always consider empty inputs and boundaries.",
            "Test with edge cases before finalizing your solution.",
        ]
    }

    IMPROVEMENT_TEMPLATES = {
        'arrays': "Practice array manipulation patterns: two pointers, sliding window, prefix sums.",
        'strings': "Work on string algorithms: KMP, Rabin-Karp, and common patterns.",
        'dynamic-programming': "Focus on identifying subproblems and building DP tables. Start with 1D DP.",
        'graphs': "Strengthen BFS/DFS foundations. Practice on grid and adjacency list problems.",
        'trees': "Review tree traversals (inorder, preorder, postorder) and recursive approaches.",
        'sorting': "Understand comparison-based sorting limits and when to use counting/radix sort.",
        'recursion': "Practice converting iterative solutions to recursive and vice versa.",
        'system-design': "Study common system design patterns: load balancing, caching, database sharding.",
    }

    def generate(self, session_data: dict, user_performance: dict, code_quality: dict = None):
        """Generate comprehensive session feedback."""
        score = user_performance.get('score', 50)
        solve_time = user_performance.get('solveTime', 30)
        avg_time = user_performance.get('avgTime', 30)
        topics = session_data.get('topicsCovered', ['arrays'])
        style_score = code_quality.get('styleScore', 70) if code_quality else 70

        # Determine strengths
        strengths = []
        if score > 75:
            strengths.extend(random.sample(self.STRENGTH_TEMPLATES['high_score'], min(1, len(self.STRENGTH_TEMPLATES['high_score']))))
        if solve_time < avg_time * 0.8:
            strengths.extend(random.sample(self.STRENGTH_TEMPLATES['fast_solve'], 1))
        if style_score > 80:
            strengths.extend(random.sample(self.STRENGTH_TEMPLATES['clean_code'], 1))
        strengths.extend(random.sample(self.STRENGTH_TEMPLATES['communication'], 1))
        if not strengths:
            strengths = ["Showed persistence in tackling a challenging problem."]

        # Determine weaknesses
        weaknesses = []
        if score < 60:
            weaknesses.extend(random.sample(self.WEAKNESS_TEMPLATES['low_score'], 1))
        if solve_time > avg_time * 1.5:
            weaknesses.extend(random.sample(self.WEAKNESS_TEMPLATES['slow_solve'], 1))
        if style_score < 60:
            weaknesses.extend(random.sample(self.WEAKNESS_TEMPLATES['poor_style'], 1))
        weaknesses.extend(random.sample(self.WEAKNESS_TEMPLATES['edge_cases'], 1))

        # Actionable improvements
        improvements = []
        for topic in topics:
            if topic in self.IMPROVEMENT_TEMPLATES:
                improvements.append(self.IMPROVEMENT_TEMPLATES[topic])
        if not improvements:
            improvements = ["Continue practicing diverse problem types to build versatility."]

        # Summary
        if score >= 85:
            summary = f"Outstanding session! You demonstrated mastery-level understanding of {', '.join(topics[:2])}."
        elif score >= 70:
            summary = f"Great session! Solid performance on {', '.join(topics[:2])} with room for optimization."
        elif score >= 50:
            summary = f"Good effort! You're making progress on {', '.join(topics[:2])}. Focus on the areas below to improve."
        else:
            summary = f"This was a challenging session on {', '.join(topics[:2])}. Review the feedback below and practice these topics."

        return {
            'summary': summary,
            'strengths': strengths[:3],
            'weaknesses': weaknesses[:3],
            'improvements': improvements[:3],
            'overallScore': score,
            'metrics': {
                'problemSolving': min(100, score + random.randint(-5, 10)),
                'codeQuality': style_score,
                'communication': random.randint(65, 95),
                'timeManagement': max(0, min(100, int(100 * (1 - (solve_time - avg_time) / max(avg_time, 1))))),
            }
        }
