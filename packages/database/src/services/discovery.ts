import { createClient } from '../client'
import type { Profile } from '../types/database'

export interface DiscoveryFilters {
  userId: string
  minAge?: number
  maxAge?: number
  maxDistanceKm?: number
  latitude?: number
  longitude?: number
  gender?: string
}

export const getDiscoveryProfiles = async (
  filters: DiscoveryFilters
): Promise<Profile[]> => {
  const supabase = createClient()

  let query = supabase
    .from('profiles')
    .select('*')
    .neq('user_id', filters.userId)
    .eq('is_active', true)
    .eq('profile_completed', true)

  if (filters.gender) query = query.eq('seeking_gender', filters.gender)

  const { data } = await query.limit(20)
  return data ?? []
}
