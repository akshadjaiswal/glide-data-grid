'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { EmployeeGrid } from '@/components/employee-grid'
import { buildEmployees, employees as defaultEmployees } from '@/lib/data/employees'

export default function GridPage() {
  const [data, setData] = useState(defaultEmployees)
  const pageMeta = useMemo(
    () => ({
      title: 'Team Directory',
      description: '50-row demo showcasing Glide Data Grid with grouped headers, custom cells, and rich data types.',
    }),
    []
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-8 px-6 py-12 lg:px-10">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Dashboard</p>
            <h1 className="text-3xl font-semibold text-slate-900">{pageMeta.title}</h1>
            <p className="max-w-2xl text-sm text-slate-600">{pageMeta.description}</p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">50 dummy rows</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">Grouped headers</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">Custom sparkline</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 text-sm text-slate-600">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-md"
            >
              ← Back to home
            </Link>
            <button
              type="button"
              onClick={() => setData(buildEmployees(50, Date.now()))}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Refresh sample data
            </button>
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Grid Preview</p>
              <p className="text-sm text-slate-600">
                Interactive data grid powered by @glideapps/glide-data-grid with custom sparkline & manager personas.
              </p>
            </div>
            <div className="hidden rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700 md:inline-flex">
              Optimized for large data with virtualization
            </div>
          </div>
          <EmployeeGrid rows={data} />
        </section>
      </div>
    </main>
  )
}
