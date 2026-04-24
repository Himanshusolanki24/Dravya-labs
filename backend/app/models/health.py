# models/health.py
from pydantic import BaseModel
from typing import Optional

class HealthProfileInput(BaseModel):
    body_frame: str
    skin_type: str
    hair_type: str
    eyes: str
    energy_pattern: str

    appetite: str
    elimination: str
    thirst: str
    tongue_coating: Optional[str]

    sleep_pattern: str
    diet_habits: str
    exercise: str
    weather_sensitivity: str

    stress_response: str
    memory_focus: str
    temperament: str

    chief_complaint: str
    menstrual_cycle: Optional[str]
    past_history: Optional[str]

    height: float
    weight: float
    body_fat: Optional[float]
    bmi: Optional[float]
