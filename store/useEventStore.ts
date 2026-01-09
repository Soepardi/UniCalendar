import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    date: string; // YYYY-MM-DD
    user_id: string;
}

interface EventState {
    events: Record<string, CalendarEvent[]>; // Map 'YYYY-MM-DD' -> Events[]
    loading: boolean;
    fetchEvents: (monthStart: Date, monthEnd: Date) => Promise<void>;
    addEvent: (event: Omit<CalendarEvent, 'id' | 'user_id'>) => Promise<void>;
    updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
    deleteEvent: (id: string, date: string) => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
    events: {},
    loading: false,

    fetchEvents: async (start, end) => {
        set({ loading: true });
        const startStr = format(start, 'yyyy-MM-dd');
        const endStr = format(end, 'yyyy-MM-dd');

        const { data, error } = await supabase
            .from('events')
            .select('*')
            .gte('date', startStr)
            .lte('date', endStr);

        if (error) {
            console.error('Error fetching events:', error);
            set({ loading: false });
            return;
        }

        // Group by date
        const eventsMap: Record<string, CalendarEvent[]> = {};
        data?.forEach((evt: CalendarEvent) => {
            if (!eventsMap[evt.date]) eventsMap[evt.date] = [];
            eventsMap[evt.date].push(evt);
        });

        // Merge with existing state to avoid wiping other months if we were caching (simple replace for now is safer for consistency)
        // Actually, let's merge carefully? For simplicity in this view-based app, we can just replace the range or merge.
        // Let's simple merge:
        set((state) => ({
            events: { ...state.events, ...eventsMap },
            loading: false
        }));
    },

    addEvent: async (newEvent) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('events')
            .insert([{ ...newEvent, user_id: user.id }])
            .select()
            .single();

        if (error) {
            console.error('Error adding event:', error);
            return;
        }

        if (data) {
            set((state) => {
                const dateKey = data.date;
                const currentDayEvents = state.events[dateKey] || [];
                return {
                    events: {
                        ...state.events,
                        [dateKey]: [...currentDayEvents, data]
                    }
                };
            });
        }
    },

    updateEvent: async (id, updates) => {
        const { error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating event:', error);
            return;
        }

        // We need the date to update the store efficiently. 
        // If date changed, it's complex. For MVP, assume date might change.
        // Easiest is to refetch or manually move.
        // Let's just manually update for now assuming date didn't change or we have the old date.
        // Actually, we should ask the caller to pass the old date if we want optimistic, but let's just refetch the specific day or brute force update.
        // Brute force update in state:
        set((state) => {
            const newEvents = { ...state.events };
            // Find and remove old
            let found = false;
            for (const date in newEvents) {
                const idx = newEvents[date].findIndex(e => e.id === id);
                if (idx !== -1) {
                    const evt = { ...newEvents[date][idx], ...updates };
                    // If date changed, move it
                    if (updates.date && updates.date !== date) {
                        newEvents[date].splice(idx, 1);
                        if (!newEvents[updates.date]) newEvents[updates.date] = [];
                        newEvents[updates.date].push(evt);
                    } else {
                        newEvents[date][idx] = evt;
                    }
                    found = true;
                    break;
                }
            }
            return { events: newEvents };
        });
    },

    deleteEvent: async (id, date) => {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting event:', error);
            return;
        }

        set((state) => {
            const currentDayEvents = state.events[date] || [];
            return {
                events: {
                    ...state.events,
                    [date]: currentDayEvents.filter(e => e.id !== id)
                }
            };
        });
    },
}));
