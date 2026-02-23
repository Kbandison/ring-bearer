import { createClient } from '../client'
import type { VoiceIntro } from '../types/database'

export const getVoiceIntro = async (
  profileId: string
): Promise<VoiceIntro | null> => {
  const supabase = createClient()
  const { data } = await supabase
    .from('voice_intros')
    .select('*')
    .eq('profile_id', profileId)
    .eq('moderation_status', 'approved')
    .single()
  return data
}

export const uploadVoiceIntro = async (
  profileId: string,
  file: File,
  duration: number
): Promise<VoiceIntro | null> => {
  const supabase = createClient()
  const fileName = `${profileId}/${Date.now()}.webm`

  const { error: uploadError } = await supabase.storage
    .from('voice-intros')
    .upload(fileName, file)

  if (uploadError) throw uploadError

  const {
    data: { publicUrl },
  } = supabase.storage.from('voice-intros').getPublicUrl(fileName)

  const { data } = await supabase
    .from('voice_intros')
    .insert({
      profile_id: profileId,
      url: publicUrl,
      storage_path: fileName,
      duration,
      moderation_status: 'pending',
    })
    .select()
    .single()

  return data
}
