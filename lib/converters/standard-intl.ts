import { CalendarDateResult, CalendarType } from "../calendars";

const createIntlConverter = (
    type: CalendarType,
    latinLocale: string,
    nativeLocale: string,
    calendarKey: string
) => {
    return (date: Date): CalendarDateResult => {
        const fmtLatin = new Intl.DateTimeFormat(latinLocale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            calendar: calendarKey
        });

        const fmtNative = new Intl.DateTimeFormat(nativeLocale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            calendar: calendarKey
        });

        const parts = fmtLatin.formatToParts(date);
        const day = parts.find(p => p.type === 'day')?.value || '0';
        const month = parts.find(p => p.type === 'month')?.value || '';
        const era = parts.find(p => p.type === 'era')?.value;
        const yearVal = parts.find(p => p.type === 'year')?.value || '0';

        const year = era ? `${era} ${yearVal}` : yearVal;

        const { getHoliday } = require('../holidays');

        return {
            type,
            day: parseInt(day.replace(/[^0-9]/g, '') || '0'), // sanitize
            month,
            year,
            fullDate: fmtLatin.format(date),
            fullDateNative: fmtNative.format(date),
            holiday: getHoliday(type, month, parseInt(day.replace(/[^0-9]/g, '') || '0'))
        };
    };
};

export const getSakaDate = createIntlConverter('saka', 'en-IN', 'hi-IN', 'indian');
export const getHebrewDate = createIntlConverter('hebrew', 'en-US', 'he-IL', 'hebrew');
export const getPersianDate = createIntlConverter('persian', 'en-US', 'fa-IR', 'persian');
export const getBuddhistDate = createIntlConverter('buddhist', 'en-US', 'th-TH', 'buddhist');
export const getJapaneseDate = createIntlConverter('japanese', 'en-JP-u-ca-japanese', 'ja-JP-u-ca-japanese', 'japanese');
