import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
        <header className="grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-slate-900/40 backdrop-blur">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Glide Data Grid Demo</p>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Build canvas-grade data experiences in minutes
            </h1>
            <p className="max-w-3xl text-lg text-slate-200">
              A polished playground that pairs Next.js with Glide Data Grid, showcasing grouped headers, custom cells,
              and a ready-to-extend UI baseline.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/grid"
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-white/20 transition hover:-translate-y-[2px] hover:shadow-xl hover:shadow-white/30"
            >
              Launch the grid demo
            </Link>
            <a
              href="#capabilities"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-[2px] hover:border-white/30 hover:bg-white/5"
            >
              See what&apos;s included
            </a>
            <div className="flex items-center gap-3 rounded-full border border-white/15 px-4 py-2 text-xs text-slate-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.2)]" />
              <span>Production-ready setup</span>
            </div>
          </div>
        </header>

        <section id="capabilities" className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Virtualized performance',
              detail: 'Smooth scrolling, frozen columns, row markers, and fully keyboard navigable.',
            },
            {
              title: 'Rich cell types',
              detail: 'URIs, images, booleans, custom sparkline charts, and persona cells out of the box.',
            },
            {
              title: 'Modular by design',
              detail: 'Data generation, theming, and rendering live in focused modules for easy extension.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/30"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">{item.title}</p>
              <p className="text-sm text-slate-100">{item.detail}</p>
            </div>
          ))}
        </section>

        <section className="grid items-center gap-10 rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-slate-900/40 backdrop-blur md:grid-cols-2">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Why this starter</p>
            <h2 className="text-3xl font-semibold text-white">Opinionated UI, extensible core</h2>
            <p className="text-base text-slate-200">
              The grid view lives in a dedicated route, powered by a reusable <code>EmployeeGrid</code> component and a
              typed data factory. Swap in real APIs later without touching layout or rendering logic.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-100">
              <span className="rounded-full bg-white/10 px-3 py-1">Next.js 14</span>
              <span className="rounded-full bg-white/10 px-3 py-1">TypeScript strict</span>
              <span className="rounded-full bg-white/10 px-3 py-1">Tailwind + gradients</span>
              <span className="rounded-full bg-white/10 px-3 py-1">Glide Data Grid v6</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-inner shadow-slate-900/80">
            <p className="text-sm text-slate-100">
              Ready to see it? The grid page renders 50 rows of curated dummy data with grouped headers, custom
              sparklines, personas, and consistent theming. It&apos;s a clean starting point for internal tools or admin
              dashboards.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link
                href="/grid"
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-slate-900 shadow-lg shadow-white/20 transition hover:-translate-y-[2px] hover:shadow-xl hover:shadow-white/30"
              >
                Open the grid
              </Link>
              <a
                href="https://github.com/akshadjaiswal/devstart"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 px-4 py-3 text-white transition hover:-translate-y-[2px] hover:border-white/30 hover:bg-white/5"
                target="_blank"
                rel="noopener noreferrer"
              >
                View scaffold origin
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
