'use client'

import { GridCellKind, type CustomCell, type CustomRenderer } from '@glideapps/glide-data-grid'

export type TagsCell = CustomCell<{
  kind: 'tags'
  tags: string[]
  colorMap?: Record<string, { bg: string; text: string }>
}>

const pillPaddingX = 8
const pillPaddingY = 5
const pillGap = 6
const pillRadius = 10

export const tagsRenderer: CustomRenderer<TagsCell> = {
  kind: GridCellKind.Custom,
  isMatch: (cell): cell is TagsCell =>
    cell.kind === GridCellKind.Custom && (cell.data as any).kind === 'tags',
  draw: (args, cell) => {
    const { ctx, rect, theme, cellFillColor } = args
    const tags = cell.data.tags ?? []
    const colorMap = cell.data.colorMap

    if (cellFillColor) {
      ctx.fillStyle = cellFillColor
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
    }

    if (!tags.length) return

    ctx.font = theme.baseFontFull
    ctx.textBaseline = 'middle'

    let x = rect.x + theme.cellHorizontalPadding
    const y = rect.y + rect.height / 2
    const maxX = rect.x + rect.width - theme.cellHorizontalPadding

    for (let i = 0; i < tags.length; i++) {
      const text = tags[i]
      const textWidth = ctx.measureText(text).width
      const pillWidth = textWidth + pillPaddingX * 2
      const pillHeight = 22

      if (x + pillWidth > maxX) break

      // Get colors from map or use defaults
      const colors = colorMap?.[text] ?? { bg: '#E5E7EB', text: theme.textDark }

      // Draw pill background
      ctx.fillStyle = colors.bg
      ctx.beginPath()
      ctx.roundRect(x, y - pillHeight / 2, pillWidth, pillHeight, pillRadius)
      ctx.fill()

      // Draw text
      ctx.fillStyle = colors.text
      ctx.fillText(text, x + pillPaddingX, y)

      x += pillWidth + pillGap
    }
  },
}
