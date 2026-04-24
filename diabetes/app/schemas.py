from pydantic import BaseModel

class DiabetesInput(BaseModel):
    Pregnancies: int
    Glucose: float
    BloodPressure: float
    SkinThickness: float
    Insulin: float
    BMI: float
    DiabetesPedigreeFunction: float
    Age: int

class DiabetesOutput(BaseModel):
    prediction: str
    probability: float
    is_diabetic: bool
