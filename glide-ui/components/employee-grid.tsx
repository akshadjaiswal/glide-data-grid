'use client'

import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import {
  GridCellKind,
  CompactSelection,
  type CustomCell,
  type CustomRenderer,
  type DrawCellCallback,
  type DrawHeaderCallback,
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
import { createDropdownEditor, TITLE_OPTIONS } from './editors/dropdown-overlay-editor'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type SparklineCell = CustomCell<{ kind: 'sparkline'; values: readonly number[]; color: string }>
type PersonaCell = CustomCell<{ kind: 'persona'; name: string; avatar: string }>

// Column group colors for drawHeader accent bars
const GROUP_ACCENT_COLORS: Record<string, string> = {
  'ID': '#2F8BFF',
  'Name': '#8B5CF6',
  'Info': '#10B981',
  'Performance': '#F59E0B',
  'Employment Data': '#EC4899',
}

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

// Custom title dropdown renderer — renders the value as a colored pill
type TitleDropdownCell = CustomCell<{ kind: 'title-dropdown'; value: string }>

const titleDropdownRenderer: CustomRenderer<TitleDropdownCell> = {
  kind: GridCellKind.Custom,
  isMatch: (cell): cell is TitleDropdownCell =>
    cell.kind === GridCellKind.Custom && (cell.data as any).kind === 'title-dropdown',
  draw: (args, cell) => {
    const { ctx, rect, theme, cellFillColor } = args
    if (cellFillColor) {
      ctx.fillStyle = cellFillColor
      ctx.fillRect(rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2)
    }

    const value = cell.data.value
    if (!value) return

    const option = TITLE_OPTIONS.find((o) => o.value === value)
    const pillBg = option?.color.bg ?? theme.accentColor
    const pillText = option?.color.text ?? '#ffffff'

    const paddingX = 8
    const pillH = 22
    const pillY = rect.y + (rect.height - pillH) / 2
    const textMetrics = ctx.measureText(value)
    const pillW = Math.min(textMetrics.width + 20, rect.width - paddingX * 2)
    const pillX = rect.x + paddingX

    ctx.save()
    ctx.beginPath()
    const r = pillH / 2
    ctx.moveTo(pillX + r, pillY)
    ctx.lineTo(pillX + pillW - r, pillY)
    ctx.arcTo(pillX + pillW, pillY, pillX + pillW, pillY + pillH, r)
    ctx.lineTo(pillX + pillW, pillY + pillH - r)
    ctx.arcTo(pillX + pillW, pillY + pillH, pillX + r, pillY + pillH, r)
    ctx.lineTo(pillX + r, pillY + pillH)
    ctx.arcTo(pillX, pillY + pillH, pillX, pillY, r)
    ctx.lineTo(pillX, pillY + r)
    ctx.arcTo(pillX, pillY, pillX + r, pillY, r)
    ctx.closePath()
    ctx.fillStyle = pillBg
    ctx.fill()

    ctx.fillStyle = pillText
    ctx.font = '600 11px ' + theme.fontFamily
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'

    // Clip text to pill width
    ctx.save()
    ctx.rect(pillX + 8, pillY, pillW - 16, pillH)
    ctx.clip()
    ctx.fillText(value, pillX + 8, pillY + pillH / 2)
    ctx.restore()

    ctx.restore()
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

const toolbarButtonActivClass =
  'rounded-lg border border-slate-900 bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition motion-safe:hover:-translate-y-[1px] hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2'

type ContextMenuState = {
  x: number
  y: number
  col: number
  row: number
}

type EmployeeGridProps = {
  rows: EmployeeRow[]
}

export function EmployeeGrid({ rows }: EmployeeGridProps) {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light')
  const grid = useEmployeeGrid(rows, themeMode)

  const toggleTheme = useCallback(() => {
    const next = themeMode === 'light' ? 'dark' : 'light'
    setThemeMode(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }, [themeMode])

  // Dropdown provideEditor for title column
  const provideEditor = useMemo(
    () => createDropdownEditor(TITLE_OPTIONS, 'title-dropdown', 'value'),
    []
  )

  const customRenderers = useMemo(
    () => [sparklineRenderer, personaRenderer, tagsRenderer, titleDropdownRenderer],
    []
  )

  const [sortMenu, setSortMenu] = useState<{ col: number; x: number; y: number; columnId: ColumnId } | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  const [gridSelection, setGridSelection] = useState<GridSelection>({
    columns: CompactSelection.empty(),
    rows: CompactSelection.empty(),
  })

  const handleGridSelectionChange = useCallback((newSelection: GridSelection) => {
    setGridSelection(newSelection)
  }, [])

  const selectedCount = gridSelection.rows ? Array.from(gridSelection.rows).length : 0

  // Column visibility
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set())

  const toggleColumn = useCallback((colId: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev)
      if (next.has(colId)) {
        next.delete(colId)
      } else {
        if (next.size >= employeeColumns.length - 1) return prev
        next.add(colId)
      }
      return next
    })
  }, [])

  // Sort indicator — append ↑/↓ to sorted column title
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

  // Row highlight — dim opted-out rows
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

  // drawCell — overdraw trend arrows on sparkline cells
  const drawCell: DrawCellCallback = useCallback((args, draw) => {
    draw()
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

  // drawHeader — colored accent bar at bottom of each column header by group
  const drawHeader: DrawHeaderCallback = useCallback((args, draw) => {
    draw()
    const { ctx, rect, column } = args
    const group = column.group
    if (!group) return
    const color = GROUP_ACCENT_COLORS[group]
    if (!color) return

    ctx.save()
    ctx.fillStyle = color
    ctx.fillRect(rect.x + 2, rect.y + rect.height - 3, rect.width - 4, 3)
    ctx.restore()
  }, [])

  // Keyboard shortcut: Cmd/Ctrl+Enter to add row
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

  // Context menu click-outside dismiss
  useEffect(() => {
    if (!contextMenu) return
    const onDown = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [contextMenu])

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

  const handleDeleteFromContext = useCallback(() => {
    if (contextMenu === null) return
    grid.deleteRows([contextMenu.row])
    setGridSelection({ columns: CompactSelection.empty(), rows: CompactSelection.empty() })
    setContextMenu(null)
  }, [contextMenu, grid])

  const handleCopyEmailFromContext = useCallback(() => {
    if (contextMenu === null) return
    const row = grid.sortedRows[contextMenu.row]
    if (row) {
      navigator.clipboard.writeText(row.email).catch(() => {})
    }
    setContextMenu(null)
  }, [contextMenu, grid.sortedRows])

  const isDark = themeMode === 'dark'
  const menuBg = isDark ? '#18181b' : '#ffffff'
  const menuBorder = isDark ? '#3f3f46' : '#e5e7eb'
  const menuText = isDark ? '#e4e4e7' : '#374151'
  const menuHover = isDark ? '#27272a' : '#f9fafb'
  const menuDangerText = '#ef4444'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          {selectedCount > 0 && (
            <span className="font-medium">
              {selectedCount} row{selectedCount !== 1 ? 's' : ''} selected
            </span>
          )}
          <span className="hidden text-xs text-slate-400 sm:inline">
            ⌘↵ Add row
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Column visibility toggle */}
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

          {/* Export CSV */}
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
            className={isDark ? toolbarButtonActivClass : toolbarButtonClass}
          >
            {isDark ? 'Dark' : 'Light'}
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
        onCellContextMenu={handleCellContextMenu}
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
        provideEditor={provideEditor}
        drawCell={drawCell}
        drawHeader={drawHeader}
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

      {/* Right-click context menu */}
      {contextMenu ? (
        <div
          ref={contextMenuRef}
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: menuBg,
            border: `1px solid ${menuBorder}`,
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            minWidth: '180px',
            padding: '6px',
            zIndex: 9999,
          }}
        >
          <button
            type="button"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              width: '100%', padding: '8px 12px', borderRadius: '6px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: menuText, fontSize: '13px', textAlign: 'left',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = menuHover }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            onClick={() => { grid.addRow(); setContextMenu(null) }}
          >
            + Add row below
          </button>
          <button
            type="button"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              width: '100%', padding: '8px 12px', borderRadius: '6px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: menuText, fontSize: '13px', textAlign: 'left',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = menuHover }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            onClick={handleCopyEmailFromContext}
          >
            Copy email
          </button>
          <div style={{ height: '1px', background: menuBorder, margin: '4px 8px' }} />
          <button
            type="button"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              width: '100%', padding: '8px 12px', borderRadius: '6px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: menuDangerText, fontSize: '13px', textAlign: 'left',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = menuHover }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            onClick={handleDeleteFromContext}
          >
            Delete row
          </button>
        </div>
      ) : null}
    </div>
  )
}
