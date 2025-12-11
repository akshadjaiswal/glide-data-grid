'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  DataEditor,
  type CustomRenderer,
  type GridCell,
  type GridColumn,
  type ProvideEditorCallback,
} from '@glideapps/glide-data-grid'
import type { Item, EditableGridCell, Rectangle } from '@glideapps/glide-data-grid'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type AggregationType =
  | 'countEmpty'
  | 'countFilled'
  | 'percentEmpty'
  | 'percentFilled'
  | 'sum'
  | 'average'
  | 'min'
  | 'max'
  | 'none'

const NUMERIC_AGG_OPTIONS: { label: string; value: AggregationType }[] = [
  { label: 'Count empty', value: 'countEmpty' },
  { label: 'Count filled', value: 'countFilled' },
  { label: 'Percent empty', value: 'percentEmpty' },
  { label: 'Percent filled', value: 'percentFilled' },
  { label: 'Sum', value: 'sum' },
  { label: 'Average', value: 'average' },
  { label: 'Min', value: 'min' },
  { label: 'Max', value: 'max' },
]

const NON_NUMERIC_AGG_OPTIONS: { label: string; value: AggregationType }[] = [
  { label: 'Count empty', value: 'countEmpty' },
  { label: 'Count filled', value: 'countFilled' },
  { label: 'Percent empty', value: 'percentEmpty' },
  { label: 'Percent filled', value: 'percentFilled' },
]

export type DataGridWrapperProps<T extends { id: number }> = {
  rows: T[]
  columns: readonly GridColumn[]
  theme: any
  getCellContent: (cell: Item) => GridCell
  getCellsForSelection: (selection: Rectangle) => GridCell[][]
  onCellEdited: (cell: Item, newValue: EditableGridCell) => void
  onCellClicked?: (cell: Item) => void
  gridSelection?: any
  onGridSelectionChange?: (selection: any) => void
  rangeSelect?: 'rect' | 'cell' | 'multi-cell' | 'multi-rect'
  rowSelect?: 'none' | 'single' | 'multi'
  rowSelectionMode?: 'auto' | 'multi'
  sortState: { columnId: string | null; direction: 'asc' | 'desc' | null }
  setSort: (columnId: string, direction: 'asc' | 'desc' | null) => void
  addRow: () => void
  deleteRows: (indices: number[]) => void
  customRenderers: readonly CustomRenderer<any>[]
  provideEditor?: ProvideEditorCallback<any>
  onColumnResize?: (column: GridColumn, newSize: number, columnIndex: number) => void
  getRowValue?: (row: any, column: GridColumn) => unknown
  height?: string
  width?: string
  className?: string
  showFooterSummary?: boolean
  excludeFooterColumns?: string[]
  freezeColumns?: number
  onHeaderMenuClick?: (col: number, screenRect: Rectangle) => void
  themeVariant?: 'light' | 'dark'
}

export function DataGridWrapper<T extends { id: number }>({
  rows,
  columns,
  theme,
  getCellContent,
  getCellsForSelection,
  onCellEdited,
  onCellClicked,
  gridSelection,
  onGridSelectionChange,
  rangeSelect = 'rect',
  rowSelect = 'none',
  rowSelectionMode = 'auto',
  sortState,
  setSort,
  addRow,
  deleteRows,
  customRenderers,
  provideEditor,
  onColumnResize,
  getRowValue,
  height = '75vh',
  width = '100%',
  className = '',
  showFooterSummary = true,
  excludeFooterColumns = [],
  freezeColumns = 2,
  onHeaderMenuClick,
  themeVariant = 'light',
}: DataGridWrapperProps<T>) {
  const memoizedRenderers = useMemo(() => customRenderers, [customRenderers])
  const rowMarkerTheme = useMemo(
    () => ({
      borderColor: 'transparent',
      horizontalBorderColor: 'transparent',
      drilldownBorder: 'transparent',
    }),
    []
  )
  const [columnAggregations, setColumnAggregations] = useState<Record<string, AggregationType>>({})
  const [visibleRange, setVisibleRange] = useState<{ x: number; width: number; tx: number }>({
    x: 0,
    width: columns.length,
    tx: 0,
  })
  const freezeColumnsCount = Math.max(0, freezeColumns)

  const resolvedHeight = height ?? '75vh'
  const headerHeightPx = 40
  const groupHeaderHeightPx = 32
  const rowMarkerWidth = useMemo(() => {
    const count = rows.length
    if (count > 10000) return 48
    if (count > 1000) return 44
    if (count > 100) return 36
    return 32
  }, [rows.length])

  const getColWidth = useCallback((col: GridColumn) => {
    const maybeWidth = (col as any)?.width
    return typeof maybeWidth === 'number' ? maybeWidth : 150
  }, [])

  const frozenColumns = useMemo(() => columns.slice(0, freezeColumnsCount), [columns, freezeColumnsCount])
  const scrollingColumns = useMemo(() => columns.slice(freezeColumnsCount), [columns, freezeColumnsCount])
  const frozenWidths = useMemo(() => frozenColumns.map(getColWidth), [frozenColumns, getColWidth])
  const scrollingWidths = useMemo(() => scrollingColumns.map(getColWidth), [scrollingColumns, getColWidth])

  const visibleScrollingSlice = useMemo(() => {
    const start = Math.max(0, visibleRange.x - freezeColumnsCount)
    const end = start + visibleRange.width
    return {
      cols: scrollingColumns.slice(start, end),
      widths: scrollingWidths.slice(start, end),
    }
  }, [scrollingColumns, scrollingWidths, visibleRange, freezeColumnsCount])

  const scrollingFooterTemplate = useMemo(
    () => visibleScrollingSlice.widths.map((w) => `${w}px`).join(' '),
    [visibleScrollingSlice]
  )

  const footerButtonClasses =
    'flex h-full w-full items-center justify-center rounded-md px-1 text-[13px] font-medium text-foreground transition hover:bg-muted leading-none truncate'

  const isNumericColumn = useCallback(
    (col: GridColumn | undefined) => {
      if (!col) return false

      // Hint from icon
      if ((col as any).icon === 'headerNumber' || (col as any).icon === 5) {
        return true
      }

      const colId = col.id as string | number | undefined
      if (!colId) return false

      for (const row of rows) {
        const val = getRowValue ? getRowValue(row, col) : (row as any)[colId]
        if (typeof val === 'number' && !Number.isNaN(val)) return true
      }
      return false
    },
    [getRowValue, rows]
  )

  const formatNumber = useCallback((value: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)
  }, [])

  const computeAggregation = useCallback(
    (col: GridColumn, type: AggregationType, numeric: boolean): string | null => {
      const colId = col.id as string | number | undefined
      if (!colId || type === 'none') return null

      const values = rows.map((row) => (getRowValue ? getRowValue(row, col) : (row as any)[colId]))
      const total = values.length

      if (numeric) {
        const numericVals = values.filter((v) => typeof v === 'number' && !Number.isNaN(v)) as number[]
        const filled = numericVals.length
        const empty = total - filled
        if (total === 0) return null

        switch (type) {
          case 'countEmpty':
            return `${empty}`
          case 'countFilled':
            return `${filled}`
          case 'percentEmpty':
            return `${((empty / total) * 100).toFixed(1)}%`
          case 'percentFilled':
            return `${((filled / total) * 100).toFixed(1)}%`
          case 'sum': {
            const sum = numericVals.reduce((acc, v) => acc + v, 0)
            return formatNumber(sum)
          }
          case 'average': {
            if (filled === 0) return null
            const sum = numericVals.reduce((acc, v) => acc + v, 0)
            return formatNumber(sum / filled)
          }
          case 'min': {
            if (filled === 0) return null
            return formatNumber(Math.min(...numericVals))
          }
          case 'max': {
            if (filled === 0) return null
            return formatNumber(Math.max(...numericVals))
          }
          default:
            return null
        }
      }

      // Non-numeric: only count/percent
      const filled = values.filter((v) => v !== undefined && v !== null && v !== '').length
      const empty = total - filled
      if (total === 0) return null

      switch (type) {
        case 'countEmpty':
          return `${empty}`
        case 'countFilled':
          return `${filled}`
        case 'percentEmpty':
          return `${((empty / total) * 100).toFixed(1)}%`
        case 'percentFilled':
          return `${((filled / total) * 100).toFixed(1)}%`
        default:
          return null
      }
    },
    [formatNumber, rows, getRowValue]
  )

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg ${className}`}
      style={{ height: resolvedHeight, width }}
    >
      <div className="flex-1 min-h-0">
        <DataEditor
          columns={columns}
          rows={rows.length}
          getCellContent={getCellContent}
          getCellsForSelection={getCellsForSelection}
          onCellEdited={onCellEdited}
          onCellClicked={onCellClicked}
          gridSelection={gridSelection}
          onGridSelectionChange={onGridSelectionChange}
          rangeSelect={rangeSelect}
          rowSelect={rowSelect}
          rowSelectionMode={rowSelectionMode}
          provideEditor={provideEditor}
          onHeaderMenuClick={onHeaderMenuClick}
          rowHeight={35}
          headerHeight={headerHeightPx}
          groupHeaderHeight={groupHeaderHeightPx}
          rowMarkers="both"
          rowMarkerStartIndex={1}
          rowMarkerTheme={rowMarkerTheme}
          trailingRowOptions={{ hint: 'Add row', sticky: true }}
          onColumnResize={onColumnResize}
          onColumnResizeEnd={onColumnResize}
          onVisibleRegionChanged={(range, tx) => {
            setVisibleRange({
              x: range.x,
              width: range.width,
              tx: tx ?? 0,
            })
          }}
          onRowAppended={() => {
            addRow()
            return undefined
          }}
          onDelete={(selection) => {
            const rowsToDelete = selection.rows?.toArray?.() ?? []
            deleteRows(rowsToDelete)
            return true
          }}
          freezeColumns={freezeColumnsCount}
          smoothScrollX
          smoothScrollY
          overscrollX={160}
          overscrollY={40}
          theme={theme}
          customRenderers={memoizedRenderers}
          height="100%"
          width="100%"
        />
      </div>
      {showFooterSummary && (
        <div className="z-10 flex h-10 shrink-0 border-t border-slate-200 bg-white/95 text-sm text-slate-600 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] backdrop-blur-sm">
          <div
            className="grid h-full shrink-0"
            style={{ gridTemplateColumns: [rowMarkerWidth, ...frozenWidths].map((w) => `${w}px`).join(' ') }}
          >
            <div className="flex h-full items-center justify-center border-r border-transparent px-2">
              <span className="text-sm font-semibold leading-none">{rows.length}</span>
            </div>
            {frozenColumns.map((col, idx) => {
              const colId = col.id as string | number | undefined
              const isExcluded = excludeFooterColumns.includes(colId as string)

              if (isExcluded) {
                return (
                  <div
                    key={col.id ?? idx}
                    className="flex h-full items-center border-r border-transparent px-2 min-w-0"
                  />
                )
              }

              const numeric = isNumericColumn(col)
              const options = numeric ? NUMERIC_AGG_OPTIONS : NON_NUMERIC_AGG_OPTIONS
              const selected = columnAggregations[colId as string] ?? 'none'
              const value = selected ? computeAggregation(col, selected, numeric) : null
              const label = options.find((o) => o.value === selected)?.label ?? ''

              return (
                <div
                  key={col.id ?? idx}
                  className="flex h-full items-center border-r border-transparent px-2 min-w-0"
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={footerButtonClasses}>
                        {value ? (
                          <span className="truncate">
                            {value} {label && <span className="text-muted-foreground lowercase">{label}</span>}
                          </span>
                        ) : (
                          <span className="text-xs font-medium">+ Add calculation</span>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-44">
                      <DropdownMenuLabel>Aggregations</DropdownMenuLabel>
                      {options.map((opt) => (
                        <DropdownMenuItem
                          key={opt.value}
                          onClick={() =>
                            setColumnAggregations((prev) => ({
                              ...prev,
                              [colId as string]: opt.value,
                            }))
                          }
                        >
                          {opt.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
          </div>

          <div className="flex-1 overflow-hidden">
            <div
              className="grid h-full"
              style={{
                gridTemplateColumns: scrollingFooterTemplate,
                transform: `translateX(${visibleRange.tx}px)`,
              }}
            >
              {visibleScrollingSlice.cols.map((col, idx) => {
                const colId = col.id as string | number | undefined
                const isExcluded = excludeFooterColumns.includes(colId as string)

                if (isExcluded) {
                  return (
                    <div
                      key={col.id ?? idx}
                      className="flex h-full items-center border-r border-transparent px-2 min-w-0"
                    />
                  )
                }

                const numeric = isNumericColumn(col)
                const options = numeric ? NUMERIC_AGG_OPTIONS : NON_NUMERIC_AGG_OPTIONS
                const selected = columnAggregations[colId as string] ?? 'none'
                const value = selected ? computeAggregation(col, selected, numeric) : null
                const label = options.find((o) => o.value === selected)?.label ?? ''

                return (
                  <div
                    key={col.id ?? idx}
                    className="flex h-full items-center border-r border-transparent px-2 min-w-0"
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={footerButtonClasses}>
                          {value ? (
                            <span className="truncate">
                              {value} {label && <span className="text-muted-foreground lowercase">{label}</span>}
                            </span>
                          ) : (
                            <span className="text-xs font-medium">+ Add calculation</span>
                          )}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-44">
                        <DropdownMenuLabel>Aggregations</DropdownMenuLabel>
                        {options.map((opt) => (
                          <DropdownMenuItem
                            key={opt.value}
                            onClick={() =>
                              setColumnAggregations((prev) => ({
                                ...prev,
                                [colId as string]: opt.value,
                              }))
                            }
                          >
                            {opt.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
