'use client'

import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

export interface DiscoverProfile {
  id: string
  name: string
  birthdate: string
  bio: string | null
  photos: { url: string; display_order: number }[]
}

function calcAge(birthdate: string): number {
  const today = new Date()
  const dob = new Date(birthdate)
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age
}

interface SwipeCardProps {
  profile: DiscoverProfile
  onSwipe: (direction: 'like' | 'pass') => void
  isTop: boolean
  onTap?: () => void
}

const SWIPE_THRESHOLD = 100

export function SwipeCard({ profile, onSwipe, isTop, onTap }: SwipeCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-18, 18])
  const likeOpacity = useTransform(x, [20, SWIPE_THRESHOLD], [0, 1])
  const passOpacity = useTransform(x, [-SWIPE_THRESHOLD, -20], [1, 0])

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 500) {
      onSwipe('like')
    } else if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -500) {
      onSwipe('pass')
    }
  }

  const photoUrl = profile.photos[0]?.url

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
      style={{ x, rotate }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      onTap={isTop ? onTap : undefined}
      whileDrag={{ scale: 1.02 }}
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-xl bg-muted">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={profile.name}
            fill
            className="object-cover pointer-events-none"
            sizes="(max-width: 640px) 100vw, 480px"
            priority={isTop}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
            <span className="text-6xl">👤</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* LIKE badge */}
        <motion.div
          className="absolute top-10 left-6 border-4 border-green-400 rounded-xl px-4 py-2 rotate-[-15deg]"
          style={{ opacity: likeOpacity }}
        >
          <span className="text-green-400 font-black text-3xl tracking-wider">LIKE</span>
        </motion.div>

        {/* PASS badge */}
        <motion.div
          className="absolute top-10 right-6 border-4 border-red-400 rounded-xl px-4 py-2 rotate-[15deg]"
          style={{ opacity: passOpacity }}
        >
          <span className="text-red-400 font-black text-3xl tracking-wider">PASS</span>
        </motion.div>

        {/* Profile info */}
        <div className="absolute bottom-0 inset-x-0 p-6 text-white">
          <div className="flex items-end justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold">
                {profile.name}, {calcAge(profile.birthdate)}
              </h2>
              {profile.bio && (
                <p className="mt-1 text-sm text-white/80 line-clamp-2">{profile.bio}</p>
              )}
            </div>
            {isTop && onTap && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onTap() }}
                className="shrink-0 ml-3 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
