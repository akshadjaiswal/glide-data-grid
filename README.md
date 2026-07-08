# Glide UI

> A production-ready, feature-rich implementation of Glide Data Grid with search, pagination, column visibility, CSV export, row theming, footer aggregations, custom renderers, dropdown cell editors, canvas overdraw callbacks, right-click context menus, and a modular architecture for enterprise applications.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Glide Data Grid](https://img.shields.io/badge/Glide%20Data%20Grid-6.x-7c3aed?style=flat-square)](https://github.com/glideapps/glide-data-grid)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

---

## Why this exists

Built from real-world requirements integrating Glide Data Grid into production applications. This project showcases advanced patterns and features inspired by enterprise tools:

- **Reusable `DataGridWrapper`** component with footer aggregations, canvas callbacks, and per-row theming
- **Generic `useDataGrid` hook** that works with any data type
- **Advanced custom renderers** with proper theming and borders (tags, sparkline, persona, dropdown pill)
- **Dropdown cell editor** factory with dark mode support, wired to the Title column
- **Canvas overdraw** — trend arrows on sparkline cells, group-color accent bars on column headers
- **Right-click context menu** with Add row / Copy email / Delete row actions
- **Keyboard shortcuts** — Cmd/Ctrl+Enter to add a row
- **Pagination** — client-side with 25/50/100 rows per page controls
- **Fully accessible toolbar** with search, column visibility, and CSV export
- **Modular architecture** for scalability and maintenance

---

## ✨ Features

### Grid Core
- **Grouped headers** — columns organized into labeled groups (ID, Name, Info, Performance, Employment Data)
- **Group accent bars** — 3px colored bar at bottom of each header, per group (via `drawHeader` callback)
- **Frozen columns** — first 2 columns stay pinned while scrolling horizontally
- **Row markers** — numbered checkboxes on both sides for multi-select
- **Smooth scroll** — X + Y with overscroll gutter
- **Column resizing** — persistent width adjustments
- **Compact rows** — 35px rows for high data density
- **1px cell gutters** — custom renderers preserve grid borders under hover/selection
- **Dots menu icon** — ⋯ icon on every column header hover triggers the sort menu

### Toolbar
- **Real-time search** — filters rows instantly across name, email, title, and tags; shows live match count
- **Column visibility toggle** — show/hide any of the 10 columns; hidden count shown in label
- **CSV export** — one-click download of current sorted rows as `employees.csv`; pure JS, no deps
- **Sort direction indicator** — active sort column shows ↑ or ↓ suffix in the header title
- **Theme toggle** — switches light/dark mode; syncs both Glide canvas theme and Tailwind `dark:` class
- **Keyboard hint** — `⌘↵ Add row` shown in toolbar; Cmd/Ctrl+Enter actually adds the row

### Pagination
- Client-side pagination in `app/grid/page.tsx`
- Page size options: 25 / 50 / 100 rows
- First / Prev / Next / Last controls with disabled states
- Range indicator: `1–25 of 50`
- Resets to page 1 on search change

### Footer Summary System
- **Per-column aggregations** — click any footer cell to choose: Count, Sum, Average, Min, Max, Percent variants
- **Auto type detection** — numeric vs non-numeric columns get appropriate calculation options
- **Synchronized scrolling** — footer follows grid's horizontal scroll position exactly

### Custom Cell Types
| Cell | Kind | Description |
|---|---|---|
| Tags | `'tags'` | Pill badges with deterministic vibrant colors; dark-mode aware |
| Sparkline | `'sparkline'` | Canvas line chart with gradient fill; trend arrow (↑/↓) overdraw via `drawCell` |
| Persona | `'persona'` | Circular avatar (Unsplash) + manager name |
| Title Dropdown | `'title-dropdown'` | Colored rounded pill; opens overlay picker on double-click |
| Text / URI | built-in | Editable text and clickable links (`onClickUri` for mailto: + external URLs) |
| Boolean | built-in | Toggle checkbox for opt-in field |

### Canvas Overdraw
- **Trend arrows** on sparkline cells: ↑ green (`#10B981`) or ↓ red (`#EF4444`) in top-right corner, based on first-to-last performance delta
- **Group accent bars** on column headers: 3px colored bar at the bottom of each header cell, color-coded by column group

### Dropdown Cell Editor
- `createDropdownEditor(options, cellKind, valueKey)` factory in `components/editors/dropdown-overlay-editor.tsx`
- Dark mode aware — reads `document.documentElement.classList` at render time
- Highlights selected value; dismisses on click-outside or Escape
- Wired to Title column with 10 colored role options (`TITLE_OPTIONS`)
- Reusable for any column: also ships `FUNNEL_STAGE_OPTIONS`, `REVENUE_OPTIONS`, `LPT_OPTIONS`

### Right-Click Context Menu
- Right-click any cell → contextual menu appears below the cell
- Actions: **Add row below**, **Copy email**, **Delete row**
- Dark mode aware styling (bg, border, hover colors match active theme)
- Dismisses on click-outside or Escape

### Row Highlighting
- Opted-out rows (`optIn === false`) are visually dimmed via Glide's `getRowThemeOverride` API
- Light mode: `#f9fafb` bg, `#9ca3af` text
- Dark mode: `#141418` bg, `#6b7280` text

### URI Cells
- Email column: `onClickUri` opens `mailto:` link; `hoverEffect` shows underline on hover
- Website column: `onClickUri` opens URL in new tab with `noopener,noreferrer`

### Editing
- **Text cells** — double-click to edit first name, last name, email, website
- **Title cell** — double-click opens dropdown overlay picker with colored options
- **Boolean cells** — single-click toggle for opt-in
- **Date cells** — text-based date parsing for hired date
- **Add row** — trailing row hint or Cmd/Ctrl+Enter; right-click > Add row below
- **Delete rows** — select rows + press Delete; or right-click > Delete row

### Accessibility
- Visible `focus-visible:ring` on all interactive elements
- `aria-label` on all footer aggregation and pagination buttons
- `motion-safe:` prefix on all hover translate animations
- Keyboard shortcut (Cmd/Ctrl+Enter) for add row

---

## 🛠️ Tech Stack

| Category | Tool | Why |
|---|---|---|
| Framework | Next.js 14 App Router, React 18 | Fast DX, production-ready routing |
| Language | TypeScript | Safer refactors, clearer contracts |
| Grid | @glideapps/glide-data-grid v6.0.3 | Virtualized, canvas-based, custom cells |
| Styling | Tailwind CSS 3.4 | Quick iteration with consistent tokens |
| UI | shadcn/ui (dropdown-menu, select) | Accessible headless components |
| Data | React hooks + local state | Simple local edits; TanStack Query scaffolded for future async |
| Dates | date-fns 4 | Reliable date formatting |
| State | Zustand (scaffolded, unused) | Ready for global state if needed |

---

## 🚀 Quick Start

Prereqs: Node.js 18+, npm

```bash
cd glide-ui
npm install
npm run dev
# open http://localhost:3000
```

No env vars required — all data is bundled dummy data.

---

## 🗂️ Project Structure

```
glide-ui/
├── app/
│   ├── layout.tsx              # Root layout — Inter font, QueryProvider
│   ├── page.tsx                # Landing page
│   ├── error.tsx               # Error boundary
│   ├── not-found.tsx           # 404 page
│   └── grid/
│       ├── layout.tsx          # Grid route metadata
│       └── page.tsx            # Grid page — search, pagination, data state, EmployeeGrid
├── components/
│   ├── employee-grid.tsx       # Toolbar, drawCell, drawHeader, context menu, keyboard shortcuts
│   ├── employee-grid-config.ts # Column definitions (hasMenu/menuIcon), editable flags, theme refs
│   ├── data-grid-wrapper.tsx   # Generic DataEditor wrapper + footer + canvas props
│   ├── sort-menu.tsx           # Sort asc/desc/clear popover
│   ├── tags-cell-renderer.ts   # Custom tags pill renderer
│   └── editors/
│       └── dropdown-overlay-editor.tsx  # createDropdownEditor factory + TITLE_OPTIONS
├── hooks/
│   ├── use-data-grid.ts        # Generic reusable hook (sorting, editing, themes)
│   └── use-employee-grid.ts    # Employee-specific hook; onClickUri; title dropdown cell
├── lib/
│   ├── grid-theme.ts           # gridLightTheme / gridDarkTheme definitions
│   ├── tag-colors.ts           # Deterministic tag color generation
│   ├── utils.ts                # cn() helper
│   ├── query-provider.tsx      # TanStack Query setup (scaffolded)
│   └── data/
│       └── employees.ts        # EmployeeRow type + buildEmployees + blankEmployee
└── next.config.js              # images.remotePatterns for Unsplash
```

---

## 🧭 Feature Deep Dive

### Search + Pagination
Search input in `app/grid/page.tsx` derives `filteredData` via `useMemo` (matches firstName, lastName, email, title, tags). Pagination slices `filteredData` into `pagedData` based on `page` and `pageSize`. Both reset on refresh. Search resets page to 0.

### Column Visibility
The "Columns" button opens a dropdown listing all 10 columns with checkboxes. Hidden columns tracked in `Set<string>` state; visible subset passed to `DataGridWrapper` as `displayColumns`. Active sort column gets ↑/↓ appended to its title.

### CSV Export
`exportCSV(rows)` generates CSV from `grid.sortedRows` (respects current sort). Values quoted and escaped. No libraries — just `Blob` + `URL.createObjectURL`. Exports currently visible columns only.

### Footer Aggregations
Each column footer cell shows a dropdown to select a calculation. Numeric columns: Count, Sum, Average, Min, Max, Percent variants. Non-numeric: Count/Percent only. State local to `DataGridWrapper`.

### Canvas Overdraw
`drawCell` in `employee-grid.tsx`: calls base `draw()`, guards on sparkline kind, overdraw ↑/↓ trend arrow top-right.
`drawHeader` in `employee-grid.tsx`: calls base `draw()`, reads `column.group`, paints 3px accent bar at header bottom.
Both passed to `DataGridWrapper` which threads them to `DataEditor`.

### Dropdown Editor (Title column)
`title` is a `GridCellKind.Custom` cell with `kind: 'title-dropdown'`. `titleDropdownRenderer` draws the value as a colored rounded pill on canvas. `createDropdownEditor(TITLE_OPTIONS, 'title-dropdown', 'value')` provides the overlay editor. `onCellEdit` handles the custom kind and extracts `data.value`.

### Theming
`lib/grid-theme.ts` defines `gridLightTheme` and `gridDarkTheme` as `Partial<Theme>`. Merged with Glide's `getDefaultTheme()` inside `useDataGrid`, then passed through `realizeThemeFonts()` which builds fully-formed font strings required for canvas rendering.

**Critical**: `baseFontStyle`, `headerFontStyle`, `markerFontStyle` must contain **weight + size only** (e.g. `'400 14px'`). The hook appends `fontFamily` automatically.

---

## 🔧 How to Customize

- **Columns** — `components/employee-grid-config.ts`: order, widths, editable flags, groups, icons, hasMenu/menuIcon
- **Theme colors** — `lib/grid-theme.ts`: font sizes, padding, colors. Must be concrete values (no CSS variables)
- **Data** — `lib/data/employees.ts`: swap `buildEmployees` with your own fetch; update `getCellContent` in `use-employee-grid.ts` to match your type
- **Custom cells** — extend `use-employee-grid.ts` + add a renderer in `employee-grid.tsx`; register in `customRenderers` array
- **Dropdown editing** — use `createDropdownEditor` factory and pass result as `provideEditor` to `DataGridWrapper`
- **Canvas overdraw** — add `drawCell` and/or `drawHeader` callbacks and pass to `DataGridWrapper`
- **Context menu** — extend the context menu in `employee-grid.tsx` with additional actions
- **Pagination** — adjust `PAGE_SIZE_OPTIONS` in `app/grid/page.tsx`; swap for server-side fetching with TanStack Query

---

## 🛣️ Roadmap

- Wire date picker overlay for the `hiredAt` column (editor scaffold ready, needs integration)
- Bulk edit actions on selected rows (e.g. toggle opt-in for all selected)
- Server data fetching via TanStack Query (infrastructure scaffolded in `lib/query-provider.tsx`)
- Per-column validation and inline error states
- Simulated row grouping by department (visual separators via sentinel rows)

---

## 🙋‍♂️ Author & Socials

Built by **Akshad Jaiswal**
- GitHub: [@akshadjaiswal](https://github.com/akshadjaiswal)
- Twitter: [@akshad_999](https://twitter.com/akshad_999)
- LinkedIn: [Akshad Jaiswal](https://www.linkedin.com/in/akshadsantoshjaiswal/)

---

## 📜 License

MIT — use it, remix it, build great tools with it.
