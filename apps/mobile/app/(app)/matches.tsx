import { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

interface MatchPreview {
  matchId: string
  conversationId: string
  profile: { id: string; name: string; photoUrl: string | null }
  lastMessage: string | null
  lastMessageAt: string | null
  isNew: boolean
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export default function MatchesScreen() {
  const router = useRouter()
  const [matches, setMatches] = useState<MatchPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadMatches = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) return

    const { data: matchRows } = await supabase
      .from('matches')
      .select('id, profile1_id, profile2_id, created_at')
      .or(`profile1_id.eq.${profile.id},profile2_id.eq.${profile.id}`)
      .is('unmatched_at', null)
      .order('created_at', { ascending: false })

    if (!matchRows?.length) {
      setMatches([])
      setLoading(false)
      setRefreshing(false)
      return
    }

    const otherIds = matchRows.map((m) =>
      m.profile1_id === profile.id ? m.profile2_id : m.profile1_id
    )

    const [profilesRes, photosRes, convsRes] = await Promise.all([
      supabase.from('profiles').select('id, name').in('id', otherIds),
      supabase
        .from('photos')
        .select('profile_id, url')
        .in('profile_id', otherIds)
        .eq('moderation_status', 'approved')
        .order('display_order')
        .limit(otherIds.length),
      supabase
        .from('conversations')
        .select('id, match_id, last_message_at, last_message_preview')
        .in('match_id', matchRows.map((m) => m.id)),
    ])

    const profileMap = Object.fromEntries((profilesRes.data ?? []).map((p) => [p.id, p]))
    const photoMap: Record<string, string> = {}
    photosRes.data?.forEach((p) => { if (!photoMap[p.profile_id]) photoMap[p.profile_id] = p.url })
    const convMap = Object.fromEntries((convsRes.data ?? []).map((c) => [c.match_id, c]))

    const previews: MatchPreview[] = matchRows.map((m) => {
      const otherId = m.profile1_id === profile.id ? m.profile2_id : m.profile1_id
      const conv = convMap[m.id]
      return {
        matchId: m.id,
        conversationId: conv?.id ?? '',
        profile: {
          id: otherId,
          name: profileMap[otherId]?.name ?? 'Unknown',
          photoUrl: photoMap[otherId] ?? null,
        },
        lastMessage: conv?.last_message_preview ?? null,
        lastMessageAt: conv?.last_message_at ?? null,
        isNew: !conv?.last_message_preview,
      }
    })

    setMatches(previews)
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { loadMatches() }, [loadMatches])

  const onRefresh = () => { setRefreshing(true); loadMatches() }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color="#f43f5e" />
      </SafeAreaView>
    )
  }

  const newMatches = matches.filter((m) => m.isNew)
  const conversations = matches.filter((m) => !m.isNew)

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-5 py-3">
        <Text className="text-2xl font-bold text-gray-900">Matches</Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f43f5e" />}
        className="flex-1"
      >
        {matches.length === 0 ? (
          <View className="flex-1 items-center justify-center px-10 py-20 gap-4">
            <Text className="text-7xl">💫</Text>
            <Text className="text-xl font-bold text-gray-900 text-center">No matches yet</Text>
            <Text className="text-sm text-gray-500 text-center">Keep swiping — your matches will appear here.</Text>
          </View>
        ) : (
          <>
            {/* New matches row */}
            {newMatches.length > 0 && (
              <View className="px-5 mb-6">
                <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  New Matches
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
                  {newMatches.map((m) => (
                    <Pressable
                      key={m.matchId}
                      onPress={() => m.conversationId && router.push(`/(app)/chat/${m.conversationId}`)}
                      className="items-center gap-1.5 mx-2 active:opacity-70"
                    >
                      <View className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-rose-400">
                        {m.profile.photoUrl ? (
                          <Image source={{ uri: m.profile.photoUrl }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                          <View className="w-full h-full items-center justify-center">
                            <Text className="text-2xl">👤</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs font-medium text-gray-700 max-w-[60px]" numberOfLines={1}>
                        {m.profile.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Conversations */}
            {conversations.length > 0 && (
              <View className="px-5">
                <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Messages
                </Text>
                {conversations.map((m) => (
                  <Pressable
                    key={m.matchId}
                    onPress={() => router.push(`/(app)/chat/${m.conversationId}`)}
                    className="flex-row items-center gap-3 py-3 active:bg-gray-50 -mx-2 px-2 rounded-2xl"
                  >
                    <View className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                      {m.profile.photoUrl ? (
                        <Image source={{ uri: m.profile.photoUrl }} className="w-full h-full" resizeMode="cover" />
                      ) : (
                        <View className="w-full h-full items-center justify-center">
                          <Text className="text-xl">👤</Text>
                        </View>
                      )}
                    </View>
                    <View className="flex-1 min-w-0">
                      <View className="flex-row items-baseline justify-between gap-2">
                        <Text className="font-semibold text-sm text-gray-900" numberOfLines={1}>
                          {m.profile.name}
                        </Text>
                        {m.lastMessageAt && (
                          <Text className="text-xs text-gray-400 shrink-0">
                            {timeAgo(m.lastMessageAt)}
                          </Text>
                        )}
                      </View>
                      {m.lastMessage && (
                        <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
                          {m.lastMessage}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
