import { CalendarDateResult } from "../calendars";

/**
 * Korean Traditional Calendar (Dangi)
 * Synchronized with the Chinese Lunisolar calendar but with a different year offset.
 * Dangi 1 = 2333 BCE (Gojoseon foundation)
 */
export const getKoreanDate = (date: Date): CalendarDateResult => {
    // We use the same underlying Intl logic as Chinese for lunisolar synchronization
    const fmtLong = new Intl.DateTimeFormat('en-u-ca-chinese', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const fmtNative = new Intl.DateTimeFormat('ko-KR-u-ca-chinese', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const parts = fmtLong.formatToParts(date);
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');
    const month = parts.find(p => p.type === 'month')?.value || '';

    // Standard Dangi offset: Gregorian Year + 2333
    // However, since it's lunisolar, the year shifts at different times.
    // Intl's Chinese calendar 'year' is relative to a cycle.
    // We'll derive the Dangi year based on the Gregorian year + 2333 
    // with a slight adjustment if the lunar new year hasn't occurred yet.

    // The lunisolar year is often in the 'relatedYear' field in Intl
    const lunarYearVal = parts.find(p => p.type === 'relatedYear' as any)?.value;
    const baseYear = lunarYearVal ? parseInt(lunarYearVal) : date.getFullYear();
    const dangiYear = baseYear + 2333;

    const { getHoliday } = require('../holidays');

    return {
        type: 'korean',
        day,
        month,
        year: dangiYear,
        fullDate: `Dangi ${dangiYear}, ${month} ${day}`,
        fullDateNative: fmtNative.format(date).replace(/약|서기/g, '').trim(), // Clean up Intl extras
        holiday: getHoliday('korean', month, day)
    };
};
