from pydantic import BaseModel, Field
from typing import List, Optional

class NutritionalProfile(BaseModel):
    calories_kcal: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float

class DietMatch(BaseModel):
    rank: int
    food_name: str
    confidence: float
    nutritional_profile: NutritionalProfile

class DietRequest(BaseModel):
    meal_type: str = Field(..., description="E.g. Breakfast, Lunch, Dinner, Snack")
    
    # Nutritional Goals
    calories: float = Field(0, description="Target Calories in kcal")
    protein: float = Field(0, description="Target Protein in g")
    carbs: float = Field(0, description="Target Carbohydrates in g")
    fat: float = Field(0, description="Target Fat in g")
    fiber: float = Field(0, description="Target Fiber in g")
    sugars: float = Field(0, description="Target Sugars in g")
    sodium: float = Field(0, description="Target Sodium in mg")
    cholesterol: float = Field(0, description="Target Cholesterol in mg")
    water_intake: float = Field(0, description="Expected Water Intake volume in ml")

    top_k: int = Field(5, ge=1, le=20, description="Number of recommendations")

class DietResponse(BaseModel):
    meal_context: str
    matches: List[DietMatch]

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str
