# Project Context

## Purpose
**Multi-Calendar Aggregator**: A comprehensive, client-side web application designed to visualize and convert dates across 10 distinct calendar systems. The goal is to provide a seamless "Universal Calendar" experience for users who navigate multiple cultural or religious timekeeping systems.

**Key Features**:
- **Unified View**: Compare different calendars side-by-side.
- **Converter**: Instant date conversion between any supported systems.
- **Native Script**: Toggle between Latin and Native scripts (e.g., Arabic, Hebrew, Chinese).
- **Downloadable**: Export printable calendars (PDF/PNG) and install as App (PWA).
- **Zero-Budget**: Purely static architecture (no backend costs).
- **Monetization**: Ad-supported layout + Donation integration.

## Calendar Systems
1.  **Gregorian** (Standard)
2.  **Islamic** (Hijri)
3.  **Javanese** (Pasaran)
4.  **Chinese** (Lunar)
5.  **Saka** (Hindu)
6.  **Balinese Pawukon**
7.  **Hebrew** (Jewish)
8.  **Persian** (Solar Hijri)
9.  **Buddhist**
10. **Mayan** (Long Count/Haab/Tzolkin)

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Mobile-first, Responsive)
- **State Details**: React Context / Zustand for global date state.
- **Build**: Hybrid (Static Frontend + Serverless API)
- **Core Libraries**: 
  - `date-fns` (Gregorian math)
  - `jspdf` / `html2canvas` (for client-side PDF/Image generation).
  - Specialized libraries for specific calendars (e.g., `hijri-date`, `not-a-calendar?`) or custom algorithms.

## Project Conventions

### Code Style
- **Functional**: Prefer pure functions for calendar conversion logic.
- **Typed**: Strict TypeScript interfaces for `DateObject` to normalize data across calendars.
- **Component**: Atomic design (Atoms -> Molecules -> Organisms).
- **Naming**: `useCalendar[Type]`, `convert[From]To[To]`.

### Architecture Patterns
- **Converter Pattern**: A central `DateEngine` that accepts a "Source Date" and emits "Target Dates" for all enabled calendars.
- **API First**: The `DateEngine` logic must be reusable in both Client (UI) and Server (API).
- **Monetizable API**:
  - Endpoint: `/api/v1/convert`
  - Auth: Bearer Token / API Key (via Middleware).
- **Layout**: 
  - `MainLayout`: Contains global Navigation and Settings.
  - **Ad Zones**: Pre-defined slots in Sidebar and Footer for Display Ads (Google AdSense compatible).
  - **Donation**: Floating "Support" FAB or Header button.

### Testing Strategy
- **Unit**: Jest/Vitest for conversion accuracy (critical).
- **E2E**: Verify UI switching and ad rendering.

### Git Workflow
- Feature branches (`feat/mayan-calendar`, `ui/ad-integration`).

## Domain Context
- **Balinese Pawukon**: a 210-day cycle with 10 concurrent weeks. Complex logic required.
- **Mayan**: Needs distinction between Long Count, Tzolkin, and Haab.
- **Islamic**: Umm al-Qura for standard web apps.

## Important Constraints
- **Client-Side Only**: All conversions must happen in the browser. No API calls to external conversion services to save costs and ensure offline capability.
- **Performance**: Heavy math for 10 calendars must not block the main thread; optimize computations.

## External Dependencies
- Google AdSense / Ad Provider Scripts.
- Buy Me a Coffee / PayPal Embeds.
