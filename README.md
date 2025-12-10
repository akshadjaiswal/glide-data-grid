# Glide UI

> A production-ready, feature-rich implementation of Glide Data Grid with advanced features like footer summaries, custom renderers, dropdown editors, and a modular architecture for enterprise applications.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Glide Data Grid](https://img.shields.io/badge/Glide%20Data%20Grid-6.x-7c3aed?style=flat-square)](https://github.com/glideapps/glide-data-grid)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

---

## Why this exists
Built from real-world requirements integrating Glide Data Grid into production applications. This project showcases advanced patterns and features inspired by enterprise tools:
- **Reusable DataGridWrapper** component with footer aggregations
- **Generic useDataGrid hook** that works with any data type
- **Advanced custom renderers** with proper theming and borders
- **Dropdown editors** for custom cell types
- **Modular architecture** for scalability and maintenance

Perfect for building internal tools, admin dashboards, and data-heavy applications.

---

## ✨ Enhanced Features

### Core Grid Features
- **Rich grid UX**: Grouped headers, frozen columns, row markers, smooth scroll, copy-friendly selection
- **Better density**: Compact 35px rows (vs 72px) for more data on screen
- **Proper borders**: 1px cell gutters that preserve borders under hover/selection
- **Column resizing**: Persistent column width adjustments
- **Single-click multi-select**: Improved selection UX

### Footer Summary System 🆕
- **Aggregations**: Count, Sum, Average, Min, Max, Percentages
- **Per-column configuration**: Choose different calculations for each column
- **Automatic type detection**: Numeric vs non-numeric columns
- **Synchronized scrolling**: Footer follows grid horizontal scroll

### Advanced Custom Cells
- **Enhanced tags renderer**: With color mapping support
- **Sparkline charts**: Performance trends with canvas rendering
- **Persona cells**: Manager avatars with names
- **Dropdown editors**: For funnel stages, revenue tiers, and custom categories

### Developer Experience
- **Generic hook system**: Reusable for any data type, not just employees
- **Modular components**: DataGridWrapper, custom renderers, dropdown editors
- **Type-safe**: Full TypeScript support with proper generics
- **Themeable**: Light/dark modes with improved color contrast

---

## 🎯 New in This Version

This implementation brings production-grade features inspired by real-world applications:

1. **DataGridWrapper Component**: Reusable wrapper with footer summaries, aggregations, and dynamic row markers
2. **Generic useDataGrid Hook**: Works with any data type `<T>`, not hardcoded to specific schemas
3. **Footer Summary System**: Add calculations (sum, average, count, etc.) to any column
4. **Enhanced Themes**: Better borders, improved density, proper color contrast
5. **Modular Architecture**: Easy to extend with new renderers and editors
6. **Dropdown Editors**: Pre-built editors for status fields, categories, and more
7. **Better Performance**: Visible region tracking and optimized rendering

---

## 🛠️ Tech stack (and why)

| Category | Tools | Why |
| --- | --- | --- |
| Framework | Next.js (App Router), React 18 | Fast DX, production-ready routing |
| Language | TypeScript | Safer refactors, clearer contracts |
| Grid | @glideapps/glide-data-grid | Virtualized, canvas-based, custom cells |
| Styling | Tailwind CSS | Quick iteration with consistent tokens |
| State/Data | React hooks + local state; TanStack Query scaffolded | Simple local edits now, ready for async later |
| Utilities | date-fns, axios, lodash | Pragmatic formatting and helpers |

---

## 🚀 Quick start
Prereqs: Node.js 18+, npm
```bash
cd glide-ui
npm install
npm run dev
# open http://localhost:3000
```
No env vars required for the demo; dummy data is bundled.

---

## 📁 Project map (key bits)
```
app/
  page.tsx                # Landing page with CTA
  grid/page.tsx           # Grid demo route (client-only)
components/
  employee-grid.tsx       # Thin UI wrapper for DataEditor + renderers
  employee-grid-config.ts # Columns, editable flags, theme overrides
hooks/
  use-employee-grid.ts    # Grid state, theme realization, editing logic
lib/data/employees.ts     # 50-row typed dummy dataset
public/favicon.svg        # Custom favicon
```

---

## 🧭 Feature deep dive
- **Grouped headers & freeze**: Keeps context when scrolling wide datasets.
- **Custom cells**: Sparklines (canvas) for performance; persona cells for manager avatars + names.
- **Editing**: Overlay editors on text/URI; boolean toggle for opt-in; date parsing for hired date.
- **Selection & copy**: `getCellsForSelection` wired so multi-cell copy works as expected.
- **Theming**: Enlarged fonts, generous padding, rounded corners; tweak once in config, it propagates.

---

## 🔧 How to customize
- **Columns**: `components/employee-grid-config.ts` (order, widths, editable flags, groups).
- **Theme**: Same file—font sizes, padding, colors, rounding.
- **Data**: `lib/data/employees.ts` (dummy generator) or swap in your API and adapt `use-employee-grid.ts`.
- **Custom cells**: Extend `use-employee-grid` and add renderers in `employee-grid.tsx`.

---

## 🛣️ Roadmap ideas
- Add search/filter UI on top of the grid.
- Hook up real data fetching (TanStack Query) with server mutations.
- More custom cells (chips, ratings, badges, progress bars).
- Per-column validation and inline error states.

---

## 🙋‍♂️ Author & socials
Built by **Akshad Jaiswal**
- GitHub: [@akshadjaiswal](https://github.com/akshadjaiswal)
- Twitter: [@akshad_999](https://twitter.com/akshad_999)
- LinkedIn: [Akshad Jaiswal](https://www.linkedin.com/in/akshadsantoshjaiswal/)

---

## 📜 License
MIT — use it, remix it, build great tools with it.
