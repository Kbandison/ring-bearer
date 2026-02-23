import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
    name?: string
    bio?: string
    seeking_gender?: string
    min_age?: number
    max_age?: number
  }

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!myProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.bio !== undefined && { bio: body.bio || null }),
      ...(body.seeking_gender !== undefined && { seeking_gender: body.seeking_gender }),
      ...(body.min_age !== undefined && { min_age: body.min_age }),
      ...(body.max_age !== undefined && { max_age: body.max_age }),
    })
    .eq('id', myProfile.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ profile: data })
}
