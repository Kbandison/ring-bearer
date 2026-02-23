'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000'

const LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
]

export function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-gray-900 tracking-tight">
          Ring Bearer
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a
            href={`${WEB_URL}/login`}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign in
          </a>
          <a
            href={`${WEB_URL}/signup`}
            className="text-sm font-semibold bg-rose-600 text-white px-4 py-2 rounded-full hover:bg-rose-700 transition-colors"
          >
            Get started
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-gray-600"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-gray-700 py-1"
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <a
              href={`${WEB_URL}/login`}
              className="text-sm font-medium text-gray-600 py-1"
            >
              Sign in
            </a>
            <a
              href={`${WEB_URL}/signup`}
              className="text-sm font-semibold bg-rose-600 text-white px-4 py-2 rounded-full text-center"
            >
              Get started
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
