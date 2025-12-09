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
}

function DropdownEditor({ value, options, onChange, onClose }: DropdownEditorProps) {
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

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        backgroundColor: 'white',
        border: '1px solid #e5e5e5',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        borderRadius: '8px',
        minWidth: '192px',
        maxHeight: '300px',
        overflow: 'auto',
        zIndex: 10000,
        marginTop: '4px',
      }}
    >
      <div style={{ padding: '8px' }}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
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
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
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

    return {
      editor: (props) => {
        const { onChange, onFinishedEditing, value: cellValue } = props
        const val = (cellValue.data as any)[valueKey] as string

        return (
          <DropdownEditor
            value={val || currentValue}
            options={options}
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
