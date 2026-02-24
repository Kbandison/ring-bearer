import { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  Switch,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Camera, Plus, Trash2, Check, ChevronDown } from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '@/lib/supabase'

interface PhotoRow {
  id: string
  url: string
  display_order: number
  moderation_status: string
}

const GENDERS = ['man', 'woman', 'non-binary', 'other']
const SEEKING = ['men', 'women', 'everyone', 'non-binary']

function calcAge(birthdate: string): number {
  const today = new Date()
  const dob = new Date(birthdate)
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
      {title}
    </Text>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="text-xs font-medium text-gray-500 mb-1.5">{label}</Text>
      {children}
    </View>
  )
}

function ChipSelector({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => (
        <Pressable
          key={opt}
          onPress={() => onChange(opt)}
          className={`px-4 py-2 rounded-full border ${
            value === opt
              ? 'bg-rose-500 border-rose-500'
              : 'bg-white border-gray-200'
          }`}
        >
          <Text
            className={`text-sm font-medium capitalize ${
              value === opt ? 'text-white' : 'text-gray-600'
            }`}
          >
            {opt}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

export default function MyProfileScreen() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [photos, setPhotos] = useState<PhotoRow[]>([])

  // Editable fields
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [gender, setGender] = useState('man')
  const [seekingGender, setSeekingGender] = useState('everyone')
  const [locationName, setLocationName] = useState('')
  const [minAge, setMinAge] = useState('18')
  const [maxAge, setMaxAge] = useState('40')
  const [isActive, setIsActive] = useState(true)

  const loadProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, bio, birthdate, gender, seeking_gender, location_name, min_age, max_age, is_active')
      .eq('user_id', user.id)
      .single()

    if (!profile) return

    setProfileId(profile.id)
    setName(profile.name ?? '')
    setBio(profile.bio ?? '')
    setBirthdate(profile.birthdate ?? '')
    setGender(profile.gender ?? 'man')
    setSeekingGender(profile.seeking_gender ?? 'everyone')
    setLocationName(profile.location_name ?? '')
    setMinAge(String(profile.min_age ?? 18))
    setMaxAge(String(profile.max_age ?? 40))
    setIsActive(profile.is_active ?? true)

    const { data: photosData } = await supabase
      .from('photos')
      .select('id, url, display_order, moderation_status')
      .eq('profile_id', profile.id)
      .order('display_order')

    setPhotos(photosData ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleSave = async () => {
    if (!profileId || !name.trim()) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        name: name.trim(),
        bio: bio.trim() || null,
        gender,
        seeking_gender: seekingGender,
        location_name: locationName.trim() || null,
        min_age: parseInt(minAge, 10) || 18,
        max_age: parseInt(maxAge, 10) || 40,
        is_active: isActive,
      })
      .eq('id', profileId)
    setSaving(false)
    if (error) {
      Alert.alert('Error', 'Could not save profile. Please try again.')
    } else {
      Alert.alert('Saved', 'Your profile has been updated.')
    }
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

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert('Delete photo', 'Remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
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

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">My Profile</Text>
        <Pressable
          onPress={handleSave}
          disabled={saving || !name.trim()}
          className="bg-rose-500 rounded-full px-5 py-2 active:opacity-80 disabled:opacity-40"
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-semibold text-sm">Save</Text>
          )}
        </Pressable>
      </View>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        {/* Photos section */}
        <View className="px-5 pt-5 pb-3">
          <SectionHeader title={`Photos  ${photos.length}/6`} />
          <View className="flex-row flex-wrap gap-2">
            {photos.map((photo) => (
              <Pressable
                key={photo.id}
                onLongPress={() => handleDeletePhoto(photo.id)}
                className="relative overflow-hidden rounded-2xl"
                style={{ width: '31%', aspectRatio: 3 / 4 }}
              >
                <Image source={{ uri: photo.url }} className="w-full h-full" resizeMode="cover" />
                <Pressable
                  onPress={() => handleDeletePhoto(photo.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 items-center justify-center"
                >
                  <Trash2 size={12} color="white" />
                </Pressable>
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
                style={{ width: '31%', aspectRatio: 3 / 4 }}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color="#f43f5e" />
                ) : (
                  <>
                    <Plus size={22} color="#9ca3af" />
                    <Text className="text-xs text-gray-400 mt-1">Add</Text>
                  </>
                )}
              </Pressable>
            )}
          </View>
          <Text className="text-xs text-gray-400 mt-2">
            Tap trash icon or long-press to delete. New photos are reviewed before going live.
          </Text>
        </View>

        <View className="px-5 py-4 gap-1">
          {/* Basic info */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-4">
            <SectionHeader title="Basic Info" />
            <Field label="Display name">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 bg-white"
              />
            </Field>
            <Field label="Bio">
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Tell people about yourself…"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 bg-white"
                style={{ minHeight: 100 }}
              />
            </Field>
            <Field label="Location (city, country)">
              <TextInput
                value={locationName}
                onChangeText={setLocationName}
                placeholder="e.g. New York, USA"
                className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 bg-white"
              />
            </Field>
            <View className="mb-1">
              <Text className="text-xs font-medium text-gray-500 mb-1">Date of birth</Text>
              <View className="border border-gray-200 rounded-xl px-4 py-3 bg-white">
                <Text className="text-base text-gray-700">{birthdate}</Text>
                <Text className="text-xs text-gray-400 mt-0.5">
                  {birthdate ? `Age ${calcAge(birthdate)}` : 'Set during onboarding'}
                </Text>
              </View>
            </View>
          </View>

          {/* Identity */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-4">
            <SectionHeader title="Identity" />
            <Field label="I am">
              <ChipSelector options={GENDERS} value={gender} onChange={setGender} />
            </Field>
            <Field label="Looking for">
              <ChipSelector options={SEEKING} value={seekingGender} onChange={setSeekingGender} />
            </Field>
          </View>

          {/* Preferences */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-4">
            <SectionHeader title="Preferences" />
            <View className="flex-row gap-4 mb-4">
              <Field label="Min age">
                <TextInput
                  value={minAge}
                  onChangeText={setMinAge}
                  keyboardType="number-pad"
                  maxLength={2}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 bg-white w-24"
                />
              </Field>
              <Field label="Max age">
                <TextInput
                  value={maxAge}
                  onChangeText={setMaxAge}
                  keyboardType="number-pad"
                  maxLength={2}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 bg-white w-24"
                />
              </Field>
            </View>
          </View>

          {/* Visibility */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-8">
            <SectionHeader title="Visibility" />
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-sm font-medium text-gray-900">Show me in Discover</Text>
                <Text className="text-xs text-gray-400 mt-0.5">
                  When off, others won't see your profile
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: '#e5e7eb', true: '#fda4af' }}
                thumbColor={isActive ? '#f43f5e' : '#9ca3af'}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
