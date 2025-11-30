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
    <div className="w-48 rounded-xl border border-slate-200 bg-white p-2 text-sm shadow-xl shadow-slate-900/10">
      <button
        type="button"
        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-slate-100 ${
          active('asc') ? 'bg-slate-100 font-semibold text-slate-800' : 'text-slate-700'
        }`}
        onClick={() => onChange(columnId, 'asc')}
      >
        ↑ Sort ascending
      </button>
      <button
        type="button"
        className={`mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-slate-100 ${
          active('desc') ? 'bg-slate-100 font-semibold text-slate-800' : 'text-slate-700'
        }`}
        onClick={() => onChange(columnId, 'desc')}
      >
        ↓ Sort descending
      </button>
      <button
        type="button"
        className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-slate-600 hover:bg-slate-100"
        onClick={() => onChange(columnId, null)}
      >
        ✕ Clear sort
      </button>
    </div>
  )
}
