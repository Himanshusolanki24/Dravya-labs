'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    CheckCircle2, Circle, Leaf, Sun, Moon, Coffee, Utensils,
    Sparkles, AlertTriangle, ArrowRight, RefreshCw, Stethoscope,
    Calendar, TrendingUp, ChevronDown, ChevronUp, MessageSquare,
    Clock, Heart
} from 'lucide-react';
import { aiService, TreatmentPlan, TreatmentReviewResult } from '@/lib/ai-service';
import { useUser } from '@/context/UserContext';

// Category icons & colors
const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
    herb: { icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Herbal' },
    diet: { icon: Utensils, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Diet' },
    lifestyle: { icon: Heart, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', label: 'Lifestyle' },
    therapy: { icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', label: 'Therapy' },
};

const timeIcons: Record<string, React.ElementType> = {
    morning: Sun,
    afternoon: Coffee,
    evening: Moon,
    night: Moon,
};

// ─── Empty State ─────────────────────────────────────────────
function EmptyState() {
    const router = useRouter();
    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-amber-50/30 via-green-50/20 to-teal-50/30 min-h-screen">
            <div className="text-center max-w-md animate-wellness-slide-up">
                <div className="size-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                    <Stethoscope className="size-12 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">No Active Treatment Plan</h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    Start a consultation in the Chat to get diagnosed. For conditions that need long-term care,
                    you&apos;ll see a &quot;Start Treatment Plan&quot; button to generate your personalized Ayurvedic treatment.
                </p>
                <button
                    onClick={() => router.push('/chat')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-emerald-200"
                >
                    <MessageSquare className="size-5" />
                    Go to Chat
                    <ArrowRight className="size-4" />
                </button>
            </div>
        </div>
    );
}

// ─── Loading State ───────────────────────────────────────────
function GeneratingState() {
    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-amber-50/30 via-green-50/20 to-teal-50/30 min-h-screen">
            <div className="text-center animate-wellness-fade-in">
                <div className="size-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center animate-wellness-breathe">
                    <Leaf className="size-10 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Generating Your Treatment Plan</h2>
                <p className="text-gray-500 mb-4">Our AI is creating a personalized Ayurvedic treatment plan...</p>
                <div className="flex justify-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
}

// ─── Progress Ring ───────────────────────────────────────────
function ProgressRing({ percentage }: { percentage: number }) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    return (
        <div className="relative size-24">
            <svg className="size-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} stroke="#e5e7eb" strokeWidth="8" fill="none" />
                <circle
                    cx="50" cy="50" r={radius}
                    stroke="#10b981"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-700 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-emerald-700">{Math.round(percentage)}%</span>
            </div>
        </div>
    );
}

// ─── Review Card ─────────────────────────────────────────────
function ReviewCard({ review }: { review: TreatmentReviewResult }) {
    const statusConfig = {
        improving: {
            icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300',
            title: '🎉 Great Progress!', subtitle: 'Your treatment is showing positive results',
        },
        worsening: {
            icon: AlertTriangle, color: 'text-red-700', bg: 'bg-red-50 border-red-300',
            title: '⚠️ Needs Attention', subtitle: 'We recommend professional consultation',
        },
        stable: {
            icon: RefreshCw, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-300',
            title: '➡️ Stable Condition', subtitle: 'Minor adjustments may help',
        },
    };
    const config = statusConfig[review.status] || statusConfig.stable;
    const Icon = config.icon;

    return (
        <div className={`rounded-2xl border-2 p-6 ${config.bg} animate-wellness-slide-up`}>
            <div className="flex items-start gap-4">
                <div className={`size-12 rounded-xl flex items-center justify-center ${review.status === 'improving' ? 'bg-emerald-200' : review.status === 'worsening' ? 'bg-red-200' : 'bg-blue-200'}`}>
                    <Icon className={`size-6 ${config.color}`} />
                </div>
                <div className="flex-1">
                    <h3 className={`text-lg font-bold ${config.color}`}>{config.title}</h3>
                    <p className={`text-sm ${config.color} opacity-80 mb-3`}>{config.subtitle}</p>
                    <p className="text-gray-700 leading-relaxed">{review.recommendation}</p>

                    {review.refer_to_doctor && (
                        <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-xl">
                            <p className="text-red-800 font-medium flex items-center gap-2">
                                <Stethoscope className="size-5" />
                                Please consult a personal doctor or Ayurvedic practitioner. This condition needs professional medical attention.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Day Card ────────────────────────────────────────────────
function DayCard({
    day,
    completedTasks,
    onToggleTask,
    isExpanded,
    onToggleExpand,
}: {
    day: TreatmentPlan['days'][0];
    completedTasks: Set<string>;
    onToggleTask: (taskId: string) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}) {
    const completedCount = day.tasks.filter(t => completedTasks.has(t.id)).length;
    const totalTasks = day.tasks.length;
    const allDone = completedCount === totalTasks;
    const progressPct = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

    return (
        <div className={`bg-white/80 backdrop-blur-sm rounded-2xl border transition-all duration-300 overflow-hidden ${allDone ? 'border-emerald-400/40 shadow-emerald-100/50' : 'border-white/50'} shadow-sm hover:shadow-md hover:bg-white`}>
            {/* Day Header */}
            <button
                onClick={onToggleExpand}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-xl flex items-center justify-center font-bold text-sm ${allDone ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {allDone ? <CheckCircle2 className="size-5" /> : `D${day.day_number}`}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">Day {day.day_number}</h3>
                        <p className="text-xs text-gray-500">{day.focus}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-700">{completedCount}/{totalTasks}</p>
                        <p className="text-xs text-gray-400">tasks done</p>
                    </div>
                    {/* Mini progress bar */}
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden hidden sm:block">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                    {isExpanded ? <ChevronUp className="size-5 text-gray-400" /> : <ChevronDown className="size-5 text-gray-400" />}
                </div>
            </button>

            {/* Tasks */}
            {isExpanded && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-2 border-t border-gray-100 pt-3">
                    {day.tasks.map((task) => {
                        const isCompleted = completedTasks.has(task.id);
                        const cat = categoryConfig[task.category] || categoryConfig.lifestyle;
                        const TimeIcon = timeIcons[task.time_of_day] || Sun;
                        const CatIcon = cat.icon;

                        return (
                            <button
                                key={task.id}
                                onClick={() => onToggleTask(task.id)}
                                className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${isCompleted
                                    ? 'bg-emerald-50/60 border-emerald-200/50'
                                    : `hover:${cat.bg} border-slate-100 hover:border-slate-200 bg-white/40 hover:bg-white`
                                    }`}
                            >
                                {/* Checkbox */}
                                <div className="mt-0.5 shrink-0">
                                    {isCompleted ? (
                                        <CheckCircle2 className="size-5 text-emerald-500" />
                                    ) : (
                                        <Circle className="size-5 text-gray-300" />
                                    )}
                                </div>

                                {/* Task Content */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                        {task.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${cat.bg} ${cat.color}`}>
                                            <CatIcon className="size-3" />
                                            {cat.label}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                                            <TimeIcon className="size-3" />
                                            {task.time_of_day}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Main Treatment Page Content ─────────────────────────────
function TreatmentPageContent() {
    const searchParams = useSearchParams();
    const { user } = useUser();

    const condition = searchParams.get('condition');
    const sessionId = searchParams.get('session');
    const severity = searchParams.get('severity') || 'moderate';

    const [plan, setPlan] = useState<TreatmentPlan | null>(null);
    const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [review, setReview] = useState<TreatmentReviewResult | null>(null);
    const [isReviewing, setIsReviewing] = useState(false);
    const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));
    const [userFeedback, setUserFeedback] = useState('');

    // Load saved state from localStorage
    useEffect(() => {
        if (!condition) return;
        const savedPlan = localStorage.getItem(`treatment_plan_${condition}`);
        const savedCompleted = localStorage.getItem(`treatment_completed_${condition}`);
        if (savedPlan) {
            try {
                setPlan(JSON.parse(savedPlan));
            } catch { /* ignore */ }
        }
        if (savedCompleted) {
            try {
                setCompletedTasks(new Set(JSON.parse(savedCompleted)));
            } catch { /* ignore */ }
        }
    }, [condition]);

    // Save completed tasks to localStorage
    useEffect(() => {
        if (!condition || completedTasks.size === 0) return;
        localStorage.setItem(`treatment_completed_${condition}`, JSON.stringify([...completedTasks]));
    }, [completedTasks, condition]);

    // Save plan to localStorage
    useEffect(() => {
        if (!condition || !plan) return;
        localStorage.setItem(`treatment_plan_${condition}`, JSON.stringify(plan));
    }, [plan, condition]);

    // Generate treatment plan
    const generatePlan = useCallback(async () => {
        if (!condition || !sessionId) return;
        setIsGenerating(true);
        setError(null);
        try {
            const result = await aiService.generateTreatmentPlan({
                session_id: sessionId,
                user_id: user?.id || undefined,
                condition,
                severity,
            });
            setPlan(result);
            setCompletedTasks(new Set());
            setReview(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate treatment plan');
        } finally {
            setIsGenerating(false);
        }
    }, [condition, sessionId, severity, user?.id]);

    // Auto-generate if we have params but no plan
    useEffect(() => {
        if (condition && sessionId && !plan && !isGenerating) {
            generatePlan();
        }
    }, [condition, sessionId, plan, isGenerating, generatePlan]);

    // Toggle task completion
    const toggleTask = useCallback((taskId: string) => {
        setCompletedTasks(prev => {
            const next = new Set(prev);
            if (next.has(taskId)) {
                next.delete(taskId);
            } else {
                next.add(taskId);
            }
            return next;
        });
    }, []);

    // Toggle day expansion
    const toggleDay = useCallback((dayNum: number) => {
        setExpandedDays(prev => {
            const next = new Set(prev);
            if (next.has(dayNum)) {
                next.delete(dayNum);
            } else {
                next.add(dayNum);
            }
            return next;
        });
    }, []);

    // Review treatment
    const handleReview = useCallback(async () => {
        if (!plan) return;
        setIsReviewing(true);
        try {
            const totalTasks = plan.days.reduce((sum, d) => sum + d.tasks.length, 0);
            const result = await aiService.reviewTreatment({
                treatment_id: plan.treatment_id,
                user_id: user?.id || undefined,
                condition: plan.condition,
                completed_tasks: [...completedTasks],
                total_tasks: totalTasks,
                user_feedback: userFeedback || undefined,
            });
            setReview(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to review treatment');
        } finally {
            setIsReviewing(false);
        }
    }, [plan, completedTasks, user?.id, userFeedback]);

    // No condition provided → show empty state
    if (!condition) {
        return <EmptyState />;
    }

    // Generating
    if (isGenerating) {
        return <GeneratingState />;
    }

    // Error
    if (error && !plan) {
        return (
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="size-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="size-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Something Went Wrong</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button
                        onClick={generatePlan}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!plan) return <EmptyState />;

    // Calculate stats
    const totalTasks = plan.days.reduce((sum, d) => sum + d.tasks.length, 0);
    const completedCount = completedTasks.size;
    const overallProgress = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-amber-50/30 via-green-50/20 to-teal-50/30">
            {/* Header Section */}
            <div className="bg-[#057A55] text-white py-8 px-6 lg:px-10 overflow-hidden relative shadow-lg rounded-b-3xl shrink-0">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
                
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="size-8 rounded-lg bg-emerald-800/30 flex items-center justify-center shrink-0">
                                    <Leaf className="size-4 text-emerald-300" />
                                </div>
                                <span className="text-emerald-300 text-xs uppercase tracking-wider font-bold">Treatment Plan</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold capitalize text-white mt-1">{plan.condition}</h1>
                            <p className="text-emerald-100/90 text-sm mt-1 max-w-xl">{plan.overview}</p>
                            <div className="flex items-center gap-3 mt-3 text-emerald-200 text-xs font-semibold">
                                <span className="flex items-center gap-1"><Calendar className="size-3" /> {plan.duration_days} days</span>
                                <span className="flex items-center gap-1"><Clock className="size-3" /> Review after {plan.review_after_days} days</span>
                            </div>
                        </div>
                        <ProgressRing percentage={overallProgress} />
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="sticky top-0 z-40 pb-2 mt-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm font-semibold text-slate-700">
                                <span>
                                    <span className="font-bold text-emerald-600">{completedCount}</span>/{totalTasks} tasks completed
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${plan.severity === 'urgent' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {plan.severity}
                                </span>
                            </div>
                            <button
                                onClick={generatePlan}
                                className="text-xs text-slate-400 hover:text-emerald-600 flex items-center gap-1 font-bold transition-colors"
                            >
                                <RefreshCw className="size-3" /> Regenerate
                            </button>
                        </div>
                        {/* Overall progress bar */}
                        <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                                style={{ width: `${overallProgress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Day Cards */}
            <div className="flex-1 px-4 sm:px-6 py-6">
                <div className="max-w-4xl mx-auto space-y-3">
                    {plan.days.map((day) => (
                        <DayCard
                            key={day.day_number}
                            day={day}
                            completedTasks={completedTasks}
                            onToggleTask={toggleTask}
                            isExpanded={expandedDays.has(day.day_number)}
                            onToggleExpand={() => toggleDay(day.day_number)}
                        />
                    ))}
                </div>

                {/* Review Section */}
                <div className="max-w-4xl mx-auto mt-8">
                    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 p-5 sm:p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                            <Stethoscope className="size-5 text-emerald-600" />
                            Treatment Review
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                            After completing your treatment period, get an AI review of your progress.
                        </p>

                        {/* Feedback Input */}
                        <div className="mb-4">
                            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                                How are you feeling? (optional)
                            </label>
                            <textarea
                                value={userFeedback}
                                onChange={(e) => setUserFeedback(e.target.value)}
                                placeholder="Describe any changes in your condition... e.g. 'The acne has reduced', 'Still seeing symptoms', etc."
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none shadow-sm"
                                rows={3}
                            />
                        </div>

                        <button
                            onClick={handleReview}
                            disabled={isReviewing}
                            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                        >
                            {isReviewing ? (
                                <>
                                    <RefreshCw className="size-4 animate-spin" />
                                    Reviewing...
                                </>
                            ) : (
                                <>
                                    <TrendingUp className="size-4" />
                                    Review My Progress
                                </>
                            )}
                        </button>

                        {/* Review Result */}
                        {review && (
                            <div className="mt-5">
                                <ReviewCard review={review} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="max-w-4xl mx-auto mt-4">
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
                            <span>{error}</span>
                            <button onClick={() => setError(null)} className="font-bold ml-2">×</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TreatmentPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center">
                <span className="text-gray-400">Loading...</span>
            </div>
        }>
            <TreatmentPageContent />
        </Suspense>
    );
}
