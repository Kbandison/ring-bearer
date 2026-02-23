import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatView } from '@/components/chat/chat-view'

export default async function ChatPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!myProfile) redirect('/onboarding')

  const { data: conv } = await supabase
    .from('conversations')
    .select('id, match_id, last_message_at')
    .eq('id', params.id)
    .single()

  if (!conv) redirect('/matches')

  const { data: match } = await supabase
    .from('matches')
    .select('id, profile_a_id, profile_b_id')
    .eq('id', conv.match_id)
    .is('unmatched_at', null)
    .single()

  if (
    !match ||
    (match.profile_a_id !== myProfile.id && match.profile_b_id !== myProfile.id)
  ) {
    redirect('/matches')
  }

  const otherProfileId =
    match.profile_a_id === myProfile.id ? match.profile_b_id : match.profile_a_id

  const [profileRes, photoRes, messagesRes] = await Promise.all([
    supabase.from('profiles').select('id, name').eq('id', otherProfileId).single(),
    supabase
      .from('photos')
      .select('url')
      .eq('profile_id', otherProfileId)
      .eq('moderation_status', 'approved')
      .order('display_order')
      .limit(1)
      .maybeSingle(),
    supabase
      .from('messages')
      .select('id, sender_id, content, read_at, created_at')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true }),
  ])

  return (
    <ChatView
      conversationId={conv.id}
      matchId={match.id}
      myProfileId={myProfile.id}
      otherProfile={{
        id: otherProfileId,
        name: profileRes.data?.name ?? 'Unknown',
        photoUrl: photoRes.data?.url ?? null,
      }}
      initialMessages={messagesRes.data ?? []}
    />
  )
}
