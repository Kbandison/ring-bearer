import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { voiceIntroId, action } = (await request.json()) as {
    voiceIntroId: string
    action: 'approve' | 'reject'
  }

  const service = createServiceClient()
  const { error } = await service
    .from('voice_intros')
    .update({ moderation_status: action === 'approve' ? 'approved' : 'rejected' })
    .eq('id', voiceIntroId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
