'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    User, Heart, Activity, Loader2, ArrowLeft, Edit3, CheckCircle2,
    Ruler, Weight, MapPin, Briefcase, Zap, Droplets, Moon,
    Brain, UtensilsCrossed, Pill, AlertTriangle, ChevronRight,
    ChevronLeft, Shield, Lock
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';

const HealthStatsCharts = dynamic(() => import('@/components/profile/HealthStatsCharts'), { ssr: false });

// ─── Types ───────────────────────────────────────────────────
interface ProfileData {
    basic_profile: {
        full_name: string;
        age: number;
        gender: string;
        height: number | null;
        weight: number | null;
        location: string;
        occupation: string;
        activity_level: string;
    };
    health_metrics: {
        blood_pressure: string;
        blood_sugar_fasting: string;
        blood_sugar_post_meal: string;
        cholesterol: string;
        thyroid_levels: string;
        heart_rate: string;
        sleep_duration: string;
        stress_level: number;
    };
    diet_info: {
        diet_type: string;
        food_allergies: string;
        daily_water_intake: string;
        current_diet_pattern: string;
        cheat_meal_frequency: string;
        supplements: string;
    };
    medical_history: {
        conditions: string[];
        injury_history: string;
        surgery_history: string;
        consent: boolean;
    };
}

// ─── Conditions list ─────────────────────────────────────────
const CONDITIONS = [
    'Diabetes', 'PCOS', 'Thyroid Disorder', 'Hypertension',
    'Back Pain', 'Knee Pain', 'Injury History', 'Surgery History',
];

// ─── Reusable form input ─────────────────────────────────────
function FormInput({
    label, value, onChange, type = 'text', placeholder = '', error, required = false,
}: {
    label: string; value: string; onChange: (v: string) => void;
    type?: string; placeholder?: string; error?: string; required?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-600">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 ${error
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-200 focus:border-emerald-400 focus:ring-emerald-100'
                    }`}
            />
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
}

// ─── Info card for display mode ──────────────────────────────
function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number | null | undefined }) {
    if (!value && value !== 0) return null;
    return (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors">
            <div className="size-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{String(value)}</p>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// PROFILE DISPLAY COMPONENT
// ═══════════════════════════════════════════════════════════════
function ProfileDisplay({ profile, onEdit }: { profile: ProfileData; onEdit: () => void }) {
    const bp = profile.basic_profile;
    const hm = profile.health_metrics;
    const di = profile.diet_info;
    const mh = profile.medical_history;

    const activityLabel = bp.activity_level === 'sedentary' ? '🪑 Sedentary'
        : bp.activity_level === 'active' ? '🏃 Active' : '🚶 Moderate';

    const dietLabel = di.diet_type === 'vegetarian' ? '🥬 Vegetarian'
        : di.diet_type === 'vegan' ? '🌱 Vegan'
            : di.diet_type === 'non-veg' ? '🍗 Non-Veg' : di.diet_type || '—';

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Health Stats Charts */}
            <HealthStatsCharts profile={profile} />

            {/* Header Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 p-6 sm:p-8 text-white shadow-xl">
                <div className="absolute -right-16 -top-16 size-48 rounded-full bg-white/5 blur-2xl" />
                <div className="absolute -left-10 -bottom-10 size-40 rounded-full bg-white/5 blur-2xl" />
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="size-16 sm:size-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold shadow-lg">
                            {bp.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">{bp.full_name}</h1>
                            <p className="text-emerald-100 text-sm mt-1">
                                {bp.age} years • {bp.gender?.charAt(0).toUpperCase() + bp.gender?.slice(1)} • {bp.location || 'Location not set'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onEdit}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl transition-all font-medium text-sm border border-white/20"
                    >
                        <Edit3 className="size-4" />
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <User className="size-5 text-emerald-600" />
                        <h2 className="font-bold text-gray-800">Basic Information</h2>
                    </div>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoItem icon={<User className="size-4" />} label="Full Name" value={bp.full_name} />
                    <InfoItem icon={<Activity className="size-4" />} label="Age" value={`${bp.age} years`} />
                    <InfoItem icon={<Ruler className="size-4" />} label="Height" value={bp.height ? `${bp.height} cm` : null} />
                    <InfoItem icon={<Weight className="size-4" />} label="Weight" value={bp.weight ? `${bp.weight} kg` : null} />
                    <InfoItem icon={<MapPin className="size-4" />} label="Location" value={bp.location} />
                    <InfoItem icon={<Briefcase className="size-4" />} label="Occupation" value={bp.occupation} />
                    <InfoItem icon={<Zap className="size-4" />} label="Activity Level" value={activityLabel} />
                </div>
            </div>

            {/* Health Metrics */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Heart className="size-5 text-rose-500" />
                        <h2 className="font-bold text-gray-800">Health Metrics</h2>
                    </div>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoItem icon={<Heart className="size-4" />} label="Blood Pressure" value={hm.blood_pressure} />
                    <InfoItem icon={<Droplets className="size-4" />} label="Blood Sugar (Fasting)" value={hm.blood_sugar_fasting} />
                    <InfoItem icon={<Droplets className="size-4" />} label="Blood Sugar (Post-meal)" value={hm.blood_sugar_post_meal} />
                    <InfoItem icon={<Activity className="size-4" />} label="Cholesterol" value={hm.cholesterol} />
                    <InfoItem icon={<Activity className="size-4" />} label="Thyroid Levels" value={hm.thyroid_levels} />
                    <InfoItem icon={<Heart className="size-4" />} label="Heart Rate" value={hm.heart_rate} />
                    <InfoItem icon={<Moon className="size-4" />} label="Sleep Duration" value={hm.sleep_duration} />
                    {hm.stress_level && (
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80">
                            <div className="size-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                                <Brain className="size-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stress Level</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-400"
                                            style={{ width: `${(hm.stress_level / 10) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">{hm.stress_level}/10</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Diet Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <UtensilsCrossed className="size-5 text-amber-600" />
                        <h2 className="font-bold text-gray-800">Diet Information</h2>
                    </div>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoItem icon={<UtensilsCrossed className="size-4" />} label="Diet Type" value={dietLabel} />
                    <InfoItem icon={<AlertTriangle className="size-4" />} label="Food Allergies" value={di.food_allergies} />
                    <InfoItem icon={<Droplets className="size-4" />} label="Daily Water Intake" value={di.daily_water_intake} />
                    <InfoItem icon={<UtensilsCrossed className="size-4" />} label="Diet Pattern" value={di.current_diet_pattern} />
                    <InfoItem icon={<UtensilsCrossed className="size-4" />} label="Cheat Meal Frequency" value={di.cheat_meal_frequency} />
                    <InfoItem icon={<Pill className="size-4" />} label="Supplements" value={di.supplements} />
                </div>
            </div>

            {/* Medical History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Shield className="size-5 text-purple-600" />
                        <h2 className="font-bold text-gray-800">Medical History</h2>
                    </div>
                </div>
                <div className="p-5 space-y-4">
                    {mh.conditions.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Conditions</p>
                            <div className="flex flex-wrap gap-2">
                                {mh.conditions.map((c) => (
                                    <span key={c} className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-sm font-medium border border-purple-200">
                                        {c}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InfoItem icon={<AlertTriangle className="size-4" />} label="Injury History" value={mh.injury_history} />
                        <InfoItem icon={<Pill className="size-4" />} label="Surgery History" value={mh.surgery_history} />
                    </div>
                </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pb-4">
                <Lock className="size-3.5 text-emerald-500" />
                <span>🔒 Your data is stored securely</span>
            </div>
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════
// ONBOARDING FORM COMPONENT (embedded in profile page)
// ═══════════════════════════════════════════════════════════════
function OnboardingForm({ onSuccess }: { onSuccess: () => void }) {
    const {
        step, formData, errors, isSubmitting, submitSuccess, submitError,
        updateField, toggleCondition, nextStep, prevStep, submitForm,
    } = useOnboarding();

    useEffect(() => {
        if (submitSuccess) onSuccess();
    }, [submitSuccess, onSuccess]);

    // Progress bar
    const steps = [
        { num: 1, label: 'Basic Profile' },
        { num: 2, label: 'Health & Diet' },
        { num: 3, label: 'Medical History' },
    ];

    return (
        <div className="space-y-8">
            {/* Progress */}
            <div className="mx-auto mb-6 flex max-w-lg items-center justify-between">
                {steps.map((s, i) => (
                    <React.Fragment key={s.num}>
                        <div className="flex flex-col items-center gap-1.5">
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300 ${step >= s.num
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm'
                                    : 'border-gray-200 bg-white text-gray-400'
                                    }`}
                            >
                                {step > s.num ? (
                                    <CheckCircle2 className="size-5 text-emerald-500" />
                                ) : s.num}
                            </div>
                            <span className={`text-xs font-medium transition-colors ${step >= s.num ? 'text-emerald-600' : 'text-gray-400'}`}>
                                {s.label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className="mx-2 mb-5 h-0.5 flex-1">
                                <div className={`h-full rounded-full transition-all duration-500 ${step > s.num ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                {/* Step 1: Basic Profile */}
                {step === 1 && (
                    <div className="space-y-5">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800">👤 Basic Profile</h2>
                            <p className="mt-1 text-sm text-gray-500">Tell us about yourself to personalize your wellness journey.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <FormInput label="Full Name" value={formData.basic_profile.full_name} onChange={(v) => updateField('basic_profile', 'full_name', v)} placeholder="Enter your full name" error={errors['basic_profile.full_name']} required />
                            <FormInput label="Age" value={formData.basic_profile.age} onChange={(v) => updateField('basic_profile', 'age', v)} type="number" placeholder="e.g. 25" error={errors['basic_profile.age']} required />
                        </div>

                        {/* Gender */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Gender <span className="text-red-400">*</span></label>
                            <div className="flex flex-wrap gap-3">
                                {['Male', 'Female', 'Other'].map((g) => (
                                    <button key={g} type="button" onClick={() => updateField('basic_profile', 'gender', g.toLowerCase())}
                                        className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${formData.basic_profile.gender === g.toLowerCase()
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                                            }`}
                                    >{g}</button>
                                ))}
                            </div>
                            {errors['basic_profile.gender'] && <span className="text-xs text-red-500">{errors['basic_profile.gender']}</span>}
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <FormInput label="Height (cm)" value={formData.basic_profile.height} onChange={(v) => updateField('basic_profile', 'height', v)} type="number" placeholder="e.g. 170" />
                            <FormInput label="Weight (kg)" value={formData.basic_profile.weight} onChange={(v) => updateField('basic_profile', 'weight', v)} type="number" placeholder="e.g. 65" />
                            <FormInput label="Location" value={formData.basic_profile.location} onChange={(v) => updateField('basic_profile', 'location', v)} placeholder="e.g. New Delhi" />
                            <FormInput label="Occupation" value={formData.basic_profile.occupation} onChange={(v) => updateField('basic_profile', 'occupation', v)} placeholder="e.g. Software Engineer" />
                        </div>

                        {/* Activity Level */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Daily Activity Level</label>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { value: 'sedentary', label: '🪑 Sedentary', desc: 'Little or no exercise' },
                                    { value: 'moderate', label: '🚶 Moderate', desc: 'Light exercise 3-5 days' },
                                    { value: 'active', label: '🏃 Active', desc: 'Intense exercise 6-7 days' },
                                ].map((a) => (
                                    <button key={a.value} type="button" onClick={() => updateField('basic_profile', 'activity_level', a.value)}
                                        className={`flex flex-col items-start rounded-xl border px-4 py-3 text-left transition-all duration-200 ${formData.basic_profile.activity_level === a.value
                                            ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                                            : 'border-gray-200 bg-white hover:border-emerald-300'
                                            }`}
                                    >
                                        <span className={`text-sm font-medium ${formData.basic_profile.activity_level === a.value ? 'text-emerald-700' : 'text-gray-700'}`}>{a.label}</span>
                                        <span className="text-xs text-gray-400">{a.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Health & Diet */}
                {step === 2 && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">🩺 Health Metrics</h2>
                            <p className="mt-1 text-sm text-gray-500">Share your vital stats for a personalized health analysis.</p>
                            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                                <FormInput label="Blood Pressure" value={formData.health_metrics.blood_pressure} onChange={(v) => updateField('health_metrics', 'blood_pressure', v)} placeholder="e.g. 120/80 mmHg" />
                                <FormInput label="Blood Sugar (Fasting)" value={formData.health_metrics.blood_sugar_fasting} onChange={(v) => updateField('health_metrics', 'blood_sugar_fasting', v)} placeholder="e.g. 90 mg/dL" />
                                <FormInput label="Blood Sugar (Post-meal)" value={formData.health_metrics.blood_sugar_post_meal} onChange={(v) => updateField('health_metrics', 'blood_sugar_post_meal', v)} placeholder="e.g. 140 mg/dL" />
                                <FormInput label="Cholesterol" value={formData.health_metrics.cholesterol} onChange={(v) => updateField('health_metrics', 'cholesterol', v)} placeholder="e.g. 200 mg/dL" />
                                <FormInput label="Thyroid Levels (optional)" value={formData.health_metrics.thyroid_levels} onChange={(v) => updateField('health_metrics', 'thyroid_levels', v)} placeholder="e.g. TSH 2.5 mIU/L" />
                                <FormInput label="Heart Rate" value={formData.health_metrics.heart_rate} onChange={(v) => updateField('health_metrics', 'heart_rate', v)} placeholder="e.g. 72 bpm" />
                                <FormInput label="Sleep Duration" value={formData.health_metrics.sleep_duration} onChange={(v) => updateField('health_metrics', 'sleep_duration', v)} placeholder="e.g. 7 hours" />
                            </div>
                            <div className="mt-5 flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-600">
                                    Stress Level: <span className="text-emerald-600 font-bold">{formData.health_metrics.stress_level}/10</span>
                                </label>
                                <input type="range" min={1} max={10} value={formData.health_metrics.stress_level}
                                    onChange={(e) => updateField('health_metrics', 'stress_level', parseInt(e.target.value, 10))}
                                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-emerald-500"
                                />
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Low</span><span>High</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-800">🥗 Diet Information</h2>
                            <p className="mt-1 text-sm text-gray-500">Help us understand your dietary habits and preferences.</p>
                            <div className="mt-5 flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-600">Diet Type</label>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { value: 'vegetarian', label: '🥬 Vegetarian' },
                                        { value: 'non-veg', label: '🍗 Non-Veg' },
                                        { value: 'vegan', label: '🌱 Vegan' },
                                    ].map((d) => (
                                        <button key={d.value} type="button" onClick={() => updateField('diet_info', 'diet_type', d.value)}
                                            className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${formData.diet_info.diet_type === d.value
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                                                : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                                                }`}
                                        >{d.label}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                                <FormInput label="Food Allergies" value={formData.diet_info.food_allergies} onChange={(v) => updateField('diet_info', 'food_allergies', v)} placeholder="e.g. Nuts, Dairy" />
                                <FormInput label="Daily Water Intake" value={formData.diet_info.daily_water_intake} onChange={(v) => updateField('diet_info', 'daily_water_intake', v)} placeholder="e.g. 3 liters" />
                                <FormInput label="Current Diet Pattern" value={formData.diet_info.current_diet_pattern} onChange={(v) => updateField('diet_info', 'current_diet_pattern', v)} placeholder="e.g. Balanced / High-protein" />
                                <FormInput label="Cheat Meal Frequency" value={formData.diet_info.cheat_meal_frequency} onChange={(v) => updateField('diet_info', 'cheat_meal_frequency', v)} placeholder="e.g. Once a week" />
                            </div>
                            <div className="mt-4">
                                <FormInput label="Supplements" value={formData.diet_info.supplements} onChange={(v) => updateField('diet_info', 'supplements', v)} placeholder="e.g. Creatine, Protein, Multivitamins" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Medical History */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">🏥 Medical History</h2>
                            <p className="mt-1 text-sm text-gray-500">Select any conditions that apply. Your data is stored securely.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {CONDITIONS.map((condition) => {
                                const isSelected = formData.medical_history.conditions.includes(condition);
                                return (
                                    <button key={condition} type="button" onClick={() => toggleCondition(condition)}
                                        className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${isSelected
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                                            }`}
                                    >
                                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${isSelected
                                            ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 bg-transparent'
                                            }`}>
                                            {isSelected && (
                                                <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </span>
                                        {condition}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-600">Injury Details (if any)</label>
                                <textarea value={formData.medical_history.injury_history}
                                    onChange={(e) => updateField('medical_history', 'injury_history', e.target.value)}
                                    placeholder="Describe any past injuries..." rows={3}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-600">Surgery History (if any)</label>
                                <textarea value={formData.medical_history.surgery_history}
                                    onChange={(e) => updateField('medical_history', 'surgery_history', e.target.value)}
                                    placeholder="Describe any past surgeries..." rows={3}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                />
                            </div>
                        </div>

                        {/* Consent */}
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <label className="flex cursor-pointer items-start gap-3">
                                <div className="pt-0.5">
                                    <button type="button" onClick={() => updateField('medical_history', 'consent', !formData.medical_history.consent)}
                                        className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${formData.medical_history.consent
                                            ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 bg-transparent'
                                            }`}
                                    >
                                        {formData.medical_history.consent && (
                                            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <span className="text-sm text-gray-600">
                                    I consent to the secure storage of my health data. My data will be stored securely
                                    and used only for personalized health recommendations.{' '}
                                    <span className="text-emerald-600 underline">Privacy Policy</span>
                                </span>
                            </label>
                            {errors['medical_history.consent'] && (
                                <span className="mt-2 block text-xs text-red-500">{errors['medical_history.consent']}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Submit Error */}
                {submitError && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                        {submitError}
                    </div>
                )}

                {/* Navigation */}
                <div className="mt-8 flex items-center justify-between">
                    {step > 1 ? (
                        <button type="button" onClick={prevStep}
                            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition-all hover:border-emerald-300 hover:text-gray-800"
                        >
                            <ChevronLeft className="size-4" /> Previous
                        </button>
                    ) : <div />}

                    {step < 3 ? (
                        <button type="button" onClick={nextStep}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:shadow-xl hover:shadow-emerald-300"
                        >
                            Next Step <ChevronRight className="size-4" />
                        </button>
                    ) : (
                        <button type="button" onClick={submitForm} disabled={isSubmitting}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:shadow-xl hover:shadow-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="size-4 animate-spin" /> Saving...</>
                            ) : (
                                <><Lock className="size-4" /> Save Profile Securely</>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pb-4">
                <Lock className="size-3.5 text-emerald-500" />
                <span>🔒 Your data is stored securely</span>
            </div>
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════
// MAIN PROFILE PAGE
// ═══════════════════════════════════════════════════════════════
export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useUser();
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [fetchError, setFetchError] = useState('');

    const fetchProfile = useCallback(async () => {
        setIsLoadingProfile(true);
        setFetchError('');
        try {
            if (!isSupabaseConfigured) {
                setIsLoadingProfile(false);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                setIsLoadingProfile(false);
                return;
            }

            const aiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(`${aiUrl}/api/onboarding/get-profile`, {
                headers: { Authorization: `Bearer ${session.access_token}` },
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (res.status === 401) {
                // Token is invalid/expired or from an old project. Clear stale session.
                try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                } catch (e) {
                    console.error('Failed to logout API', e);
                }
<<<<<<< HEAD:frontend/app/(main)/profile/page.tsx
                await supabase.auth.signOut();
                // window.location.href = '/auth/login';
=======
                if (isSupabaseConfigured) {
                    await supabase.auth.signOut();
                }
                window.location.href = '/auth/login';
>>>>>>> c265e37 (Make some changes):frontend/app/profile/page.tsx
                return;
            } else if (res.status === 404) {
                // No profile yet — show form
                setProfileData(null);
            } else if (res.ok) {
                const data = await res.json();
                setProfileData(data.profile);
            } else {
                const errData = await res.json().catch(() => ({}));
                setFetchError(errData.detail || 'Failed to load profile.');
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
            setFetchError('Could not connect to server. Showing form instead.');
        } finally {
            setIsLoadingProfile(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchProfile();
        } else if (!authLoading && !isAuthenticated) {
            setIsLoadingProfile(false);
        }
    }, [authLoading, isAuthenticated, fetchProfile]);

    // Auth guard
    if (authLoading || isLoadingProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50">
                <div className="text-center">
                    <Loader2 className="size-12 text-emerald-600 animate-spin mx-auto" />
                    <p className="mt-4 text-gray-500">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50 px-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm max-w-md">
                    <div className="size-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                        <User className="size-8 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Sign In Required</h2>
                    <p className="mt-2 text-sm text-gray-500">Please sign in to view or complete your health profile.</p>
                    <Link href="/auth/login"
                        className="mt-6 inline-block rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:shadow-xl"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    const showForm = !profileData || isEditing;

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50">
            {/* Page Header */}
            <div className="px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                            <User className="size-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {showForm ? 'Complete Your Health Profile' : 'My Health Profile'}
                            </h1>
                            <p className="text-gray-500 text-sm">
                                {showForm
                                    ? 'Fill in your details for personalized Ayurvedic recommendations'
                                    : 'Your health data at a glance'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-3xl mx-auto">
                    {fetchError && !showForm && (
                        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                            {fetchError}
                        </div>
                    )}

                    {showForm ? (
                        <OnboardingForm onSuccess={() => {
                            setIsEditing(false);
                            fetchProfile();
                        }} />
                    ) : (
                        <ProfileDisplay
                            profile={profileData!}
                            onEdit={() => setIsEditing(true)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
