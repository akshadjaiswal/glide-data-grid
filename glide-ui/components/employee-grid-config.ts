import { GridColumnIcon, GridColumnMenuIcon, type GridColumn } from '@glideapps/glide-data-grid'
import { gridLightTheme, gridDarkTheme } from '@/lib/grid-theme'

export type ColumnId =
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'optIn'
  | 'title'
  | 'website'
  | 'performance'
  | 'tags'
  | 'manager'
  | 'hiredAt'

export const employeeColumns: readonly GridColumn[] = [
  { id: 'email', title: 'Email', group: 'ID', width: 240, icon: GridColumnIcon.HeaderEmail, hasMenu: true, menuIcon: GridColumnMenuIcon.Dots },
  { id: 'firstName', title: 'First name', group: 'Name', width: 160, icon: GridColumnIcon.HeaderString, hasMenu: true, menuIcon: GridColumnMenuIcon.Dots },
  { id: 'lastName', title: 'Last name', group: 'Name', width: 180, icon: GridColumnIcon.HeaderString, hasMenu: true, menuIcon: GridColumnMenuIcon.Dots },
  { id: 'optIn', title: 'Opt-In', group: 'Info', width: 96, icon: GridColumnIcon.HeaderBoolean, hasMenu: true, menuIcon: GridColumnMenuIcon.Dots },
  { id: 'title', title: 'Title', group: 'Info', width: 260, icon: GridColumnIcon.HeaderString, grow: 1, hasMenu: true, menuIcon: GridColumnMenuIcon.Dots },
  { id: 'website', title: 'More Info', group: 'Info', width: 240, icon: GridColumnIcon.HeaderUri, hasMenu: true, menuIcon: GridColumnMenuIcon.Dots },
  { id: 'performance', title: 'Performance', group: 'Performance', width: 240, icon: GridColumnIcon.HeaderNumber, hasMenu: true, menuIcon: GridColumnMenuIcon.Dots },
  { id: 'tags', title: 'Tags', group: 'Info', width: 240, icon: GridColumnIcon.HeaderArray, hasMenu: true, menuIcon: GridColumnMenuIcon.Dots },
  { id: 'manager', title: 'Manager', group: 'Employment Data', width: 260, icon: GridColumnIcon.HeaderImage, hasMenu: true, menuIcon: GridColumnMenuIcon.Dots },
  { id: 'hiredAt', title: 'Hired', group: 'Employment Data', width: 180, icon: GridColumnIcon.HeaderDate, hasMenu: true, menuIcon: GridColumnMenuIcon.Dots },
]

export const editableTextColumns: ColumnId[] = ['email', 'firstName', 'lastName', 'website', 'hiredAt']
export const editableBooleanColumns: ColumnId[] = ['optIn']

// Use improved themes from grid-theme
export const employeeLightTheme = gridLightTheme
export const employeeDarkTheme = gridDarkTheme
