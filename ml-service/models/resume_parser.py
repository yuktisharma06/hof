"""
Resume-Based Skill Extraction using NLP
Extracts technical skills, experience level, and suggests interview topics from resume text.
"""
import re
from typing import List, Dict


class ResumeParser:
    SKILL_PATTERNS = {
        # Programming Languages
        'Python': r'\bpython\b',
        'JavaScript': r'\bjavascript\b|\bjs\b',
        'TypeScript': r'\btypescript\b|\bts\b',
        'Java': r'\bjava\b(?!script)',
        'C++': r'\bc\+\+\b|\bcpp\b',
        'C': r'\bc\b(?!\+|\#|s)',
        'C#': r'\bc\#\b|c\s*sharp',
        'Go': r'\bgolang\b|\bgo\b(?:lang)?',
        'Rust': r'\brust\b',
        'Ruby': r'\bruby\b',
        'PHP': r'\bphp\b',
        'Swift': r'\bswift\b',
        'Kotlin': r'\bkotlin\b',
        'Scala': r'\bscala\b',
        'R': r'\br\b(?:\s+programming)?',

        # Web Frameworks
        'React': r'\breact(?:\.?js)?\b',
        'Angular': r'\bangular\b',
        'Vue.js': r'\bvue(?:\.?js)?\b',
        'Next.js': r'\bnext(?:\.?js)?\b',
        'Node.js': r'\bnode(?:\.?js)?\b',
        'Express': r'\bexpress(?:\.?js)?\b',
        'Django': r'\bdjango\b',
        'Flask': r'\bflask\b',
        'Spring Boot': r'\bspring\s*boot\b',
        'FastAPI': r'\bfastapi\b',

        # Databases
        'PostgreSQL': r'\bpostgres(?:ql)?\b',
        'MySQL': r'\bmysql\b',
        'MongoDB': r'\bmongodb?\b',
        'Redis': r'\bredis\b',
        'SQLite': r'\bsqlite\b',
        'DynamoDB': r'\bdynamodb\b',

        # Cloud & DevOps
        'AWS': r'\baws\b|\bamazon\s*web\s*services\b',
        'GCP': r'\bgcp\b|\bgoogle\s*cloud\b',
        'Azure': r'\bazure\b',
        'Docker': r'\bdocker\b',
        'Kubernetes': r'\bkubernetes\b|\bk8s\b',
        'CI/CD': r'\bci\s*/?\s*cd\b',
        'Terraform': r'\bterraform\b',

        # ML/AI
        'Machine Learning': r'\bmachine\s*learning\b|\bml\b',
        'Deep Learning': r'\bdeep\s*learning\b|\bdl\b',
        'TensorFlow': r'\btensorflow\b|\btf\b',
        'PyTorch': r'\bpytorch\b',
        'NLP': r'\bnlp\b|\bnatural\s*language\s*processing\b',
        'Computer Vision': r'\bcomputer\s*vision\b|\bcv\b',

        # Data
        'SQL': r'\bsql\b',
        'Data Structures': r'\bdata\s*structures?\b',
        'Algorithms': r'\balgorithms?\b',
        'System Design': r'\bsystem\s*design\b',
        'Distributed Systems': r'\bdistributed\s*systems?\b',
    }

    EXPERIENCE_PATTERNS = {
        'senior': r'\b(?:senior|lead|principal|staff|architect)\b|\b(?:\d+\+?\s*(?:years?|yrs?))\b.*(?:experience|exp)',
        'mid': r'\b(?:mid|intermediate)\b|\b(?:[2-5]\s*(?:years?|yrs?))\s*(?:of\s*)?(?:experience|exp)',
        'junior': r'\b(?:junior|entry|fresh|graduate|intern|new\s*grad)\b|\b(?:[0-1]\s*(?:years?|yrs?))\s*(?:of\s*)?(?:experience|exp)',
    }

    SKILL_TO_TOPIC = {
        'Data Structures': ['arrays', 'linked-lists', 'trees', 'graphs', 'hash-maps', 'stacks', 'queues'],
        'Algorithms': ['sorting', 'dynamic-programming', 'greedy', 'backtracking', 'recursion'],
        'Machine Learning': ['system-design'],
        'System Design': ['system-design'],
        'Distributed Systems': ['system-design', 'graphs'],
        'Python': ['dynamic-programming', 'arrays', 'strings'],
        'JavaScript': ['arrays', 'strings', 'hash-maps'],
        'Java': ['arrays', 'trees', 'sorting'],
        'C++': ['arrays', 'dynamic-programming', 'bit-manipulation'],
    }

    def parse(self, resume_text: str) -> Dict:
        """Extract skills, experience level, and suggest topics from resume text."""
        text_lower = resume_text.lower()

        # Extract skills
        found_skills = []
        for skill, pattern in self.SKILL_PATTERNS.items():
            if re.search(pattern, text_lower, re.IGNORECASE):
                found_skills.append(skill)

        # Determine experience level
        experience_level = 'intermediate'
        for level, pattern in self.EXPERIENCE_PATTERNS.items():
            if re.search(pattern, text_lower, re.IGNORECASE):
                experience_level = level
                break

        # Years of experience extraction
        years_match = re.search(r'(\d+)\+?\s*(?:years?|yrs?)', text_lower)
        years = int(years_match.group(1)) if years_match else None

        # Map skills to interview topics
        suggested_topics = set()
        for skill in found_skills:
            if skill in self.SKILL_TO_TOPIC:
                suggested_topics.update(self.SKILL_TO_TOPIC[skill])

        # Default topics based on experience
        if not suggested_topics:
            if experience_level == 'senior':
                suggested_topics = {'system-design', 'dynamic-programming', 'graphs', 'trees'}
            elif experience_level == 'mid':
                suggested_topics = {'dynamic-programming', 'trees', 'graphs', 'sorting'}
            else:
                suggested_topics = {'arrays', 'strings', 'sorting', 'hash-maps'}

        # Extract education
        education = []
        edu_patterns = [
            r'\b(?:B\.?S\.?|B\.?Tech|Bachelor|Master|M\.?S\.?|M\.?Tech|Ph\.?D|MBA)\b[^.\n]*',
        ]
        for pattern in edu_patterns:
            matches = re.findall(pattern, resume_text, re.IGNORECASE)
            education.extend(matches[:2])

        return {
            'skills': found_skills,
            'experience_level': experience_level,
            'years_of_experience': years,
            'suggested_topics': sorted(list(suggested_topics)),
            'education': education,
            'skill_count': len(found_skills),
            'recommended_difficulty': 'hard' if experience_level == 'senior' else 'medium' if experience_level == 'mid' else 'easy'
        }
