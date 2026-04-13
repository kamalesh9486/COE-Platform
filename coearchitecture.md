# DEWA COE AI Intelligence Platform — Architecture Reference

> Full architecture reference. For coding directives, see `CLAUDE.md`. For design rules, see `design.md`.

---

## Table of Contents

1. [What the App Does](#1-what-the-app-does)
2. [Who It's For](#2-who-its-for)
3. [Core Value Proposition](#3-core-value-proposition)
4. [Technical Foundation](#4-technical-foundation)
5. [Complete Screen Inventory](#5-complete-screen-inventory)
6. [User Flow Maps](#6-user-flow-maps)
7. [Screen State Descriptions](#7-screen-state-descriptions)
8. [Component Inventory](#8-component-inventory)
9. [Data Relationships](#9-data-relationships)
10. [Build & Deployment](#10-build--deployment)
11. [Recent Changes](#11-recent-changes)

---

## 1. What the App Does

The DEWA COE AI Intelligence Platform is the single operational dashboard for the Dubai Electricity and Water Authority's Centre of Excellence. It tracks every dimension of DEWA's AI transformation programme in one place: how many employees have been trained, which AI projects are live, what risks exist, how much money has been saved, and where the organisation stands on its strategic roadmap.

The app connects to Microsoft Dataverse (DEWA's Power Platform environment) to read live records for programmes, events, people, incidents, and discoveries. It enriches that data with calculated metrics and visualisations so that both executives and operational staff can answer their questions without opening Excel or chasing reports.

It also embeds a floating AI chat assistant (CommandIQ) powered by a Power Automate workflow, letting users ask natural-language questions about the platform data at any time.

---

## 2. Who It's For

| Audience | What They Use It For |
|----------|----------------------|
| **C-suite / Executive sponsors** | Executive Summary — top-level KPIs, ROI, risk posture, strategic roadmap progress |
| **COE Programme managers** | Programs + Events — tracking active programmes, upcoming events, participant counts |
| **HR / L&D leads** | People & Skills — employee training completion, certifications, skill gaps, ADKAR readiness |
| **Division heads** | Division Analytics — per-division AI adoption rates and change-readiness scores |
| **Technology & IT leads** | Technology Stack, AI Command Center — tool adoption, Power BI dashboard deployment status |
| **Risk & compliance officers** | AI Incidents — incident pipeline, severity, SLA status, risk categorisation |
| **Finance / PMO** | Finance — budget allocation vs. actuals, utilisation rates, YoY spend trends |
| **Innovation / Discovery teams** | Discovery Catalog — innovation submissions, pipeline status, IT lead assignments |

The app is intentionally multi-persona. The sidebar navigation lets each user type jump directly to their area without wading through irrelevant sections.

---

## 3. Core Value Proposition

Before this platform, DEWA's AI COE data lived in scattered spreadsheets, Power BI reports, and email threads. The platform consolidates everything into one authenticated, role-aware interface with three core benefits:

1. **Single source of truth.** One URL, one login, live Dataverse data — no more "which spreadsheet is current?"
2. **Executive-grade visibility.** Animated KPIs, trend charts, and risk matrices designed for senior leadership reviews, not just analysts.
3. **Operational depth.** Drill down from a KPI to the individual employee, programme, or incident behind it, without switching tools.

---

## 4. Technical Foundation

```
React 19 + TypeScript (strict mode)
  └─ Vite 7 build toolchain
  └─ Microsoft Power Apps SDK (@microsoft/power-apps)
      └─ Dataverse integration via @pa-client/power-code-sdk
  └─ Recharts 3 for all data visualisations
  └─ Bootstrap 5 for grid/utilities + Bootstrap Icons
  └─ Power Automate for CommandIQ AI chat backend
```

**Path alias:** `@` resolves to `./src`  
**Dataverse environment ID:** `07da6342-8cc4-e81c-95fa-9ce24e7c2f46`  
**Dataverse table prefix:** `cr978_coe_*`  
**Build output:** `./dist/index.html`  
**Local dev port:** `http://localhost:3000`

### Entry Flow

```
main.tsx
  └─ <StrictMode>
       └─ <PowerProvider>   ← initialises Power Apps SDK + Dataverse context
            └─ <App>
                 ├─ launched=false → <LaunchScreen>   ← animated intro + auth
                 └─ launched=true  → <Layout> + <CommandIQ>   ← full app
```

### No Router

There is no React Router. `Layout.tsx` holds a single `activeTab` string state. The sidebar emits tab name strings; the layout renders the correct page component with a conditional switch. This means every page is always rendered in the same DOM shell — no URL changes, no browser history.

### Dataverse Service Pattern

Every Dataverse table has an auto-generated service class in `src/generated/`. All methods are static and return `Promise<IOperationResult<T>>`:

```ts
Cr978_coe_programsService.getAll()        // fetch all rows
Cr978_coe_programsService.get(id)         // fetch one row
Cr978_coe_programsService.create(obj)     // insert
Cr978_coe_programsService.update(id, diff) // patch
Cr978_coe_programsService.delete(id)      // delete
```

Pages call these in `useEffect` on mount, store results in local `useState`, and render. There is no global state manager — each page owns its data.

---

## 5. Complete Screen Inventory

### 5.1 Launch Screen

**File:** `src/components/LaunchScreen.tsx`

Full-viewport animated splash screen. Left half: hero title ("CENTER OF EXCELLENCE"), launch button, authenticated user's name from Dataverse. Right half: two-tab preview panel.

- **Analytics tab:** Platform KPI summary (Total Programmes: 47, AI Adoption: 64%, People Trained: 1182, Risk Score: 94%), module coverage progress list, "Powered by DEWA COE" footer.
- **Platform tab:** Animated cards — file browser showing Dataverse tables, progress sync showing 6 loading steps, context sources card.

User clicks "Launch Platform" → 700ms spinner → `launched` state flips to true → full app renders.

---

### 5.2 Executive Summary

**Route key:** `executive-summary`  
**File:** `src/pages/ExecutiveSummary.tsx`  
**CSS:** `src/executive-summary.css` (prefix: `es2-`)

Flagship view for leadership reviews. All data is currently static (hardcoded Q1 2026 snapshots). Scroll-triggered animations fire as each section enters the viewport.

**Sections:**
- **Hero strip:** Dark banner, animated SVG neural network (16 nodes, 22 edges). Title: "AI Intelligence Command Center". Live badge.
- **Section 1 — KPIs (4 cards):** AI Adoption Rate 64% (ring chart), Total AI Initiatives 47, Active AI Projects 31, People Trained 1,182.
- **Section 2 — Impact Analysis:** 4 impact cards (AED 4.2M savings, 28,400 hours automated, +34% efficiency, −62% error rate). ROI Trend ComposedChart (green bars + gold line, Oct→Mar).
- **Section 3 — AI Risk & Governance:** 4 stat badges + risk-by-category breakdown.
- **Section 4 — AI Workforce Readiness:** 4 metric cards with progress bars + Skill Domain Completion panel (6 horizontal bars).
- **Section 5 — Programs Overview:** Date range toggle (Month/Quarter/Year), bar chart by category, count tiles.

---

### 5.3 Division Analytics

**Route key:** `division-analytics`  
**File:** `src/pages/DivisionAnalytics.tsx`

Static data. Two sub-tabs:
- **Adoption tab:** Bar chart — AI adoption % per DEWA division, colour-coded by level.
- **ADKAR tab:** Five-dimension change readiness (Awareness/Desire/Knowledge/Ability/Reinforcement) per division, scores 0–100.

---

### 5.4 People & Skills

**Route key:** `people-skills`  
**File:** `src/pages/PeopleSkills.tsx`

Four sub-tabs (`adoption`, `certifications`, `skills`, `performance`):

- **Adoption** (`PeopleAdoptionTab.tsx`) — Live Dataverse. Fetches persons, divisions, departments, approles. Filterable table of all employees.
- **Certifications** (`CertificationsTab.tsx`) — Static. 17 certifications across 18 employees. Provider breakdown bar chart, status distribution donut.
- **Skills** (`SkillsTab.tsx`) — Static. Tag cloud of 15 skills, category filters, top-10 bar chart.
- **Performance** (`PerformanceTab.tsx`) — Static. Score distribution histogram, AI contribution heatmap.

---

### 5.5 Programs

**Route key:** `programs`  
**File:** `src/pages/Programs.tsx`

Live Dataverse (`cr978_coe_programs`). Cards for each programme: name, status badge, description, date range, division, event count, participant count. Toolbar: text search, status filter tabs, "+ Add Program" button.

Clicking "View Events" sets `contextProgram` in Layout and switches to Events tab — the only cross-page navigation.

"+ Add Program" opens `AddProgramModal`: name, start/end dates, division (dropdown), owner. Calls `Cr978_coe_programsService.create()`.

---

### 5.6 Events

**Route key:** `events`  
**File:** `src/pages/Events.tsx`  
**Sub-component:** `src/pages/prog/CalendarView.tsx`

Live Dataverse (`cr978_coe_eventses`). Toolbar: status tabs, List ↔ Calendar view toggle.

- **List view:** Event cards with type badge, status badge, date, location, division, participant count. Clicking opens EventModal.
- **Calendar view:** Month grid with coloured dots per event type. Clicking a dot opens that event's modal.
- **EventModal:** Name, type, status, date/time, location, description, speakers, attendees, status timeline.

If `contextProgram` is set, list is pre-filtered to that programme. "← Back to Programs" breadcrumb appears.

---

### 5.7 Technology Stack

**Route key:** `technology-stack`  
**File:** `src/pages/TechnologyStack.tsx`  
**Sub-component:** `src/pages/ps/AIToolsTab.tsx`

Static data. 7 AI tools (ChatGPT, Claude, Microsoft Copilot, Power BI, Azure AI Services, DALL-E, GitHub Copilot). Tool list with adoption %, monthly growth %, queries/month, NPS score. Clicking a tool opens detail panel: KPI cards, 6-month trend chart, department breakdown bar chart.

Also contains **Agent Value Intelligence** section: 6 KPI tiles, 2 pie charts, type/behavior/benefit charts, registry table. Powered by `CopilotDataContext`.

---

### 5.8 Discovery Catalog

**Route key:** `discovery-catalog`  
**File:** `src/pages/DiscoveryCatalog.tsx`  
**CSS:** `src/discovery-catalog.css`

Live Dataverse (`cr978_coe_discoveries` + division/department/person lookups).

KPI strip: totals by type, divisions/departments represented, IT leads assigned. Cards showing discovery title, division, type badge (AI/Non-AI), status badge (pipeline stages), IT lead, date. Charts: status pie, type split, department bar. Filters: search, status, type, division.

---

### 5.9 AI Incidents

**Route key:** `ai-incident`  
**File:** `src/pages/AIIncident.tsx`  
**CSS:** `src/ai-incident.css`

Live Dataverse (`cr978_coe_aiincidents`). Table: ticket number, name, AI platform, type, priority badge (Critical/High/Medium/Low), severity badge (P1-P4), status, date, assignee, data-risk flag. Toolbar: status filter, priority filter, search. Clicking a row opens Incident Detail Modal with timeline, tags, root cause, people affected.

Summary charts above table: status bar, priority horizontal bar, type breakdown bar.

---

### 5.10 Finance *(sidebar hidden — not in active nav)*

**File:** `src/pages/Finance.tsx`  
**CSS:** `src/finance.css`

Hybrid data: division names from Dataverse, budget figures from hardcoded `FINANCE_SEED` (no Finance table in Dataverse yet). Per-division cards: allocated vs actual spend, forecast, utilisation % with status flag, YoY change, project count. Charts: grouped bar, utilisation rank, scatter, pie.

---

### 5.11 Strategic Roadmap *(sidebar hidden — not in active nav)*

**File:** `src/pages/StrategicRoadmap.tsx`

Static. Four phases (Foundation, Growth, Excellence, Innovation). Phase cards strip with % complete and progress bar. Initiative list with search/filter. Initiative detail modal with milestones and KPIs.

---

### 5.12 AL Hasbah

**Route key:** `al-hasbah`  
**File:** `src/pages/AlHasbah.tsx`  
**CSS:** `src/al-hasbah.css`

---

### 5.13 AI Command Center

**Route key:** `ai-command-center`  
**File:** `src/pages/AICommandCenter.tsx`  
**CSS:** `src/ai-command-center.css`

Live Dataverse (`cr978_powerbidashboards`). Tracks Power BI dashboard deployment. KPI strip by status/phase/priority. Status donut + phase bar + priority bar charts. Searchable/filterable dashboard table with expandable rows.

---

## 6. User Flow Maps

### 6.1 First-Time Launch

```
User opens Power Apps container
  └─ PowerProvider initialises SDK
  └─ useCurrentUser() fires
       ├─ getContext() → user.fullName + user.userPrincipalName
       ├─ Dataverse lookup in cr978_coe_persons by email
       │    ├─ Found → name = record.name, role = record.role
       │    └─ Not found / timeout → name = 'User', role = 'Member'
       └─ LaunchScreen renders with user.name in greeting
  └─ User clicks "Launch Platform"
       └─ 700ms spinner → App.launched = true → Layout renders
```

### 6.2 Standard Navigation

```
User clicks nav item
  └─ Sidebar calls onTabChange(tabId)
       └─ Layout sets activeTab = tabId
       └─ New page renders, useEffect fires → Dataverse fetch (if live page)
```

### 6.3 Programs → Events Drill-Down

```
User clicks "View Events" on a programme card
  └─ Layout sets contextProgram = { id, name, ... }
  └─ Layout sets activeTab = "events"
  └─ Events page filters to that programme + shows "← Back to Programs"
  └─ User clicks back → contextProgram = null, activeTab = "programs"
```

### 6.4 Adding a New Programme

```
User clicks "+ Add Program"
  └─ Form fields: name, start date, end date, division, owner
  └─ Client validation → Cr978_coe_programsService.create(formData)
       ├─ Success → modal closes, list refetches
       └─ Error → error banner inside modal, stays open
```

### 6.5 Using CommandIQ (AI Chat)

```
User clicks floating orb (bottom-right)
  └─ Chat panel slides in (welcome message + 6 quick prompts on first open)
  └─ User sends message
       └─ POST to Power Automate endpoint: { Prompt, ConverId }
            ├─ Success → typewriter animation at 2 chars/20ms
            └─ Error → "I couldn't reach the AI endpoint" fallback
  └─ conversationIdRef persists for multi-turn context
```

---

## 7. Screen State Descriptions

### Programs Page States

| State | Behaviour |
|-------|-----------|
| Loading | 3 skeleton card placeholders |
| Empty | "No programmes found" + "+ Add your first programme" CTA |
| Populated | Cards wrap across rows, toolbar filters functional |
| Filtered (no matches) | "No programmes match your search" empty state |
| Add Modal — save in progress | Save button shows spinner, inputs disabled |
| Add Modal — save error | Error banner inside modal, inputs re-enabled |

### Events Page States

| State | Behaviour |
|-------|-----------|
| Loading | Skeleton cards (list) or skeleton calendar grid |
| List view | Event cards, status tabs with counts |
| Calendar view | Month grid, coloured dots on event dates |
| Filtered by contextProgram | Breadcrumb visible, list narrowed, title updated |

### AI Incidents Page States

| State | Behaviour |
|-------|-----------|
| Loading | Skeleton rows + empty charts |
| Active critical incident | Red "Critical" row appears first (sorted by priority) |
| Modal open | Timeline, tags, root cause, data-risk flag if set |

### CommandIQ States

| State | Behaviour |
|-------|-----------|
| Closed | Floating orb, unread badge if new messages |
| Open — first time | Welcome message + 6 quick-prompt buttons |
| Thinking | Typing indicator (3 pulsing dots), Send disabled |
| Streaming response | Typewriter animation at 2 chars/20ms |

---

## 8. Component Inventory

### Shell & Navigation

| Component | File | Purpose |
|-----------|------|---------|
| `Layout` | `src/components/Layout.tsx` | App shell. Owns `activeTab`, `collapsed`, `mobileOpen`, `contextProgram`. |
| `Sidebar` | `src/components/Sidebar.tsx` | Left nav. Sub-menu for Programs/Events. Collapses to icon-only. |
| `Icon` | `src/components/Icon.tsx` | 149 Bootstrap Icons embedded as path strings. No external font load. |
| `LaunchScreen` | `src/components/LaunchScreen.tsx` | Animated splash + auth screen. Calls `useCurrentUser()`. |
| `CommandIQ` | `src/components/CommandIQ.tsx` | Floating orb + chat panel. Self-contained — no props, no context. |

### Custom Hooks

| Hook | File | Returns |
|------|------|---------|
| `useCurrentUser` | `src/hooks/useCurrentUser.ts` | `{ name, role, email, loading }`. 6s timeout in local dev. |

### Recharts Usage by Page

| Chart type | Pages | Notes |
|------------|-------|-------|
| `BarChart + Bar` | ExecutiveSummary, DivisionAnalytics, Finance, AICommandCenter | `radius={[8,8,0,0]}`, `Cell` per-bar for custom colours |
| `ComposedChart + Bar + Line` | ExecutiveSummary (ROI Trend) | Dual Y-axes |
| `LineChart + Line` | TechnologyStack | With `activeDot` |
| `PieChart + Pie + Cell` | DiscoveryCatalog, AICommandCenter | Custom `labelLine` |

Custom tooltip background: `#1c2a24`, white text.

### Reusable Patterns (inline, not yet extracted)

- **Status Badge** — pill span, colour-coded: green (Active/Completed/Low), amber (In Progress/Medium), red (Critical/High), grey (On Hold/Unknown)
- **KPI Card** — icon + animated counter + label + sub-text. Optional ring chart variant.
- **Filter Toolbar** — text search + status tab buttons + optional dropdowns
- **Detail Modal** — full-screen overlay, close top-right, scrollable content
- **AnimBar** — div track + div fill, width transitions 0% → value% on `inView`
- **AnimatedRing** — SVG circle `strokeDashoffset` transition + counter overlay
- **useCounter** — `requestAnimationFrame` loop with cubic-bezier easing

---

## 9. Data Relationships

### Dataverse Tables

```
cr978_coe_divisions
  ├─ cr978_coe_departments  (_cr978_coe_division_value FK)
  ├─ cr978_coe_persons      (_cr978_coe_division_value, _cr978_coe_department_value, _cr978_coe_approle_value FKs)
  ├─ cr978_coe_programs     (_cr978_coe_division_value FK)
  └─ cr978_coe_discoveries  (_cr978_coe_requestingdivision_value, _cr978_coe_requestingdepartment_value, _cr978_it_lead_value FKs)

cr978_coe_programs
  └─ cr978_coe_eventses  (_cr978_coe_program_value FK)

cr978_coe_aiincidents
  └─ _cr978_coe_reportedby_value, _cr978_coe_assignedto_value FKs → persons

cr978_coe_approles
  └─ referenced by persons

cr978_powerbidashboards
  └─ _cr978_coe_program_value FK → programs (optional)
```

### FK Resolution Pattern

FK columns are stored as GUIDs. Pages must resolve to human-readable names via Map:

```ts
const [divisionsRes, departmentsRes] = await Promise.all([
  Cr978_coe_divisionsService.getAll(),
  Cr978_coe_departmentsService.getAll(),
])
const divisionMap = new Map(divisionsRes.data.map(d => [d.id, d.name]))
const divisionName = divisionMap.get(person._cr978_coe_division_value) ?? 'Unknown'
```

### Live vs. Static Data

| Page / Section | Source | Notes |
|----------------|--------|-------|
| Executive Summary | Static | Q1 2026 snapshot hardcoded |
| Division Analytics | Static | Hardcoded per-division scores |
| People — Adoption tab | Live Dataverse | 4 tables fetched on mount |
| People — Certifications / Skills / Performance | Static | `src/pages/ps/data.ts` |
| Programs | Live Dataverse | Full CRUD (read + create) |
| Events | Live Dataverse | Read-only |
| Technology Stack | Static | `src/pages/ps/data.ts` (AI tools) |
| Discovery Catalog | Live Dataverse | Read-only, 3 lookup tables |
| AI Incidents | Live Dataverse | Read-only |
| Finance | Hybrid | Division names live, budget from FINANCE_SEED array |
| Strategic Roadmap | Static | Hardcoded phases + initiatives |
| AI Command Center | Live Dataverse | Read-only |
| CommandIQ chat | Live Power Automate | Real-time POST per message |

### Cross-Page State

Only `contextProgram` crosses page boundaries (set by Programs, consumed by Events, stored in Layout). All other page data is local `useState`. No global store.

### Data Persistence

| Data | Persisted | Lifecycle |
|------|-----------|-----------|
| Dataverse records | Dataverse cloud | Permanent |
| Active tab | Layout useState | Session only |
| contextProgram | Layout useState | Clears on back-navigation |
| CommandIQ conversation ID | useRef | Session only |
| Filter/search inputs | Local useState per page | Clears on tab switch |
| Animation state | Local useState | Re-animates on next scroll |

---

## 10. Build & Deployment

### Development

```bash
npm run dev       # pac code run + vite on http://localhost:3000
npm run lint      # ESLint (TypeScript strict)
```

Dataverse calls fail gracefully in local dev (SDK context unavailable). Static pages work fully offline. `useCurrentUser` falls back to `{ name: "User", role: "Member" }` after 6 seconds.

### Production Build

```bash
npm run build     # tsc -b && vite build → ./dist
npm run preview   # preview ./dist locally
```

Standard Vite bundle. The Microsoft Power Apps Vite plugin packages for deployment via `pac code push`.

### Deployment Target

Power Platform environment `07da6342-8cc4-e81c-95fa-9ce24e7c2f46`. Runs inside the Power Apps runtime container which provides SDK context, Dataverse connectivity, and user authentication.

### TypeScript Config

`strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`. All Dataverse models are strongly typed from generated code in `src/generated/`. Adding a new Dataverse table requires re-running the Power Apps code generation tool — do not hand-write model code.

---

## 11. Recent Changes

| Date | Change |
|------|--------|
| 2026-04-12 | Font stack updated to `'Dubai', 'Segoe UI', system-ui, sans-serif` across all CSS files. |
| 2026-04-12 | No-emoji rule enforced. All emoji replaced with `<Icon name="bi-*" />`. `bi-currency-dirham` mandatory for finance contexts. |
| 2026-04-12 | CopilotKit restructured — embedded inside Technology Stack as `CopilotKitPanel`. `copilot-kit` tab removed. `CopilotDataContext` added. Agent Value Intelligence section added. |
| 2026-04-11 | Technology Stack page wraps `AIToolsTab`. `AIToolsTab.tsx` — Microsoft Copilot live card + detail panel. |

*Active tabs: executive-summary, division-analytics, programs, events, people-skills, technology-stack, discovery-catalog, ai-incident, al-hasbah, ai-command-center.*
