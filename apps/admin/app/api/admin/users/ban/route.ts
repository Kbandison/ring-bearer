import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: Request) {
  // Verify the caller is authenticated
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { profileId, action } = (await request.json()) as {
    profileId: string
    action: 'ban' | 'unban'
  }

  const service = createServiceClient()
  const { error } = await service
    .from('profiles')
    .update({ is_banned: action === 'ban', is_active: action !== 'ban' })
    .eq('id', profileId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
