'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { SwipeCard, type DiscoverProfile } from './swipe-card'
import { MatchModal } from './match-modal'
import { Button } from '@/components/ui/button'
import { X, Heart, Lock } from 'lucide-react'
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

  const handleSwipe = useCallback(async (direction: 'like' | 'pass') => {
    const current = profiles[0]
    if (!current || loading) return

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
        // Put the card back since we couldn't swipe
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
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Lock className="w-7 h-7 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">Daily limit reached</h2>
        <p className="text-muted-foreground text-sm">
          You've used your 20 free swipes for today. Come back tomorrow or upgrade for unlimited.
        </p>
        <Button asChild className="mt-2">
          <Link href="/settings">Upgrade to Premium</Link>
        </Button>
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
        <span className="text-6xl">👀</span>
        <h2 className="text-xl font-bold">You've seen everyone nearby</h2>
        <p className="text-muted-foreground text-sm">
          Check back later — new people join every day.
        </p>
      </div>
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
                scale: 1 - index * 0.04,
                y: index * 10,
              }}
              initial={index === 0 ? { scale: 0.95, opacity: 0 } : undefined}
              animate={{ scale: 1 - index * 0.04, y: index * 10, opacity: 1 }}
              exit={{ x: 0, opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
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
        <Button
          size="icon"
          variant="outline"
          className="w-16 h-16 rounded-full border-2 border-red-400 text-red-400 hover:bg-red-50"
          onClick={() => handleSwipe('pass')}
          disabled={loading}
        >
          <X className="w-7 h-7" />
        </Button>
        <Button
          size="icon"
          className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg"
          onClick={() => handleSwipe('like')}
          disabled={loading}
        >
          <Heart className="w-7 h-7 fill-white text-white" />
        </Button>
      </div>

      <MatchModal match={match} onClose={() => setMatch(null)} />
    </>
  )
}
