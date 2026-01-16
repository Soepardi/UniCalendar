import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { format, addDays, addWeeks, addMonths, addYears, isBefore, isAfter, startOfDay, parseISO, getDay } from 'date-fns';

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    date: string; // YYYY-MM-DD (Start date for recurring)
    time?: string; // HH:mm
    color?: string; // blue, green, etc.
    type?: 'work' | 'personal'; // work=red, personal=yellow
    status?: 'pending' | 'completed' | 'archived';
    user_id: string;
    recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    recurrence_days?: number[]; // 0=Sun, 1=Mon, etc.
    completed_dates?: string[]; // YYYY-MM-DD
    excluded_dates?: string[]; // YYYY-MM-DD
    team_id?: string | null;
    is_public?: boolean;
    share_slug?: string | null;
}

interface EventState {
    events: Record<string, CalendarEvent[]>; // Map 'YYYY-MM-DD' -> Events[]
    loading: boolean;
    initialized: boolean;
    fetchEvents: (monthStart: Date, monthEnd: Date) => Promise<void>;
    addEvent: (event: Omit<CalendarEvent, 'id' | 'user_id'>) => Promise<void>;
    updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
    deleteEvent: (id: string, date: string, choice?: 'all' | 'specific') => Promise<void>;
    archiveEvent: (id: string, date: string, choice?: 'all' | 'specific') => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
    events: {},
    loading: false,
    initialized: false,

    fetchEvents: async (start, end) => {
        set({ loading: true });
        const startStr = format(start, 'yyyy-MM-dd');
        const endStr = format(end, 'yyyy-MM-dd');

        // Fetch events in range OR any recurring event
        // Note: For simplicity/performance in this MVP, we fetch ALL recurring events + specific range events
        // A optimized query would be: (date >= start AND date <= end) OR (recurrence != 'none')
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .or(`date.gte.${startStr},recurrence.neq.none`);
        // Warning: The above OR logic with range might be tricky in Supabase syntax if mixed. 
        // Let's safe-fetch:
        // 1. Events in range
        // 2. Events with recurrence (might need separate query or broad filter)

        // Correct approach for mixed AND/OR in PostgREST is complex. 
        // Let's just fetch broad range + filter client side, or two queries.
        // Query 1: Range
        const q1 = supabase.from('events').select('*').gte('date', startStr).lte('date', endStr);
        // Query 2: Recurring
        const q2 = supabase.from('events').select('*').neq('recurrence', 'none');

        const [res1, res2] = await Promise.all([q1, q2]);

        if (res1.error || res2.error) {
            console.error('Error fetching events:', res1.error || res2.error);
            set({ loading: false });
            return;
        }

        const rawEvents = [...(res1.data || []), ...(res2.data || [])];
        // Deduplicate by ID
        const uniqueEvents = Array.from(new Map(rawEvents.map(item => [item.id, item])).values());

        // Group by date with Expansion
        const eventsMap: Record<string, CalendarEvent[]> = {};

        uniqueEvents.forEach((evt) => {
            const startDate = parseISO(evt.date);

            // 1. If not recurring, just add to its date if in range (or just add it, map handles lookup)
            if (!evt.recurrence || evt.recurrence === 'none') {
                if (!eventsMap[evt.date]) eventsMap[evt.date] = [];
                // Avoid duplicates if multiple fetches overlap
                if (!eventsMap[evt.date].find(e => e.id === evt.id)) {
                    eventsMap[evt.date].push(evt);
                }
                return;
            }

            // 2. Expand Recurring Events
            // Optimization: Jump to start of view range if the event started earlier
            let currentCursor = startDate;

            if (isBefore(startDate, start)) {
                switch (evt.recurrence) {
                    case 'daily':
                        currentCursor = startOfDay(start);
                        break;
                    case 'weekly':
                        // Jump to the same day of week at or after 'start'
                        const daysDiff = Math.ceil(Math.abs(start.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                        const weeksToJump = Math.floor(daysDiff / 7);
                        currentCursor = addWeeks(startDate, weeksToJump);
                        // Ensure we are at or after 'start'
                        while (isBefore(currentCursor, start) && !isSameDay(currentCursor, start)) {
                            currentCursor = addWeeks(currentCursor, 1);
                        }
                        break;
                    case 'monthly':
                        // Jump to the same day of month in the target month
                        const monthsDiff = (start.getFullYear() - startDate.getFullYear()) * 12 + (start.getMonth() - startDate.getMonth());
                        currentCursor = addMonths(startDate, Math.max(0, monthsDiff));
                        // Ensure we didn't undershoot
                        while (isBefore(currentCursor, start) && !isSameDay(currentCursor, start)) {
                            currentCursor = addMonths(currentCursor, 1);
                        }
                        break;
                    case 'yearly':
                        const yearsDiff = start.getFullYear() - startDate.getFullYear();
                        currentCursor = addYears(startDate, Math.max(0, yearsDiff));
                        while (isBefore(currentCursor, start) && !isSameDay(currentCursor, start)) {
                            currentCursor = addYears(currentCursor, 1);
                        }
                        break;
                    case 'custom':
                        currentCursor = startOfDay(start);
                        break;
                }
            }

            const limitLoop = 500; // Reduced safety break since we jump now
            let count = 0;

            while (isBefore(currentCursor, end) || isSameDay(currentCursor, end)) {
                count++;
                if (count > limitLoop) break;

                const cursorStr = format(currentCursor, 'yyyy-MM-dd');

                // Check if this instance matches the rule
                let match = false;

                // Initial date always matches (unless we exclude it? standard behavior includes it)
                if (isSameDay(currentCursor, startDate)) match = true;
                else {
                    switch (evt.recurrence) {
                        case 'daily': match = true; break;
                        case 'weekly':
                            // Basic weekly: same day of week (implicit from addWeeks, but we iterate days?)
                            // If we iterate by addDays(1), checks are needed.
                            // If we use specific incrementors, matching is implicit.
                            // Let's use smart incrementors instead of daily check for efficiency.
                            break;
                        case 'monthly':
                            // same day of month
                            match = currentCursor.getDate() === startDate.getDate();
                            break;
                        case 'yearly':
                            match = currentCursor.getDate() === startDate.getDate() && currentCursor.getMonth() === startDate.getMonth();
                            break;
                        case 'custom':
                            // specific days of week
                            if (evt.recurrence_days && evt.recurrence_days.includes(getDay(currentCursor))) {
                                match = true;
                            }
                            break;
                    }
                }

                // If matches AND is within our fetch view (start-end)
                // (Also ensure we don't duplicate the master instance if it was added above? 
                //  Actually, for recurring events, we should generate ALL instances as "virtual" copies 
                //  so they carry the correct 'date' property for the UI).
                if (match && (isAfter(currentCursor, start) || cursorStr === startStr) && (isBefore(currentCursor, end) || cursorStr === endStr)) {
                    // Check exclusion
                    if (evt.excluded_dates?.includes(cursorStr)) {
                        // Skip this instance
                    } else {
                        if (!eventsMap[cursorStr]) eventsMap[cursorStr] = [];

                        // Check completion override
                        let currentStatus = evt.status;
                        if (evt.completed_dates?.includes(cursorStr)) {
                            currentStatus = 'completed';
                        }

                        // Create Virtual Instance
                        // We keep original ID but modify date.
                        // Note: Editing a virtual instance usually splits it. For now, UI only supports "Edit Master".
                        const instance = {
                            ...evt,
                            date: cursorStr,
                            status: currentStatus,
                            isVirtual: true,
                            originalDate: evt.date
                        };
                        eventsMap[cursorStr].push(instance);
                    }
                }

                // Increment Cursor efficiently
                switch (evt.recurrence) {
                    case 'daily': currentCursor = addDays(currentCursor, 1); break;
                    case 'weekly': currentCursor = addWeeks(currentCursor, 1); break; // Date-fns addWeeks keeps day of week
                    case 'monthly': currentCursor = addMonths(currentCursor, 1); break;
                    case 'yearly': currentCursor = addYears(currentCursor, 1); break;
                    case 'custom': currentCursor = addDays(currentCursor, 1); break; // Check every day for custom
                    case 'none': break; // Should not happen
                    default: currentCursor = addDays(currentCursor, 1);
                }
            }
        });

        set((state) => ({
            events: eventsMap, // Replace whole map to avoid "ghost" instances from previous recurrence calcs
            loading: false,
            initialized: true
        }));
    },

    addEvent: async (newEvent) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (newEvent.is_public && !newEvent.share_slug) {
            newEvent.share_slug = Math.random().toString(36).substring(2, 10);
        }

        const { data, error } = await supabase
            .from('events')
            .insert([{ ...newEvent, user_id: user.id }])
            .select()
            .single();

        if (error) {
            console.error('Error adding event:', error);
            return;
        }

        // Re-fetch to generate recurrences properly
        // Or simpler: just reload page? Ideally optimistically update...
        // For recurring, optimistic update is hard (need to run the expansion logic). 
        // Let's trigger a fetch.
        const store = get();
        // Just fetch plenty range around
        const today = new Date();
        store.fetchEvents(addMonths(today, -1), addMonths(today, 6));
    },

    updateEvent: async (id, updates) => {
        if (updates.is_public && !updates.share_slug) {
            updates.share_slug = Math.random().toString(36).substring(2, 10);
        }

        const { error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating event:', error);
            return;
        }

        // Trigger fetch to re-calc
        const store = get();
        const today = new Date();
        store.fetchEvents(addMonths(today, -1), addMonths(today, 6));
    },

    deleteEvent: async (id, date, choice = 'all') => {
        if (choice === 'specific') {
            // Get current event to update excluded_dates
            const { data: evt } = await supabase.from('events').select('excluded_dates').eq('id', id).single();
            if (evt) {
                const excluded = evt.excluded_dates || [];
                if (!excluded.includes(date)) {
                    await supabase.from('events').update({ excluded_dates: [...excluded, date] }).eq('id', id);
                }
            }
        } else {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting event:', error);
                return;
            }
        }

        // Trigger fetch
        const store = get();
        const today = new Date();
        store.fetchEvents(addMonths(today, -1), addMonths(today, 6));
    },

    archiveEvent: async (id, date, choice = 'all') => {
        if (choice === 'specific') {
            // Get current event to update completed_dates
            const { data: evt } = await supabase.from('events').select('completed_dates').eq('id', id).single();
            if (evt) {
                const completed = evt.completed_dates || [];
                if (!completed.includes(date)) {
                    await supabase.from('events').update({ completed_dates: [...completed, date] }).eq('id', id);
                }
            }
        } else {
            const { error } = await supabase
                .from('events')
                .update({ status: 'archived' })
                .eq('id', id);

            if (error) {
                console.error('Error archiving event:', error);
                return;
            }
        }

        // Trigger fetch
        const store = get();
        const today = new Date();
        store.fetchEvents(addMonths(today, -1), addMonths(today, 6));
    }
}));

// Helper for 'isSameDay' check inside loop if needed
function isSameDay(d1: Date, d2: Date) {
    return d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();
}
