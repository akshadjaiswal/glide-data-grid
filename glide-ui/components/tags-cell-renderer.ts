'use client'

import { GridCellKind, type CustomCell, type CustomRenderer } from '@glideapps/glide-data-grid'

type TagsCell = CustomCell<{ kind: 'tags'; tags: string[] }>

const pillPaddingX = 8
const pillPaddingY = 6
const pillGap = 8
const pillRadius = 12

export const tagsRenderer: CustomRenderer<TagsCell> = {
  kind: GridCellKind.Custom,
  isMatch: (cell): cell is TagsCell => cell.kind === GridCellKind.Custom && (cell.data as any).kind === 'tags',
  draw: (args, cell) => {
    const { ctx, rect, theme, cellFillColor } = args
    const tags = cell.data.tags ?? []

    if (cellFillColor) {
      ctx.fillStyle = cellFillColor
      // Leave a 1px gutter so grid borders stay visible under hover/selection
      ctx.fillRect(rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2)
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
      const pillHeight = 24

      if (x + pillWidth > maxX) break

      // pill
      ctx.fillStyle = '#e5e7eb'
      ctx.beginPath()
      ctx.roundRect(x, y - pillHeight / 2, pillWidth, pillHeight, pillRadius)
      ctx.fill()

      // text
      ctx.fillStyle = theme.textDark
      ctx.fillText(text, x + pillPaddingX, y)

      x += pillWidth + pillGap
    }
  },
}

export type { TagsCell }
