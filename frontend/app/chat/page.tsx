'use client';

import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import WellnessIcon from '@/components/chat/wellness-icon';
import TitleSection from '@/components/chat/title-section';
import SuggestionChips from '@/components/chat/suggestion-chips';
import ChatInput from '@/components/chat/chat-input';
import ModernBackground from '@/components/chat/modern-background';
import { translations } from '@/lib/translations';
import { useLanguage } from '@/context/LanguageContext';
import { useUser } from '@/context/UserContext';
import { aiService, AnalysisResult, Message } from '@/lib/ai-service';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Message bubble component
function MessageBubble({ message, sessionId }: { message: Message; sessionId?: string | null }) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4 px-1`}>
            <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 ${isUser
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-800'
                    }`}
            >
                <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert text-white' : 'text-gray-800'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                    </ReactMarkdown>
                </div>
                {message.analysis && (
                    <AnalysisCard analysis={message.analysis} sessionId={sessionId} />
                )}
            </div>
        </div>
    );
}

// Analysis result card component
function AnalysisCard({ analysis, sessionId }: { analysis: AnalysisResult; sessionId?: string | null }) {
    const router = useRouter();
    const showTreatmentButton = analysis.severity === 'moderate' || analysis.severity === 'urgent';

    const handleStartTreatment = () => {
        const condition = analysis.primary_symptoms?.[0] || 'condition';
        const params = new URLSearchParams({
            condition,
            session: sessionId || analysis.session_id || '',
            severity: analysis.severity,
        });
        router.push(`/treatment?${params.toString()}`);
    };
    const severityColors = {
        emergency: 'bg-red-100 border-red-300 text-red-800',
        urgent: 'bg-orange-100 border-orange-300 text-orange-800',
        moderate: 'bg-yellow-100 border-yellow-300 text-yellow-800',
        mild: 'bg-green-100 border-green-300 text-green-800',
    };

    return (
        <div className="mt-4 space-y-4">
            {/* Emergency Warning */}
            {analysis.emergency_warning && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    <strong>⚠️ {analysis.emergency_warning}</strong>
                </div>
            )}

            {/* Severity & Dosha */}
            <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${severityColors[analysis.severity]}`}>
                    Severity: {analysis.severity}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 border border-purple-300 text-purple-800">
                    Dosha: {analysis.dosha_imbalance}
                </span>
            </div>

            {/* Ayurvedic Interpretation */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <h4 className="font-semibold text-emerald-800 mb-1">Ayurvedic Analysis</h4>
                <p className="text-sm text-emerald-700">{analysis.ayurvedic_interpretation}</p>
            </div>

            {/* Home Remedies */}
            {analysis.home_remedies.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <h4 className="font-semibold text-amber-800 mb-2">🏠 Home Remedies</h4>
                    {analysis.home_remedies.map((remedy, idx) => (
                        <div key={idx} className="mb-3 last:mb-0">
                            <p className="font-medium text-amber-900">{remedy.name}</p>
                            <p className="text-sm text-amber-700">
                                <strong>Ingredients:</strong> {remedy.ingredients.join(', ')}
                            </p>
                            <p className="text-sm text-amber-700">
                                <strong>Prep time:</strong> {remedy.prep_time}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Herbs */}
            {analysis.herbs.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="font-semibold text-green-800 mb-2">🌿 Recommended Herbs</h4>
                    {analysis.herbs.map((herb, idx) => (
                        <div key={idx} className="mb-2 last:mb-0">
                            <p className="font-medium text-green-900">
                                {herb.name} {herb.sanskrit_name && `(${herb.sanskrit_name})`}
                            </p>
                            <p className="text-sm text-green-700">{herb.benefits}</p>
                            <p className="text-xs text-green-600">Dosage: {herb.dosage}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Lifestyle Recommendations */}
            {analysis.lifestyle_recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-semibold text-blue-800 mb-2">🧘 Lifestyle Tips</h4>
                    <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                        {analysis.lifestyle_recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Treatment Plan Button — only for chronic/long-term conditions */}
            {showTreatmentButton && (
                <button
                    onClick={handleStartTreatment}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-emerald-200/50 active:scale-[0.98]"
                >
                    🩺 Start Treatment Plan
                </button>
            )}
        </div>
    );
}

// Loading indicator
function LoadingIndicator() {
    return (
        <div className="flex justify-start mb-4">
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-gray-500">Analyzing your symptoms...</span>
                </div>
            </div>
        </div>
    );
}

function ChatPageContent() {
    const [selectedChip, setSelectedChip] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { language } = useLanguage();
    const { user } = useUser();
    const searchParams = useSearchParams();
    const t = translations[language];

    // Handle query params: ?new=true resets chat, ?session=xxx loads that session
    useEffect(() => {
        const isNew = searchParams.get('new');
        if (isNew === 'true') {
            setMessages([]);
            setSessionId(null);
            setSelectedChip(null);
            setError(null);
        }
    }, [searchParams]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleChipSelect = useCallback((chipId: string) => {
        setSelectedChip(prev => prev === chipId ? null : chipId);
    }, []);

    const handleSendMessage = useCallback(async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;

        setError(null);

        // Add user message to chat
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: messageText,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // If no session yet, do initial analysis
            if (!sessionId) {
                // Combine selected chip context with message
                const symptomContext = selectedChip
                    ? `Concern type: ${selectedChip}. ${messageText}`
                    : messageText;

                const result = await aiService.analyzeSymptoms({
                    symptoms: symptomContext,
                    user_id: user?.id || undefined,
                    session_id: undefined,
                });

                // Save session info
                setSessionId(result.session_id);

                // Session active for current conversation

                // Add assistant response with analysis
                const assistantMessage: Message = {
                    id: result.analysis_id,
                    role: 'assistant',
                    content: `I've analyzed your symptoms. Here's what I found based on Ayurvedic principles:`,
                    timestamp: new Date(),
                    analysis: result,
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                // Follow-up chat message
                const result = await aiService.sendChatMessage({
                    message: messageText,
                    session_id: sessionId,
                    user_id: user?.id || undefined,
                });

                const assistantMessage: Message = {
                    id: result.message_id,
                    role: 'assistant',
                    content: result.response,
                    timestamp: new Date(result.timestamp),
                };
                setMessages(prev => [...prev, assistantMessage]);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
            setError(errorMessage);

            // Add error message to chat
            const errorAssistantMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `I'm sorry, I encountered an error: ${errorMessage}. Please try again.`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorAssistantMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, sessionId, user?.id, selectedChip]);

    // Start new conversation
    const handleNewConversation = useCallback(() => {
        setMessages([]);
        setSessionId(null);
        setSelectedChip(null);
        setError(null);
    }, []);

    const hasMessages = messages.length > 0;

    return (
        <div className="flex flex-1 flex-col h-full relative overflow-hidden">
            {/* Modern Animated Background */}
            <ModernBackground />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center px-3 sm:px-4 md:px-6 overflow-y-auto chat-scrollbar relative z-10 pt-12 sm:pt-14 pb-2">
                <div className="w-full max-w-4xl mx-auto py-3 sm:py-4 lg:py-6 flex-1 flex flex-col">
                    {!hasMessages ? (
                        <>
                            {/* Initial State - Wellness Icon */}
                            <div className="flex justify-center">
                                <WellnessIcon />
                            </div>

                            {/* Title Section */}
                            <TitleSection
                                headline={t.chat.headline}
                                subtitle={t.chat.subtitle}
                            />

                            {/* Suggestion Chips */}
                            <SuggestionChips onSelect={handleChipSelect} />
                        </>
                    ) : (
                        <>
                            {/* New Conversation Button */}
                            <div className="flex justify-end mb-3 sm:mb-4">
                                <button
                                    onClick={handleNewConversation}
                                    className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors touch-target"
                                >
                                    + New Consultation
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 space-y-2">
                                {messages.map((message) => (
                                    <MessageBubble key={message.id} message={message} sessionId={sessionId} />
                                ))}
                                {isLoading && <LoadingIndicator />}
                                <div ref={messagesEndRef} />
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Error Banner */}
            {error && (
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm">
                        {error}
                        <button
                            onClick={() => setError(null)}
                            className="ml-2 font-bold"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Sticky Chat Input - Mobile optimized */}
            <div className="sticky bottom-0 w-full pt-4 sm:pt-6 relative z-20 mobile-chat-input safe-area-bottom">
                <ChatInput
                    onSend={handleSendMessage}
                    placeholder={t.chat.placeholder}
                />
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><span className="text-gray-400">Loading...</span></div>}>
            <ChatPageContent />
        </Suspense>
    );
}
