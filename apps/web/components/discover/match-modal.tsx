'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { DiscoverProfile } from './swipe-card'

interface MatchModalProps {
  match: DiscoverProfile | null
  onClose: () => void
}

const HEARTS = [
  { left: '8%', delay: 0.0, size: '1.5rem' },
  { left: '22%', delay: 0.5, size: '1rem' },
  { left: '38%', delay: 0.9, size: '2rem' },
  { left: '54%', delay: 0.3, size: '1.2rem' },
  { left: '68%', delay: 0.7, size: '1.8rem' },
  { left: '82%', delay: 0.15, size: '1rem' },
  { left: '92%', delay: 1.1, size: '1.4rem' },
  { left: '15%', delay: 1.3, size: '1.6rem' },
]

export function MatchModal({ match, onClose }: MatchModalProps) {
  return (
    <AnimatePresence>
      {match && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #fb7185 0%, #f43f5e 45%, #e11d48 100%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Floating hearts */}
          {HEARTS.map((h, i) => (
            <motion.span
              key={i}
              className="absolute pointer-events-none select-none"
              style={{ left: h.left, bottom: '-2rem', fontSize: h.size }}
              initial={{ y: 0, opacity: 0.9 }}
              animate={{ y: '-110vh', opacity: 0 }}
              transition={{
                duration: 3.5,
                delay: h.delay,
                repeat: Infinity,
                repeatDelay: 1.5,
                ease: 'easeOut',
              }}
            >
              ❤️
            </motion.span>
          ))}

          <div className="relative z-10 flex flex-col items-center px-8 text-white w-full max-w-sm">
            <motion.p
              className="text-base font-medium mb-1 text-white/80 tracking-wide uppercase text-xs"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 25 }}
            >
              It's a match!
            </motion.p>

            <motion.h1
              className="text-5xl font-black mb-2 tracking-tight text-center"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 300, damping: 25 }}
            >
              {match.name}
            </motion.h1>

            <motion.p
              className="text-white/70 text-sm mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              liked you back 🎉
            </motion.p>

            {/* Photo */}
            <motion.div
              className="mb-12"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 280, damping: 22 }}
            >
              {match.photos[0] ? (
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                  <img
                    src={match.photos[0].url}
                    alt={match.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-36 h-36 rounded-full bg-white/20 border-4 border-white flex items-center justify-center text-5xl">
                  👤
                </div>
              )}
            </motion.div>

            <motion.div
              className="w-full space-y-3"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45, type: 'spring', stiffness: 300, damping: 25 }}
            >
              <Button
                asChild
                className="w-full bg-white text-rose-600 hover:bg-white/95 font-bold h-13 h-[52px] rounded-full text-base shadow-lg"
              >
                <Link href="/matches">Send a message 💬</Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full text-white hover:bg-white/15 h-12 rounded-full text-base"
                onClick={onClose}
              >
                Keep swiping
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
