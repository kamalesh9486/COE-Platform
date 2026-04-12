# DEWA COE AI Intelligence Platform — Architecture Document

> Plain-language architecture reference for engineers, product owners, and designers working on the DEWA Centre of Excellence AI Intelligence Platform.

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
Cr978_coe_programsService.getAll()    // fetch all rows
Cr978_coe_programsService.get(id)     // fetch one row
Cr978_coe_programsService.create(obj) // insert
Cr978_coe_programsService.update(id, diff) // patch
Cr978_coe_programsService.delete(id)  // delete
```

Pages call these in `useEffect` on mount, store results in local `useState`, and render. There is no global state manager — each page owns its data.

---

## 5. Complete Screen Inventory

### 5.1 Launch Screen

**Route key:** none (pre-app)  
**File:** `src/components/LaunchScreen.tsx`

The first thing a user sees after the Power Apps container loads. It is a full-viewport animated splash screen. The left half shows a hero title ("CENTER OF EXCELLENCE"), a launch button, and the authenticated user's name fetched from Dataverse. The right half shows a two-tab preview panel:

- **Analytics tab:** Displays platform KPI summary (Total Programmes: 47, AI Adoption: 64%, People Trained: 1182, Risk Score: 94%), a module coverage progress list (Executive AI: 100%, People & Skills: 87%, Discovery: 94%, Finance: 78%, Incidents: 91%, Roadmap: 85%), and a "Powered by DEWA COE" footer tag.
- **Platform tab:** Three animated cards — a file browser showing Dataverse tables, a progress sync showing 6 loading steps (Initialising context → Connecting Dataverse → Loading programmes → Loading events → Syncing people → Ready), and a context sources card listing Power Apps SDK, Dataverse API, Power Automate.

The user clicks "Launch Platform" → 700ms spinner → `launched` state flips to true → full app renders.

---

### 5.2 Executive Summary

**Route key:** `"executive"`  
**File:** `src/pages/ExecutiveSummary.tsx`  
**CSS:** `src/executive-summary.css`

The flagship view. Designed for leadership reviews. All data is currently static (hardcoded from Q1 2026 snapshots) — no live Dataverse calls. Scroll-triggered animations fire as each section enters the viewport.

**Sections (top to bottom):**

**Hero strip:** Full-width dark banner with an animated SVG neural network (16 nodes, 22 edges, pulsing circles). Title: "AI Intelligence Command Center". Subtitle: "DEWA Centre of Excellence · Updated 20 Mar 2026". Live badge with pulsing dot.

**Section 1 — Key Performance Indicators (4 cards):**
- AI Adoption Rate: 64% animated circular ring chart, "Across all divisions"
- Total AI Initiatives: counter to 47, "+6 from last quarter ↑"
- Active AI Projects: counter to 31, "7 new this quarter"
- People Trained in AI: counter to 1,182, "Target: 1,500 by Q2"

**Section 2 — Impact Analysis:**
- 2×2 impact card grid: AED 4.2M Cost Savings (+38% YoY), 28,400 Process Hours Automated (≡ 14.2 FTEs), +34% Operational Efficiency Gain, −62% Error Rate Reduction
- ROI Trend chart (Recharts ComposedChart): green bars for monthly cost savings (AED K, Oct→Mar), gold line for process hours saved (3,200→7,400)

**Section 3 — AI Risk & Governance:**
- 4 stat badges: 9 Open Risk Items (red), 94% AI Compliance Score (green), 3 Active Incidents (amber), 88% Model Audit Coverage (blue)
- Risk-by-category breakdown list: Data Privacy & Compliance (2, high), Model Bias & Fairness (3, medium), Operational Reliability (1, medium), Cybersecurity Exposure (1, low), Vendor & Third-Party (2, low)

**Section 4 — AI Workforce Readiness:**
- 4 workforce metric cards with progress bars: 1,182 Trained (78.8%), 89 Certified AI Practitioners (59%), 6 Active Learning Paths (100%), 4.1/5 Avg Assessment Score (82%)
- Skill Domain Completion panel: 6 horizontal bars colour-coded green/amber/red — Data Literacy 84%, AI/ML Fundamentals 78%, Prompt Engineering 61%, AI Ethics & Governance 55%, MLOps & Deployment 38%, NLP & Computer Vision 29%

**Section 5 — AI Programs Overview:**
- Date range toggle: This Month / This Quarter / This Year (switches dataset)
- Bar chart of programmes by category (Events, Trainings, Technologies, Initiatives)
- Programme count tiles (large number + category label)

---

### 5.3 Division Analytics

**Route key:** `"divisions"`  
**File:** `src/pages/DivisionAnalytics.tsx`

Division-level AI adoption and organisational change readiness. Two sub-tabs:

**Adoption tab:**  
Bar chart showing AI adoption rate (%) per DEWA division. Divisions: IT & Digital, Generation, Transmission, Distribution, HR, Finance, Customer Service, Corporate. Bars coloured by adoption level (green ≥70%, amber 50–69%, red <50%).

**ADKAR tab:**  
Five-dimension change readiness model per division. Each dimension (Awareness, Desire, Knowledge, Ability, Reinforcement) shown as a parallel bar or radar chart. Scores 0–100 per division.

---

### 5.4 People & Skills

**Route key:** `"people"`  
**File:** `src/pages/PeopleSkills.tsx`  
**CSS:** `src/pages/ps/*.css`

Hub page with four tab sub-sections. State: `activeTab` ∈ `{"adoption", "certifications", "skills", "performance"}`.

**Tab 1 — People Adoption** (`PeopleAdoptionTab.tsx`):  
Live Dataverse data. Fetches `Cr978_coe_persons`, `Cr978_coe_divisions`, `Cr978_coe_departments`, `Cr978_coe_approles` simultaneously. Resolves FK GUIDs to human-readable names via Map lookups.  
Displays: KPI strip (Total Employees, Active, Inactive), filterable table (search by name, dropdown filters for division/department/role/status), one row per employee showing name, email, division, department, designation, role, adoption status badge.

**Tab 2 — Certifications** (`CertificationsTab.tsx`):  
Static data. List of 17 certifications across 18 employees. Columns: employee name, certification title, provider (Microsoft, Google, AWS, Coursera, DEWA Internal), status (Completed/In Progress/Expired), expiry date, renewal alert flag.  
Summary: provider breakdown bar chart, status distribution donut.

**Tab 3 — Skills** (`SkillsTab.tsx`):  
Static data. Tag cloud of 15 skill tags sized by employee count. Category filter buttons: All, AI/ML, Data, Tools, Programming. Bar chart of top 10 skills by employee adoption count.

**Tab 4 — Performance** (`PerformanceTab.tsx`):  
Static data. Performance score distribution histogram. AI contribution rating heatmap by employee vs. quarter.

---

### 5.5 Programs

**Route key:** `"programs"`  
**File:** `src/pages/Programs.tsx`  
**CSS:** `src/programs.css` (inferred)

Live Dataverse data (`Cr978_coe_programs`). Shows all COE programmes as cards.

Each `ProgramCard` displays: programme name, status badge (Active/Completed/Upcoming), description, date range (start → end), division owner, event count, total participant count.

Toolbar: text search (filters by name), status filter tabs (All / Active / Completed / Upcoming), "+ Add Program" button.

Clicking any programme card or its "View Events" button sets `contextProgram` in Layout state and switches `activeTab` to `"events"` — this is the only cross-page navigation in the app.

"+ Add Program" opens `AddProgramModal`: form fields — programme name, start date, end date, division (dropdown), programme owner. Submit calls `Cr978_coe_programsService.create()`. On success, refetches all programmes and closes modal.

---

### 5.6 Events

**Route key:** `"events"`  
**File:** `src/pages/Events.tsx`  
**Sub-component:** `src/pages/prog/CalendarView.tsx`  
**CSS:** `src/events.css` (inferred)

Live Dataverse data (`Cr978_coe_eventses`). Also fetches `Cr978_coe_divisions` for name resolution.

Toolbar: status tabs (All / Upcoming / Completed / Cancelled), view toggle (List ↔ Calendar).

**List view:** Cards for each event showing: event name, type badge (Workshop/Seminar/Hackathon/Webinar/Town Hall), status badge (Upcoming/Completed/Cancelled), date, location, division, participant count. Clicking a card opens `EventModal`.

**Calendar view** (`CalendarView`): Month grid. Each day cell shows coloured dot(s) for scheduled events. Legend at bottom maps event type to colour. Clicking a dot/day opens that event's modal.

**EventModal** (full-screen overlay): Event name, type, status, date/time, location, description. Meta grid: programme name, division, organiser, participant count. Speaker cards (name, title, organisation, avatar). Attendee list. Timeline of event stages (Created → Confirmed → Completed).

If the user navigated here via a programme card click (contextProgram set), the events list is pre-filtered to that programme. A "← Back to Programs" breadcrumb appears at the top.

---

### 5.7 Technology Stack

**Route key:** `"technology"`  
**File:** `src/pages/TechnologyStack.tsx`  
**Sub-component:** `src/pages/ps/AIToolsTab.tsx`

AI tool adoption analytics. Static data (7 tools: ChatGPT, Claude, Microsoft Copilot, Power BI, Azure AI Services, DALL-E, GitHub Copilot).

**Tool list view:** Each tool shown as a row or card with: tool name + logo/icon, overall adoption rate %, monthly growth %, total queries/month, user satisfaction score (NPS-style), avg session duration. Clicking a tool opens the tool detail panel.

**Tool detail panel:** KPI card row (active users, adoption %, monthly growth, queries). 6-month trend line chart. Department breakdown bar chart showing adoption split across IT & Digital / Generation / Transmission / HR / Finance / Customer Service / Corporate.

---

### 5.8 Discovery Catalog

**Route key:** `"discovery"`  
**File:** `src/pages/DiscoveryCatalog.tsx`  
**CSS:** `src/discovery-catalog.css` (inferred)

Live Dataverse data. Fetches `Cr978_coe_discoveries` + lookup tables (divisions, departments, persons).

**KPI strip:** Total discoveries, AI-type count, Non-AI count, divisions represented, departments represented, IT leads assigned.

**Status pipeline view:** Each discovery card shows: title, submitting division/department, type badge (AI/Non-AI), status badge (Submitted / Under Review / Approved / In Development / In Testing / Delivered / Rejected / On Hold), IT lead name, submission date.

**Charts:** Status breakdown pie chart, AI vs. Non-AI type split, department contribution bar chart.

Filters: search by title, filter by status, filter by type, filter by division.

---

### 5.9 AI Incidents

**Route key:** `"incidents"`  
**File:** `src/pages/AIIncident.tsx`  
**CSS:** `src/ai-incident.css`

Live Dataverse data (`Cr978_coe_aiincidents`).

**Incident list:** Table rows with columns: ticket number, incident name, AI platform (ChatGPT/Copilot/Azure AI/etc.), incident type, priority badge (Critical/High/Medium/Low, colour-coded), severity badge (P1/P2/P3/P4), status, reported date, assigned to, data risk flag icon.

Toolbar: status filter tabs, priority filter dropdown, search by name or ticket number.

Clicking a row opens the **Incident Detail Modal**: Full incident summary. Timeline panel showing Created → Reported → Acknowledged → In Progress → Resolved → Closed with timestamps. Tags (array of strings). People affected count. Root cause text. "Reported by" and "Assigned to" person fields.

**Summary charts above the table:** Incident count by status (bar), priority distribution (horizontal bar), incident type breakdown (bar with custom colour palette).

---

### 5.10 Finance

**Route key:** `"finance"`  
**File:** `src/pages/Finance.tsx`  
**CSS:** `src/finance.css` (inferred)

Mixed data: live Dataverse `Cr978_coe_divisions` for division names, merged with a hardcoded `FINANCE_SEED` array for budget figures (since no Finance Dataverse table exists yet).

**Per-division finance cards:** Division name, allocated budget (AED M), actual spend (AED M), year-end forecast (AED M), utilisation % with status flag (Under Budget / On Track / At Risk / Over Budget), YoY change %, project count.

**Charts:** Budget vs. Spend grouped bar chart (all divisions), Utilisation % horizontal bar (ranked), YoY growth scatter, Division spending share pie chart.

**Aggregate strip at top:** Total budget, total spend, total forecast, overall utilisation %, number of divisions over budget, number at risk.

---

### 5.11 Strategic Roadmap

**Route key:** `"roadmap"`  
**File:** `src/pages/StrategicRoadmap.tsx`

Static data. Four transformation phases: Foundation, Growth, Excellence, Innovation. Each phase has a completion % and a list of initiatives.

**Phase cards strip:** Phase name, description, overall % complete, start/end quarter, visual progress bar.

**Initiative list (filterable):** Each initiative card shows: name, phase, category badge (Infrastructure / Data & Analytics / AI/ML / People & Skills / Process / Innovation), status (Not Started / In Planning / In Progress / Completed / On Hold), progress %, owner, target quarter. Filters: search, division, status, category.

Clicking an initiative opens the **Initiative Detail Modal**: full description, list of milestones with status checkboxes and target dates, list of KPIs with target and current values.

---

### 5.12 AI Command Center

**Route key:** `"commandcenter"`  
**File:** `src/pages/AICommandCenter.tsx`

Live Dataverse data (`Cr978_powerbidashboards`).

Tracks the deployment status of Power BI dashboards across the organisation.

**KPI strip:** Total dashboards, dashboards by status (Not Started / In Progress / On Hold / Completed), dashboards by phase (Pending / Development / UAT / Deployment / Completed), dashboards by priority (Critical / High / Medium / Low).

**Charts:** Status distribution donut, Phase breakdown bar chart, Priority breakdown bar chart.

**Dashboard list:** Searchable + filterable table. Each row: dashboard name, phase badge, status badge, priority badge, owner, target date. Expanding a row shows full description and linked programme.

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
  └─ User sees LaunchScreen
       └─ User clicks "Launch Platform"
            └─ 700ms spinner delay
            └─ App.launched = true
            └─ Layout renders with Sidebar + Executive Summary (default tab)
```

### 6.2 Standard Navigation

```
User is on any page
  └─ Clicks a nav item in Sidebar
       └─ Sidebar calls onTabChange(tabId)
            └─ Layout sets activeTab = tabId
            └─ Main content area renders the new page component
            └─ New page's useEffect fires → fetches Dataverse data (if live page)
            └─ Page renders: loading state first, then populated state
```

### 6.3 Programs → Events Drill-Down

```
User is on Programs page
  └─ Sees programme card for "AI Literacy Drive"
  └─ Clicks "View Events" button on that card
       └─ Programs calls Layout's onProgramSelect("AI Literacy Drive")
            └─ Layout sets contextProgram = { id, name, ... }
            └─ Layout sets activeTab = "events"
            └─ Events page renders
                 └─ Detects contextProgram is set
                 └─ Filters event list to programme's events only
                 └─ Shows "← Back to Programs" breadcrumb
  └─ User clicks "← Back to Programs"
       └─ Layout clears contextProgram = null
       └─ Layout sets activeTab = "programs"
       └─ Programs page renders (unfiltered)
```

### 6.4 Adding a New Programme

```
User is on Programs page
  └─ Clicks "+ Add Program"
       └─ modalOpen = true
       └─ AddProgramModal renders (overlay on top of page)
  └─ User fills form:
       └─ Programme Name (required text input)
       └─ Start Date (date picker)
       └─ End Date (date picker)
       └─ Division (dropdown, populated from division list)
       └─ Programme Owner (text input)
  └─ User clicks "Save"
       └─ Client-side validation:
            ├─ All fields present? → continue
            └─ Missing field? → highlight empty inputs, do not submit
       └─ Cr978_coe_programsService.create(formData) called
            ├─ Success → modal closes, programmes list refetches, new card appears
            └─ Error → error message shown inside modal, modal stays open
  └─ User clicks "Cancel" or clicks overlay
       └─ modalOpen = false, form state reset, modal unmounts
```

### 6.5 Viewing an AI Incident

```
User is on AI Incidents page
  └─ Page loads → fetches cr978_coe_aiincidents
       └─ Loading state: skeleton rows
       └─ Populated: incident table renders
  └─ User uses status filter (e.g., "Active")
       └─ Table filters client-side, no new fetch
  └─ User clicks a row
       └─ selectedIncident = incident record
       └─ EventModal renders with full details
            └─ Timeline panel shows status history
            └─ Tags rendered as pill badges
            └─ Data risk flag shown if flagged
  └─ User clicks "×" or overlay
       └─ selectedIncident = null, modal unmounts
```

### 6.6 Using CommandIQ (AI Chat)

```
CommandIQ floating orb is always visible (bottom-right corner)
  └─ User clicks orb
       └─ open = true
       └─ Chat panel slides in
       └─ If first open: welcome message + 6 quick-prompt buttons shown
  └─ User clicks quick prompt (e.g., "AI Adoption Rate")
       └─ Input pre-filled with prompt text
       └─ Auto-sends (or user presses Enter / clicks Send)
  └─ User types custom question + presses Enter
       └─ Message appended to messages[] with role="user"
       └─ thinking = true (typing indicator shown)
       └─ fetch POST to Power Automate endpoint: { Prompt, ConverId }
            ├─ Success:
            │    └─ AI message appended with role="assistant", done=false
            │    └─ Typewriter animation: 2 chars every 20ms until full text
            │    └─ done=true, thinking=false
            └─ Error:
                 └─ "I couldn't reach the AI endpoint." fallback message
                 └─ thinking=false
  └─ conversationIdRef persists between turns for multi-turn context
  └─ User clicks "×" to close panel
       └─ open = false, panel hides, unread badge resets
```

### 6.7 Switching Executive Summary Date Range

```
User is on Executive Summary page, Section 5 (Programs Overview)
  └─ Three toggle buttons: "This Month" / "This Quarter" / "This Year"
  └─ User clicks "This Year"
       └─ dateRange = "year"
       └─ programData = PROGRAM_DATA["year"] (Events:38, Trainings:94, Tech:22, Initiatives:18)
       └─ BarChart re-renders with new data
       └─ Total badge updates to 172
       └─ Programme count tiles update
       └─ No fetch — all data is static/local
```

---

## 7. Screen State Descriptions

### 7.1 Launch Screen States

| State | What the user sees |
|-------|--------------------|
| **Loading** | Left panel: "Signing in…" spinner. Right panel: progress steps animating one by one (Initialising context → Ready). KPI counters tick up to their values. |
| **Authenticated** | Left panel: "Welcome, [Name]" greeting. Launch button active (not disabled). |
| **Auth failed / no context** | Name falls back to "User". Role falls back to "Member". Platform still fully functional — Dataverse calls that need the user context may return empty. |
| **Launching** | Button shows spinner for 700ms, then app transitions. |

### 7.2 Programs Page States

| State | What the user sees |
|-------|--------------------|
| **Loading** | Skeleton card placeholders (3 grey animated rectangles). Toolbar is visible and functional. |
| **Empty (no programmes)** | "No programmes found" illustration with a call-to-action "+ Add your first programme" button. |
| **Populated (few, e.g. 3)** | Cards in a single row. Toolbar filters are functional but most show all results. |
| **Populated (many, e.g. 47)** | Cards wrap across multiple rows. Filters become practically useful — user can narrow down by status or search. |
| **Filtered (no matches)** | "No programmes match your search" empty state within the filtered card area. Toolbar still visible with active filter indicator. |
| **Add Modal open** | Full-page overlay dims background. Modal centred. Form fields blank. Save button disabled until required fields filled. |
| **Save in progress** | Save button shows spinner. Form inputs disabled. |
| **Save error** | Error banner inside modal: "Failed to save programme. Please try again." Form inputs re-enabled. |
| **Filtered to one programme (via contextProgram)** | Breadcrumb "← Back to Programs" visible. Card list shows only that programme's events (actually on Events page). |

### 7.3 Events Page States

| State | What the user sees |
|-------|--------------------|
| **Loading** | Skeleton event cards (list view) or skeleton calendar grid (calendar view). |
| **Empty** | "No events scheduled" illustration. |
| **List view — populated** | Event cards in a vertical list. Status tabs show counts (e.g., "Upcoming (8)"). |
| **Calendar view — populated** | Month grid with coloured dots on dates that have events. Empty days are blank white cells. |
| **Filtered by status** | Only matching cards visible. Active tab highlighted. |
| **Filtered by programme (contextProgram)** | Breadcrumb visible. Narrowed list. Title updates to "Events — [Programme Name]". |
| **Modal open** | Full-screen event detail overlay. Background dimmed. Scrollable modal body. |

### 7.4 People Adoption Tab States

| State | What the user sees |
|-------|--------------------|
| **Loading** | KPI strip shows dashes (—). Table shows skeleton rows. |
| **Error** | "Unable to load employee data" alert banner. Table area replaced with retry button. |
| **Populated — small team (< 20)** | All rows fit without pagination. Filters show full team. |
| **Populated — large org (200+)** | Pagination or virtual scrolling activates. Filters become critical for usability. |
| **Filtered (no results)** | "No employees match this filter" shown in table body. Clear filters link visible. |
| **Admin view** | (Planned) Edit buttons on rows. Export CSV button visible. |
| **Regular user view** | Read-only. No edit controls. |

### 7.5 AI Incidents Page States

| State | What the user sees |
|-------|--------------------|
| **Loading** | Summary charts show empty/skeleton. Table shows skeleton rows. |
| **No incidents** | Charts show zero-state (empty donut, no bars). Table shows "No incidents recorded." |
| **All resolved** | All rows show green "Closed" or "Resolved" status badges. Priority chart peaks at Low. |
| **Active critical incident** | Row with red "Critical" badge appears at top (sorted by priority). Data risk icon flag visible if data was compromised. |
| **Modal open** | Overlay with timeline. If incident is active, "Resolved" / "Escalate" action buttons visible (future feature). |

### 7.6 Executive Summary States

| State | What the user sees |
|-------|--------------------|
| **Initial render** | All counters at 0. Progress bars at 0 width. Charts empty. |
| **Scrolling into view** | `useInView` fires for each section → counters animate to their target, bars fill, rings draw. |
| **Date range toggle** | Program chart and tiles instantly swap data (no loading state — purely local). |
| **Fully scrolled** | All animations completed. Static final values displayed. |

*(Note: Executive Summary has no live Dataverse calls — it never enters a "loading" or "error" state.)*

### 7.7 CommandIQ States

| State | What the user sees |
|-------|--------------------|
| **Closed** | Floating orb (bottom-right). Unread badge if new messages since last open. |
| **Open — first time** | Welcome message. 6 quick-prompt buttons below it. Empty input field. |
| **Open — conversation active** | Message thread. Quick-prompt buttons hidden. Input + Send button. |
| **Thinking** | Typing indicator (three pulsing dots) in assistant message row. Send button disabled. |
| **Streaming response** | Text appears character by character via typewriter animation. |
| **Error** | "I couldn't reach the AI endpoint" message in assistant row. Input re-enabled. |

---

## 8. Component Inventory

### 8.1 Navigation & Shell

**`Layout` (`src/components/Layout.tsx`)**  
The full app shell. Owns `activeTab`, `collapsed`, `mobileOpen`, `contextProgram`. Renders Sidebar + Topbar + page content switch. The only place cross-page navigation state lives.

**`Sidebar` (`src/components/Sidebar.tsx`)**  
Left navigation panel. Props: activeTab, onTabChange, collapsed, mobileOpen, onLogout. Sub-menu for Programs/Events. User profile footer. Collapses to icon-only mode. Shows tooltips in collapsed state.

**`Icon` (`src/components/Icon.tsx`)**  
Inline SVG icon renderer. 149 Bootstrap Icons embedded as path strings. Usage: `<Icon name="bi-chart-line" />`. Preferred over loading external icon fonts.

### 8.2 Launch & Auth

**`LaunchScreen` (`src/components/LaunchScreen.tsx`)**  
Full-viewport animated onboarding screen. Contains `LaunchAnim` sub-component (tabs + animated preview cards). Calls `useCurrentUser()`. Self-times its loading animation sequence.

**`useCurrentUser` (`src/hooks/useCurrentUser.ts`)**  
Custom hook. Reads user identity from Power Apps SDK context, enriches with Dataverse person record. Returns `{ name, role, email, loading }`. 6-second timeout failsafe for local dev.

### 8.3 Data Visualisation (Recharts Wrappers)

All charts are Recharts components wrapped in `ResponsiveContainer` at 100% width. Used directly in page files — no abstraction layer.

| Chart type | Used in | Config notes |
|------------|---------|--------------|
| `BarChart + Bar` | ExecutiveSummary, DivisionAnalytics, Finance, AICommandCenter | `radius={[8,8,0,0]}` for rounded tops, `Cell` per-bar for custom colours |
| `ComposedChart + Bar + Line` | ExecutiveSummary (ROI Trend) | Dual Y-axes: left for savings, right for hours |
| `LineChart + Line` | TechnologyStack (trend) | `dot` styling, `activeDot` for hover |
| `PieChart + Pie + Cell` | DiscoveryCatalog, AICommandCenter | Custom `labelLine` rendering |
| Custom tooltips | All charts | Dark background `#1c2a24`, white text, colour-matched value labels |

### 8.4 Reusable UI Patterns (Page-Level, Not Yet Extracted)

These patterns repeat across pages but are currently implemented inline:

**Status Badge**  
Pill-shaped span with background colour and text. Colours: green (Active/Completed/Low), amber (In Progress/Medium), red (Critical/High), grey (On Hold/Upcoming/Unknown). Present in: Programs, Events, Incidents, DiscoveryCatalog, StrategicRoadmap, AICommandCenter.

**KPI Card**  
Glass-style card with: icon (top-left), large value (animated counter), label, sub-text. Optional ring chart variant. Present in: ExecutiveSummary (KpiCard component), LaunchScreen.

**Section Header**  
Icon + title text + animated underline that extends right. Sub-text below. Present in ExecutiveSummary as `SectionHeader` component.

**Filter Toolbar**  
Horizontal row of: text search input, status tab buttons, optional dropdown selects. Present in: Programs, Events, Incidents, DiscoveryCatalog, StrategicRoadmap.

**Detail Modal**  
Full-screen overlay. Close button (top-right). Scrollable content area. Sub-sections divided by light rules. Present in: Events (EventModal), Incidents, StrategicRoadmap.

**Progress Bar (Animated)**  
`AnimBar` in ExecutiveSummary — div track + div fill, width transitions from 0% to value% when inView fires.

**Animated Ring Chart**  
`AnimatedRing` in ExecutiveSummary — SVG circle with `strokeDashoffset` transition, counter overlay text.

**Animated Counter**  
`useCounter` hook in ExecutiveSummary — `requestAnimationFrame` loop with cubic-bezier easing, outputs integer.

### 8.5 AI Chat

**`CommandIQ` (`src/components/CommandIQ.tsx`)**  
Floating orb + slide-in panel. Self-contained — no props, no context. Manages its own message history, conversation ID, streaming state. Connects to Power Automate via `fetch`.

### 8.6 Forms

**`AddProgramModal`** (inside `Programs.tsx`)  
Controlled form. Fields: name, start date, end date, division (select), owner. Client validation before submit. Calls `Cr978_coe_programsService.create()`. Only create form in the app — all other data is read-only.

---

## 9. Data Relationships

### 9.1 Dataverse Tables & Relationships

```
cr978_coe_divisions (8 DEWA divisions)
  ├─ cr978_coe_departments  (many departments per division)
  │    └─ _cr978_coe_division_value → FK to division
  ├─ cr978_coe_persons
  │    └─ _cr978_coe_division_value → FK to division
  │    └─ _cr978_coe_department_value → FK to department
  │    └─ _cr978_coe_approle_value → FK to app role
  ├─ cr978_coe_programs
  │    └─ _cr978_coe_division_value → FK to division
  └─ cr978_coe_discoveries
       └─ _cr978_coe_requestingdivision_value → FK to division
       └─ _cr978_coe_requestingdepartment_value → FK to department
       └─ _cr978_it_lead_value → FK to person

cr978_coe_programs (programmes)
  └─ cr978_coe_eventses (events)
       └─ _cr978_coe_program_value → FK to programme

cr978_coe_aiincidents (AI incidents)
  └─ _cr978_coe_reportedby_value → FK to person
  └─ _cr978_coe_assignedto_value → FK to person

cr978_coe_approles (app roles: Admin, Analyst, Viewer, etc.)
  └─ referenced by cr978_coe_persons

cr978_powerbidashboards (Power BI dashboards)
  └─ _cr978_coe_program_value → FK to programme (optional)
```

### 9.2 FK Resolution Pattern

FK columns in Dataverse are stored as GUIDs (e.g., `_cr978_coe_division_value = "07da6342-..."`). Pages that need human-readable names must resolve these themselves:

```ts
// Pattern used in PeopleAdoptionTab, DiscoveryCatalog, Events
const [divisionsRes, departmentsRes] = await Promise.all([
  Cr978_coe_divisionsService.getAll(),
  Cr978_coe_departmentsService.getAll(),
])
const divisionMap = new Map(divisionsRes.data.map(d => [d.id, d.name]))
// Then when rendering a person row:
const divisionName = divisionMap.get(person._cr978_coe_division_value) ?? "Unknown"
```

### 9.3 What Data Is Live vs. Static

| Page / Section | Data source | Notes |
|---------------|-------------|-------|
| Executive Summary | **Static** | Q1 2026 snapshot hardcoded in component |
| Division Analytics | **Static** | Hardcoded per-division scores |
| People — Adoption tab | **Live (Dataverse)** | 4 tables fetched on mount |
| People — Certifications | **Static** | `src/pages/ps/data.ts` |
| People — Skills | **Static** | `src/pages/ps/data.ts` |
| People — Performance | **Static** | `src/pages/ps/data.ts` |
| Programs | **Live (Dataverse)** | Full CRUD (read + create) |
| Events | **Live (Dataverse)** | Read-only fetch |
| Technology Stack | **Static** | `src/pages/ps/data.ts` (AI tools) |
| Discovery Catalog | **Live (Dataverse)** | Read-only, 3 lookup tables |
| AI Incidents | **Live (Dataverse)** | Read-only |
| Finance | **Hybrid** | Division names from Dataverse, budget figures from FINANCE_SEED array |
| Strategic Roadmap | **Static** | Hardcoded phases + initiatives |
| AI Command Center | **Live (Dataverse)** | Read-only |
| CommandIQ chat | **Live (Power Automate)** | Real-time fetch per message |

### 9.4 Cross-Page State

Only one piece of state crosses page boundaries: `contextProgram` in `Layout`. It is set when a user clicks "View Events" on a programme card, and cleared when the user navigates back. No other data is shared between pages — each page is fully independent.

### 9.5 Persistent vs. Temporary Data

| Data | Persisted where | Lifecycle |
|------|----------------|-----------|
| All Dataverse records | Dataverse cloud | Permanent — survives app reload |
| New programmes (AddProgramModal) | Dataverse via service.create() | Permanent |
| Active tab | `Layout` useState | Session only — resets on page reload |
| contextProgram | `Layout` useState | Session only — clears on back-navigation |
| CommandIQ conversation ID | `useRef` in CommandIQ | Session only — new conversation on reload |
| CommandIQ message history | `useState` in CommandIQ | Session only — cleared on panel close |
| Filter/search inputs | Local `useState` per page | Session only — cleared on tab switch |
| Animation state (inView, counters) | Local `useState` per section | Session only — re-animates on next scroll |

### 9.6 Real-Time Requirements

Only CommandIQ requires real-time behaviour (streaming AI response). All Dataverse pages fetch once on mount — there is no polling or websocket refresh. If a colleague adds a new programme while you're viewing the Programs page, you won't see it until you navigate away and back. This is an accepted limitation for the current version.

---

## 10. Build & Deployment

### Development

```bash
npm run dev       # pac code run + vite on http://localhost:3000
npm run lint      # ESLint check (TypeScript strict rules)
```

Dataverse calls fail gracefully in local dev (SDK context not available). All static data pages work fully offline. The `useCurrentUser` hook has a 6-second timeout and falls back to `{ name: "User", role: "Member" }`.

### Production Build

```bash
npm run build     # tsc -b && vite build → ./dist
npm run preview   # preview ./dist on local server
```

Output is a standard Vite bundle (`./dist/index.html` + hashed JS/CSS chunks). The Microsoft Power Apps Vite plugin packages this for deployment to Power Platform via `pac code push`.

### Deployment Target

Power Platform custom page or canvas app in environment `07da6342-8cc4-e81c-95fa-9ce24e7c2f46`. The app runs inside the Power Apps runtime container which provides the SDK context, Dataverse connectivity, and user authentication.

### TypeScript Strictness

`strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`. All Dataverse models are strongly typed from generated code. Adding a new Dataverse table requires re-running the Power Apps code generation tool, not writing model code by hand.

---

---

## Recent Changes

| Date | Change |
|------|--------|
| 2026-04-12 | **Font stack** updated to `'Dubai', 'Segoe UI', system-ui, sans-serif` across all CSS files and inline styles. All monospace/system-ui-only declarations replaced. |
| 2026-04-12 | **No-emoji rule** enforced. All emoji characters replaced with `<Icon name="bi-*" />` (Bootstrap Icons). `bi-currency-dirham` made mandatory for all currency/finance contexts. |
| 2026-04-12 | **CopilotKit restructured** — embedded inside Technology Stack as `CopilotKitPanel`. `copilot-kit` tab removed. `CopilotDataContext` added for app-launch fetch. Agent Value Intelligence section added with 6 KPI tiles, 2 pie charts, type/behavior/benefit charts, and registry table. |
| 2026-04-11 | **Copilot Kit tab** added (`src/pages/CopilotKit.tsx`). POSTs to Power Automate workflow `9a88f1c452a44be38a30f46d48b6942d`. |
| 2026-04-11 | **Technology Stack** page wraps `AIToolsTab`. |
| 2026-04-11 | **AIToolsTab.tsx** Microsoft Copilot live card + detail panel. |

*Last updated: 2026-04-12. Active tabs: executive-summary, division-analytics, programs, events, people-skills, technology-stack, discovery-catalog, ai-incident, al-hasbah, ai-command-center.*

---

## 11. Coding Conventions

### 11.1 Icons — No Emojis

**Never use emoji characters anywhere in the application.** Use Bootstrap Icons via the `<Icon>` component (`src/components/Icon.tsx`) exclusively.

```tsx
// WRONG
<span>🤖</span>
{ icon: '📊' }

// CORRECT
<Icon name="bi-robot" />
{ icon: 'bi-bar-chart-line-fill' }
```

### 11.2 Currency Icon — Dirham Only

**Always use `bi-currency-dirham` for any currency, money, finance, or budget context.** Never use `bi-currency-dollar`, `bi-currency-euro`, or any other currency icon.

```tsx
// WRONG
<Icon name="bi-currency-dollar" />

// CORRECT
<Icon name="bi-currency-dirham" />
```

### 11.3 Typography — Font Stack

**Always use the full font stack `'Dubai', 'Segoe UI', system-ui, sans-serif` everywhere.** Dubai is the primary brand font; Segoe UI is the Microsoft UI fallback; `system-ui` is the OS fallback. Never use monospace, Roboto, Arial, Consolas, or any other family.

```css
/* WRONG */
font-family: 'Dubai';
font-family: ui-monospace, Consolas, monospace;

/* CORRECT */
font-family: 'Dubai', 'Segoe UI', system-ui, sans-serif;
```

```tsx
// WRONG
fontFamily: "'Dubai'"
fontFamily: 'monospace'

// CORRECT
fontFamily: "'Dubai', 'Segoe UI', system-ui, sans-serif"
```

CSS variables in `src/index.css` are already set correctly:
- `--sans: 'Dubai', 'Segoe UI', system-ui, sans-serif`
- `--heading: 'Dubai', 'Segoe UI', system-ui, sans-serif`
- `--mono: 'Dubai', 'Segoe UI', system-ui, sans-serif`
