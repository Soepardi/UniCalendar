import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    profile: any | null;
    sessionProcessed: boolean;
    isAuthModalOpen: boolean;
    initialize: () => Promise<void>;
    signOut: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, metadata: any) => Promise<void>;
    refreshProfile: () => Promise<void>;
    setProfile: (profile: any) => void;
    openAuthModal: () => void;
    closeAuthModal: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    profile: null,
    sessionProcessed: false,
    initialize: async () => {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user ?? null;
        set({ user, sessionProcessed: true });

        if (user) {
            await get().refreshProfile();
        }

        // Listen for changes
        supabase.auth.onAuthStateChange(async (_event, session) => {
            const newUser = session?.user ?? null;
            set({ user: newUser, sessionProcessed: true });

            if (newUser) {
                await get().refreshProfile();
            } else {
                set({ profile: null });
            }
        });
    },
    refreshProfile: async () => {
        const { user } = get();
        if (!user) return;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!error && data) {
            set({ profile: data });
        }
    },
    setProfile: (profile: any) => set({ profile }),
    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, profile: null });
    },
    signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    },
    signUp: async (email, password, metadata) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: metadata }
        });
        if (error) throw error;
    },
    isAuthModalOpen: false,
    openAuthModal: () => set({ isAuthModalOpen: true }),
    closeAuthModal: () => set({ isAuthModalOpen: false }),
}));
