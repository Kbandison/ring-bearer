import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ring Bearer',
  description: 'Find meaningful connections based on real compatibility',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ring Bearer',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  )
}
