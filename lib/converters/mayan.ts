import { CalendarDateResult } from "../calendars";

// Mayan Epoch: Aug 11, 3114 BCE (Gregorian) = Julian Day 584283
// But handling BCE dates in JS Date is tricky.
// Let's use the correlation constant (GMT): 584283.
// Julian Day Number (JDN) calculation is robust.

const getJulianDay = (date: Date) => {
    const time = date.getTime();
    const tzOffset = date.getTimezoneOffset() * 60000;
    // JDN for Unix Epoch (1970-01-01) is 2440587.5
    return (time - tzOffset) / 86400000 + 2440587.5;
};

export const getMayanDate = (date: Date): CalendarDateResult => {
    const jdn = getJulianDay(date);
    const mayanDay = Math.floor(jdn - 584283); // Days since epoch

    const baktun = Math.floor(mayanDay / 144000);
    const remaining1 = mayanDay % 144000;

    const katun = Math.floor(remaining1 / 7200);
    const remaining2 = remaining1 % 7200;

    const tun = Math.floor(remaining2 / 360);
    const remaining3 = remaining2 % 360;

    const uinal = Math.floor(remaining3 / 20);
    const kin = remaining3 % 20;

    const longCount = `${baktun}.${katun}.${tun}.${uinal}.${kin}`;

    // Converting numerals to Mayan glyphs (Unicode) if feasible,
    // or just using Mayan numeral text.
    // Mayan numerals 0-19: 𝋠, 𝋡... (Supported in some fonts)
    // Let's stick to standard text for now.

    return {
        type: 'mayan',
        day: kin,
        month: `Uinal ${uinal}`,
        year: `Baktun ${baktun}`,
        fullDate: `Long Count: ${longCount}`,
        fullDateNative: longCount, // Could replace with Mayan numerals
        cycle: `Katun ${katun}`
    };
};
