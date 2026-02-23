import { createClient } from '../client'
import type { Swipe } from '../types/database'

export const createSwipe = async (swipe: {
  swiper_id: string
  swiped_id: string
  direction: 'like' | 'pass' | 'super_like'
}): Promise<Swipe | null> => {
  const supabase = createClient()
  const { data } = await supabase
    .from('swipes')
    .insert(swipe)
    .select()
    .single()
  return data
}

export const getDailySwipeCount = async (userId: string): Promise<number> => {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('daily_swipe_counts')
    .select('count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()
  return data?.count ?? 0
}
