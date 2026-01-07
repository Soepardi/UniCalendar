import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    startOfWeek,
    endOfWeek,
    isSameDay,
    format
} from 'date-fns';
import { convertDate, CalendarType } from '@/lib/calendars';
import { enUS, zhCN, id, arSA, faIR, he, th, ja, ko } from 'date-fns/locale';

// Register Fonts (using standard fonts for now to ensure speed, can embed custom fonts later)
// Note: @react-pdf/renderer supports registering fonts from URL or local file
// Register Fonts via jsDelivr CDN
// Outfit (Default/Latin)
Font.register({
    family: 'Outfit',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/gh/Outfitio/Outfit-Fonts@main/fonts/ttf/Outfit-Regular.ttf' },
        { src: 'https://cdn.jsdelivr.net/gh/Outfitio/Outfit-Fonts@main/fonts/ttf/Outfit-Bold.ttf', fontWeight: 'bold' }
    ]
});

// Noto Sans SC (Simplified Chinese)
Font.register({
    family: 'Noto Sans SC',
    src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@latest/files/noto-sans-sc-chinese-simplified-400-normal.woff'
});

// Noto Sans JP (Japanese)
Font.register({
    family: 'Noto Sans JP',
    src: 'https://cdn.jsdelivr.net/npm/fontsource-noto-sans-jp@4.0.0/files/noto-sans-jp-japanese-400-normal.woff'
});

// Noto Sans KR (Korean)
Font.register({
    family: 'Noto Sans KR',
    src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@4.0.0/files/noto-sans-kr-korean-400-normal.woff'
});

// Noto Sans Arabic (Arabic, Persian)
Font.register({
    family: 'Noto Sans Arabic',
    src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-arabic@latest/files/noto-sans-arabic-arabic-400-normal.woff'
});

// Noto Sans Hebrew (Hebrew)
Font.register({
    family: 'Noto Sans Hebrew',
    src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-hebrew@latest/files/noto-sans-hebrew-hebrew-400-normal.woff'
});

// Noto Sans Thai (Thai)
Font.register({
    family: 'Noto Sans Thai',
    src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-thai@latest/files/noto-sans-thai-thai-400-normal.woff'
});

const getFontFamily = (localeCode: string) => {
    if (localeCode.startsWith('zh')) return 'Noto Sans SC';
    if (localeCode.startsWith('ja')) return 'Noto Sans JP';
    if (localeCode.startsWith('ko')) return 'Noto Sans KR';
    if (localeCode.startsWith('ar') || localeCode.startsWith('fa')) return 'Noto Sans Arabic';
    if (localeCode.startsWith('he')) return 'Noto Sans Hebrew';
    if (localeCode.startsWith('th')) return 'Noto Sans Thai';
    return 'Outfit';
};

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: '20mm',
        // fontFamily will be dynamic
    },
    header: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#1a73e8', // Accent color line
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24, // Reduced title size
        color: '#1a73e8', // Colored title
        fontWeight: 'bold',
        textTransform: 'uppercase', // Modern touch
        letterSpacing: 2,
    },
    subTitle: {
        fontSize: 10,
        color: '#5f6368',
        marginTop: 4,
        letterSpacing: 1,
    },
    grid: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        // Remove outer border for cleaner look
    },
    headerCell: {
        width: '14.28%',
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f3f4', // Lighter header background
        borderRadius: 4, // Rounded header
        marginBottom: 4,
    },
    headerText: {
        fontSize: 10,
        color: '#202124',
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
    cell: {
        width: '14.28%',
        height: 60, // Reduced from 75 to fit 6 rows
        padding: 4, // Reduced padding
        borderTopWidth: 1, // Subtle separators
        borderColor: '#f1f3f4',
        position: 'relative',
    },
    dayNumber: {
        fontSize: 18, // Much larger date number
        color: '#202124',
        marginBottom: 2, // Reduced margin
        textAlign: 'right',
        fontWeight: 'bold',
    },
    holidayCell: {
        backgroundColor: '#fff0f0', // Very subtle red tint
        borderRadius: 8, // Rounded highlights
    },
    holidayText: {
        fontSize: 8,
        color: '#d93025',
        marginTop: 3,
        fontWeight: 'medium',
    },
    calendarInfo: {
        fontSize: 8,
        color: '#80868b', // Lighter text
        marginTop: 1,
    },
    otherMonth: {
        opacity: 0.2,
    }
});

interface CalendarDocumentProps {
    dates: Date[]; // Changed from single currentDate to array
    selectedCalendars: string[];
    translations: any;
    locale: any;
    logoUrl?: string;
}

export const CalendarDocument = ({ dates, selectedCalendars, translations, locale, logoUrl }: CalendarDocumentProps) => {
    // Logic extracted from MonthView
    // Logic should match MonthView: Use first selected as primary
    const primaryCalendarId = selectedCalendars.length > 0 ? selectedCalendars[0] : 'gregorian';

    return (
        <Document>
            {dates.map((currentDate, pageIndex) => {
                const primaryCurrentData = convertDate(currentDate, primaryCalendarId as CalendarType, { locale });

                // Determine Month Boundaries
                let monthStart, monthEnd;
                if (primaryCalendarId === 'gregorian') {
                    monthStart = startOfMonth(currentDate);
                    monthEnd = endOfMonth(monthStart);
                } else {
                    // We need to import this helper or duplicate logic. Since it's in lib, we can import validly.
                    const { getNativeMonthBoundaries } = require('@/lib/calendars');
                    const boundaries = getNativeMonthBoundaries(currentDate, primaryCalendarId, locale);
                    monthStart = boundaries.start;
                    monthEnd = boundaries.end;
                }

                const startDate = startOfWeek(monthStart, { locale, weekStartsOn: 0 });
                const endDate = endOfWeek(monthEnd, { locale, weekStartsOn: 0 });

                const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
                const weekDays = eachDayOfInterval({
                    start: startOfWeek(new Date(), { locale, weekStartsOn: 0 }),
                    end: endOfWeek(startOfWeek(new Date(), { locale, weekStartsOn: 0 }), { locale, weekStartsOn: 0 })
                }).map(day => format(day, 'EEE', { locale }));

                return (
                    <Page key={pageIndex} size="A4" orientation="landscape" style={{ ...styles.page, fontFamily: getFontFamily(locale?.code || 'en-US') }}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                {logoUrl && (
                                    <Image src={logoUrl} style={{ height: 32 }} />
                                )}
                                <View>
                                    <Text style={styles.title}>
                                        {primaryCurrentData.month} {primaryCurrentData.year}
                                    </Text>
                                    <Text style={styles.subTitle}>
                                        Created by UniCal Calendar
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Grid Header (Days) */}
                        <View style={styles.grid}>
                            {weekDays.map((day, idx) => {
                                // Cultural Weekend Logic for Headers
                                let headerBg = '#f1f3f4'; // Default Light Gray
                                let headerText = '#202124'; // Default Black

                                // Hijri / Persian -> Friday (5) is Green
                                if (['hijri', 'islamic', 'islamic-umalqura', 'islamic-civil', 'islamic-tbla', 'persian'].includes(primaryCalendarId)) {
                                    if (idx === 5) {
                                        headerBg = '#34a853';
                                        headerText = '#ffffff';
                                    }
                                }
                                // Hebrew -> Saturday (6) is Blue
                                else if (primaryCalendarId === 'hebrew') {
                                    if (idx === 6) {
                                        headerBg = '#1a73e8';
                                        headerText = '#ffffff';
                                    }
                                }
                                // Default / Gregorian -> Sunday (0) is Red
                                else {
                                    if (idx === 0) {
                                        headerBg = '#d93025';
                                        headerText = '#ffffff';
                                    }
                                }

                                return (
                                    <View key={idx} style={[styles.headerCell, { backgroundColor: headerBg }]}>
                                        <Text style={[styles.headerText, { color: headerText }]}>{day}</Text>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Grid Body */}
                        <View style={styles.grid}>
                            {calendarDays.map((date, idx) => {
                                const primaryDateData = convertDate(date, primaryCalendarId as CalendarType, { locale });

                                // Determine if current month (Gregorian vs Native)
                                let isCurrentMonth = false;
                                if (primaryCalendarId === 'gregorian') {
                                    isCurrentMonth = date.getMonth() === currentDate.getMonth();
                                } else {
                                    isCurrentMonth = primaryDateData.month === primaryCurrentData.month;
                                }

                                // Check holidays
                                const dayHolidays = selectedCalendars
                                    .map(id => convertDate(date, id as CalendarType, { locale }).holiday)
                                    .filter((h): h is string => Boolean(h));

                                const hasHoliday = dayHolidays.length > 0;

                                return (
                                    <View
                                        key={idx}
                                        style={[
                                            styles.cell,
                                            hasHoliday && isCurrentMonth ? styles.holidayCell : {},
                                            !isCurrentMonth ? styles.otherMonth : {}
                                        ]}
                                    >
                                        <Text style={[
                                            styles.dayNumber,
                                            {
                                                color: (() => {
                                                    // 1. Holiday Override (Red)
                                                    if (hasHoliday) return '#d93025';

                                                    // 2. Cultural Weekend Logic
                                                    const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat

                                                    // Hijri / Persian -> Friday (5) is Green
                                                    if (['hijri', 'islamic', 'islamic-umalqura', 'islamic-civil', 'islamic-tbla', 'persian'].includes(primaryCalendarId)) {
                                                        if (dayOfWeek === 5) return '#34a853'; // Lighter Green
                                                        if (dayOfWeek === 0) return '#202124'; // Explicitly Black for Sunday
                                                        return '#202124';
                                                    }

                                                    // Hebrew -> Saturday (6) is Blue
                                                    if (primaryCalendarId === 'hebrew') {
                                                        if (dayOfWeek === 6) return '#1a73e8'; // Blue
                                                        if (dayOfWeek === 0) return '#202124'; // Explicitly Black for Sunday
                                                        return '#202124';
                                                    }

                                                    // Default / Gregorian -> Sunday (0) is Red
                                                    if (dayOfWeek === 0) return '#d93025'; // Red

                                                    return '#202124';
                                                })()
                                            }
                                        ]}>
                                            {primaryDateData.day}
                                        </Text>

                                        {/* Secondary Calendar Info (Limit 2) */}
                                        {isCurrentMonth && selectedCalendars
                                            .filter(id => id !== primaryCalendarId)
                                            .slice(0, 2)
                                            .map((calId, cIdx) => {
                                                const data = convertDate(date, calId as CalendarType, { locale });
                                                return (
                                                    <Text key={cIdx} style={styles.calendarInfo}>
                                                        {data.day} {data.month}
                                                    </Text>
                                                );
                                            })}

                                        {/* Holiday Text */}
                                        {isCurrentMonth && dayHolidays.slice(0, 2).map((h, hIdx) => (
                                            <Text key={hIdx} style={styles.holidayText}>
                                                {h.length > 25 ? h.substring(0, 25) + '...' : h}
                                            </Text>
                                        ))}
                                    </View>
                                );
                            })}
                        </View>
                    </Page>
                );
            })}
        </Document>
    );
};
