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
}

export const convertDate = (date: Date, type: CalendarType): CalendarDateResult => {
    switch (type) {
        case 'gregorian': {
            const hDay = date.getDate();
            const hMonth = format(date, 'MMMM');
            const { getHoliday } = require('./holidays');
            return {
                type,
                day: hDay,
                month: hMonth,
                year: date.getFullYear(),
                fullDate: format(date, 'EEEE, d MMMM yyyy'),
                fullDateNative: format(date, 'EEEE, d MMMM yyyy'),
                holiday: getHoliday('gregorian', hMonth, hDay)
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
