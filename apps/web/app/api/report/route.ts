import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reportedProfileId, reason, description: details } = await request.json() as {
    reportedProfileId: string
    reason: string
    description?: string
  }

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!myProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (myProfile.id === reportedProfileId) {
    return NextResponse.json({ error: 'Cannot report yourself' }, { status: 400 })
  }

  const { error } = await supabase.from('reports').insert({
    reporter_id: myProfile.id,
    reported_id: reportedProfileId,
    reason,
    details: details ?? null,
    status: 'pending',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
