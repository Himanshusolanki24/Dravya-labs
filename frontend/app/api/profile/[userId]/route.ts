import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/profile/[userId] — Fetch user profile
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        if (!userId) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        const supabase = await createSupabaseServerClient();

        const { data: user, error } = await supabase
            .from('users')
            .select(`id, email, full_name, first_name, last_name, age, gender, location,
                     phone, date_of_birth, avatar_url, bio, blood_group, height_cm,
                     weight_kg, dietary_preference, dosha_type, health_goals,
                     is_profile_complete, role, created_at, updated_at`)
            .eq('id', userId)
            .single();

        if (error || !user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            firstName: user.first_name,
            lastName: user.last_name,
            age: user.age,
            gender: user.gender,
            location: user.location,
            phone: user.phone,
            dateOfBirth: user.date_of_birth,
            avatarUrl: user.avatar_url,
            bio: user.bio,
            bloodGroup: user.blood_group,
            heightCm: user.height_cm,
            weightKg: user.weight_kg,
            dietaryPreference: user.dietary_preference,
            doshaType: user.dosha_type,
            healthGoals: user.health_goals,
            isProfileComplete: user.is_profile_complete,
            role: user.role,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        });
    } catch (err) {
        console.error('Get profile error:', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/profile/[userId] — Update user profile
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const body = await request.json();

        if (!userId) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        const supabase = await createSupabaseServerClient();

        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .single();

        if (!existingUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Determine if profile is complete
        const isProfileComplete = !!(body.fullName && body.age && body.gender && body.location);

        // Build update object with only provided fields
        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
            is_profile_complete: isProfileComplete,
        };

        if (body.fullName !== undefined) updateData.full_name = body.fullName;
        if (body.firstName !== undefined) updateData.first_name = body.firstName;
        if (body.lastName !== undefined) updateData.last_name = body.lastName;
        if (body.age !== undefined) updateData.age = body.age;
        if (body.gender !== undefined) updateData.gender = body.gender;
        if (body.location !== undefined) updateData.location = body.location;
        if (body.phone !== undefined) updateData.phone = body.phone;
        if (body.dateOfBirth !== undefined) updateData.date_of_birth = body.dateOfBirth;
        if (body.avatarUrl !== undefined) updateData.avatar_url = body.avatarUrl;
        if (body.bio !== undefined) updateData.bio = body.bio;
        if (body.bloodGroup !== undefined) updateData.blood_group = body.bloodGroup;
        if (body.heightCm !== undefined) updateData.height_cm = body.heightCm;
        if (body.weightKg !== undefined) updateData.weight_kg = body.weightKg;
        if (body.dietaryPreference !== undefined) updateData.dietary_preference = body.dietaryPreference;
        if (body.doshaType !== undefined) updateData.dosha_type = body.doshaType;
        if (body.healthGoals !== undefined) updateData.health_goals = body.healthGoals;

        const { data: user, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', userId)
            .select(`id, email, full_name, first_name, last_name, age, gender, location,
                     phone, date_of_birth, avatar_url, bio, blood_group, height_cm,
                     weight_kg, dietary_preference, dosha_type, health_goals,
                     is_profile_complete, role, created_at, updated_at`)
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                firstName: user.first_name,
                lastName: user.last_name,
                age: user.age,
                gender: user.gender,
                location: user.location,
                phone: user.phone,
                dateOfBirth: user.date_of_birth,
                avatarUrl: user.avatar_url,
                bio: user.bio,
                bloodGroup: user.blood_group,
                heightCm: user.height_cm,
                weightKg: user.weight_kg,
                dietaryPreference: user.dietary_preference,
                doshaType: user.dosha_type,
                healthGoals: user.health_goals,
                isProfileComplete: user.is_profile_complete,
                role: user.role,
                createdAt: user.created_at,
                updatedAt: user.updated_at,
            },
        });
    } catch (err) {
        console.error('Update profile error:', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
