'use client'

import type { CustomCell, ProvideEditorCallback } from '@glideapps/glide-data-grid'
import { GridCellKind } from '@glideapps/glide-data-grid'
import { useEffect, useRef, useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import 'react-day-picker/style.css'

type DateCell = CustomCell<{
  kind: 'date'
  date: Date | null
}>

type DatePickerEditorProps = {
  value: Date | null
  onChange: (newValue: Date | null) => void
  onClose: () => void
}

function DatePickerEditor({ value, onChange, onClose }: DatePickerEditorProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value && !isNaN(value.getTime()) ? value : undefined
  )
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (selectedDate) {
          onChange(selectedDate)
        }
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedDate) {
          onChange(selectedDate)
        }
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [selectedDate, onChange, onClose])

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      onChange(date)
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 999998,
        }}
        onClick={() => {
          if (selectedDate) {
            onChange(selectedDate)
          }
          onClose()
        }}
      />
      {/* Calendar Popup */}
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'hsl(var(--popover))',
          color: 'hsl(var(--popover-foreground))',
          border: '1px solid hsl(var(--border))',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          borderRadius: '12px',
          zIndex: 999999,
          padding: '16px',
        }}
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
        />
      </div>
    </>
  )
}

export function createDatePickerEditor(): ProvideEditorCallback<DateCell> {
  return (cell) => {
    console.log('[DatePicker] provideEditor called with cell:', cell)

    if (cell.kind !== GridCellKind.Custom) {
      console.log('[DatePicker] Not a custom cell, skipping')
      return undefined
    }

    if ((cell.data as any).kind !== 'date') {
      console.log('[DatePicker] Not a date cell, cell data kind:', (cell.data as any).kind)
      return undefined
    }

    console.log('[DatePicker] Returning date editor!')
    const currentDate = (cell.data as any).date as Date | null

    return {
      editor: (props) => {
        console.log('[DatePicker] Editor function called with props:', props)
        const { onChange, onFinishedEditing, value: cellValue } = props
        const dateValue = (cellValue.data as any).date as Date | null
        console.log('[DatePicker] Rendering editor with date:', dateValue)

        return (
          <DatePickerEditor
            value={dateValue || currentDate}
            onChange={(newDate) => {
              if (newDate) {
                onChange({
                  ...cellValue,
                  data: {
                    ...(cellValue.data as any),
                    date: newDate,
                  },
                  displayData: format(newDate, 'EEE MMM dd yyyy'),
                })
              }
            }}
            onClose={() => onFinishedEditing()}
          />
        )
      },
      disablePadding: true,
      deletedValue: (prev) => ({
        ...prev,
        data: {
          ...(prev.data as any),
          date: null,
        },
        displayData: 'Invalid Date',
        copyData: '',
      }),
    }
  }
}
