import type { Theme } from '@glideapps/glide-data-grid'

/**
 * Grid theme configuration inspired by Goosebump's polished design
 * Features: proper borders, better density, improved colors
 */

export const gridLightTheme: Partial<Theme> = {
  accentColor: '#2F8BFF', // Softened primary blue for better contrast
  accentLight: '#E6F0FF', // Soft hover/focus tint
  accentFg: '#ffffff',
  textDark: '#09090B', // Near-black for excellent contrast
  textMedium: '#757577', // Muted text
  textLight: '#9E9E9F', // Light text
  textBubble: '#09090B',
  textHeader: '#222222',
  textGroupHeader: '#09090B',
  textHeaderSelected: '#ffffff',
  bgCell: '#ffffff', // Clean white background
  bgCellMedium: '#F7F7F7', // Subtle alternating rows
  bgHeader: '#F7F7F7', // Muted header
  bgHeaderHasFocus: '#E6EDFF',
  bgHeaderHovered: '#EEEEEE',
  bgBubble: '#E5E7EB',
  bgBubbleSelected: '#E5E7EB',
  bgSearchResult: '#FEF9C3',
  borderColor: 'rgba(36, 31, 47, 0.12)', // Subtle borders
  horizontalBorderColor: 'rgba(36, 31, 47, 0.12)',
  drilldownBorder: 'rgba(36, 31, 47, 0.12)',
  linkColor: '#0D37FD',
  cellHorizontalPadding: 12,
  cellVerticalPadding: 8,
  headerFontStyle: '600 14px', // Weight + size ONLY (CRITICAL)
  headerIconSize: 18,
  baseFontStyle: '400 14px', // Weight + size ONLY (CRITICAL)
  markerFontStyle: '600 14px', // Weight + size ONLY (CRITICAL)
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  editorFontSize: '14px',
  lineHeight: 1.4,
  headerBottomBorderColor: '#E5E5E5',
  resizeIndicatorColor: '#9E9E9F',
  bgIconHeader: '#E2E8F0',
  fgIconHeader: '#475569',
  roundingRadius: 6,
}

export const gridDarkTheme: Partial<Theme> = {
  accentColor: '#2F8BFF',
  accentLight: 'rgba(47, 139, 255, 0.12)',
  accentFg: '#ffffff',
  textDark: '#ffffff',
  textMedium: '#b8b8b8',
  textLight: '#a0a0a0',
  textBubble: '#ffffff',
  textHeader: '#e5e5e5',
  textGroupHeader: '#e5e5e5',
  textHeaderSelected: '#ffffff',
  bgCell: '#09090B', // Dark background
  bgCellMedium: '#18181B',
  bgHeader: '#18181B',
  bgHeaderHasFocus: '#27272A',
  bgHeaderHovered: '#27272A',
  bgBubble: '#27272A',
  bgBubbleSelected: '#3F3F46',
  bgSearchResult: '#713f12',
  borderColor: 'rgba(255, 255, 255, 0.15)', // Light borders for dark mode
  horizontalBorderColor: 'rgba(255, 255, 255, 0.15)', // Light borders for dark mode
  drilldownBorder: 'rgba(255, 255, 255, 0.2)', // Slightly more visible
  linkColor: '#60A5FA',
  cellHorizontalPadding: 12,
  cellVerticalPadding: 8,
  headerFontStyle: '600 14px', // Weight + size ONLY (CRITICAL)
  headerIconSize: 18,
  baseFontStyle: '400 14px', // Weight + size ONLY (CRITICAL)
  markerFontStyle: '600 14px', // Weight + size ONLY (CRITICAL)
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  editorFontSize: '14px',
  lineHeight: 1.4,
  headerBottomBorderColor: 'rgba(255,255,255,0.1)',
  resizeIndicatorColor: '#71717A',
  bgIconHeader: '#52525B',
  fgIconHeader: '#E4E4E7',
  roundingRadius: 6,
}
