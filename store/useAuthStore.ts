import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    sessionProcessed: boolean;
    isAuthModalOpen: boolean;
    initialize: () => Promise<void>;
    signOut: () => Promise<void>;
    openAuthModal: () => void;
    closeAuthModal: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    sessionProcessed: false,
    initialize: async () => {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        set({ user: session?.user ?? null, sessionProcessed: true });

        // Listen for changes
        supabase.auth.onAuthStateChange((_event, session) => {
            set({ user: session?.user ?? null, sessionProcessed: true });
        });
    },
    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null });
    },
    isAuthModalOpen: false,
    openAuthModal: () => set({ isAuthModalOpen: true }),
    closeAuthModal: () => set({ isAuthModalOpen: false }),
}));
