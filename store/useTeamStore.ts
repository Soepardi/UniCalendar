import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface Team {
    id: string;
    name: string;
    owner_id: string;
    created_at: string;
}

interface TeamMember {
    id: string;
    team_id: string;
    user_id: string;
    role: 'admin' | 'member';
    joined_at: string;
    profile?: {
        username: string;
        full_name: string;
        avatar_url: string;
    };
}

interface TeamState {
    teams: Team[];
    members: Record<string, TeamMember[]>;
    currentTeamId: string | null;
    loading: boolean;
    initialized: boolean;

    fetchTeams: () => Promise<void>;
    fetchMembers: (teamId: string) => Promise<void>;
    createTeam: (name: string) => Promise<void>;
    addMember: (teamId: string, userId: string, role?: 'admin' | 'member') => Promise<void>;
    removeMember: (teamId: string, userId: string) => Promise<void>;
    updateTeam: (teamId: string, name: string) => Promise<void>;
    deleteTeam: (teamId: string) => Promise<void>;
    setCurrentTeamId: (id: string | null) => void;
}

export const useTeamStore = create<TeamState>((set, get) => ({
    teams: [],
    members: {},
    currentTeamId: null,
    loading: false,
    initialized: false,

    fetchTeams: async () => {
        set({ loading: true });
        const { data, error } = await supabase
            .from('teams')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            set({ teams: data, initialized: true });
        }
        set({ loading: false });
    },

    fetchMembers: async (teamId: string) => {
        const { data, error } = await supabase
            .from('team_members')
            .select(`
                *,
                profile:profiles(*)
            `)
            .eq('team_id', teamId);

        if (!error && data) {
            set((state) => ({
                members: {
                    ...state.members,
                    [teamId]: data
                }
            }));
        }
    },

    createTeam: async (name: string) => {
        set({ loading: true });
        // We can get the user ID from auth store if we want to be even faster, 
        // but for now let's just use the direct insert since owner_id can be inferred 
        // OR we just use the current user from auth store.
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            set({ loading: false });
            return;
        }

        const { data: team, error: teamError } = await supabase
            .from('teams')
            .insert([{ name, owner_id: user.id }])
            .select()
            .single();

        if (teamError) {
            set({ loading: false });
            throw teamError;
        }

        // NOTE: team_members entry is now handled by database trigger 'on_team_created'

        // Optimistic/Local update
        set((state) => ({
            teams: [team, ...state.teams],
            currentTeamId: team.id,
            loading: false
        }));
    },

    addMember: async (teamId: string, userId: string, role = 'member') => {
        const { error } = await supabase
            .from('team_members')
            .insert([{ team_id: teamId, user_id: userId, role }]);

        if (error) throw error;
        await get().fetchMembers(teamId);
    },

    removeMember: async (teamId: string, userId: string) => {
        const { error } = await supabase
            .from('team_members')
            .delete()
            .eq('team_id', teamId)
            .eq('user_id', userId);

        if (error) throw error;
        await get().fetchMembers(teamId);
    },

    updateTeam: async (teamId: string, name: string) => {
        const { error } = await supabase
            .from('teams')
            .update({ name })
            .eq('id', teamId);

        if (error) throw error;
        await get().fetchTeams();
    },

    deleteTeam: async (teamId: string) => {
        const { error } = await supabase
            .from('teams')
            .delete()
            .eq('id', teamId);

        if (error) throw error;
        set({ currentTeamId: null });
        await get().fetchTeams();
    },

    setCurrentTeamId: (id) => set({ currentTeamId: id })
}));
