'use client';

import React, { useState, useEffect } from 'react';
import {
    SlStar, SlPaperPlane, SlRefresh, SlCheck, SlBubble,
    SlLike, SlMagicWand, SlWrench, SlBulb, SlHeart,
    SlArrowDown
} from 'react-icons/sl';
import { useUser } from '@/context/UserContext';
import { isSupabaseConfigured, missingSupabaseMessage, supabase } from '@/lib/supabase';

// ─── Types ───────────────────────────────────────────────────
interface Review {
    id: string;
    user_name: string;
    rating: number;
    category: string;
    title: string;
    review_text: string;
    created_at: string;
}

const CATEGORIES = [
    { value: 'general', label: 'General Feedback', icon: <SlBubble className="size-4" />, color: 'emerald' },
    { value: 'feature', label: 'Feature Request', icon: <SlBulb className="size-4" />, color: 'amber' },
    { value: 'bug', label: 'Bug Report', icon: <SlWrench className="size-4" />, color: 'red' },
    { value: 'praise', label: 'Appreciation', icon: <SlHeart className="size-4" />, color: 'pink' },
    { value: 'improvement', label: 'Improvement', icon: <SlMagicWand className="size-4" />, color: 'purple' },
];

// ─── Star Rating Component ──────────────────────────────────
function StarRating({ rating, onRate, size = 'lg' }: { rating: number; onRate?: (r: number) => void; size?: 'sm' | 'lg' }) {
    const [hover, setHover] = useState(0);
    const starSize = size === 'lg' ? 'size-8' : 'size-4';

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onRate?.(star)}
                    onMouseEnter={() => onRate && setHover(star)}
                    onMouseLeave={() => onRate && setHover(0)}
                    disabled={!onRate}
                    className={`transition-all duration-200 ${onRate ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'}`}
                >
                    <SlStar
                        className={`${starSize} transition-colors duration-200 ${(hover || rating) >= star
                            ? 'text-amber-400'
                            : 'text-gray-300'
                            }`}
                    />
                </button>
            ))}
        </div>
    );
}

// ─── Review Card ─────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
    const cat = CATEGORIES.find(c => c.value === review.category) || CATEGORIES[0];
    const timeAgo = getTimeAgo(review.created_at);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-[#007200]/10 flex items-center justify-center text-[#007200] font-bold text-sm shadow-sm">
                        {review.user_name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 text-sm">{review.user_name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-400">{timeAgo}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-gray-500 font-medium flex items-center gap-1.5">
                        {cat.icon} {cat.label}
                    </span>
                </div>
            </div>
            <div className="mt-3">
                <StarRating rating={review.rating} size="sm" />
            </div>
            {review.title && (
                <h3 className="mt-2 font-semibold text-gray-800">{review.title}</h3>
            )}
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{review.review_text}</p>
        </div>
    );
}

function getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}


// ═══════════════════════════════════════════════════════════════
// MAIN FEEDBACK PAGE
// ═══════════════════════════════════════════════════════════════
export default function FeedbackPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useUser();

    // Form state
    const [rating, setRating] = useState(0);
    const [category, setCategory] = useState('general');
    const [title, setTitle] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Reviews list state
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true);
    const [showAllReviews, setShowAllReviews] = useState(false);

    // Fetch existing reviews
    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        if (!isSupabaseConfigured) {
            setIsLoadingReviews(false);
            return;
        }

        setIsLoadingReviews(true);
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) {
                // Handle case where table might not exist yet
                if (error.code === '42P01' || error.message?.includes('schema cache') || error.message?.includes('Could not find the table')) {
                    setReviews([]);
                    return;
                }
                throw error;
            }
            
            setReviews(data || []);
        } catch (err: any) {
            console.error('Failed to fetch reviews:', err?.message || err);
        } finally {
            setIsLoadingReviews(false);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (rating === 0) {
            setSubmitError('Please select a star rating before submitting.');
            return;
        }
        if (!reviewText.trim()) {
            setSubmitError('Please write your feedback before submitting.');
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        if (!isSupabaseConfigured) {
            // Mock submission
            const newReview = {
                id: 'local-' + Date.now(),
                user_name: user?.fullName || user?.firstName || 'Anonymous',
                rating,
                category,
                title: title.trim() || null,
                review_text: reviewText.trim(),
                created_at: new Date().toISOString(),
            };
            setReviews(prev => [newReview as Review, ...prev]);
            setSubmitSuccess(true);
            setRating(0);
            setCategory('general');
            setTitle('');
            setReviewText('');
            setTimeout(() => setSubmitSuccess(false), 4000);
            setIsSubmitting(false);
            return;
        }

        try {
            const { error } = await supabase.from('reviews').insert({
                user_id: user?.id || null,
                user_name: user?.fullName || user?.firstName || 'Anonymous',
                user_email: user?.email || null,
                rating,
                category,
                title: title.trim() || null,
                review_text: reviewText.trim(),
            });

            if (error) throw error;

            setSubmitSuccess(true);
            setRating(0);
            setCategory('general');
            setTitle('');
            setReviewText('');

            // Refresh the reviews list
            fetchReviews();

            // Reset success state after 4 seconds
            setTimeout(() => setSubmitSuccess(false), 4000);
        } catch (err: unknown) {
            console.error('Submit error:', err);
            const message = err instanceof Error ? err.message : 'Failed to submit feedback. Please try again.';
            setSubmitError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 4);

    // ─── Loading State ───────────────────────────────────────
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <SlRefresh className="size-10 text-[#007200] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            {/* Page Header */}
            <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-4">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Feedback & Suggestions</h1>
                        <p className="text-gray-500 text-sm">Help us improve your experience with Dravya Labs.</p>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 py-4">
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* ─── FORM COLUMN ─── */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Submit Success Banner */}
                        {submitSuccess && (
                            <div className="flex items-center gap-3 rounded-2xl bg-[#007200]/10 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <SlCheck className="size-5 text-[#007200] shrink-0" />
                                <p className="text-sm font-medium text-[#007200]">
                                    Thank you! Your feedback has been submitted successfully.
                                </p>
                            </div>
                        )}

                        {/* Form Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Star Rating Section */}
                            <div className="px-6 py-8 text-center border-b border-gray-50">
                                <p className="text-sm font-medium text-gray-600 mb-3">How would you rate your experience?</p>
                                <div className="flex justify-center">
                                    <StarRating rating={rating} onRate={setRating} />
                                </div>
                                {rating > 0 && (
                                    <p className="mt-2 text-sm text-amber-600 font-medium animate-in fade-in duration-200">
                                        {rating === 1 ? '😟 Poor' :
                                            rating === 2 ? '😐 Fair' :
                                                rating === 3 ? '🙂 Good' :
                                                    rating === 4 ? '😊 Great' : '🤩 Excellent!'}
                                    </p>
                                )}
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Category Selector */}
                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-2 block">Feedback Category</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {CATEGORIES.map((cat) => (
                                            <button
                                                key={cat.value}
                                                type="button"
                                                onClick={() => setCategory(cat.value)}
                                                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${category === cat.value
                                                    ? 'border-transparent bg-[#007200]/10 text-[#007200]'
                                                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {cat.icon}
                                                <span className="hidden sm:inline">{cat.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-1.5 block">Subject (optional)</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Give your feedback a title..."
                                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:border-[#007200] focus:ring-4 focus:ring-[#007200]/10"
                                    />
                                </div>

                                {/* Review Text */}
                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-1.5 block">
                                        Your Feedback <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        placeholder="Tell us what you think... What do you love? What could be better?"
                                        rows={5}
                                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:border-[#007200] focus:ring-4 focus:ring-[#007200]/10 resize-none"
                                    />
                                </div>

                                {/* Error */}
                                {submitError && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                        {submitError}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !isAuthenticated}
                                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#007200] hover:bg-[#006400] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                                >
                                    {isSubmitting ? (
                                        <><SlRefresh className="size-4 animate-spin" /> Submitting...</>
                                    ) : (
                                        <><SlPaperPlane className="size-4" /> Submit Feedback</>
                                    )}
                                </button>

                                {!isAuthenticated && (
                                    <p className="text-center text-xs text-gray-400">
                                        Please sign in to submit your feedback.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ─── REVIEWS COLUMN ─── */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 tracking-tight">
                                <SlLike className="size-5 text-[#007200]" />
                                Recent Reviews
                            </h2>
                            {reviews.length > 0 && (
                                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                                    {reviews.length}
                                </span>
                            )}
                        </div>

                        {isLoadingReviews ? (
                            <div className="flex justify-center py-12">
                                <SlRefresh className="size-8 text-[#007200] animate-spin" />
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center shadow-sm">
                                <div className="size-16 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-4">
                                    <SlBubble className="size-8 text-gray-300" />
                                </div>
                                <p className="text-sm font-medium text-gray-700">No reviews yet</p>
                                <p className="text-xs text-gray-400 mt-1">Be the first to share your feedback!</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {displayedReviews.map((review) => (
                                        <ReviewCard key={review.id} review={review} />
                                    ))}
                                </div>

                                {reviews.length > 4 && (
                                    <button
                                        onClick={() => setShowAllReviews(!showAllReviews)}
                                        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                                    >
                                        {showAllReviews ? 'Show Less' : `View All ${reviews.length} Reviews`}
                                        <SlArrowDown className={`size-3 transition-transform ${showAllReviews ? 'rotate-180' : ''}`} />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
