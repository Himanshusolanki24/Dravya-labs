// API Configuration for Dravya Labs
const API_CONFIG = {
    AI_URL: (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, ''),

    // AI Endpoints (FastAPI backend)
    AI_ENDPOINTS: {
        ANALYZE: '/api/analyze',
        CHAT: '/api/chat',
        HEALTH: '/api/health',
        TREATMENT_GENERATE: '/api/treatment/generate',
        TREATMENT_REVIEW: '/api/treatment/review',
    },

    // Request timeout in milliseconds
    TIMEOUT: 30000,
    AI_TIMEOUT: 180000, // 3 min — full pipeline makes 6+ sequential LLM calls
}

export default API_CONFIG

