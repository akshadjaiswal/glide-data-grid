Integrating Glide UI into brownfield projects: comprehensive field guide.
Purpose: help you lift the grid (with custom cells, theming, editing, sorting) into an existing codebase safely.
Scope: focuses on the core grid files, wiring patterns, theming/fonts, data mapping, and migration steps.
Tone: concise, prescriptive, and opinionated about separation of concerns.

----------------------------------------------------------------------
High-level anatomy (what to copy first)
- Grid wrapper UI: components/employee-grid.tsx
- Grid config: components/employee-grid-config.ts (columns, editable flags, theme tokens)
- Grid logic: hooks/use-employee-grid.ts (state, sorting, editing, add/delete, theme realization)
- Custom cells: components/tags-cell-renderer.ts + inline sparkline/persona renderers in employee-grid.tsx
- Data shape reference: lib/data/employees.ts (EmployeeRow type and dummy generator)
- Sort menu: components/sort-menu.ts
- Optional dummy data entry: lib/data/employees.ts (for local testing)

----------------------------------------------------------------------
Guiding principles
- Keep UI wrappers thin; push logic into hooks/config.
- Use realized themes for canvas text sizing; CSS overrides won’t change canvas fonts.
- Map data → cells explicitly; avoid implicit shape assumptions.
- Make sorting/editing opt-in via the hook; don’t hardcode to UI.
- Keep custom renderers independent; only rely on theme + cell data.
- Prefer copy-friendly selection by implementing getCellsForSelection.

----------------------------------------------------------------------
File-by-file responsibilities
- employee-grid.tsx: renders DataEditor, registers custom renderers, wires callbacks (sorting menu, add/delete), light/dark theme toggle.
- employee-grid-config.ts: declares columns (id/title/group/width/icon), editable column lists, theme tokens (light/dark). CRITICAL: font styles must be weight+size ONLY (no font family).
- use-employee-grid.ts: owns editable state, sorting state, derived sortedRows, getCellContent, getCellsForSelection, onCellEdited, addRow, deleteRows, AND theme realization via realizeThemeFonts() helper.
- tags-cell-renderer.ts: draws pill tags using theme.baseFontFull.
- sort-menu.ts: simple ascending/descending/clear UI popover.
- lib/data/employees.ts: EmployeeRow type and dummy data helpers (buildEmployees, blankEmployee).

----------------------------------------------------------------------
Data model (EmployeeRow) expectations
- id: number (unique)
- email: string
- firstName, lastName: string
- optIn: boolean
- title: string
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
- Our implementation uses a custom realizeThemeFonts() helper function in use-employee-grid.ts to create the *FontFull properties.

----------------------------------------------------------------------
CRITICAL: Font Style Format Rules (employee-grid-config.ts)
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

The realizeThemeFonts() function in use-employee-grid.ts handles concatenation:
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
Theme realization in use-employee-grid.ts
- getDefaultTheme() provides base theme from @glideapps/glide-data-grid.
- Merge base with employeeLightTheme or employeeDarkTheme overrides.
- Call realizeThemeFonts(merged) to create baseFontFull/headerFontFull/markerFontFull.
- Pass realized theme to DataEditor.

Example from use-employee-grid.ts:
```typescript
const theme = useMemo(() => {
  const base = getDefaultTheme()
  const overrides = themeVariant === 'dark' ? employeeDarkTheme : employeeLightTheme
  const merged = { ...base, ...overrides }
  return realizeThemeFonts(merged)
}, [themeVariant])
```

----------------------------------------------------------------------
Custom renderers and fonts
- Persona renderer should use theme.baseFontFull (or derive size from it), not hardcoded px.
- Tags renderer uses theme.baseFontFull for pill text.
- Sparkline renderer doesn’t need font changes; it’s canvas stroke only.
- If adding new custom cells, always read font from theme to respect fontScale/mode.

----------------------------------------------------------------------
Sorting
- State lives in use-employee-grid (sortState { columnId, direction }).
- sortedRows is derived; source rows remain unmutated.
- setSort updates state; UI (sort-menu.ts) calls setSort on selection.
- Header menu in employee-grid.tsx triggers sort menu; menu positions near header rect.
- Sorting logic handles strings, booleans, dates; skip or customize for arrays (tags) if needed.

----------------------------------------------------------------------
Editing
- onCellEdited in use-employee-grid handles Text/Uri/Boolean/date cells.
- allowOverlay: true on editable cells; readonly: false for editable ones.
- Hired date edits parse Date; invalid inputs keep previous value.
- Extend switch in onCellEdited for new editable fields as required.

----------------------------------------------------------------------
Add/delete rows
- addRow uses blankEmployee helper (lib/data/employees.ts) to append a new row with default values.
- deleteRows accepts row indices; selection.rows?.toArray() is used in the UI to pass indices.
- Trailing row (onRowAppended) calls addRow; onDelete callback calls deleteRows.
- Replace blankEmployee with your own initializer if needed (e.g., API-created row).

----------------------------------------------------------------------
Columns and grouping
- Defined in employee-grid-config.ts with id/title/group/width/icon/grow.
- Grouping controls header group rows; adjust group names to your domain (e.g., “Contact”, “Status”).
- hasMenu: true enables header menu arrow; used for sort menu.
- Align column ids with getCellContent mapping to avoid runtime gaps.

----------------------------------------------------------------------
Theme modes (UI)
- employee-grid.tsx includes a simple theme toggle button (light/dark mode only).
- Theme mode propagates to use-employee-grid → realizeThemeFonts → DataEditor.
- To embed in another app, remove the UI toggle and pass themeVariant from your own theme context/provider.
- No font scaling slider in current implementation; adjust font sizes directly in employee-grid-config.ts.

----------------------------------------------------------------------
Copy-friendly selection
- getCellsForSelection assembles a 2D array of cells for multi-cell copy.
- Ensure custom cells set copyData (e.g., tags join(', '), persona name, sparkline values formatted).
- Without getCellsForSelection, multi-cell copy/paste won’t behave as expected.

----------------------------------------------------------------------
Layout sizing
- rowHeight/headerHeight/groupHeaderHeight set in employee-grid.tsx; match them to your chosen fontScale.
- Column widths set in config; adjust for longer text if you upscale fonts.
- Freeze columns via DataEditor prop (currently 2) for better context.

----------------------------------------------------------------------
Minimal embed steps (checklist)
1) Install @glideapps/glide-data-grid and import its CSS.
2) Copy: employee-grid.tsx, employee-grid-config.ts, use-employee-grid.ts, custom renderers (tags-cell-renderer.ts).
3) Fix path aliases (@/…) to your project structure.
4) Map your data to EmployeeRow fields or adjust getCellContent/onCellEdited accordingly.
5) CRITICAL: Verify font styles in config are weight+size ONLY (no font family). Example: baseFontStyle: '400 16px' NOT '400 16px Inter'.
6) Choose light/dark mode; theme is auto-realized in use-employee-grid.ts hook via realizeThemeFonts().
7) Keep add/delete/sort/edit as-is, or wire them to your backend.
8) Verify copy behavior (getCellsForSelection) and custom cells (sparkline/persona/tags).

----------------------------------------------------------------------
Adapting to your domain (examples)
- CRM: columns become contact fields; persona cell could show account owner; tags become deal stages.
- Ops dashboard: performance sparkline could be SLAs; tags as regions; opt-in as active flag.
- Inventory: tags as categories; performance as stock trend; manager as supplier contact.
- HRIS: tags as skills; performance as reviews; manager as supervisor.

----------------------------------------------------------------------
Theming mapping tips
- Map your design tokens to employeeLightTheme/employeeDarkTheme values.
- If you use CSS variables, resolve them before passing to buildGridTheme (it expects concrete values).
- Font scaling works by parsing sizes in header/base/marker/editor font strings; keep sizes in px/em/rem formats.

----------------------------------------------------------------------
Custom cell extension pattern
- Define a CustomCell type with a `kind` discriminator (e.g., 'chips', 'status-badge').
- Implement a CustomRenderer with isMatch checking `cell.data.kind`.
- Draw using canvas APIs; use theme for fonts/colors.
- Set copyData for better clipboard behavior.
- Register renderer in employee-grid.tsx customRenderers array.
- Map column to the custom cell in getCellContent.

----------------------------------------------------------------------
Sorting nuances
- Current logic sorts strings, booleans, dates; arrays (tags) are not sorted by default.
- To sort tags, decide on a strategy (e.g., join + lexicographic) and extend sortedRows comparator.
- If you need per-column sort types, add metadata in employee-grid-config.ts and branch in comparator.

----------------------------------------------------------------------
Editing nuances
- allowOverlay: true opens editors; readonly: false enables commit.
- For custom editors, implement provideEditor and map by column id; keep default for most columns.
- For validation, use onCellEdited to reject or coerce values; or use validateCell if needed.

----------------------------------------------------------------------
Add/delete in production
- If you have a backend, call your API inside addRow/deleteRows or wrap them with async handlers.
- After server commit, refresh local state; keep optimistic updates minimal for simplicity.
- Ensure ids remain unique across server/client; consider UUIDs if server generates ids.

----------------------------------------------------------------------
Accessibility considerations
- Canvas text inherits from theme fonts; ensure sufficient contrast in theme colors.
- Keep rowHeight adequate for larger fonts to avoid clipping.
- If you add keyboard shortcuts for add/delete, gate them carefully to avoid accidental destructive actions.

----------------------------------------------------------------------
Performance notes
- Glide is virtualized; keep getCellContent cheap (pure mapping).
- Avoid recreating functions/renderers on every render; use useMemo/useCallback.
- Large datasets: move from local state to server-backed fetching; keep sorting server-side when needed.

----------------------------------------------------------------------
State ownership strategies
- Default: hook owns rows in local state (good for demos and small datasets).
- For real apps: lift state to parent or a store (Zustand/Redux) and pass rows + mutators down.
- Ensure getCellContent reads from the current source; avoid stale closures by including dependencies.

----------------------------------------------------------------------
Testing pointers
- Unit-test getCellContent mapping given a mock row.
- Unit-test sortedRows comparator for each type (string/boolean/date/tags).
- Storybook (optional): render employee-grid with mock data; toggle light/dark and fontScale to verify visuals.

----------------------------------------------------------------------
Deployment tips
- Ensure CSS for @glideapps/glide-data-grid is included globally.
- If using Next.js, keep the grid in a client component (it relies on window/canvas).
- Dynamic import with ssr: false if you hit SSR issues.

----------------------------------------------------------------------
Common pitfalls (and fixes)
- ⚠️ **Fonts not changing (MOST COMMON)**: You included font family inside baseFontStyle/headerFontStyle. Fix: Remove font family from style strings, keep only weight+size (e.g., '400 16px').
- Fonts still not changing: Ensure realizeThemeFonts() is called in use-employee-grid.ts to create *FontFull properties.
- Custom renderers small text: Use theme.baseFontFull instead of hardcoded px sizes.
- Copy not working: Implement getCellsForSelection and set copyData for custom cells.
- Sorting not applied: Ensure you consume sortedRows, not raw rows, in getCellContent and rows prop.
- Trailing row add not firing: Make sure onRowAppended returns a value or undefined (not a string when typed differently).
- CSS changes not working: Remember canvas text ignores CSS; all styling must be in theme object.

----------------------------------------------------------------------
Migrating into a brownfield app (step-by-step)
1) Drop the core files into your repo; fix import aliases.
2) Replace dummy data with your fetch; ensure EmployeeRow aligns or adjust mapping.
3) **CRITICAL**: Check employee-grid-config.ts font styles - remove any font families, keep weight+size only.
4) Pass themeVariant ('light' | 'dark') from your theme context/provider or keep the local toggle.
5) Keep custom renderers; adjust visuals if your theme differs.
6) Wire add/delete to your data layer; keep optimistic updates minimal.
7) Verify sorting/editing after integration; adjust comparator and onCellEdited as needed.

----------------------------------------------------------------------
Light vs dark theming notes
- Light theme: higher padding and larger base fonts by default.
- Dark theme: tighter padding per the provided tokens; relies on realized fonts to change size.
- You can standardize padding across modes if you prefer consistent density.

----------------------------------------------------------------------
Adjusting font sizes
- Modify baseFontStyle, headerFontStyle, markerFontStyle in employee-grid-config.ts (light and dark themes).
- Example: Change baseFontStyle from '400 16px' to '400 18px' for larger text.
- Remember: font style = weight + size ONLY. Font family is separate.
- After changing font sizes, consider adjusting rowHeight/headerHeight in employee-grid.tsx to prevent clipping.

----------------------------------------------------------------------
Canvas and CSS
- Remember: canvas text is set by theme; CSS overrides won’t change it.
- If you must override colors in devtools, do it via theme overrides, not CSS vars.

----------------------------------------------------------------------
Handling very wide datasets
- Increase freezeColumns for key identifiers.
- Adjust overscrollX if you need more horizontal gutter.
- Group headers to reduce visual clutter.

----------------------------------------------------------------------
Handling very tall datasets
- Virtualization handles height; keep rowHeight modest for density.
- Consider pagination server-side if you don’t want to load everything at once.

----------------------------------------------------------------------
Clipboard behavior
- Tags: join with commas in copyData.
- Persona: use name as copyData.
- Sparkline: join values with fixed decimals.
- Text/URI: displayData mirrors data; copyData follows default if unset.

----------------------------------------------------------------------
OnDelete behavior
- Current logic deletes any rows in the selection.
- You can gate deletion behind a confirm dialog in the UI wrapper.

----------------------------------------------------------------------
OnRowAppended behavior
- Trailing row shows hint “Add row”; on append, addRow is called.
- If you want a positioned insert, return a specific index from onRowAppended.

----------------------------------------------------------------------
Column icons
- Icons come from GridColumnIcon; adjust per column semantics in config.
- You can hide icons by removing icon fields if desired.

----------------------------------------------------------------------
Editable flags
- Editable columns are listed in editableTextColumns and editableBooleanColumns.
- Expand these lists if you add new editable fields; update onCellEdited switch accordingly.

----------------------------------------------------------------------
Tags column specifics
- Rendered via Custom cell 'tags'; pill layout wraps until width limit, then stops.
- CopyData uses comma join.
- Sorting currently ignores tags; add comparator logic if needed.

----------------------------------------------------------------------
Persona column specifics
- Uses manager name + avatar; read-only.
- Text uses theme font; avatar clipped to a circle.

----------------------------------------------------------------------
Sparkline column specifics
- Drawn on canvas; uses theme accent color fallback.
- Values normalized per row; light shading under the line.

----------------------------------------------------------------------
Boolean column specifics
- Uses Glide’s Boolean cell; allowOverlay false; readonly false to toggle.
- If you need tri-state, switch to custom renderer/editor.

----------------------------------------------------------------------
URI columns
- email and website use Uri cells; hoverEffect true.
- allowOverlay true to edit; readonly false for editability.

----------------------------------------------------------------------
Date column
- HiredAt displayed as formatted string (EEE MMM dd yyyy).
- Edits parse Date; invalid keeps prior value.

----------------------------------------------------------------------
Row markers
- rowMarkers="both" shows numbers with hoverable checkboxes.
- Adjust rowMarkerStartIndex if you need 0-based.

----------------------------------------------------------------------
Heights and padding
- Current: rowHeight 72, headerHeight 60 (or 48), groupHeaderHeight 48 (or 40) depending on mode tweaks.
- If you increase fontScale a lot, consider raising rowHeight/headerHeight to avoid clipping.

----------------------------------------------------------------------
Sorting menu positioning
- Uses header rect (onHeaderMenuClick) to place menu near the header.
- Closes on mouse leave; setSort called on selection; sort state stored in hook.

----------------------------------------------------------------------
Toolbar (theme toggle only)
- Light/dark toggle button: updates themeVariant prop passed to use-employee-grid hook.
- No text size slider in current implementation.
- To adjust text size: modify baseFontStyle in employee-grid-config.ts.
- Remove or replace with your design system controls as needed.

----------------------------------------------------------------------
Design tokens per mode
- Light theme (employee-grid-config.ts): baseFontStyle: '400 16px', larger padding (cellHorizontalPadding: 18, cellVerticalPadding: 16).
- Dark theme (employee-grid-config.ts): baseFontStyle: '400 16px', tighter padding (cellHorizontalPadding: 8, cellVerticalPadding: 3).
- Adjust these values to match your design system; override as needed for symmetry across modes.

----------------------------------------------------------------------
Using your own design system
- Map colors/spacing/typography into the light/dark override objects in employee-grid-config.ts.
- Font sizes must be in px (e.g., '16px', '18px') in the font style strings.
- Remember: baseFontStyle/headerFontStyle = weight + size only; fontFamily is separate.

----------------------------------------------------------------------
Extending column metadata
- Add fields like `sortType`, `filterType`, `formatter` to employee-grid-config.ts.
- Use these metadata in sortedRows and getCellContent to drive behavior.

----------------------------------------------------------------------
Filtering (not implemented yet)
- Pattern: add filter state in hook; derive filteredRows before sorting.
- Provide a simple UI (search box, tag chips) to update filters.
- Keep filters/sort pure functions on the data array.

----------------------------------------------------------------------
Persisting edits
- Wrap onCellEdited with API calls; on success, refresh state; on failure, revert.
- For optimistic updates, snapshot previous rows and rollback on error.

----------------------------------------------------------------------
Handling ids
- Current addRow uses incremental id; in real apps, prefer UUIDs or server-provided ids.
- Ensure id uniqueness before sorting or editing to avoid ambiguous rows.

----------------------------------------------------------------------
Grid props worth knowing (from Glide)
- freezeColumns, rowMarkers, trailingRowOptions, getCellsForSelection, onCellEdited, onDelete, onRowAppended.
- headerMenu: enabled via hasMenu; custom menu rendered by you.
- theme: pass realized theme.

----------------------------------------------------------------------
CSS vs canvas reminder
- You cannot change canvas text size by tweaking DOM CSS; use theme realization.
- Colors in theme affect canvas; CSS filters on the DOM won’t recolor text.

----------------------------------------------------------------------
Accessibility & contrast
- Check contrast ratios for textDark/textMedium on bgCell/bgHeader in both modes.
- Adjust linkColor for sufficient contrast on dark backgrounds.

----------------------------------------------------------------------
Performance tuning
- Keep renderers simple; avoid expensive measure calls in loops.
- Memoize customRenderers array.
- Avoid recreating large data arrays in render; use state + derived memo.

----------------------------------------------------------------------
Testing font size changes
- Change baseFontStyle from '400 16px' to '400 20px' in employee-grid-config.ts and verify text is larger.
- If text clips, increase rowHeight/headerHeight in employee-grid.tsx.
- Verify row marker numbers remain legible (adjust markerFontStyle if needed).

----------------------------------------------------------------------
Adding new custom cells (template)
- Define type: CustomCell<{ kind: 'your-kind'; data: ... }>
- Renderer: isMatch checks kind; draw uses theme; set copyData.
- Map in getCellContent for a column; add column in config.
- Register renderer in customRenderers list.

----------------------------------------------------------------------
Multi-theme readiness
- Add more theme modes (e.g., 'high-contrast') by creating new theme objects in employee-grid-config.ts.
- Extend ThemeVariant type in use-employee-grid.ts to include new modes.
- realizeThemeFonts() works with any theme object; just merge and realize.

----------------------------------------------------------------------
Import paths in brownfield apps
- Replace '@/...' with relative or your alias.
- Ensure tsconfig paths or webpack aliases resolve to your structure.

----------------------------------------------------------------------
Keeping things tree-shakeable
- Avoid importing unused dummy data in production.
- Keep optional UI (landing page) out of your bundle if not needed.

----------------------------------------------------------------------
Dev vs prod differences
- In prod, you may want to disable trailing row or destructive delete without confirm.
- In dev, keep dummy data and toggles for design iteration.

----------------------------------------------------------------------
Security considerations
- If rendering user-generated content in custom cells, sanitize before drawing.
- Links (Uri cells): ensure safe protocols if data comes from users.

----------------------------------------------------------------------
Clipboard and privacy
- copyData controls what leaves the grid on copy; avoid sensitive fields if not needed.
- Consider masking PII in copyData while showing full text in displayData.

----------------------------------------------------------------------
Internationalization
- Dates: format with locale if required (use date-fns locale options).
- Text direction: Glide supports RTL; test if you have RTL content.

----------------------------------------------------------------------
Mobile responsiveness
- Grid is best on desktop; for mobile, consider smaller column sets or responsive layouts outside the grid.
- You can hide non-essential columns at small breakpoints by adjusting columns array before rendering.

----------------------------------------------------------------------
Versioning
- Glide version: check package.json; if upgrading, revisit API changes for theme realization and custom cells.
- Lock versions in your brownfield app to avoid drift.

----------------------------------------------------------------------
Deploy checklist
- CSS imported (@glideapps/glide-data-grid/dist/index.css).
- Theme font styles verified (baseFontStyle = weight + size only, NO font family).
- realizeThemeFonts() called in use-employee-grid.ts.
- Data mapped to columns via getCellContent.
- Sorting/editing/add/delete tested.
- Custom cells registered in customRenderers array.
- Path aliases fixed (@/ imports resolved).
- Row heights adjusted for font sizes (no text clipping).

----------------------------------------------------------------------
Debugging font issues
- **First check**: Inspect employee-grid-config.ts - do baseFontStyle/headerFontStyle include font family? If yes, REMOVE IT.
- Log theme.baseFontFull/headerFontFull in use-employee-grid.ts to verify they're correctly formatted (e.g., "400 16px Inter, sans-serif").
- If *FontFull properties are missing, ensure realizeThemeFonts() is called in the theme useMemo.
- Verify rowHeight/headerHeight in employee-grid.tsx match your font sizes to avoid clipping.
- Still not working? Check browser DevTools canvas inspector to see what font string is actually being used.

----------------------------------------------------------------------
Debugging rendering issues
- Check isMatch in custom renderers; ensure kind strings match getCellContent.
- If images fail (persona), handle missing URL gracefully.

----------------------------------------------------------------------
Debugging sorting
- Confirm rows passed to DataEditor are sortedRows, not raw rows.
- For mixed types, add per-column comparators.

----------------------------------------------------------------------
Debugging editing
- Ensure allowOverlay and readonly flags are correct.
- For URIs, ensure newValue.kind === GridCellKind.Uri when editing.

----------------------------------------------------------------------
Extending tags renderer
- Add overflow indicator (“+N more”) if tags exceed width.
- Allow click to open a popover with full list (optional).

----------------------------------------------------------------------
Extending persona renderer
- Add secondary text (e.g., role) by drawing additional text lines.
- Handle missing avatar by drawing initials.

----------------------------------------------------------------------
Extending sparkline renderer
- Add dots at min/max points.
- Change stroke color based on trend direction.

----------------------------------------------------------------------
Integrating filters
- Add filter state to hook; derive filteredRows before sorting.
- Build simple UI (search box, tag chips) to update filters.

----------------------------------------------------------------------
Accessibility of menus
- Sort menu currently hover-closes; add explicit close or blur handling if needed.
- Consider keyboard activation if required.

----------------------------------------------------------------------
Printing/export
- For CSV export, iterate over rows/columns and use copyData where available.
- For PDF, consider server-side export; canvas rendering won’t directly print well.

----------------------------------------------------------------------
Error handling
- Wrap data fetches (if added) with try/catch; show fallback UI outside the grid.
- Keep grid resilient by returning Loading cells if data missing.

----------------------------------------------------------------------
State reset
- If props rows change, useEffect in hook resets internal rows (currently implemented).
- If you want to preserve edits across prop changes, remove or adjust that effect.

----------------------------------------------------------------------
Multi-grid scenarios
- You can reuse the hook/config for multiple datasets; parameterize columns if needed.
- Keep custom renderers shared to avoid duplication.

----------------------------------------------------------------------
Theming tokens to tweak first
- textDark/textMedium/textLight
- bgCell/bgHeader/bgBubble
- accentColor/linkColor
- font sizes in base/header/marker/editor

----------------------------------------------------------------------
Alignment with design systems
- If using Tailwind tokens, resolve them to actual values before building the theme.
- Avoid CSS variables inside theme strings; use concrete values.

----------------------------------------------------------------------
Feature flags
- Wrap add/delete/sort in optional flags if you need to ship incrementally.
- Disable custom cells by removing renderers; grid will fall back to Text cells if mapped accordingly.

----------------------------------------------------------------------
Linting/formatting
- Keep imports sorted; ensure no unused imports after transplant.
- Re-run your project’s formatter after copying files.

----------------------------------------------------------------------
TypeScript tips
- ColumnId union drives switch exhaustiveness; update it when adding columns.
- Ensure EditableGridCell checks align with cell kinds you emit.

----------------------------------------------------------------------
State immutability
- setRows uses shallow copies; do not mutate prev rows directly.
- Sorting derives a new array; source rows remain unchanged.

----------------------------------------------------------------------
Handling huge tag lists
- Truncate display; show tooltip or popover for full list.
- Consider chip count in copyData only.

----------------------------------------------------------------------
Handling long text
- Enable allowOverlay to edit; consider ellipsis in displayData if very long.
- Increase column width or allow wrapping (Glide supports allowWrapping on text cells).

----------------------------------------------------------------------
Light/dark sync with app theme
- Instead of local toggle, feed themeVariant from your global theme provider.
- Keep fontScale separate; tie to user preferences if available.

----------------------------------------------------------------------
Deployment sanity check (again)
- Confirm DataEditor has realized theme.
- Confirm customRenderers includes all custom cells used.
- Confirm getCellContent covers every column id.
- Confirm rows prop uses sortedRows (if sorting enabled).

----------------------------------------------------------------------
Maintenance tips
- Keep config and hook small; avoid UI logic creeping into the hook.
- Document any domain-specific column additions in config comments.

----------------------------------------------------------------------
Where to adjust fonts if needed
- employee-grid-config.ts: Change baseFontStyle/headerFontStyle/markerFontStyle (format: weight + size, e.g., '400 18px').
- employee-grid-config.ts: Change editorFontSize for overlay editor text (e.g., '18px').
- employee-grid.tsx: Adjust rowHeight/headerHeight/groupHeaderHeight to fit larger fonts without clipping.

----------------------------------------------------------------------
Where to adjust colors if needed
- employee-grid-config.ts: Modify employeeLightTheme and employeeDarkTheme color properties.
- realizeThemeFonts() in use-employee-grid.ts will merge them automatically.
- Don't rely on CSS variable tweaks; canvas ignores CSS - all colors must be in theme object.

----------------------------------------------------------------------
Where to adjust paddings if needed
- cellHorizontalPadding/cellVerticalPadding in config per mode.
- Row height if vertical padding increases.

----------------------------------------------------------------------
Known limitations
- No filtering UI implemented yet.
- Sorting on tags not implemented.
- No server sync for edits/add/delete; local only (wire yourself).

----------------------------------------------------------------------
Quick-start TL;DR for brownfield
- Copy grid files: employee-grid.tsx, employee-grid-config.ts, use-employee-grid.ts, tags-cell-renderer.ts; fix imports.
- Map your data; adjust columns in config.
- ⚠️ **CRITICAL**: Verify font styles in config = weight + size only (e.g., '400 16px'), NO font family.
- Theme auto-realized in use-employee-grid.ts via realizeThemeFonts() helper.
- Keep custom renderers; register them in customRenderers array.
- Wire add/delete/sort/edit to your backend as needed.
- Test font sizes; adjust rowHeight if text clips.

----------------------------------------------------------------------
Author: Akshad Jaiswal — use this guide to safely lift the grid into your app.

