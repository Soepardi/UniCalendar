# UniCal World Calendar

**Calendar engineered for the modern Society**

UniCal is a comprehensive, multi-system calendar designed to bridge cultural and temporal divides. It provides a unified interface for viewing, comparing, and exporting dates across virtually every major calendar system used in the world today.

## Key Features

### Multi-System Support
Seamlessly switch between or aggregate multiple calendar systems:
- **Gregorian** (Standard)
- **Hijri** (Umm al-Qura & Civil)
- **Hebrew**
- **Persian** (Solar Hijri)
- **Indian National** (Saka)
- **Chinese** (Lunisolar)
- **Japanese** (Wareki)
- **Korean** (Dangi)
- **Buddhist** (Thai Solar)
- **Javanese**, **Sundanese**, **Balinese** (Pawukon & Saka), and **Mayan**.

### Native Script & Numerals
Experience calendars as they are meant to be read.
- **Toggleable Native Script**: Switch internally to Arabic, Hebrew, Devanagari, Hanzi, Thai, or Javanese scripts for months and days.
- **Native Numerals**: Full support for Eastern Arabic, Persian, Devanagari, and other numeral systems.

### Professional Export
Generate high-fidelity, print-ready PDFs directly from the browser.
- **Vector-Based**: Crisp text and lines at any zoom level.
- **Custom Fonts**: Embedded Google Noto fonts satisfy complex shaping requirements for Arabic, Hebrew, and Thai.
- **Flexible Formats**: Export a single "Current Month" view or a complete "Full Year" bundle.
- **A4 Landscape**: Optimized layout for standard printing.

### Intelligent Design
- **Cultural Context**: Automatic weekend highlighting based on the primary calendar (e.g., Fridays for Hijri, Saturdays for Hebrew).
- **Responsive**: Fully optimized for mobile, tablet, and desktop.
- **Holidays**: Integrated global holiday data for supported calendars.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **PDF Engine**: [`@react-pdf/renderer`](https://react-pdf.org/)
- **Date Logic**: `date-fns` + `Intl.DateTimeFormat`
- **Fonts**: `@fontsource` & Google Fonts (CDN)

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

Contributions regarding new calendar systems or astronomical corrections are welcome. Please ensure all new converters include proper unit tests and TypeScript interfaces.

---

*From Soe with love.*
