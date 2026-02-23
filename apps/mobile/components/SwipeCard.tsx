import { useEffect } from 'react'
import { View, Text, Image, Pressable, Dimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import { ChevronRight } from 'lucide-react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3

export interface DiscoverProfile {
  id: string
  name: string
  birthdate: string
  bio: string | null
  photos: { url: string; display_order: number }[]
}

function calcAge(birthdate: string): number {
  const today = new Date()
  const dob = new Date(birthdate)
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age
}

interface SwipeCardProps {
  profile: DiscoverProfile
  isTop: boolean
  index: number
  onSwipe: (direction: 'like' | 'pass') => void
  onViewProfile: () => void
}

export function SwipeCard({ profile, isTop, index, onSwipe, onViewProfile }: SwipeCardProps) {
  const x = useSharedValue(0)
  const y = useSharedValue(0)

  // Reset position when card becomes top card
  useEffect(() => {
    if (isTop) {
      x.value = withSpring(0)
      y.value = withSpring(0)
    }
  }, [isTop, x, y])

  const gesture = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      x.value = e.translationX
      y.value = e.translationY * 0.15
    })
    .onEnd((e) => {
      const shouldSwipeRight = e.translationX > SWIPE_THRESHOLD || e.velocityX > 600
      const shouldSwipeLeft = e.translationX < -SWIPE_THRESHOLD || e.velocityX < -600

      if (shouldSwipeRight) {
        x.value = withSpring(SCREEN_WIDTH * 1.5, { velocity: e.velocityX })
        runOnJS(onSwipe)('like')
      } else if (shouldSwipeLeft) {
        x.value = withSpring(-SCREEN_WIDTH * 1.5, { velocity: e.velocityX })
        runOnJS(onSwipe)('pass')
      } else {
        // Snap back with spring physics
        x.value = withSpring(0, { stiffness: 400, damping: 30 })
        y.value = withSpring(0, { stiffness: 400, damping: 30 })
      }
    })

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(x.value, [-SCREEN_WIDTH, SCREEN_WIDTH], [-25, 25], Extrapolation.CLAMP)
    const scale = interpolate(index, [0, 1, 2], [1, 0.96, 0.92], Extrapolation.CLAMP)
    const translateY = interpolate(index, [0, 1, 2], [0, 12, 24], Extrapolation.CLAMP)

    return {
      transform: [
        { translateX: isTop ? x.value : 0 },
        { translateY: isTop ? y.value : translateY },
        { rotate: isTop ? `${rotate}deg` : '0deg' },
        { scale: isTop ? 1 : scale },
      ],
    }
  })

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [20, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }))

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [-SWIPE_THRESHOLD, -20], [1, 0], Extrapolation.CLAMP),
  }))

  const photoUrl = profile.photos[0]?.url

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[cardStyle, { position: 'absolute', width: '100%', height: '100%' }]}
      >
        <View className="w-full h-full rounded-3xl overflow-hidden bg-gray-200 shadow-2xl">
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-rose-50">
              <Text className="text-7xl">👤</Text>
            </View>
          )}

          {/* Gradient overlay */}
          <View className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* LIKE badge */}
          <Animated.View
            style={[likeStyle, { position: 'absolute', top: 48, left: 20, transform: [{ rotate: '-14deg' }] }]}
          >
            <View className="border-4 border-green-400 rounded-2xl px-4 py-1.5">
              <Text className="text-green-400 font-black text-2xl tracking-widest">LIKE</Text>
            </View>
          </Animated.View>

          {/* NOPE badge */}
          <Animated.View
            style={[nopeStyle, { position: 'absolute', top: 48, right: 20, transform: [{ rotate: '14deg' }] }]}
          >
            <View className="border-4 border-rose-400 rounded-2xl px-4 py-1.5">
              <Text className="text-rose-400 font-black text-2xl tracking-widest">NOPE</Text>
            </View>
          </Animated.View>

          {/* Profile info */}
          <View className="absolute bottom-0 left-0 right-0 p-5">
            <View className="flex-row items-end justify-between gap-3">
              <View className="flex-1">
                <View className="flex-row items-baseline gap-2 mb-1">
                  <Text className="text-white text-3xl font-bold">{profile.name}</Text>
                  <Text className="text-white/90 text-2xl font-light">
                    {calcAge(profile.birthdate)}
                  </Text>
                </View>
                {profile.bio && (
                  <Text className="text-white/70 text-sm" numberOfLines={2}>
                    {profile.bio}
                  </Text>
                )}
              </View>
              {isTop && (
                <Pressable
                  onPress={onViewProfile}
                  className="w-10 h-10 rounded-full bg-white/20 items-center justify-center border border-white/30"
                >
                  <ChevronRight size={20} color="white" />
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  )
}
