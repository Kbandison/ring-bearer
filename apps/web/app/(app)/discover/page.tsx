import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SwipeDeck } from '@/components/discover/swipe-deck'
import type { DiscoverProfile } from '@/components/discover/swipe-card'

export default async function DiscoverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!myProfile) redirect('/onboarding')

  // IDs the current user has already swiped
  const { data: swiped } = await supabase
    .from('swipes')
    .select('swiped_id')
    .eq('swiper_id', myProfile.id)

  // IDs blocked by or blocking the current user
  const { data: blocksData } = await supabase
    .from('blocks')
    .select('blocker_id, blocked_id')
    .or(`blocker_id.eq.${myProfile.id},blocked_id.eq.${myProfile.id}`)

  const blockedIds = (blocksData ?? []).map((b) =>
    b.blocker_id === myProfile.id ? b.blocked_id : b.blocker_id
  )

  const excludeIds = [
    ...(swiped?.map((s) => s.swiped_id) ?? []),
    ...blockedIds,
  ]

  // Fetch candidate profiles
  let query = supabase
    .from('profiles')
    .select('id, name, birthdate, bio')
    .eq('profile_completed', true)
    .eq('is_active', true)
    .neq('user_id', user.id)
    .order('last_active_at', { ascending: false })
    .limit(20)

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { data: rows } = await query
  const profileIds = (rows ?? []).map((r) => r.id)

  // Fetch photos for those profiles
  const { data: photos } = profileIds.length
    ? await supabase
        .from('photos')
        .select('profile_id, url, display_order')
        .in('profile_id', profileIds)
        .eq('moderation_status', 'approved')
        .order('display_order')
    : { data: [] }

  const photosByProfile = (photos ?? []).reduce<
    Record<string, { url: string; display_order: number }[]>
  >((acc, p) => {
    if (!acc[p.profile_id]) acc[p.profile_id] = []
    acc[p.profile_id]!.push({ url: p.url, display_order: p.display_order })
    return acc
  }, {})

  const profiles: DiscoverProfile[] = (rows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    birthdate: row.birthdate,
    bio: row.bio,
    photos: photosByProfile[row.id] ?? [],
  }))

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] max-w-lg mx-auto px-4 pt-4">
      <SwipeDeck profiles={profiles} />
    </div>
  )
}
