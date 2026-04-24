import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email and password are required' },
                { status: 400 }
            );
        }

        const supabase = await createSupabaseServerClient();

        // Sign in with Supabase Auth
        const { data: authData, error: authError } =
            await supabase.auth.signInWithPassword({ email, password });

        if (authError) {
            return NextResponse.json(
                { message: authError.message },
                { status: 401 }
            );
        }

        if (!authData.user) {
            return NextResponse.json(
                { message: 'Login failed' },
                { status: 401 }
            );
        }

        // Fetch user profile from users table
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        // Update last login
        await supabase
            .from('users')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', authData.user.id);

        return NextResponse.json({
            message: 'Login successful',
            user: {
                id: authData.user.id,
                email: authData.user.email,
                fullName: profile?.full_name,
                firstName: profile?.first_name,
                lastName: profile?.last_name,
                age: profile?.age,
                gender: profile?.gender,
                location: profile?.location,
                avatarUrl: profile?.avatar_url,
                isProfileComplete: profile?.is_profile_complete ?? false,
                role: profile?.role,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
