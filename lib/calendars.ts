import { format } from 'date-fns';
import { getHijriDate } from './converters/hijri';
import { getJavaneseDate } from './converters/javanese';
import { getChineseDate } from './converters/chinese';
import { getSakaDate, getHebrewDate, getPersianDate } from './converters/standard-intl';
import { getBuddhistDate } from './converters/buddhist';
import { getBalineseDate } from './converters/balinese';
import { getMayanDate } from './converters/mayan';
// Will import Balinese/Mayan later

export type CalendarType =
    | 'gregorian'
    | 'hijri'
    | 'javanese'
    | 'chinese'
    | 'saka'
    | 'balinese'
    | 'hebrew'
    | 'persian'
    | 'buddhist'
    | 'mayan'
    | 'japanese'
    | 'korean';

export interface CalendarDateResult {
    type: CalendarType;
    day: number;
    month: string;
    year: number | string;
    fullDate: string;
    fullDateNative?: string;
    cycle?: string;
    holiday?: string;
    nativeData?: any;
    monthNative?: string;
}

export const convertDate = (date: Date, type: CalendarType, options?: { locale?: any }): CalendarDateResult => {
    switch (type) {
        case 'gregorian': {
            const hDay = date.getDate();
            // Use the passed locale for month name if available, otherwise default to English (which format uses by default if undefined, but we want to be explicit)
            const hMonth = format(date, 'MMMM', { locale: options?.locale });
            const { getHoliday } = require('./holidays');

            return {
                type,
                day: hDay,
                month: hMonth,
                year: date.getFullYear(),
                fullDate: format(date, 'EEEE, d MMMM yyyy', { locale: options?.locale }),
                fullDateNative: format(date, 'EEEE, d MMMM yyyy', { locale: options?.locale }),
                holiday: getHoliday('gregorian', format(date, 'MMMM'), hDay) // Holidays might still rely on English month names? Need to check holidays.ts
            };
        }

        case 'hijri':
            return getHijriDate(date);

        case 'javanese':
            return getJavaneseDate(date);

        case 'chinese':
            return getChineseDate(date);

        case 'saka':
            return getSakaDate(date);

        case 'hebrew':
            return getHebrewDate(date);

        case 'persian':
            return getPersianDate(date);

        case 'buddhist':
            return getBuddhistDate(date);

        case 'balinese':
            return getBalineseDate(date);

        case 'mayan':
            return getMayanDate(date);

        case 'japanese':
            const { getJapaneseDate } = require('./converters/standard-intl');
            return getJapaneseDate(date);

        case 'korean':
            const { getKoreanDate } = require('./converters/korean');
            return getKoreanDate(date);

        default:
            return {
                type,
                day: 0,
                month: "Unknown",
                year: 0,
                fullDate: "Conversion Logic Pending"
            };
    }
};

export const getNativeMonthBoundaries = (date: Date, type: CalendarType, locale?: any): { start: Date; end: Date } => {
    // Gregorian is simple
    if (type === 'gregorian') {
        // We need to import these if not present, but for now assuming they are available or we use a workaround
        // Since we are inside lib/calendars, we might need to add imports at top
        // Let's rely on the caller or just standard JS date manipulation for simplicity to avoid import mess if possible,
        // BUT accuracy is key. Let's assume we can add imports.
        // Actually, let's keep logic pure.
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return { start, end };
    }

    // For other calendars, we try to find the "Native Day 1"
    const currentData = convertDate(date, type, { locale });
    const currentDay = currentData.day;

    let start = new Date(date);
    // Move back to day 1 (approximate) - simplistic subtraction only works if native days map 1:1 to Gregorian days duration (mostly true)
    start.setDate(date.getDate() - (currentDay - 1));

    // Verify day 1
    // Sometimes calc might be off by a day due to moon sighting diffs simulated, but usually safe for algorithm
    // Let's double check if we landed on day 1
    let checkData = convertDate(start, type, { locale });
    if (checkData.day !== 1) {
        // Correction loop (max 3 days search)
        for (let i = -2; i <= 2; i++) {
            const testDate = new Date(start);
            testDate.setDate(start.getDate() + i);
            if (convertDate(testDate, type, { locale }).day === 1) {
                start = testDate;
                break;
            }
        }
    }

    // Find end (Start + 28..32 days)
    let end = new Date(start);
    end.setDate(start.getDate() + 28); // Minimum month length

    // Move forward until month changes
    // Max iteration ~5 days
    const startMonth = checkData.month; // Name of month
    for (let i = 0; i < 5; i++) {
        const nextDay = new Date(end);
        nextDay.setDate(end.getDate() + 1);
        const nextData = convertDate(nextDay, type, { locale });
        if (nextData.month !== startMonth && nextData.day === 1) {
            // Found the start of next month, so 'end' is correct
            break;
        }
        end = nextDay;
    }

    return { start, end };
};

export const CALENDAR_META: Record<CalendarType, { name: string; description: string }> = {
    gregorian: { name: "Gregorian", description: "International standard" },
    hijri: { name: "Islamic (Hijri)", description: "Lunar calendar" },
    javanese: { name: "Javanese", description: "Pasaran cycle" },
    chinese: { name: "Chinese", description: "Lunisolar" },
    saka: { name: "Saka", description: "Hindu/Indian" },
    balinese: { name: "Balinese Pawukon", description: "210-day cycle" },
    hebrew: { name: "Hebrew", description: "Biblical" },
    persian: { name: "Persian", description: "Solar Hijri" },
    buddhist: { name: "Buddhist", description: "BE Era" },
    mayan: { name: "Mayan", description: "Long Count" },
    japanese: { name: "Japanese Era", description: "Imperial Eras (Reiwa)" },
    korean: { name: "Korean (Dangi)", description: "Traditional Lunisolar" },
};

export const toNativeNumerals = (num: number, type: CalendarType): string => {
    if (['hijri', 'islamic', 'islamic-umalqura', 'islamic-civil', 'islamic-tbla', 'persian'].includes(type)) {
        const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return num.toString().replace(/\d/g, (d) => arabicNumerals[parseInt(d)]);
    }

    if (type === 'hebrew') {
        // Simple Gematria for days 1-31
        const hebrewNumerals: { [key: number]: string } = {
            1: 'א', 2: 'ב', 3: 'ג', 4: 'ד', 5: 'ה', 6: 'ו', 7: 'ז', 8: 'ח', 9: 'ט', 10: 'י',
            11: 'יא', 12: 'יב', 13: 'יג', 14: 'יד', 15: 'טו', 16: 'טז', 17: 'יז', 18: 'יח', 19: 'יט', 20: 'כ',
            21: 'כא', 22: 'כב', 23: 'כג', 24: 'כד', 25: 'כה', 26: 'כו', 27: 'כז', 28: 'כח', 29: 'כט', 30: 'ל', 31: 'לא'
        };
        return hebrewNumerals[num] || num.toString();
    }

    return num.toString();
};
