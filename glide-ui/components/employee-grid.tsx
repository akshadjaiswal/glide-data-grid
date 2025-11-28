'use client'

import { useCallback, useMemo } from 'react'
import {
  DataEditor,
  GridCellKind,
  type CustomCell,
  type CustomRenderer,
  getDefaultTheme,
  type GridCell,
  type GridColumn,
  GridColumnIcon,
  type Item,
  type Rectangle,
  type Theme,
} from '@glideapps/glide-data-grid'
import '@glideapps/glide-data-grid/dist/index.css'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { format } from 'date-fns'

import type { EmployeeRow } from '@/lib/data/employees'

/* ============================================================================
   Custom Cell Types
============================================================================ */

type SparklineCell = CustomCell<{
  kind: 'sparkline'
  values: readonly number[]
  color: string
}>

type PersonaCell = CustomCell<{
  kind: 'persona'
  name: string
  avatar: string
}>

/* ============================================================================
   Sparkline Renderer
============================================================================ */

const sparklineRenderer: CustomRenderer<SparklineCell> = {
  kind: GridCellKind.Custom,
  isMatch: (cell): cell is SparklineCell =>
    cell.kind === GridCellKind.Custom &&
    (cell.data as SparklineCell['data']).kind === 'sparkline',

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
      const x =
        rect.x +
        paddingX +
        (index / Math.max(values.length - 1, 1)) * usableWidth

      const y =
        rect.y +
        paddingY +
        usableHeight -
        ((value - min) / span) * usableHeight

      index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })

    ctx.strokeStyle = color || theme.accentColor
    ctx.lineWidth = 1.4
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.stroke()

    // Light fill highlight
    ctx.lineTo(rect.x + paddingX + usableWidth, rect.y + rect.height - paddingY)
    ctx.lineTo(rect.x + paddingX, rect.y + rect.height - paddingY)
    ctx.closePath()
    ctx.globalAlpha = 0.08
    ctx.fillStyle = color || theme.accentColor
    ctx.fill()
    ctx.globalAlpha = 1
  },
}

/* ============================================================================
   Persona Renderer
============================================================================ */

const personaRenderer: CustomRenderer<PersonaCell> = {
  kind: GridCellKind.Custom,
  isMatch: (cell): cell is PersonaCell =>
    cell.kind === GridCellKind.Custom &&
    (cell.data as PersonaCell['data']).kind === 'persona',

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
    ctx.font = `600 15px ${theme.fontFamily}`
    ctx.textBaseline = 'middle'
    ctx.fillText(cell.data.name, offsetX + size + 12, rect.y + rect.height / 2)
  },
}

/* ============================================================================
   Theme Overrides
============================================================================ */

const gridThemeOverrides: Partial<Theme> = {
  accentColor: '#4f46e5',
  accentLight: '#eef2ff',
  accentFg: '#ffffff',
  textDark: '#0f172a',
  textMedium: '#334155',
  textLight: '#64748b',
  textBubble: '#0f172a',
  textHeader: '#111827',
  textGroupHeader: '#0f172a',
  textHeaderSelected: '#111827',
  bgCell: '#ffffff',
  bgCellMedium: '#f8fafc',
  bgHeader: '#f6f7fb',
  bgHeaderHasFocus: '#eef2ff',
  bgHeaderHovered: '#eef2ff',
  bgBubble: '#e5e7eb',
  bgBubbleSelected: '#e5e7eb',
  bgSearchResult: '#fef9c3',
  borderColor: '#e5e7eb',
  drilldownBorder: '#e5e7eb',
  linkColor: '#2563eb',
  cellHorizontalPadding: 18,
  cellVerticalPadding: 16,
  headerFontStyle:
    '600 40px "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  headerIconSize: 18,
  baseFontStyle:
    '400 18px "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  markerFontStyle:
    '600 16px "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  editorFontSize: '18px',
  lineHeight: 1.35,
  horizontalBorderColor: '#e5e7eb',
  headerBottomBorderColor: '#e5e7eb',
  resizeIndicatorColor: '#94a3b8',
  bgIconHeader: '#e2e8f0',
  fgIconHeader: '#475569',
  roundingRadius: 8,
}

/* ============================================================================
   Component
============================================================================ */

type EmployeeGridProps = {
  rows: EmployeeRow[]
}

export function EmployeeGrid({ rows }: EmployeeGridProps) {
  const theme = useMemo(() => {
    const base = getDefaultTheme()
    const merged = { ...base, ...gridThemeOverrides }

    return {
      ...merged,
      baseFontFull: merged.baseFontStyle,
      headerFontFull: merged.headerFontStyle,
      markerFontFull: merged.markerFontStyle,
    }
  }, [])

  const columns = useMemo<readonly GridColumn[]>(() => {
    const icon = GridColumnIcon

    return [
      { id: 'email', title: 'Email', group: 'ID', width: 240, icon: icon.HeaderEmail, hasMenu: true },
      { id: 'firstName', title: 'First name', group: 'Name', width: 140, icon: icon.HeaderString },
      { id: 'lastName', title: 'Last name', group: 'Name', width: 160, icon: icon.HeaderString },
      { id: 'optIn', title: 'Opt-In', group: 'Info', width: 88, icon: icon.HeaderBoolean },
      { id: 'title', title: 'Title', group: 'Info', width: 240, icon: icon.HeaderString, grow: 1 },
      { id: 'website', title: 'More Info', group: 'Info', width: 220, icon: icon.HeaderUri },
      { id: 'performance', title: 'Performance', group: 'Performance', width: 220, icon: icon.HeaderNumber },
      { id: 'manager', title: 'Manager', group: 'Employment Data', width: 240, icon: icon.HeaderImage },
      { id: 'hiredAt', title: 'Hired', group: 'Employment Data', width: 160, icon: icon.HeaderDate },
    ]
  }, [])

  const getCellContent = useCallback(
    (cell: Item): GridCell => {
      const [col, row] = cell
      const rowData = rows[row]

      if (!rowData) {
        return { kind: GridCellKind.Loading, allowOverlay: false }
      }

      const columnId = columns[col]?.id

      switch (columnId) {
        case 'email':
          return {
            kind: GridCellKind.Uri,
            data: rowData.email,
            displayData: rowData.email,
            allowOverlay: false,
            hoverEffect: true,
          }

        case 'firstName':
          return {
            kind: GridCellKind.Text,
            data: rowData.firstName,
            displayData: rowData.firstName,
            allowOverlay: true,
          }

        case 'lastName':
          return {
            kind: GridCellKind.Text,
            data: rowData.lastName,
            displayData: rowData.lastName,
            allowOverlay: true,
          }

        case 'optIn':
          return {
            kind: GridCellKind.Boolean,
            data: rowData.optIn,
            allowOverlay: false,
            readonly: true,
          }

        case 'title':
          return {
            kind: GridCellKind.Text,
            data: rowData.title,
            displayData: rowData.title,
            allowOverlay: true,
          }

        case 'website':
          return {
            kind: GridCellKind.Uri,
            data: rowData.website,
            displayData: rowData.website.replace(/^https?:\/\//, ''),
            allowOverlay: false,
            hoverEffect: true,
          }

        case 'performance':
          return {
            kind: GridCellKind.Custom,
            allowOverlay: false,
            data: {
              kind: 'sparkline',
              values: rowData.performance.values,
              color: rowData.performance.color,
            },
            copyData: rowData.performance.values.map((v) => v.toFixed(2)).join(', '),
          } as SparklineCell

        case 'manager':
          return {
            kind: GridCellKind.Custom,
            allowOverlay: false,
            data: {
              kind: 'persona',
              name: rowData.manager.name,
              avatar: rowData.manager.avatar,
            },
            copyData: rowData.manager.name,
          } as PersonaCell

        case 'hiredAt':
          const date = format(rowData.hiredAt, 'EEE MMM dd yyyy')
          return {
            kind: GridCellKind.Text,
            data: date,
            displayData: date,
            allowOverlay: false,
          }

        default:
          return {
            kind: GridCellKind.Text,
            data: '',
            displayData: '',
            allowOverlay: false,
          }
      }
    },
    [columns, rows]
  )

  const getCellsForSelection = useCallback(
    (selection: Rectangle) => {
      const output: GridCell[][] = []
      const { x, y, width, height } = selection

      for (let r = 0; r < height; r++) {
        const row = y + r
        const rowCells: GridCell[] = []

        for (let c = 0; c < width; c++) {
          rowCells.push(getCellContent([x + c, row]))
        }

        output.push(rowCells)
      }

      return output
    },
    [getCellContent]
  )

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <DataEditor
        columns={columns}
        rows={rows.length}
        getCellContent={getCellContent}
        getCellsForSelection={getCellsForSelection}
        rowHeight={50}
        headerHeight={52}
        groupHeaderHeight={42}
        rowMarkers="both"
        rowMarkerStartIndex={1}
        freezeColumns={2}
        smoothScrollX
        smoothScrollY
        overscrollX={160}
        overscrollY={40}
        theme={theme}
        customRenderers={[sparklineRenderer, personaRenderer]}
        height="80vh"
        width="100%"
      />
    </div>
  )
}
