# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (pac code run + Vite on port 3000)
npm run build     # TypeScript compile + Vite bundle to ./dist
npm run lint      # ESLint check
npm run preview   # Preview production build
```

> The `dev` script calls `pac code run` (Power Apps CLI) before starting Vite. If the PAC CLI is not authenticated, the app still runs at `http://localhost:3000` but Dataverse calls will fail.

## Architecture

This is a **Microsoft Power Platform Code Component** — a React SPA embedded inside Power Apps, connecting to Dataverse via the `@pa-client/power-code-sdk`.

### Entry flow

`main.tsx` → `<PowerProvider>` (initializes Power Apps SDK) → `<App>` → `<LaunchScreen>` (animated intro) → `<Layout>` (sidebar + topbar + page router) + `<CommandIQ>` (floating AI chat)

### Page routing

There is no React Router. `Layout.tsx` holds a `selectedTab` string state and renders pages with conditional JSX. The sidebar in `Sidebar.tsx` emits tab name strings (`"executive"`, `"people"`, `"programs"`, etc.) via an `onTabChange` callback.

### Data layer

`src/generated/` is **auto-generated** — do not edit manually. It contains typed Dataverse models and service classes for 14 tables (prefixed `cr978_coe_*` and legacy `cr578_modern*`). Services are instantiated with the Power Apps SDK context and expose async CRUD methods.

The `useCurrentUser` hook (`src/hooks/useCurrentUser.ts`) fetches the logged-in user's profile by cross-referencing the Power Platform user context with `Cr978_coe_personsService`.

### Styling

Each page has a co-located CSS file (e.g., `executive-summary.css`, `ai-incident.css`). Global layout styles are in `layout.css`. The design uses Bootstrap 5 for grid/utilities and Bootstrap Icons for iconography. The sidebar uses a dark green (`#1a3a2a`) color scheme.

### Charts

All data visualizations use **Recharts** (`recharts@^3`). Pages mix real Dataverse data with local mock data in `pages/*/data.ts` files.

## Power Platform specifics

- `power.config.json` defines the app identity, environment (`07da6342-8cc4-e81c-95fa-9ce24e7c2f46`), and Dataverse table bindings.
- The build output entry point is `./dist/index.html`.
- The `@` path alias resolves to `./src` (configured in both `vite.config.ts` and `tsconfig.app.json`).
- TypeScript is strict (`strict: true`, `noUnusedLocals`, `noUnusedParameters`).
