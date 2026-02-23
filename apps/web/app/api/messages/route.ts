import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { conversationId, content } = await request.json() as {
    conversationId: string
    content: string
  }

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content required' }, { status: 400 })
  }

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!myProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Verify user is part of this conversation's match
  const { data: conv } = await supabase
    .from('conversations')
    .select('id, match_id')
    .eq('id', conversationId)
    .single()

  if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

  const { data: match } = await supabase
    .from('matches')
    .select('profile_a_id, profile_b_id')
    .eq('id', conv.match_id)
    .is('unmatched_at', null)
    .single()

  if (
    !match ||
    (match.profile_a_id !== myProfile.id && match.profile_b_id !== myProfile.id)
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: myProfile.id,
      content: content.trim(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // last_message_at and last_message_preview are updated by DB trigger
  return NextResponse.json({ message })
}
