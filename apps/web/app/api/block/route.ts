import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { blockedProfileId } = await request.json() as { blockedProfileId: string }

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!myProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (myProfile.id === blockedProfileId) {
    return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 })
  }

  const { error } = await supabase.from('blocks').insert({
    blocker_id: myProfile.id,
    blocked_id: blockedProfileId,
  })

  // Ignore duplicate block errors
  if (error && !error.message.includes('duplicate')) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
