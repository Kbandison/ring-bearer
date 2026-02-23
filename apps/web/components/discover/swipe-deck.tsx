'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { SwipeCard, type DiscoverProfile } from './swipe-card'
import { MatchModal } from './match-modal'
import { Button } from '@/components/ui/button'
import { X, Heart, Lock, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface SwipeDeckProps {
  profiles: DiscoverProfile[]
}

export function SwipeDeck({ profiles: initialProfiles }: SwipeDeckProps) {
  const router = useRouter()
  const [profiles, setProfiles] = useState(initialProfiles)
  const [match, setMatch] = useState<DiscoverProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const [exitX, setExitX] = useState(0)

  const handleSwipe = useCallback(async (direction: 'like' | 'pass') => {
    const current = profiles[0]
    if (!current || loading) return

    setExitX(direction === 'like' ? 600 : -600)
    setLoading(true)
    setProfiles((prev) => prev.slice(1))

    try {
      const res = await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ swipedProfileId: current.id, direction }),
      })

      if (res.status === 429) {
        setLimitReached(true)
        setProfiles((prev) => [current, ...prev])
        return
      }

      const data = await res.json() as { matched: boolean }
      if (data.matched) setMatch(current)
    } catch {
      // fail silently
    } finally {
      setLoading(false)
    }
  }, [profiles, loading])

  if (limitReached) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-full gap-5 text-center px-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Daily limit reached</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            You've used your 20 free swipes for today.<br />Come back tomorrow or go Premium.
          </p>
        </div>
        <Button asChild className="mt-1 rounded-full px-8">
          <Link href="/settings">Upgrade to Premium</Link>
        </Button>
      </motion.div>
    )
  }

  if (profiles.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-full gap-5 text-center px-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <span className="text-7xl">✨</span>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">You're all caught up</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            New people join every day.<br />Check back soon for more matches.
          </p>
        </div>
        <Button
          variant="outline"
          className="mt-1 rounded-full px-8 gap-2"
          onClick={() => router.refresh()}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </motion.div>
    )
  }

  return (
    <>
      {/* Card stack */}
      <div className="relative w-full flex-1">
        <AnimatePresence>
          {profiles.slice(0, 3).map((profile, index) => (
            <motion.div
              key={profile.id}
              className="absolute inset-0"
              style={{
                zIndex: profiles.length - index,
              }}
              initial={index === 0 ? { scale: 0.92, opacity: 0, y: 20 } : undefined}
              animate={{
                scale: 1 - index * 0.04,
                y: index * 12,
                opacity: 1,
              }}
              exit={{
                x: exitX,
                opacity: 0,
                rotate: exitX > 0 ? 22 : -22,
                transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <SwipeCard
                profile={profile}
                isTop={index === 0}
                onSwipe={handleSwipe}
                onTap={() => router.push(`/profile/${profile.id}`)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center items-center gap-8 py-6 shrink-0">
        <motion.button
          whileTap={{ scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          onClick={() => handleSwipe('pass')}
          disabled={loading}
          className="w-16 h-16 rounded-full border-2 border-rose-300 bg-white text-rose-400 flex items-center justify-center shadow-md hover:border-rose-400 hover:bg-rose-50 transition-colors disabled:opacity-40"
        >
          <X className="w-7 h-7" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          onClick={() => handleSwipe('like')}
          disabled={loading}
          className="w-18 h-18 w-[72px] h-[72px] rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-200 hover:shadow-rose-300 hover:from-rose-600 hover:to-pink-600 transition-all disabled:opacity-40"
        >
          <Heart className="w-7 h-7 fill-white" />
        </motion.button>
      </div>

      <MatchModal match={match} onClose={() => setMatch(null)} />
    </>
  )
}
