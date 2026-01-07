import { CalendarDateResult, CalendarType } from "../calendars";

export const getHijriDate = (date: Date): CalendarDateResult => {
    // Source of Truth: Arabic Locale (Umm al-Qura) with Latin Numerals
    // We use this to get the specific day/month/year values that align with the "Correct" Arabic display
    const fmtTruth = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    });

    // Native Display (Arabic Script)
    const fmtNative = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // English Month Names (Standardized)
    // Ordered 1-12 (Muharram to Dhu al-Hijjah)
    const HIJRI_MONTHS_EN = [
        "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
        "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
        "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
    ];

    const parts = fmtTruth.formatToParts(date);
    const dayVal = parts.find(p => p.type === 'day')?.value || '1';
    const monthVal = parts.find(p => p.type === 'month')?.value || '1';
    const yearVal = parts.find(p => p.type === 'year')?.value || '1445';

    const day = parseInt(dayVal, 10);
    const monthIndex = parseInt(monthVal, 10) - 1; // 0-based
    const month = HIJRI_MONTHS_EN[monthIndex] || HIJRI_MONTHS_EN[0];
    const year = parseInt(yearVal, 10);

    const nativeParts = fmtNative.formatToParts(date);
    const monthNative = nativeParts.find(p => p.type === 'month')?.value || '';
    // Native year for native display
    const yearNative = nativeParts.find(p => p.type === 'year')?.value || '';

    const { getHoliday } = require('../holidays');

    // Create a formatter just for the basic fullDate if needed, or construct it manually
    // Constructing manual full date to be safe/consistent
    const fullDate = `${day} ${month} ${year}`;
    const fullDateNative = fmtNative.format(date);

    return {
        type: 'hijri',
        day: day,
        month: month,
        monthNative,
        year: year,
        yearNative, // Pass native year string (e.g. ١٤٤٥)
        fullDate: fullDate,
        fullDateNative: fullDateNative,
        holiday: getHoliday('hijri', month, day) // Use our standardized English month name for holidays
    };
};
