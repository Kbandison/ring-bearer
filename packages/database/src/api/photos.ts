import { createClient } from '../client'
import type { Photo } from '../types/database'

export const getProfilePhotos = async (profileId: string): Promise<Photo[]> => {
  const supabase = createClient()
  const { data } = await supabase
    .from('photos')
    .select('*')
    .eq('profile_id', profileId)
    .eq('moderation_status', 'approved')
    .order('display_order', { ascending: true })
  return data ?? []
}

export const uploadPhoto = async (
  profileId: string,
  file: File,
  displayOrder: number
): Promise<Photo | null> => {
  const supabase = createClient()
  const fileName = `${profileId}/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('profile-photos')
    .upload(fileName, file)

  if (uploadError) throw uploadError

  const {
    data: { publicUrl },
  } = supabase.storage.from('profile-photos').getPublicUrl(fileName)

  const { data } = await supabase
    .from('photos')
    .insert({
      profile_id: profileId,
      url: publicUrl,
      storage_path: fileName,
      display_order: displayOrder,
      moderation_status: 'pending',
    })
    .select()
    .single()

  return data
}

export const deletePhoto = async (photoId: string, storagePath: string): Promise<void> => {
  const supabase = createClient()
  await supabase.storage.from('profile-photos').remove([storagePath])
  await supabase.from('photos').delete().eq('id', photoId)
}
