import { CalendarDateResult, CalendarType } from "../calendars";

export const getHijriDate = (date: Date): CalendarDateResult => {
    // Use Intl for accurate "observed" or "civil" calculation
    // 'en-u-ca-islamic-civil' or 'islamic-umalqura' is widely supported
    const fmtLatin = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const fmtNative = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const parts = fmtLatin.formatToParts(date);
    const day = parts.find(p => p.type === 'day')?.value || '0';
    const month = parts.find(p => p.type === 'month')?.value || '';
    const year = parts.find(p => p.type === 'year')?.value || '0';

    const { getHoliday } = require('../holidays');

    return {
        type: 'hijri',
        day: parseInt(day),
        month: month,
        year: year,
        fullDate: fmtLatin.format(date),
        fullDateNative: fmtNative.format(date), // e.g. ١٤ رمضان ١٤٤٥
        holiday: getHoliday('hijri', month, parseInt(day))
    };
};
