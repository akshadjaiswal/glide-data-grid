/**
 * Tag color utilities for consistent, visible tag colors in both light and dark modes
 */

export type TagColor = { bg: string; text: string }

/**
 * Vibrant colors that work well in dark mode
 * Each tag text gets a consistent color based on a simple hash
 */
const TAG_COLORS: TagColor[] = [
  { bg: '#3B82F6', text: '#FFFFFF' }, // Blue
  { bg: '#8B5CF6', text: '#FFFFFF' }, // Purple
  { bg: '#10B981', text: '#FFFFFF' }, // Green
  { bg: '#F59E0B', text: '#000000' }, // Amber
  { bg: '#EF4444', text: '#FFFFFF' }, // Red
  { bg: '#06B6D4', text: '#FFFFFF' }, // Cyan
  { bg: '#EC4899', text: '#FFFFFF' }, // Pink
  { bg: '#6366F1', text: '#FFFFFF' }, // Indigo
  { bg: '#14B8A6', text: '#FFFFFF' }, // Teal
  { bg: '#F97316', text: '#FFFFFF' }, // Orange
  { bg: '#84CC16', text: '#000000' }, // Lime
  { bg: '#A855F7', text: '#FFFFFF' }, // Fuchsia
]

/**
 * Generate a consistent color for a tag based on its text
 * Same tag text will always get the same color
 */
export function generateTagColor(tag: string): TagColor {
  // Simple hash function to get consistent color per tag
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }

  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

/**
 * Generate a color map for an array of tags
 * Returns an object mapping each tag to its color
 */
export function generateTagColorMap(tags: string[]): Record<string, TagColor> {
  return tags.reduce(
    (acc, tag) => {
      acc[tag] = generateTagColor(tag)
      return acc
    },
    {} as Record<string, TagColor>
  )
}
