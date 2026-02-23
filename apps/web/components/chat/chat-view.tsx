'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0 bg-background/95 backdrop-blur-sm">
        <Link href="/matches" className="text-muted-foreground hover:text-foreground p-1 -ml-1 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Link href={`/profile/${otherProfile.id}`} className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-muted shrink-0 ring-2 ring-border">
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
          <div>
            <span className="font-semibold text-sm block truncate">{otherProfile.name}</span>
            <span className="text-xs text-primary">Tap to view profile</span>
          </div>
        </Link>
        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-2 bg-background border border-border rounded-2xl shadow-xl z-20 min-w-[160px] overflow-hidden">
                <button
                  onClick={() => { setShowMenu(false); setShowReport(true) }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-muted transition-colors"
                >
                  Report
                </button>
                <button
                  onClick={handleBlock}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-muted transition-colors"
                >
                  Block
                </button>
                <button
                  onClick={handleUnmatch}
                  className="w-full text-left px-4 py-3 text-sm text-destructive hover:bg-muted transition-colors"
                >
                  Unmatch
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <motion.div
            className="text-center text-muted-foreground text-sm py-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-3xl block mb-2">👋</span>
            Say hello to {otherProfile.name}!
          </motion.div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMe = msg.sender_id === myProfileId
            return (
              <motion.div
                key={msg.id}
                className={`flex mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        {otherTyping && (
          <motion.div
            className="flex justify-start mb-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </motion.div>
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

      {/* Input bar */}
      <div className="shrink-0 px-4 py-3 border-t border-border flex gap-2 items-end pb-safe bg-background">
        <textarea
          className="flex-1 resize-none rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 max-h-32 transition-colors placeholder:text-muted-foreground"
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
        <motion.div whileTap={{ scale: 0.88 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
          <Button
            size="icon"
            className="rounded-full w-10 h-10 shrink-0 bg-primary hover:bg-primary/90 shadow-md"
            onClick={sendMessage}
            disabled={!input.trim() || sending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
