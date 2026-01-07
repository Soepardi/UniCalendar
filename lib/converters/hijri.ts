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

    const nativeParts = fmtNative.formatToParts(date);
    const monthNative = nativeParts.find(p => p.type === 'month')?.value || '';

    const parts = fmtLatin.formatToParts(date);
    const day = parts.find(p => p.type === 'day')?.value || '0';
    let month = parts.find(p => p.type === 'month')?.value || '';
    // Sanitize month name for PDF font compatibility (replace ʻ with ')
    month = month.replace(/[ʻʼ`]/g, "'").replace(/»/g, "'");
    const year = parts.find(p => p.type === 'year')?.value || '0';

    const { getHoliday } = require('../holidays');

    return {
        type: 'hijri',
        day: parseInt(day),
        month: month,
        monthNative,
        year: year,
        fullDate: fmtLatin.format(date),
        fullDateNative: fmtNative.format(date), // e.g. ١٤ رمضان ١٤٤٥
        holiday: getHoliday('hijri', month, parseInt(day))
    };
};
