'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MoreVertical, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ReportModal } from './report-modal'
import type { Message } from '@/lib/supabase/types'

type MessageRow = Pick<Message, 'id' | 'sender_id' | 'content' | 'read_at' | 'created_at'>

interface ChatViewProps {
  conversationId: string
  matchId: string
  myProfileId: string
  otherProfile: { id: string; name: string; photoUrl: string | null }
  initialMessages: MessageRow[]
}

export function ChatView({
  conversationId,
  matchId,
  myProfileId,
  otherProfile,
  initialMessages,
}: ChatViewProps) {
  const router = useRouter()
  const supabase = useRef(createClient()).current
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [otherTyping, setOtherTyping] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, otherTyping])

  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as MessageRow
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev
            return [...prev, msg]
          })
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        if ((payload.payload as { profileId: string }).profileId !== myProfileId) {
          setOtherTyping(true)
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => setOtherTyping(false), 3000)
        }
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [conversationId, myProfileId, supabase])

  const broadcastTyping = useCallback(() => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { profileId: myProfileId },
    })
  }, [myProfileId])

  const sendMessage = async () => {
    const content = input.trim()
    if (!content || sending) return
    setInput('')
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, content }),
      })
      const data = await res.json() as { message: MessageRow }
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.message.id)) return prev
        return [...prev, data.message]
      })
    } finally {
      setSending(false)
    }
  }

  const handleUnmatch = async () => {
    if (!confirm(`Unmatch with ${otherProfile.name}? This cannot be undone.`)) return
    setShowMenu(false)
    await fetch('/api/unmatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId }),
    })
    router.push('/matches')
    router.refresh()
  }

  const handleBlock = async () => {
    if (!confirm(`Block ${otherProfile.name}? They won't be able to contact you.`)) return
    setShowMenu(false)
    await fetch('/api/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockedProfileId: otherProfile.id }),
    })
    // Also unmatch
    await fetch('/api/unmatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId }),
    })
    router.push('/matches')
    router.refresh()
  }

  const handleReport = async (reason: string, description: string) => {
    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportedProfileId: otherProfile.id, reason, description }),
    })
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-background z-10">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <Link href="/matches" className="text-muted-foreground hover:text-foreground p-1 -ml-1">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Link href={`/profile/${otherProfile.id}`} className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-muted shrink-0">
            {otherProfile.photoUrl ? (
              <Image
                src={otherProfile.photoUrl}
                alt={otherProfile.name}
                width={36}
                height={36}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm">👤</div>
            )}
          </div>
          <span className="font-semibold truncate">{otherProfile.name}</span>
        </Link>
        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-lg shadow-lg z-20 min-w-[160px]">
                <button
                  onClick={() => { setShowMenu(false); setShowReport(true) }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted rounded-t-lg"
                >
                  Report
                </button>
                <button
                  onClick={handleBlock}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted"
                >
                  Block
                </button>
                <button
                  onClick={handleUnmatch}
                  className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-muted rounded-b-lg"
                >
                  Unmatch
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            You matched! Say hello 👋
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === myProfileId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  isMe
                    ? 'bg-foreground text-background rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          )
        })}
        {otherTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-3">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {showReport && (
        <ReportModal
          reportedProfileId={otherProfile.id}
          reportedName={otherProfile.name}
          onClose={() => setShowReport(false)}
          onSubmit={handleReport}
        />
      )}

      {/* Input */}
      <div className="shrink-0 px-4 py-3 border-t border-border flex gap-2 items-end pb-safe">
        <textarea
          className="flex-1 resize-none rounded-2xl border border-border bg-muted px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring max-h-32"
          placeholder={`Message ${otherProfile.name}…`}
          rows={1}
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            broadcastTyping()
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
        />
        <Button
          size="icon"
          className="rounded-full w-10 h-10 shrink-0"
          onClick={sendMessage}
          disabled={!input.trim() || sending}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
