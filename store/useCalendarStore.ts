import { create } from 'zustand';

interface CalendarState {
    currentDate: Date;
    selectedCalendars: string[];
    showNativeScript: boolean;
    viewMode: 'day' | 'month' | 'year';
    setDate: (date: Date) => void;
    setYear: (year: number) => void;
    setMonth: (month: number) => void;
    setViewMode: (mode: 'day' | 'month' | 'year') => void;
    toggleCalendar: (calendarId: string) => void;
    toggleNativeScript: () => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
    currentDate: new Date(),
    selectedCalendars: ['gregorian', 'hijri', 'chinese'],
    showNativeScript: false,
    viewMode: 'day',
    setDate: (date) => set({ currentDate: date }),
    setYear: (year) => set((state) => {
        const newDate = new Date(state.currentDate);
        newDate.setFullYear(year);
        return { currentDate: newDate };
    }),
    setMonth: (month) => set((state) => {
        const newDate = new Date(state.currentDate);
        newDate.setMonth(month);
        return { currentDate: newDate };
    }),
    setViewMode: (mode) => set({ viewMode: mode }),
    toggleCalendar: (id) => set((state) => {
        const exists = state.selectedCalendars.includes(id);
        if (exists) {
            return { selectedCalendars: state.selectedCalendars.filter(c => c !== id) };
        }
        return { selectedCalendars: [...state.selectedCalendars, id] };
    }),
    toggleNativeScript: () => set((state) => ({ showNativeScript: !state.showNativeScript })),
}));
