import { CalendarType } from "./calendars";

interface HolidayDef {
    month: number | string;
    day: number;
    name: string;
}

const HOLIDAY_REGISTRY: Partial<Record<CalendarType, HolidayDef[]>> = {
    gregorian: [
        { month: 'January', day: 1, name: 'New Year\'s Day' },
        { month: 'February', day: 14, name: 'Valentine\'s Day' },
        { month: 'March', day: 17, name: 'St. Patrick\'s Day' },
        { month: 'May', day: 1, name: 'Labor Day' },
        { month: 'December', day: 25, name: 'Christmas Day' },
    ],
    hijri: [
        { month: 'Muharram', day: 1, name: 'Islamic New Year' },
        { month: 'Muharram', day: 10, name: 'Ashura' },
        { month: 'Rabiʻ al-Awwal', day: 12, name: 'Mawlid al-Nabi' },
        { month: 'Shawwal', day: 1, name: 'Eid al-Fitr' },
        { month: 'Dhuʻl-Hijjah', day: 10, name: 'Eid al-Adha' },
    ],
    chinese: [
        { month: 'First Month', day: 1, name: 'Lunar New Year' },
        { month: 'First Month', day: 15, name: 'Lantern Festival' },
        { month: 'Fifth Month', day: 5, name: 'Dragon Boat Festival' },
        { month: 'Seventh Month', day: 7, name: 'Qixi Festival' },
        { month: 'Eighth Month', day: 15, name: 'Mid-Autumn Festival' },
        { month: 'Ninth Month', day: 9, name: 'Double Ninth Festival' },
    ],
    korean: [
        { month: 'First Month', day: 1, name: 'Seollal' },
        { month: 'Eighth Month', day: 15, name: 'Chuseok' },
    ],
    hebrew: [
        { month: '1 Tishri', day: 1, name: 'Rosh Hashanah' },
        { month: '1 Tishri', day: 2, name: 'Rosh Hashanah' },
        { month: '1 Tishri', day: 10, name: 'Yom Kippur' },
        { month: '1 Kislev', day: 25, name: 'Hanukkah' },
        { month: '1 Nisan', day: 15, name: 'Passover' },
    ],
    japanese: [
        { month: 'January', day: 1, name: 'Gantan (New Year\'s)' },
        { month: 'February', day: 11, name: 'Foundation Day' },
        { month: 'February', day: 23, name: 'Emperor\'s Birthday' },
        { month: 'April', day: 29, name: 'Showa Day' },
        { month: 'May', day: 3, name: 'Constitution Memorial Day' },
        { month: 'May', day: 4, name: 'Greenery Day' },
        { month: 'May', day: 5, name: 'Children\'s Day' },
        { month: 'August', day: 11, name: 'Mountain Day' },
        { month: 'November', day: 3, name: 'Culture Day' },
        { month: 'November', day: 23, name: 'Labor Thanksgiving Day' },
    ]
};

/**
 * Checks if a specific date in a specific calendar has a registered holiday.
 */
export const getHoliday = (type: CalendarType, month: string | number, day: number): string | undefined => {
    const list = HOLIDAY_REGISTRY[type];
    if (!list) return undefined;

    // Standardize month for comparison (strip leading zeros/spaces if string)
    const normalizedMonth = typeof month === 'string' ? month.trim() : month;

    const match = list.find(h => {
        // Handle numeric or string month matching
        if (typeof h.month === 'string' && typeof normalizedMonth === 'string') {
            return h.month.toLowerCase() === normalizedMonth.toLowerCase() && h.day === day;
        }
        return h.month == normalizedMonth && h.day === day;
    });

    return match?.name;
};
