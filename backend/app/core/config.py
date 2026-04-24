# app/core/config.py

import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # =========================
    # 🔐 Security
    # =========================
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET")

    # =========================
    # 🗄 Supabase (PostgREST)
    # =========================
    SUPABASE_URL: str = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    # =========================
    # 📚 Pinecone
    # =========================
    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY")
    PINECONE_INDEX: str = os.getenv("PINECONE_INDEX", "dravya-health-profiles")
    PINECONE_MEMORY_INDEX: str = os.getenv("PINECONE_MEMORY_INDEX", "dravya-health-profiles")

    # =========================
    # 🤖 Mistral LLM (Direct API)
    # =========================
    MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY")
    MODEL_NAME: str = os.getenv("MODEL_NAME", "mistral-large-latest")



    # =========================
    # 🧠 Sentence Transformers
    # =========================
    SENTENCE_TRANSFORMER_MODEL: str = os.getenv("SENTENCE_TRANSFORMER_MODEL", "all-MiniLM-L6-v2")

    # =========================
    # 🧬 External ML Model APIs
    # =========================
    SKIN_MODEL_API_URL: str = os.getenv("SKIN_MODEL_API_URL", "")
    SKIN_MODEL_API_KEY: str = os.getenv("SKIN_MODEL_API_KEY", "")
    HAIR_MODEL_API_URL: str = os.getenv("HAIR_MODEL_API_URL", "")
    HAIR_MODEL_API_KEY: str = os.getenv("HAIR_MODEL_API_KEY", "")
    PCOS_MODEL_API_URL: str = os.getenv("PCOS_MODEL_API_URL", "")
    PCOS_MODEL_API_KEY: str = os.getenv("PCOS_MODEL_API_KEY", "")
    DIABETES_MODEL_API_URL: str = os.getenv("DIABETES_MODEL_API_URL", "")
    DIABETES_MODEL_API_KEY: str = os.getenv("DIABETES_MODEL_API_KEY", "")
    AUTOIMMUNE_MODEL_API_URL: str = os.getenv("AUTOIMMUNE_MODEL_API_URL", "http://localhost:8003/predict")
    AUTOIMMUNE_MODEL_API_KEY: str = os.getenv("AUTOIMMUNE_MODEL_API_KEY", "")
    OBESITY_MODEL_API_URL: str = os.getenv("OBESITY_MODEL_API_URL", "")
    OBESITY_MODEL_API_KEY: str = os.getenv("OBESITY_MODEL_API_KEY", "")

    # DRAVYA LABS MICROSERVICES
    BRAHMA_MODEL_API_URL: str = os.getenv("BRAHMA_MODEL_API_URL", "http://localhost:8005/predict")
    BRAHMA_MODEL_API_KEY: str = os.getenv("BRAHMA_MODEL_API_KEY", "")
    DIETPLAIN_MODEL_API_URL: str = os.getenv("DIETPLAIN_MODEL_API_URL", "http://localhost:8004/predict")
    DIETPLAIN_MODEL_API_KEY: str = os.getenv("DIETPLAIN_MODEL_API_KEY", "")
    HERBS_MODEL_API_URL: str = os.getenv("HERBS_MODEL_API_URL", "http://localhost:8002/predict")
    HERBS_MODEL_API_KEY: str = os.getenv("HERBS_MODEL_API_KEY", "")
    
    # NEW: Symptom -> Treatment Microservice
    SYMPTOM_TREATMENT_MODEL_API_URL: str = os.getenv("SYMPTOM_TREATMENT_MODEL_API_URL", "http://localhost:8006/predict")
    SYMPTOM_TREATMENT_MODEL_API_KEY: str = os.getenv("SYMPTOM_TREATMENT_MODEL_API_KEY", "")

    MODEL_CLIENTS_TIMEOUT: int = int(os.getenv("MODEL_CLIENTS_TIMEOUT", "30"))

settings = Settings()
