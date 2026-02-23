'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flame, Heart, User, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/discover', icon: Flame, label: 'Discover' },
  { href: '/matches', icon: Heart, label: 'Matches' },
  { href: '/profile/me', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-background border-t border-border pb-safe">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active =
            href === '/discover'
              ? pathname === '/discover'
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 transition-colors py-2 px-3 ${
                active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
