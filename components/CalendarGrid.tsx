'use client';

import React from 'react';
import { useCalendarStore } from '@/store/useCalendarStore';
import { CalendarType, convertDate, CALENDAR_META } from '@/lib/calendars';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    startOfWeek,
    endOfWeek,
    isSameDay,
    addMonths,
    addDays
} from 'date-fns';

const MonthView = () => {
    const { currentDate, selectedCalendars, setDate, setViewMode } = useCalendarStore();

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const realToday = new Date();

    return (
        <div className="bg-white rounded-3xl p-8 border border-[#dadce0]">
            <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-2xl font-medium text-[#202124] tracking-tight">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setDate(addMonths(currentDate, -1))}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f8f9fa] border border-transparent hover:border-[#dadce0] transition-all text-[#5f6368]"
                        title="Previous Month"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                        onClick={() => setDate(addMonths(currentDate, 1))}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f8f9fa] border border-transparent hover:border-[#dadce0] transition-all text-[#5f6368]"
                        title="Next Month"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <button
                        onClick={() => setDate(new Date())}
                        className="ml-2 px-4 py-2 text-sm font-medium text-[#1a73e8] hover:bg-[#e8f0fe] rounded-full transition-all"
                    >
                        Today
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-[#5f6368] py-4">
                        {day}
                    </div>
                ))}
                {calendarDays.map((date, idx) => {
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const isToday = isSameDay(date, realToday);
                    const isSelected = isSameDay(date, currentDate);

                    // Check for holidays across all active calendars for this specific date
                    const dayHolidays = selectedCalendars.map(id => convertDate(date, id as CalendarType).holiday).filter(Boolean);
                    const hasHoliday = dayHolidays.length > 0;

                    return (
                        <div
                            key={idx}
                            onClick={() => {
                                setDate(date);
                                setViewMode('day');
                            }}
                            className={`min-h-[120px] p-3 border transition-all cursor-pointer group relative ${isCurrentMonth
                                ? isSelected
                                    ? 'bg-white border-[#1a73e8] z-10 shadow-sm'
                                    : hasHoliday
                                        ? 'bg-[#fef2f2] border-[#fbd7d4]'
                                        : 'bg-white border-[#f1f3f4] hover:bg-[#f8f9fa]'
                                : 'opacity-20 pointer-events-none'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-base font-medium transition-colors ${isToday
                                    ? 'text-white'
                                    : hasHoliday
                                        ? 'text-[#d93025]'
                                        : isSelected
                                            ? 'text-[#1a73e8]'
                                            : 'text-[#202124]'
                                    }`}>
                                    <div className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${isToday
                                        ? 'bg-[#1a73e8] ring-4 ring-[#1a73e8]/20'
                                        : isSelected
                                            ? 'ring-2 ring-[#1a73e8]/30'
                                            : ''
                                        }`}>
                                        {format(date, 'd')}
                                    </div>
                                </span>
                            </div>

                            <div className="space-y-1 mt-auto">
                                {selectedCalendars.filter(id => id !== 'gregorian').slice(0, 3).map(calId => {
                                    const data = convertDate(date, calId as CalendarType);
                                    return (
                                        <div key={calId} className="flex flex-col gap-0.5 overflow-hidden">
                                            <div className="flex items-center gap-1.5 ">
                                                <div className={`w-1 h-1 rounded-full shrink-0 ${data.holiday ? 'bg-[#d93025]' : 'bg-[#1a73e8]'}`}></div>
                                                <span className={`text-[10px] truncate ${data.holiday ? 'text-[#d93025] font-medium' : 'text-[#5f6368]'}`}>
                                                    {data.day} {data.month}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Consolidated Holidays at the bottom */}
                            {dayHolidays.length > 0 && (
                                <div className="mt-2 pt-1 border-t border-[#fbd7d4]/30">
                                    <div className="text-[8px] font-bold text-[#d93025] leading-tight line-clamp-2">
                                        {dayHolidays.join(' • ')}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export const CalendarGrid = () => {
    const { currentDate, selectedCalendars, showNativeScript, viewMode, setDate, setViewMode } = useCalendarStore();

    if (viewMode === 'month') {
        return (
            <div id="calendar-grid-export">
                <MonthView />
            </div>
        );
    }

    const allDayHolidays = selectedCalendars.map(id => convertDate(currentDate, id as CalendarType).holiday).filter(Boolean);
    const hasAnyHoliday = allDayHolidays.length > 0;

    return (
        <div className="space-y-8">
            {/* Day View Navigation Header */}
            <div className="flex items-center justify-between mb-2 px-2 p-6">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#1a73e8] uppercase tracking-widest mb-1">Date</span>
                    <h3 className="text-2xl font-medium text-[#202124] tracking-tight">
                        {format(currentDate, 'EEEE, d MMMM yyyy')}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setDate(addDays(currentDate, -1))}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f8f9fa] border border-transparent hover:border-[#dadce0] transition-all text-[#5f6368]"
                        title="Previous Day"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                        onClick={() => setDate(addDays(currentDate, 1))}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f8f9fa] border border-transparent hover:border-[#dadce0] transition-all text-[#5f6368]"
                        title="Next Day"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <button
                        onClick={() => setDate(new Date())}
                        className="ml-2 px-4 py-2 text-sm font-medium text-[#1a73e8] hover:bg-[#e8f0fe] rounded-full transition-all"
                    >
                        Today
                    </button>
                </div>
            </div>

            {/* Unified Global Holiday Banner */}
            {hasAnyHoliday && (
                <div className="relative overflow-hidden bg-white border border-[#fbd7d4] rounded-[2rem] p-8 shadow-sm group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="text-8xl">🎉</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#fef2f2] to-white pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-[#fef2f2] border border-[#fbd7d4] flex items-center justify-center text-3xl shadow-sm">
                                🎊
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-[#d93025] uppercase tracking-[0.2em] mb-2 block">Yay it's a holiday!</span>
                                <h3 className="text-3xl font-medium text-[#202124] tracking-tight">
                                    {allDayHolidays.join(' • ')}
                                </h3>
                            </div>
                        </div>
                        <div className="hidden md:block w-px h-16 bg-[#d93025]/10"></div>
                        <div className="max-w-sm">
                            <p className="text-sm text-[#5f6368] leading-relaxed italic">
                                "May your happiness be large and your bills be small."
                            </p>
                            <p className="text-[10px] text-[#d93025]/60 font-medium mt-2 uppercase tracking-wider">
                                Calendars viewed : {selectedCalendars.length} types
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div id="calendar-grid-export" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {selectedCalendars.map((calId) => {
                    const type = calId as CalendarType;
                    const data = convertDate(currentDate, type);
                    const meta = CALENDAR_META[type];
                    const displayDate = (showNativeScript && data.fullDateNative) ? data.fullDateNative : data.fullDate;

                    return (
                        <div
                            key={calId}
                            className={`rounded-3xl p-8 flex flex-col border transition-all duration-300 hover:shadow-md ${data.holiday
                                ? 'bg-[#fef2f2] border-[#fbd7d4]'
                                : 'bg-white border-[#dadce0]'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-lg font-medium text-[#202124] leading-tight mb-1">
                                        {meta.name}
                                    </h3>
                                    <p className="text-xs text-[#5f6368] leading-tight">
                                        {meta.description}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-[#f8f9fa] border border-[#dadce0] flex items-center justify-center text-[#5f6368]">
                                    <span className="text-xs font-bold uppercase">{type.substring(0, 2)}</span>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-5xl font-medium text-[#202124] tracking-tight">
                                        {data.day}
                                    </span>
                                    <span className="text-lg font-medium text-[#1a73e8]">
                                        {data.month}
                                    </span>
                                </div>
                                <div className="text-xl font-medium text-[#9aa0a6] mb-6">
                                    {data.year}
                                </div>

                                <div className="pt-6 border-t border-[#f1f3f4] flex items-center justify-between">
                                    <div className="text-xs text-[#5f6368] font-medium">
                                        {displayDate}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {data.cycle && (
                                            <div className="text-[10px] font-medium bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] px-3 py-1 rounded-full">
                                                {data.cycle}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
