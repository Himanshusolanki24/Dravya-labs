'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Send, Sparkles, Bot, Plus, Lightbulb, ImageIcon, Search, Link as LinkIcon } from 'lucide-react';
import { translations } from '@/lib/translations';
import { useLanguage } from '@/context/LanguageContext';

interface ChatInputProps {
    onSend?: (message: string) => void;
    placeholder?: string;
}

export default function ChatInput({
    onSend,
    placeholder
}: ChatInputProps) {
    const [message, setMessage] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { language } = useLanguage();
    const t = translations[language];

    const inputPlaceholder = placeholder || 'Ask anything';

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [message]);

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
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-6 pt-2 animate-wellness-fade-in animation-delay-300 relative z-10">
            <div className={`bg-white rounded-full p-1.5 pl-4 pr-1.5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-200 transition-all duration-300 ${isFocused ? 'shadow-[0_4px_25px_rgba(16,185,129,0.15)] border-emerald-300' : 'hover:border-gray-300 hover:shadow-[0_4px_20px_-3px_rgba(0,0,0,0.1)]'}`}>
                {/* Middle Input Row */}
                <div className="flex items-center gap-2">
                    <button className="flex items-center justify-center size-9 text-gray-400 hover:text-emerald-500 transition-colors focus:outline-none shrink-0">
                        <Plus className="size-5" />
                    </button>
                    
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="flex-1 min-h-[22px] max-h-[120px] resize-none overflow-hidden bg-transparent border-none focus:ring-0 focus:outline-none text-gray-800 placeholder:text-gray-400 text-[15px] leading-relaxed py-1.5 px-1 my-0.5"
                        placeholder={inputPlaceholder}
                        aria-label="Type your message"
                        rows={1}
                    />

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            className="flex items-center justify-center size-9 text-gray-400 hover:text-emerald-500 transition-colors focus:outline-none"
                            title={t.chat.voiceInput}
                            aria-label={t.chat.voiceInput}
                        >
                            <Mic className="size-5" strokeWidth={1.5} />
                        </button>

                        <button
                            onClick={handleSend}
                            disabled={!hasContent}
                            aria-label={t.chat.send}
                            className={`flex items-center justify-center size-9 rounded-full transition-all duration-300 focus:outline-none ${hasContent ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)] hover:shadow-[0_0_18px_rgba(16,185,129,0.7)] hover:bg-emerald-400 hover:scale-105' : 'bg-gray-100 border border-gray-200/50 text-gray-400 cursor-not-allowed'}`}
                        >
                            <Send className="size-4 ml-0.5" strokeWidth={2} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <p className="text-center text-xs text-gray-400 mt-4 font-medium">
                {t.chat.disclaimer}
            </p>
        </div>
    );
}
