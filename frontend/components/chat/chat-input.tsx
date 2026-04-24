'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Paperclip, ArrowUp } from 'lucide-react';
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

    // Use provided placeholder or fallback to translated default
    const inputPlaceholder = placeholder || t.chat.placeholder;

    // Auto-resize textarea
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
        <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 md:px-6 pb-4 sm:pb-8 pt-2 sm:pt-4 animate-wellness-fade-in animation-delay-300 safe-area-bottom">
            {/* Input Container with Glow Effect */}
            <div
                className={`
          chat-input-container relative transition-all duration-700 ease-out
          ${isFocused ? 'transform scale-[1.01]' : ''}
        `}
            >
                {/* Ambient Glow */}
                <div
                    className={`
            absolute -inset-1 rounded-3xl blur-xl transition-all duration-700 ease-out
            bg-gradient-to-r from-emerald-200/30 via-teal-200/20 to-emerald-200/30
            ${isFocused ? 'opacity-80 -inset-2' : 'opacity-40'}
          `}
                    aria-hidden="true"
                />

                {/* Main Input Card */}
                <div
                    className={`
            relative flex flex-col bg-white rounded-2xl border transition-all duration-500 ease-out
            ${isFocused
                            ? 'border-emerald-300 shadow-xl shadow-emerald-100/50'
                            : 'border-gray-200 shadow-lg shadow-gray-100/50'
                        }
          `}
                >
                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="
              w-full min-h-[20px] max-h-[200px] resize-none overflow-hidden 
              rounded-t-2xl text-gray-800 focus:outline-none border-none bg-transparent 
              placeholder:text-gray-400 px-4 sm:px-5 py-3 sm:py-4 text-base font-medium leading-relaxed
              transition-all duration-300
            "
                        placeholder={inputPlaceholder}
                        aria-label="Type your health concern"
                    />

                    {/* Action Bar */}
                    <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50/80 rounded-b-2xl border-t border-gray-100">
                        {/* Left Actions */}
                        <div className="flex items-center gap-1">
                            {/* Voice Input */}
                            <button
                                className="
                  flex items-center justify-center p-2.5 rounded-xl
                  text-gray-400 hover:text-emerald-600 hover:bg-emerald-50
                  transition-all duration-300 ease-out
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
                "
                                title={t.chat.voiceInput}
                                aria-label={t.chat.voiceInput}
                            >
                                <Mic className="size-5" strokeWidth={1.5} />
                            </button>

                            {/* Attach File */}
                            <button
                                className="
                  flex items-center justify-center p-2.5 rounded-xl
                  text-gray-400 hover:text-emerald-600 hover:bg-emerald-50
                  transition-all duration-300 ease-out
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
                "
                                title={t.chat.attachFile}
                                aria-label={t.chat.attachFile}
                            >
                                <Paperclip className="size-5" strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Send Button */}
                        <button
                            onClick={handleSend}
                            disabled={!hasContent}
                            aria-label={t.chat.send}
                            className={`
                flex items-center justify-center gap-2 rounded-xl h-10 sm:h-11 px-4 sm:px-5 touch-target
                text-sm font-semibold transition-all duration-500 ease-out
                focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2
                ${hasContent
                                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-200 active:scale-95'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }
              `}
                        >
                            <span className="hidden sm:inline">{t.chat.send}</span>
                            <ArrowUp
                                className={`size-4 transition-transform duration-300 ${hasContent ? 'translate-y-0' : ''}`}
                                strokeWidth={2}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <p className="text-center text-xs text-gray-400 mt-4 font-medium animate-wellness-fade-in animation-delay-400">
                {t.chat.disclaimer}
            </p>
        </div>
    );
}
