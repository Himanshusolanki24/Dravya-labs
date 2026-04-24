from pydantic import BaseModel, Field
from typing import List

class DoshaMatch(BaseModel):
    rank: int
    dosha: str
    confidence: float

class BrahmaRequest(BaseModel):
    body_size: str = Field(..., alias="Body Size")
    body_weight: str = Field(..., alias="Body Weight")
    height: str = Field(..., alias="Height")
    bone_structure: str = Field(..., alias="Bone Structure")
    complexion: str = Field(..., alias="Complexion")
    general_feel_of_skin: str = Field(..., alias="General feel of skin")
    texture_of_skin: str = Field(..., alias="Texture of Skin")
    hair_color: str = Field(..., alias="Hair Color")
    appearance_of_hair: str = Field(..., alias="Appearance of Hair")
    shape_of_face: str = Field(..., alias="Shape of face")
    eyes: str = Field(..., alias="Eyes")
    eyelashes: str = Field(..., alias="Eyelashes")
    blinking_of_eyes: str = Field(..., alias="Blinking of Eyes")
    cheeks: str = Field(..., alias="Cheeks")
    nose: str = Field(..., alias="Nose")
    teeth_and_gums: str = Field(..., alias="Teeth and gums")
    lips: str = Field(..., alias="Lips")
    nails: str = Field(..., alias="Nails")
    appetite: str = Field(..., alias="Appetite")
    liking_tastes: str = Field(..., alias="Liking tastes")
    metabolism_type: str = Field(..., alias="Metabolism Type")
    climate_preference: str = Field(..., alias="Climate Preference")
    stress_levels: str = Field(..., alias="Stress Levels")
    sleep_patterns: str = Field(..., alias="Sleep Patterns")
    dietary_habits: str = Field(..., alias="Dietary Habits")
    physical_activity_level: str = Field(..., alias="Physical Activity Level")
    water_intake: str = Field(..., alias="Water Intake")
    digestion_quality: str = Field(..., alias="Digestion Quality")
    skin_sensitivity: str = Field(..., alias="Skin Sensitivity")

    class Config:
        populate_by_name = True

class BrahmaResponse(BaseModel):
    matches: List[DoshaMatch]
    primary_dosha: str

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str
