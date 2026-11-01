# UI-REVIEW.md — 6-Pillar Visual & UX Audit

**Project:** NeuraTask (AI Task Manager)  
**Date:** October 31, 2026  
**Auditor:** Senior Frontend Engineer & Product Designer  
**Scope:** Full Application UI (Dashboard, Task AI Chat, Landing, Settings, Table, Calendar, Sidebar)

---

## 📊 Executive Scorecard

| Pillar | Grade (1-4) | Status | Key Observation |
|---|:---:|:---:|---|
| **1. Visual Hierarchy & Layout** | **2.5 / 4** | ⚠️ Needs Work | Dense dashboard grid; missing unified top-header; no desktop quick actions bar. |
| **2. Typography & Readability** | **2.0 / 4** | 🔴 Critical Bug | `globals.css` references undefined `--font-geist-sans` instead of loaded `--font-inter`. |
| **3. Color, Contrast & Dark Mode** | **2.0 / 4** | 🔴 Critical Bug | `next-themes` installed but no `ThemeProvider` mounted; dark mode inaccessible; hardcoded bright badge colors. |
| **4. Interactive States & Micro-interactions** | **3.0 / 4** | 🟡 Adequate | Stat cards have static shadows; table rows lack hover polish; button presses lack tactile spring. |
| **5. Component Polish & Consistency** | **2.5 / 4** | ⚠️ Needs Work | Calendar uses plain generic colors (`bg-red-500`, `bg-green-400`); stat card icon backgrounds are monochrome. |
| **6. Mobile Responsiveness & Adaptability** | **3.0 / 4** | 🟡 Adequate | Drawer works but desktop/mobile header rhythm is disjointed; table lacks smooth horizontal overflow card. |

**Overall Score:** **2.5 / 4.0** *(Solid technical baseline, but visual aesthetics feel like an MVP rather than a state-of-the-art SaaS product).*

---

## 🔍 Detailed Pillar Breakdown

### Pillar 1: Visual Hierarchy & Layout (2.5 / 4)
- **Finding 1.1:** The dashboard layout in [`app/(root)/dashboard/page.tsx`](file:///d:/Work/ai-task-manager/app/(root)/dashboard/page.tsx) directly jumps from a plain text header into a 4-card grid without a unified action bar (no "New Task" modal trigger, no date picker or filter presets in the header).
- **Finding 1.2:** The desktop layout has a static sidebar on the left and a generic `max-w-7xl` container on the right, but lacks a sticky top app header with breadcrumbs, notifications, and profile details.
- **Redesign Solution:** Introduce a cohesive top navbar in `app/(root)/layout.tsx` that includes active context breadcrumbs, theme switcher, and an actionable "Create Task" button.

### Pillar 2: Typography & Readability (2.0 / 4)
- **Finding 2.1:** In [`app/layout.tsx`](file:///d:/Work/ai-task-manager/app/layout.tsx), `Inter` is configured as `--font-inter`, but in [`app/globals.css`](file:///d:/Work/ai-task-manager/app/globals.css) line 17, `--font-sans` is mapped to `--font-geist-sans`. Because Geist is never imported, the browser falls back to generic Arial/system fonts.
- **Finding 2.2:** Numbers in stat cards (`text-3xl font-bold`) lack tabular numeric font features (`tabular-nums`), causing shifting when numbers increment.
- **Redesign Solution:** Re-bind `--font-sans: var(--font-inter), sans-serif` with font feature settings (`cv02`, `cv03`, `cv04`, `tnum`). Add `tracking-tight` across all primary and secondary headings.

### Pillar 3: Color, Contrast & Dark Mode (2.0 / 4)
- **Finding 3.1:** `next-themes` is installed in `package.json`, and `.dark` variables are defined in `globals.css`, but `ThemeProvider` is missing from `app/layout.tsx`. Users have no way to toggle dark mode.
- **Finding 3.2:** In [`components/tasks/columns.tsx`](file:///d:/Work/ai-task-manager/components/tasks/columns.tsx), badges use hardcoded light-only classes (`bg-red-100 text-red-700`). In dark mode, these render with jarring harsh contrast.
- **Redesign Solution:** Mount `ThemeProvider` with system preference detection; build an animated `ThemeToggle` button; replace generic Tailwind 100/700 shades with semantic alpha-tokens (`bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20`).

### Pillar 4: Interactive States & Micro-interactions (3.0 / 4)
- **Finding 4.1:** Stat cards have a flat hover transition (`transition-shadow hover:shadow-md`) without scale or border illumination.
- **Finding 4.2:** Navigation items in [`components/shared/Sidebar.tsx`](file:///d:/Work/ai-task-manager/components/shared/Sidebar.tsx) use an abrupt background swap instead of smooth pill indicator animations.
- **Redesign Solution:** Add subtle glassmorphism (`backdrop-blur-md`), smooth hover elevation (`hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/40`), and springy button presses (`active:scale-[0.98]`).

### Pillar 5: Component Polish & Consistency (2.5 / 4)
- **Finding 5.1:** In [`components/calender/Calendar.tsx`](file:///d:/Work/ai-task-manager/components/calender/Calendar.tsx), urgency indicators use raw CSS colors (`bg-red-500`, `bg-orange-500`, `bg-yellow-400`, `bg-green-400`), violating modern harmonious palette guidelines.
- **Finding 5.2:** Stat card icons in [`components/dashboard/StatCard.tsx`](file:///d:/Work/ai-task-manager/components/dashboard/StatCard.tsx) all use identical `bg-primary/10 text-primary` irrespective of whether the metric represents Overdue, Pending, or Completed.
- **Redesign Solution:** Color-code stat card icons with curated tone-on-tone accents (Emerald for Completed, Amber for Pending, Rose for Overdue, Indigo for Total). Redesign Calendar day cells with subtle status pips.

### Pillar 6: Mobile Responsiveness & Adaptability (3.0 / 4)
- **Finding 6.1:** Mobile sidebar trigger in [`components/MobileSidebar.tsx`](file:///d:/Work/ai-task-manager/components/MobileSidebar.tsx) floats awkwardly without a fixed mobile app bar.
- **Finding 6.2:** Recent Tasks list on small screens gets vertically compressed next to the calendar.
- **Redesign Solution:** Establish a dedicated mobile header with brand logo, mobile menu drawer toggle, and theme switch. Ensure touch targets remain &ge; 44px.

---

## 🛠️ Redesign Execution Roadmap

1. **Tokens & Theme Provider**: Bind Inter font variable, wire up `ThemeProvider`, add glassmorphism utilities to `globals.css`.
2. **App Shell & Header**: Create an animated `ThemeToggle` and modern header in `app/(root)/layout.tsx`.
3. **StatCards Redesign**: Semantic tone-on-tone colors, trend badges, and micro-hover elevation.
4. **Dashboard Header & Quick Actions**: Add greeting, quick summary stats, and "New Task" trigger button.
5. **Calendar & Badges Polish**: Modernize urgency tags in `Calendar.tsx` and status badges in `columns.tsx`.
6. **Sidebar Polish**: Subtle active pills, user profile card at bottom.
