'use client'

import { useMemo, useState } from 'react'
import {
  DataEditor,
  GridCellKind,
  type CustomCell,
  type CustomRenderer,
} from '@glideapps/glide-data-grid'
import '@glideapps/glide-data-grid/dist/index.css'
import 'react-responsive-carousel/lib/styles/carousel.min.css'

import type { EmployeeRow } from '@/lib/data/employees'
import { useEmployeeGrid } from '@/hooks/use-employee-grid'
import { SortMenu } from './sort-menu'
import type { ColumnId } from './employee-grid-config'
import { tagsRenderer } from './tags-cell-renderer'

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
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
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
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
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
  const grid = useEmployeeGrid(rows)
  const customRenderers = useMemo(() => [sparklineRenderer, personaRenderer, tagsRenderer], [])
  const [sortMenu, setSortMenu] = useState<{ col: number; x: number; y: number; columnId: ColumnId } | null>(null)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <DataEditor
        columns={grid.columns}
        rows={grid.rows.length}
        getCellContent={grid.getCellContent}
        getCellsForSelection={grid.getCellsForSelection}
        onCellEdited={grid.onCellEdited}
        onHeaderMenuClick={(col, _screenRect) => {
          const columnId = grid.columns[col]?.id as ColumnId | undefined
          if (!columnId) return
          // Use screenRect to position menu near header
          const x = _screenRect.x + _screenRect.width
          const y = _screenRect.y + _screenRect.height
          setSortMenu({ col, x, y, columnId })
        }}
        rowHeight={72}
        headerHeight={60}
        groupHeaderHeight={48}
        rowMarkers="both"
        rowMarkerStartIndex={1}
        freezeColumns={2}
        smoothScrollX
        smoothScrollY
        overscrollX={160}
        overscrollY={40}
        theme={grid.theme}
        customRenderers={customRenderers}
        height="80vh"
        width="100%"
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
