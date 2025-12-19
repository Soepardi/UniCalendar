import { CalendarDateResult } from "../calendars";

const WUKU = [
    "Sinta", "Landep", "Ukir", "Kulantir", "Tolu",
    "Gumbreg", "Wariga", "Warigadean", "Julungwangi", "Sungsang",
    "Dungulan", "Kuningan", "Langkir", "Medangsia", "Pujut",
    "Pahang", "Krulut", "Merakih", "Tambir", "Medangkungan",
    "Matal", "Uye", "Menail", "Prangbakat", "Bala",
    "Ugu", "Wayang", "Klawu", "Dukut", "Watugunung"
];

// Pancawara (5-day)
const PANCAWARA = ["Umanis", "Paing", "Pon", "Wage", "Kliwon"];

// Saptawara (7-day) - Balinese names
const SAPTAWARA = ["Redite", "Coma", "Anggara", "Buda", "Wraspati", "Sukra", "Saniscara"];

// Anchor: 8 March 2024 was starting of Sinta (Watugunung ends, Sinta starts?)
// Let's use a known recent anchor.
// 28 Feb 2024 was Galungan (Buda Kliwon Dungulan).
// Anchor: 28 Feb 2024 = Buda (Wednesday) Kliwon Dungulan.
const ANCHOR_DATE = new Date(2024, 1, 28); // Feb 28
const ANCHOR_WUKU_IDX = 10; // Dungulan (11th wuku, index 10)
const ANCHOR_PANCAWARA_IDX = 4; // Kliwon
const ANCHOR_SAPTAWARA_IDX = 3; // Buda (Wednesday)

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const getBalineseDate = (date: Date): CalendarDateResult => {
    const diffTime = date.getTime() - ANCHOR_DATE.getTime();
    const diffDays = Math.floor(diffTime / MS_PER_DAY);

    // Wuku logic (30 weeks of 7 days = 210 days)
    // We need total weeks passed.
    // diffDays could be negative.

    // Calculate indices safely for negative numbers
    const mod = (n: number, m: number) => ((n % m) + m) % m;

    const currentPancawaraIdx = mod(ANCHOR_PANCAWARA_IDX + diffDays, 5);
    const currentSaptawaraIdx = mod(ANCHOR_SAPTAWARA_IDX + diffDays, 7);

    // For Wuku: It changes every 7 days.
    // 1. Calculate offset in days from the START of the Anchor's Wuku.
    // Anchor was Wednesday (index 3). So start of Dungulan was 3 days prior?
    // No, start of Wuku is Redite (Sunday).
    // If Anchor is Wednesday (3 days after Sunday), then Wuku started 3 days before Anchor.
    const daysSinceAnchorWukuStart = diffDays + ANCHOR_SAPTAWARA_IDX;
    const weeksPassed = Math.floor(daysSinceAnchorWukuStart / 7);
    const currentWukuIdx = mod(ANCHOR_WUKU_IDX + weeksPassed, 30);

    const wukuName = WUKU[currentWukuIdx];
    const saptawaraName = SAPTAWARA[currentSaptawaraIdx];
    const pancawaraName = PANCAWARA[currentPancawaraIdx];

    const fullDate = `${saptawaraName} ${pancawaraName}, Wuku ${wukuName}`;
    const fullDateNative = fullDate; // Can add Balinese script map if needed

    return {
        type: 'balinese',
        day: date.getDate(),
        month: wukuName, // Wuku acts as the main cycle marker
        year: 'Pawukon',
        fullDate: fullDate,
        fullDateNative: fullDateNative,
        cycle: `${saptawaraName} ${pancawaraName}`
    };
};
