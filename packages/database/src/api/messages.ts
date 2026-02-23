import { createClient } from '../client'
import type { Message } from '../types/database'

export const getMessages = async (
  conversationId: string
): Promise<Message[]> => {
  const supabase = createClient()
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  return data ?? []
}

export const sendMessage = async (message: {
  conversation_id: string
  sender_id: string
  content: string
}): Promise<Message | null> => {
  const supabase = createClient()
  const { data } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single()
  return data
}

export const markMessagesRead = async (
  conversationId: string,
  recipientId: string
): Promise<void> => {
  const supabase = createClient()
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', recipientId)
    .eq('is_read', false)
}
