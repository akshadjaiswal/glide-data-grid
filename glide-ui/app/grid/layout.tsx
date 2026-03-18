import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Team Directory — Glide Data Grid Demo',
  description: '50-row demo showcasing Glide Data Grid with grouped headers, custom cells, and rich data types.',
}

export default function GridLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
