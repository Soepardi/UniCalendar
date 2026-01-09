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
import { convertDate, CalendarType, toNativeNumerals } from '@/lib/calendars';
import { enUS, zhCN, id, arSA, faIR, he, th, ja, ko } from 'date-fns/locale';

// Register Fonts (using @fontsource WOFFs which are stable for PDF generation)
// Outfit (Latin)
Font.register({
    family: 'Outfit',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/gh/Outfitio/Outfit-Fonts@main/fonts/ttf/Outfit-Regular.ttf' },
        { src: 'https://cdn.jsdelivr.net/gh/Outfitio/Outfit-Fonts@main/fonts/ttf/Outfit-Bold.ttf', fontWeight: 'bold' }
    ]
});

// Noto Sans Arabic (Arabic)
Font.register({
    family: 'Noto Sans Arabic',
    src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-arabic@latest/files/noto-sans-arabic-arabic-400-normal.woff'
});

// Noto Sans Hebrew (Hebrew)
Font.register({
    family: 'Noto Sans Hebrew',
    src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-hebrew@latest/files/noto-sans-hebrew-hebrew-400-normal.woff'
});

// Noto Sans SC (Simplified Chinese)
Font.register({
    family: 'Noto Sans SC',
    src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@latest/files/noto-sans-sc-chinese-simplified-400-normal.woff'
});

// Noto Sans JP (Japanese)
Font.register({
    family: 'Noto Sans JP',
    src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@latest/files/noto-sans-jp-japanese-400-normal.woff'
});

// Noto Sans KR (Korean)
Font.register({
    family: 'Noto Sans KR',
    src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@latest/files/noto-sans-kr-korean-400-normal.woff'
});

// Noto Sans Thai (Thai)
Font.register({
    family: 'Noto Sans Thai',
    src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-thai@latest/files/noto-sans-thai-thai-400-normal.woff'
});

// Noto Sans Javanese (Javanese)
Font.register({
    family: 'Noto Sans Javanese',
    src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-javanese@latest/files/noto-sans-javanese-javanese-400-normal.woff'
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

const getFontForCalendar = (type: CalendarType) => {
    if (['hijri', 'islamic', 'islamic-umalqura', 'islamic-civil', 'islamic-tbla', 'persian'].includes(type)) return 'Noto Sans Arabic';
    if (type === 'hebrew') return 'Noto Sans Hebrew';
    if (type === 'chinese') return 'Noto Sans SC';
    if (type === 'japanese') return 'Noto Sans JP';
    if (type === 'korean') return 'Noto Sans KR';
    if (type === 'buddhist') return 'Noto Sans Thai';
    if (type === 'javanese') return 'Noto Sans Javanese';
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
        fontSize: 22, // Restored to bold and larger
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
        fontSize: 12, // Increased from 10
        color: '#202124',
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
    cell: {
        width: '14.28%',
        height: 55, // Reduced from 60 to fit 6 rows nicely
        padding: 4,
        borderTopWidth: 1,
        borderColor: '#f1f3f4',
        position: 'relative',
    },
    dayNumber: {
        fontSize: 16, // Reduced from 18
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
    showNativeScript?: boolean;
    events?: Record<string, any[]>;
    weeklyHoliday?: number;
    specialDay?: number;
}

export const CalendarDocument = ({ dates, selectedCalendars, translations, locale, logoUrl, showNativeScript = false, events, weeklyHoliday, specialDay }: CalendarDocumentProps) => {
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

                // Generate Week Days (Native or Standard)
                const weekStart = startOfWeek(new Date(), { locale, weekStartsOn: 0 });
                const weekEnd = endOfWeek(weekStart, { locale, weekStartsOn: 0 });
                const weekInterval = eachDayOfInterval({ start: weekStart, end: weekEnd });

                const weekDays = weekInterval.map(day => {
                    if (showNativeScript) {
                        try {
                            // Map calendar type to native locale for weekdays
                            let nativeLocaleCode = 'en-US';
                            if (['hijri', 'islamic', 'islamic-umalqura', 'islamic-civil', 'islamic-tbla'].includes(primaryCalendarId)) nativeLocaleCode = 'ar-SA';
                            else if (primaryCalendarId === 'persian') nativeLocaleCode = 'fa-IR';
                            else if (primaryCalendarId === 'hebrew') nativeLocaleCode = 'he';
                            else if (primaryCalendarId === 'chinese') nativeLocaleCode = 'zh-CN';
                            else if (primaryCalendarId === 'japanese') nativeLocaleCode = 'ja-JP';
                            else if (primaryCalendarId === 'korean') nativeLocaleCode = 'ko-KR';
                            else if (primaryCalendarId === 'buddhist') nativeLocaleCode = 'th-TH'; // Thai
                            else if (primaryCalendarId === 'javanese') nativeLocaleCode = 'jv-Latn'; // Or local mapping if Javanese script needed

                            // Special handling for Javanese if script is needed, otherwise use locale
                            if (primaryCalendarId === 'javanese') {
                                // Javanese native script days: ꦄꦲꦢ꧀, ꦱꦼꦤꦺꦤ꧀, ...
                                const javaneseDays = ["ꦄꦲꦢ꧀", "ꦱꦼꦤꦺꦤ꧀", "ꦱꦼꦭꦱ", "ꦉꦧꦺꦴ", "ꦏꦩꦶꦱ꧀", "ꦗꦸꦩꦸꦮꦃ", "ꦱꦼꦠꦸ"];
                                return javaneseDays[day.getDay()];
                            }

                            return new Intl.DateTimeFormat(nativeLocaleCode, { weekday: 'short' }).format(day);
                        } catch (e) {
                            return format(day, 'EEE', { locale });
                        }
                    }
                    return format(day, 'EEE', { locale });
                });

                return (
                    <Page key={pageIndex} size="A4" orientation="landscape" style={{ ...styles.page, fontFamily: getFontFamily(locale?.code || 'en-US') }}>
                        {/* Header */}
                        {/* Header */}
                        <View style={styles.header}>
                            {/* Centered Container Concept */}
                            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: logoUrl ? 'flex-start' : 'center', gap: 12 }}>
                                {logoUrl && (
                                    <Image src={logoUrl} style={{ height: 32 }} />
                                )}
                                <View style={{ alignItems: logoUrl ? 'flex-start' : 'center' }}>
                                    {showNativeScript ? (
                                        // Complex Node for Native Script (Split for BiDi/Font isolation)
                                        <Text style={{ ...styles.title }}>
                                            <Text style={{ fontFamily: getFontForCalendar(primaryCalendarId as CalendarType) }}>
                                                {primaryCurrentData.monthNative || primaryCurrentData.month}
                                            </Text>
                                            <Text> </Text>
                                            <Text style={{ fontFamily: getFontForCalendar(primaryCalendarId as CalendarType) }}>
                                                {toNativeNumerals(parseInt(primaryCurrentData.year.toString()), primaryCalendarId as CalendarType)}
                                            </Text>
                                        </Text>
                                    ) : (
                                        // Simple Node for Latin/Standard (Better Kerning/Ligatures)
                                        <Text style={{ ...styles.title, fontFamily: 'Outfit' }}>
                                            {primaryCurrentData.month} {primaryCurrentData.year}
                                        </Text>
                                    )}
                                    <Text style={styles.subTitle}>
                                        Created by UniCal Calendar
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Grid Header (Days) */}
                        <View style={styles.grid}>
                            {weekDays.map((day, idx) => {
                                // Cultural / Custom Weekend Logic for Headers
                                let headerBg = '#f1f3f4'; // Default Light Gray
                                let headerText = '#202124'; // Default Black

                                // 1. Custom Override
                                if (weeklyHoliday !== undefined) {
                                    if (idx === weeklyHoliday) {
                                        headerBg = '#d93025';
                                        headerText = '#ffffff';
                                    } else if (specialDay !== undefined && idx === specialDay) {
                                        headerBg = '#1a73e8';
                                        headerText = '#ffffff';
                                    }
                                }
                                // 2. Default Logic (Hijri / Persian -> Friday)
                                else if (['hijri', 'islamic', 'islamic-umalqura', 'islamic-civil', 'islamic-tbla', 'persian'].includes(primaryCalendarId)) {
                                    if (idx === 5) {
                                        headerBg = '#34a853';
                                        headerText = '#ffffff';
                                    }
                                }
                                // Hebrew -> Saturday
                                else if (primaryCalendarId === 'hebrew') {
                                    if (idx === 6) {
                                        headerBg = '#1a73e8';
                                        headerText = '#ffffff';
                                    }
                                }
                                // Default -> Sunday
                                else {
                                    if (idx === 0) {
                                        headerBg = '#d93025';
                                        headerText = '#ffffff';
                                    }
                                }

                                return (
                                    <View key={idx} style={[styles.headerCell, { backgroundColor: headerBg }]}>
                                        <Text style={{
                                            ...styles.headerText,
                                            color: headerText,
                                            fontFamily: showNativeScript ? getFontForCalendar(primaryCalendarId as CalendarType) : 'Outfit'
                                        }}>
                                            {day}
                                        </Text>
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

                                const dateKey = format(date, 'yyyy-MM-dd');
                                const dayEvents = events?.[dateKey] || [];

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
                                                    const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat

                                                    // 1. Holiday or Work Event Override (Red)
                                                    const hasWork = dayEvents.some((e: any) => e.type === 'work');
                                                    if (hasHoliday || hasWork) return '#d93025';

                                                    // 2. Custom Override
                                                    if (weeklyHoliday !== undefined) {
                                                        if (dayOfWeek === weeklyHoliday) return '#d93025';
                                                        if (specialDay !== undefined && dayOfWeek === specialDay) return '#1a73e8';
                                                        return '#202124';
                                                    }

                                                    // 3. Cultural Weekend Logic
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
                                                })(),
                                                fontFamily: showNativeScript ? getFontForCalendar(primaryCalendarId as CalendarType) : 'Outfit'
                                            }
                                        ]}>
                                            {(primaryCalendarId === 'gregorian' || !showNativeScript) ? primaryDateData.day : toNativeNumerals(primaryDateData.day, primaryCalendarId as CalendarType)}
                                        </Text>

                                        {/* Secondary Calendar Info (Limit 2) */}
                                        {isCurrentMonth && selectedCalendars
                                            .filter(id => id !== primaryCalendarId)
                                            .slice(0, 2)
                                            .map((calId, cIdx) => {
                                                const data = convertDate(date, calId as CalendarType, { locale });
                                                return (
                                                    <Text key={cIdx} style={{
                                                        ...styles.calendarInfo,
                                                        fontFamily: showNativeScript ? getFontForCalendar(calId as CalendarType) : 'Outfit'
                                                    }}>
                                                        {showNativeScript ? toNativeNumerals(data.day, calId as CalendarType) : data.day} {(showNativeScript && data.monthNative) ? data.monthNative : data.month}
                                                    </Text>
                                                );
                                            })}

                                        {/* Holiday Text */}
                                        {isCurrentMonth && dayHolidays.slice(0, 2).map((h, hIdx) => (
                                            <Text key={`hol-${hIdx}`} style={styles.holidayText}>
                                                {h.length > 25 ? h.substring(0, 25) + '...' : h}
                                            </Text>
                                        ))}

                                        {/* Personal Events in PDF */}
                                        {isCurrentMonth && dayEvents.map((evt: any, eIdx: number) => (
                                            <Text key={`evt-${eIdx}`} style={{
                                                fontSize: 7, // Reduced from 8
                                                color: '#d93025', // Use red for work events (since we filtered for them)
                                                marginTop: 2,
                                                fontWeight: 'normal', // Removed bold
                                            }}>
                                                • {evt.title.length > 20 ? evt.title.substring(0, 20) + '...' : evt.title}
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
