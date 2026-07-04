'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

// Key factory for profile caching
export const profileKeys = {
    all: ['profile'] as const,
    detail: (userId: string) => [...profileKeys.all, userId] as const,
};

export function useProfileQuery(userId: string | undefined) {
    return useQuery({
        queryKey: profileKeys.detail(userId || ''),
        queryFn: async () => {
            if (!userId || !isSupabaseConfigured) return null;
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) return null;

            const aiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
            const res = await fetch(`${aiUrl}/api/onboarding/get-profile`, {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            
            if (res.status === 404) {
                return null;
            }
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || 'Failed to load profile');
            }
            const data = await res.json();
            return data.profile;
        },
        enabled: !!userId && isSupabaseConfigured,
        staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
    });
}

export function useSaveProfileMutation() {
    const queryClient = useQueryClient();
    const updateAuthProfile = useAuthStore(state => state.updateProfile);

    return useMutation({
        mutationFn: async (formData: any) => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                throw new Error('You must be logged in to save your profile.');
            }

            // Build the payload
            const payload = {
                ...formData,
                basic_profile: {
                    ...formData.basic_profile,
                    age: typeof formData.basic_profile.age === 'string'
                        ? parseInt(formData.basic_profile.age, 10)
                        : formData.basic_profile.age,
                    height: formData.basic_profile.height ? parseFloat(String(formData.basic_profile.height)) : null,
                    weight: formData.basic_profile.weight ? parseFloat(String(formData.basic_profile.weight)) : null,
                },
            };

            const aiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
            const res = await fetch(`${aiUrl}/api/onboarding/save-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to save profile');
            }

            return res.json();
        },
        onSuccess: (data, variables) => {
            // Update auth store
            updateAuthProfile({
                fullName: variables.basic_profile.full_name,
                age: typeof variables.basic_profile.age === 'string'
                    ? parseInt(variables.basic_profile.age, 10)
                    : variables.basic_profile.age,
                gender: variables.basic_profile.gender,
                location: variables.basic_profile.location,
                isProfileComplete: true,
            });

            // Invalidate query to trigger refetch
            const userId = useAuthStore.getState().user?.id;
            if (userId) {
                queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
            }
        },
    });
}
