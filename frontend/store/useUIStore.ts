'use client';

import { create } from 'zustand';

interface UIState {
    isGlobalLoading: boolean;
    sidebarOpen: boolean;

    // Actions
    setGlobalLoading: (loading: boolean) => void;
    setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
    isGlobalLoading: false,
    sidebarOpen: true,

    setGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
