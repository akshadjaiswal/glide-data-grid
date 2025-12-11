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

import type { EmployeeRow } from '@/lib/data/employees'
import { useEmployeeGrid } from '@/hooks/use-employee-grid'
import { SortMenu } from './sort-menu'
import type { ColumnId } from './employee-grid-config'
import { tagsRenderer } from './tags-cell-renderer'
import { DataGridWrapper } from './data-grid-wrapper'

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

type EmployeeGridProps = {
  rows: EmployeeRow[]
}

export function EmployeeGrid({ rows }: EmployeeGridProps) {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light')
  const grid = useEmployeeGrid(rows, themeMode)
  const customRenderers = useMemo(() => [sparklineRenderer, personaRenderer, tagsRenderer], [])
  const [sortMenu, setSortMenu] = useState<{ col: number; x: number; y: number; columnId: ColumnId } | null>(null)

  // Grid selection state for row checkboxes
  const [gridSelection, setGridSelection] = useState<GridSelection>({
    columns: CompactSelection.empty(),
    rows: CompactSelection.empty(),
  })

  // Handle grid selection change
  const handleGridSelectionChange = useCallback((newSelection: GridSelection) => {
    setGridSelection(newSelection)

    // Optional: extract selected rows for debugging or external use
    const selectedRows: EmployeeRow[] = []
    if (newSelection.rows) {
      const rowsArray = Array.from(newSelection.rows)
      rowsArray.forEach((rowIndex) => {
        if (grid.sortedRows[rowIndex]) {
          selectedRows.push(grid.sortedRows[rowIndex])
        }
      })
    }

    // You can use selectedRows here or pass to parent component
    if (selectedRows.length > 0) {
      console.log('Selected rows:', selectedRows)
    }
  }, [grid.sortedRows])

  // Calculate selected count for display
  const selectedCount = gridSelection.rows ? Array.from(gridSelection.rows).length : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-slate-600">
          {selectedCount > 0 && (
            <span className="font-medium">
              {selectedCount} row{selectedCount !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-slate-300 hover:shadow"
        >
          Theme: {themeMode === 'light' ? 'Light' : 'Dark'}
        </button>
      </div>
      <DataGridWrapper
        rows={grid.sortedRows}
        columns={grid.columns}
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
        deleteRows={grid.deleteRows}
        customRenderers={customRenderers}
        onColumnResize={grid.onColumnResize}
        height="80vh"
        width="100%"
        showFooterSummary={true}
        excludeFooterColumns={['manager', 'tags']}
        freezeColumns={2}
        themeVariant={themeMode}
        onHeaderMenuClick={(col, screenRect) => {
          const columnId = grid.columns[col]?.id as ColumnId | undefined
          if (!columnId) return
          const x = screenRect.x + screenRect.width
          const y = screenRect.y + screenRect.height
          setSortMenu({ col, x, y, columnId })
        }}
      />
      {sortMenu ? (
        <div
          className="fixed z-[9999]"
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
