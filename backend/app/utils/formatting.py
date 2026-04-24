import re
import json
from typing import Any, Dict


# ===============================
# 🧹 Clean Excess Whitespace
# ===============================
def clean_text(text: str) -> str:
    """
    Removes extra spaces, line breaks, and trailing whitespace.
    """
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


# ===============================
# 🧾 Convert Dict to Pretty JSON
# ===============================
def pretty_json(data: Dict[str, Any]) -> str:
    """
    Converts a dictionary into formatted JSON string.
    """
    return json.dumps(data, indent=2, ensure_ascii=False)


# ===============================
# 🧠 Extract Bullet Points
# ===============================
def extract_bullet_points(text: str) -> list[str]:
    """
    Extracts bullet points from AI output and returns them as a list.
    """
    lines = text.split("\n")
    bullets = []

    for line in lines:
        line = line.strip()
        if line.startswith(("-", "*", "•")):
            bullets.append(line.lstrip("-*• ").strip())

    return bullets


# ===============================
# 📑 Ensure Section Headers
# ===============================
def ensure_sections(text: str, required_sections: list[str]) -> str:
    """
    Ensures AI output contains required headers. If missing, adds placeholders.
    """
    output = text

    for section in required_sections:
        if section.lower() not in text.lower():
            output += f"\n\n{section}:\nInformation not available."

    return output.strip()


# ===============================
# 🔒 Remove Sensitive Words (Safety Filter)
# ===============================
def remove_sensitive_terms(text: str) -> str:
    """
    Removes direct diagnostic or medical claim terms.
    """
    forbidden_terms = [
        "diagnosis",
        "disease",
        "prescription",
        "treatment plan",
        "medical condition"
    ]

    for term in forbidden_terms:
        text = re.sub(term, "[redacted]", text, flags=re.IGNORECASE)

    return text


# ===============================
# ✨ Format AI Wellness Response
# ===============================
def format_wellness_response(text: str) -> str:
    """
    Cleans and formats AI-generated wellness advice.
    """
    text = clean_text(text)
    text = remove_sensitive_terms(text)

    return text
