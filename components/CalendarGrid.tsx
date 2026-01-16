'use client';
// Re-trigger build

import React from 'react';
import { useCalendarStore } from '@/store/useCalendarStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useEventStore } from '@/store/useEventStore';
import { useHolidayStore } from '@/store/useHolidayStore';
import { CalendarType, convertDate, toNativeNumerals } from '@/lib/calendars';
import { EventModal } from './events/EventModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    startOfWeek,
    endOfWeek,
    isSameDay,
    addMonths,
    addDays,
    format,
    isSameMonth,
    startOfDay,
    endOfDay
} from 'date-fns';

// Define MonthView internally or importing? 
// The file is self-contained.
// Let's define the internal MonthView component.

const MonthView = ({ headless = false }: { headless?: boolean }) => {
    const { currentDate, selectedCalendars, setDate, setViewMode, showNativeScript } = useCalendarStore();
    const { getLocale } = useLanguageStore();
    const { events, fetchEvents } = useEventStore();
    const { holidays, fetchHolidays } = useHolidayStore();
    const locale = getLocale();

    // Fetch events and HOLIDAYS on mount or month change
    React.useEffect(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        fetchEvents(start, end);
        fetchHolidays();
    }, [currentDate, fetchEvents, fetchHolidays]);

    // Determine Primary Calendar
    const primaryCalendarId = selectedCalendars.length > 0 ? selectedCalendars[0] : 'gregorian';
    const primaryCurrentData = convertDate(currentDate, primaryCalendarId as CalendarType, { locale });

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

    const startDate = startOfWeek(monthStart, { locale, weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { locale, weekStartsOn: 0 });
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const realToday = new Date();

    // Generate Week Days (Native or Standard)
    const weekDays = React.useMemo(() => {
        const start = startOfWeek(new Date(), { locale, weekStartsOn: 0 });
        const end = endOfWeek(start, { locale, weekStartsOn: 0 });
        const interval = eachDayOfInterval({ start, end });

        return interval.map(day => {
            // Default to current locale (likely English) unless Native Script is ON
            if (!showNativeScript) {
                return format(day, 'EEE', { locale });
            }

            // Map calendar type to native locale for weekdays
            let nativeLocaleCode = locale?.code || 'en-US';
            if (['hijri', 'islamic', 'islamic-umalqura', 'islamic-civil', 'islamic-tbla'].includes(primaryCalendarId)) nativeLocaleCode = 'ar-SA';
            else if (primaryCalendarId === 'persian') nativeLocaleCode = 'fa-IR';
            else if (primaryCalendarId === 'hebrew') nativeLocaleCode = 'he';
            else if (primaryCalendarId === 'chinese') nativeLocaleCode = 'zh-CN';
            else if (primaryCalendarId === 'japanese') nativeLocaleCode = 'ja-JP';
            else if (primaryCalendarId === 'korean') nativeLocaleCode = 'ko-KR';
            else if (primaryCalendarId === 'buddhist') nativeLocaleCode = 'th-TH';

            // Javanese specific
            if (primaryCalendarId === 'javanese') {
                const javDays = ["Ahd", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
                return javDays[day.getDay()];
            }

            try {
                return new Intl.DateTimeFormat(nativeLocaleCode, { weekday: 'short' }).format(day);
            } catch {
                return format(day, 'EEE', { locale });
            }
        });
    }, [locale, primaryCalendarId, showNativeScript]);

    return (
        <div className={`bg-white rounded-2xl p-4 md:p-8 shadow-sm ${headless ? 'shadow-none !p-0' : ''}`}>
            {!headless && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 md:mb-6 px-1 md:px-2 pb-4 md:pb-6 border-b-2 border-[#1a73e8]">
                    <h2 className="w-full md:w-auto flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3 text-[#202124] tracking-tight text-center md:text-left">
                        <span className="text-2xl md:text-2xl font-bold uppercase tracking-tight text-[#1a73e8] leading-none">
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
                    {/* Navigation */}
                    {/* Navigation */}
                    <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1 shrink-0 print:hidden shadow-sm border border-gray-200">
                        <button
                            onClick={() => setDate(addMonths(currentDate, -1))}
                            className="p-2 hover:bg-white hover:text-[#1a73e8] rounded-xl transition-all hover:shadow-sm text-gray-500"
                            title="Previous Month"
                        >
                            <ChevronLeft size={18} strokeWidth={2.5} />
                        </button>
                        <button
                            onClick={() => setDate(new Date())}
                            className="px-4 py-1.5 hover:bg-white hover:text-[#1a73e8] rounded-xl text-sm font-bold text-gray-700 transition-all hover:shadow-sm"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setDate(addMonths(currentDate, 1))}
                            className="p-2 hover:bg-white hover:text-[#1a73e8] rounded-xl transition-all hover:shadow-sm text-gray-500"
                            title="Next Month"
                        >
                            <ChevronRight size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            )}

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                {/* Weekday Headers */}
                {weekDays.map((day, i) => (
                    <div key={i} className={`text-center font-bold text-[10px] md:text-sm uppercase tracking-widest py-2 ${((primaryCalendarId === 'hijri' || primaryCalendarId === 'persian') && i === 5)
                        ? 'text-green-600'
                        : (primaryCalendarId === 'hebrew' && i === 6)
                            ? 'text-blue-600'
                            : (!['hijri', 'persian', 'hebrew'].includes(primaryCalendarId) && i === 0)
                                ? 'text-red-500'
                                : 'text-[#5f6368]'
                        }`}>
                        {day}
                    </div>
                ))}

                {/* Days */}
                {calendarDays.map((date, i) => {
                    // Correctly check if date is within the current View Month (native or Gregorian)
                    const isCurrentMonth = date >= startOfDay(monthStart) && date <= endOfDay(monthEnd);

                    const isToday = isSameDay(date, realToday);
                    const isSelected = isSameDay(date, currentDate);
                    const dateKey = format(date, 'yyyy-MM-dd');
                    const dayEvents = events[dateKey] || [];
                    const dayData = selectedCalendars.map(id => convertDate(date, id as CalendarType, { locale }));

                    // Dynamic Holiday from DB
                    const dbHolidayName = holidays[dateKey];
                    const dayHolidays = selectedCalendars
                        .map(id => convertDate(date, id as CalendarType, { locale }).holiday)
                        .filter(Boolean);

                    if (dbHolidayName) {
                        dayHolidays.push(dbHolidayName);
                    }
                    const hasHoliday = dayHolidays.length > 0;

                    // Check for Work category events
                    const hasWork = dayEvents.some(e => e.type?.toLowerCase() === 'work');

                    return (
                        <div
                            key={i}
                            onClick={() => {
                                setDate(date);
                                setViewMode('day');
                            }}
                            className={`min-h-[80px] md:min-h-[120px] rounded-2xl p-2 border transition-all cursor-pointer relative group flex flex-col justify-between ${isSelected ? 'bg-[#e8f0fe] border-[#1a73e8]' : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                                } ${!isCurrentMonth ? 'opacity-40 grayscale' : ''}`}
                        >
                            <div className="flex justify-between items-start">
                                {/* Primary Calendar Day */}
                                <span className={`text-xl md:text-3xl font-bold leading-none ${isToday
                                    ? 'bg-[#1a73e8] text-white w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full shadow-md'
                                    : (hasHoliday || hasWork)
                                        ? 'text-[#d93025]'
                                        : ((primaryCalendarId === 'hijri' || primaryCalendarId === 'persian') && date.getDay() === 5)
                                            ? 'text-green-600' // Friday for Hijri/Persian
                                            : (primaryCalendarId === 'hebrew' && date.getDay() === 6)
                                                ? 'text-blue-600' // Saturday for Hebrew
                                                : (!['hijri', 'persian', 'hebrew'].includes(primaryCalendarId) && date.getDay() === 0)
                                                    ? 'text-red-500' // Sunday for others
                                                    : 'text-[#3c4043]'
                                    }`}>
                                    {showNativeScript && selectedCalendars.length > 0 && dayData[0]
                                        ? toNativeNumerals(dayData[0].day, selectedCalendars[0] as CalendarType)
                                        : dayData[0]?.day || format(date, 'd')}
                                </span>

                                {/* Secondary Calendar Days */}
                                {selectedCalendars.length > 1 && (
                                    <div className="flex flex-col items-end gap-1">
                                        {dayData.slice(1).map((data, idx) => (
                                            <div key={idx} className="text-[10px] text-gray-500 text-right leading-tight">
                                                <span className="font-bold text-gray-700 block">
                                                    {showNativeScript
                                                        ? toNativeNumerals(data.day, selectedCalendars[idx + 1] as CalendarType)
                                                        : data.day}
                                                </span>
                                                <span className="block text-[9px] opacity-80 whitespace-nowrap">
                                                    {data.month}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Event Indicators - Now Titles */}
                            <div className="mt-auto flex flex-col gap-0.5 w-full overflow-hidden">
                                {dayEvents.slice(0, 3).map((evt: any, idx: number) => (
                                    <div
                                        key={evt.id}
                                        className={`text-[10px] md:text-xs truncate px-1 rounded-sm ${evt.type === 'work' ? 'text-red-600 font-medium' : 'text-[#1a73e8]'
                                            }`}
                                        title={evt.title}
                                    >
                                        • {evt.title}
                                    </div>
                                ))}
                                {dayEvents.length > 3 && (
                                    <div className="text-[9px] text-gray-400 pl-1">
                                        +{dayEvents.length - 3} more
                                    </div>
                                )}
                            </div>
                            {
                                hasHoliday && (
                                    <div className="mt-1">
                                        <span className="text-[10px] font-bold text-[#d93025] leading-tight line-clamp-2">
                                            {dayHolidays[0]}
                                        </span>
                                    </div>
                                )
                            }
                        </div>
                    );
                })}
            </div>
        </div >
    );
};

export const CalendarGrid = ({ headless = false }: { headless?: boolean }) => {
    const { currentDate, selectedCalendars, showNativeScript, viewMode, setDate } = useCalendarStore();
    const { getLocale, translations } = useLanguageStore();
    const { holidays } = useHolidayStore();
    const [isEventModalOpen, setIsEventModalOpen] = React.useState(false);
    const locale = getLocale();

    if (viewMode === 'month') {
        return (
            <div id="calendar-grid-export">
                <MonthView headless={headless} />
            </div>
        );
    }

    const allDayHolidays = selectedCalendars.map(id => convertDate(currentDate, id as CalendarType, { locale }).holiday).filter(Boolean);
    const dbHoliday = holidays[format(currentDate, 'yyyy-MM-dd')];
    if (dbHoliday) {
        allDayHolidays.push(dbHoliday);
    }
    const hasAnyHoliday = allDayHolidays.length > 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-2 md:mb-4 px-2 p-4 md:p-6 gap-4 md:gap-0">
                <div className="w-full md:w-auto flex flex-col items-center md:items-start text-center md:text-left">
                    <span className="text-[10px] font-bold text-[#1a73e8] uppercase tracking-widest mb-1">{translations.home.date_label}</span>
                    <h3 className="text-2xl font-medium text-[#202124] tracking-tight">
                        {format(currentDate, 'EEEE, d MMMM yyyy', { locale })}
                    </h3>
                </div>
                {/* Navigation Buttons */}
                <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1 shrink-0 print:hidden shadow-sm border border-gray-200">
                    <button
                        onClick={() => setDate(addDays(currentDate, -1))}
                        className="p-2 hover:bg-white hover:text-[#1a73e8] rounded-xl transition-all hover:shadow-sm text-gray-500"
                        title="Previous Day"
                    >
                        <ChevronLeft size={18} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={() => setDate(new Date())}
                        className="px-4 py-1.5 hover:bg-white hover:text-[#1a73e8] rounded-xl text-sm font-bold text-gray-700 transition-all hover:shadow-sm"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setDate(addDays(currentDate, 1))}
                        className="p-2 hover:bg-white hover:text-[#1a73e8] rounded-xl transition-all hover:shadow-sm text-gray-500"
                        title="Next Day"
                    >
                        <ChevronRight size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {hasAnyHoliday && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-red-700">
                    Holiday: {allDayHolidays.join(', ')}
                </div>
            )}

            <div id="calendar-grid-export" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {selectedCalendars.map((calId) => {
                    const type = calId as CalendarType;
                    const data = convertDate(currentDate, type, { locale });
                    const metaName = translations.calendar_names[type];
                    const metaDesc = translations.calendar_descriptions[type];
                    const displayDate = (showNativeScript && data.fullDateNative) ? data.fullDateNative : data.fullDate;

                    return (
                        <div key={calId} className={`rounded-2xl p-4 md:p-8 flex flex-col border transition-all duration-300 hover:shadow-md ${data.holiday ? 'bg-[#fef2f2] border-[#fbd7d4]' : 'bg-white border-[#dadce0]'}`}>
                            {/* Simplified Card Content for Restoration */}
                            <h3 className="font-bold">{metaName}</h3>
                            <div className="text-4xl my-2">{data.day}</div>
                            <div>{data.month} {data.year}</div>
                            <div className="text-xs text-gray-500 mt-2">{displayDate}</div>
                        </div>
                    );
                })}
            </div>

            <EventModal
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                date={currentDate}
            />
        </div>
    );
}
