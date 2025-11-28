import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  GridCellKind,
  type EditableGridCell,
  type GridCell,
  type Item,
  type Rectangle,
  getDefaultTheme,
} from '@glideapps/glide-data-grid'
import { format } from 'date-fns'

import type { EmployeeRow } from '@/lib/data/employees'
import {
  editableBooleanColumns,
  editableTextColumns,
  employeeColumns,
  employeeThemeOverrides,
  type ColumnId,
} from '@/components/employee-grid-config'

type UseEmployeeGridResult = {
  rows: EmployeeRow[]
  columns: typeof employeeColumns
  theme: ReturnType<typeof getDefaultTheme> & {
    baseFontFull: string
    headerFontFull: string
    markerFontFull: string
  }
  getCellContent: (cell: Item) => GridCell
  getCellsForSelection: (selection: Rectangle) => GridCell[][]
  onCellEdited: (cell: Item, newValue: EditableGridCell) => void
}

export function useEmployeeGrid(initialRows: EmployeeRow[]): UseEmployeeGridResult {
  const [rows, setRows] = useState<EmployeeRow[]>(() => [...initialRows])

  useEffect(() => {
    setRows([...initialRows])
  }, [initialRows])

  const theme = useMemo(() => {
    const base = getDefaultTheme()
    const merged = { ...base, ...employeeThemeOverrides }

    return {
      ...merged,
      baseFontFull: merged.baseFontStyle,
      headerFontFull: merged.headerFontStyle,
      markerFontFull: merged.markerFontStyle,
    }
  }, [])

  const getCellContent = useCallback(
    (cell: Item): GridCell => {
      const [col, row] = cell
      const rowData = rows[row]
      const columnId = employeeColumns[col]?.id as ColumnId | undefined

      if (!rowData || !columnId) {
        return { kind: GridCellKind.Loading, allowOverlay: false }
      }

      switch (columnId) {
        case 'email':
          return {
            kind: GridCellKind.Uri,
            data: rowData.email,
            displayData: rowData.email,
            allowOverlay: true,
            readonly: false,
            hoverEffect: true,
          }
        case 'firstName':
          return {
            kind: GridCellKind.Text,
            data: rowData.firstName,
            displayData: rowData.firstName,
            allowOverlay: true,
            readonly: false,
          }
        case 'lastName':
          return {
            kind: GridCellKind.Text,
            data: rowData.lastName,
            displayData: rowData.lastName,
            allowOverlay: true,
            readonly: false,
          }
        case 'optIn':
          return {
            kind: GridCellKind.Boolean,
            data: rowData.optIn,
            allowOverlay: false,
            readonly: false,
          }
        case 'title':
          return {
            kind: GridCellKind.Text,
            data: rowData.title,
            displayData: rowData.title,
            allowOverlay: true,
            readonly: false,
          }
        case 'website':
          return {
            kind: GridCellKind.Uri,
            data: rowData.website,
            displayData: rowData.website.replace(/^https?:\/\//, ''),
            allowOverlay: true,
            readonly: false,
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
            copyData: rowData.performance.values.map((v: number) => v.toFixed(2)).join(', '),
          }
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
          }
        case 'hiredAt': {
          const date = format(rowData.hiredAt, 'EEE MMM dd yyyy')
          return {
            kind: GridCellKind.Text,
            data: date,
            displayData: date,
            allowOverlay: true,
            readonly: false,
          }
        }
        default:
          return { kind: GridCellKind.Text, data: '', displayData: '', allowOverlay: false }
      }
    },
    [rows]
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
      const columnId = employeeColumns[col]?.id as ColumnId | undefined
      if (!columnId || row < 0 || row >= rows.length) return

      setRows((prev) => {
        const next = [...prev]
        const current = next[row]
        if (!current) return prev

        if (editableTextColumns.includes(columnId)) {
          if (newValue.kind === GridCellKind.Text || newValue.kind === GridCellKind.Uri) {
            next[row] = { ...current, [columnId]: newValue.data as string }
          }
        } else if (editableBooleanColumns.includes(columnId)) {
          if (newValue.kind === GridCellKind.Boolean) {
            next[row] = { ...current, optIn: Boolean(newValue.data) }
          }
        } else if (columnId === 'hiredAt' && newValue.kind === GridCellKind.Text) {
          const parsed = new Date(newValue.data)
          next[row] = { ...current, hiredAt: Number.isNaN(parsed.getTime()) ? current.hiredAt : parsed }
        }

        return next
      })
    },
    [rows.length]
  )

  return {
    rows,
    columns: employeeColumns,
    theme,
    getCellContent,
    getCellsForSelection,
    onCellEdited,
  }
}
