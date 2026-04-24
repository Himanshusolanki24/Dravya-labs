import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { firstName, lastName, email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email and password are required', field: 'general' },
                { status: 400 }
            );
        }

        if (!firstName || !lastName) {
            return NextResponse.json(
                { message: 'First name and last name are required', field: 'general' },
                { status: 400 }
            );
        }

        const supabase = await createSupabaseServerClient();

        // Check if email already exists in users table
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return NextResponse.json(
                { message: 'Email already registered', field: 'email' },
                { status: 400 }
            );
        }

        // Sign up with Supabase Auth
        const fullName = `${firstName} ${lastName}`.trim();
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    first_name: firstName,
                    last_name: lastName,
                },
            },
        });

        if (authError) {
            return NextResponse.json(
                { message: authError.message, field: 'general' },
                { status: 400 }
            );
        }

        if (!authData.user) {
            return NextResponse.json(
                { message: 'Signup failed', field: 'general' },
                { status: 500 }
            );
        }

        // Create user profile in users table
        const { error: insertError } = await supabase.from('users').upsert(
            {
                id: authData.user.id,
                email,
                full_name: fullName,
                first_name: firstName,
                last_name: lastName,
                role: 'USER',
                is_profile_complete: false,
            },
            { onConflict: 'id' }
        );

        if (insertError) {
            console.error('User profile insert error:', insertError);
        }

        return NextResponse.json(
            {
                message: 'Account created successfully',
                user: {
                    id: authData.user.id,
                    email,
                    fullName,
                    firstName,
                    lastName,
                    isProfileComplete: false,
                },
            },
            { status: 201 }
        );
    } catch (err) {
        console.error('Signup error:', err);
        return NextResponse.json(
            { message: 'Internal server error', field: 'general' },
            { status: 500 }
        );
    }
}
