import { createClient } from '../client'
import type { Profile } from '../types/database'

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data
}

export const updateProfile = async (
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'user_id' | 'created_at'>>
): Promise<Profile | null> => {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single()
  return data
}

export const createProfile = async (
  profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
): Promise<Profile | null> => {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single()
  return data
}
