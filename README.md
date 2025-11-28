# Glide UI

> A focused playground for Glide Data Grid—grouped headers, custom cells, inline editing, and a polished shell you can lift into your next internal tool.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Glide Data Grid](https://img.shields.io/badge/Glide%20Data%20Grid-6.x-7c3aed?style=flat-square)](https://github.com/glideapps/glide-data-grid)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

---

## Why this exists
I was integrating Glide Data Grid into a larger, brownfield codebase and needed a clean sandbox to iterate quickly—without fighting legacy constraints. This project is that starter:
- Minimal surface area to test Glide features safely.
- Ready-made grouped headers, frozen columns, custom cells, and editing callbacks.
- Modular structure so you can drop the grid into bigger apps with confidence.

Use this as a reference or a base to build the exact grid experience your product needs.

---

## ✨ What’s inside
- **Rich grid UX**: Grouped headers, frozen columns, row markers, smooth scroll, copy-friendly selection.
- **Custom cells**: Canvas sparklines for performance trends; persona cells for manager avatars + names.
- **Inline editing**: Text, URL, boolean, and date edits handled via Glide’s callbacks.
- **Typed dummy data**: 50 generated employee rows (titles, links, performance series, managers, hire dates).
- **Polished shell**: Hero + CTA landing, dedicated grid route, custom favicon, enlarged typography.
- **Modular by design**: Config + hook separate columns, theme, and state so you can extend safely.

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
