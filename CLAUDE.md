# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

All commands run from `glide-ui/`:

```bash
cd glide-ui
npm install       # install deps (Node 18+ required)
npm run dev       # start dev server at http://localhost:3000
npm run build     # production build
npm run lint      # ESLint via Next.js
```

No environment variables are required — all data is in-memory dummy data.

## Architecture Overview

The app is a **Next.js 14 App Router** project under `glide-ui/`. There are two routes:
- `/` — landing page (`app/page.tsx`)
- `/grid` — the interactive employee grid demo (`app/grid/page.tsx`)

The grid page uses `dynamic()` with `ssr: false` because `@glideapps/glide-data-grid` is canvas-based and requires a browser environment.

### Core Abstraction Layers

The architecture separates concerns into three layers:

**1. Generic hook layer** — `hooks/use-data-grid.ts`
- `useDataGrid<T>()` is the reusable foundation. It accepts any data type `T extends { id: number }` and a config object.
- Manages: rows state, column state, sorting (multi-type comparisons), cell editing (respects `editableColumns` list), row add/delete, column resizing, and theme realization.
- **Critical**: theme `fontStyle` fields must contain only `weight + size` (e.g. `'600 14px'`). The hook combines these with `fontFamily` into `baseFontFull`, `headerFontFull`, `markerFontFull` via `realizeThemeFonts()`. Glide Data Grid requires fully-formed font strings in render calls.
- Theme objects (`gridLightTheme` / `gridDarkTheme`) come from `lib/grid-theme.ts` and are merged with `getDefaultTheme()` inside this hook.
- Returns `setColumns` which is used by the column visibility toggle in the UI.
- **The generic hook is stable — do not add employee-specific logic to it.**

**2. Domain-specific hook** — `hooks/use-employee-grid.ts`
- `useEmployeeGrid()` wraps `useDataGrid<EmployeeRow>()` with the employee schema.
- Defines `getCellContent` (column ID → `GridCell` kind mapping) and `onCellEdit` (how edits are applied per column type).
- `title` column uses `GridCellKind.Custom` with `kind: 'title-dropdown'` — not `GridCellKind.Text`. Edit handler checks for `kind === 'title-dropdown'` and extracts `data.value`.
- `email` and `website` URI cells have `onClickUri` handlers for `mailto:` and external URL navigation.
- Delegates to config in `components/employee-grid-config.ts` for column definitions, editable column lists, and theme references.

**3. UI components**
- `components/data-grid-wrapper.tsx` — `DataGridWrapper<T>` is a fully generic component that wraps `DataEditor` from Glide and adds:
  - Footer summary bar with per-column aggregation selectors (sum, average, min, max, count, percent variants)
  - Footer scroll synchronization with the grid's visible region (via `onVisibleRegionChanged`)
  - Sort menu integration via `onHeaderMenuClick`
  - Row markers, add row, and delete row wiring
  - `getRowThemeOverride` prop for per-row theme overrides (passed through to Glide's `DataEditor`)
  - `drawCell` prop for custom canvas overdrawing on cells (passed to `DataEditor`)
  - `drawHeader` prop for custom column header rendering (passed to `DataEditor`)
  - `onCellContextMenu` prop for right-click context menus
  - `freezeTrailingRows` prop to pin trailing rows
  - `excludeFooterColumns` prop — list of column IDs to skip in the footer aggregation bar (currently `['manager', 'tags']` from `employee-grid.tsx`)
  - `freezeColumns` prop — number of columns to pin left (default `2`; hardcoded as `freezeColumns={2}` in `employee-grid.tsx`)
  - `rowMarkerTheme` — transparent borders applied internally so row marker lines don't double-up with grid borders
  - Row marker width is calculated dynamically from row count: `>10000→48px`, `>1000→44px`, `>100→36px`, else `32px`
  - Grid dimension constants (hardcoded in `data-grid-wrapper.tsx`): `rowHeight=35`, `headerHeight=40`, `groupHeaderHeight=32`
- `components/employee-grid.tsx` — UI layer that composes `DataGridWrapper` with employee-specific logic.

### Toolbar Features (employee-grid.tsx)

The toolbar above the grid provides these controls:

| Control | What it does |
|---|---|
| **Columns** dropdown | Show/hide any of the 10 columns. Tracks a `hiddenColumns: Set<string>` state; filters `grid.columns` before passing to `DataGridWrapper`. |
| **Export CSV** button | Downloads current `grid.sortedRows` as `employees.csv`. Pure JS — no external deps. Respects current sort order. |
| **Sort indicator** | Derived `displayColumns` array appends ` ↑` or ` ↓` to the sorted column's title. Purely cosmetic. |
| **Theme toggle** | Switches between `'light'` and `'dark'` Glide theme variants. Also syncs the `dark` class on `<html>` so Tailwind `dark:` variants activate correctly. |

Row multi-select count ("X rows selected") is displayed in the toolbar left side. Keyboard hint `⌘↵ Add row` shown alongside.

### Canvas Callbacks (employee-grid.tsx)

- **`drawCell`** — overdraw on sparkline cells: after base cell paints, draws a `↑` (green `#10B981`) or `↓` (red `#EF4444`) trend arrow in the top-right corner based on first vs last performance value. Must call `draw()` first, then guard on `cell.kind === GridCellKind.Custom` and `data.kind === 'sparkline'`. Use `ctx.save()`/`ctx.restore()`.
- **`drawHeader`** — after base header paints, draws a 3px colored accent bar at the bottom of each column header, color-coded by `column.group`. Color map: `GROUP_ACCENT_COLORS` in `employee-grid.tsx`. Must call `draw()` first.

### Right-Click Context Menu (employee-grid.tsx)

`onCellContextMenu` on `DataGridWrapper` triggers a positioned `div` context menu with actions: Add row below, Copy email, Delete row. State: `contextMenu: { x, y, col, row } | null`. Dismissed on click-outside (via `useEffect`) or Escape. Dark mode styling reads `themeMode` state.

### Keyboard Shortcuts (employee-grid.tsx)

- `Cmd/Ctrl+Enter` — add a new row (calls `grid.addRow()`). Registered in `useEffect` on `document`.

### Pagination (app/grid/page.tsx)

- `page` (useState 0) and `pageSize` (useState 50, options: 25/50/100) state at the page level.
- `pagedData = filteredData.slice(clampedPage * pageSize, (clampedPage + 1) * pageSize)` passed to `<EmployeeGrid>`.
- Pagination controls rendered below the grid: first/prev/next/last buttons + page size selector.
- Search change resets `page` to 0.

### Search Bar (app/grid/page.tsx)

A real-time search input sits above the grid. It filters the `data` array via `useMemo` across `firstName`, `lastName`, `email`, `title`, and `tags` fields. A live match count (`N / 50`) is shown inside the input when active.

### Row Highlighting

Opted-out rows (`optIn === false`) are visually dimmed via Glide's `getRowThemeOverride` API:
- Light mode: `bgCell: '#f9fafb'`, `textDark: '#9ca3af'`
- Dark mode: `bgCell: '#141418'`, `textDark: '#6b7280'`

### Column Config (employee-grid-config.ts)

All 10 columns have `hasMenu: true` and `menuIcon: GridColumnMenuIcon.Dots`. The dots icon appears on header hover and triggers the sort menu for any column.

`editableTextColumns` does NOT include `'title'` — it is a `Custom` dropdown cell, not a text cell. Editing is handled by `onCellEdit` checking `kind === 'title-dropdown'`.

### Custom Cell Renderers

All renderers implement `CustomRenderer<T>` from Glide and must use canvas APIs:

| Renderer | File | Cell `kind` |
|---|---|---|
| Tags (pill badges) | `components/tags-cell-renderer.ts` | `'tags'` |
| Sparkline chart | inline in `components/employee-grid.tsx` | `'sparkline'` |
| Persona (avatar + name) | inline in `components/employee-grid.tsx` | `'persona'` |
| Title dropdown pill | inline in `components/employee-grid.tsx` | `'title-dropdown'` |

Custom renderers **must** leave a 1px gutter when filling `cellFillColor`: `ctx.fillRect(rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2)`. This preserves grid border lines.

All 4 custom cells must set `copyData` (a plain string) for correct clipboard behavior:
- `'sparkline'` — comma-joined values: `values.map(v => v.toFixed(2)).join(', ')`
- `'tags'` — comma-joined tags: `tags.join(', ')`
- `'persona'` — manager name string
- `'title-dropdown'` — the title string value

Tags renderer detects dark mode by inspecting `theme.bgCell === '#09090B'`. Tag colors come from `lib/tag-colors.ts`.

The `titleDropdownRenderer` renders the current title value as a colored rounded pill using canvas path/arc. Pill color comes from `TITLE_OPTIONS` in `dropdown-overlay-editor.tsx`.

### Custom Cell Editors

**Dropdown** — `components/editors/dropdown-overlay-editor.tsx` — `createDropdownEditor(options, cellKind, valueKey)` factory returns a `ProvideEditorCallback<CustomCell>`. Options are `{ value, label, color: { bg, text } }[]`. Handles click-outside and Escape to close. Dark mode aware — reads `document.documentElement.classList.contains('dark')` at render time.

Preset option lists:
- `TITLE_OPTIONS` — 10 job title options with distinct colors (wired to `title` column)
- `FUNNEL_STAGE_OPTIONS`, `REVENUE_OPTIONS`, `LPT_OPTIONS` — available for future columns

The `provideEditor` from `createDropdownEditor(TITLE_OPTIONS, 'title-dropdown', 'value')` is passed to `DataGridWrapper` from `employee-grid.tsx`.

### Theming

Themes are defined in `lib/grid-theme.ts` as `Partial<Theme>` objects (`gridLightTheme` / `gridDarkTheme`). They are merged with `getDefaultTheme()` inside `useDataGrid`. Theme variant (`'light' | 'dark'`) is toggled in `employee-grid.tsx` state and passed down through the hook.

`tailwind.config.js` uses CSS variable HSL color tokens with `darkMode: 'class'`. The theme toggle calls `document.documentElement.classList.toggle('dark', ...)`.

### Data

`lib/data/employees.ts` exports `employees` (pre-built array of 50 rows) and `buildEmployees(count, seed)` for generating fresh data. `blankEmployee(id)` provides a zero-value row for the "add row" feature.

### Next.js Config

`next.config.js` configures `images.remotePatterns` to allow loading images from `images.unsplash.com` (used by manager persona avatars in the dummy data pool).

### Path Aliases

`@/` maps to `glide-ui/` (configured in `tsconfig.json`).

### UI Components

shadcn/ui components live in `components/ui/`. Currently installed:
- `dropdown-menu.tsx` — used for footer aggregation dropdowns and the column visibility toggle
- `select.tsx` — available but not actively used

`lib/utils.ts` exports the standard `cn()` helper. Component config is in `components.json`.

### Utilities & Scaffolding

- **`lib/tag-colors.ts`** — `generateTagColor(tag)` hashes tag text deterministically over 12 vibrant colors; `generateTagColorMap(tags[])` returns a `Record<string, TagColor>` mapping.
- **`lib/query-provider.tsx`** — `QueryProvider` wraps the app with TanStack Query (`staleTime: 60s`, `refetchOnWindowFocus: false`). Present in the layout but not actively used yet — scaffolded for future real API data fetching.
- **`lib/example-store.ts`** — Zustand counter store, not used anywhere. Template scaffolding.
- **`prisma/`** — empty directory, no schema. Placeholder for future database integration.
- **`types/`** — empty directory. Placeholder for shared type definitions.
