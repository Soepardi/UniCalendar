import { CalendarDateResult } from "../calendars";

const THAI_MONTHS_LATIN = [
    "Mokkarakhom", "Kumphaphan", "Minakhom", "Mesayon", "Pruetsaphakhom", "Mithunayon",
    "Karakadakhom", "Singhakhom", "Kanyayon", "Tulakhom", "Pruetsajikayon", "Thanwakhom"
];

export const getBuddhistDate = (date: Date): CalendarDateResult => {
    // Native Thai (Thai Script)
    const fmtNative = new Intl.DateTimeFormat('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        calendar: 'buddhist'
    });

    // Latin/English base (for Year and Day)
    // We use 'en-US-u-ca-buddhist' to get the BE year.
    const fmtLatin = new Intl.DateTimeFormat('en-US-u-ca-buddhist', {
        day: 'numeric',
        year: 'numeric',
        calendar: 'buddhist'
    });

    // Extract parts
    const parts = fmtLatin.formatToParts(date);
    const day = parts.find(p => p.type === 'day')?.value || '0';
    const yearVal = parts.find(p => p.type === 'year')?.value || '0';
    const era = parts.find(p => p.type === 'era')?.value; // "BE" might be here or part of year

    const year = era ? `${yearVal} ${era}` : yearVal;

    // Custom Month Mapping
    const monthIndex = date.getMonth(); // 0-based index matches Gregorian/Thai Solar
    const monthName = THAI_MONTHS_LATIN[monthIndex];

    // Extract Native Month
    const nativeParts = fmtNative.formatToParts(date);
    const monthNative = nativeParts.find(p => p.type === 'month')?.value || '';

    const { getHoliday } = require('../holidays');

    return {
        type: 'buddhist',
        day: parseInt(day),
        month: monthName,
        monthNative,
        year: year,
        fullDate: `${day} ${monthName} ${year}`,
        fullDateNative: fmtNative.format(date),
        holiday: getHoliday('buddhist', monthName, parseInt(day))
    };
};
