'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { MatchPreview } from '@/app/(app)/matches/page'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

function Avatar({ photoUrl, name, size }: { photoUrl: string | null; name: string; size: number }) {
  return photoUrl ? (
    <Image
      src={photoUrl}
      alt={name}
      width={size}
      height={size}
      className="object-cover w-full h-full"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
  )
}

const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 28 } },
}

export function MatchList({ matches }: { matches: MatchPreview[] }) {
  if (matches.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-[70vh] gap-5 text-center px-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <span className="text-7xl">💫</span>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">No matches yet</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Keep swiping — your matches will appear here.
          </p>
        </div>
      </motion.div>
    )
  }

  const newMatches = matches.filter((m) => !m.lastMessagePreview && m.conversationId && !m.isExpired)
  const conversations = matches.filter((m) => m.lastMessagePreview)
  const expired = matches.filter((m) => m.isExpired && !m.lastMessagePreview)

  return (
    <motion.div
      className="max-w-lg mx-auto px-4 py-6"
      variants={listVariants}
      initial="hidden"
      animate="show"
    >
      <motion.h1 variants={itemVariants} className="text-xl font-bold mb-6">
        Matches
      </motion.h1>

      {newMatches.length > 0 && (
        <motion.div variants={itemVariants} className="mb-7">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            New Matches
          </p>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            {newMatches.map((m) => (
              <Link
                key={m.matchId}
                href={`/chat/${m.conversationId}`}
                className="flex flex-col items-center gap-1.5 shrink-0 group"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted p-[2px] bg-gradient-to-br from-rose-400 to-pink-500">
                  <div className="w-full h-full rounded-full overflow-hidden bg-background">
                    <Avatar photoUrl={m.profile.photoUrl} name={m.profile.name} size={64} />
                  </div>
                </div>
                <span className="text-xs font-medium truncate max-w-[4rem] group-hover:text-primary transition-colors">
                  {m.profile.name}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {conversations.length > 0 && (
        <motion.div variants={itemVariants} className="mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Messages
          </p>
          <div className="space-y-1">
            {conversations.map((m) => (
              <Link
                key={m.matchId}
                href={`/chat/${m.conversationId}`}
                className="flex items-center gap-3 py-3 px-3 hover:bg-muted/60 -mx-3 rounded-2xl transition-colors"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted shrink-0">
                  <Avatar photoUrl={m.profile.photoUrl} name={m.profile.name} size={48} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-sm truncate">{m.profile.name}</span>
                    {m.lastMessageAt && (
                      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                        {timeAgo(m.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {m.lastMessagePreview}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {expired.length > 0 && (
        <motion.div variants={itemVariants}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Expired
          </p>
          <div className="space-y-1 opacity-40">
            {expired.map((m) => (
              <div key={m.matchId} className="flex items-center gap-3 py-3 px-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted shrink-0 grayscale">
                  <Avatar photoUrl={m.profile.photoUrl} name={m.profile.name} size={48} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{m.profile.name}</p>
                  <p className="text-xs text-muted-foreground">Match expired</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
