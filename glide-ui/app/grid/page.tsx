'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'

import { buildEmployees, employees as defaultEmployees } from '@/lib/data/employees'

const EmployeeGrid = dynamic(() => import('@/components/employee-grid').then((m) => m.EmployeeGrid), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-slate-100" />,
})

const PAGE_SIZE_OPTIONS = [25, 50, 100]

export default function GridPage() {
  const [data, setData] = useState(defaultEmployees)
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)

  const pageMeta = {
    title: 'Team Directory',
    description: '50-row demo showcasing Glide Data Grid with grouped headers, custom cells, and rich data types.',
  }

  // Filter rows by search query
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

  // Paginate filtered results
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const clampedPage = Math.min(page, totalPages - 1)
  const pagedData = useMemo(
    () => filteredData.slice(clampedPage * pageSize, (clampedPage + 1) * pageSize),
    [filteredData, clampedPage, pageSize]
  )

  const handleSearchChange = (q: string) => {
    setSearch(q)
    setPage(0)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setPage(0)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="mx-auto flex w-full max-w-screen-3xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Dashboard</p>
            <h1 className="text-3xl font-semibold text-slate-900">{pageMeta.title}</h1>
            <p className="max-w-2xl text-sm text-slate-600">{pageMeta.description}</p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">{data.length} rows</span>
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
                setPage(0)
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
              {/* Search bar */}
              <div className="relative">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
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
            <EmployeeGrid key={refreshKey} rows={pagedData} />
          </div>

          {/* Pagination controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Rows per page:</span>
              <div className="flex gap-1">
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handlePageSizeChange(size)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      pageSize === size
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500">
                {filteredData.length === 0
                  ? 'No results'
                  : `${clampedPage * pageSize + 1}–${Math.min((clampedPage + 1) * pageSize, filteredData.length)} of ${filteredData.length}`}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={clampedPage === 0}
                  onClick={() => setPage(0)}
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="First page"
                >
                  «
                </button>
                <button
                  type="button"
                  disabled={clampedPage === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  ‹
                </button>
                <span className="flex items-center rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                  {clampedPage + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={clampedPage >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  ›
                </button>
                <button
                  type="button"
                  disabled={clampedPage >= totalPages - 1}
                  onClick={() => setPage(totalPages - 1)}
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Last page"
                >
                  »
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
