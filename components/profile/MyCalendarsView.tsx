'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useEventStore } from '@/store/useEventStore';
import { useHolidayStore } from '@/store/useHolidayStore';
import { AgendaModal } from '../events/AgendaModal';
import { supabase } from '@/lib/supabase';
import { format, startOfYear, endOfYear, eachMonthOfInterval, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Printer, ArrowLeft, Plus, Save, Trash2, Calendar as CalendarIcon, Edit2, Loader2 } from 'lucide-react';
import { useLanguageStore } from '@/store/useLanguageStore';
import dynamic from 'next/dynamic';

const MyCalendarPrintButton = dynamic(() => import('./MyCalendarPrintButton').then(mod => mod.MyCalendarPrintButton), {
    ssr: false,
    loading: () => (
        <button className="flex items-center gap-2 px-3 py-2 bg-[#1a73e8] text-white rounded-lg font-medium shadow-sm text-sm opacity-50 cursor-not-allowed">
            <Loader2 size={16} className="animate-spin" /> <span className="hidden sm:inline">Loading...</span>
        </button>
    )
});

interface SavedCalendar {
    id: string;
    title: string;
    year: number;
    created_at: string;
    weekly_holiday?: number;
    weekly_special_day?: number;
}

export const MyCalendarsView = () => {
    const { user } = useAuthStore();
    const { events, fetchEvents } = useEventStore();
    const { holidays, fetchHolidays } = useHolidayStore();

    // UI State
    const [mode, setMode] = useState<'list' | 'editor'>('list');
    const [loading, setLoading] = useState(true);

    // Data State
    const [savedCalendars, setSavedCalendars] = useState<SavedCalendar[]>([]);

    // Editor State
    const [currentCalendarId, setCurrentCalendarId] = useState<string | null>(null);
    const [calendarTitle, setCalendarTitle] = useState('My Calendar');
    const [viewYear, setViewYear] = useState(new Date().getFullYear());

    // Weekly Settings
    const [weeklyHoliday, setWeeklyHoliday] = useState<number>(0); // Default Sunday
    const [specialDay, setSpecialDay] = useState<number>(5); // Default Friday

    // Event Modal State
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Fetch Saved Calendars
    useEffect(() => {
        if (user) {
            fetchSavedCalendars();
            fetchHolidays();
        }
    }, [user]);

    const fetchSavedCalendars = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('saved_calendars')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching calendars:', error);
        } else {
            setSavedCalendars(data || []);
        }
        setLoading(false);
    };

    // Fetch Events
    useEffect(() => {
        if (user && mode === 'editor') {
            const start = startOfYear(new Date(viewYear, 0, 1));
            const end = endOfYear(new Date(viewYear, 0, 1));
            fetchEvents(start, end);
        }
    }, [user, viewYear, mode, fetchEvents, refreshTrigger]);

    const handleCreateNew = () => {
        setCurrentCalendarId(null);
        setCalendarTitle('My New Calendar');
        setViewYear(new Date().getFullYear());
        setWeeklyHoliday(0);
        setSpecialDay(5);
        setMode('editor');
    };

    const handleEdit = (cal: SavedCalendar) => {
        setCurrentCalendarId(cal.id);
        setCalendarTitle(cal.title);
        setViewYear(cal.year);
        setWeeklyHoliday(cal.weekly_holiday ?? 0);
        setSpecialDay(cal.weekly_special_day ?? 5);
        setMode('editor');
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this calendar?')) return;

        const { error } = await supabase.from('saved_calendars').delete().eq('id', id);
        if (error) {
            console.error('Error deleting calendar:', error);
            alert('Failed to delete calendar');
        } else {
            fetchSavedCalendars();
        }
    };

    const handleSaveString = async () => {
        if (!user) return;

        const calendarData = {
            user_id: user.id,
            title: calendarTitle,
            year: viewYear,
            weekly_holiday: weeklyHoliday,
            weekly_special_day: specialDay
        };

        let error;
        if (currentCalendarId) {
            const { error: err } = await supabase
                .from('saved_calendars')
                .update(calendarData)
                .eq('id', currentCalendarId);
            error = err;
        } else {
            const { error: err } = await supabase
                .from('saved_calendars')
                .insert([calendarData]);
            error = err;
        }

        if (error) {
            console.error('Error saving calendar:', error);
            alert('Failed to save calendar');
        } else {
            alert('Calendar saved successfully!');
            fetchSavedCalendars();
            setMode('list');
        }
    };

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        setIsEventModalOpen(true);
    };

    if (mode === 'list') {
        return (
            <div className="p-6">
                <div className="flex justify-end mb-6">
                    <button
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a73e8] text-white rounded-lg font-medium hover:bg-[#1557b0] transition-all shadow-sm active:scale-95 text-sm"
                    >
                        <Plus size={18} />
                        Create New Calendar
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedCalendars.length === 0 ? (
                            <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <CalendarIcon size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No calendars yet</h3>
                                <p className="text-gray-500 mb-6 max-w-sm mx-auto">Create your first custom calendar to organize your year.</p>
                                <button
                                    onClick={handleCreateNew}
                                    className="text-[#1a73e8] font-bold hover:underline"
                                >
                                    Create one now
                                </button>
                            </div>
                        ) : (
                            savedCalendars.map(cal => (
                                <div
                                    key={cal.id}
                                    onClick={() => handleEdit(cal)}
                                    className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden hover:border-blue-200"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => handleDelete(cal.id, e)}
                                            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-blue-50 text-[#1a73e8] rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xl">
                                            {cal.year}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#1a73e8] transition-colors">{cal.title}</h3>
                                            <p className="text-xs text-gray-500 mt-1">Created on {new Date(cal.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        );
    }

    // EDITOR MODE
    const months = eachMonthOfInterval({
        start: startOfYear(new Date(viewYear, 0, 1)),
        end: endOfYear(new Date(viewYear, 0, 1))
    });

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <div className="bg-white min-h-screen print:p-0">
            <AgendaModal
                isOpen={isEventModalOpen}
                onClose={() => { setIsEventModalOpen(false); setRefreshTrigger(prev => prev + 1); }}
                date={selectedDate}
            />

            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden shadow-sm">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setMode('list')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
                        title="Back to list"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <div className="relative group flex-1 md:flex-none">
                        <input
                            type="text"
                            value={calendarTitle}
                            onChange={(e) => setCalendarTitle(e.target.value)}
                            className="text-lg font-bold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-[#1a73e8] outline-none bg-transparent px-1 py-0.5 transition-all w-full md:w-64 placeholder-gray-400"
                            placeholder="Calendar Name"
                        />
                        <Edit2 size={12} className="absolute -right-4 top-1/2 -translate-y-1/2 text-gray-400 opacity-0 group-hover:opacity-100 pointer-events-none" />
                    </div>
                </div>

                <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                    {/* Settings Group */}
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span className="text-gray-500">Off:</span>
                            <select
                                value={weeklyHoliday}
                                onChange={(e) => setWeeklyHoliday(Number(e.target.value))}
                                className="bg-transparent font-semibold text-gray-900 outline-none cursor-pointer hover:text-red-600"
                            >
                                {daysOfWeek.map((day, i) => <option key={i} value={i}>{day}</option>)}
                            </select>
                        </div>
                        <div className="w-px h-4 bg-gray-200"></div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="text-gray-500">Special:</span>
                            <select
                                value={specialDay}
                                onChange={(e) => setSpecialDay(Number(e.target.value))}
                                className="bg-transparent font-semibold text-gray-900 outline-none cursor-pointer hover:text-blue-600"
                            >
                                {daysOfWeek.map((day, i) => <option key={i} value={i}>{day}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Action Group */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
                            <button onClick={() => setViewYear(y => y - 1)} className="p-1.5 hover:bg-gray-50 rounded-md transition-all text-gray-500 hover:text-gray-900"><ChevronLeft size={14} /></button>
                            <span className="font-bold text-sm px-2 min-w-[3rem] text-center tabular-nums">{viewYear}</span>
                            <button onClick={() => setViewYear(y => y + 1)} className="p-1.5 hover:bg-gray-50 rounded-md transition-all text-gray-500 hover:text-gray-900"><ChevronRight size={14} /></button>
                        </div>

                        <div className="h-6 w-px bg-gray-200 mx-1"></div>

                        <button onClick={handleSaveString} className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg font-medium transition-colors text-sm border border-transparent hover:border-gray-200">
                            <Save size={16} /> <span className="hidden sm:inline">Save</span>
                        </button>
                        <MyCalendarPrintButton
                            viewYear={viewYear}
                            events={events}
                            weeklyHoliday={weeklyHoliday}
                            specialDay={specialDay}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto p-4 md:p-8 print:max-w-none print:w-full print:p-4">
                <div className="hidden print:block mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{calendarTitle}</h1>
                    <p className="text-sm text-gray-500 uppercase tracking-widest">{viewYear}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 print:grid-cols-3 print:gap-4">
                    {months.map((monthDate) => (
                        <div key={monthDate.toISOString()} className="break-inside-avoid">
                            <div className="border border-gray-200 rounded-xl p-4 print:border-gray-200 hover:border-[#1a73e8]/30 transition-colors">
                                <h3 className="font-bold text-lg mb-4 text-[#1a73e8]">{format(monthDate, 'MMMM')}</h3>
                                <SimpleMonthGrid
                                    date={monthDate}
                                    events={events}
                                    holidays={holidays}
                                    weeklyHoliday={weeklyHoliday}
                                    specialDay={specialDay}
                                    onDayClick={handleDayClick}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page { size: landscape; margin: 0.5cm; }
                    body { -webkit-print-color-adjust: exact; }
                    div[role="dialog"] { display: none !important; }
                    aside, nav { display: none !important; }
                    main { padding: 0 !important; overflow: visible !important; }
                }
            `}</style>
        </div >
    );
};

function SimpleMonthGrid({
    date,
    events,
    holidays,
    weeklyHoliday,
    specialDay,
    onDayClick
}: {
    date: Date,
    events: any,
    holidays: Record<string, string>,
    weeklyHoliday: number,
    specialDay: number,
    onDayClick: (d: Date) => void
}) {
    const start = startOfWeek(startOfMonth(date));
    const end = endOfWeek(endOfMonth(date));
    const days = eachDayOfInterval({ start, end });

    return (
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={`${d}-${i}`} className={`font-bold mb-2 ${i === weeklyHoliday ? 'text-red-500' : i === specialDay ? 'text-blue-500' : 'text-gray-400'}`}>
                    {d}
                </div>
            ))}
            {days.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayEvents = events[dateKey] || [];
                const isCurrentMonth = isSameMonth(day, date);

                const isWeeklyHoliday = day.getDay() === weeklyHoliday;
                const isSpecialDay = day.getDay() === specialDay;
                const dbHolidayName = holidays[dateKey];

                // Check for 'work' events
                const hasWork = dayEvents.some((e: any) => e.type === 'work');

                return (
                    <div
                        key={day.toISOString()}
                        onClick={() => onDayClick(day)}
                        className={`
                            aspect-square flex flex-col items-center justify-start py-1 rounded-md cursor-pointer transition-colors relative group
                            ${!isCurrentMonth ? 'opacity-30' : ''}
                            ${(isWeeklyHoliday || dbHolidayName || hasWork) ? 'bg-red-50 text-red-700 hover:bg-red-100' :
                                isSpecialDay ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' :
                                    'hover:bg-gray-50 text-gray-900'}
                        `}
                        title={dbHolidayName || ''}
                    >
                        <span className={`font-medium ${(isWeeklyHoliday || dbHolidayName || hasWork) ? 'text-red-600' : isSpecialDay ? 'text-blue-600' : ''
                            }`}>
                            {format(day, 'd')}
                        </span>

                        <div className="flex gap-0.5 mt-0.5">
                            {dayEvents.map((evt: any) => (
                                <div
                                    key={evt.id}
                                    className={`w-1 h-1 rounded-full ${evt.type === 'work' ? 'bg-red-500' : 'bg-yellow-400'}`}
                                    title={evt.title}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
