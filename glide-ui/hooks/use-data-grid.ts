import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  GridCellKind,
  type EditableGridCell,
  type GridCell,
  type GridColumn,
  type Item,
  type Rectangle,
  getDefaultTheme,
} from '@glideapps/glide-data-grid'

type ThemeVariant = 'light' | 'dark'

// Helper function to realize theme fonts (combines font style + font family)
// This is CRITICAL - font styles must contain weight + size ONLY
function realizeThemeFonts(theme: ReturnType<typeof getDefaultTheme>) {
  return {
    ...theme,
    baseFontFull: `${theme.baseFontStyle} ${theme.fontFamily}`,
    headerFontFull: `${theme.headerFontStyle} ${theme.fontFamily}`,
    markerFontFull: `${theme.markerFontStyle} ${theme.fontFamily}`,
  }
}

export type UseDataGridConfig<T> = {
  columns: readonly GridColumn[]
  getCellContent: (item: T, columnId: string) => GridCell
  editableColumns?: string[]
  onCellEdit?: (item: T, columnId: string, newValue: EditableGridCell) => T
  blankRow?: (id: number) => T
  lightTheme: any
  darkTheme: any
}

type UseDataGridResult<T> = {
  rows: T[]
  columns: readonly GridColumn[]
  theme: ReturnType<typeof getDefaultTheme> & {
    baseFontFull: string
    headerFontFull: string
    markerFontFull: string
  }
  getCellContent: (cell: Item) => GridCell
  getCellsForSelection: (selection: Rectangle) => GridCell[][]
  onCellEdited: (cell: Item, newValue: EditableGridCell) => void
  sortState: { columnId: string | null; direction: 'asc' | 'desc' | null }
  setSort: (columnId: string, direction: 'asc' | 'desc' | null) => void
  addRow: () => void
  deleteRows: (indices: number[]) => void
  sortedRows: T[]
  onColumnResize: (column: GridColumn, newSize: number, columnIndex: number) => void
  setColumns: (cols: readonly GridColumn[]) => void
}

export function useDataGrid<T extends { id: number }>(
  initialRows: T[],
  config: UseDataGridConfig<T>,
  themeVariant: ThemeVariant = 'light'
): UseDataGridResult<T> {
  const [rows, setRows] = useState<T[]>(() => [...initialRows])
  const [columns, setColumns] = useState<readonly GridColumn[]>(config.columns)
  const [sortState, setSortState] = useState<{ columnId: string | null; direction: 'asc' | 'desc' | null }>({
    columnId: null,
    direction: null,
  })

  useEffect(() => {
    setRows([...initialRows])
  }, [initialRows])

  useEffect(() => {
    setColumns(config.columns)
  }, [config.columns])

  const theme = useMemo(() => {
    const base = getDefaultTheme()
    const overrides = themeVariant === 'dark' ? config.darkTheme : config.lightTheme
    const merged = { ...base, ...overrides }
    return realizeThemeFonts(merged)
  }, [themeVariant, config.lightTheme, config.darkTheme])

  const sortedRows = useMemo(() => {
    if (!sortState.columnId || !sortState.direction) return rows
    const dir = sortState.direction === 'asc' ? 1 : -1
    const col = sortState.columnId

    return [...rows].sort((a, b) => {
      const av = (a as any)[col]
      const bv = (b as any)[col]

      // Handle null/undefined
      if (av == null && bv == null) return 0
      if (av == null) return dir
      if (bv == null) return -dir

      // Handle dates
      if (av instanceof Date && bv instanceof Date) {
        return av.getTime() === bv.getTime() ? 0 : av.getTime() > bv.getTime() ? dir : -dir
      }

      // Handle booleans
      if (typeof av === 'boolean' && typeof bv === 'boolean') {
        return av === bv ? 0 : av ? dir : -dir
      }

      // Handle numbers
      if (typeof av === 'number' && typeof bv === 'number') {
        return av === bv ? 0 : av > bv ? dir : -dir
      }

      // Handle strings (default)
      const as = String(av ?? '').toLowerCase()
      const bs = String(bv ?? '').toLowerCase()
      return as === bs ? 0 : as > bs ? dir : -dir
    })
  }, [rows, sortState])

  const getCellContent = useCallback(
    (cell: Item): GridCell => {
      const [col, row] = cell
      const rowData = sortedRows[row]
      const column = columns[col]
      const columnId = column?.id as string | undefined

      if (!rowData || !columnId) {
        return { kind: GridCellKind.Loading, allowOverlay: false }
      }

      return config.getCellContent(rowData, columnId)
    },
    [sortedRows, config, columns]
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

  const onCellEdited = useCallback(
    (cell: Item, newValue: EditableGridCell) => {
      const [col, row] = cell
      const column = columns[col]
      const columnId = column?.id as string | undefined

      if (!columnId || row < 0 || row >= sortedRows.length) return

      // Allow editable columns OR custom cells (which may have onClick handlers)
      const isEditableColumn = config.editableColumns?.includes(columnId)
      const isCustomCell = newValue.kind === GridCellKind.Custom

      if (!isEditableColumn && !isCustomCell) return
      if (!config.onCellEdit) return

      // Find the actual index in the unsorted rows array
      const sortedRow = sortedRows[row]
      const actualIndex = rows.findIndex((r) => r.id === sortedRow.id)

      if (actualIndex === -1) return

      setRows((prev) => {
        const next = [...prev]
        const current = next[actualIndex]
        if (!current) return prev

        const updated = config.onCellEdit!(current, columnId, newValue)
        next[actualIndex] = updated

        return next
      })
    },
    [rows, sortedRows, config, columns]
  )

  const setSort = useCallback((columnId: string, direction: 'asc' | 'desc' | null) => {
    setSortState({ columnId, direction })
  }, [])

  const addRow = useCallback(() => {
    if (!config.blankRow) return

    setRows((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((r) => r.id)) + 1 : 1
      const newRow = config.blankRow!(nextId)
      return [...prev, newRow]
    })
  }, [config])

  const deleteRows = useCallback((indices: number[]) => {
    if (!indices.length) return

    setRows((prev) => {
      // Map sorted indices to actual row IDs
      const idsToDelete = new Set(indices.map((idx) => sortedRows[idx]?.id).filter(Boolean))
      return prev.filter((row) => !idsToDelete.has(row.id))
    })
  }, [sortedRows])

  const onColumnResize = useCallback(
    (_column: GridColumn, newSize: number, columnIndex: number) => {
      setColumns((prev) =>
        prev.map((col, idx) => (idx === columnIndex ? { ...col, width: newSize } : col))
      )
    },
    []
  )

  return {
    rows,
    columns,
    theme,
    getCellContent,
    getCellsForSelection,
    onCellEdited,
    sortState,
    setSort,
    addRow,
    deleteRows,
    sortedRows,
    onColumnResize,
    setColumns,
  }
}
