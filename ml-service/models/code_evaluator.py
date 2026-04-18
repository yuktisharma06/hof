"""
Code Quality Evaluation Engine
Uses AST parsing for structural analysis and heuristics for quality assessment.
"""
import ast
import re
import math


class CodeEvaluator:
    def __init__(self):
        self.complexity_keywords = {
            'for': 1, 'while': 1, 'if': 0.5,
            'recursion': 2, 'nested_loop': 2
        }

    def _analyze_python_ast(self, code: str):
        """Parse Python code AST for structural analysis."""
        try:
            tree = ast.parse(code)
        except SyntaxError:
            return {
                'valid': False,
                'error': 'Syntax error in code',
                'functions': 0,
                'loops': 0,
                'conditions': 0,
                'max_depth': 0,
                'lines': len(code.strip().split('\n'))
            }

        functions = 0
        loops = 0
        conditions = 0
        max_depth = 0

        class Visitor(ast.NodeVisitor):
            def __init__(self):
                self.depth = 0

            def generic_visit(self, node):
                nonlocal functions, loops, conditions, max_depth
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    functions += 1
                elif isinstance(node, (ast.For, ast.While)):
                    loops += 1
                elif isinstance(node, ast.If):
                    conditions += 1

                self.depth += 1
                max_depth = max(max_depth, self.depth)
                super().generic_visit(node)
                self.depth -= 1

        Visitor().visit(tree)

        return {
            'valid': True,
            'functions': functions,
            'loops': loops,
            'conditions': conditions,
            'max_depth': max_depth,
            'lines': len(code.strip().split('\n'))
        }

    def _analyze_javascript(self, code: str):
        """Heuristic analysis for JavaScript code."""
        lines = code.strip().split('\n')
        loops = len(re.findall(r'\b(for|while)\b', code))
        conditions = len(re.findall(r'\b(if|else if|switch)\b', code))
        functions = len(re.findall(r'\b(function|=>)\b', code))

        # Estimate nesting depth
        max_indent = 0
        for line in lines:
            stripped = line.lstrip()
            if stripped:
                indent = len(line) - len(stripped)
                max_indent = max(max_indent, indent // 2)

        return {
            'valid': True,
            'functions': functions,
            'loops': loops,
            'conditions': conditions,
            'max_depth': max_indent,
            'lines': len(lines)
        }

    def _estimate_complexity(self, analysis):
        """Estimate time complexity from structural analysis."""
        loops = analysis.get('loops', 0)
        depth = analysis.get('max_depth', 0)

        if loops == 0:
            return 'O(1) or O(n)'
        elif loops == 1 and depth <= 3:
            return 'O(n)'
        elif loops == 2 and depth <= 4:
            return 'O(n log n) or O(n²)'
        elif loops >= 2 and depth > 4:
            return 'O(n²) or worse'
        else:
            return 'O(n)'

    def _assess_style(self, code: str):
        """Assess coding style quality."""
        lines = code.strip().split('\n')
        issues = []
        score = 100

        # Check line length
        long_lines = [i for i, l in enumerate(lines) if len(l) > 100]
        if long_lines:
            issues.append(f"{len(long_lines)} lines exceed 100 characters")
            score -= len(long_lines) * 3

        # Check for comments
        comments = [l for l in lines if l.strip().startswith(('#', '//'))]
        if len(lines) > 10 and len(comments) == 0:
            issues.append("No comments found in code")
            score -= 10

        # Check variable naming (single char vars)
        single_char = re.findall(r'\b([a-z])\s*=', code)
        if len(single_char) > 3:
            issues.append(f"Many single-character variable names ({len(single_char)})")
            score -= 8

        # Check for magic numbers
        magic_numbers = re.findall(r'(?<!["\'])\b(\d{2,})\b(?!["\'])', code)
        if len(magic_numbers) > 2:
            issues.append(f"Magic numbers detected: {magic_numbers[:3]}")
            score -= 5

        return {
            'score': max(0, min(100, score)),
            'issues': issues,
            'quality': 'excellent' if score >= 85 else 'good' if score >= 70 else 'needs improvement'
        }

    def evaluate(self, code: str, language: str = "python", optimal_complexity: str = ""):
        """Full code evaluation: correctness, efficiency, and style."""
        if not code.strip():
            return {
                'correctness': 0,
                'efficiency': 'no code',
                'style': 'no code',
                'feedback': 'No code submitted.',
                'rating': 'inefficient approach',
                'details': {}
            }

        # Structural analysis
        if language.lower() in ('python', 'py'):
            analysis = self._analyze_python_ast(code)
        else:
            analysis = self._analyze_javascript(code)

        # Estimate complexity
        estimated_complexity = self._estimate_complexity(analysis)

        # Style assessment
        style = self._assess_style(code)

        # Correctness heuristic (based on structure)
        correctness = 0.5
        if analysis['valid']:
            correctness = 0.7
            if analysis['functions'] > 0:
                correctness += 0.1
            if analysis['loops'] > 0 or analysis['conditions'] > 0:
                correctness += 0.1
            if analysis['lines'] > 3:
                correctness += 0.1

        # Efficiency rating
        efficiency = 'optimal'
        if optimal_complexity:
            if 'n²' in estimated_complexity and 'n²' not in optimal_complexity:
                efficiency = 'can be improved'
            elif 'worse' in estimated_complexity:
                efficiency = 'inefficient approach'
        else:
            if analysis.get('max_depth', 0) > 6:
                efficiency = 'can be improved'
            if analysis.get('loops', 0) > 3:
                efficiency = 'inefficient approach'

        # Overall rating
        overall_score = (correctness * 40) + (style['score'] / 100 * 30) + (30 if efficiency == 'optimal' else 15 if efficiency == 'can be improved' else 5)
        rating = 'optimal' if overall_score > 80 else 'can be improved' if overall_score > 50 else 'inefficient approach'

        # Generate feedback
        feedback_parts = []
        if efficiency == 'optimal':
            feedback_parts.append("Your solution appears efficient.")
        elif efficiency == 'can be improved':
            feedback_parts.append(f"Consider optimizing — estimated complexity: {estimated_complexity}.")
        else:
            feedback_parts.append(f"Solution may be inefficient ({estimated_complexity}). Consider a different approach.")

        if style['issues']:
            feedback_parts.append("Style suggestions: " + "; ".join(style['issues'][:2]))

        return {
            'correctness': round(correctness, 2),
            'efficiency': efficiency,
            'estimatedComplexity': estimated_complexity,
            'style': style['quality'],
            'styleScore': style['score'],
            'feedback': " ".join(feedback_parts),
            'rating': rating,
            'overallScore': round(overall_score, 1),
            'details': {
                'analysis': analysis,
                'styleIssues': style['issues']
            }
        }
