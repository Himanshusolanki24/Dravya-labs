'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    MessageSquare, Sparkles, Send,
    History, ChevronRight, Heart,
    Brain, Flame, Wind, Droplets, Plus
} from 'lucide-react';

// Mock consultation history
const consultationHistory = [
    {
        id: 'c1',
        title: 'Digestive Health Consultation',
        preview: 'I have been experiencing bloating after meals...',
        date: '2026-01-08',
        topic: 'Digestive',
    },
    {
        id: 'c2',
        title: 'Sleep Issues & Vata Imbalance',
        preview: 'Having trouble falling asleep and feeling anxious...',
        date: '2026-01-06',
        topic: 'Sleep',
    },
    {
        id: 'c3',
        title: 'Skin Care Routine',
        preview: 'What Ayurvedic remedies help with dry skin...',
        date: '2026-01-04',
        topic: 'Skin',
    },
];

// Consultation topics
const topics = [
    {
        id: 'digestive',
        name: 'Digestive Health',
        icon: <Flame className="size-5" />,
        color: 'bg-orange-100 text-orange-600 border-orange-200',
        prompt: 'I need help with digestive issues...'
    },
    {
        id: 'sleep',
        name: 'Sleep & Stress',
        icon: <Brain className="size-5" />,
        color: 'bg-purple-100 text-purple-600 border-purple-200',
        prompt: 'I am having trouble with sleep and stress...'
    },
    {
        id: 'immunity',
        name: 'Immunity',
        icon: <Heart className="size-5" />,
        color: 'bg-green-100 text-green-600 border-green-200',
        prompt: 'I want to boost my immunity naturally...'
    },
    {
        id: 'vata',
        name: 'Vata Balance',
        icon: <Wind className="size-5" />,
        color: 'bg-blue-100 text-blue-600 border-blue-200',
        prompt: 'I think I have a Vata imbalance...'
    },
    {
        id: 'pitta',
        name: 'Pitta Balance',
        icon: <Flame className="size-5" />,
        color: 'bg-amber-100 text-amber-600 border-amber-200',
        prompt: 'I believe I have excess Pitta...'
    },
    {
        id: 'kapha',
        name: 'Kapha Balance',
        icon: <Droplets className="size-5" />,
        color: 'bg-teal-100 text-teal-600 border-teal-200',
        prompt: 'I need help balancing Kapha...'
    },
];

export default function ConsultPage() {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    const handleTopicSelect = (topic: typeof topics[0]) => {
        setSelectedTopic(topic.id);
        setMessage(topic.prompt);
    };

    const startConsultation = () => {
        if (message.trim()) {
            window.location.href = `/chat?q=${encodeURIComponent(message)}`;
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-indigo-50/30 via-purple-50/20 to-pink-50/30">
            {/* Header */}
            <div className="px-6 py-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                        <Sparkles className="size-4" />
                        Personalized Ayurvedic Guidance
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-3">AI Consultation</h1>
                    <p className="text-indigo-100 max-w-lg mx-auto">
                        Get personalized Ayurvedic recommendations based on your constitution, imbalances, and health goals.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-6 py-8">
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* New Consultation */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="size-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                    <Plus className="size-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Start New Consultation</h2>
                                    <p className="text-sm text-gray-500">Choose a topic or describe your concern</p>
                                </div>
                            </div>

                            {/* Topic Selection */}
                            <div className="mb-6">
                                <p className="text-sm font-medium text-gray-600 mb-3">Quick Topics</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {topics.map((topic) => (
                                        <button
                                            key={topic.id}
                                            onClick={() => handleTopicSelect(topic)}
                                            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${selectedTopic === topic.id
                                                ? `${topic.color} scale-[1.02] shadow-md`
                                                : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                                                }`}
                                        >
                                            <span className={selectedTopic === topic.id ? '' : 'text-gray-500'}>
                                                {topic.icon}
                                            </span>
                                            <span className={`text-sm font-medium ${selectedTopic === topic.id ? '' : 'text-gray-700'}`}>
                                                {topic.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Message Input */}
                            <div className="relative">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Describe your health concern or question in detail..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 resize-none text-gray-800 placeholder:text-gray-400"
                                />
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-xs text-gray-400">
                                        Your consultation will be personalized based on your health profile
                                    </p>
                                    <button
                                        onClick={startConsultation}
                                        disabled={!message.trim()}
                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
                                    >
                                        <MessageSquare className="size-5" />
                                        Start Consultation
                                        <Send className="size-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Start Prompts */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4">Common Questions</h3>
                            <div className="space-y-2">
                                {[
                                    "What are the best remedies for my Pitta imbalance?",
                                    "How can I improve my digestion naturally?",
                                    "What daily routine should I follow for my dosha type?",
                                    "Which herbs can help with anxiety and sleep?",
                                ].map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setMessage(prompt)}
                                        className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 text-sm transition-colors flex items-center justify-between group"
                                    >
                                        <span>{prompt}</span>
                                        <ChevronRight className="size-4 text-gray-400 group-hover:text-indigo-500" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - History */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <History className="size-5 text-gray-500" />
                                    <h3 className="font-bold text-gray-800">Recent Consultations</h3>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {consultationHistory.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/chat?history=${item.id}`}
                                        className="block p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors group"
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <p className="font-medium text-gray-800 group-hover:text-indigo-700 text-sm">
                                                {item.title}
                                            </p>
                                            <span className="text-xs text-gray-400">
                                                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{item.preview}</p>
                                    </Link>
                                ))}
                            </div>
                            <button className="w-full mt-4 text-center text-sm text-indigo-600 font-medium hover:underline">
                                View All History
                            </button>
                        </div>

                        {/* Tips */}
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="size-5 text-indigo-500" />
                                <h3 className="font-bold text-gray-800">Consultation Tips</h3>
                            </div>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-400 mt-1">•</span>
                                    Be specific about your symptoms and their duration
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-400 mt-1">•</span>
                                    Mention any current medications or supplements
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-400 mt-1">•</span>
                                    Share your dietary habits and lifestyle
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-400 mt-1">•</span>
                                    Ask follow-up questions for clarity
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
