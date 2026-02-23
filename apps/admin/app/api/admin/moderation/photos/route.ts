import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { photoId, action } = (await request.json()) as {
    photoId: string
    action: 'approve' | 'reject'
  }

  const service = createServiceClient()
  const { error } = await service
    .from('photos')
    .update({ moderation_status: action === 'approve' ? 'approved' : 'rejected' })
    .eq('id', photoId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
