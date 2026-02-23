import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Camera, Mic, MicOff, Play, Pause, Trash2, Plus, Check } from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '@/lib/supabase'

interface PhotoRow {
  id: string
  url: string
  display_order: number
  moderation_status: string
}

function calcAge(birthdate: string): number {
  const today = new Date()
  const dob = new Date(birthdate)
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age
}

export default function MyProfileScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [bio, setBio] = useState<string | null>(null)
  const [photos, setPhotos] = useState<PhotoRow[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, birthdate, bio')
      .eq('user_id', user.id)
      .single()

    if (!profile) { router.replace('/(auth)/login'); return }

    setProfileId(profile.id)
    setName(profile.name)
    setBirthdate(profile.birthdate)
    setBio(profile.bio)

    const { data: photosData } = await supabase
      .from('photos')
      .select('id, url, display_order, moderation_status')
      .eq('profile_id', profile.id)
      .order('display_order')

    setPhotos(photosData ?? [])
    setLoading(false)
  }

  const handleAddPhoto = async () => {
    if (photos.length >= 6) {
      Alert.alert('Max photos', 'You can have up to 6 photos.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    })
    if (result.canceled || !result.assets[0] || !profileId) return

    const asset = result.assets[0]
    const ext = asset.uri.split('.').pop() ?? 'jpg'
    const path = `${profileId}/${Date.now()}.${ext}`

    setUploadingPhoto(true)

    // Read file as blob
    const response = await fetch(asset.uri)
    const blob = await response.blob()

    const { error } = await supabase.storage.from('profile-photos').upload(path, blob, {
      contentType: asset.mimeType ?? 'image/jpeg',
    })

    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('profile-photos').getPublicUrl(path)
      const { data: row } = await supabase
        .from('photos')
        .insert({
          profile_id: profileId,
          url: publicUrl,
          storage_path: path,
          display_order: photos.length,
          moderation_status: 'pending',
        })
        .select('id, url, display_order, moderation_status')
        .single()
      if (row) setPhotos((prev) => [...prev, row])
    }

    setUploadingPhoto(false)
  }

  const handleDeletePhoto = async (photoId: string) => {
    Alert.alert('Delete photo', 'Remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await supabase.from('photos').delete().eq('id', photoId)
          setPhotos((prev) => prev.filter((p) => p.id !== photoId))
        },
      },
    ])
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color="#f43f5e" />
      </SafeAreaView>
    )
  }

  const primaryPhoto = photos[0]

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1">
        {/* Header photo */}
        <View className="relative w-full" style={{ aspectRatio: 4 / 3 }}>
          {primaryPhoto ? (
            <Image source={{ uri: primaryPhoto.url }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full bg-rose-50 items-center justify-center gap-2">
              <Camera size={40} color="#fda4af" />
              <Text className="text-sm text-rose-300 font-medium">Add your first photo</Text>
            </View>
          )}
          <View className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
          <View className="absolute bottom-4 left-5">
            <Text className="text-white text-3xl font-bold">{name}, {calcAge(birthdate)}</Text>
          </View>
        </View>

        <View className="px-5 py-5 gap-7">
          {/* Photos grid */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Photos</Text>
              <Text className="text-xs text-gray-400">{photos.length} / 6</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {photos.map((photo) => (
                <Pressable
                  key={photo.id}
                  onLongPress={() => handleDeletePhoto(photo.id)}
                  className="relative overflow-hidden rounded-2xl"
                  style={{ width: '31%', aspectRatio: 1 }}
                >
                  <Image source={{ uri: photo.url }} className="w-full h-full" resizeMode="cover" />
                  {photo.moderation_status === 'pending' && (
                    <View className="absolute bottom-1 left-1 bg-yellow-400 rounded-full px-1.5 py-0.5">
                      <Text className="text-[9px] font-bold text-yellow-900">Review</Text>
                    </View>
                  )}
                </Pressable>
              ))}
              {photos.length < 6 && (
                <Pressable
                  onPress={handleAddPhoto}
                  disabled={uploadingPhoto}
                  className="border-2 border-dashed border-gray-200 rounded-2xl items-center justify-center active:bg-gray-50"
                  style={{ width: '31%', aspectRatio: 1 }}
                >
                  {uploadingPhoto ? (
                    <ActivityIndicator size="small" color="#f43f5e" />
                  ) : (
                    <>
                      <Plus size={20} color="#9ca3af" />
                      <Text className="text-xs text-gray-400 mt-1">Add</Text>
                    </>
                  )}
                </Pressable>
              )}
            </View>
            <Text className="text-xs text-gray-400 mt-2">Long press a photo to delete. New photos are reviewed first.</Text>
          </View>

          {/* Bio */}
          {bio && (
            <View>
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">About</Text>
              <Text className="text-sm text-gray-700 leading-relaxed">{bio}</Text>
            </View>
          )}

          {/* Edit button */}
          <Pressable
            onPress={() => router.push('/(app)/settings')}
            className="bg-rose-500 rounded-2xl py-4 items-center active:opacity-80"
          >
            <Text className="text-white font-semibold text-base">Edit Profile Details</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
