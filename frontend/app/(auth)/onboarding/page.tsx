'use client';

import React from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useUser } from '@/context/UserContext';

// ─── Condition options for Step 3 ────────────────────────────
const CONDITIONS = [
    'Diabetes',
    'PCOS',
    'Thyroid Disorder',
    'Hypertension',
    'Back Pain',
    'Knee Pain',
    'Injury History',
    'Surgery History',
];

// ─── Reusable Input Component ────────────────────────────────
function FormInput({
    label,
    value,
    onChange,
    type = 'text',
    placeholder = '',
    error,
    required = false,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
    error?: string;
    required?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#a8b2d1]">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full rounded-xl border bg-[#0d1f3c]/60 px-4 py-3 text-sm text-white placeholder-[#4a5f80] outline-none transition-all duration-200 focus:ring-2 ${error
                    ? 'border-red-400/60 focus:ring-red-400/30'
                    : 'border-[#1e3a5f] focus:border-[#52d677]/50 focus:ring-[#52d677]/20'
                    }`}
            />
            {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
    );
}

// ─── Progress Bar ────────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
    const steps = [
        { num: 1, label: 'Basic Profile' },
        { num: 2, label: 'Health & Diet' },
        { num: 3, label: 'Medical History' },
    ];

    return (
        <div className="mx-auto mb-10 flex max-w-lg items-center justify-between">
            {steps.map((s, i) => (
                <React.Fragment key={s.num}>
                    <div className="flex flex-col items-center gap-1.5">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300 ${step >= s.num
                                ? 'border-[#52d677] bg-[#52d677]/20 text-[#52d677] shadow-[0_0_15px_rgba(82,214,119,0.25)]'
                                : 'border-[#1e3a5f] bg-[#0d1f3c] text-[#4a5f80]'
                                }`}
                        >
                            {step > s.num ? (
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                s.num
                            )}
                        </div>
                        <span
                            className={`text-xs font-medium transition-colors ${step >= s.num ? 'text-[#52d677]' : 'text-[#4a5f80]'
                                }`}
                        >
                            {s.label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className="mx-2 mb-5 h-0.5 flex-1">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${step > s.num ? 'bg-[#52d677]' : 'bg-[#1e3a5f]'
                                    }`}
                            />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

// ─── Step 1: Basic Profile ───────────────────────────────────
function Step1({ formData, updateField, errors }: {
    formData: ReturnType<typeof useOnboarding>['formData'];
    updateField: ReturnType<typeof useOnboarding>['updateField'];
    errors: Record<string, string>;
}) {
    return (
        <div className="animate-wellness-slide-up space-y-5">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-white">👤 Basic Profile</h2>
                <p className="mt-1 text-sm text-[#a8b2d1]">Tell us about yourself to personalize your wellness journey.</p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormInput
                    label="Full Name"
                    value={formData.basic_profile.full_name}
                    onChange={(v) => updateField('basic_profile', 'full_name', v)}
                    placeholder="Enter your full name"
                    error={errors['basic_profile.full_name']}
                    required
                />
                <FormInput
                    label="Age"
                    value={formData.basic_profile.age}
                    onChange={(v) => updateField('basic_profile', 'age', v)}
                    type="number"
                    placeholder="e.g. 25"
                    error={errors['basic_profile.age']}
                    required
                />
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#a8b2d1]">
                    Gender <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                    {['Male', 'Female', 'Other'].map((g) => (
                        <button
                            key={g}
                            type="button"
                            onClick={() => updateField('basic_profile', 'gender', g.toLowerCase())}
                            className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${formData.basic_profile.gender === g.toLowerCase()
                                ? 'border-[#52d677] bg-[#52d677]/15 text-[#52d677] shadow-[0_0_10px_rgba(82,214,119,0.15)]'
                                : 'border-[#1e3a5f] bg-[#0d1f3c]/60 text-[#a8b2d1] hover:border-[#52d677]/30'
                                }`}
                        >
                            {g}
                        </button>
                    ))}
                </div>
                {errors['basic_profile.gender'] && (
                    <span className="text-xs text-red-400">{errors['basic_profile.gender']}</span>
                )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormInput
                    label="Height (cm)"
                    value={formData.basic_profile.height}
                    onChange={(v) => updateField('basic_profile', 'height', v)}
                    type="number"
                    placeholder="e.g. 170"
                />
                <FormInput
                    label="Weight (kg)"
                    value={formData.basic_profile.weight}
                    onChange={(v) => updateField('basic_profile', 'weight', v)}
                    type="number"
                    placeholder="e.g. 65"
                />
                <FormInput
                    label="Location"
                    value={formData.basic_profile.location}
                    onChange={(v) => updateField('basic_profile', 'location', v)}
                    placeholder="e.g. New Delhi"
                />
                <FormInput
                    label="Occupation"
                    value={formData.basic_profile.occupation}
                    onChange={(v) => updateField('basic_profile', 'occupation', v)}
                    placeholder="e.g. Software Engineer"
                />
            </div>

            {/* Activity Level */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#a8b2d1]">Daily Activity Level</label>
                <div className="flex flex-wrap gap-3">
                    {[
                        { value: 'sedentary', label: '🪑 Sedentary', desc: 'Little or no exercise' },
                        { value: 'moderate', label: '🚶 Moderate', desc: 'Light exercise 3-5 days' },
                        { value: 'active', label: '🏃 Active', desc: 'Intense exercise 6-7 days' },
                    ].map((a) => (
                        <button
                            key={a.value}
                            type="button"
                            onClick={() => updateField('basic_profile', 'activity_level', a.value)}
                            className={`flex flex-col items-start rounded-xl border px-4 py-3 text-left transition-all duration-200 ${formData.basic_profile.activity_level === a.value
                                ? 'border-[#52d677] bg-[#52d677]/15 shadow-[0_0_10px_rgba(82,214,119,0.15)]'
                                : 'border-[#1e3a5f] bg-[#0d1f3c]/60 hover:border-[#52d677]/30'
                                }`}
                        >
                            <span className={`text-sm font-medium ${formData.basic_profile.activity_level === a.value ? 'text-[#52d677]' : 'text-white'
                                }`}>
                                {a.label}
                            </span>
                            <span className="text-xs text-[#4a5f80]">{a.desc}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Step 2: Health Metrics + Diet ───────────────────────────
function Step2({ formData, updateField }: {
    formData: ReturnType<typeof useOnboarding>['formData'];
    updateField: ReturnType<typeof useOnboarding>['updateField'];
}) {
    return (
        <div className="animate-wellness-slide-up space-y-8">
            {/* Health Metrics */}
            <div>
                <h2 className="text-xl font-bold text-white">🩺 Health Metrics</h2>
                <p className="mt-1 text-sm text-[#a8b2d1]">Share your vital stats for a personalized health analysis.</p>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FormInput
                        label="Blood Pressure"
                        value={formData.health_metrics.blood_pressure}
                        onChange={(v) => updateField('health_metrics', 'blood_pressure', v)}
                        placeholder="e.g. 120/80 mmHg"
                    />
                    <FormInput
                        label="Blood Sugar (Fasting)"
                        value={formData.health_metrics.blood_sugar_fasting}
                        onChange={(v) => updateField('health_metrics', 'blood_sugar_fasting', v)}
                        placeholder="e.g. 90 mg/dL"
                    />
                    <FormInput
                        label="Blood Sugar (Post-meal)"
                        value={formData.health_metrics.blood_sugar_post_meal}
                        onChange={(v) => updateField('health_metrics', 'blood_sugar_post_meal', v)}
                        placeholder="e.g. 140 mg/dL"
                    />
                    <FormInput
                        label="Cholesterol"
                        value={formData.health_metrics.cholesterol}
                        onChange={(v) => updateField('health_metrics', 'cholesterol', v)}
                        placeholder="e.g. 200 mg/dL"
                    />
                    <FormInput
                        label="Thyroid Levels (optional)"
                        value={formData.health_metrics.thyroid_levels}
                        onChange={(v) => updateField('health_metrics', 'thyroid_levels', v)}
                        placeholder="e.g. TSH 2.5 mIU/L"
                    />
                    <FormInput
                        label="Heart Rate"
                        value={formData.health_metrics.heart_rate}
                        onChange={(v) => updateField('health_metrics', 'heart_rate', v)}
                        placeholder="e.g. 72 bpm"
                    />
                    <FormInput
                        label="Sleep Duration"
                        value={formData.health_metrics.sleep_duration}
                        onChange={(v) => updateField('health_metrics', 'sleep_duration', v)}
                        placeholder="e.g. 7 hours"
                    />
                </div>

                {/* Stress Slider */}
                <div className="mt-5 flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#a8b2d1]">
                        Stress Level: <span className="text-[#52d677] font-bold">{formData.health_metrics.stress_level}/10</span>
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={10}
                        value={formData.health_metrics.stress_level}
                        onChange={(e) => updateField('health_metrics', 'stress_level', parseInt(e.target.value, 10))}
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#1e3a5f] accent-[#52d677]"
                    />
                    <div className="flex justify-between text-xs text-[#4a5f80]">
                        <span>Low</span>
                        <span>High</span>
                    </div>
                </div>
            </div>

            {/* Diet Information */}
            <div>
                <h2 className="text-xl font-bold text-white">🥗 Diet Information</h2>
                <p className="mt-1 text-sm text-[#a8b2d1]">Help us understand your dietary habits and preferences.</p>

                {/* Diet Type */}
                <div className="mt-5 flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#a8b2d1]">Diet Type</label>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { value: 'vegetarian', label: '🥬 Vegetarian' },
                            { value: 'non-veg', label: '🍗 Non-Veg' },
                            { value: 'vegan', label: '🌱 Vegan' },
                        ].map((d) => (
                            <button
                                key={d.value}
                                type="button"
                                onClick={() => updateField('diet_info', 'diet_type', d.value)}
                                className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${formData.diet_info.diet_type === d.value
                                    ? 'border-[#52d677] bg-[#52d677]/15 text-[#52d677] shadow-[0_0_10px_rgba(82,214,119,0.15)]'
                                    : 'border-[#1e3a5f] bg-[#0d1f3c]/60 text-[#a8b2d1] hover:border-[#52d677]/30'
                                    }`}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FormInput
                        label="Food Allergies"
                        value={formData.diet_info.food_allergies}
                        onChange={(v) => updateField('diet_info', 'food_allergies', v)}
                        placeholder="e.g. Nuts, Dairy"
                    />
                    <FormInput
                        label="Daily Water Intake"
                        value={formData.diet_info.daily_water_intake}
                        onChange={(v) => updateField('diet_info', 'daily_water_intake', v)}
                        placeholder="e.g. 3 liters"
                    />
                    <FormInput
                        label="Current Diet Pattern"
                        value={formData.diet_info.current_diet_pattern}
                        onChange={(v) => updateField('diet_info', 'current_diet_pattern', v)}
                        placeholder="e.g. Balanced / High-protein"
                    />
                    <FormInput
                        label="Cheat Meal Frequency"
                        value={formData.diet_info.cheat_meal_frequency}
                        onChange={(v) => updateField('diet_info', 'cheat_meal_frequency', v)}
                        placeholder="e.g. Once a week"
                    />
                </div>

                <div className="mt-4">
                    <FormInput
                        label="Supplements"
                        value={formData.diet_info.supplements}
                        onChange={(v) => updateField('diet_info', 'supplements', v)}
                        placeholder="e.g. Creatine, Protein, Multivitamins"
                    />
                </div>
            </div>
        </div>
    );
}

// ─── Step 3: Medical History ─────────────────────────────────
function Step3({ formData, toggleCondition, updateField, errors }: {
    formData: ReturnType<typeof useOnboarding>['formData'];
    toggleCondition: (c: string) => void;
    updateField: ReturnType<typeof useOnboarding>['updateField'];
    errors: Record<string, string>;
}) {
    return (
        <div className="animate-wellness-slide-up space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white">🏥 Medical History</h2>
                <p className="mt-1 text-sm text-[#a8b2d1]">Select any conditions that apply. Your data is stored securely.</p>
            </div>

            {/* Conditions Grid */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {CONDITIONS.map((condition) => {
                    const isSelected = formData.medical_history.conditions.includes(condition);
                    return (
                        <button
                            key={condition}
                            type="button"
                            onClick={() => toggleCondition(condition)}
                            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${isSelected
                                ? 'border-[#52d677] bg-[#52d677]/15 text-[#52d677] shadow-[0_0_10px_rgba(82,214,119,0.15)]'
                                : 'border-[#1e3a5f] bg-[#0d1f3c]/60 text-[#a8b2d1] hover:border-[#52d677]/30'
                                }`}
                        >
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${isSelected
                                ? 'border-[#52d677] bg-[#52d677]'
                                : 'border-[#1e3a5f] bg-transparent'
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

            {/* Additional Notes */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#a8b2d1]">Injury Details (if any)</label>
                    <textarea
                        value={formData.medical_history.injury_history}
                        onChange={(e) => updateField('medical_history', 'injury_history', e.target.value)}
                        placeholder="Describe any past injuries..."
                        rows={3}
                        className="w-full rounded-xl border border-[#1e3a5f] bg-[#0d1f3c]/60 px-4 py-3 text-sm text-white placeholder-[#4a5f80] outline-none transition-all duration-200 focus:border-[#52d677]/50 focus:ring-2 focus:ring-[#52d677]/20"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#a8b2d1]">Surgery History (if any)</label>
                    <textarea
                        value={formData.medical_history.surgery_history}
                        onChange={(e) => updateField('medical_history', 'surgery_history', e.target.value)}
                        placeholder="Describe any past surgeries..."
                        rows={3}
                        className="w-full rounded-xl border border-[#1e3a5f] bg-[#0d1f3c]/60 px-4 py-3 text-sm text-white placeholder-[#4a5f80] outline-none transition-all duration-200 focus:border-[#52d677]/50 focus:ring-2 focus:ring-[#52d677]/20"
                    />
                </div>
            </div>

            {/* Consent Checkbox */}
            <div className="rounded-xl border border-[#1e3a5f] bg-[#0a1525]/80 p-5">
                <label className="flex cursor-pointer items-start gap-3">
                    <div className="pt-0.5">
                        <button
                            type="button"
                            onClick={() => updateField('medical_history', 'consent', !formData.medical_history.consent)}
                            className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${formData.medical_history.consent
                                ? 'border-[#52d677] bg-[#52d677]'
                                : 'border-[#4a5f80] bg-transparent'
                                }`}
                        >
                            {formData.medical_history.consent && (
                                <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <span className="text-sm text-[#a8b2d1]">
                        I consent to the secure storage of my health data. My data will be stored securely
                        and used only for personalized health recommendations.{' '}
                        <span className="text-[#52d677] underline">Privacy Policy</span>
                    </span>
                </label>
                {errors['medical_history.consent'] && (
                    <span className="mt-2 block text-xs text-red-400">{errors['medical_history.consent']}</span>
                )}
            </div>
        </div>
    );
}

// ─── Success Screen ──────────────────────────────────────────
function SuccessScreen() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-wellness-slide-up">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#52d677]/20 shadow-[0_0_30px_rgba(82,214,119,0.3)]">
                <svg className="h-10 w-10 text-[#52d677]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Profile Saved Securely!</h2>
            <p className="mt-3 max-w-md text-sm text-[#a8b2d1]">
                Your health data has been stored securely.
                Our AI will now use anonymized insights to personalize your wellness journey.
            </p>
            <a
                href="/dashboard"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#52d677] to-[#3bb85c] px-6 py-3 text-sm font-semibold text-[#0a192f] shadow-[0_0_20px_rgba(82,214,119,0.3)] transition-all duration-200 hover:shadow-[0_0_30px_rgba(82,214,119,0.5)]"
            >
                Go to Dashboard
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </a>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function OnboardingPage() {
    const { isAuthenticated, isLoading: authLoading } = useUser();
    const {
        step,
        formData,
        errors,
        isSubmitting,
        submitSuccess,
        submitError,
        updateField,
        toggleCondition,
        nextStep,
        prevStep,
        submitForm,
    } = useOnboarding();

    // Auth guard
    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0a192f]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#52d677] border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a192f] px-4">
                <div className="rounded-2xl border border-[#1e3a5f] bg-[#0d1f3c]/80 p-10 text-center backdrop-blur-sm">
                    <h2 className="text-xl font-bold text-white">Sign In Required</h2>
                    <p className="mt-2 text-sm text-[#a8b2d1]">Please sign in to continue with onboarding.</p>
                    <a
                        href="/auth/login"
                        className="mt-6 inline-block rounded-xl bg-gradient-to-r from-[#52d677] to-[#3bb85c] px-6 py-3 text-sm font-semibold text-[#0a192f] transition-all hover:shadow-[0_0_20px_rgba(82,214,119,0.3)]"
                    >
                        Sign In
                    </a>
                </div>
            </div>
        );
    }

    if (submitSuccess) {
        return (
            <div className="min-h-screen bg-[#0a192f]">
                <div className="mx-auto max-w-2xl px-4 py-12">
                    <SuccessScreen />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a192f]">
            {/* Decorative Orbs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-[#52d677]/5 blur-3xl animate-float-slow" />
                <div className="absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-[#4285f4]/5 blur-3xl animate-float-medium" />
                <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#52d677]/5 blur-3xl animate-float-gentle" />
            </div>

            <div className="relative mx-auto max-w-2xl px-4 py-12">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white">
                        <span className="bg-gradient-to-r from-[#52d677] to-[#4285f4] bg-clip-text text-transparent">
                            Health Onboarding
                        </span>
                    </h1>
                    <p className="mt-2 text-sm text-[#a8b2d1]">
                        Complete your health profile to unlock personalized Ayurvedic recommendations.
                    </p>
                </div>

                {/* Progress */}
                <ProgressBar step={step} />

                {/* Form Card */}
                <div className="rounded-2xl border border-[#1e3a5f]/60 bg-[#0d1f3c]/50 p-6 shadow-xl backdrop-blur-sm md:p-8">
                    {step === 1 && <Step1 formData={formData} updateField={updateField} errors={errors} />}
                    {step === 2 && <Step2 formData={formData} updateField={updateField} />}
                    {step === 3 && (
                        <Step3
                            formData={formData}
                            toggleCondition={toggleCondition}
                            updateField={updateField}
                            errors={errors}
                        />
                    )}

                    {/* Submit Error */}
                    {submitError && (
                        <div className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
                            {submitError}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-8 flex items-center justify-between">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="flex items-center gap-2 rounded-xl border border-[#1e3a5f] bg-[#0d1f3c]/60 px-5 py-2.5 text-sm font-medium text-[#a8b2d1] transition-all hover:border-[#52d677]/30 hover:text-white"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#52d677] to-[#3bb85c] px-6 py-2.5 text-sm font-semibold text-[#0a192f] shadow-[0_0_15px_rgba(82,214,119,0.2)] transition-all hover:shadow-[0_0_25px_rgba(82,214,119,0.4)]"
                            >
                                Next Step
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={submitForm}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#52d677] to-[#3bb85c] px-6 py-2.5 text-sm font-semibold text-[#0a192f] shadow-[0_0_15px_rgba(82,214,119,0.2)] transition-all hover:shadow-[0_0_25px_rgba(82,214,119,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0a192f] border-t-transparent" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Save Profile Securely
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#4a5f80]">
                    <svg className="h-4 w-4 text-[#52d677]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>🔒 Your data is stored securely</span>
                </div>

                {/* Privacy Note */}
                <p className="mt-3 text-center text-[10px] text-[#3a4a65]">
                    Your health data is stored securely. Only anonymized, non-identifiable insights are used for AI recommendations.
                    Raw data is never shared with third parties.
                </p>
            </div>
        </div>
    );
}
