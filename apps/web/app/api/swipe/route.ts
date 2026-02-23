import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const FREE_DAILY_LIMIT = 20

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { swipedProfileId, direction } = await request.json() as {
    swipedProfileId: string
    direction: 'like' | 'pass'
  }

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!myProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Check swipe limit for free users
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('profile_id', myProfile.id)
    .single()

  const isPremium = subscription?.tier === 'premium' && subscription?.status === 'active'

  if (!isPremium) {
    const today = new Date().toISOString().split('T')[0]!
    const { data: swipeCount } = await supabase
      .from('daily_swipe_counts')
      .select('id, swipe_count')
      .eq('profile_id', myProfile.id)
      .eq('swipe_date', today)
      .maybeSingle()

    if ((swipeCount?.swipe_count ?? 0) >= FREE_DAILY_LIMIT) {
      return NextResponse.json(
        { error: 'Daily limit reached', limitReached: true },
        { status: 429 }
      )
    }

    // Increment count
    if (swipeCount) {
      await supabase
        .from('daily_swipe_counts')
        .update({ swipe_count: (swipeCount.swipe_count ?? 0) + 1 })
        .eq('id', swipeCount.id)
    } else {
      await supabase
        .from('daily_swipe_counts')
        .insert({ profile_id: myProfile.id, swipe_date: today, swipe_count: 1 })
    }
  }

  // Record the swipe — DB trigger check_and_create_match handles match + conversation creation
  const { error: swipeError } = await supabase.from('swipes').insert({
    swiper_id: myProfile.id,
    swiped_id: swipedProfileId,
    direction,
  })

  if (swipeError) return NextResponse.json({ error: swipeError.message }, { status: 500 })

  // Check if a match was just created by the trigger
  if (direction === 'like') {
    const sorted = [myProfile.id, swipedProfileId].sort()
    const { data: match } = await supabase
      .from('matches')
      .select('id')
      .eq('profile_a_id', sorted[0]!)
      .eq('profile_b_id', sorted[1]!)
      .is('unmatched_at', null)
      .maybeSingle()

    if (match) return NextResponse.json({ matched: true, matchId: match.id })
  }

  return NextResponse.json({ matched: false })
}
