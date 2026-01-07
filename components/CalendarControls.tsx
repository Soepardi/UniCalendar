'use client';

import React from 'react';
import { useCalendarStore } from '@/store/useCalendarStore';
import { CALENDAR_META, CalendarType } from '@/lib/calendars';
import { format } from 'date-fns';
import { DownloadButton } from './DownloadButton';
import { useLanguageStore } from '@/store/useLanguageStore';

export const CalendarControls = () => {
    const {
        currentDate,
        setYear,
        setMonth,
        setDate,
        selectedCalendars,
        toggleCalendar,
        viewMode,
        setViewMode,
        showNativeScript,
        toggleNativeScript
    } = useCalendarStore();

    const { getLocale, translations } = useLanguageStore();
    const locale = getLocale();

    // Generate localized month names dynamically
    const months = React.useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => {
            return format(new Date(2000, i, 1), 'MMMM', { locale });
        });
    }, [locale]);

    const years = Array.from({ length: 201 }, (_, i) => 1900 + i); // 1900 to 2100

    return (
        <div className="flex flex-col gap-4 md:gap-8">
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 md:gap-6 justify-between bg-white p-3 md:p-6 rounded-[2rem] border border-[#dadce0] shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full xl:w-auto">
                    {/* View Mode Toggle */}
                    <div className="flex w-full md:w-auto bg-[#f1f3f4] p-1 rounded-full border border-[#dadce0]">
                        {(['day', 'month'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-full font-medium text-sm transition-all duration-200 ${viewMode === mode
                                    ? 'bg-white text-[#1a73e8] shadow-sm'
                                    : 'text-[#5f6368] hover:bg-black/5 hover:text-[#202124]'
                                    }`}
                            >
                                {mode === 'day' ? translations.common.view_mode_day : translations.common.view_mode_month}
                            </button>
                        ))}
                    </div>

                    {/* Date Navigation */}
                    <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
                        <div className="flex items-center border border-[#dadce0] rounded-full px-3 md:px-4 py-2 hover:bg-[#f8f9fa] transition-colors bg-white">
                            <select
                                value={currentDate.getMonth()}
                                onChange={(e) => setMonth(parseInt(e.target.value))}
                                className="bg-transparent text-sm font-medium text-[#202124] outline-none cursor-pointer pr-4 appearance-none"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%235f6368'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
                                    backgroundPosition: 'right center',
                                    backgroundSize: '16px',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            >
                                {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                            </select>
                            <div className="w-px h-4 bg-[#dadce0] mx-2"></div>
                            <select
                                value={currentDate.getFullYear()}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                className="bg-transparent text-sm font-medium text-[#202124] outline-none cursor-pointer pr-4 appearance-none"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%235f6368'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
                                    backgroundPosition: 'right center',
                                    backgroundSize: '16px',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        <input
                            type="date"
                            className="border border-[#dadce0] rounded-full px-4 py-2 text-sm font-medium text-[#202124] outline-none hover:bg-[#f8f9fa] transition-colors focus:border-[#1a73e8]"
                            value={format(currentDate, 'yyyy-MM-dd')}
                            onChange={(e) => e.target.valueAsDate && setDate(e.target.valueAsDate)}
                        />
                    </div>

                </div>

                <div className="flex flex-wrap w-full xl:w-auto items-center justify-between xl:justify-end gap-3 md:gap-4 border-t xl:border-t-0 border-gray-100 pt-3 xl:pt-0">
                    {/* Options Toggle */}
                    <button
                        onClick={toggleNativeScript}
                        className={`flex-1 xl:flex-none justify-center flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full border text-xs md:text-sm font-medium transition-all ${showNativeScript
                            ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8]'
                            : 'bg-white border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa]'
                            }`}
                    >
                        <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 transition-all ${showNativeScript
                            ? 'bg-[#1a73e8] border-[#1a73e8]'
                            : 'bg-transparent border-[#5f6368]'
                            }`}></div>
                        {translations.common.native_script}
                    </button>

                    {/* Export Button */}
                    <DownloadButton />
                </div>
            </div>

            {/* Calendar Selectors */}
            <div className="flex flex-wrap gap-2 px-2">
                {Object.entries(CALENDAR_META).map(([type, meta]) => (
                    <button
                        key={type}
                        onClick={() => toggleCalendar(type)}
                        className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${selectedCalendars.includes(type)
                            ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8]'
                            : 'bg-white border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa] hover:border-[#d2dce0]'
                            }`}
                    >
                        {translations.calendar_names[type as CalendarType]}
                    </button>
                ))}
            </div>
        </div>
    );
};
