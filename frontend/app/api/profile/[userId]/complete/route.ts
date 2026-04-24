import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/profile/[userId]/complete — Complete profile (first-time setup)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const body = await request.json();

        if (!userId) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        // Validate required fields
        if (!body.fullName || !body.age || !body.gender || !body.location) {
            return NextResponse.json(
                { message: 'Full name, age, gender, and location are required', field: 'general' },
                { status: 400 }
            );
        }

        const supabase = await createSupabaseServerClient();

        const { data: user, error } = await supabase
            .from('users')
            .update({
                full_name: body.fullName,
                age: body.age,
                gender: body.gender,
                location: body.location,
                phone: body.phone || null,
                date_of_birth: body.dateOfBirth || null,
                bio: body.bio || null,
                blood_group: body.bloodGroup || null,
                height_cm: body.heightCm || null,
                weight_kg: body.weightKg || null,
                dietary_preference: body.dietaryPreference || null,
                dosha_type: body.doshaType || null,
                health_goals: body.healthGoals || null,
                avatar_url: body.avatarUrl || null,
                is_profile_complete: true,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId)
            .select(`id, email, full_name, first_name, last_name, age, gender, location,
                     phone, date_of_birth, avatar_url, bio, blood_group, height_cm,
                     weight_kg, dietary_preference, dosha_type, health_goals,
                     is_profile_complete, role, created_at, updated_at`)
            .single();

        if (error || !user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Profile completed successfully',
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
        console.error('Complete profile error:', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
