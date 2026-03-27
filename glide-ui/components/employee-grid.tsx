'use client'

import { useMemo, useState, useCallback } from 'react'
import {
  GridCellKind,
  CompactSelection,
  type CustomCell,
  type CustomRenderer,
  type GridSelection,
} from '@glideapps/glide-data-grid'
import '@glideapps/glide-data-grid/dist/index.css'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { format } from 'date-fns'

import type { EmployeeRow } from '@/lib/data/employees'
import { useEmployeeGrid } from '@/hooks/use-employee-grid'
import { SortMenu } from './sort-menu'
import { employeeColumns, type ColumnId } from './employee-grid-config'
import { tagsRenderer } from './tags-cell-renderer'
import { DataGridWrapper } from './data-grid-wrapper'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type SparklineCell = CustomCell<{ kind: 'sparkline'; values: readonly number[]; color: string }>
type PersonaCell = CustomCell<{ kind: 'persona'; name: string; avatar: string }>

// Custom sparkline cell renderer
const sparklineRenderer: CustomRenderer<SparklineCell> = {
  kind: GridCellKind.Custom,
  isMatch: (cell): cell is SparklineCell =>
    cell.kind === GridCellKind.Custom && (cell.data as SparklineCell['data']).kind === 'sparkline',
  draw: (args, cell) => {
    const { ctx, rect, theme, cellFillColor } = args
    const { values, color } = cell.data

    if (cellFillColor) {
      ctx.fillStyle = cellFillColor
      // Leave 1px gutter so the grid borders remain visible
      ctx.fillRect(rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2)
    }

    if (!values.length) return

    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = max - min || 1

    const paddingX = 8
    const paddingY = 10
    const usableWidth = rect.width - paddingX * 2
    const usableHeight = rect.height - paddingY * 2

    ctx.beginPath()
    values.forEach((value, index) => {
      const x = rect.x + paddingX + (index / Math.max(values.length - 1, 1)) * usableWidth
      const y = rect.y + paddingY + usableHeight - ((value - min) / span) * usableHeight

      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })

    ctx.strokeStyle = color || theme.accentColor
    ctx.lineWidth = 1.4
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.stroke()

    ctx.lineTo(rect.x + paddingX + usableWidth, rect.y + rect.height - paddingY)
    ctx.lineTo(rect.x + paddingX, rect.y + rect.height - paddingY)
    ctx.closePath()
    ctx.globalAlpha = 0.08
    ctx.fillStyle = color || theme.accentColor
    ctx.fill()
    ctx.globalAlpha = 1
  },
}

// Custom manager persona renderer
const personaRenderer: CustomRenderer<PersonaCell> = {
  kind: GridCellKind.Custom,
  isMatch: (cell): cell is PersonaCell =>
    cell.kind === GridCellKind.Custom && (cell.data as PersonaCell['data']).kind === 'persona',
  draw: (args, cell) => {
    const { ctx, rect, theme, cellFillColor, col, row, imageLoader, requestAnimationFrame } = args
    if (cellFillColor) {
      ctx.fillStyle = cellFillColor
      // Leave 1px gutter so the grid borders remain visible
      ctx.fillRect(rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2)
    }

    const size = Math.min(rect.height - 14, 40)
    const radius = size / 2
    const offsetX = rect.x + 10
    const offsetY = rect.y + rect.height / 2 - radius

    const avatarUrl = cell.data.avatar
    if (avatarUrl) {
      const image = imageLoader.loadOrGetImage(avatarUrl, col, row)
      if (!image) {
        requestAnimationFrame()
      } else {
        ctx.save()
        ctx.beginPath()
        ctx.arc(offsetX + radius, offsetY + radius, radius, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(image, offsetX, offsetY, size, size)
        ctx.restore()
      }
    }

    ctx.fillStyle = theme.textDark
    ctx.font = '600 15px ' + theme.fontFamily
    ctx.textBaseline = 'middle'
    ctx.fillText(cell.data.name, offsetX + size + 12, rect.y + rect.height / 2)
  },
}

type ColFieldDef = { header: string; get: (r: EmployeeRow) => string }
const COLUMN_FIELD_MAP: Record<string, ColFieldDef> = {
  id: { header: 'ID', get: (r) => String(r.id) },
  email: { header: 'Email', get: (r) => r.email },
  firstName: { header: 'First Name', get: (r) => r.firstName },
  lastName: { header: 'Last Name', get: (r) => r.lastName },
  optIn: { header: 'Opt-In', get: (r) => String(r.optIn) },
  title: { header: 'Title', get: (r) => r.title },
  website: { header: 'Website', get: (r) => r.website },
  hiredAt: { header: 'Hired At', get: (r) => format(r.hiredAt, 'yyyy-MM-dd') },
  tags: { header: 'Tags', get: (r) => r.tags.join(';') },
  manager: { header: 'Manager', get: (r) => r.manager.name },
}

// CSV export helper — only exports currently visible columns
function exportCSV(rows: EmployeeRow[], visibleColIds: string[]) {
  const cols = visibleColIds.map((id) => COLUMN_FIELD_MAP[id]).filter(Boolean)
  const headers = cols.map((c) => c.header)
  const lines = rows.map((r) => cols.map((c) => `"${c.get(r).replace(/"/g, '""')}"`).join(','))
  const csv = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'employees.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const toolbarButtonClass =
  'rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition motion-safe:hover:-translate-y-[1px] hover:border-slate-300 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2'

type EmployeeGridProps = {
  rows: EmployeeRow[]
}

export function EmployeeGrid({ rows }: EmployeeGridProps) {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light')
  const grid = useEmployeeGrid(rows, themeMode)

  // Theme toggle — also syncs Tailwind dark class on <html>
  const toggleTheme = useCallback(() => {
    const next = themeMode === 'light' ? 'dark' : 'light'
    setThemeMode(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }, [themeMode])

  const customRenderers = useMemo(() => [sparklineRenderer, personaRenderer, tagsRenderer], [])
  const [sortMenu, setSortMenu] = useState<{ col: number; x: number; y: number; columnId: ColumnId } | null>(null)

  // Grid selection state for row checkboxes
  const [gridSelection, setGridSelection] = useState<GridSelection>({
    columns: CompactSelection.empty(),
    rows: CompactSelection.empty(),
  })

  const handleGridSelectionChange = useCallback((newSelection: GridSelection) => {
    setGridSelection(newSelection)
  }, [])

  const selectedCount = gridSelection.rows ? Array.from(gridSelection.rows).length : 0

  // Feature 2: Column visibility — track hidden column IDs
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set())

  const toggleColumn = useCallback((colId: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev)
      if (next.has(colId)) {
        next.delete(colId)
      } else {
        if (next.size >= employeeColumns.length - 1) return prev // keep at least 1 visible
        next.add(colId)
      }
      return next
    })
  }, [])

  // Feature 4: Sort indicator — append ↑/↓ to sorted column title
  const displayColumns = useMemo(
    () =>
      grid.columns
        .filter((col) => !hiddenColumns.has(col.id as string))
        .map((col) => {
          if (col.id !== grid.sortState.columnId) return col
          const arrow = grid.sortState.direction === 'asc' ? ' ↑' : ' ↓'
          return { ...col, title: col.title + arrow }
        }),
    [grid.columns, grid.sortState, hiddenColumns]
  )

  // Feature 5: Row highlight — dim opted-out rows via getRowThemeOverride
  const getRowThemeOverride = useCallback(
    (row: number) => {
      const r = grid.sortedRows[row]
      if (!r || r.optIn) return undefined
      return themeMode === 'dark'
        ? { bgCell: '#141418' as string, textDark: '#6b7280' as string }
        : { bgCell: '#f9fafb' as string, textDark: '#9ca3af' as string }
    },
    [grid.sortedRows, themeMode]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-slate-600">
          {selectedCount > 0 && (
            <span className="font-medium">
              {selectedCount} row{selectedCount !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Feature 2: Column visibility toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={toolbarButtonClass} aria-label="Toggle column visibility">
                Columns{hiddenColumns.size > 0 ? ` (${hiddenColumns.size} hidden)` : ''}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52 p-2" align="end">
              <DropdownMenuLabel className="text-xs uppercase tracking-wide text-slate-500">Show / Hide</DropdownMenuLabel>
              <div className="mt-1 space-y-0.5">
                {employeeColumns.map((col) => (
                  <label
                    key={col.id}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <input
                      type="checkbox"
                      checked={!hiddenColumns.has(col.id as string)}
                      onChange={() => toggleColumn(col.id as string)}
                      className="accent-slate-800"
                    />
                    {col.title}
                  </label>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Feature 3: Export CSV */}
          <button
            type="button"
            onClick={() => exportCSV(grid.sortedRows, displayColumns.map((c) => c.id as string))}
            className={toolbarButtonClass}
            aria-label="Export grid data as CSV"
          >
            Export CSV
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={toolbarButtonClass}
          >
            Theme: {themeMode === 'light' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      <DataGridWrapper
        rows={grid.sortedRows}
        columns={displayColumns}
        theme={grid.theme}
        getCellContent={grid.getCellContent}
        getCellsForSelection={grid.getCellsForSelection}
        onCellEdited={grid.onCellEdited}
        gridSelection={gridSelection}
        onGridSelectionChange={handleGridSelectionChange}
        rangeSelect="cell"
        rowSelect="multi"
        rowSelectionMode="multi"
        sortState={grid.sortState}
        setSort={grid.setSort}
        addRow={grid.addRow}
        deleteRows={(indices) => {
          grid.deleteRows(indices)
          setGridSelection({ columns: CompactSelection.empty(), rows: CompactSelection.empty() })
        }}
        customRenderers={customRenderers}
        onColumnResize={grid.onColumnResize}
        height="80vh"
        width="100%"
        showFooterSummary={true}
        excludeFooterColumns={['manager', 'tags']}
        freezeColumns={2}
        themeVariant={themeMode}
        getRowThemeOverride={getRowThemeOverride}
        onHeaderMenuClick={(col, screenRect) => {
          const columnId = displayColumns[col]?.id as ColumnId | undefined
          if (!columnId) return
          const x = screenRect.x + screenRect.width
          const y = screenRect.y + screenRect.height
          setSortMenu({ col, x, y, columnId })
        }}
      />

      {sortMenu ? (
        <div
          className="fixed z-50"
          style={{ left: sortMenu.x + 8, top: sortMenu.y + 8 }}
          onMouseLeave={() => setSortMenu(null)}
        >
          <SortMenu
            columnId={sortMenu.columnId}
            current={grid.sortState.columnId === sortMenu.columnId ? grid.sortState.direction : null}
            onChange={(colId, dir) => {
              grid.setSort(colId, dir)
              setSortMenu(null)
            }}
          />
        </div>
      ) : null}
    </div>
  )
}
