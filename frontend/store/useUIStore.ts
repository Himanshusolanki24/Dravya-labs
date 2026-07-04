'use client';

import { create } from 'zustand';

interface IUIState {
    isGlobalLoading: boolean;
    sidebarOpen: boolean;

    // Actions
    setGlobalLoading: (loading: boolean) => void;
    setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<IUIState>()((set) => ({
    isGlobalLoading: false,
    sidebarOpen: true,

    setGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
