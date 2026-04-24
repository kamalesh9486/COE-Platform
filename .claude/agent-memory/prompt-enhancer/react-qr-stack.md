---
name: React QR Portal Tech Stack
description: React 19 + TypeScript training QR portal, localStorage + optional Supabase, DEWA design tokens, no charting libraries
type: project
---

## Stack

- **Frontend:** React 19 + TypeScript (strict)
- **Styling:** Custom CSS per component (no Tailwind, no CSS-in-JS)
- **Storage:** localStorage (primary), optional Supabase sync
- **Icons:** Bootstrap Icons only via `<Icon name="bi-*" />`
- **Charts:** None available — must use hand-rolled SVG/CSS
- **Navigation:** Tab state managed in Layout.tsx (no React Router)

## Data Model

TrainingEntry fields:
- `id`: unique identifier
- `code`: training code
- `title`: session title
- `trainer`: trainer name
- `date`: ISO 8601 date (YYYY-MM-DD)
- `time`: time string (HH:MM format assumed)
- `venue`: location
- `notes`: optional notes
- `fullUrl`: full URL to QR code
- `createdAt`: timestamp (ISO 8601)

## Design Tokens

- **Primary Green:** `#007560`
- **Dark Teal:** `#004937`
- **Accent Gold:** `#ca8a04`
- **Background:** `#edf2f0`
- **Text:** `#1c1c1e`
- **Font:** Dubai font stack
- **Icons:** Bootstrap Icons (`bi-*`) only

## Key Constraints

- No charting libraries (Recharts, Chart.js, etc.)
- No React Router — tab-based navigation via Layout.tsx
- localStorage is primary; Supabase is optional
- Responsive design required (mobile-first)
- TypeScript strict mode
- Custom CSS only (no Tailwind, no styled-components)

## Integration Pattern

New components should be added as tabs in Layout.tsx tab state. Dashboard will read TrainingEntry data via shared hook or direct localStorage access. Handle Supabase gracefully (read first if available, fall back to localStorage).
