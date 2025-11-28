import { GridColumnIcon, type GridColumn, type Theme } from '@glideapps/glide-data-grid'

export type ColumnId =
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'optIn'
  | 'title'
  | 'website'
  | 'performance'
  | 'manager'
  | 'hiredAt'

export const employeeColumns: readonly GridColumn[] = [
  { id: 'email', title: 'Email', group: 'ID', width: 240, icon: GridColumnIcon.HeaderEmail, hasMenu: true },
  { id: 'firstName', title: 'First name', group: 'Name', width: 160, icon: GridColumnIcon.HeaderString },
  { id: 'lastName', title: 'Last name', group: 'Name', width: 180, icon: GridColumnIcon.HeaderString },
  { id: 'optIn', title: 'Opt-In', group: 'Info', width: 96, icon: GridColumnIcon.HeaderBoolean },
  { id: 'title', title: 'Title', group: 'Info', width: 260, icon: GridColumnIcon.HeaderString, grow: 1 },
  { id: 'website', title: 'More Info', group: 'Info', width: 240, icon: GridColumnIcon.HeaderUri },
  { id: 'performance', title: 'Performance', group: 'Performance', width: 240, icon: GridColumnIcon.HeaderNumber },
  { id: 'manager', title: 'Manager', group: 'Employment Data', width: 260, icon: GridColumnIcon.HeaderImage },
  { id: 'hiredAt', title: 'Hired', group: 'Employment Data', width: 180, icon: GridColumnIcon.HeaderDate },
]

export const editableTextColumns: ColumnId[] = ['email', 'firstName', 'lastName', 'title', 'website', 'hiredAt']
export const editableBooleanColumns: ColumnId[] = ['optIn']

export const employeeThemeOverrides: Partial<Theme> = {
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
  headerFontStyle: '600 16px "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  headerIconSize: 18,
  baseFontStyle: '400 18px "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  markerFontStyle: '600 16px "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
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
