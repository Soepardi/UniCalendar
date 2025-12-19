import { CalendarDateResult } from "../calendars";

export const getChineseDate = (date: Date): CalendarDateResult => {
    const fmtLatin = new Intl.DateTimeFormat('en-u-ca-chinese', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const fmtNative = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const parts = fmtLatin.formatToParts(date);
    const day = parts.find(p => p.type === 'day')?.value || '0';
    const month = parts.find(p => p.type === 'month')?.value || '';

    // In Chinese calendar, 'year' might be 'relatedYear' in some environments
    const yearValue = parts.find(p => p.type === 'year')?.value ||
        parts.find(p => p.type === 'relatedYear' as any)?.value ||
        '0';

    const cycle = parts.find(p => (p.type as any) === 'yearName')?.value;

    const { getHoliday } = require('../holidays');

    return {
        type: 'chinese',
        day: parseInt(day),
        month: month,
        year: yearValue,
        fullDate: fmtLatin.format(date),
        fullDateNative: fmtNative.format(date),
        cycle: cycle,
        holiday: getHoliday('chinese', month, parseInt(day))
    };
};
