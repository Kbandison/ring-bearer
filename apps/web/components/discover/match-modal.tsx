'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { DiscoverProfile } from './swipe-card'

interface MatchModalProps {
  match: DiscoverProfile | null
  onClose: () => void
}

export function MatchModal({ match, onClose }: MatchModalProps) {
  return (
    <AnimatePresence>
      {match && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-rose-500 to-pink-600 text-white px-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <motion.p
            className="text-lg font-medium mb-2 opacity-80"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 0.8 }}
            transition={{ delay: 0.1 }}
          >
            You matched with
          </motion.p>

          <motion.h1
            className="text-4xl font-black mb-10"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {match.name}! 🎉
          </motion.h1>

          {/* Photo pair */}
          <motion.div
            className="flex gap-4 mb-12"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            {match.photos[0] && (
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
                <img src={match.photos[0].url} alt={match.name} className="w-full h-full object-cover" />
              </div>
            )}
          </motion.div>

          <div className="w-full space-y-3">
            <Button asChild className="w-full bg-white text-rose-600 hover:bg-white/90 font-bold h-12">
              <Link href="/matches">Send a message</Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full text-white hover:bg-white/10 h-12"
              onClick={onClose}
            >
              Keep swiping
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
