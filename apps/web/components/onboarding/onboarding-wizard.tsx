'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'

// ── Schemas per step ──────────────────────────────────────────────────────────

const MIN_AGE_YEARS = 18
const MAX_BIRTHDATE = new Date(
  new Date().setFullYear(new Date().getFullYear() - MIN_AGE_YEARS)
).toISOString().split('T')[0]!

const step1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  birthdate: z
    .string()
    .min(1, 'Enter your date of birth')
    .refine((d) => new Date(d) <= new Date(MAX_BIRTHDATE), {
      message: 'You must be at least 18 years old',
    }),
  gender: z.string().min(1, 'Select your gender'),
  seeking_gender: z.string().min(1, 'Select who you are looking for'),
})

const step2Schema = z.object({
  bio: z
    .string()
    .refine((v) => v.length === 0 || v.length >= 150, {
      message: 'Bio must be at least 150 characters (or leave it empty)',
    })
    .refine((v) => v.length <= 1000, { message: 'Bio must be under 1000 characters' })
    .optional(),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

const GENDERS = ['Man', 'Woman', 'Non-binary', 'Other']
const TOTAL_STEPS = 4

// ── Sub-components ────────────────────────────────────────────────────────────

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
        Step {step} of {TOTAL_STEPS}
      </p>
      <h2 className="text-2xl font-bold">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  )
}

// ── Step 1: Basic Info ────────────────────────────────────────────────────────

function Step1({ onNext }: { onNext: (data: Step1Data) => void }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step1Data>({ resolver: zodResolver(step1Schema) })

  const gender = watch('gender')
  const seekingGender = watch('seeking_gender')

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <StepHeader step={1} title="Tell us about yourself" />

      <div className="space-y-1.5">
        <Label htmlFor="name">Your name</Label>
        <Input id="name" placeholder="First name" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="birthdate">Date of birth</Label>
        <Input
          id="birthdate"
          type="date"
          max={MAX_BIRTHDATE}
          {...register('birthdate')}
        />
        {errors.birthdate && <p className="text-sm text-destructive">{errors.birthdate.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>I am a…</Label>
        <div className="grid grid-cols-2 gap-2">
          {GENDERS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setValue('gender', g)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                gender === g
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background hover:border-foreground/50'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Looking for…</Label>
        <div className="grid grid-cols-2 gap-2">
          {GENDERS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setValue('seeking_gender', g)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                seekingGender === g
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background hover:border-foreground/50'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        {errors.seeking_gender && (
          <p className="text-sm text-destructive">{errors.seeking_gender.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full">
        Continue
      </Button>
    </form>
  )
}

// ── Step 2: Bio ───────────────────────────────────────────────────────────────

function Step2({
  onNext,
  onBack,
}: {
  onNext: (data: Step2Data) => void
  onBack: () => void
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step2Data>({ resolver: zodResolver(step2Schema) })

  const bio = watch('bio') ?? ''

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <StepHeader
        step={2}
        title="Write your bio"
        subtitle="Tell people what makes you, you. (Optional — you can skip for now)"
      />

      <div className="space-y-1.5">
        <Textarea
          placeholder="Tell people what makes you, you — your passions, what you're looking for, what makes you laugh..."
          rows={6}
          maxLength={1000}
          {...register('bio')}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{bio.length > 0 && bio.length < 150 ? `${150 - bio.length} more to go` : 'Leave empty to skip'}</span>
          <span className={bio.length >= 150 ? 'text-green-600' : ''}>{bio.length}/1000</span>
        </div>
        {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" className="flex-1">
          Continue
        </Button>
      </div>
    </form>
  )
}

// ── Step 3: Photos ────────────────────────────────────────────────────────────

function Step3({
  profileId,
  onNext,
  onBack,
}: {
  profileId: string
  onNext: () => void
  onBack: () => void
}) {
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (photos.length + files.length > 6) {
      setError('Maximum 6 photos allowed')
      return
    }
    setPhotos((prev) => [...prev, ...files])
    setPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ])
    setError(null)
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (photos.length === 0) {
      onNext()
      return
    }

    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()

      await Promise.all(
        photos.map(async (file, index) => {
          const fileName = `${profileId}/${Date.now()}-${index}-${file.name}`
          const { error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(fileName, file)

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(fileName)

          await supabase.from('photos').insert({
            profile_id: profileId,
            url: publicUrl,
            storage_path: fileName,
            display_order: index,
            moderation_status: 'pending',
          })
        })
      )

      onNext()
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : JSON.stringify(err)
      setError(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-5">
      <StepHeader
        step={3}
        title="Add your photos"
        subtitle="Add 2–6 photos. Your first photo is your main profile picture."
      />

      <div className="grid grid-cols-3 gap-2">
        {previews.map((src, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-muted">
            <img src={src} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute top-1 right-1 rounded-full bg-black/60 text-white w-5 h-5 flex items-center justify-center text-xs font-bold"
            >
              ×
            </button>
          </div>
        ))}
        {previews.length < 6 && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-foreground/50 transition-colors">
            <span className="text-2xl text-muted-foreground">+</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : photos.length === 0 ? 'Skip for now' : 'Upload & continue'}
        </Button>
      </div>
    </div>
  )
}

// ── Step 4: Voice Intro ───────────────────────────────────────────────────────

function Step4({
  profileId,
  onNext,
  onBack,
}: {
  profileId: string
  onNext: () => void
  onBack: () => void
}) {
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((t) => t.stop())
      }

      setMediaRecorder(recorder)
      recorder.start()
      setRecording(true)
    } catch {
      setError('Could not access microphone')
    }
  }

  const stopRecording = () => {
    mediaRecorder?.stop()
    setRecording(false)
  }

  const handleUpload = async () => {
    if (!audioBlob) {
      onNext()
      return
    }

    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const fileName = `${profileId}/${Date.now()}.webm`
      const file = new File([audioBlob], fileName, { type: 'audio/webm' })

      const { error: uploadError } = await supabase.storage
        .from('voice-intros')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('voice-intros')
        .getPublicUrl(fileName)

      await supabase.from('voice_intros').insert({
        profile_id: profileId,
        url: publicUrl,
        storage_path: fileName,
        moderation_status: 'pending',
      })

      onNext()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-5">
      <StepHeader
        step={4}
        title="Record a voice intro"
        subtitle="Profiles with a voice intro get 3× more views. Keep it under 60 seconds. (Optional)"
      />

      <div className="flex flex-col items-center gap-4 py-6">
        {!audioUrl ? (
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl transition-colors ${
              recording
                ? 'bg-destructive animate-pulse text-destructive-foreground'
                : 'bg-foreground text-background hover:bg-foreground/90'
            }`}
          >
            {recording ? '⏹' : '🎙️'}
          </button>
        ) : (
          <div className="w-full space-y-3">
            <audio src={audioUrl} controls className="w-full" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setAudioBlob(null)
                setAudioUrl(null)
              }}
            >
              Record again
            </Button>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          {recording ? 'Recording… tap to stop' : audioUrl ? 'Preview your intro' : 'Tap to start recording'}
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : audioUrl ? 'Upload & finish' : 'Skip for now'}
        </Button>
      </div>
    </div>
  )
}

// ── Main Wizard ───────────────────────────────────────────────────────────────

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [error, setError] = useState<string | null>(null)

  const progress = (step / TOTAL_STEPS) * 100

  const handleStep1 = (data: Step1Data) => {
    setStep1Data(data)
    setStep(2)
  }

  const handleStep2 = async (data: Step2Data) => {
    if (!step1Data) return
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          name: step1Data.name,
          birthdate: step1Data.birthdate,
          gender: step1Data.gender,
          seeking_gender: step1Data.seeking_gender,
          bio: data.bio && data.bio.length >= 150 ? data.bio : null,
          profile_completed: false,
        })
        .select()
        .single()

      if (profileError) throw profileError

      setProfileId(profile.id)
      setStep(3)
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Failed to create profile'
      setError(msg)
    }
  }

  const handleStep3Done = () => setStep(4)

  const handleStep4Done = async () => {
    if (!profileId) return

    try {
      const supabase = createClient()
      await supabase
        .from('profiles')
        .update({ profile_completed: true })
        .eq('id', profileId)

      router.push('/discover')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-4 pt-6">
        <Progress value={progress} className="h-1.5" />
      </div>

      <div className="flex-1 px-4 py-8 max-w-sm mx-auto w-full">
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {step === 1 && <Step1 onNext={handleStep1} />}
        {step === 2 && <Step2 onNext={handleStep2} onBack={() => setStep(1)} />}
        {step === 3 && profileId && (
          <Step3
            profileId={profileId}
            onNext={handleStep3Done}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && profileId && (
          <Step4
            profileId={profileId}
            onNext={handleStep4Done}
            onBack={() => setStep(3)}
          />
        )}
      </div>
    </div>
  )
}
