import { createClient } from '../client'

export const signUp = async (email: string, password: string) => {
  const supabase = createClient()
  return supabase.auth.signUp({ email, password })
}

export const signIn = async (email: string, password: string) => {
  const supabase = createClient()
  return supabase.auth.signInWithPassword({ email, password })
}

export const signOut = async () => {
  const supabase = createClient()
  return supabase.auth.signOut()
}

export const getSession = async () => {
  const supabase = createClient()
  return supabase.auth.getSession()
}

export const getUser = async () => {
  const supabase = createClient()
  return supabase.auth.getUser()
}
