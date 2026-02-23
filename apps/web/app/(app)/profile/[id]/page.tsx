import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileView } from '@/components/profile/profile-view'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: profileId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!myProfile) redirect('/onboarding')

  // Prevent viewing your own profile this way
  if (myProfile.id === profileId) redirect('/settings')

  // Fetch the viewed profile
  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'id, name, birthdate, bio, gender, seeking_gender, location_name, response_rate, is_active, is_banned'
    )
    .eq('id', profileId)
    .single()

  if (!profile || profile.is_banned) notFound()

  // Photos, voice intro, swipe status, match — all in parallel
  const [photosRes, voiceRes, swipeRes, matchRes] = await Promise.all([
    supabase
      .from('photos')
      .select('id, url, display_order')
      .eq('profile_id', profileId)
      .eq('moderation_status', 'approved')
      .order('display_order'),
    supabase
      .from('voice_intros')
      .select('url, duration_seconds')
      .eq('profile_id', profileId)
      .eq('moderation_status', 'approved')
      .maybeSingle(),
    supabase
      .from('swipes')
      .select('direction')
      .eq('swiper_id', myProfile.id)
      .eq('swiped_id', profileId)
      .maybeSingle(),
    supabase
      .from('matches')
      .select('id')
      .or(
        `and(profile_a_id.eq.${[myProfile.id, profileId].sort()[0]},profile_b_id.eq.${[myProfile.id, profileId].sort()[1]})`
      )
      .is('unmatched_at', null)
      .maybeSingle(),
  ])

  // If matched, also fetch the conversation id
  let conversationId: string | null = null
  if (matchRes.data?.id) {
    const { data: conv } = await supabase
      .from('conversations')
      .select('id')
      .eq('match_id', matchRes.data.id)
      .maybeSingle()
    conversationId = conv?.id ?? null
  }

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
      myProfileId={myProfile.id}
      existingSwipe={swipeRes.data?.direction ?? null}
      matchId={matchRes.data?.id ?? null}
      conversationId={conversationId}
    />
  )
}
