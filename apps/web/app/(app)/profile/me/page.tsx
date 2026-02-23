import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileEditor } from '@/components/profile/profile-editor'

export default async function MyProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, birthdate, bio, gender, seeking_gender, location_name, min_age, max_age')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  const [photosRes, voiceRes] = await Promise.all([
    supabase
      .from('photos')
      .select('id, url, display_order, moderation_status')
      .eq('profile_id', profile.id)
      .order('display_order'),
    supabase
      .from('voice_intros')
      .select('id, url, duration_seconds')
      .eq('profile_id', profile.id)
      .maybeSingle(),
  ])

  return (
    <ProfileEditor
      profile={{
        id: profile.id,
        name: profile.name,
        birthdate: profile.birthdate,
        bio: profile.bio,
        gender: profile.gender,
        seekingGender: profile.seeking_gender,
        locationName: profile.location_name,
        minAge: profile.min_age ?? 18,
        maxAge: profile.max_age ?? 99,
      }}
      photos={photosRes.data ?? []}
      voiceIntro={voiceRes.data ?? null}
    />
  )
}
