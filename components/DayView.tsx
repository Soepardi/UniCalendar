'use client';

import React, { useEffect, useRef } from 'react';
import { format, differenceInMinutes, startOfDay, parseISO, isSameDay } from 'date-fns';
import { Plus } from 'lucide-react';

interface DayViewProps {
    date?: Date; // Deprecated but kept for compatibility logic (or remove if unused)
    days?: Date[]; // New multi-day support
    events: any[];
    onEventClick: (event: any) => void;
    onTimeSlotClick: (date: Date) => void;
}

export const DayView: React.FC<DayViewProps> = ({ date, days, events, onEventClick, onTimeSlotClick }) => {
    // Default to single day if days not provided
    const viewDays = days || (date ? [date] : [new Date()]);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Scroll to 8 AM or current time on mount
    useEffect(() => {
        if (scrollRef.current) {
            const hourToScroll = 8; // Default to 8 AM
            const scrollPosition = hourToScroll * 60; // 60px per hour
            scrollRef.current.scrollTop = scrollPosition;
        }
    }, []);



    // Calculate position and height for an event
    const getEventStyle = (event: any) => {
        // Fallback for missing dateStr or time
        const start = event.dateStr ? parseISO(event.dateStr) : new Date();

        // Safety check if parseISO returned invalid date
        if (isNaN(start.getTime())) {
            return { top: '0px', height: '0px', display: 'none' };
        }

        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const duration = event.duration || 60; // Default 1 hour if no duration

        return {
            top: `${startMinutes}px`,
            height: `${duration}px`,
            minHeight: '20px',
        };
    };

    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Header / Allday area could go here */}

            {/* Scrollable Grid */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto relative custom-scrollbar"
                style={{ height: '600px' }}
            >
                <div className="relative min-h-[1440px] flex"> {/* Flex container for columns */}

                    {/* Time Labels Column (Fixed Width) */}
                    <div className="w-16 flex-shrink-0 border-r border-gray-100 bg-white z-20">
                        {hours.map((hour) => (
                            <div key={`label-${hour}`} className="h-[60px] relative">
                                <span className="absolute -top-2.5 right-3 text-xs text-gray-500 font-medium">
                                    {format(new Date().setHours(hour, 0), 'h a')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Day Columns */}
                    <div className="flex-1 flex">
                        {viewDays.map((day, dayIdx) => {
                            const isToday = isSameDay(day, new Date());
                            // Filter events for this specific day
                            const dayEvents = events.filter(event => isSameDay(parseISO(event.dateStr), day));

                            return (
                                <div key={dayIdx} className={`flex-1 relative border-r border-gray-100 min-w-[100px] ${dayIdx === viewDays.length - 1 ? 'border-r-0' : ''}`}>

                                    {/* Hour Grid Lines */}
                                    {hours.map((hour) => (
                                        <div
                                            key={hour}
                                            className="h-[60px] border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer box-border"
                                            onClick={() => {
                                                const clickTime = new Date(day);
                                                clickTime.setHours(hour);
                                                clickTime.setMinutes(0);
                                                onTimeSlotClick(clickTime);
                                            }}
                                        >
                                            {/* Half-hour marker (optional visual aid) */}
                                            {/* <div className="h-px bg-gray-50 mt-[30px] mx-2 opacity-50"></div> */}
                                        </div>
                                    ))}

                                    {/* Events for this Day */}
                                    {dayEvents.map((event) => {
                                        const style = getEventStyle(event);
                                        return (
                                            <div
                                                key={`${event.id}-${event.dateStr}`}
                                                onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                                                className={`absolute left-1 right-1 rounded opacity-90 hover:opacity-100 cursor-pointer overflow-hidden border-l-2 custom-event-shadow px-1 py-0.5 text-[10px] leading-tight transition-all z-10 ${event.type === 'work'
                                                    ? 'bg-red-50 border-red-500 text-red-700'
                                                    : 'bg-[#1a73e8]/10 border-[#1a73e8] text-[#1a73e8]'
                                                    }`}
                                                style={style}
                                            >
                                                <div className="font-bold truncate">{event.title}</div>
                                                <div className="truncate opacity-80">{format(parseISO(event.dateStr), 'h:mm a')}</div>
                                            </div>
                                        );
                                    })}

                                    {/* Current Time Indicator (if today) */}
                                    {isToday && (
                                        <div
                                            className="absolute left-0 right-0 border-t-2 border-red-500 z-30 pointer-events-none"
                                            style={{ top: `${(new Date().getHours() * 60) + new Date().getMinutes()}px` }}
                                        >
                                            <div className="absolute -left-1 w-2 h-2 rounded-full bg-red-500 -mt-[5px]"></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
