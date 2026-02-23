'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
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
    <nav className="fixed bottom-0 inset-x-0 bg-background/90 backdrop-blur-lg border-t border-border pb-safe">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active =
            href === '/discover'
              ? pathname === '/discover'
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl"
            >
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                  active ? 'text-primary stroke-[2.5]' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-[10px] relative z-10 transition-colors duration-200 ${
                  active ? 'text-primary font-semibold' : 'text-muted-foreground font-medium'
                }`}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
