import { useEffect, useState } from 'react'
import {
  View, Text, Pressable, Image, ScrollView,
  ActivityIndicator, Alert, Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Play, Pause, Heart, X, MessageCircle, MapPin } from 'lucide-react-native'
import { Audio } from 'expo-av'
import { supabase } from '@/lib/supabase'

const { width } = Dimensions.get('window')

function calcAge(birthdate: string): number {
  const today = new Date()
  const dob = new Date(birthdate)
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age
}

export default function ProfileScreen() {
  const { id: profileId } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [myProfileId, setMyProfileId] = useState<string | null>(null)
  const [profile, setProfile] = useState<{
    id: string; name: string; birthdate: string; bio: string | null;
    gender: string; seekingGender: string; locationName: string | null;
  } | null>(null)
  const [photos, setPhotos] = useState<{ url: string }[]>([])
  const [voiceIntroUrl, setVoiceIntroUrl] = useState<string | null>(null)
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [playing, setPlaying] = useState(false)
  const [existingSwipe, setExistingSwipe] = useState<'like' | 'pass' | null>(null)
  const [matchId, setMatchId] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
    return () => { sound?.unloadAsync() }
  }, [profileId])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: me } = await supabase
      .from('profiles').select('id').eq('user_id', user.id).single()
    if (!me) return
    setMyProfileId(me.id)

    const [profileRes, photosRes, voiceRes, swipeRes] = await Promise.all([
      supabase.from('profiles')
        .select('id, name, birthdate, bio, gender, seeking_gender, location_name')
        .eq('id', profileId).single(),
      supabase.from('photos').select('url').eq('profile_id', profileId)
        .eq('moderation_status', 'approved').order('display_order'),
      supabase.from('voice_intros').select('url').eq('profile_id', profileId)
        .eq('moderation_status', 'approved').maybeSingle(),
      supabase.from('swipes').select('direction')
        .eq('swiper_id', me.id).eq('swiped_id', profileId).maybeSingle(),
    ])

    if (profileRes.data) {
      setProfile({
        id: profileRes.data.id,
        name: profileRes.data.name,
        birthdate: profileRes.data.birthdate,
        bio: profileRes.data.bio,
        gender: profileRes.data.gender,
        seekingGender: profileRes.data.seeking_gender,
        locationName: profileRes.data.location_name,
      })
    }
    setPhotos(photosRes.data ?? [])
    setVoiceIntroUrl(voiceRes.data?.url ?? null)
    setExistingSwipe(swipeRes.data?.direction as 'like' | 'pass' | null ?? null)

    // Check for match
    if (me.id !== profileId) {
      const ids = [me.id, profileId].sort()
      const { data: match } = await supabase.from('matches')
        .select('id').eq('profile1_id', ids[0]!).eq('profile2_id', ids[1]!).maybeSingle()
      if (match) {
        setMatchId(match.id)
        const { data: conv } = await supabase.from('conversations')
          .select('id').eq('match_id', match.id).maybeSingle()
        setConversationId(conv?.id ?? null)
      }
    }

    setLoading(false)
  }

  const toggleAudio = async () => {
    if (!voiceIntroUrl) return
    if (sound) {
      if (playing) { await sound.pauseAsync(); setPlaying(false) }
      else { await sound.playAsync(); setPlaying(true) }
    } else {
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: voiceIntroUrl })
      setSound(newSound)
      await newSound.playAsync()
      setPlaying(true)
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) setPlaying(false)
      })
    }
  }

  const handleSwipe = async (direction: 'like' | 'pass') => {
    if (!myProfileId || !profile) return
    await supabase.from('swipes').upsert({
      swiper_id: myProfileId, swiped_id: profile.id, direction
    })
    setExistingSwipe(direction)
  }

  if (loading || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color="#f43f5e" />
      </SafeAreaView>
    )
  }

  const isOwnProfile = profile.id === myProfileId
  const photoUrl = photos[currentPhoto]?.url

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" bounces={false}>
        {/* Photo */}
        <View style={{ width, aspectRatio: 3 / 4 }} className="relative bg-gray-200">
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full items-center justify-center bg-rose-50">
              <Text className="text-6xl">👤</Text>
            </View>
          )}
          <View className="absolute inset-0 bg-black/5" />
          {/* Back */}
          <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0 flex-row justify-between px-4 py-2">
            <Pressable
              onPress={() => router.back()}
              className="w-9 h-9 rounded-full bg-black/30 items-center justify-center"
            >
              <ArrowLeft size={20} color="white" />
            </Pressable>
          </SafeAreaView>
          {/* Photo dots */}
          {photos.length > 1 && (
            <View className="absolute top-12 left-0 right-0 flex-row justify-center gap-1">
              {photos.map((_, i) => (
                <Pressable key={i} onPress={() => setCurrentPhoto(i)}>
                  <View className={`h-1 rounded-full ${i === currentPhoto ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />
                </Pressable>
              ))}
            </View>
          )}
          {/* Name overlay */}
          <View className="absolute bottom-0 left-0 right-0 p-5" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
            <Text className="text-white text-3xl font-bold">{profile.name}, {calcAge(profile.birthdate)}</Text>
            {profile.locationName && (
              <View className="flex-row items-center gap-1 mt-1">
                <MapPin size={14} color="rgba(255,255,255,0.8)" />
                <Text className="text-white/80 text-sm">{profile.locationName}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Info */}
        <View className="px-5 py-5 gap-5">
          {voiceIntroUrl && (
            <Pressable
              onPress={toggleAudio}
              className="flex-row items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3"
            >
              <View className="w-10 h-10 rounded-full bg-rose-500 items-center justify-center">
                {playing ? <Pause size={16} color="white" /> : <Play size={16} color="white" />}
              </View>
              <Text className="text-sm font-medium text-gray-900">Voice intro</Text>
            </Pressable>
          )}

          {profile.bio && (
            <View>
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">About</Text>
              <Text className="text-sm text-gray-700 leading-relaxed">{profile.bio}</Text>
            </View>
          )}

          <View className="flex-row flex-wrap gap-2">
            <View className="bg-gray-100 rounded-full px-3 py-1.5">
              <Text className="text-sm text-gray-700 capitalize">{profile.gender}</Text>
            </View>
            <View className="bg-gray-100 rounded-full px-3 py-1.5">
              <Text className="text-sm text-gray-700">Interested in {profile.seekingGender}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action bar */}
      <View className="px-5 pb-8 pt-3 border-t border-gray-100">
        {isOwnProfile ? (
          <Pressable
            onPress={() => router.push('/(app)/profile/')}
            className="bg-rose-500 rounded-full py-4 items-center active:opacity-80"
          >
            <Text className="text-white font-semibold text-base">Edit Profile</Text>
          </Pressable>
        ) : matchId && conversationId ? (
          <Pressable
            onPress={() => router.push(`/(app)/chat/${conversationId}`)}
            className="bg-rose-500 rounded-full py-4 flex-row items-center justify-center gap-2 active:opacity-80"
          >
            <MessageCircle size={20} color="white" />
            <Text className="text-white font-semibold text-base">Message {profile.name}</Text>
          </Pressable>
        ) : existingSwipe === 'like' ? (
          <View className="py-4 flex-row items-center justify-center gap-2">
            <Heart size={16} color="#f43f5e" fill="#f43f5e" />
            <Text className="text-gray-500 text-sm">You liked {profile.name}</Text>
          </View>
        ) : existingSwipe === 'pass' ? (
          <View className="py-4 items-center">
            <Text className="text-gray-400 text-sm">You passed on {profile.name}</Text>
          </View>
        ) : (
          <View className="flex-row gap-4">
            <Pressable
              onPress={() => handleSwipe('pass')}
              className="flex-1 flex-row items-center justify-center gap-2 border-2 border-gray-200 rounded-full py-4 active:opacity-70"
            >
              <X size={20} color="#ef4444" />
              <Text className="text-gray-700 font-semibold">Pass</Text>
            </Pressable>
            <Pressable
              onPress={() => handleSwipe('like')}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-full py-4 active:opacity-70"
              style={{ backgroundColor: '#f43f5e' }}
            >
              <Heart size={20} color="white" fill="white" />
              <Text className="text-white font-semibold">Like</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  )
}
