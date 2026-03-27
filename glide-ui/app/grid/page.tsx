'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'

import { buildEmployees, employees as defaultEmployees } from '@/lib/data/employees'

const EmployeeGrid = dynamic(() => import('@/components/employee-grid').then((m) => m.EmployeeGrid), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-slate-100" />,
})

export default function GridPage() {
  const [data, setData] = useState(defaultEmployees)
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const pageMeta = {
    title: 'Team Directory',
    description: '50-row demo showcasing Glide Data Grid with grouped headers, custom cells, and rich data types.',
  }

  // Feature 1: Filter rows by search query across name, email, title, and tags
  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return data
    return data.filter(
      (r) =>
        r.firstName.toLowerCase().includes(q) ||
        r.lastName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [data, search])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="mx-auto flex w-full max-w-screen-3xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-10">
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
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm transition motion-safe:hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-md"
            >
              ← Back to home
            </Link>
            <button
              type="button"
              onClick={() => {
                setData(buildEmployees(50, Date.now()))
                setSearch('')
                setRefreshKey((k) => k + 1)
              }}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white shadow-sm transition motion-safe:hover:-translate-y-[1px] motion-safe:hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Refresh sample data
            </button>
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Grid Preview</p>
              <p className="text-sm text-slate-600">
                Interactive data grid powered by @glideapps/glide-data-grid with custom sparkline &amp; manager personas.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Feature 1: Search bar */}
              <div className="relative">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, title, tags…"
                  aria-label="Search employees"
                  className="w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
                {search && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    {filteredData.length} / {data.length}
                  </span>
                )}
              </div>
              <div className="hidden rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700 md:inline-flex">
                Virtualized
              </div>
            </div>
          </div>

          <div className="h-[650px] w-full">
            <EmployeeGrid key={refreshKey} rows={filteredData} />
          </div>
        </section>
      </div>
    </main>
  )
}
