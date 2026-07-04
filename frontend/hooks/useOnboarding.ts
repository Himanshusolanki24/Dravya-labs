'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSaveProfileMutation } from '@/hooks/useProfileQuery';

// ─── Types ───────────────────────────────────────────────────

export interface BasicProfile {
    full_name: string;
    age: string;
    gender: string;
    height: string;
    weight: string;
    location: string;
    occupation: string;
    activity_level: string;
}

export interface HealthMetrics {
    blood_pressure: string;
    blood_sugar_fasting: string;
    blood_sugar_post_meal: string;
    cholesterol: string;
    thyroid_levels: string;
    heart_rate: string;
    sleep_duration: string;
    stress_level: number;
}

export interface DietInfo {
    diet_type: string;
    food_allergies: string;
    daily_water_intake: string;
    current_diet_pattern: string;
    cheat_meal_frequency: string;
    supplements: string;
}

export interface MedicalHistory {
    conditions: string[];
    injury_history: string;
    surgery_history: string;
    consent: boolean;
}

export interface OnboardingFormData {
    basic_profile: BasicProfile;
    health_metrics: HealthMetrics;
    diet_info: DietInfo;
    medical_history: MedicalHistory;
}

type ValidationErrors = Record<string, string>;

// ─── Initial State ───────────────────────────────────────────

const initialState: OnboardingFormData = {
    basic_profile: {
        full_name: '',
        age: '',
        gender: '',
        height: '',
        weight: '',
        location: '',
        occupation: '',
        activity_level: 'moderate',
    },
    health_metrics: {
        blood_pressure: '',
        blood_sugar_fasting: '',
        blood_sugar_post_meal: '',
        cholesterol: '',
        thyroid_levels: '',
        heart_rate: '',
        sleep_duration: '',
        stress_level: 5,
    },
    diet_info: {
        diet_type: '',
        food_allergies: '',
        daily_water_intake: '',
        current_diet_pattern: '',
        cheat_meal_frequency: '',
        supplements: '',
    },
    medical_history: {
        conditions: [],
        injury_history: '',
        surgery_history: '',
        consent: false,
    },
};

// ─── Hook ────────────────────────────────────────────────────

export function useOnboarding() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<OnboardingFormData>(initialState);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const saveProfileMutation = useSaveProfileMutation();

    // Update a nested field
    const updateField = useCallback(
        <S extends keyof OnboardingFormData>(
            section: S,
            field: keyof OnboardingFormData[S],
            value: OnboardingFormData[S][keyof OnboardingFormData[S]]
        ) => {
            setFormData((prev) => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value,
                },
            }));
            // Clear field error when user types
            setErrors((prev) => {
                const key = `${section}.${String(field)}`;
                if (prev[key]) {
                    const next = { ...prev };
                    delete next[key];
                    return next;
                }
                return prev;
            });
        },
        []
    );

    // Toggle a condition in the medical history list
    const toggleCondition = useCallback((condition: string) => {
        setFormData((prev) => {
            const current = prev.medical_history.conditions;
            const next = current.includes(condition)
                ? current.filter((c) => c !== condition)
                : [...current, condition];
            return {
                ...prev,
                medical_history: { ...prev.medical_history, conditions: next },
            };
        });
    }, []);

    // Validation per step
    const validateStep = useCallback(
        (currentStep: number): boolean => {
            const errs: ValidationErrors = {};

            if (currentStep === 1) {
                if (!formData.basic_profile.full_name.trim())
                    errs['basic_profile.full_name'] = 'Full Name is required';
                if (!formData.basic_profile.age.trim())
                    errs['basic_profile.age'] = 'Age is required';
                else if (isNaN(Number(formData.basic_profile.age)) || Number(formData.basic_profile.age) < 1)
                    errs['basic_profile.age'] = 'Enter a valid age';
                if (!formData.basic_profile.gender)
                    errs['basic_profile.gender'] = 'Gender is required';
            }

            if (currentStep === 3) {
                if (!formData.medical_history.consent)
                    errs['medical_history.consent'] =
                        'You must consent to data storage to continue';
            }

            setErrors(errs);
            return Object.keys(errs).length === 0;
        },
        [formData]
    );

    const nextStep = useCallback(() => {
        if (validateStep(step)) {
            setStep((s) => Math.min(s + 1, 3));
        }
    }, [step, validateStep]);

    const prevStep = useCallback(() => {
        setStep((s) => Math.max(s - 1, 1));
    }, []);

    // Submit to backend
    const submitForm = useCallback(async () => {
        if (!validateStep(3)) return;

        setIsSubmitting(true);
        setSubmitError('');

        try {
            await saveProfileMutation.mutateAsync(formData);
            setSubmitSuccess(true);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred';
            setSubmitError(message);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, validateStep, saveProfileMutation]);

    return {
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
    };
}
