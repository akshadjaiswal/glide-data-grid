'use client'

import { GridCellKind, type CustomCell, type CustomRenderer } from '@glideapps/glide-data-grid'

export type DateCell = CustomCell<{
  kind: 'date'
  date: Date | null
}>

export const dateCellRenderer: CustomRenderer<DateCell> = {
  kind: GridCellKind.Custom,
  isMatch: (cell): cell is DateCell =>
    cell.kind === GridCellKind.Custom && (cell.data as any).kind === 'date',
  draw: (args, cell) => {
    const { ctx, rect, theme, cellFillColor } = args
    const { date } = cell.data

    // Fill cell background
    if (cellFillColor) {
      ctx.fillStyle = cellFillColor
      // Leave 1px gutter so grid borders remain visible
      ctx.fillRect(rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2)
    }

    // Set text properties
    ctx.font = theme.baseFontFull
    ctx.fillStyle = theme.textDark
    ctx.textBaseline = 'middle'

    // Display date or "Invalid Date" message
    const displayText = cell.displayData || 'Invalid Date'
    const x = rect.x + theme.cellHorizontalPadding
    const y = rect.y + rect.height / 2

    ctx.fillText(displayText, x, y)
  },
}
