import { createClient } from '../client'

export const checkForMatch = async (
  swiperId: string,
  swipedId: string
): Promise<boolean> => {
  const supabase = createClient()

  // Check if swiped user also liked swiper
  const { data: reciprocalSwipe } = await supabase
    .from('swipes')
    .select('id')
    .eq('swiper_id', swipedId)
    .eq('swiped_id', swiperId)
    .in('direction', ['like', 'super_like'])
    .single()

  return reciprocalSwipe !== null
}
