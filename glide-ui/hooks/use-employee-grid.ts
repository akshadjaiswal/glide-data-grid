import { GridCellKind, type EditableGridCell, type GridCell } from '@glideapps/glide-data-grid'
import { format } from 'date-fns'

import { blankEmployee } from '@/lib/data/employees'
import type { EmployeeRow } from '@/lib/data/employees'
import {
  editableBooleanColumns,
  editableTextColumns,
  employeeColumns,
  employeeDarkTheme,
  employeeLightTheme,
  type ColumnId,
} from '@/components/employee-grid-config'
import { useDataGrid } from './use-data-grid'
import { generateTagColorMap } from '@/lib/tag-colors'

type ThemeVariant = 'light' | 'dark'

export function useEmployeeGrid(initialRows: EmployeeRow[], themeVariant: ThemeVariant = 'light') {
  return useDataGrid<EmployeeRow>(
    initialRows,
    {
      columns: employeeColumns,
      getCellContent: (rowData: EmployeeRow, columnId: string) => {
        switch (columnId as ColumnId) {
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
          case 'tags': {
            const tags = rowData.tags
            return {
              kind: GridCellKind.Custom,
              allowOverlay: false,
              data: {
                kind: 'tags',
                tags,
                colorMap: generateTagColorMap(tags), // Generate vibrant, consistent colors
              },
              copyData: tags.join(', '),
            }
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
            // Validate date before formatting
            const dateValue = rowData.hiredAt
            const isValidDate = dateValue instanceof Date && !isNaN(dateValue.getTime())

            const displayDate = isValidDate
              ? format(dateValue, 'EEE MMM dd yyyy')
              : 'Invalid Date'

            console.log('[hiredAt Cell] Creating cell for:', displayDate, 'isValid:', isValidDate)

            return {
              kind: GridCellKind.Custom,
              data: {
                kind: 'date',
                date: isValidDate ? dateValue : null,
              },
              displayData: displayDate,
              allowOverlay: true,
              readonly: false,
              copyData: displayDate,
            }
          }
          default:
            return { kind: GridCellKind.Text, data: '', displayData: '', allowOverlay: false }
        }
      },
      editableColumns: [...editableTextColumns, ...editableBooleanColumns],
      onCellEdit: (current: EmployeeRow, columnId: string, newValue: EditableGridCell) => {
        if (editableTextColumns.includes(columnId as ColumnId)) {
          if (newValue.kind === GridCellKind.Text || newValue.kind === GridCellKind.Uri) {
            return { ...current, [columnId]: newValue.data as string }
          }
        } else if (editableBooleanColumns.includes(columnId as ColumnId)) {
          if (newValue.kind === GridCellKind.Boolean) {
            return { ...current, optIn: Boolean(newValue.data) }
          }
        } else if (columnId === 'hiredAt' && newValue.kind === GridCellKind.Custom) {
          // Extract date from custom cell
          const newDate = (newValue.data as any).date

          // Strict validation - only accept valid Date objects
          if (newDate instanceof Date && !isNaN(newDate.getTime())) {
            return { ...current, hiredAt: newDate }
          }

          // Reject invalid dates, keep current value
          return current
        }
        return current
      },
      blankRow: blankEmployee,
      lightTheme: employeeLightTheme,
      darkTheme: employeeDarkTheme,
    },
    themeVariant
  )
}
