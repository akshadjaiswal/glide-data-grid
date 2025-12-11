import { GridColumnIcon, type GridColumn } from '@glideapps/glide-data-grid'
import { gridLightTheme, gridDarkTheme } from '@/lib/grid-theme'

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

export const editableTextColumns: ColumnId[] = ['email', 'firstName', 'lastName', 'title', 'website']
export const editableBooleanColumns: ColumnId[] = ['optIn']

// Use improved themes from grid-theme
export const employeeLightTheme = gridLightTheme
export const employeeDarkTheme = gridDarkTheme
