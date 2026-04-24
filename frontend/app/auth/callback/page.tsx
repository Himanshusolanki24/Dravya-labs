'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState('Processing login...');
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        // Supabase client with detectSessionInUrl:true will automatically
        // exchange the ?code= for a session. We just need to listen for it.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    setStatus('Login successful! Redirecting...');

                    try {
                        // Check if profile exists and is complete
                        const { data: profile } = await supabase
                            .from('users')
                            .select('is_profile_complete')
                            .eq('id', session.user.id)
                            .single();

                        if (!profile) {
                            // First-time Google login — create profile row
                            const meta = session.user.user_metadata || {};
                            await supabase.from('users').upsert({
                                id: session.user.id,
                                email: session.user.email,
                                full_name: meta.full_name || meta.name || '',
                                avatar_url: meta.avatar_url || meta.picture || '',
                                is_profile_complete: false,
                            }, { onConflict: 'id' });
                            router.push('/auth/profile');
                        } else if (profile.is_profile_complete) {
                            router.push('/dashboard');
                        } else {
                            router.push('/auth/profile');
                        }
                    } catch {
                        // If DB check fails, still send them to dashboard
                        router.push('/dashboard');
                    }
                }
            }
        );

        // Timeout fallback in case onAuthStateChange never fires
        const timeout = setTimeout(() => {
            setStatus('Taking too long... Redirecting to login.');
            router.push('/auth/login');
        }, 10000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, [router]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
        }}>
            <div style={{
                textAlign: 'center',
                padding: '40px',
                borderRadius: '20px',
                background: 'white',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    border: '4px solid #e0e0e0',
                    borderTopColor: '#4caf50',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 20px',
                }} />
                <p style={{ color: '#333', fontSize: '16px', fontWeight: 500 }}>{status}</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );
}
