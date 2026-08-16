# app/core/config.py

import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # =========================
    # 🔐 Security
    # =========================
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET")
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "b40c741639d6e7f1fbc7c3e38716b9b39d1b64a33118cf23b49c4033b0f5b9d3")

    # =========================
    # 🗄 Supabase (PostgREST)
    # =========================
    SUPABASE_URL: str = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    # =========================
    # 📚 Helix DB & Redis
    # =========================
    HELIX_DB_API_KEY: str = os.getenv("HELIX_DB_API_KEY", "")
    HELIX_DB_API_URL: str = os.getenv("HELIX_DB_API_URL", "http://localhost:8080")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    HELIX_DB_COLLECTION: str = os.getenv("HELIX_DB_COLLECTION", "dravya-health-profiles")

    # =========================
    # 🤖 Mistral LLM (Direct API)
    # =========================
    MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY")
    MODEL_NAME: str = os.getenv("MODEL_NAME", "mistral-large-latest")

    # =========================
    # 🤖 Multi-LLM providers (optional — system degrades to Mistral if absent)
    # =========================
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    XAI_API_KEY: str = os.getenv("XAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")

    # Model used for each routing tier. Change these to any provider you have keys for.
    LLM_SIMPLE_MODEL: str = os.getenv("LLM_SIMPLE_MODEL", "mistral-small-latest")
    LLM_COMPLEX_MODEL: str = os.getenv("LLM_COMPLEX_MODEL", "mistral-large-latest")
    # Models that vote when a prompt is classified "critical" (comma-separated).
    # Providers without a configured key are automatically dropped from the vote.
    LLM_ENSEMBLE_MODELS: str = os.getenv(
        "LLM_ENSEMBLE_MODELS",
        "mistral-large-latest,gpt-4o,claude-sonnet-5",
    )
    LLM_JUDGE_MODEL: str = os.getenv("LLM_JUDGE_MODEL", "mistral:mistral-small-latest")

    LLM_HIGH_CHAIN: str = os.getenv(
        "LLM_HIGH_CHAIN",
        "openai:gpt-5.6,xai:grok-4.5,openrouter:x-ai/grok-4.5,anthropic:claude-sonnet-4-5,openrouter:openai/gpt-5.6",
    )
    LLM_MEDIUM_CHAIN: str = os.getenv(
        "LLM_MEDIUM_CHAIN",
        "groq:mistral-saba-24b,mistral:mistral-small-latest,google:gemini-2.5-flash,openrouter:mistralai/mistral-small",
    )
    LLM_LOW_CHAIN: str = os.getenv(
        "LLM_LOW_CHAIN",
        "groq:llama-3.3-70b-versatile,deepseek:deepseek-chat,mistral:mistral-small-latest,openrouter:meta-llama/llama-3.3-70b-instruct",
    )
    LLM_HIGH_DAILY_REQUESTS: int = int(os.getenv("LLM_HIGH_DAILY_REQUESTS", "20"))
    LLM_HIGH_DAILY_TOKENS: int = int(os.getenv("LLM_HIGH_DAILY_TOKENS", "80000"))
    LLM_MEDIUM_DAILY_REQUESTS: int = int(os.getenv("LLM_MEDIUM_DAILY_REQUESTS", "50"))
    LLM_MEDIUM_DAILY_TOKENS: int = int(os.getenv("LLM_MEDIUM_DAILY_TOKENS", "200000"))
    LLM_LOW_DAILY_REQUESTS: int = int(os.getenv("LLM_LOW_DAILY_REQUESTS", "100"))
    LLM_LOW_DAILY_TOKENS: int = int(os.getenv("LLM_LOW_DAILY_TOKENS", "400000"))

    # Feature flag: use the new hierarchical orchestrator instead of the linear pipeline.
    USE_HIERARCHICAL_ORCHESTRATOR: bool = (
        os.getenv("USE_HIERARCHICAL_ORCHESTRATOR", "true").lower() == "true"
    )
    # AgentScope knowledge + pipeline is the default orchestrator.
    # Set USE_AGENTSCOPE=false to fall back to LangGraph (hierarchical or linear).
    USE_AGENTSCOPE: bool = os.getenv("USE_AGENTSCOPE", "true").lower() == "true"
    MAX_CRITIC_RETRIES: int = int(os.getenv("MAX_CRITIC_RETRIES", "3"))
    KB_CLASSICAL_COLLECTION: str = os.getenv("KB_CLASSICAL_COLLECTION", "ayurveda_classical")
    KB_USER_COLLECTION: str = os.getenv("KB_USER_COLLECTION", "user_consultations")
    KB_FEWSHOT_COLLECTION: str = os.getenv("KB_FEWSHOT_COLLECTION", "feedback_fewshot")
    KB_TOP_K: int = int(os.getenv("KB_TOP_K", "5"))
    QDRANT_PATH: str = os.getenv("QDRANT_PATH", "")



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
