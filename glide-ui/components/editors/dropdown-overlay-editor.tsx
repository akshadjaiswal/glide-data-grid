'use client'

import type { CustomCell, ProvideEditorCallback } from '@glideapps/glide-data-grid'
import { GridCellKind } from '@glideapps/glide-data-grid'
import { useEffect, useRef, useState } from 'react'

type DropdownOption = {
  value: string
  label: string
  color: { bg: string; text: string }
}

type DropdownEditorProps = {
  value: string
  options: DropdownOption[]
  onChange: (newValue: string) => void
  onClose: () => void
  isDark?: boolean
}

function DropdownEditor({ value, options, onChange, onClose, isDark = false }: DropdownEditorProps) {
  const [selected, setSelected] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onChange(selected)
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onChange(selected)
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [selected, onChange, onClose])

  const bg = isDark ? '#18181b' : '#ffffff'
  const border = isDark ? '#3f3f46' : '#e5e7eb'
  const hoverBg = isDark ? '#27272a' : '#f3f4f6'

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -2px rgba(0,0,0,0.08)',
        borderRadius: '8px',
        minWidth: '200px',
        maxHeight: '300px',
        overflow: 'auto',
        zIndex: 10000,
        marginTop: '4px',
      }}
    >
      <div style={{ padding: '6px' }}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '6px 10px',
              borderRadius: '6px',
              border: 'none',
              background: option.value === selected ? hoverBg : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '2px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hoverBg }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = option.value === selected ? hoverBg : 'transparent' }}
            onClick={() => {
              setSelected(option.value)
              onChange(option.value)
              onClose()
            }}
          >
            <span
              style={{
                backgroundColor: option.color.bg,
                color: option.color.text,
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
              }}
            >
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function createDropdownEditor(
  options: DropdownOption[],
  cellKind: string,
  valueKey: string
): ProvideEditorCallback<CustomCell> {
  return (cell) => {
    if (cell.kind !== GridCellKind.Custom || (cell.data as any).kind !== cellKind) {
      return undefined
    }

    const currentValue = (cell.data as any)[valueKey] as string
    const isDark = document.documentElement.classList.contains('dark')

    return {
      editor: (props) => {
        const { onChange, onFinishedEditing, value: cellValue } = props
        const val = (cellValue.data as any)[valueKey] as string

        return (
          <DropdownEditor
            value={val || currentValue}
            options={options}
            isDark={isDark}
            onChange={(newValue) => {
              onChange({
                ...cellValue,
                data: {
                  ...(cellValue.data as any),
                  [valueKey]: newValue,
                },
              })
            }}
            onClose={() => onFinishedEditing()}
          />
        )
      },
      disablePadding: true,
      deletedValue: (prev) => ({
        ...prev,
        copyData: '',
      }),
    }
  }
}

// Predefined option sets
export const FUNNEL_STAGE_OPTIONS: DropdownOption[] = [
  { value: 'TOFU', label: 'TOFU', color: { bg: '#3B82F6', text: '#FFFFFF' } },
  { value: 'MOFU', label: 'MOFU', color: { bg: '#8B5CF6', text: '#FFFFFF' } },
  { value: 'BOFU', label: 'BOFU', color: { bg: '#10B981', text: '#FFFFFF' } },
]

export const REVENUE_OPTIONS: DropdownOption[] = [
  { value: 'High', label: 'High', color: { bg: '#10B981', text: '#FFFFFF' } },
  { value: 'Medium', label: 'Medium', color: { bg: '#F59E0B', text: '#000000' } },
  { value: 'Low', label: 'Low', color: { bg: '#6B7280', text: '#FFFFFF' } },
]

export const LPT_OPTIONS: DropdownOption[] = [
  { value: 'Blog', label: 'Blog', color: { bg: '#6366F1', text: '#FFFFFF' } },
  { value: 'Product', label: 'Product', color: { bg: '#EC4899', text: '#FFFFFF' } },
  { value: 'Service', label: 'Service', color: { bg: '#06B6D4', text: '#FFFFFF' } },
]

// Title/role options for the employee title dropdown
export const TITLE_OPTIONS: DropdownOption[] = [
  { value: 'Global Integration Manager', label: 'Global Integration Manager', color: { bg: '#3B82F6', text: '#FFFFFF' } },
  { value: 'Senior Implementation Assistant', label: 'Senior Implementation Assistant', color: { bg: '#8B5CF6', text: '#FFFFFF' } },
  { value: 'Lead Mobility Strategist', label: 'Lead Mobility Strategist', color: { bg: '#10B981', text: '#FFFFFF' } },
  { value: 'Principal Data Developer', label: 'Principal Data Developer', color: { bg: '#F59E0B', text: '#000000' } },
  { value: 'Customer Experience Consultant', label: 'Customer Experience Consultant', color: { bg: '#EC4899', text: '#FFFFFF' } },
  { value: 'Chief Accountability Architect', label: 'Chief Accountability Architect', color: { bg: '#EF4444', text: '#FFFFFF' } },
  { value: 'Product Infrastructure Director', label: 'Product Infrastructure Director', color: { bg: '#06B6D4', text: '#FFFFFF' } },
  { value: 'Marketing Functionality Engineer', label: 'Marketing Functionality Engineer', color: { bg: '#84CC16', text: '#000000' } },
  { value: 'Dynamic Research Manager', label: 'Dynamic Research Manager', color: { bg: '#F97316', text: '#FFFFFF' } },
  { value: 'Regional Infrastructure Developer', label: 'Regional Infrastructure Developer', color: { bg: '#6366F1', text: '#FFFFFF' } },
]
