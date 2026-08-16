'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Send, Plus, Shield } from 'lucide-react';

export type ChatLeague = 'high' | 'medium' | 'low';

const LEAGUES: { id: ChatLeague; label: string; blurb: string }[] = [
    { id: 'high', label: 'High', blurb: 'Grok 4.5 / GPT-5.6' },
    { id: 'medium', label: 'Medium', blurb: 'Mistral on Groq' },
    { id: 'low', label: 'Low', blurb: 'Fast' },
];

const STORAGE_KEY = 'dravya-chat-league';

interface ChatInputProps {
    onSend?: (message: string) => void;
    placeholder?: string;
    league?: ChatLeague;
    onLeagueChange?: (league: ChatLeague) => void;
    usageLabel?: string;
    downgradeNotice?: string | null;
    caveman?: boolean;
    onCavemanChange?: (value: boolean) => void;
    onOpenTools?: () => void;
}

export default function ChatInput({
    onSend,
    placeholder = "Describe how you're feeling...",
    league: leagueProp,
    onLeagueChange,
    usageLabel,
    downgradeNotice,
    caveman = false,
    onCavemanChange,
    onOpenTools,
}: ChatInputProps) {
    const [message, setMessage] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [internalLeague, setInternalLeague] = useState<ChatLeague>('medium');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const league = leagueProp ?? internalLeague;

    useEffect(() => {
        if (leagueProp) return;
        try {
            const stored = localStorage.getItem(STORAGE_KEY) as ChatLeague | null;
            if (stored === 'high' || stored === 'medium' || stored === 'low') {
                setInternalLeague(stored);
                onLeagueChange?.(stored);
            }
        } catch {
            /* ignore */
        }
    }, [leagueProp, onLeagueChange]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [message]);

    const setLeague = useCallback((next: ChatLeague) => {
        setInternalLeague(next);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            /* ignore */
        }
        onLeagueChange?.(next);
    }, [onLeagueChange]);

    const handleSend = useCallback(() => {
        if (message.trim() && onSend) {
            onSend(message.trim());
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    }, [message, onSend]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    const hasContent = message.trim().length > 0;

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-6 pt-2 animate-wellness-fade-in animation-delay-300 relative z-20">
            <div className="flex justify-center gap-2 mb-3 flex-wrap">
                {LEAGUES.map((item) => {
                    const active = league === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setLeague(item.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                active
                                    ? 'bg-[#16826B] text-white border-[#16826B]'
                                    : 'bg-white text-slate-600 border-gray-200 hover:border-[#16826B]/40'
                            }`}
                            title={item.blurb}
                        >
                            {item.label}
                            <span className={`ml-1 ${active ? 'text-white/80' : 'text-slate-400'}`}>{item.blurb}</span>
                        </button>
                    );
                })}
                <button
                    type="button"
                    onClick={() => onCavemanChange?.(!caveman)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        caveman
                            ? 'bg-stone-800 text-amber-100 border-stone-800'
                            : 'bg-white text-slate-600 border-gray-200 hover:border-stone-400'
                    }`}
                    title="Short replies. Fewer tokens."
                >
                    Caveman
                </button>
            </div>

            <div className={`bg-white rounded-full p-2 pl-3 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 transition-all duration-300 flex items-center gap-3 ${isFocused ? 'ring-1 ring-[#16826B]/20 border-[#16826B]/20' : 'hover:border-gray-200'}`}>
                <button
                    type="button"
                    onClick={onOpenTools}
                    aria-label="Chat skills and MCP"
                    className="flex items-center justify-center size-9 rounded-full bg-[#16826B]/10 text-[#16826B] hover:bg-[#16826B]/20 transition-colors shrink-0"
                >
                    <Plus className="size-5" />
                </button>

                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="flex-1 min-h-[24px] max-h-[120px] resize-none overflow-hidden bg-transparent border-none focus:ring-0 focus:outline-none text-slate-700 placeholder:text-slate-400 text-[15px] py-2 px-1"
                    placeholder={caveman ? 'Say issue. Short.' : placeholder}
                    rows={1}
                />

                <div className="flex items-center gap-3 shrink-0 pr-1">
                    <button className="flex items-center justify-center size-9 text-[#16826B] hover:text-[#0f5c4c] transition-colors">
                        <Mic className="size-[22px]" strokeWidth={2} />
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={!hasContent}
                        className={`flex items-center justify-center size-10 rounded-full transition-all duration-300 ${hasContent ? 'bg-[#16826B] text-white hover:bg-[#0f5c4c] hover:scale-105 shadow-lg shadow-[#16826B]/20' : 'bg-[#16826B] text-white opacity-80 cursor-not-allowed'}`}
                    >
                        <Send className="size-[18px] ml-0.5" strokeWidth={2} />
                    </button>
                </div>
            </div>

            {caveman ? (
                <p className="text-center text-xs text-stone-500 mt-2">Caveman on — short answers, lower token use.</p>
            ) : null}
            {downgradeNotice ? (
                <p className="text-center text-xs text-amber-700 mt-2">{downgradeNotice}</p>
            ) : null}
            {usageLabel ? (
                <p className="text-center text-xs text-slate-400 mt-1">{usageLabel}</p>
            ) : null}

            <div className="flex items-center justify-center gap-1.5 mt-4 text-xs font-medium text-slate-400/90">
                <Shield className="size-[14px] text-sky-400" />
                <p>AI-powered guidance. Always consult a healthcare professional for medical advice.</p>
            </div>
        </div>
    );
}
