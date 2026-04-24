// AI Service for Dravya Labs - Connects to Azure AI Foundry backend
import API_CONFIG from '@/config/api';

// Types matching the FastAPI backend
export interface SymptomInput {
    symptoms: string;
    age?: number;
    gender?: string;
    existing_conditions?: string;
    user_id?: string;
    session_id?: string;
}

export interface HomeRemedy {
    name: string;
    ingredients: string[];
    steps: string[];
    prep_time: string;
    expected_results: string;
    precautions?: string;
}

export interface Herb {
    name: string;
    sanskrit_name?: string;
    properties: string[];
    how_to_consume: string;
    dosage: string;
    benefits: string;
    contraindications?: string;
}

export interface Medicine {
    name: string;
    type: string;
    description: string;
    dosage: string;
    price_range: string;
    where_to_buy: string;
}

export type SeverityLevel = 'emergency' | 'urgent' | 'moderate' | 'mild';
export type DoshaType = 'vata' | 'pitta' | 'kapha' | 'vata-pitta' | 'pitta-kapha' | 'vata-kapha' | 'tridoshic';

export interface AnalysisResult {
    analysis_id: string;
    session_id: string;
    user_id: string;
    severity: SeverityLevel;
    dosha_imbalance: DoshaType;
    primary_symptoms: string[];
    ayurvedic_interpretation: string;
    emergency_warning?: string;
    home_remedies: HomeRemedy[];
    herbs: Herb[];
    medicines: Medicine[];
    lifestyle_recommendations: string[];
    dietary_advice: string[];
}

export interface ChatMessageInput {
    message: string;
    session_id: string;
    user_id?: string;
    context?: Record<string, unknown>;
}

export interface ChatResponse {
    message_id: string;
    response: string;
    timestamp: string;
}

export interface ChatSession {
    session_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

// Treatment Plan Types
export interface TreatmentTask {
    id: string;
    description: string;
    time_of_day: 'morning' | 'afternoon' | 'evening' | 'night';
    category: 'herb' | 'diet' | 'lifestyle' | 'therapy';
}

export interface TreatmentDay {
    day_number: number;
    tasks: TreatmentTask[];
    focus: string;
}

export interface TreatmentPlan {
    treatment_id: string;
    condition: string;
    severity: string;
    days: TreatmentDay[];
    review_after_days: number;
    duration_days: number;
    created_at: string;
    overview: string;
}

export interface GenerateTreatmentInput {
    session_id: string;
    user_id?: string;
    condition: string;
    severity?: string;
}

export interface ReviewTreatmentInput {
    treatment_id: string;
    user_id?: string;
    condition: string;
    completed_tasks: string[];
    total_tasks: number;
    user_feedback?: string;
}

export interface TreatmentReviewResult {
    status: 'improving' | 'worsening' | 'stable';
    recommendation: string;
    refer_to_doctor: boolean;
    adjusted_plan?: TreatmentPlan;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    analysis?: AnalysisResult;
}

class AIService {
    private baseUrl: string;
    private timeout: number;

    constructor() {
        this.baseUrl = API_CONFIG.AI_URL;
        this.timeout = API_CONFIG.AI_TIMEOUT;
    }

    private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    // Health check
    async checkHealth(): Promise<boolean> {
        try {
            const response = await this.fetchWithTimeout(
                `${this.baseUrl}${API_CONFIG.AI_ENDPOINTS.HEALTH}`,
                { method: 'GET' }
            );
            return response.ok;
        } catch {
            return false;
        }
    }

    // Analyze symptoms - Initial consultation
    async analyzeSymptoms(input: SymptomInput): Promise<AnalysisResult> {
        const response = await this.fetchWithTimeout(
            `${this.baseUrl}${API_CONFIG.AI_ENDPOINTS.ANALYZE}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(input),
            }
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || 'Failed to analyze symptoms');
        }

        return response.json();
    }

    // Follow-up chat
    async sendChatMessage(input: ChatMessageInput): Promise<ChatResponse> {
        const response = await this.fetchWithTimeout(
            `${this.baseUrl}${API_CONFIG.AI_ENDPOINTS.CHAT}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(input),
            }
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || 'Failed to send message');
        }

        return response.json();
    }

    // List chat sessions for a user
    async getChatSessions(userId: string): Promise<ChatSession[]> {
        try {
            const response = await this.fetchWithTimeout(
                `${this.baseUrl}/api/chat/sessions?user_id=${encodeURIComponent(userId)}`,
                { method: 'GET' }
            );
            if (!response.ok) return [];
            const data = await response.json();
            return data.sessions || [];
        } catch {
            return [];
        }
    }

    // Delete a chat session
    async deleteChatSession(sessionId: string): Promise<void> {
        await this.fetchWithTimeout(
            `${this.baseUrl}/api/chat/sessions/${sessionId}`,
            { method: 'DELETE' }
        );
    }

    // Generate a treatment plan
    async generateTreatmentPlan(input: GenerateTreatmentInput): Promise<TreatmentPlan> {
        const response = await this.fetchWithTimeout(
            `${this.baseUrl}${API_CONFIG.AI_ENDPOINTS.TREATMENT_GENERATE}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            }
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || 'Failed to generate treatment plan');
        }

        return response.json();
    }

    // Review treatment progress
    async reviewTreatment(input: ReviewTreatmentInput): Promise<TreatmentReviewResult> {
        const response = await this.fetchWithTimeout(
            `${this.baseUrl}${API_CONFIG.AI_ENDPOINTS.TREATMENT_REVIEW}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            }
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || 'Failed to review treatment');
        }

        return response.json();
    }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;

