import { useState, useCallback } from 'react'
import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { Heart, X, Lock, RefreshCcw } from 'lucide-react-native'
import Constants from 'expo-constants'
import { SwipeCard, type DiscoverProfile } from './SwipeCard'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'expo-router'

const SUPABASE_URL = (Constants.expoConfig?.extra?.supabaseUrl as string) ?? ''

interface SwipeDeckProps {
  profiles: DiscoverProfile[]
}

export function SwipeDeck({ profiles: initialProfiles }: SwipeDeckProps) {
  const router = useRouter()
  const [profiles, setProfiles] = useState(initialProfiles)
  const [loading, setLoading] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const [matched, setMatched] = useState<DiscoverProfile | null>(null)

  // Button press scales (run on JS thread — buttons aren't latency-sensitive)
  const likeScale = useSharedValue(1)
  const passScale = useSharedValue(1)

  const likeStyle = useAnimatedStyle(() => ({ transform: [{ scale: likeScale.value }] }))
  const passStyle = useAnimatedStyle(() => ({ transform: [{ scale: passScale.value }] }))

  const handleSwipe = useCallback(async (direction: 'like' | 'pass') => {
    const current = profiles[0]
    if (!current || loading) return

    setLoading(true)
    setProfiles((prev) => prev.slice(1))

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${SUPABASE_URL}/functions/v1/swipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ swipedProfileId: current.id, direction }),
      })

      if (res.status === 429) {
        setLimitReached(true)
        setProfiles((prev) => [current, ...prev])
        return
      }

      const data = await res.json() as { matched: boolean }
      if (data.matched) setMatched(current)
    } catch {
      // fail silently
    } finally {
      setLoading(false)
    }
  }, [profiles, loading])

  const pressLike = () => {
    likeScale.value = withSpring(0.85, {}, () => {
      likeScale.value = withSpring(1)
    })
    handleSwipe('like')
  }

  const pressPass = () => {
    passScale.value = withSpring(0.85, {}, () => {
      passScale.value = withSpring(1)
    })
    handleSwipe('pass')
  }

  if (limitReached) {
    return (
      <View className="flex-1 items-center justify-center px-10 gap-5">
        <View className="w-20 h-20 rounded-full bg-rose-100 items-center justify-center">
          <Lock size={32} color="#f43f5e" />
        </View>
        <Text className="text-xl font-bold text-gray-900 text-center">Daily limit reached</Text>
        <Text className="text-sm text-gray-500 text-center leading-relaxed">
          You've used your 20 free swipes today. Come back tomorrow or upgrade to Premium.
        </Text>
        <Pressable
          onPress={() => router.push('/(app)/settings')}
          className="bg-primary rounded-full px-8 py-3 active:opacity-80"
        >
          <Text className="text-white font-semibold">Upgrade to Premium</Text>
        </Pressable>
      </View>
    )
  }

  if (profiles.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-10 gap-5">
        <Text className="text-7xl">✨</Text>
        <Text className="text-xl font-bold text-gray-900 text-center">You're all caught up</Text>
        <Text className="text-sm text-gray-500 text-center leading-relaxed">
          New people join every day. Check back soon!
        </Text>
        <Pressable
          onPress={() => router.replace('/(app)/discover')}
          className="flex-row items-center gap-2 border border-gray-200 rounded-full px-6 py-3 active:opacity-70"
        >
          <RefreshCcw size={16} color="#6b7280" />
          <Text className="text-gray-600 font-medium">Refresh</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View className="flex-1">
      {/* Card stack */}
      <View className="flex-1 relative">
        {profiles.slice(0, 3).map((profile, index) => (
          <SwipeCard
            key={profile.id}
            profile={profile}
            isTop={index === 0}
            index={index}
            onSwipe={handleSwipe}
            onViewProfile={() => router.push(`/(app)/profile/${profile.id}`)}
          />
        ))}
      </View>

      {/* Action buttons */}
      <View className="flex-row justify-center items-center gap-8 py-6 px-8">
        <Animated.View style={passStyle}>
          <Pressable
            onPress={pressPass}
            disabled={loading}
            className="w-16 h-16 rounded-full bg-white border-2 border-rose-200 items-center justify-center shadow-sm active:opacity-70 disabled:opacity-40"
          >
            <X size={28} color="#f43f5e" />
          </Pressable>
        </Animated.View>

        <Animated.View style={likeStyle}>
          <Pressable
            onPress={pressLike}
            disabled={loading}
            className="w-[72px] h-[72px] rounded-full items-center justify-center shadow-lg active:opacity-70 disabled:opacity-40"
            style={{ backgroundColor: '#f43f5e' }}
          >
            <Heart size={30} color="white" fill="white" />
          </Pressable>
        </Animated.View>
      </View>

      {/* Match overlay */}
      {matched && (
        <View className="absolute inset-0 items-center justify-center bg-rose-500">
          <Text className="text-5xl font-black text-white mb-2">{matched.name}</Text>
          <Text className="text-white/80 text-base mb-8">liked you back! 🎉</Text>
          {matched.photos[0] && (
            <View className="w-36 h-36 rounded-full overflow-hidden border-4 border-white mb-10">
              <Animated.Image
                source={{ uri: matched.photos[0].url }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          )}
          <Pressable
            onPress={() => { setMatched(null); router.push('/(app)/matches') }}
            className="bg-white rounded-full px-8 py-4 mb-3 active:opacity-80"
          >
            <Text className="text-rose-600 font-bold text-base">Send a message 💬</Text>
          </Pressable>
          <Pressable onPress={() => setMatched(null)} className="active:opacity-70">
            <Text className="text-white/80 text-base">Keep swiping</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
