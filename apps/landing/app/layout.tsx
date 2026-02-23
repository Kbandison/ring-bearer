import type { Metadata } from 'next'
import './globals.css'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Ring Bearer — Find Meaningful Connections',
  description: 'A dating app built on real compatibility, not algorithms designed to keep you swiping.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-gray-900">
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  )
}
