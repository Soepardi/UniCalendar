import { CalendarDateResult } from "../calendars";
import { format } from "date-fns";

const PASARAN = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
const PASARAN_NATIVE = ["ꦊꦒꦶ", "ꦥꦲꦶꦁ", "ꦥꦺꦴꦤ꧀", "ꦮꦒꦺ", "ꦏ꧀ꦭꦶꦮꦺꦴꦤ꧀"];

const DAYS_NATIVE = [
    "ꦄꦲꦢ꧀", // Minggu (Sunday)
    "ꦱꦼꦤꦺꦤ꧀", // Senin
    "ꦱꦼꦭꦱ", // Selasa
    "ꦉꦧꦺꦴ", // Rabu
    "ꦏꦩꦶꦱ꧀", // Kamis
    "ꦗꦸꦩꦸꦮꦃ", // Jumat
    "ꦱꦼꦠꦸ"  // Sabtu
];

const JAVANESE_MONTHS = [
    "Sura", "Sapar", "Mulud", "Bakda Mulud",
    "Jumadil Awal", "Jumadil Akhir", "Rejeb", "Ruwah",
    "Pasa", "Sawal", "Sela", "Besar"
];

const JAVANESE_MONTHS_NATIVE = [
    "ꦱꦸꦫ", "ꦱꦥꦂ", "ꦩꦸꦭꦸꦢ꧀", "ꦧꦏ꧀ꦢꦩꦸꦭꦸꦢ꧀",
    "ꦗꦸꦩꦢꦶꦭ꧀ꦄꦮꦭ꧀", "ꦗꦸꦩꦢꦶꦭ꧀ꦄꦑꦶꦂ", "ꦉꦗꦼꦧ꧀", "ꦫꦸꦮꦃ",
    "ꦥꦱ", "ꦱꦮꦭ꧀", "ꦱꦼꦭ", "ꦙꦼꦱꦂ"
];

// Anchor: 1 Jan 2000 was Saturday (6) Pahing (1)
const ANCHOR_DATE = new Date(2000, 0, 1);
const ANCHOR_PASARAN = 1; // Pahing

export const getJavaneseDate = (date: Date): CalendarDateResult => {
    // 1. Calculate Pasaran (Solar cycle component)
    const diffTime = date.getTime() - ANCHOR_DATE.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    let pasaranIdx = (ANCHOR_PASARAN + diffDays) % 5;
    if (pasaranIdx < 0) pasaranIdx += 5;

    const pasaran = PASARAN[pasaranIdx];
    const pasaranNative = PASARAN_NATIVE[pasaranIdx];
    const dayNameNative = DAYS_NATIVE[date.getDay()];

    // 2. Synchronize with Hijri for Lunar components (Sultan Agung's Reform)
    const fmtHijri = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
    });

    const parts = fmtHijri.formatToParts(date);
    const hDay = parseInt(parts.find(p => p.type === 'day')?.value || '1');
    const hMonthIdx = parseInt(parts.find(p => p.type === 'month')?.value || '1') - 1;
    const hYear = parseInt(parts.find(p => p.type === 'year')?.value || '1445');

    // Javanese year is approx Hijri + 512
    const javaneseYear = hYear + 512;
    const monthName = JAVANESE_MONTHS[hMonthIdx];
    const monthNameNative = JAVANESE_MONTHS_NATIVE[hMonthIdx];

    const fullDate = `${format(date, 'EEEE')} ${pasaran}, ${hDay} ${monthName} ${javaneseYear}`;
    const fullDateNative = `${dayNameNative} ${pasaranNative}, ${hDay} ${monthNameNative} ${javaneseYear}`;

    return {
        type: 'javanese',
        day: hDay,
        month: monthName,
        year: javaneseYear,
        fullDate: fullDate,
        fullDateNative: fullDateNative,
        cycle: pasaran
    };
};
