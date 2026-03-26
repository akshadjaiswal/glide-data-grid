'use client'

import type { ColumnId } from './employee-grid-config'

type SortDirection = 'asc' | 'desc' | null

type SortMenuProps = {
  columnId: ColumnId
  current: SortDirection
  onChange: (columnId: ColumnId, dir: SortDirection) => void
}

export function SortMenu({ columnId, current, onChange }: SortMenuProps) {
  const active = (dir: Exclude<SortDirection, null>) => current === dir

  return (
    <div className="w-48 rounded-xl border border-slate-200 bg-white p-2 text-sm shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900">
      <button
        type="button"
        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:hover:bg-slate-800 ${
          active('asc') ? 'bg-slate-100 font-semibold text-slate-800 dark:bg-slate-800 dark:text-white' : 'text-slate-700 dark:text-slate-200'
        }`}
        onClick={() => onChange(columnId, 'asc')}
      >
        ↑ Sort ascending
      </button>
      <button
        type="button"
        className={`mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:hover:bg-slate-800 ${
          active('desc') ? 'bg-slate-100 font-semibold text-slate-800 dark:bg-slate-800 dark:text-white' : 'text-slate-700 dark:text-slate-200'
        }`}
        onClick={() => onChange(columnId, 'desc')}
      >
        ↓ Sort descending
      </button>
      <button
        type="button"
        className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:text-slate-300 dark:hover:bg-slate-800"
        onClick={() => onChange(columnId, null)}
      >
        ✕ Clear sort
      </button>
    </div>
  )
}
