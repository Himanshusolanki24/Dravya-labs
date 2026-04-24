'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Define SavedItem type
export interface SavedItem {
    id: string; // The database ID (UUID)
    user_id: string;
    item_id: string; // The original item ID (e.g., 'tulsi')
    category: string;
    name: string;
    image_url: string;
    created_at: string;
}

interface SavedItemsContextType {
    savedItems: SavedItem[];
    isLoading: boolean;
    refreshSavedItems: () => Promise<void>;
    isItemSaved: (itemId: string) => boolean;
    toggleItem: (item: Omit<SavedItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
}

const SavedItemsContext = createContext<SavedItemsContextType | undefined>(undefined);

export function SavedItemsProvider({ children }: { children: React.ReactNode }) {
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        // Get user from localStorage (set by UserContext)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (parsed.id) setUserId(parsed.id);
            } catch (e) {
                console.error("Failed to parse user from localstorage", e);
            }
        }
    }, []);

    const refreshSavedItems = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('saved_items')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching saved items:", error);
            } else {
                setSavedItems(data || []);
            }
        } catch (error) {
            console.error("Error fetching saved items:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            refreshSavedItems();
        }
    }, [userId, refreshSavedItems]);

    const isItemSaved = useCallback((itemId: string) => {
        return savedItems.some(item => item.item_id === itemId);
    }, [savedItems]);

    const toggleItem = async (item: Omit<SavedItem, 'id' | 'user_id' | 'created_at'>) => {
        if (!userId) {
            alert("Please login to save items.");
            return;
        }

        // Optimistic update
        const exists = isItemSaved(item.item_id);
        if (exists) {
            setSavedItems(prev => prev.filter(i => i.item_id !== item.item_id));
        } else {
            setSavedItems(prev => [{ ...item, id: 'temp-' + Date.now(), user_id: userId, created_at: new Date().toISOString() } as SavedItem, ...prev]);
        }

        try {
            if (exists) {
                // Delete the saved item
                const { error } = await supabase
                    .from('saved_items')
                    .delete()
                    .eq('user_id', userId)
                    .eq('item_id', item.item_id);

                if (error) {
                    console.error("Failed to delete saved item:", error);
                    refreshSavedItems(); // Revert
                }
            } else {
                // Insert new saved item
                const { error } = await supabase
                    .from('saved_items')
                    .insert({
                        user_id: userId,
                        item_id: item.item_id,
                        category: item.category,
                        name: item.name,
                        image_url: item.image_url,
                    });

                if (error) {
                    console.error("Failed to insert saved item:", error);
                    refreshSavedItems(); // Revert
                } else {
                    // Refresh to get real DB IDs
                    refreshSavedItems();
                }
            }
        } catch (error) {
            console.error("Error toggling item:", error);
            refreshSavedItems(); // Revert
        }
    };

    return (
        <SavedItemsContext.Provider value={{ savedItems, isLoading, refreshSavedItems, isItemSaved, toggleItem }}>
            {children}
        </SavedItemsContext.Provider>
    );
}

export function useSavedItems() {
    const context = useContext(SavedItemsContext);
    if (context === undefined) {
        throw new Error('useSavedItems must be used within a SavedItemsProvider');
    }
    return context;
}
