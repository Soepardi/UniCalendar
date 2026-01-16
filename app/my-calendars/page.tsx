'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useEventStore } from '@/store/useEventStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { supabase } from '@/lib/supabase';
import { format, startOfYear, endOfYear, eachMonthOfInterval, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Printer, ArrowLeft, Plus, Save, Trash2, Calendar as CalendarIcon, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { EventModal } from '@/components/events/EventModal';

interface SavedCalendar {
    id: string;
    title: string;
    year: number;
    created_at: string;
}

export default function MyCalendarsPage() {
    const { user, initialize: initAuth } = useAuthStore();
    const { events, fetchEvents } = useEventStore();
    const { addToast, confirm } = useNotificationStore();
    const router = useRouter();

    // UI State
    const [mode, setMode] = useState<'list' | 'editor'>('list');
    const [loading, setLoading] = useState(true);

    // Data State
    const [savedCalendars, setSavedCalendars] = useState<SavedCalendar[]>([]);

    // Editor State
    const [currentCalendarId, setCurrentCalendarId] = useState<string | null>(null);
    const [calendarTitle, setCalendarTitle] = useState('My Calendar');
    const [viewYear, setViewYear] = useState(new Date().getFullYear());

    // Event Modal State
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    // For refreshing events after modal close
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Initialize Auth
    useEffect(() => {
        initAuth();
    }, [initAuth]);

    // Fetch Saved Calendars
    useEffect(() => {
        if (user) {
            fetchSavedCalendars();
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

    // Fetch Events when year changes or editor opens
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
        setMode('editor');
    };

    const handleEdit = (cal: SavedCalendar) => {
        setCurrentCalendarId(cal.id);
        setCalendarTitle(cal.title);
        setViewYear(cal.year);
        setMode('editor');
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        confirm({
            title: 'Delete Calendar',
            message: 'Are you sure you want to delete this calendar? This action cannot be undone.',
            confirmText: 'Delete',
            type: 'danger',
            onConfirm: async () => {
                const { error } = await supabase.from('saved_calendars').delete().eq('id', id);
                if (error) {
                    addToast('Failed to delete calendar', 'error');
                } else {
                    addToast('Calendar deleted', 'success');
                    fetchSavedCalendars();
                }
            }
        });
    };

    const handleSaveString = async () => {
        if (!user) return;

        const calendarData = {
            user_id: user.id,
            title: calendarTitle,
            year: viewYear
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
            addToast('Failed to save calendar', 'error');
        } else {
            addToast('Calendar saved successfully!', 'success');
            fetchSavedCalendars();
            setMode('list');
        }
    };

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        setIsEventModalOpen(true);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-[#d93025]" />
            </div>
        );
    }

    if (mode === 'list') {
        return (
            <div className="min-h-screen bg-[#fafafa] p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Calendars</h1>
                            <p className="text-gray-500 mt-1">Manage and print your yearly agendas</p>
                        </div>
                        <button
                            onClick={handleCreateNew}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1a73e8] text-white rounded-xl font-bold hover:bg-[#1557b0] transition-colors shadow-sm active:scale-95"
                        >
                            <Plus size={20} />
                            Create New
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedCalendars.length === 0 ? (
                                <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
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
                                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
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
            </div>
        );
    }

    // EDITOR MODE
    const months = eachMonthOfInterval({
        start: startOfYear(new Date(viewYear, 0, 1)),
        end: endOfYear(new Date(viewYear, 0, 1))
    });

    return (
        <div className="min-h-screen bg-white text-gray-900 print:bg-white print:p-0">
            {/* Event Modal for Adding Agenda */}
            <EventModal
                isOpen={isEventModalOpen}
                onClose={() => { setIsEventModalOpen(false); setRefreshTrigger(prev => prev + 1); }}
                date={selectedDate}
            />

            {/* Header - Hidden on Print */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setMode('list')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        {/* Editable Title */}
                        <div className="relative group">
                            <input
                                type="text"
                                value={calendarTitle}
                                onChange={(e) => setCalendarTitle(e.target.value)}
                                className="text-xl font-bold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-[#1a73e8] outline-none bg-transparent px-1 py-0.5 transition-all"
                            />
                            <Edit2 size={12} className="absolute -right-4 top-1/2 -translate-y-1/2 text-gray-400 opacity-0 group-hover:opacity-100 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Year Selector */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewYear(y => y - 1)}
                            className="p-1 hover:bg-white rounded shadow-sm transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="font-bold text-sm px-2 w-16 text-center">{viewYear}</span>
                        <button
                            onClick={() => setViewYear(y => y + 1)}
                            className="p-1 hover:bg-white rounded shadow-sm transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="h-6 w-px bg-gray-200"></div>

                    <button
                        onClick={handleSaveString}
                        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors text-sm"
                    >
                        <Save size={16} />
                        Save
                    </button>

                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a73e8] text-white rounded-lg font-medium hover:bg-[#1557b0] transition-colors shadow-sm text-sm"
                    >
                        <Printer size={16} />
                        Print
                    </button>
                </div>
            </header>

            {/* Print Content */}
            <div className="max-w-[1200px] mx-auto p-8 print:max-w-none print:w-full print:p-4">
                {/* Print Title - Only visible on print */}
                <div className="hidden print:block mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{calendarTitle}</h1>
                    <p className="text-sm text-gray-500 uppercase tracking-widest">{viewYear}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 print:grid-cols-3 print:gap-4">
                    {months.map((monthDate) => (
                        <div key={monthDate.toISOString()} className="break-inside-avoid">
                            <div className="border border-gray-100 rounded-xl p-4 print:border-gray-200">
                                <h3 className="font-bold text-lg mb-4 text-[#1a73e8]">{format(monthDate, 'MMMM')}</h3>
                                <SimpleMonthGrid date={monthDate} events={events} onDayClick={handleDayClick} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 0.5cm;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                    }
                    /* Hide modal and other UI during print */
                    div[role="dialog"] { display: none !important; }
                }
            `}</style>
        </div>
    );
}

// Stats Month Grid
function SimpleMonthGrid({ date, events, onDayClick }: { date: Date, events: any, onDayClick: (d: Date) => void }) {
    const start = startOfWeek(startOfMonth(date));
    const end = endOfWeek(endOfMonth(date));
    const days = eachDayOfInterval({ start, end });

    return (
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <div key={d} className="font-bold text-gray-400 mb-2">{d}</div>
            ))}
            {days.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayEvents = events[dateKey] || [];
                const isCurrentMonth = isSameMonth(day, date);

                return (
                    <div
                        key={day.toISOString()}
                        onClick={() => onDayClick(day)}
                        className={`
                            aspect-square flex flex-col items-center justify-start py-1 rounded-md cursor-pointer hover:bg-gray-50 transition-colors
                            ${isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}
                            ${dayEvents.length > 0 ? 'bg-blue-50 font-bold text-[#1a73e8]' : ''}
                        `}
                    >
                        <span>{format(day, 'd')}</span>
                        {dayEvents.length > 0 && (
                            <div className="mt-0.5 w-1 h-1 rounded-full bg-[#1a73e8]" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
