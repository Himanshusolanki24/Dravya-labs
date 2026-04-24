import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST() {
    try {
        const supabase = await createSupabaseServerClient();

        // This will clear the Supabase auth cookies
        await supabase.auth.signOut();

        return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error during logout:', error);
        return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
    }
}
