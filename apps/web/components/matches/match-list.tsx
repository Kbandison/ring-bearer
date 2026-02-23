'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { MatchPreview } from '@/app/(app)/matches/page'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
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

export function MatchList({ matches }: { matches: MatchPreview[] }) {
  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4 text-center px-8">
        <span className="text-6xl">💫</span>
        <h2 className="text-xl font-bold">No matches yet</h2>
        <p className="text-muted-foreground text-sm">
          Keep swiping — your matches will appear here.
        </p>
      </div>
    )
  }

  const newMatches = matches.filter((m) => !m.lastMessagePreview && m.conversationId && !m.isExpired)
  const conversations = matches.filter((m) => m.lastMessagePreview)
  const expired = matches.filter((m) => m.isExpired && !m.lastMessagePreview)

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-5">Matches</h1>

      {newMatches.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            New Matches
          </p>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {newMatches.map((m) => (
              <Link
                key={m.matchId}
                href={`/chat/${m.conversationId}`}
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted border-2 border-rose-400">
                  <Avatar photoUrl={m.profile.photoUrl} name={m.profile.name} size={64} />
                </div>
                <span className="text-xs font-medium truncate max-w-[4rem]">
                  {m.profile.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {conversations.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Messages
          </p>
          <div className="divide-y divide-border">
            {conversations.map((m) => (
              <Link
                key={m.matchId}
                href={`/chat/${m.conversationId}`}
                className="flex items-center gap-3 py-3 hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted shrink-0">
                  <Avatar photoUrl={m.profile.photoUrl} name={m.profile.name} size={48} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-sm truncate">{m.profile.name}</span>
                    {m.lastMessageAt && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {timeAgo(m.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {m.lastMessagePreview}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {expired.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Expired
          </p>
          <div className="divide-y divide-border opacity-50">
            {expired.map((m) => (
              <div key={m.matchId} className="flex items-center gap-3 py-3">
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
        </div>
      )}
    </div>
  )
}
