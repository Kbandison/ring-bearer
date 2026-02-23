import { createClient } from '../client'
import type { Match, Conversation } from '../types/database'

export const getMatches = async (userId: string): Promise<Match[]> => {
  const supabase = createClient()
  const { data } = await supabase
    .from('matches')
    .select('*')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('created_at', { ascending: false })
  return data ?? []
}

export const getConversation = async (
  matchId: string
): Promise<Conversation | null> => {
  const supabase = createClient()
  const { data } = await supabase
    .from('conversations')
    .select('*')
    .eq('match_id', matchId)
    .single()
  return data
}
