'use client';

import React from 'react';
import { useCalendarStore } from '@/store/useCalendarStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { CalendarType, convertDate, toNativeNumerals } from '@/lib/calendars';
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    startOfWeek,
    endOfWeek,
    isSameDay,
    addMonths,
    addDays,
    format
} from 'date-fns';

const MonthView = () => {
    const { currentDate, selectedCalendars, setDate, setViewMode, showNativeScript } = useCalendarStore();
    const { getLocale, translations } = useLanguageStore();
    const locale = getLocale();

    // Determine Primary Calendar (Gregorian if selected/default, otherwise the first selected)
    // Use the first selected calendar as primary, or default to Gregorian
    const primaryCalendarId = selectedCalendars.length > 0 ? selectedCalendars[0] : 'gregorian';

    // Get Primary Calendar Data for Current Heading
    const primaryCurrentData = convertDate(currentDate, primaryCalendarId as CalendarType, { locale });

    // Determine Month Boundaries
    // If Gregorian, use standard start/end of month
    // If Native, calculate native start/end (e.g., 1 Muharram to 30 Muharram)
    let monthStart, monthEnd;
    if (primaryCalendarId === 'gregorian') {
        monthStart = startOfMonth(currentDate);
        monthEnd = endOfMonth(monthStart);
    } else {
        const { getNativeMonthBoundaries } = require('@/lib/calendars');
        const boundaries = getNativeMonthBoundaries(currentDate, primaryCalendarId, locale);
        monthStart = boundaries.start;
        monthEnd = boundaries.end;
    }

    const startDate = startOfWeek(monthStart, { locale, weekStartsOn: 0 }); // Pass locale for correct week start
    const endDate = endOfWeek(monthEnd, { locale, weekStartsOn: 0 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const realToday = new Date();

    // Format weekday names
    const weekDays = eachDayOfInterval({
        start: startOfWeek(new Date(), { locale, weekStartsOn: 0 }),
        end: endOfWeek(startOfWeek(new Date(), { locale, weekStartsOn: 0 }), { locale, weekStartsOn: 0 })
    }).map(day => format(day, 'EEE', { locale }));

    return (
        <div className="bg-white rounded-3xl p-4 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 md:mb-6 px-1 md:px-2 pb-4 md:pb-6 border-b-2 border-[#1a73e8]">
                <h2 className="w-full md:w-auto flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3 text-[#202124] tracking-tight text-center md:text-left">
                    <span className="text-2xl md:text-2xl font-bold uppercase tracking-tight text-[#1a73e8] leading-none">
                        {/* Use translated/formatted month/year */}
                        {(showNativeScript && primaryCurrentData.monthNative) ? primaryCurrentData.monthNative : primaryCurrentData.month} {
                            showNativeScript
                                ? (primaryCurrentData.yearNative || (() => {
                                    const y = parseInt(primaryCurrentData.year.toString());
                                    return isNaN(y) ? primaryCurrentData.year : toNativeNumerals(y, primaryCalendarId as CalendarType);
                                })())
                                : primaryCurrentData.year
                        }
                    </span>
                    {primaryCurrentData.monthNative && (
                        <span className="text-sm md:text-lg font-medium text-[#5f6368] opacity-80 leading-none">
                            {showNativeScript
                                ? `${primaryCurrentData.month} ${primaryCurrentData.year}`
                                : `${primaryCurrentData.monthNative} ${primaryCurrentData.yearNative || (() => {
                                    const y = parseInt(primaryCurrentData.year.toString());
                                    return isNaN(y) ? primaryCurrentData.year : toNativeNumerals(y, primaryCalendarId as CalendarType);
                                })()
                                }`
                            }
                        </span>
                    )}
                </h2>
                <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2 shrink-0 print:hidden bg-[#f8f9fa] md:bg-transparent p-1 md:p-0 rounded-full md:rounded-none">
                    <button
                        onClick={() => {
                            // Native Navigation: Jump to previous month based on boundaries
                            if (primaryCalendarId === 'gregorian') {
                                setDate(startOfMonth(addMonths(currentDate, -1)));
                            } else {
                                // Go to the day before the current month start
                                const prevMonthDate = new Date(monthStart);
                                prevMonthDate.setDate(prevMonthDate.getDate() - 5); // Go back a safe amount to be inside prev month
                                setDate(prevMonthDate);
                            }
                        }}
                        className="w-10 h-10 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-white md:hover:bg-[#f8f9fa] border border-transparent md:hover:border-[#dadce0] transition-all text-[#5f6368] shadow-sm md:shadow-none"
                        title={translations.common.previous_month}
                    >
                        <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>

                    <button
                        onClick={() => setDate(new Date())}
                        className="px-6 py-2 text-xs md:text-sm font-bold text-[#1a73e8] bg-white md:bg-transparent hover:bg-[#e8f0fe] rounded-full transition-all border border-[#dadce0] md:border-[#1a73e8]/10 shadow-sm md:shadow-none uppercase tracking-wider"
                    >
                        {translations.common.today}
                    </button>

                    <button
                        onClick={() => {
                            // Native Navigation: Jump to next month
                            if (primaryCalendarId === 'gregorian') {
                                setDate(startOfMonth(addMonths(currentDate, 1)));
                            } else {
                                // Go to the day after current month end
                                const nextMonthDate = new Date(monthEnd);
                                nextMonthDate.setDate(nextMonthDate.getDate() + 1);
                                setDate(nextMonthDate);
                            }
                        }}
                        className="w-10 h-10 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-white md:hover:bg-[#f8f9fa] border border-transparent md:hover:border-[#dadce0] transition-all text-[#5f6368] shadow-sm md:shadow-none"
                        title={translations.common.next_month}
                    >
                        <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7">
                {weekDays.map((day, idx) => {
                    // Cultural Weekend Logic for Headers
                    let headerBg = 'bg-[#f1f3f4]'; // Default Light Gray
                    let headerText = 'text-[#202124]'; // Default Black

                    // Hijri / Persian -> Friday (5) is Green
                    if (['hijri', 'islamic', 'islamic-umalqura', 'islamic-civil', 'islamic-tbla', 'persian'].includes(primaryCalendarId)) {
                        if (idx === 5) {
                            headerBg = 'bg-[#34a853]';
                            headerText = 'text-white';
                        }
                    }
                    // Hebrew -> Saturday (6) is Blue
                    else if (primaryCalendarId === 'hebrew') {
                        if (idx === 6) {
                            headerBg = 'bg-[#1a73e8]';
                            headerText = 'text-white';
                        }
                    }
                    // Default / Gregorian -> Sunday (0) is Red
                    else {
                        if (idx === 0) {
                            headerBg = 'bg-[#d93025]';
                            headerText = 'text-white';
                        }
                    }

                    return (
                        <div key={day} className={`text-center text-xs font-bold ${headerText} uppercase tracking-wider ${headerBg} py-2 rounded-md mb-2 mx-0.5`}>
                            {day}
                        </div>
                    );
                })}
                {calendarDays.map((date, idx) => {
                    const isToday = isSameDay(date, realToday);
                    const isSelected = isSameDay(date, currentDate);

                    // Get Primary Date Data for this cell
                    const primaryDateData = convertDate(date, primaryCalendarId as CalendarType, { locale });

                    // Determine if this cell belongs to the currently displayed month
                    // If Gregorian: compare Month Index
                    // If Native: compare Month String Name (Simple enough proxy for now)
                    let isCurrentMonth = false;
                    if (primaryCalendarId === 'gregorian') {
                        isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    } else {
                        isCurrentMonth = primaryDateData.month === primaryCurrentData.month;
                    }

                    // Check for holidays across all active calendars for this specific date
                    const dayHolidays = selectedCalendars.map(id => convertDate(date, id as CalendarType, { locale }).holiday).filter(Boolean);
                    const hasHoliday = dayHolidays.length > 0;

                    return (
                        <div
                            key={idx}
                            onClick={() => {
                                setDate(date);
                                setViewMode('day');
                            }}
                            className={`min-h-[70px] md:min-h-[120px] p-1 md:p-2 border-t border-r border-[#f1f3f4] transition-all cursor-pointer group relative ${isCurrentMonth
                                ? isSelected
                                    ? 'bg-white z-10 ring-2 ring-[#1a73e8] rounded-xl'
                                    : hasHoliday
                                        ? 'bg-[#fff0f0]'
                                        : 'bg-white hover:bg-[#f8f9fa]'
                                : 'opacity-20 pointer-events-none'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-0.5 md:mb-1">
                                <span className={`text-base md:text-lg font-bold transition-colors`}>
                                    <div className={`w-7 h-7 md:w-9 md:h-9 flex shrink-0 items-center justify-center rounded-full transition-all ${isToday
                                        ? 'bg-[#1a73e8] ring-2 md:ring-4 ring-[#1a73e8]/20'
                                        : isSelected
                                            ? 'ring-2 ring-[#1a73e8]/30'
                                            : ''
                                        }`}>
                                        {/* Display Primary Calendar Day */}
                                        <span className={`${isToday ? 'text-white' : ''} ${!isToday ? (() => {
                                            // 1. Holiday Override (Red)
                                            if (hasHoliday) return 'text-[#d93025]';

                                            // 2. Cultural Weekend Logic
                                            const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat

                                            // Hijri / Persian -> Friday (5) is Green
                                            if (['hijri', 'islamic', 'islamic-umalqura', 'islamic-civil', 'islamic-tbla', 'persian'].includes(primaryCalendarId)) {
                                                if (dayOfWeek === 5) return 'text-[#34a853]'; // Lighter Green
                                                if (dayOfWeek === 0) return 'text-[#202124]'; // Explicitly Black for Sunday
                                                return 'text-[#202124]';
                                            }

                                            // Hebrew -> Saturday (6) is Blue
                                            if (primaryCalendarId === 'hebrew') {
                                                if (dayOfWeek === 6) return 'text-[#1a73e8]'; // Blue
                                                if (dayOfWeek === 0) return 'text-[#202124]'; // Explicitly Black for Sunday
                                                return 'text-[#202124]';
                                            }

                                            // Default / Gregorian -> Sunday (0) is Red
                                            if (dayOfWeek === 0) return 'text-[#d93025]'; // Red

                                            return 'text-[#202124]';
                                        })() : ''}`}>
                                            {(primaryCalendarId === 'gregorian' || !showNativeScript) ? primaryDateData.day : toNativeNumerals(primaryDateData.day, primaryCalendarId as CalendarType)}
                                        </span>
                                    </div>
                                </span>
                            </div>

                            <div className="space-y-1 mt-auto">
                                {/* Exclude Primary Calendar from the small list */}
                                {selectedCalendars.filter(id => id !== primaryCalendarId).slice(0, 3).map(calId => {
                                    const data = convertDate(date, calId as CalendarType, { locale });
                                    return (
                                        <div key={calId} className="flex flex-col gap-0.5 overflow-hidden">
                                            <div className="flex items-center gap-1.5 ">
                                                <div className={`w-1 h-1 rounded-full shrink-0 ${data.holiday ? 'bg-[#d93025]' : 'bg-[#1a73e8]'}`}></div>
                                                <span className={`text-[10px] truncate ${data.holiday ? 'text-[#d93025] font-medium' : 'text-[#5f6368]'}`}>
                                                    {showNativeScript ? toNativeNumerals(data.day, calId as CalendarType) : data.day} {(showNativeScript && data.monthNative) ? data.monthNative : data.month}
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
        </div >
    );
};


export const CalendarGrid = () => {
    const { currentDate, selectedCalendars, showNativeScript, viewMode, setDate, setViewMode } = useCalendarStore();
    const { getLocale, translations } = useLanguageStore();
    const locale = getLocale();

    if (viewMode === 'month') {
        return (
            <div id="calendar-grid-export">
                <MonthView />
            </div>
        );
    }

    const allDayHolidays = selectedCalendars.map(id => convertDate(currentDate, id as CalendarType, { locale }).holiday).filter(Boolean);
    const hasAnyHoliday = allDayHolidays.length > 0;

    return (
        <div className="space-y-8">
            {/* Day View Navigation Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 px-2 p-4 md:p-6 gap-4 md:gap-0">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#1a73e8] uppercase tracking-widest mb-1">{translations.home.date_label}</span>
                    <h3 className="text-2xl font-medium text-[#202124] tracking-tight">
                        {format(currentDate, 'EEEE, d MMMM yyyy', { locale })}
                    </h3>
                </div>
                <div className="flex items-center gap-2 print:hidden">
                    <button
                        onClick={() => setDate(addDays(currentDate, -1))}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f8f9fa] border border-transparent hover:border-[#dadce0] transition-all text-[#5f6368]"
                        title={translations.common.previous_day}
                    >
                        <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                        onClick={() => setDate(addDays(currentDate, 1))}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f8f9fa] border border-transparent hover:border-[#dadce0] transition-all text-[#5f6368]"
                        title={translations.common.next_day}
                    >
                        <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <button
                        onClick={() => setDate(new Date())}
                        className="ml-2 px-4 py-2 text-sm font-medium text-[#1a73e8] hover:bg-[#e8f0fe] rounded-full transition-all"
                    >
                        {translations.common.today}
                    </button>
                </div>
            </div>

            {/* Unified Global Holiday Banner */}
            {hasAnyHoliday && (
                <div className="relative overflow-hidden bg-white border border-[#fbd7d4] rounded-[2rem] p-6 md:p-8 shadow-sm group">
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
                                <span className="text-[10px] font-bold text-[#d93025] uppercase tracking-[0.2em] mb-2 block">{translations.common.holiday_cheer}</span>
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
                                {translations.common.calendars_viewed} : {selectedCalendars.length} types
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div id="calendar-grid-export" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {selectedCalendars.map((calId) => {
                    const type = calId as CalendarType;
                    const data = convertDate(currentDate, type, { locale });
                    // Use translated strings for name and description
                    const metaName = translations.calendar_names[type];
                    const metaDesc = translations.calendar_descriptions[type];

                    const displayDate = (showNativeScript && data.fullDateNative) ? data.fullDateNative : data.fullDate;

                    return (
                        <div
                            key={calId}
                            className={`rounded-3xl p-4 md:p-8 flex flex-col border transition-all duration-300 hover:shadow-md ${data.holiday
                                ? 'bg-[#fef2f2] border-[#fbd7d4]'
                                : 'bg-white border-[#dadce0]'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4 md:mb-8">
                                <div>
                                    <h3 className="text-base md:text-lg font-medium text-[#202124] leading-tight mb-1">
                                        {metaName}
                                    </h3>
                                    <p className="text-[10px] md:text-xs text-[#5f6368] leading-tight">
                                        {metaDesc}
                                    </p>
                                </div>
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#f8f9fa] border border-[#dadce0] flex items-center justify-center text-[#5f6368]">
                                    <span className="text-[10px] md:text-xs font-bold uppercase">{type.substring(0, 2)}</span>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-4xl md:text-5xl font-medium text-[#202124] tracking-tight">
                                        {showNativeScript ? toNativeNumerals(data.day, calId as CalendarType) : data.day}
                                    </span>
                                    <span className="text-lg font-medium text-[#1a73e8]">
                                        {(showNativeScript && data.monthNative) ? data.monthNative : data.month}
                                    </span>
                                </div>
                                <div className="text-xl font-medium text-[#9aa0a6] mb-6">
                                    {showNativeScript ? toNativeNumerals(parseInt(data.year.toString()), calId as CalendarType) : data.year}
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
