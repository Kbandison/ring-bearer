import { useState } from 'react'
import {
  View, Text, Pressable, Image, ActivityIndicator, ScrollView, Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Plus, Trash2 } from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '@/lib/supabase'

interface UploadedPhoto {
  id: string
  url: string
}

export default function Step3() {
  const router = useRouter()
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [uploading, setUploading] = useState(false)
  const [finishing, setFinishing] = useState(false)

  const addPhoto = async () => {
    if (photos.length >= 6) return
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    })
    if (result.canceled || !result.assets[0]) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase
      .from('profiles').select('id').eq('user_id', user.id).single()
    if (!profile) return

    const asset = result.assets[0]
    const ext = asset.uri.split('.').pop() ?? 'jpg'
    const path = `${profile.id}/${Date.now()}.${ext}`

    setUploading(true)
    const response = await fetch(asset.uri)
    const blob = await response.blob()
    const { error } = await supabase.storage
      .from('profile-photos')
      .upload(path, blob, { contentType: asset.mimeType ?? 'image/jpeg' })

    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('profile-photos').getPublicUrl(path)
      const { data: row } = await supabase
        .from('photos')
        .insert({
          profile_id: profile.id,
          url: publicUrl,
          storage_path: path,
          display_order: photos.length,
          moderation_status: 'pending',
        })
        .select('id, url')
        .single()
      if (row) setPhotos((prev) => [...prev, { id: row.id, url: row.url }])
    }
    setUploading(false)
  }

  const removePhoto = (id: string) => {
    Alert.alert('Remove photo', 'Remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          await supabase.from('photos').delete().eq('id', id)
          setPhotos((prev) => prev.filter((p) => p.id !== id))
        },
      },
    ])
  }

  const handleNext = () => router.push('/(onboarding)/step4')

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-16 pb-10">
          {/* Progress */}
          <View className="flex-row gap-1.5 mb-10">
            {[1,2,3,4].map((s) => (
              <View key={s} className={`flex-1 h-1 rounded-full ${s <= 3 ? 'bg-rose-500' : 'bg-gray-200'}`} />
            ))}
          </View>

          <Text className="text-3xl font-bold text-gray-900 mb-1">Add photos</Text>
          <Text className="text-base text-gray-500 mb-2">Profiles with photos get far more matches</Text>
          <Text className="text-xs text-gray-400 mb-8">{photos.length} / 6 photos — at least 1 recommended</Text>

          <View className="flex-row flex-wrap gap-3">
            {photos.map((photo) => (
              <View key={photo.id} className="relative overflow-hidden rounded-2xl" style={{ width: '30%', aspectRatio: 3/4 }}>
                <Image source={{ uri: photo.url }} className="w-full h-full" resizeMode="cover" />
                <Pressable
                  onPress={() => removePhoto(photo.id)}
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 items-center justify-center"
                >
                  <Trash2 size={13} color="white" />
                </Pressable>
              </View>
            ))}

            {photos.length < 6 && (
              <Pressable
                onPress={addPhoto}
                disabled={uploading}
                className="border-2 border-dashed border-gray-200 rounded-2xl items-center justify-center active:bg-gray-50"
                style={{ width: '30%', aspectRatio: 3/4 }}
              >
                {uploading
                  ? <ActivityIndicator color="#f43f5e" />
                  : <><Plus size={24} color="#d1d5db" /><Text className="text-xs text-gray-400 mt-1">Add</Text></>
                }
              </Pressable>
            )}
          </View>

          <View className="flex-1" />

          <View className="gap-3 mt-8">
            <Pressable
              onPress={handleNext}
              className="bg-rose-500 rounded-2xl py-4 items-center active:opacity-80"
            >
              <Text className="text-white font-semibold text-base">
                {photos.length > 0 ? 'Continue' : 'Skip for now'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
