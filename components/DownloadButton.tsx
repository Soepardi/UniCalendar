'use client';

import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useCalendarStore } from '@/store/useCalendarStore';
import { CalendarDocument } from './pdf/CalendarDocument';

export const DownloadButton = () => {
    const { translations, getLocale } = useLanguageStore();
    const { currentDate, selectedCalendars } = useCalendarStore();
    const [loading, setLoading] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    const handleDownload = async (mode: 'month' | 'year') => {
        setLoading(true);
        setShowOptions(false);
        try {
            let datesToExport: Date[] = [];

            if (mode === 'month') {
                datesToExport = [currentDate];
            } else {
                // Generate 12 months for the current year
                const year = currentDate.getFullYear();
                for (let i = 0; i < 12; i++) {
                    datesToExport.push(new Date(year, i, 1));
                }
            }

            // Generate PDF Blob
            const blob = await pdf(
                <CalendarDocument
                    dates={datesToExport}
                    selectedCalendars={selectedCalendars}
                    translations={translations}
                    locale={getLocale()}
                    logoUrl={window.location.origin + '/UniCalendar/logo.png'}
                />
            ).toBlob();

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = mode === 'month'
                ? `unical-month-${currentDate.toISOString().slice(0, 7)}.pdf`
                : `unical-year-${currentDate.getFullYear()}.pdf`;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Download failed', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowOptions(!showOptions)}
                disabled={loading}
                className={`flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-3 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 border ${loading
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-[#1a73e8] text-white border-transparent hover:bg-[#185abc] hover:shadow-md'
                    }`}
            >
                <span className="relative z-10 hidden md:inline">{loading ? translations.common.processing : translations.common.export}</span>
                <span className="relative z-10 md:hidden">{loading ? '' : 'Export'}</span>
                {!loading && (
                    <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                )}
                {loading && (
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
            </button>

            {/* Dropdown Menu */}
            {showOptions && !loading && (
                <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="p-1.5 space-y-0.5">
                        <button
                            onClick={() => handleDownload('month')}
                            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors flex items-start gap-3 group"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-gray-900">Current Month</div>
                                <div className="text-xs text-gray-500 font-medium">Single page PDF</div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleDownload('year')}
                            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors flex items-start gap-3 group"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-gray-900">Full Year</div>
                                <div className="text-xs text-gray-500 font-medium">12-page PDF bundle</div>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
