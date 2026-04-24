import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/saved/toggle — Toggle saved item (save/unsave)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, itemId, category, name, imageUrl } = body;

        if (!userId || !itemId) {
            return NextResponse.json(
                { error: 'userId and itemId are required' },
                { status: 400 }
            );
        }

        const supabase = await createSupabaseServerClient();

        // Check if item already exists
        const { data: existing } = await supabase
            .from('saved_items')
            .select('id')
            .eq('user_id', userId)
            .eq('item_id', itemId)
            .single();

        if (existing) {
            // Item exists — delete (unsave)
            await supabase
                .from('saved_items')
                .delete()
                .eq('user_id', userId)
                .eq('item_id', itemId);

            return NextResponse.json(
                { saved: false, message: 'Item removed from collection' },
                { status: 200 }
            );
        } else {
            // Item does not exist — insert (save)
            await supabase.from('saved_items').insert({
                user_id: userId,
                item_id: itemId,
                category: category || 'unknown',
                name: name || 'Unknown',
                image_url: imageUrl || '',
            });

            return NextResponse.json(
                { saved: true, message: 'Item added to collection' },
                { status: 201 }
            );
        }
    } catch (error) {
        console.error('Error toggling saved item:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
