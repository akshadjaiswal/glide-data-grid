# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

All commands run from `glide-ui/`:

```bash
cd glide-ui
npm install       # install deps (Node 18+ required)
npm run dev       # start dev server at http://localhost:3000
npm run build     # production build
npm run lint      # ESLint via Next.js (requires ESLint config — not yet initialized)
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

**2. Domain-specific hook** — `hooks/use-employee-grid.ts`
- `useEmployeeGrid()` wraps `useDataGrid<EmployeeRow>()` with the employee schema.
- Defines `getCellContent` (column ID → `GridCell` kind mapping) and `onCellEdit` (how edits are applied per column type).
- Delegates to config in `components/employee-grid-config.ts` for column definitions, editable column lists, and theme references.

**3. UI components**
- `components/data-grid-wrapper.tsx` — `DataGridWrapper<T>` is a fully generic component that wraps `DataEditor` from Glide and adds:
  - Footer summary bar with per-column aggregation selectors (sum, average, min, max, count, percent variants)
  - Footer scroll synchronization with the grid's visible region (via `onVisibleRegionChanged`)
  - Sort menu integration via `onHeaderMenuClick`
  - Row markers, add row, and delete row wiring
  - `getRowThemeOverride` prop for per-row theme overrides (passed through to Glide's `DataEditor`)
- `components/employee-grid.tsx` — UI layer that composes `DataGridWrapper` with employee-specific custom renderers and a toolbar with four controls: column visibility toggle, CSV export, sort indicator, and theme toggle.

### Toolbar Features (employee-grid.tsx)

The toolbar above the grid provides four controls:

| Control | What it does |
|---|---|
| **Columns** dropdown | Show/hide any of the 10 columns. Tracks a `hiddenColumns: Set<string>` state; filters `grid.columns` before passing to `DataGridWrapper`. Updates label to show count of hidden columns. |
| **Export CSV** button | Downloads current `grid.sortedRows` as `employees.csv`. Pure JS — no external deps. Respects current sort order. |
| **Sort indicator** | Derived `displayColumns` array appends ` ↑` or ` ↓` to the sorted column's title. Purely cosmetic — no data changes. |
| **Theme toggle** | Switches between `'light'` and `'dark'` Glide theme variants. Also syncs the `dark` class on `<html>` so Tailwind `dark:` variants (e.g. on `SortMenu`) activate correctly. |

Row multi-select count ("X rows selected") is displayed in the toolbar left side.

### Search Bar (app/grid/page.tsx)

A real-time search input sits above the grid in `app/grid/page.tsx`. It filters the `data` array via `useMemo` across `firstName`, `lastName`, `email`, `title`, and `tags` fields. The `filteredData` result is passed as `rows` to `EmployeeGrid`. A live match count (`N / 50`) is shown inside the input when a query is active.

### Row Highlighting

Opted-out rows (`optIn === false`) are visually dimmed via Glide's `getRowThemeOverride` API:
- Light mode: `bgCell: '#f9fafb'`, `textDark: '#9ca3af'`
- Dark mode: `bgCell: '#141418'`, `textDark: '#6b7280'`

### Custom Cell Renderers

All renderers implement `CustomRenderer<T>` from Glide and must use canvas APIs:

| Renderer | File | Cell `kind` |
|---|---|---|
| Tags (pill badges) | `components/tags-cell-renderer.ts` | `'tags'` |
| Sparkline chart | inline in `components/employee-grid.tsx` | `'sparkline'` |
| Persona (avatar + name) | inline in `components/employee-grid.tsx` | `'persona'` |

Custom renderers **must** leave a 1px gutter when filling `cellFillColor`: `ctx.fillRect(rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2)`. This preserves grid border lines under hover/selection states.

Tags renderer detects dark mode by inspecting `theme.bgCell === '#09090B'` since Glide doesn't pass a theme variant flag to renderers. Tag colors come from `lib/tag-colors.ts` — `generateTagColorMap(tags[])` returns a `Record<string, TagColor>` used when building tags cells in `use-employee-grid.ts`.

### Custom Cell Editors

**Dropdown** — `components/editors/dropdown-overlay-editor.tsx` — `createDropdownEditor(options, cellKind, valueKey)` factory returns a `ProvideEditorCallback<CustomCell>`. Options are `{ value, label, color: { bg, text } }[]`. Handles click-outside and Escape to close. Ships with preset option lists: `FUNNEL_STAGE_OPTIONS`, `REVENUE_OPTIONS`, `LPT_OPTIONS`. **Not currently wired into the employee grid** — use this as the pattern for adding dropdown editing to any column.

### Theming

Themes are defined in `lib/grid-theme.ts` as `Partial<Theme>` objects (`gridLightTheme` / `gridDarkTheme`). They are merged with `getDefaultTheme()` inside `useDataGrid`. Theme variant (`'light' | 'dark'`) is toggled in `employee-grid.tsx` state and passed down through the hook.

`tailwind.config.js` uses CSS variable HSL color tokens (`hsl(var(--popover))`, `hsl(var(--background))`, etc.) with `darkMode: 'class'`. The theme toggle in `employee-grid.tsx` calls `document.documentElement.classList.toggle('dark', ...)` so Tailwind dark mode applies to all UI elements (sort menu, dropdowns, etc.).

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

- **`lib/tag-colors.ts`** — `generateTagColor(tag)` hashes tag text deterministically over 12 vibrant colors; `generateTagColorMap(tags[])` returns a `Record<string, TagColor>` mapping. Colors are designed to be legible in both light and dark themes.
- **`lib/query-provider.tsx`** — `QueryProvider` wraps the app with TanStack Query (`staleTime: 60s`, `refetchOnWindowFocus: false`). Present in the layout but not actively used yet — scaffolded for future real API data fetching.
- **`lib/example-store.ts`** — Zustand counter store, not used anywhere. Template scaffolding left over from project initialization.
- **`prisma/`** — empty directory, no schema. Placeholder for future database integration.
- **`types/`** — empty directory. Placeholder for shared type definitions.
