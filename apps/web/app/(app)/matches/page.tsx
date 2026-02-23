import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MatchList } from '@/components/matches/match-list'

export type MatchPreview = {
  matchId: string
  conversationId: string
  profile: { id: string; name: string; photoUrl: string | null }
  lastMessagePreview: string | null
  lastMessageAt: string | null
  isExpired: boolean
}

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!myProfile) redirect('/onboarding')

  // Only active (not unmatched) matches
  const { data: matches } = await supabase
    .from('matches')
    .select('id, profile_a_id, profile_b_id, created_at')
    .or(`profile_a_id.eq.${myProfile.id},profile_b_id.eq.${myProfile.id}`)
    .is('unmatched_at', null)
    .order('created_at', { ascending: false })

  if (!matches?.length) {
    return <MatchList matches={[]} />
  }

  const otherProfileIds = matches.map((m) =>
    m.profile_a_id === myProfile.id ? m.profile_b_id : m.profile_a_id
  )
  const matchIds = matches.map((m) => m.id)

  const [profilesRes, photosRes, convsRes] = await Promise.all([
    supabase.from('profiles').select('id, name').in('id', otherProfileIds),
    supabase
      .from('photos')
      .select('profile_id, url')
      .in('profile_id', otherProfileIds)
      .eq('moderation_status', 'approved')
      .order('display_order'),
    supabase
      .from('conversations')
      .select('id, match_id, last_message_at, last_message_preview, is_expired')
      .in('match_id', matchIds),
  ])

  const profileMap = Object.fromEntries(
    (profilesRes.data ?? []).map((p) => [p.id, p])
  )
  const firstPhotoMap = (photosRes.data ?? []).reduce<Record<string, string>>(
    (acc, p) => {
      if (!acc[p.profile_id]) acc[p.profile_id] = p.url
      return acc
    },
    {}
  )
  const convByMatch = Object.fromEntries(
    (convsRes.data ?? []).map((c) => [c.match_id, c])
  )

  const previews: MatchPreview[] = matches
    .map((m) => {
      const otherId = m.profile_a_id === myProfile.id ? m.profile_b_id : m.profile_a_id
      const conv = convByMatch[m.id]
      return {
        matchId: m.id,
        conversationId: conv?.id ?? '',
        profile: {
          id: otherId,
          name: profileMap[otherId]?.name ?? 'Unknown',
          photoUrl: firstPhotoMap[otherId] ?? null,
        },
        lastMessagePreview: conv?.last_message_preview ?? null,
        lastMessageAt: conv?.last_message_at ?? null,
        isExpired: conv?.is_expired ?? false,
      }
    })
    .sort((a, b) => {
      if (a.lastMessageAt && b.lastMessageAt) {
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      }
      if (a.lastMessageAt) return -1
      if (b.lastMessageAt) return 1
      return 0
    })

  return <MatchList matches={previews} />
}
