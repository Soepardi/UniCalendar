'use client';

import React, { useState } from 'react';
import { Printer, Loader2 } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { CalendarDocument } from '../pdf/CalendarDocument';
import { useLanguageStore } from '@/store/useLanguageStore';

interface MyCalendarPrintButtonProps {
    viewYear: number;
    events: any;
    weeklyHoliday: number;
    specialDay: number;
}

export const MyCalendarPrintButton = ({ viewYear, events, weeklyHoliday, specialDay }: MyCalendarPrintButtonProps) => {
    const [loading, setLoading] = useState(false);
    const { translations, getLocale } = useLanguageStore();

    const handlePrint = async () => {
        setLoading(true);
        try {
            // Generate dates for the viewYear (12 months)
            const datesToExport: Date[] = [];
            for (let i = 0; i < 12; i++) {
                datesToExport.push(new Date(viewYear, i, 1));
            }

            // Filter events to only include 'work' type
            const filteredEvents: Record<string, any[]> = {};
            if (events) {
                Object.keys(events).forEach(key => {
                    const workEvents = events[key].filter((e: any) => e.type === 'work');
                    if (workEvents.length > 0) {
                        filteredEvents[key] = workEvents;
                    }
                });
            }

            // Generate PDF Blob
            // We force 'gregorian' as requested and use the custom weekly settings

            const blob = await pdf(
                <CalendarDocument
                    dates={datesToExport}
                    selectedCalendars={['gregorian']}
                    translations={translations}
                    locale={getLocale()}
                    logoUrl={window.location.origin + '/logo.png'}
                    showNativeScript={false}
                    events={filteredEvents}
                    weeklyHoliday={weeklyHoliday}
                    specialDay={specialDay}
                />
            ).toBlob();

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `my-calendar-${viewYear}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Print generation failed', error);
            alert('Failed to generate PDF');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 bg-[#1a73e8] text-white rounded-lg font-medium hover:bg-[#1557b0] transition-colors shadow-sm text-sm">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />} <span className="hidden sm:inline">Print</span>
        </button>
    );
};
