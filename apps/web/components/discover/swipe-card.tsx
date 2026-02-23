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
  const rotate = useTransform(x, [-300, 300], [-22, 22])
  const likeOpacity = useTransform(x, [30, SWIPE_THRESHOLD], [0, 1])
  const passOpacity = useTransform(x, [-SWIPE_THRESHOLD, -30], [1, 0])

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
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      onTap={isTop ? onTap : undefined}
      whileDrag={{ scale: 1.03, cursor: 'grabbing' }}
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-muted">
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
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-pink-50">
            <span className="text-7xl">👤</span>
          </div>
        )}

        {/* Multi-stop gradient for better readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 via-40% to-transparent" />

        {/* LIKE badge */}
        <motion.div
          className="absolute top-12 left-5 backdrop-blur-sm border-[3px] border-emerald-400 rounded-2xl px-4 py-1.5"
          style={{ opacity: likeOpacity, rotate: -14 }}
        >
          <span className="text-emerald-400 font-black text-2xl tracking-widest">LIKE</span>
        </motion.div>

        {/* NOPE badge */}
        <motion.div
          className="absolute top-12 right-5 backdrop-blur-sm border-[3px] border-rose-400 rounded-2xl px-4 py-1.5"
          style={{ opacity: passOpacity, rotate: 14 }}
        >
          <span className="text-rose-400 font-black text-2xl tracking-widest">NOPE</span>
        </motion.div>

        {/* Profile info */}
        <div className="absolute bottom-0 inset-x-0 p-5 text-white">
          <div className="flex items-end justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <h2 className="text-3xl font-bold leading-none tracking-tight">
                  {profile.name}
                </h2>
                <span className="text-2xl font-light text-white/90 leading-none">
                  {calcAge(profile.birthdate)}
                </span>
              </div>
              {profile.bio && (
                <p className="text-sm text-white/70 line-clamp-2 leading-snug">
                  {profile.bio}
                </p>
              )}
            </div>
            {isTop && onTap && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onTap() }}
                className="shrink-0 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors"
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
