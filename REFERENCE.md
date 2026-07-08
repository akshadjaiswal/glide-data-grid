Integrating Glide UI into brownfield projects: comprehensive field guide.
Purpose: help you lift the grid (with custom cells, theming, editing, sorting, dropdown editors, canvas callbacks) into an existing codebase safely.
Scope: focuses on the core grid files, wiring patterns, theming/fonts, data mapping, canvas overdraw, context menus, and pagination.
Tone: concise, prescriptive, and opinionated about separation of concerns.

----------------------------------------------------------------------
High-level anatomy (what to copy first)
- Grid page: app/grid/page.tsx (search bar, pagination, data state, dynamic import of EmployeeGrid)
- Grid wrapper UI: components/employee-grid.tsx (toolbar, drawCell, drawHeader, context menu, keyboard shortcuts, provideEditor)
- Generic grid wrapper: components/data-grid-wrapper.tsx (DataEditor + footer aggregations + canvas callback props + context menu prop)
- Grid config: components/employee-grid-config.ts (columns with menuIcon, editable flags, theme tokens)
- Grid logic: hooks/use-employee-grid.ts (state, sorting, editing, add/delete, theme realization, onClickUri)
- Custom cells: components/tags-cell-renderer.ts + inline sparkline/persona/title-dropdown renderers in employee-grid.tsx
- Dropdown editor factory: components/editors/dropdown-overlay-editor.tsx (reusable, dark-mode aware)
- Data shape reference: lib/data/employees.ts (EmployeeRow type and dummy generator)
- Sort menu: components/sort-menu.tsx

----------------------------------------------------------------------
Guiding principles
- Keep UI wrappers thin; push logic into hooks/config.
- Use realized themes for canvas text sizing; CSS overrides won't change canvas fonts.
- Map data → cells explicitly; avoid implicit shape assumptions.
- Make sorting/editing opt-in via the hook; don't hardcode to UI.
- Keep custom renderers independent; only rely on theme + cell data.
- Prefer copy-friendly selection by implementing getCellsForSelection.
- The generic use-data-grid.ts hook must never contain domain-specific logic.

----------------------------------------------------------------------
File-by-file responsibilities
- app/grid/page.tsx: hosts search state, pagination state (page/pageSize), filteredData memo, pagedData slice; passes pagedData to EmployeeGrid; renders pagination controls below the grid.
- employee-grid.tsx: toolbar (column visibility dropdown, CSV export button, theme toggle); composes DataGridWrapper; defines sparkline + persona + title-dropdown renderers; wires sort menu; wires right-click context menu; defines drawCell (trend arrows) and drawHeader (group accent bars); registers Cmd/Ctrl+Enter keyboard shortcut; passes provideEditor for title column.
- data-grid-wrapper.tsx: generic DataEditor wrapper; footer aggregation system (count/sum/avg/min/max/percent per column); footer scroll sync; exposes drawCell, drawHeader, onCellContextMenu, freezeTrailingRows props passed through to DataEditor.
- employee-grid-config.ts: declares columns (id/title/group/width/icon/hasMenu/menuIcon), editable column lists, theme tokens (light/dark). CRITICAL: font styles must be weight+size ONLY (no font family). NOTE: 'title' is NOT in editableTextColumns — it is a Custom dropdown cell.
- use-data-grid.ts: generic hook; owns rows state, column state, sortedRows derivation, getCellContent, onCellEdited (handles Custom cells via isCustomCell check), addRow, deleteRows, column resize, theme realization via realizeThemeFonts(); returns setColumns for external column visibility control.
- use-employee-grid.ts: employee-specific wrapper around useDataGrid; maps EmployeeRow fields to GridCell kinds; handles text/boolean/date/custom cell edits; sets onClickUri on email (mailto:) and website (window.open); title column uses GridCellKind.Custom with kind 'title-dropdown'.
- dropdown-overlay-editor.tsx: createDropdownEditor(options, cellKind, valueKey) factory; dark-mode aware (reads document.documentElement.classList); ships TITLE_OPTIONS (10 roles), FUNNEL_STAGE_OPTIONS, REVENUE_OPTIONS, LPT_OPTIONS.
- tags-cell-renderer.ts: draws pill tags using theme.baseFontFull; detects dark mode via theme.bgCell.
- sort-menu.tsx: simple ascending/descending/clear UI popover with dark mode support.
- lib/data/employees.ts: EmployeeRow type and dummy data helpers (buildEmployees, blankEmployee).

----------------------------------------------------------------------
Data model (EmployeeRow) expectations
- id: number (unique)
- email: string
- firstName, lastName: string
- optIn: boolean
- title: string (rendered as a custom dropdown pill, not plain text)
- website: string
- performance: { values: number[]; color: string }
- manager: { name: string; avatar: string }
- hiredAt: Date
- tags: string[]
If your dataset differs, update the switch in getCellContent and the column config to match.

----------------------------------------------------------------------
Theme and fonts: why CSS devtools tweaks fail
- Glide renders text on canvas; CSS overrides on DOM nodes don't affect canvas text.
- Font size comes from theme.baseFontFull/headerFontFull/markerFontFull.
- These "Full" fields are computed by concatenating fontStyle + fontFamily (e.g., "400 16px" + "Inter, sans-serif" → "400 16px Inter, sans-serif").
- If you only spread overrides over getDefaultTheme() without proper concatenation, fonts won't render correctly.
- Our implementation uses a custom realizeThemeFonts() helper function in use-data-grid.ts to create the *FontFull properties.

----------------------------------------------------------------------
CRITICAL: Font Style Format Rules (lib/grid-theme.ts)
⚠️ **MOST COMMON MISTAKE**: Including font family inside baseFontStyle/headerFontStyle/markerFontStyle

❌ WRONG (causes duplication and breaks rendering):
```typescript
baseFontStyle: '400 16px "Inter", -apple-system, BlinkMacSystemFont, sans-serif'
fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
// Result: baseFontFull becomes "400 16px Inter... Inter..." (DUPLICATED!)
```

✅ CORRECT (font style contains ONLY weight + size):
```typescript
baseFontStyle: '400 16px'        // Weight + size ONLY
headerFontStyle: '600 16px'      // Weight + size ONLY
markerFontStyle: '600 16px'      // Weight + size ONLY
fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'  // Separate
// Result: baseFontFull = "400 16px Inter, -apple-system..." (CORRECT!)
```

The realizeThemeFonts() function in use-data-grid.ts handles concatenation:
```typescript
function realizeThemeFonts(theme) {
  return {
    ...theme,
    baseFontFull: `${theme.baseFontStyle} ${theme.fontFamily}`,
    headerFontFull: `${theme.headerFontStyle} ${theme.fontFamily}`,
    markerFontFull: `${theme.markerFontStyle} ${theme.fontFamily}`,
  }
}
```

----------------------------------------------------------------------
Column config: menuIcon and hasMenu
- All columns now have hasMenu: true and menuIcon: GridColumnMenuIcon.Dots.
- This shows a ⋯ icon on column header hover, triggering the sort menu for every column.
- Import GridColumnMenuIcon from @glideapps/glide-data-grid.
- The onHeaderMenuClick prop on DataGridWrapper handles all columns.

```typescript
import { GridColumnMenuIcon } from '@glideapps/glide-data-grid'

{ id: 'email', ..., hasMenu: true, menuIcon: GridColumnMenuIcon.Dots }
```

----------------------------------------------------------------------
URI cells: onClickUri
- email uses onClickUri: () => window.open(`mailto:${rowData.email}`)
- website uses onClickUri: () => window.open(rowData.website, '_blank', 'noopener,noreferrer')
- hoverEffect: true already draws the underline on hover; onClickUri makes it actionable.
- These are set inside getCellContent in use-employee-grid.ts, per row.

----------------------------------------------------------------------
Title column: custom dropdown cell
- title column is GridCellKind.Custom with data: { kind: 'title-dropdown', value: rowData.title }
- NOT in editableTextColumns; editing handled separately in onCellEdit via kind check.
- A custom canvas renderer (titleDropdownRenderer) draws the value as a colored rounded pill.
- The provideEditor from createDropdownEditor(TITLE_OPTIONS, 'title-dropdown', 'value') opens the overlay picker on double-click.
- onCellEdit handler: checks columnId === 'title' && newValue.kind === GridCellKind.Custom && data.kind === 'title-dropdown', then extracts data.value.

----------------------------------------------------------------------
Dropdown editor factory: createDropdownEditor
```typescript
// dropdown-overlay-editor.tsx
export function createDropdownEditor(
  options: DropdownOption[],
  cellKind: string,
  valueKey: string
): ProvideEditorCallback<CustomCell>
```
- Options: { value, label, color: { bg, text } }[]
- Dark mode: reads document.documentElement.classList.contains('dark') at render time.
- Highlights selected option on render.
- Dismisses on click-outside or Escape.

Wiring in employee-grid.tsx:
```typescript
const provideEditor = useMemo(
  () => createDropdownEditor(TITLE_OPTIONS, 'title-dropdown', 'value'),
  []
)
// ...
<DataGridWrapper provideEditor={provideEditor} ... />
```

Available preset option lists in dropdown-overlay-editor.tsx:
- TITLE_OPTIONS — 10 job role options (wired to title column)
- FUNNEL_STAGE_OPTIONS — TOFU/MOFU/BOFU
- REVENUE_OPTIONS — High/Medium/Low
- LPT_OPTIONS — Blog/Product/Service

----------------------------------------------------------------------
Canvas overdraw: drawCell (trend arrows on sparkline)
- Add DrawCellCallback prop to DataGridWrapper and pass to DataEditor.
- Must call draw() first, then guard on cell kind, then overdraw.

```typescript
const drawCell: DrawCellCallback = useCallback((args, draw) => {
  draw() // base cell first
  const { cell, ctx, rect } = args
  if (cell.kind !== GridCellKind.Custom) return
  const data = (cell as SparklineCell).data
  if (data?.kind !== 'sparkline') return
  const vals = data.values as number[]
  if (!vals || vals.length < 2) return

  const trend = vals[vals.length - 1] - vals[0]
  const arrow = trend >= 0 ? '↑' : '↓'
  const color = trend >= 0 ? '#10B981' : '#EF4444'

  ctx.save()
  ctx.font = 'bold 11px system-ui, sans-serif'
  ctx.fillStyle = color
  ctx.textBaseline = 'top'
  ctx.textAlign = 'right'
  ctx.fillText(arrow, rect.x + rect.width - 6, rect.y + 5)
  ctx.restore()
}, [])
```

**Critical**: guard on cell kind immediately — this callback fires every frame for every cell.

----------------------------------------------------------------------
Canvas overdraw: drawHeader (group accent bars)
- Add DrawHeaderCallback prop to DataGridWrapper and pass to DataEditor.
- Must call draw() first (paints icon, title, menu dots), then overdraw.
- column.group is a standard GridColumn field — no casting needed.

```typescript
const GROUP_ACCENT_COLORS: Record<string, string> = {
  'ID': '#2F8BFF',
  'Name': '#8B5CF6',
  'Info': '#10B981',
  'Performance': '#F59E0B',
  'Employment Data': '#EC4899',
}

const drawHeader: DrawHeaderCallback = useCallback((args, draw) => {
  draw()
  const { ctx, rect, column } = args
  const color = GROUP_ACCENT_COLORS[column.group ?? '']
  if (!color) return
  ctx.save()
  ctx.fillStyle = color
  ctx.fillRect(rect.x + 2, rect.y + rect.height - 3, rect.width - 4, 3)
  ctx.restore()
}, [])
```

----------------------------------------------------------------------
Right-click context menu
- DataGridWrapper exposes onCellContextMenu?: (cell: Item, event: CellClickedEventArgs) => void
- DataEditor's onCellContextMenu fires with cell coords and event (includes bounds for positioning).
- Context menu state: { x, y, col, row } | null stored in employee-grid.tsx.
- Position using event.bounds.x and event.bounds.y + event.bounds.height (below the cell).
- Dismiss: useEffect on document mousedown + Escape key; ref on menu div for containment check.
- Dark mode: read themeMode state to style menu bg/border/hover colors inline.

```typescript
const handleCellContextMenu = useCallback(
  (cell: readonly [number, number], event: any) => {
    event.preventDefault?.()
    setContextMenu({
      x: event.bounds?.x ?? 0,
      y: (event.bounds?.y ?? 0) + (event.bounds?.height ?? 35),
      col: cell[0],
      row: cell[1],
    })
  },
  []
)
```

Actions in context menu: Add row below, Copy email (navigator.clipboard), Delete row (grid.deleteRows).

----------------------------------------------------------------------
Keyboard shortcut: Cmd/Ctrl+Enter to add row
```typescript
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      grid.addRow()
    }
  }
  document.addEventListener('keydown', onKey)
  return () => document.removeEventListener('keydown', onKey)
}, [grid.addRow])
```
Add a hint label `⌘↵ Add row` in the toolbar for discoverability.

----------------------------------------------------------------------
Pagination (app/grid/page.tsx)
```typescript
const [page, setPage] = useState(0)
const [pageSize, setPageSize] = useState(50) // options: 25, 50, 100

const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
const clampedPage = Math.min(page, totalPages - 1)
const pagedData = useMemo(
  () => filteredData.slice(clampedPage * pageSize, (clampedPage + 1) * pageSize),
  [filteredData, clampedPage, pageSize]
)
```
- Pass pagedData to EmployeeGrid instead of filteredData.
- Reset page to 0 on search change.
- Render prev/next/first/last buttons + page size selector below the grid.
- Show range indicator: `{start}–{end} of {total}`.

----------------------------------------------------------------------
freezeTrailingRows
- DataGridWrapper exposes freezeTrailingRows?: number (default 0).
- Passed directly to DataEditor's freezeTrailingRows prop.
- Use to pin the last row (e.g., a totals row) always visible at the bottom.

----------------------------------------------------------------------
Sorting
- State lives in use-data-grid (sortState { columnId, direction }).
- sortedRows is derived; source rows remain unmutated.
- setSort updates state; UI (sort-menu.tsx) calls setSort on selection.
- Header menu in employee-grid.tsx triggers sort menu; menu positions near header rect.
- Sorting logic handles strings, booleans, dates; skip or customize for arrays (tags) if needed.

----------------------------------------------------------------------
Editing
- onCellEdited in use-employee-grid handles Text/Uri/Boolean/date and Custom cells.
- allowOverlay: true on editable cells; readonly: false for editable ones.
- title column: Custom cell — edit handler checks kind === 'title-dropdown', extracts data.value.
- Hired date edits parse Date; invalid inputs keep previous value.
- Extend switch in onCellEdit for new editable fields as required.

----------------------------------------------------------------------
Add/delete rows
- addRow uses blankEmployee helper (lib/data/employees.ts) to append a new row.
- deleteRows accepts row indices; selection.rows?.toArray() is used in the UI.
- Keyboard Cmd/Ctrl+Enter also calls addRow.
- Right-click context menu Delete row calls grid.deleteRows([contextMenu.row]).
- Replace blankEmployee with your own initializer if needed.

----------------------------------------------------------------------
Columns and grouping
- Defined in employee-grid-config.ts with id/title/group/width/icon/hasMenu/menuIcon/grow.
- All 10 columns have hasMenu: true + menuIcon: GridColumnMenuIcon.Dots.
- Grouping controls header group rows; adjust group names to your domain.
- Align column ids with getCellContent mapping to avoid runtime gaps.
- title NOT in editableTextColumns — it is a Custom cell.

----------------------------------------------------------------------
Theme modes (UI)
- employee-grid.tsx includes a theme toggle button (light/dark).
- Theme mode propagates to use-employee-grid → realizeThemeFonts → DataEditor.
- Theme toggle also syncs document.documentElement.classList.toggle('dark', ...) for Tailwind dark: variants.
- To embed in another app, remove the UI toggle and pass themeVariant from your own theme context/provider.

----------------------------------------------------------------------
Custom cell extension pattern
- Define a CustomCell type with a `kind` discriminator.
- Implement a CustomRenderer with isMatch checking `cell.data.kind`.
- Draw using canvas APIs; use theme for fonts/colors. Leave 1px gutter: ctx.fillRect(rect.x+1, rect.y+1, rect.width-2, rect.height-2).
- Set copyData for clipboard behavior.
- Register renderer in employee-grid.tsx customRenderers array.
- Map column to the custom cell in getCellContent.

Example — title-dropdown renderer:
```typescript
const titleDropdownRenderer: CustomRenderer<TitleDropdownCell> = {
  kind: GridCellKind.Custom,
  isMatch: (cell): cell is TitleDropdownCell =>
    cell.kind === GridCellKind.Custom && (cell.data as any).kind === 'title-dropdown',
  draw: (args, cell) => {
    // draw pill with rounded rect on canvas
  },
}
```

----------------------------------------------------------------------
Copy-friendly selection
- getCellsForSelection assembles a 2D array of cells for multi-cell copy.
- Ensure custom cells set copyData (tags join(', '), persona name, sparkline values formatted, title value).
- Without getCellsForSelection, multi-cell copy/paste won't behave as expected.

----------------------------------------------------------------------
Minimal embed steps (checklist)
1) Install @glideapps/glide-data-grid and import its CSS.
2) Copy: employee-grid.tsx, employee-grid-config.ts, use-employee-grid.ts, use-data-grid.ts, data-grid-wrapper.tsx, custom renderers, dropdown-overlay-editor.tsx.
3) Fix path aliases (@/…) to your project structure.
4) Map your data to EmployeeRow fields or adjust getCellContent/onCellEdited accordingly.
5) CRITICAL: Verify font styles in lib/grid-theme.ts are weight+size ONLY (no font family). Example: baseFontStyle: '400 14px'.
6) Choose light/dark mode; theme is auto-realized in use-data-grid.ts hook via realizeThemeFonts().
7) Keep add/delete/sort/edit as-is, or wire them to your backend.
8) Verify copy behavior (getCellsForSelection) and custom cells (sparkline/persona/tags/title-dropdown).
9) Wire provideEditor if you want dropdown editing on any column.
10) Add drawCell/drawHeader callbacks to DataGridWrapper if you want canvas overdraw.

----------------------------------------------------------------------
Adapting to your domain (examples)
- CRM: columns become contact fields; persona cell could show account owner; tags become deal stages.
- Ops dashboard: performance sparkline could be SLAs; tags as regions; opt-in as active flag.
- Inventory: tags as categories; performance as stock trend; manager as supplier contact.
- HRIS: tags as skills; performance as reviews; manager as supervisor.

----------------------------------------------------------------------
Theming mapping tips
- Map your design tokens to gridLightTheme/gridDarkTheme values in lib/grid-theme.ts.
- If you use CSS variables, resolve them before passing (canvas ignores CSS vars).
- Font scaling works by parsing sizes in header/base/marker font strings; keep sizes in px.

----------------------------------------------------------------------
Sorting nuances
- Current logic sorts strings, booleans, dates; arrays (tags) are not sorted by default.
- To sort tags, decide on a strategy (e.g., join + lexicographic) and extend sortedRows comparator in use-data-grid.ts.
- If you need per-column sort types, add metadata in employee-grid-config.ts and branch in comparator.

----------------------------------------------------------------------
Editing nuances
- allowOverlay: true opens editors; readonly: false enables commit.
- For Custom cells, editing fires through use-data-grid.ts isCustomCell branch — always handled.
- For validation, use onCellEdit to reject or coerce values.

----------------------------------------------------------------------
Add/delete in production
- If you have a backend, call your API inside addRow/deleteRows or wrap them with async handlers.
- After server commit, refresh local state; keep optimistic updates minimal for simplicity.
- Ensure ids remain unique; consider UUIDs if server generates ids.

----------------------------------------------------------------------
Accessibility considerations
- Canvas text inherits from theme fonts; ensure sufficient contrast in theme colors.
- Keep rowHeight adequate for larger fonts to avoid clipping.
- Keyboard shortcut (Cmd/Ctrl+Enter for add row) gates on metaKey/ctrlKey to avoid accidental triggers.

----------------------------------------------------------------------
Performance notes
- Glide is virtualized; keep getCellContent cheap (pure mapping).
- Avoid recreating functions/renderers on every render; use useMemo/useCallback.
- drawCell callback fires every frame for every cell — guard on cell kind immediately and return early.
- drawHeader fires less frequently (headers redraw on hover/resize) — still use ctx.save/restore.
- Large datasets: move from local state to server-backed fetching; keep sorting server-side when needed.

----------------------------------------------------------------------
Context menu dark mode pattern
- Read themeMode state (not document.documentElement) for reliable dark mode detection in React.
- Build bg/border/hover/text colors from themeMode before rendering the menu div.
- Use inline styles (not Tailwind) on the menu div since it is positioned outside the React tree hierarchy.

----------------------------------------------------------------------
Debugging
- Fonts not changing: Check grid-theme.ts — baseFontStyle must be weight+size only, no font family.
- Custom renderer not showing: Check isMatch — kind string must exactly match getCellContent output.
- Dropdown editor not opening: Confirm column has allowOverlay: true, and provideEditor is passed to DataGridWrapper.
- title edit not persisting: Check onCellEdit handles columnId === 'title' with Custom cell kind, not Text kind.
- Context menu not appearing: Confirm onCellContextMenu is wired on DataGridWrapper and DataEditor.
- Trend arrows not rendering: Confirm drawCell is passed to DataGridWrapper; guard on sparkline kind before drawing.
- Group accent bars not showing: Confirm drawHeader is passed; check GROUP_ACCENT_COLORS keys match column.group values exactly.

----------------------------------------------------------------------
Known limitations
- Sorting on tags not implemented (tags are arrays; add custom comparator if needed).
- No server sync for edits/add/delete; local only (wire yourself).
- Date editing uses raw text parsing (no calendar picker UI).
- Row grouping (collapsible by department) not implemented — Glide v6.0.3 does not support true collapsible row groups natively; simulate via sentinel rows if needed.

----------------------------------------------------------------------
Quick-start TL;DR for brownfield
- Copy grid files: data-grid-wrapper.tsx, employee-grid.tsx, employee-grid-config.ts, use-data-grid.ts, use-employee-grid.ts, tags-cell-renderer.ts, dropdown-overlay-editor.tsx; fix imports.
- Copy lib/grid-theme.ts for theme definitions.
- Map your data; adjust columns in employee-grid-config.ts; add hasMenu + menuIcon to all columns.
- ⚠️ CRITICAL: Verify font styles in lib/grid-theme.ts = weight + size only (e.g., '400 14px'), NO font family.
- theme auto-realized in use-data-grid.ts via realizeThemeFonts().
- Keep custom renderers; register them in customRenderers array.
- Pass provideEditor from createDropdownEditor for any dropdown column.
- Pass drawCell + drawHeader to DataGridWrapper for canvas overdraw.
- Wire add/delete/sort/edit to your backend as needed.
- Test font sizes; adjust rowHeight (35) / headerHeight (40) in data-grid-wrapper.tsx if text clips.

----------------------------------------------------------------------
Deploy checklist
- CSS imported (@glideapps/glide-data-grid/dist/index.css).
- Theme font styles verified (baseFontStyle = weight + size only, NO font family).
- realizeThemeFonts() called in use-data-grid.ts.
- Data mapped to columns via getCellContent.
- title column uses GridCellKind.Custom, not Text.
- provideEditor wired for title column (or any dropdown column).
- drawCell and drawHeader passed to DataGridWrapper.
- onCellContextMenu wired for right-click menu.
- Sorting/editing/add/delete tested.
- Custom cells registered in customRenderers array.
- Path aliases fixed (@/ imports resolved).
- Row heights adjusted for font sizes (no text clipping).

----------------------------------------------------------------------
Author: Akshad Jaiswal — use this guide to safely lift the grid into your app.
