'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Check, X, Play, Pause } from 'lucide-react'

type VoiceItem = {
  id: string
  url: string
  profile_id: string
  profileName: string
  duration_seconds: number | null
  moderation_status: string | null
  created_at: string | null
}

function AudioPlayer({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false)
  const [audio] = useState(() => typeof Audio !== 'undefined' ? new Audio(url) : null)

  const toggle = () => {
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play()
      audio.onended = () => setPlaying(false)
      setPlaying(true)
    }
  }

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
    >
      {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
    </button>
  )
}

export function VoiceModerationList({
  items,
  showActions,
}: {
  items: VoiceItem[]
  showActions: boolean
}) {
  const router = useRouter()
  const [pending, setPending] = useState<Record<string, boolean>>({})

  const moderate = async (id: string, action: 'approve' | 'reject') => {
    setPending((p) => ({ ...p, [id]: true }))

    const res = await fetch('/api/admin/moderation/voice-intros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voiceIntroId: id, action }),
    })

    if (res.ok) {
      router.refresh()
    } else {
      alert('Action failed.')
    }
    setPending((p) => ({ ...p, [id]: false }))
  }

  if (items.length === 0) {
    return (
      <p className="text-center text-gray-500 text-sm py-16">No voice intros to review</p>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-4 p-4">
          <AudioPlayer url={item.url} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900">{item.profileName}</p>
            {item.duration_seconds != null && (
              <p className="text-xs text-gray-500">
                {Math.floor(item.duration_seconds / 60)}:
                {String(Math.floor(item.duration_seconds % 60)).padStart(2, '0')}
              </p>
            )}
          </div>
          {showActions && (
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => moderate(item.id, 'approve')}
                disabled={pending[item.id]}
              >
                <Check className="w-3.5 h-3.5 mr-1" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => moderate(item.id, 'reject')}
                disabled={pending[item.id]}
              >
                <X className="w-3.5 h-3.5 mr-1" /> Reject
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
