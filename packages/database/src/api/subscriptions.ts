import { createClient } from '../client'
import type { Subscription } from '../types/database'

export const getSubscription = async (
  userId: string
): Promise<Subscription | null> => {
  const supabase = createClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()
  return data
}

export const isPremium = async (userId: string): Promise<boolean> => {
  const sub = await getSubscription(userId)
  return sub !== null
}
