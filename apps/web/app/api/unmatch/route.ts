import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { matchId } = await request.json() as { matchId: string }

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!myProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { data: match } = await supabase
    .from('matches')
    .select('id, profile_a_id, profile_b_id')
    .eq('id', matchId)
    .is('unmatched_at', null)
    .single()

  if (
    !match ||
    (match.profile_a_id !== myProfile.id && match.profile_b_id !== myProfile.id)
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Soft delete — preserves history for moderation
  const { error } = await supabase
    .from('matches')
    .update({
      unmatched_at: new Date().toISOString(),
      unmatched_by: myProfile.id,
    })
    .eq('id', matchId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
