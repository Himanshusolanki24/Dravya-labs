'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

// User profile interface (same as existing UserContext)
export interface UserProfile {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    location?: string;
    avatarUrl?: string;
    phone?: string;
    dateOfBirth?: string;
    bio?: string;
    bloodGroup?: string;
    heightCm?: number;
    weightKg?: number;
    dietaryPreference?: string;
    doshaType?: string;
    healthGoals?: string[];
    isProfileComplete: boolean;
    createdAt?: string;
}

interface AuthState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isHydrated: boolean;

    // Actions
    setUser: (user: UserProfile | null) => void;
    setLoading: (loading: boolean) => void;
    setHydrated: (hydrated: boolean) => void;
    login: (userData: Partial<UserProfile>) => void;
    logout: () => Promise<void>;
    updateProfile: (profileData: Partial<UserProfile>) => void;
    completeProfile: (profileData: { fullName: string; age: number; gender: 'male' | 'female' | 'other'; location: string }) => void;
    signInWithGoogle: () => Promise<void>;
}

const mockUser: UserProfile = {
    id: 'mock-user-id-12345',
    email: 'dev-user@dravyalabs.com',
    fullName: 'Dev User',
    firstName: 'Dev',
    lastName: 'User',
    age: 28,
    gender: 'male',
    location: 'Mumbai, India',
    isProfileComplete: true,
    createdAt: new Date().toISOString(),
};

// Helper: map a Supabase DB row (snake_case) to our UserProfile (camelCase)
function mapDbRowToProfile(row: Record<string, unknown>): Partial<UserProfile> {
    return {
        id: row.id as string,
        email: row.email as string,
        fullName: row.full_name as string | undefined,
        firstName: row.first_name as string | undefined,
        lastName: row.last_name as string | undefined,
        age: row.age as number | undefined,
        gender: row.gender as 'male' | 'female' | 'other' | undefined,
        location: row.location as string | undefined,
        avatarUrl: row.avatar_url as string | undefined,
        phone: row.phone as string | undefined,
        dateOfBirth: row.date_of_birth as string | undefined,
        bio: row.bio as string | undefined,
        bloodGroup: row.blood_group as string | undefined,
        heightCm: row.height_cm as number | undefined,
        weightKg: row.weight_kg as number | undefined,
        dietaryPreference: row.dietary_preference as string | undefined,
        doshaType: row.dosha_type as string | undefined,
        healthGoals: row.health_goals as string[] | undefined,
        isProfileComplete: (row.is_profile_complete as boolean) ?? false,
        createdAt: row.created_at as string | undefined,
    };
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,
            isHydrated: false,

            setUser: (user) => set({ user, isAuthenticated: !!user }),
            setLoading: (isLoading) => set({ isLoading }),
            setHydrated: (isHydrated) => set({ isHydrated }),

            login: (userData) => {
                const newUser: UserProfile = {
                    id: userData.id || '',
                    email: userData.email || '',
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    fullName: userData.fullName,
                    age: userData.age,
                    gender: userData.gender,
                    location: userData.location,
                    avatarUrl: userData.avatarUrl,
                    isProfileComplete: userData.isProfileComplete ?? false,
                    createdAt: userData.createdAt || new Date().toISOString(),
                };
                set({ user: newUser, isAuthenticated: true, isLoading: false });
            },

            logout: async () => {
                try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                } catch (e) {
                    console.error('Failed to call logout API', e);
                }
                if (isSupabaseConfigured) {
                    await supabase.auth.signOut();
                }
                set({ user: null, isAuthenticated: false });
                localStorage.removeItem('user');
                if (typeof window !== 'undefined') {
                    window.location.href = '/';
                }
            },

            updateProfile: (profileData) => {
                const { user } = get();
                if (user) {
                    set({ user: { ...user, ...profileData } });
                }
            },

            completeProfile: (profileData) => {
                const { user } = get();
                if (user) {
                    set({
                        user: {
                            ...user,
                            fullName: profileData.fullName,
                            age: profileData.age,
                            gender: profileData.gender,
                            location: profileData.location,
                            isProfileComplete: true,
                        }
                    });
                }
            },

            signInWithGoogle: async () => {
                if (!isSupabaseConfigured) {
                    throw new Error('Supabase is not configured');
                }
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                    }
                });
                if (error) throw error;
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setHydrated(true);
                    state.setLoading(false);
                    // If no persisted user, load the mock user for dev
                    if (!state.user) {
                        state.setUser(mockUser);
                    }
                }
            },
        }
    )
);

// Initialize Supabase auth listener (call once in provider)
export async function initAuthListener() {
    if (!isSupabaseConfigured) {
        useAuthStore.getState().setLoading(false);
        return () => {};
    }

    // Check existing session
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            await syncUserFromDb(session.user.id, session.user.email || '', session.user.user_metadata as Record<string, string>);
        }
    } catch (error) {
        console.error('Error checking session:', error);
    } finally {
        useAuthStore.getState().setLoading(false);
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
            await syncUserFromDb(session.user.id, session.user.email || '', session.user.user_metadata as Record<string, string>);
        } else if (event === 'SIGNED_OUT') {
            useAuthStore.getState().setUser(null);
            localStorage.removeItem('user');
        }
    });

    return () => {
        subscription.unsubscribe();
    };
}

async function syncUserFromDb(
    supabaseId: string,
    email: string,
    userMetadata: Record<string, string> = {}
) {
    if (!isSupabaseConfigured) return;

    try {
        const { data: existingProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', supabaseId)
            .single();

        if (existingProfile) {
            const mapped = mapDbRowToProfile(existingProfile);
            const profileUser: UserProfile = {
                id: supabaseId,
                email: email,
                isProfileComplete: false,
                ...mapped,
            };
            useAuthStore.getState().setUser(profileUser);
        } else {
            const newRow = {
                id: supabaseId,
                email: email,
                full_name: userMetadata.full_name || userMetadata.name || '',
                avatar_url: userMetadata.avatar_url || userMetadata.picture || '',
                is_profile_complete: false,
            };
            await supabase.from('users').upsert(newRow, { onConflict: 'id' });

            const newUser: UserProfile = {
                id: supabaseId,
                email: email,
                fullName: newRow.full_name,
                avatarUrl: newRow.avatar_url,
                isProfileComplete: false,
            };
            useAuthStore.getState().setUser(newUser);
        }
    } catch (error) {
        console.error('Error syncing user from DB:', error);
    }
}
