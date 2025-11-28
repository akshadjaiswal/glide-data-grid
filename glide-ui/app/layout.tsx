import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600'] })
import { QueryProvider } from '@/lib/query-provider'

export const metadata: Metadata = {
  title: 'glide-ui',
  description: 'Built with DevStart CLI',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          {children}
          <div id="portal" className="fixed left-0 top-0 z-[9999]" />
        </QueryProvider>
      </body>
    </html>
  )
}
