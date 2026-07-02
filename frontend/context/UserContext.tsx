'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isSupabaseConfigured, missingSupabaseMessage, supabase } from '@/lib/supabase';

// User profile interface
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

interface UserContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (userData: Partial<UserProfile>) => void;
    logout: () => void;
    updateProfile: (profileData: Partial<UserProfile>) => void;
    completeProfile: (profileData: { fullName: string; age: number; gender: 'male' | 'female' | 'other'; location: string }) => void;
    signInWithGoogle: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

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

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount and check Supabase session
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        let hasCachedUser = false;

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser({
                    ...parsedUser,
                    isProfileComplete: parsedUser.isProfileComplete ?? false,
                });
                hasCachedUser = true;
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('user');
            }
        } else {
            // Default to mock user for UI development
            setUser(mockUser);
            hasCachedUser = true;
        }

        // If we have cached user data, stop loading immediately
        // so pages render instantly from cache
        if (hasCachedUser) {
            setIsLoading(false);
        }

        if (!isSupabaseConfigured) {
            setIsLoading(false);
            return;
        }

        // Check active Supabase session and sync with DB (runs in background)
        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    await syncUserFromDb(session.user.id, session.user.email || '', session.user.user_metadata);
                } else {
                    // Default to mock user if no session
                    setUser(mockUser);
                }
            } catch (error) {
                console.error('Error checking session:', error);
                setUser(mockUser);
            } finally {
                // Always set loading false when done (covers no-cache case)
                setIsLoading(false);
            }
        };

        initSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                await syncUserFromDb(session.user.id, session.user.email || '', session.user.user_metadata);
            } else if (event === 'SIGNED_OUT') {
                // For dev, don't clear mock user entirely, or allow logout to clean it
                setUser(null);
                localStorage.removeItem('user');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Save user to localStorage whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }
    }, [user]);

    // Sync user data directly with Supabase DB (replaces syncWithBackend)
    const syncUserFromDb = async (
        supabaseId: string,
        email: string,
        userMetadata: Record<string, string> = {}
    ) => {
        if (!isSupabaseConfigured) return;

        try {
            // Try to fetch existing profile
            const { data: existingProfile } = await supabase
                .from('users')
                .select('*')
                .eq('id', supabaseId)
                .single();

            if (existingProfile) {
                // Profile exists — use DB data as source of truth
                const mapped = mapDbRowToProfile(existingProfile);
                const profileUser: UserProfile = {
                    id: supabaseId,
                    email: email,
                    isProfileComplete: false,
                    ...mapped,
                };
                setUser(profileUser);
                localStorage.setItem('user', JSON.stringify(profileUser));
            } else {
                // No profile yet — create one (e.g. first Google sign-in)
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
                setUser(newUser);
                localStorage.setItem('user', JSON.stringify(newUser));
            }
        } catch (error) {
            console.error('Error syncing user from DB:', error);
        }
    };

    const signInWithGoogle = async () => {
        try {
            if (!isSupabaseConfigured) {
                throw new Error(missingSupabaseMessage);
            }

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error("Error signing in with Google:", error);
            throw error;
        }
    };

    const login = (userData: Partial<UserProfile>) => {
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
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
            console.error('Failed to call logout API', e);
        }
        if (isSupabaseConfigured) {
            await supabase.auth.signOut();
        }
        setUser(null);
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    };

    const updateProfile = (profileData: Partial<UserProfile>) => {
        if (user) {
            const updatedUser = { ...user, ...profileData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    const completeProfile = (profileData: { fullName: string; age: number; gender: 'male' | 'female' | 'other'; location: string }) => {
        if (user) {
            const updatedUser: UserProfile = {
                ...user,
                fullName: profileData.fullName,
                age: profileData.age,
                gender: profileData.gender,
                location: profileData.location,
                isProfileComplete: true,
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    return (
        <UserContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                updateProfile,
                completeProfile,
                signInWithGoogle,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
