import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { SwipeDeck } from '@/components/SwipeDeck'
import type { DiscoverProfile } from '@/components/SwipeCard'

export default function DiscoverScreen() {
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: me } = await supabase
      .from('profiles')
      .select('id, seeking_gender, min_age, max_age')
      .eq('user_id', user.id)
      .single()

    if (!me) return

    // Get already-swiped profile IDs
    const { data: swipes } = await supabase
      .from('swipes')
      .select('swiped_id')
      .eq('swiper_id', me.id)

    const swipedIds = swipes?.map((s) => s.swiped_id) ?? []

    // Get blocked profile IDs
    const { data: blocks } = await supabase
      .from('blocks')
      .select('blocked_id, blocker_id')
      .or(`blocker_id.eq.${me.id},blocked_id.eq.${me.id}`)

    const blockedIds = blocks?.flatMap((b) =>
      b.blocker_id === me.id ? [b.blocked_id] : [b.blocker_id]
    ) ?? []

    const excludeIds = [...new Set([...swipedIds, ...blockedIds, me.id])]

    let query = supabase
      .from('profiles')
      .select('id, name, birthdate, bio')
      .eq('profile_completed', true)
      .eq('is_active', true)
      .eq('is_banned', false)
      .order('last_active_at', { ascending: false })
      .limit(20)

    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`)
    }

    const { data: candidates } = await query

    if (!candidates?.length) {
      setProfiles([])
      setLoading(false)
      return
    }

    // Fetch approved photos for each candidate
    const profileIds = candidates.map((p) => p.id)
    const { data: photos } = await supabase
      .from('photos')
      .select('profile_id, url, display_order')
      .in('profile_id', profileIds)
      .eq('moderation_status', 'approved')
      .order('display_order')

    const photoMap: Record<string, { url: string; display_order: number }[]> = {}
    photos?.forEach((p) => {
      if (!photoMap[p.profile_id]) photoMap[p.profile_id] = []
      photoMap[p.profile_id]!.push({ url: p.url, display_order: p.display_order })
    })

    const discoverProfiles: DiscoverProfile[] = candidates.map((p) => ({
      id: p.id,
      name: p.name,
      birthdate: p.birthdate,
      bio: p.bio,
      photos: (photoMap[p.id] ?? []).sort((a, b) => a.display_order - b.display_order),
    }))

    setProfiles(discoverProfiles)
    setLoading(false)
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <Text className="text-2xl font-black text-gray-900">Ring Bearer 💍</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f43f5e" />
        </View>
      ) : (
        <SwipeDeck profiles={profiles} />
      )}
    </SafeAreaView>
  )
}
