'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/types'
import {
  LayoutDashboard,
  Users,
  Flag,
  Image,
  Mic,
  CreditCard,
  BarChart3,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/users', icon: Users, label: 'Users' },
  { href: '/reports', icon: Flag, label: 'Reports' },
  { href: '/moderation/photos', icon: Image, label: 'Photo Moderation' },
  { href: '/moderation/voice-intros', icon: Mic, label: 'Voice Moderation' },
  { href: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
]

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-5 border-b border-gray-200">
        <p className="font-bold text-gray-900 text-sm">Ring Bearer</p>
        <p className="text-xs text-gray-500 mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <p className="text-xs text-gray-400 px-3 mb-1 truncate">{userEmail}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
