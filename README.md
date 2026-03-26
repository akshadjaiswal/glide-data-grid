# Glide UI

> A production-ready, feature-rich implementation of Glide Data Grid with search, column visibility, CSV export, row theming, footer aggregations, custom renderers, and a modular architecture for enterprise applications.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Glide Data Grid](https://img.shields.io/badge/Glide%20Data%20Grid-6.x-7c3aed?style=flat-square)](https://github.com/glideapps/glide-data-grid)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

---

## Why this exists

Built from real-world requirements integrating Glide Data Grid into production applications. This project showcases advanced patterns and features inspired by enterprise tools:

- **Reusable `DataGridWrapper`** component with footer aggregations and per-row theming
- **Generic `useDataGrid` hook** that works with any data type
- **Advanced custom renderers** with proper theming and borders
- **Fully accessible toolbar** with search, column visibility, and CSV export
- **Modular architecture** for scalability and maintenance

Perfect for building internal tools, admin dashboards, and data-heavy applications.

---

## ✨ Features

### Grid Core
- **Grouped headers** — columns organized into labeled groups (ID, Name, Info, Performance, Employment Data)
- **Frozen columns** — first 2 columns stay pinned while scrolling horizontally
- **Row markers** — numbered checkboxes on both sides for multi-select
- **Smooth scroll** — X + Y with overscroll gutter
- **Column resizing** — persistent width adjustments
- **Compact rows** — 35px rows for high data density (vs Glide default 72px)
- **1px cell gutters** — custom renderers preserve grid borders under hover/selection

### Toolbar
- **Real-time search** — filters 50 rows instantly across name, email, title, and tags; shows live match count
- **Column visibility toggle** — show/hide any of the 10 columns via a dropdown; hidden count shown in label
- **CSV export** — one-click download of current sorted rows as `employees.csv`; pure JS, no deps
- **Sort direction indicator** — active sort column shows ↑ or ↓ suffix in the header title
- **Theme toggle** — switches light/dark mode; syncs both Glide canvas theme and Tailwind `dark:` class

### Footer Summary System
- **Per-column aggregations** — click any footer cell to choose: Count, Sum, Average, Min, Max, Percent variants
- **Auto type detection** — numeric vs non-numeric columns get appropriate calculation options
- **Synchronized scrolling** — footer follows grid's horizontal scroll position exactly

### Custom Cell Types
| Cell | Kind | Description |
|---|---|---|
| Tags | `'tags'` | Pill badges with deterministic vibrant colors; dark-mode aware |
| Sparkline | `'sparkline'` | Canvas line chart with gradient fill, normalized per row |
| Persona | `'persona'` | Circular avatar (Unsplash) + manager name |
| Text / URI | built-in | Editable text and clickable links |
| Boolean | built-in | Toggle checkbox for opt-in field |

### Row Highlighting
- Opted-out rows (`optIn === false`) are visually dimmed via Glide's `getRowThemeOverride` API
- Works in both light (`#f9fafb` bg, `#9ca3af` text) and dark (`#141418` bg, `#6b7280` text) modes

### Editing
- **Text cells** — double-click to edit first name, last name, title, email, website
- **Boolean cells** — single-click toggle for opt-in
- **Date cells** — text-based date parsing for hired date
- **Add row** — trailing row hint appends a blank employee
- **Delete rows** — select rows + press Delete

### Accessibility
- Visible `focus-visible:ring` on all interactive elements
- `aria-label` on all footer aggregation buttons
- `motion-safe:` prefix on all hover translate animations
- `prefers-reduced-motion` global CSS rule zeroes all transitions
- Systematic z-index (`z-50`) — no arbitrary large values

---

## 🛠️ Tech Stack

| Category | Tool | Why |
|---|---|---|
| Framework | Next.js 14 App Router, React 18 | Fast DX, production-ready routing |
| Language | TypeScript | Safer refactors, clearer contracts |
| Grid | @glideapps/glide-data-grid v6 | Virtualized, canvas-based, custom cells |
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
│       └── page.tsx            # Grid page — search bar, data state, EmployeeGrid
├── components/
│   ├── employee-grid.tsx       # Toolbar + DataGridWrapper composition
│   ├── employee-grid-config.ts # Column definitions, editable flags, theme refs
│   ├── data-grid-wrapper.tsx   # Generic DataEditor wrapper + footer aggregations
│   ├── sort-menu.tsx           # Sort asc/desc/clear popover
│   ├── tags-cell-renderer.ts   # Custom tags pill renderer
│   └── editors/
│       └── dropdown-overlay-editor.tsx  # Dropdown editor factory (scaffolded)
├── hooks/
│   ├── use-data-grid.ts        # Generic reusable hook (sorting, editing, themes)
│   └── use-employee-grid.ts    # Employee-specific hook wrapping useDataGrid
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

### Search
The search input in `app/grid/page.tsx` derives `filteredData` via `useMemo`. It matches against `firstName`, `lastName`, `email`, `title`, and `tags` (case-insensitive). Filtering happens entirely on the client — no API calls.

### Column Visibility
The "Columns" button in `employee-grid.tsx` opens a dropdown listing all 10 columns with checkboxes. Hidden columns are tracked in a `Set<string>` state. The visible subset is passed to `DataGridWrapper` as `displayColumns`. The column title may have ↑/↓ appended if that column is the active sort.

### CSV Export
`exportCSV(rows)` in `employee-grid.tsx` generates a CSV from `grid.sortedRows` (respects current sort). Values are quoted and escaped. No libraries — just `Blob` + `URL.createObjectURL`.

### Footer Aggregations
Each column in the footer shows a dropdown to select a calculation. Numeric columns offer: Count Empty/Filled, Percent Empty/Filled, Sum, Average, Min, Max. Non-numeric columns offer count/percent variants only. Aggregation state is local to `DataGridWrapper`.

### Theming
`lib/grid-theme.ts` defines `gridLightTheme` and `gridDarkTheme` as `Partial<Theme>`. These are merged with Glide's `getDefaultTheme()` inside `useDataGrid`, then passed through `realizeThemeFonts()` which builds the fully-formed font strings Glide requires for canvas rendering.

**Critical**: `baseFontStyle`, `headerFontStyle`, `markerFontStyle` must contain **weight + size only** (e.g. `'400 14px'`). The hook appends `fontFamily` automatically. Including a font family in the style string causes duplicated font strings and broken rendering.

---

## 🔧 How to Customize

- **Columns** — `components/employee-grid-config.ts`: order, widths, editable flags, groups, icons
- **Theme colors** — `lib/grid-theme.ts`: font sizes, padding, colors. Remember: values must be concrete hex/px (no CSS variables)
- **Data** — `lib/data/employees.ts`: swap `buildEmployees` with your own fetch; update `getCellContent` in `use-employee-grid.ts` to match your type
- **Custom cells** — extend `use-employee-grid.ts` + add a renderer in `employee-grid.tsx`; register in `customRenderers` array
- **Dropdown editing** — use the `createDropdownEditor` factory in `components/editors/dropdown-overlay-editor.tsx` and pass the result as `provideEditor` to `DataGridWrapper`

---

## 🛣️ Roadmap

- Wire date picker overlay for the `hiredAt` column (editor scaffold ready, needs integration)
- Bulk edit actions on selected rows (e.g. toggle opt-in for all selected)
- Server data fetching via TanStack Query (infrastructure scaffolded in `lib/query-provider.tsx`)
- Per-column validation and inline error states
- Keyboard shortcuts (Ctrl+F to focus search, Ctrl+A select all)

---

## 🙋‍♂️ Author & Socials

Built by **Akshad Jaiswal**
- GitHub: [@akshadjaiswal](https://github.com/akshadjaiswal)
- Twitter: [@akshad_999](https://twitter.com/akshad_999)
- LinkedIn: [Akshad Jaiswal](https://www.linkedin.com/in/akshadsantoshjaiswal/)

---

## 📜 License

MIT — use it, remix it, build great tools with it.
