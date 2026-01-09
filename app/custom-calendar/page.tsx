'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useEventStore } from '@/store/useEventStore';
import { useCalendarStore } from '@/store/useCalendarStore';
import { format, addMonths, startOfYear, eachMonthOfInterval, endOfYear } from 'date-fns';
import { ChevronLeft, ChevronRight, Printer, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function CustomCalendarPage() {
    const { user, initialize: initAuth } = useAuthStore();
    const { events, fetchEvents, initialized: eventsInitialized } = useEventStore();
    const router = useRouter();

    // Local state for the "year" being viewed/printed
    const [viewYear, setViewYear] = useState(new Date().getFullYear());
    const [isPrinting, setIsPrinting] = useState(false);

    // Initialize Auth
    useEffect(() => {
        initAuth();
    }, [initAuth]);

    // Fetch Events for the selected year
    useEffect(() => {
        if (user) {
            const start = startOfYear(new Date(viewYear, 0, 1));
            const end = endOfYear(new Date(viewYear, 0, 1));
            fetchEvents(start, end);
        }
    }, [user, viewYear, fetchEvents]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-[#d93025]" />
            </div>
        );
    }

    const months = eachMonthOfInterval({
        start: startOfYear(new Date(viewYear, 0, 1)),
        end: endOfYear(new Date(viewYear, 0, 1))
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 print:bg-white print:p-0">
            {/* Header - Hidden on Print */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Custom Calendar</h1>
                        <p className="text-xs text-gray-500">Design your year view and print</p>
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

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a73e8] text-white rounded-lg font-medium hover:bg-[#1557b0] transition-colors shadow-sm"
                    >
                        <Printer size={16} />
                        Print Calendar
                    </button>
                </div>
            </header>

            {/* Print Content */}
            <div className="max-w-[1200px] mx-auto p-8 print:max-w-none print:w-full print:p-4">
                {/* Print Title - Only visible on print */}
                <div className="hidden print:block mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{viewYear}</h1>
                    <p className="text-sm text-gray-500 uppercase tracking-widest">My Personal Agenda</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 print:grid-cols-3 print:gap-4">
                    {months.map((monthDate) => (
                        <div key={monthDate.toISOString()} className="break-inside-avoid">
                            {/* We can reuse a simplified version of MonthView or just build a small grid here? 
                                Reusing MonthView might bring in too much interactivity or styles not optimized for print.
                                However, for "Agenda", maybe we just want the month grid + list of events below it?
                                Let's try to reuse MonthView but disable interactions via CSS or props if possible.
                                Actually, existing MonthView is heavy. Let's make a lightweight MonthGrid here.
                            */}
                            <div className="border border-gray-100 rounded-xl p-4 print:border-gray-200">
                                <h3 className="font-bold text-lg mb-4 text-[#1a73e8]">{format(monthDate, 'MMMM')}</h3>
                                {/* Simple Grid */}
                                <SimpleMonthGrid date={monthDate} events={events} />
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
                }
            `}</style>
        </div>
    );
}

// Helper for lightweight month grid
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';

function SimpleMonthGrid({ date, events }: { date: Date, events: any }) {
    const start = startOfWeek(startOfMonth(date));
    const end = endOfWeek(endOfMonth(date));
    const days = eachDayOfInterval({ start, end });

    // Flatten events for lookup
    // Note: events is Record<string, CalendarEvent[]>

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
                        className={`
                            aspect-square flex flex-col items-center justify-start py-1 rounded-md
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
