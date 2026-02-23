import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reportId, reportedProfileId, action } = (await request.json()) as {
    reportId: string
    reportedProfileId: string
    action: 'dismiss' | 'ban'
  }

  const service = createServiceClient()

  // Update report status
  const newStatus = action === 'ban' ? 'reviewed' : 'dismissed'
  const { error: reportError } = await service
    .from('reports')
    .update({
      status: newStatus,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', reportId)

  if (reportError) return NextResponse.json({ error: reportError.message }, { status: 500 })

  // If banning, update the profile
  if (action === 'ban') {
    const { error: banError } = await service
      .from('profiles')
      .update({ is_banned: true, is_active: false })
      .eq('id', reportedProfileId)

    if (banError) return NextResponse.json({ error: banError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
