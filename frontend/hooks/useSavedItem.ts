import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface UseSavedItemProps {
    userId?: string;
    itemId: string;
    category: string;
    name: string;
    imageUrl?: string;
}

export function useSavedItem({ userId, itemId, category, name, imageUrl }: UseSavedItemProps) {
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const toggleSave = async () => {
        if (!userId) {
            alert("Please login to save items");
            return;
        }

        setIsLoading(true);
        try {
            // Check if item already exists
            const { data: existing } = await supabase
                .from('saved_items')
                .select('id')
                .eq('user_id', userId)
                .eq('item_id', itemId)
                .maybeSingle();

            if (existing) {
                // Delete (unsave)
                await supabase
                    .from('saved_items')
                    .delete()
                    .eq('id', existing.id);
                setIsSaved(false);
            } else {
                // Insert (save)
                await supabase
                    .from('saved_items')
                    .insert({
                        user_id: userId,
                        item_id: itemId,
                        category,
                        name,
                        image_url: imageUrl || '',
                    });
                setIsSaved(true);
            }

            // Notify other components
            window.dispatchEvent(new Event('saved-items-updated'));
        } catch (error) {
            console.error("Error toggling save:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return { isSaved, setIsSaved, toggleSave, isLoading };
}
