'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft,
  Heart,
  X,
  MessageCircle,
  Play,
  Pause,
  MapPin,
  MoreVertical,
  Flag,
  Ban,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReportModal } from '@/components/chat/report-modal'

function calcAge(birthdate: string): number {
  const today = new Date()
  const dob = new Date(birthdate)
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

interface Props {
  profile: {
    id: string
    name: string
    birthdate: string
    bio: string | null
    gender: string
    seekingGender: string
    locationName: string | null
    responseRate: number | null
  }
  photos: { id: string; url: string; display_order: number }[]
  voiceIntro: { url: string; duration_seconds: number | null } | null
  myProfileId: string
  existingSwipe: string | null
  matchId: string | null
  conversationId: string | null
  isOwnProfile?: boolean
}

export function ProfileView({
  profile,
  photos,
  voiceIntro,
  myProfileId,
  existingSwipe,
  matchId,
  conversationId,
  isOwnProfile = false,
}: Props) {
  const router = useRouter()
  const [photoIndex, setPhotoIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [swipeState, setSwipeState] = useState<string | null>(existingSwipe)
  const [loading, setLoading] = useState<'like' | 'pass' | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const age = calcAge(profile.birthdate)
  const currentPhoto = photos[photoIndex]

  const toggleAudio = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  const handleSwipe = async (direction: 'like' | 'pass') => {
    setLoading(direction)
    const res = await fetch('/api/swipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ swipedProfileId: profile.id, direction }),
    })
    const data = await res.json() as { matched?: boolean; matchId?: string; limitReached?: boolean; error?: string }

    if (res.ok) {
      setSwipeState(direction)
      if (data.matched && data.matchId) {
        router.push(`/matches`)
      }
    }
    setLoading(null)
  }

  const handleBlock = async () => {
    if (!confirm(`Block ${profile.name}? They won't be able to see your profile.`)) return
    setShowMenu(false)
    await fetch('/api/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockedProfileId: profile.id }),
    })
    router.back()
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Photo section */}
      <div className="relative w-full aspect-[3/4] max-h-[70vh] bg-muted shrink-0">
        {currentPhoto ? (
          <Image
            src={currentPhoto.url}
            alt={profile.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 480px"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-6xl">👤</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between p-4 pt-safe">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          {!isOwnProfile && (
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Photo dots */}
        {photos.length > 1 && (
          <div className="absolute top-4 inset-x-0 flex justify-center gap-1 pointer-events-none">
            {photos.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === photoIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Photo tap zones */}
        {photos.length > 1 && (
          <>
            <button
              className="absolute left-0 top-0 w-1/3 h-full"
              onClick={() => setPhotoIndex((i) => Math.max(0, i - 1))}
            />
            <button
              className="absolute right-0 top-0 w-1/3 h-full"
              onClick={() => setPhotoIndex((i) => Math.min(photos.length - 1, i + 1))}
            />
          </>
        )}

        {/* Name overlay */}
        <div className="absolute bottom-0 inset-x-0 p-5 text-white">
          <h1 className="text-3xl font-bold">
            {profile.name}, {age}
          </h1>
          {profile.locationName && (
            <div className="flex items-center gap-1 mt-1 text-white/80 text-sm">
              <MapPin className="w-3.5 h-3.5" />
              {profile.locationName}
            </div>
          )}
        </div>

        {/* Dropdown menu */}
        {showMenu && (
          <div className="absolute top-14 right-4 bg-white rounded-xl shadow-lg overflow-hidden z-10 min-w-36">
            <button
              onClick={() => { setShowMenu(false); setShowReport(true) }}
              className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Flag className="w-4 h-4" /> Report
            </button>
            <button
              onClick={handleBlock}
              className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50"
            >
              <Ban className="w-4 h-4" /> Block
            </button>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="flex-1 px-5 py-5 space-y-5">
        {/* Voice intro */}
        {voiceIntro && (
          <div className="flex items-center gap-3 bg-muted rounded-2xl px-4 py-3">
            <button
              onClick={toggleAudio}
              className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center text-background shrink-0"
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Voice intro</p>
              {voiceIntro.duration_seconds && (
                <p className="text-xs text-muted-foreground">{formatDuration(voiceIntro.duration_seconds)}</p>
              )}
            </div>
            <audio
              ref={audioRef}
              src={voiceIntro.url}
              onEnded={() => setPlaying(false)}
            />
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div>
            <p className="text-sm text-muted-foreground mb-1 font-medium">About</p>
            <p className="text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Details */}
        <div className="flex flex-wrap gap-2">
          <span className="bg-muted text-sm px-3 py-1.5 rounded-full capitalize">{profile.gender}</span>
          <span className="bg-muted text-sm px-3 py-1.5 rounded-full">
            Interested in {profile.seekingGender}
          </span>
          {profile.responseRate != null && (
            <span className="bg-muted text-sm px-3 py-1.5 rounded-full">
              {Math.round(profile.responseRate * 100)}% response rate
            </span>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="px-5 pb-8 pb-safe pt-3 border-t border-border">
        {isOwnProfile ? (
          <Button
            className="w-full h-12 rounded-full gap-2"
            onClick={() => router.push('/profile/me')}
          >
            Edit Profile
          </Button>
        ) : matchId && conversationId ? (
          <Button
            className="w-full h-12 rounded-full gap-2"
            onClick={() => router.push(`/chat/${conversationId}`)}
          >
            <MessageCircle className="w-5 h-5" />
            Message {profile.name}
          </Button>
        ) : swipeState === 'like' ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground h-12">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            You liked {profile.name}
          </div>
        ) : swipeState === 'pass' ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground h-12">
            You passed on {profile.name}
          </div>
        ) : (
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 h-14 rounded-full border-2 text-base gap-2"
              onClick={() => handleSwipe('pass')}
              disabled={loading !== null}
            >
              <X className="w-5 h-5 text-red-500" />
              Pass
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 rounded-full text-base gap-2 bg-rose-600 hover:bg-rose-700"
              onClick={() => handleSwipe('like')}
              disabled={loading !== null}
            >
              <Heart className="w-5 h-5" />
              Like
            </Button>
          </div>
        )}
      </div>

      {/* Report modal */}
      {showReport && (
        <ReportModal
          reportedProfileId={profile.id}
          reportedName={profile.name}
          onClose={() => setShowReport(false)}
          onSubmit={async (reason, description) => {
            await fetch('/api/report', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                reportedProfileId: profile.id,
                reason,
                description,
              }),
            })
          }}
        />
      )}
    </div>
  )
}
