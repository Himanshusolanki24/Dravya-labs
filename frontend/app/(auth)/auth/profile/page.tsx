'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    User, MapPin, Calendar, LogOut, Loader2, CheckCircle,
    Heart, Sparkles, Leaf, Phone, Droplets, Ruler, Weight,
    Apple, Target, ChevronRight, Camera, Shield, ArrowRight,
    ImagePlus, X
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useLanguage } from '@/context/LanguageContext';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

// Health goals options
const HEALTH_GOALS = [
    { id: 'weight_loss', label: 'Weight Loss', labelHi: 'वजन घटाना', icon: '🏃' },
    { id: 'better_sleep', label: 'Better Sleep', labelHi: 'बेहतर नींद', icon: '😴' },
    { id: 'stress_relief', label: 'Stress Relief', labelHi: 'तनाव मुक्ति', icon: '🧘' },
    { id: 'immunity', label: 'Boost Immunity', labelHi: 'प्रतिरक्षा बढ़ाएं', icon: '💪' },
    { id: 'digestion', label: 'Better Digestion', labelHi: 'बेहतर पाचन', icon: '🍽️' },
    { id: 'energy', label: 'More Energy', labelHi: 'अधिक ऊर्जा', icon: '⚡' },
    { id: 'skin_health', label: 'Skin Health', labelHi: 'त्वचा स्वास्थ्य', icon: '✨' },
    { id: 'mental_clarity', label: 'Mental Clarity', labelHi: 'मानसिक स्पष्टता', icon: '🧠' },
];

// Dietary preferences
const DIETARY_OPTIONS = [
    { id: 'vegetarian', label: 'Vegetarian', labelHi: 'शाकाहारी' },
    { id: 'vegan', label: 'Vegan', labelHi: 'वीगन' },
    { id: 'non_vegetarian', label: 'Non-Vegetarian', labelHi: 'मांसाहारी' },
    { id: 'eggetarian', label: 'Eggetarian', labelHi: 'अंडा शाकाहारी' },
];

// Blood groups
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Dosha types
const DOSHA_TYPES = [
    { id: 'vata', label: 'Vata', labelHi: 'वात', color: 'from-blue-500 to-indigo-600', description: 'Air & Space' },
    { id: 'pitta', label: 'Pitta', labelHi: 'पित्त', color: 'from-amber-500 to-red-500', description: 'Fire & Water' },
    { id: 'kapha', label: 'Kapha', labelHi: 'कफ', color: 'from-emerald-500 to-teal-600', description: 'Earth & Water' },
    { id: 'vata_pitta', label: 'Vata-Pitta', labelHi: 'वात-पित्त', color: 'from-purple-500 to-pink-500', description: 'Mixed' },
];

export default function ProfilePage() {
    const router = useRouter();
    const { user, isLoading: userLoading, completeProfile, logout, isAuthenticated, updateProfile } = useUser();
    const { language } = useLanguage();

    // Form state - Profile Image
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Form state - Basic Info
    const [fullName, setFullName] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
    const [location, setLocation] = useState('');
    const [phone, setPhone] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [bio, setBio] = useState('');

    // Form state - Health Info
    const [bloodGroup, setBloodGroup] = useState('');
    const [heightCm, setHeightCm] = useState<number | ''>('');
    const [weightKg, setWeightKg] = useState<number | ''>('');
    const [dietaryPreference, setDietaryPreference] = useState('');
    const [doshaType, setDoshaType] = useState('');
    const [healthGoals, setHealthGoals] = useState<string[]>([]);

    // UI State
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');

    // Redirect if not authenticated — with delay to allow OAuth session to sync
    useEffect(() => {
        if (userLoading) return; // Still loading, don't redirect yet

        // If already authenticated via UserContext, great — stay here
        if (isAuthenticated) return;

        // Give the auth state a moment to sync (OAuth callback race condition)
        const timer = setTimeout(async () => {
            if (!isSupabaseConfigured) {
                router.push('/auth/login');
                return;
            }

            // Double-check with Supabase directly before redirecting
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/auth/login');
            }
            // If session exists, UserContext's onAuthStateChange will catch up
        }, 2000);

        return () => clearTimeout(timer);
    }, [userLoading, isAuthenticated, router]);

    // Pre-fill form if user data exists
    useEffect(() => {
        if (user) {
            if (user.fullName) setFullName(user.fullName);
            else if (user.firstName && user.lastName) setFullName(`${user.firstName} ${user.lastName}`);
            if (user.age) setAge(user.age);
            if (user.gender) setGender(user.gender);
            if (user.location) setLocation(user.location);
            if (user.avatarUrl) setProfileImage(user.avatarUrl);
        }
    }, [user]);

    // Handle image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError(language === 'hi' ? 'कृपया एक छवि फ़ाइल चुनें' : 'Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError(language === 'hi' ? 'छवि 5MB से छोटी होनी चाहिए' : 'Image must be smaller than 5MB');
            return;
        }

        setIsUploadingImage(true);
        setError('');

        // Read and convert to base64 for preview and storage
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setProfileImage(base64String);
            setIsUploadingImage(false);
        };
        reader.onerror = () => {
            setError(language === 'hi' ? 'छवि पढ़ने में त्रुटि' : 'Error reading image');
            setIsUploadingImage(false);
        };
        reader.readAsDataURL(file);
    };

    // Remove profile image
    const removeProfileImage = () => {
        setProfileImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Trigger file input click
    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    // Toggle health goal
    const toggleHealthGoal = (goalId: string) => {
        setHealthGoals(prev =>
            prev.includes(goalId)
                ? prev.filter(g => g !== goalId)
                : [...prev, goalId]
        );
    };

    // Auto-fetch location
    const fetchLocation = () => {
        if (!navigator.geolocation) {
            setError(language === 'hi' ? 'आपका ब्राउज़र स्थान का समर्थन नहीं करता' : 'Your browser does not support geolocation');
            return;
        }

        setIsLoadingLocation(true);
        setError('');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                        { headers: { 'Accept-Language': language === 'hi' ? 'hi' : 'en' } }
                    );
                    const data = await response.json();

                    const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
                    const state = data.address.state || '';
                    const country = data.address.country || '';

                    const locationString = [city, state, country].filter(Boolean).join(', ');
                    setLocation(locationString || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
                } catch (err) {
                    console.error('Error fetching location:', err);
                    setError(language === 'hi' ? 'स्थान प्राप्त करने में त्रुटि' : 'Error fetching location');
                } finally {
                    setIsLoadingLocation(false);
                }
            },
            (err) => {
                console.error('Geolocation error:', err);
                setIsLoadingLocation(false);
                setError(language === 'hi' ? 'स्थान की अनुमति अस्वीकृत' : 'Location permission denied');
            },
            { timeout: 10000, enableHighAccuracy: false }
        );
    };

    // Handle form submission — saves directly to Supabase
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation for basic fields
        if (!fullName.trim()) {
            setError(language === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें' : 'Please enter your full name');
            setCurrentStep(1);
            return;
        }
        if (!age || age < 1 || age > 120) {
            setError(language === 'hi' ? 'कृपया वैध आयु दर्ज करें' : 'Please enter a valid age');
            setCurrentStep(1);
            return;
        }
        if (!gender) {
            setError(language === 'hi' ? 'कृपया अपना लिंग चुनें' : 'Please select your gender');
            setCurrentStep(1);
            return;
        }
        if (!location.trim()) {
            setError(language === 'hi' ? 'कृपया अपना स्थान दर्ज करें' : 'Please enter your location');
            setCurrentStep(1);
            return;
        }

        setIsSubmitting(true);

        if (!isSupabaseConfigured) {
            completeProfile({
                fullName: fullName.trim(),
                age: Number(age),
                gender: gender as 'male' | 'female' | 'other',
                location: location.trim(),
            });
            setShowSuccess(true);
            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);
            setIsSubmitting(false);
            return;
        }

        try {
            // Save profile directly to Supabase users table
            const dbPayload = {
                full_name: fullName.trim(),
                age: Number(age),
                gender: gender,
                location: location.trim(),
                phone: phone.trim() || null,
                date_of_birth: dateOfBirth || null,
                bio: bio.trim() || null,
                blood_group: bloodGroup || null,
                height_cm: heightCm ? Number(heightCm) : null,
                weight_kg: weightKg ? Number(weightKg) : null,
                dietary_preference: dietaryPreference || null,
                dosha_type: doshaType || null,
                health_goals: healthGoals.length > 0 ? healthGoals : null,
                avatar_url: profileImage || null,
                is_profile_complete: true,
            };

            const { data, error: dbError } = await supabase
                .from('users')
                .update(dbPayload)
                .eq('id', user?.id)
                .select()
                .single();

            if (dbError) {
                throw new Error(dbError.message || 'Failed to save profile');
            }

            // Update local context
            completeProfile({
                fullName: data.full_name,
                age: data.age,
                gender: data.gender,
                location: data.location,
            });

            // Update additional fields in context
            updateProfile({
                phone: data.phone,
                avatarUrl: data.avatar_url,
            });

            setShowSuccess(true);

            // Redirect to dashboard after a short delay
            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);
        } catch (err) {
            console.error('Error saving profile:', err);
            // If Supabase fails, still save locally
            completeProfile({
                fullName: fullName.trim(),
                age: Number(age),
                gender: gender as 'male' | 'female' | 'other',
                location: location.trim(),
            });
            setShowSuccess(true);
            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle logout
    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="size-16 border-4 border-emerald-200 rounded-full animate-pulse" />
                        <Leaf className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 text-emerald-600 animate-bounce" />
                    </div>
                    <p className="mt-4 text-gray-600">{language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            {/* Premium Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white">
                {/* Decorative elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -right-24 size-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-32 -left-32 size-96 bg-emerald-400/20 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl" />
                </div>

                <div className="relative px-6 py-12 max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative group">
                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />

                            {/* Profile Image Display */}
                            <div
                                onClick={triggerImageUpload}
                                className="size-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl border-2 border-white/30 cursor-pointer overflow-hidden hover:border-white/60 transition-all"
                            >
                                {isUploadingImage ? (
                                    <Loader2 className="size-8 text-white animate-spin" />
                                ) : profileImage ? (
                                    <img
                                        src={profileImage}
                                        alt="Profile"
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <span className="text-4xl font-bold text-white">
                                        {fullName ? fullName.charAt(0).toUpperCase() : '?'}
                                    </span>
                                )}
                            </div>

                            {/* Upload/Change Button */}
                            <button
                                type="button"
                                onClick={triggerImageUpload}
                                className="absolute -bottom-2 -right-2 size-9 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform hover:bg-emerald-50"
                            >
                                {profileImage ? <Camera className="size-4" /> : <ImagePlus className="size-4" />}
                            </button>

                            {/* Remove Image Button */}
                            {profileImage && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeProfileImage(); }}
                                    className="absolute -top-2 -right-2 size-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform hover:bg-red-600 opacity-0 group-hover:opacity-100"
                                >
                                    <X className="size-3" />
                                </button>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">
                                {language === 'hi' ? 'अपनी प्रोफ़ाइल बनाएं' : 'Create Your Profile'}
                            </h1>
                            <p className="text-emerald-100 mt-1">
                                {language === 'hi'
                                    ? 'व्यक्तिगत आयुर्वेदिक मार्गदर्शन के लिए'
                                    : 'For personalized Ayurvedic guidance'}
                            </p>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-2 mt-8">
                        {[1, 2, 3].map((step) => (
                            <React.Fragment key={step}>
                                <button
                                    onClick={() => setCurrentStep(step)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${currentStep === step
                                        ? 'bg-white text-emerald-600 shadow-lg'
                                        : currentStep > step
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-white/20 text-white/80'
                                        }`}
                                >
                                    {currentStep > step ? (
                                        <CheckCircle className="size-4" />
                                    ) : (
                                        <span className="size-5 rounded-full bg-current/20 flex items-center justify-center text-xs font-bold">
                                            {step}
                                        </span>
                                    )}
                                    <span className="text-sm font-medium hidden sm:inline">
                                        {step === 1
                                            ? (language === 'hi' ? 'मूल जानकारी' : 'Basic Info')
                                            : step === 2
                                                ? (language === 'hi' ? 'स्वास्थ्य विवरण' : 'Health Details')
                                                : (language === 'hi' ? 'लक्ष्य' : 'Goals')}
                                    </span>
                                </button>
                                {step < 3 && <ChevronRight className="size-4 text-white/50" />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8 -mt-4">
                {/* Success Message */}
                {showSuccess && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl shadow-lg flex items-center gap-3 animate-pulse">
                        <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
                            <CheckCircle className="size-5" />
                        </div>
                        <div>
                            <p className="font-semibold">{language === 'hi' ? 'प्रोफ़ाइल सहेजी गई!' : 'Profile Saved!'}</p>
                            <p className="text-sm text-emerald-100">{language === 'hi' ? 'डैशबोर्ड पर जा रहे हैं...' : 'Redirecting to dashboard...'}</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3">
                        <Shield className="size-5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <User className="size-5 text-emerald-600" />
                                        {language === 'hi' ? 'मूल जानकारी' : 'Basic Information'}
                                    </h2>
                                </div>
                                <div className="p-6 space-y-5">
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {language === 'hi' ? 'पूरा नाम *' : 'Full Name *'}
                                        </label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder={language === 'hi' ? 'अपना पूरा नाम दर्ज करें' : 'Enter your full name'}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                        />
                                    </div>

                                    {/* Age & Gender Row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {language === 'hi' ? 'आयु *' : 'Age *'}
                                            </label>
                                            <input
                                                type="number"
                                                value={age}
                                                onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
                                                placeholder="25"
                                                min="1"
                                                max="120"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {language === 'hi' ? 'लिंग *' : 'Gender *'}
                                            </label>
                                            <select
                                                value={gender}
                                                onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other' | '')}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                            >
                                                <option value="">{language === 'hi' ? 'चुनें' : 'Select'}</option>
                                                <option value="male">{language === 'hi' ? 'पुरुष' : 'Male'}</option>
                                                <option value="female">{language === 'hi' ? 'महिला' : 'Female'}</option>
                                                <option value="other">{language === 'hi' ? 'अन्य' : 'Other'}</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Date of Birth */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Calendar className="size-4 inline mr-2" />
                                            {language === 'hi' ? 'जन्म तिथि' : 'Date of Birth'}
                                        </label>
                                        <input
                                            type="date"
                                            value={dateOfBirth}
                                            onChange={(e) => setDateOfBirth(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Phone className="size-4 inline mr-2" />
                                            {language === 'hi' ? 'फ़ोन नंबर' : 'Phone Number'}
                                        </label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+91 98765 43210"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                        />
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <MapPin className="size-4 inline mr-2" />
                                            {language === 'hi' ? 'स्थान *' : 'Location *'}
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                placeholder={language === 'hi' ? 'शहर, राज्य' : 'City, State'}
                                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={fetchLocation}
                                                disabled={isLoadingLocation}
                                                className="px-4 py-3 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors disabled:opacity-50 text-emerald-700"
                                                title={language === 'hi' ? 'स्थान प्राप्त करें' : 'Get Location'}
                                            >
                                                {isLoadingLocation ? (
                                                    <Loader2 className="size-5 animate-spin" />
                                                ) : (
                                                    <MapPin className="size-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {language === 'hi' ? 'अपने बारे में' : 'About Yourself'}
                                        </label>
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            placeholder={language === 'hi' ? 'अपने बारे में कुछ बताएं...' : 'Tell us about yourself...'}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setCurrentStep(2)}
                                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                            >
                                {language === 'hi' ? 'अगला' : 'Next'}
                                <ArrowRight className="size-5" />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Health Details */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-gray-100">
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <Heart className="size-5 text-rose-500" />
                                        {language === 'hi' ? 'स्वास्थ्य विवरण' : 'Health Details'}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {language === 'hi' ? 'बेहतर सुझावों के लिए' : 'For better recommendations'}
                                    </p>
                                </div>
                                <div className="p-6 space-y-5">
                                    {/* Blood Group & Height/Weight */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Droplets className="size-4 inline mr-1" />
                                                {language === 'hi' ? 'रक्त समूह' : 'Blood Group'}
                                            </label>
                                            <select
                                                value={bloodGroup}
                                                onChange={(e) => setBloodGroup(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                            >
                                                <option value="">{language === 'hi' ? 'चुनें' : 'Select'}</option>
                                                {BLOOD_GROUPS.map(bg => (
                                                    <option key={bg} value={bg}>{bg}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Ruler className="size-4 inline mr-1" />
                                                {language === 'hi' ? 'ऊंचाई (cm)' : 'Height (cm)'}
                                            </label>
                                            <input
                                                type="number"
                                                value={heightCm}
                                                onChange={(e) => setHeightCm(e.target.value ? parseInt(e.target.value) : '')}
                                                placeholder="170"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Weight className="size-4 inline mr-1" />
                                                {language === 'hi' ? 'वजन (kg)' : 'Weight (kg)'}
                                            </label>
                                            <input
                                                type="number"
                                                value={weightKg}
                                                onChange={(e) => setWeightKg(e.target.value ? parseFloat(e.target.value) : '')}
                                                placeholder="70"
                                                step="0.1"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Dietary Preference */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            <Apple className="size-4 inline mr-2" />
                                            {language === 'hi' ? 'आहार प्राथमिकता' : 'Dietary Preference'}
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {DIETARY_OPTIONS.map(option => (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    onClick={() => setDietaryPreference(option.id)}
                                                    className={`px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${dietaryPreference === option.id
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                        }`}
                                                >
                                                    {language === 'hi' ? option.labelHi : option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Dosha Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            <Sparkles className="size-4 inline mr-2" />
                                            {language === 'hi' ? 'आपका प्रकृति (दोष)' : 'Your Prakriti (Dosha)'}
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {DOSHA_TYPES.map(dosha => (
                                                <button
                                                    key={dosha.id}
                                                    type="button"
                                                    onClick={() => setDoshaType(dosha.id)}
                                                    className={`relative px-4 py-4 rounded-xl border-2 transition-all overflow-hidden ${doshaType === dosha.id
                                                        ? 'border-emerald-500 shadow-lg'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className={`absolute inset-0 bg-gradient-to-br ${dosha.color} opacity-10`} />
                                                    <div className="relative">
                                                        <p className="font-semibold text-gray-800">
                                                            {language === 'hi' ? dosha.labelHi : dosha.label}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{dosha.description}</p>
                                                    </div>
                                                    {doshaType === dosha.id && (
                                                        <CheckCircle className="absolute top-2 right-2 size-4 text-emerald-500" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 text-center">
                                            {language === 'hi' ? 'अपना दोष नहीं जानते? बाद में प्रश्नोत्तरी लें' : "Don't know your dosha? Take the quiz later"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(1)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition-all"
                                >
                                    {language === 'hi' ? 'पीछे' : 'Back'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(3)}
                                    className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                >
                                    {language === 'hi' ? 'अगला' : 'Next'}
                                    <ArrowRight className="size-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Health Goals */}
                    {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-100">
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <Target className="size-5 text-amber-500" />
                                        {language === 'hi' ? 'आपके स्वास्थ्य लक्ष्य' : 'Your Health Goals'}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {language === 'hi' ? 'एक या अधिक चुनें' : 'Select one or more'}
                                    </p>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {HEALTH_GOALS.map(goal => (
                                            <button
                                                key={goal.id}
                                                type="button"
                                                onClick={() => toggleHealthGoal(goal.id)}
                                                className={`relative p-4 rounded-2xl border-2 transition-all text-left ${healthGoals.includes(goal.id)
                                                    ? 'border-emerald-500 bg-emerald-50 shadow-md'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span className="text-2xl mb-2 block">{goal.icon}</span>
                                                <p className="font-medium text-gray-800 text-sm">
                                                    {language === 'hi' ? goal.labelHi : goal.label}
                                                </p>
                                                {healthGoals.includes(goal.id) && (
                                                    <CheckCircle className="absolute top-2 right-2 size-5 text-emerald-500" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(2)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition-all"
                                >
                                    {language === 'hi' ? 'पीछे' : 'Back'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || showSuccess}
                                    className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="size-5 animate-spin" />
                                            {language === 'hi' ? 'सहेज रहा है...' : 'Saving...'}
                                        </>
                                    ) : showSuccess ? (
                                        <>
                                            <CheckCircle className="size-5" />
                                            {language === 'hi' ? 'सहेजा गया!' : 'Saved!'}
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="size-5" />
                                            {language === 'hi' ? 'प्रोफ़ाइल सहेजें' : 'Save Profile'}
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Logout Button */}
                            {user?.isProfileComplete && (
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 border border-red-200"
                                >
                                    <LogOut className="size-5" />
                                    {language === 'hi' ? 'लॉग आउट' : 'Logout'}
                                </button>
                            )}
                        </div>
                    )}
                </form>

                {/* Skip for now */}
                {!user?.isProfileComplete && (
                    <p className="text-center text-sm text-gray-500 mt-6">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-emerald-600 hover:underline font-medium"
                        >
                            {language === 'hi' ? 'बाद में करें →' : 'Skip for now →'}
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}
