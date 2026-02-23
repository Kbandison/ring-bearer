'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Profile } from '@/lib/supabase/types'

const GENDERS = ['Man', 'Woman', 'Non-binary', 'Other']
const BIO_MIN = 150

interface EditProfileFormProps {
  profile: Pick<Profile, 'name' | 'bio' | 'seeking_gender' | 'min_age' | 'max_age'>
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
  const router = useRouter()
  const [name, setName] = useState(profile.name)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [seekingGender, setSeekingGender] = useState(profile.seeking_gender)
  const [minAge, setMinAge] = useState(profile.min_age ?? 18)
  const [maxAge, setMaxAge] = useState(profile.max_age ?? 99)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    if (bio && bio.length > 0 && bio.length < BIO_MIN) {
      setError(`Bio must be at least ${BIO_MIN} characters or left empty`)
      return
    }
    setSaving(true)
    setError(null)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bio, seeking_gender: seekingGender, min_age: minAge, max_age: maxAge }),
    })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json() as { error: string }
      setError(data.error)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">{error}</p>
      )}

      <div className="space-y-1.5">
        <Label>Display name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
      </div>

      <div className="space-y-1.5">
        <Label>Bio</Label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={5}
          maxLength={1000}
          placeholder="Tell people what makes you, you…"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {bio.length > 0 && bio.length < BIO_MIN
              ? `${BIO_MIN - bio.length} more to go`
              : 'Leave empty to hide'}
          </span>
          <span className={bio.length >= BIO_MIN ? 'text-green-600' : ''}>{bio.length}/1000</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Looking for</Label>
        <div className="grid grid-cols-2 gap-2">
          {GENDERS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setSeekingGender(g)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                seekingGender === g
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border hover:border-foreground/50'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Age range</Label>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min={18}
            max={maxAge}
            value={minAge}
            onChange={(e) => setMinAge(Number(e.target.value))}
            className="w-20 text-center"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="number"
            min={minAge}
            max={99}
            value={maxAge}
            onChange={(e) => setMaxAge(Number(e.target.value))}
            className="w-20 text-center"
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
      </Button>
    </div>
  )
}
