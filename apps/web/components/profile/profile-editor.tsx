'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  Mic,
  MicOff,
  Play,
  Pause,
  Trash2,
  Plus,
  Check,
  X,
  MapPin,
  Pencil,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

const GENDERS = ['Man', 'Woman', 'Non-binary', 'Other']
const BIO_MIN = 150
const MAX_PHOTOS = 6

interface PhotoRow {
  id: string
  url: string
  display_order: number
  moderation_status: string
}

interface VoiceIntroRow {
  id: string
  url: string
  duration_seconds: number | null
}

interface ProfileEditorProps {
  profile: {
    id: string
    name: string
    birthdate: string
    bio: string | null
    gender: string
    seekingGender: string
    locationName: string | null
    minAge: number
    maxAge: number
  }
  photos: PhotoRow[]
  voiceIntro: VoiceIntroRow | null
}

function calcAge(birthdate: string): number {
  const today = new Date()
  const dob = new Date(birthdate)
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '0:00'
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

function ModerationBadge({ status }: { status: string }) {
  if (status === 'approved') return null
  return (
    <span
      className={`absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
        status === 'pending'
          ? 'bg-yellow-400 text-yellow-900'
          : 'bg-red-500 text-white'
      }`}
    >
      {status === 'pending' ? 'Review' : 'Rejected'}
    </span>
  )
}

export function ProfileEditor({ profile, photos: initialPhotos, voiceIntro: initialVoice }: ProfileEditorProps) {
  const router = useRouter()
  const supabase = useRef(createClient()).current

  // Photos
  const [photos, setPhotos] = useState<PhotoRow[]>(initialPhotos)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  // Voice intro
  const [voiceIntro, setVoiceIntro] = useState<VoiceIntroRow | null>(initialVoice)
  const [recording, setRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [playingVoice, setPlayingVoice] = useState(false)
  const [deletingVoice, setDeletingVoice] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // About (name + bio)
  const [name, setName] = useState(profile.name)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [savingAbout, setSavingAbout] = useState(false)
  const [savedAbout, setSavedAbout] = useState(false)
  const [aboutError, setAboutError] = useState<string | null>(null)

  // Preferences (seeking + age)
  const [seekingGender, setSeekingGender] = useState(profile.seekingGender)
  const [minAge, setMinAge] = useState(profile.minAge)
  const [maxAge, setMaxAge] = useState(profile.maxAge)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [savedPrefs, setSavedPrefs] = useState(false)

  // ─── Photos ─────────────────────────────────────────────────────────────────

  const handleAddPhotos = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const remaining = MAX_PHOTOS - photos.length
    const toUpload = files.slice(0, remaining)
    setUploadingPhoto(true)

    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i]
      if (!file) continue
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${profile.id}/${Date.now()}-${i}.${ext}`

      const { error: upErr } = await supabase.storage.from('profile-photos').upload(path, file)
      if (upErr) continue

      const { data: { publicUrl } } = supabase.storage.from('profile-photos').getPublicUrl(path)

      const { data: row } = await supabase
        .from('photos')
        .insert({
          profile_id: profile.id,
          url: publicUrl,
          storage_path: path,
          display_order: photos.length + i,
          moderation_status: 'pending',
        })
        .select('id, url, display_order, moderation_status')
        .single()

      if (row) setPhotos((prev) => [...prev, row])
    }

    setUploadingPhoto(false)
    e.target.value = ''
  }, [photos.length, profile.id, supabase])

  const handleDeletePhoto = useCallback(async (photoId: string, photoUrl: string) => {
    const pathSegment = photoUrl.split('/profile-photos/')[1]
    if (pathSegment) {
      await supabase.storage.from('profile-photos').remove([decodeURIComponent(pathSegment)])
    }
    await supabase.from('photos').delete().eq('id', photoId)
    setPhotos((prev) => prev.filter((p) => p.id !== photoId))
    router.refresh()
  }, [supabase, router])

  // ─── Voice intro ─────────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      setRecordingSeconds(0)

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const duration = recordingSeconds

        const path = `${profile.id}/${Date.now()}.webm`
        const { error: upErr } = await supabase.storage.from('voice-intros').upload(path, blob)
        if (upErr) return

        const { data: { publicUrl } } = supabase.storage.from('voice-intros').getPublicUrl(path)

        // Delete existing
        if (voiceIntro) {
          await supabase.from('voice_intros').delete().eq('id', voiceIntro.id)
          const oldPath = voiceIntro.url.split('/voice-intros/')[1]
          if (oldPath) await supabase.storage.from('voice-intros').remove([decodeURIComponent(oldPath)])
        }

        const { data: row } = await supabase
          .from('voice_intros')
          .insert({ profile_id: profile.id, url: publicUrl, storage_path: path, duration_seconds: duration, moderation_status: 'pending' })
          .select('id, url, duration_seconds')
          .single()

        if (row) setVoiceIntro(row)
        router.refresh()
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000)
      setRecording(true)
    } catch {
      alert('Could not access microphone. Please allow microphone access.')
    }
  }, [profile.id, supabase, voiceIntro, router, recordingSeconds])

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
    setRecording(false)
  }, [])

  const handleDeleteVoice = useCallback(async () => {
    if (!voiceIntro) return
    setDeletingVoice(true)
    await supabase.from('voice_intros').delete().eq('id', voiceIntro.id)
    const pathSegment = voiceIntro.url.split('/voice-intros/')[1]
    if (pathSegment) await supabase.storage.from('voice-intros').remove([decodeURIComponent(pathSegment)])
    setVoiceIntro(null)
    setDeletingVoice(false)
    router.refresh()
  }, [voiceIntro, supabase, router])

  const toggleVoicePlayback = useCallback(() => {
    if (!audioRef.current) return
    if (playingVoice) {
      audioRef.current.pause()
      setPlayingVoice(false)
    } else {
      audioRef.current.play()
      setPlayingVoice(true)
    }
  }, [playingVoice])

  // ─── About ────────────────────────────────────────────────────────────────────

  const saveAbout = async () => {
    if (!name.trim()) return
    if (bio && bio.length > 0 && bio.length < BIO_MIN) {
      setAboutError(`Bio must be at least ${BIO_MIN} characters or left empty`)
      return
    }
    setSavingAbout(true)
    setAboutError(null)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bio }),
    })
    setSavingAbout(false)
    if (res.ok) {
      setSavedAbout(true)
      setTimeout(() => setSavedAbout(false), 2000)
      router.refresh()
    }
  }

  // ─── Preferences ──────────────────────────────────────────────────────────────

  const savePreferences = async () => {
    setSavingPrefs(true)
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seeking_gender: seekingGender, min_age: minAge, max_age: maxAge }),
    })
    setSavingPrefs(false)
    setSavedPrefs(true)
    setTimeout(() => setSavedPrefs(false), 2000)
    router.refresh()
  }

  const age = calcAge(profile.birthdate)

  return (
    <div className="max-w-lg mx-auto pb-28">
      {/* ── Profile header ─────────────────────────────────────────── */}
      <div className="relative">
        {/* Primary photo banner */}
        <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
          {photos[0] ? (
            <Image
              src={photos[0].url}
              alt={profile.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 480px"
              priority
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-rose-50 to-pink-100">
              <Camera className="w-10 h-10 text-rose-300" />
              <p className="text-sm text-rose-400 font-medium">Add your first photo</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-5 text-white">
            <h1 className="text-3xl font-bold">{profile.name}, {age}</h1>
            {profile.locationName && (
              <div className="flex items-center gap-1 mt-0.5 text-white/80 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                {profile.locationName}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-8">

        {/* ── Photos section ────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Photos
            </h2>
            <span className="text-xs text-muted-foreground">{photos.length} / {MAX_PHOTOS}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-2xl overflow-hidden bg-muted group">
                <Image
                  src={photo.url}
                  alt="Photo"
                  fill
                  className="object-cover"
                  sizes="150px"
                />
                <ModerationBadge status={photo.moderation_status} />
                <button
                  onClick={() => handleDeletePhoto(photo.id, photo.url)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ))}

            {photos.length < MAX_PHOTOS && (
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
              >
                {uploadingPhoto ? (
                  <div className="w-5 h-5 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Add</span>
                  </>
                )}
              </button>
            )}
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleAddPhotos}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            New photos are reviewed before showing to others.
          </p>
        </section>

        {/* ── Voice intro section ────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Voice Intro
          </h2>

          {voiceIntro ? (
            <div className="flex items-center gap-3 bg-muted rounded-2xl px-4 py-3">
              <button
                onClick={toggleVoicePlayback}
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0"
              >
                {playingVoice ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Voice intro</p>
                <p className="text-xs text-muted-foreground">{formatDuration(voiceIntro.duration_seconds)}</p>
              </div>
              <button
                onClick={handleDeleteVoice}
                disabled={deletingVoice}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <audio
                ref={audioRef}
                src={voiceIntro.url}
                onEnded={() => setPlayingVoice(false)}
              />
            </div>
          ) : (
            <div className="bg-muted rounded-2xl px-4 py-4">
              {!recording ? (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-3 w-full"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Record a voice intro</p>
                    <p className="text-xs text-muted-foreground">Let people hear your personality</p>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-600">Recording…</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {formatDuration(recordingSeconds)}
                    </p>
                  </div>
                  <button
                    onClick={stopRecording}
                    className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center"
                  >
                    <MicOff className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── About me ──────────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            About Me
          </h2>
          <div className="space-y-4 bg-muted/40 rounded-2xl p-4 border border-border">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Display name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Bio</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Tell people what makes you, you…"
                className="bg-background resize-none"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {bio.length > 0 && bio.length < BIO_MIN
                    ? `${BIO_MIN - bio.length} more chars to go`
                    : 'Empty to hide'}
                </span>
                <span className={bio.length >= BIO_MIN ? 'text-emerald-600 font-medium' : ''}>
                  {bio.length}/1000
                </span>
              </div>
            </div>
            {aboutError && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                {aboutError}
              </p>
            )}
            <Button
              onClick={saveAbout}
              disabled={savingAbout}
              className="w-full rounded-full"
              size="sm"
            >
              {savingAbout ? 'Saving…' : savedAbout ? (
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Saved</span>
              ) : (
                <span className="flex items-center gap-1.5"><Pencil className="w-4 h-4" /> Save about me</span>
              )}
            </Button>
          </div>
        </section>

        {/* ── Preferences ────────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Preferences
          </h2>
          <div className="space-y-4 bg-muted/40 rounded-2xl p-4 border border-border">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Looking for</Label>
              <div className="grid grid-cols-2 gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSeekingGender(g)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                      seekingGender === g
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/50 bg-background'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Age range</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={18}
                  max={maxAge}
                  value={minAge}
                  onChange={(e) => setMinAge(Number(e.target.value))}
                  className="w-20 text-center bg-background"
                />
                <span className="text-muted-foreground text-sm flex-1 text-center">to</span>
                <Input
                  type="number"
                  min={minAge}
                  max={99}
                  value={maxAge}
                  onChange={(e) => setMaxAge(Number(e.target.value))}
                  className="w-20 text-center bg-background"
                />
              </div>
            </div>

            <Button
              onClick={savePreferences}
              disabled={savingPrefs}
              className="w-full rounded-full"
              size="sm"
            >
              {savingPrefs ? 'Saving…' : savedPrefs ? (
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Saved</span>
              ) : 'Save preferences'}
            </Button>
          </div>
        </section>

      </div>
    </div>
  )
}
