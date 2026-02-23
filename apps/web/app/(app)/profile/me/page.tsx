import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileView } from '@/components/profile/profile-view'

export default async function MyProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'id, name, birthdate, bio, gender, seeking_gender, location_name, response_rate'
    )
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  const [photosRes, voiceRes] = await Promise.all([
    supabase
      .from('photos')
      .select('id, url, display_order')
      .eq('profile_id', profile.id)
      .order('display_order'),
    supabase
      .from('voice_intros')
      .select('url, duration_seconds')
      .eq('profile_id', profile.id)
      .maybeSingle(),
  ])

  return (
    <ProfileView
      profile={{
        id: profile.id,
        name: profile.name,
        birthdate: profile.birthdate,
        bio: profile.bio,
        gender: profile.gender,
        seekingGender: profile.seeking_gender,
        locationName: profile.location_name,
        responseRate: profile.response_rate,
      }}
      photos={photosRes.data ?? []}
      voiceIntro={voiceRes.data ?? null}
      myProfileId={profile.id}
      existingSwipe={null}
      matchId={null}
      conversationId={null}
      isOwnProfile
    />
  )
}
