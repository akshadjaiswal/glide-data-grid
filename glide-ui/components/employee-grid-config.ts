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
  | 'tags'
  | 'hiredAt'

export const employeeColumns: readonly GridColumn[] = [
  { id: 'email', title: 'Email', group: 'ID', width: 240, icon: GridColumnIcon.HeaderEmail, hasMenu: true },
  { id: 'firstName', title: 'First name', group: 'Name', width: 160, icon: GridColumnIcon.HeaderString },
  { id: 'lastName', title: 'Last name', group: 'Name', width: 180, icon: GridColumnIcon.HeaderString },
  { id: 'optIn', title: 'Opt-In', group: 'Info', width: 96, icon: GridColumnIcon.HeaderBoolean },
  { id: 'title', title: 'Title', group: 'Info', width: 260, icon: GridColumnIcon.HeaderString, grow: 1 },
  { id: 'website', title: 'More Info', group: 'Info', width: 240, icon: GridColumnIcon.HeaderUri },
  { id: 'performance', title: 'Performance', group: 'Performance', width: 240, icon: GridColumnIcon.HeaderNumber },
  { id: 'tags', title: 'Tags', group: 'Info', width: 240, icon: GridColumnIcon.HeaderArray },
  { id: 'manager', title: 'Manager', group: 'Employment Data', width: 260, icon: GridColumnIcon.HeaderImage },
  { id: 'hiredAt', title: 'Hired', group: 'Employment Data', width: 180, icon: GridColumnIcon.HeaderDate },
]

export const editableTextColumns: ColumnId[] = ['email', 'firstName', 'lastName', 'title', 'website', 'hiredAt']
export const editableBooleanColumns: ColumnId[] = ['optIn']

export const employeeLightTheme: Partial<Theme> = {
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
  horizontalBorderColor: '#e5e7eb',
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
  headerBottomBorderColor: '#e5e7eb',
  resizeIndicatorColor: '#94a3b8',
  bgIconHeader: '#e2e8f0',
  fgIconHeader: '#475569',
  roundingRadius: 8,
}

export const employeeDarkTheme: Partial<Theme> = {
  accentColor: '#8c96ff',
  accentLight: 'rgba(102, 106, 145, 0.153)',
  accentFg: '#000000',
  textDark: '#ffffff',
  textMedium: '#b8b8b8',
  textLight: '#a0a0a0',
  textBubble: '#ffffff',
  textHeader: '#a1a1a1',
  textGroupHeader: '#a1a1a1',
  textHeaderSelected: '#000000',
  bgCell: '#16161b',
  bgCellMedium: '#202027',
  bgHeader: '#212121',
  bgHeaderHasFocus: '#151515',
  bgHeaderHovered: '#101010',
  bgBubble: '#212121',
  bgBubbleSelected: '#000000',
  bgSearchResult: '#423c24',
  borderColor: 'rgba(225,225,225,0.2)',
  horizontalBorderColor: 'rgba(225,225,225,0.2)',
  drilldownBorder: 'rgba(225,225,225,0.4)',
  linkColor: '#4F5DFF',
  cellHorizontalPadding: 8,
  cellVerticalPadding: 3,
  headerFontStyle: '600 13px "Inter", Roboto, -apple-system, BlinkMacSystemFont, sans-serif',
  headerIconSize: 18,
  baseFontStyle: '400 13px "Inter", Roboto, -apple-system, BlinkMacSystemFont, sans-serif',
  markerFontStyle: '600 10px "Inter", Roboto, -apple-system, BlinkMacSystemFont, sans-serif',
  fontFamily: 'Inter, Roboto, -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Ubuntu, noto, arial, sans-serif',
  editorFontSize: '13px',
  lineHeight: 1.35,
  headerBottomBorderColor: 'rgba(225,225,225,0.2)',
  resizeIndicatorColor: '#94a3b8',
  bgIconHeader: '#b8b8b8',
  fgIconHeader: '#000000',
  roundingRadius: 8,
}
