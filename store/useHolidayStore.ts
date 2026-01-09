import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

export interface Holiday {
    id: string;
    date: string; // YYYY-MM-DD
    name: string;
    calendar_type: string;
    created_at: string;
}

interface HolidayState {
    holidays: Record<string, string>; // dateKey -> name
    loading: boolean;
    initialized: boolean;
    fetchHolidays: () => Promise<void>;
}

export const useHolidayStore = create<HolidayState>((set) => ({
    holidays: {},
    loading: false,
    initialized: false,

    fetchHolidays: async () => {
        set({ loading: true });
        const { data, error } = await supabase
            .from('holidays')
            .select('*');

        if (error) {
            console.error('Error fetching holidays:', error);
            set({ loading: false });
            return;
        }

        const holidaysMap: Record<string, string> = {};
        data?.forEach((h: Holiday) => {
            // Store by YYYY-MM-DD for fast lookup
            holidaysMap[h.date] = h.name;
        });

        set({ holidays: holidaysMap, loading: false, initialized: true });
    }
}));
