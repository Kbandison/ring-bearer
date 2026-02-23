import { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Send } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
}

interface OtherProfile {
  id: string
  name: string
  photoUrl: string | null
}

export default function ChatScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const flatListRef = useRef<FlatList>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [myProfileId, setMyProfileId] = useState<string | null>(null)
  const [otherProfile, setOtherProfile] = useState<OtherProfile | null>(null)
  const [matchId, setMatchId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [otherTyping, setOtherTyping] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversation()
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [conversationId])

  const loadConversation = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: me } = await supabase
      .from('profiles').select('id').eq('user_id', user.id).single()
    if (!me) return
    setMyProfileId(me.id)

    const { data: conv } = await supabase
      .from('conversations').select('match_id').eq('id', conversationId).single()
    if (!conv) return
    setMatchId(conv.match_id)

    const { data: match } = await supabase
      .from('matches').select('profile1_id, profile2_id').eq('id', conv.match_id).single()
    if (!match) return

    const otherId = match.profile1_id === me.id ? match.profile2_id : match.profile1_id
    const { data: otherProf } = await supabase
      .from('profiles').select('id, name').eq('id', otherId).single()
    const { data: photo } = await supabase
      .from('photos').select('url').eq('profile_id', otherId)
      .eq('moderation_status', 'approved').order('display_order').limit(1).maybeSingle()

    setOtherProfile({ id: otherId, name: otherProf?.name ?? '', photoUrl: photo?.url ?? null })

    const { data: msgs } = await supabase
      .from('messages').select('id, sender_id, content, created_at')
      .eq('conversation_id', conversationId).order('created_at')
    setMessages((msgs ?? []) as Message[])
    setLoading(false)

    // Subscribe
    const channel = supabase
      .channel(`conv:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const msg = payload.new as Message
        setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg])
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        const p = payload.payload as { profileId: string }
        if (p.profileId !== me.id) {
          setOtherTyping(true)
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => setOtherTyping(false), 3000)
        }
      })
      .subscribe()
    channelRef.current = channel
  }

  const broadcastTyping = useCallback(() => {
    if (!myProfileId) return
    channelRef.current?.send({ type: 'broadcast', event: 'typing', payload: { profileId: myProfileId } })
  }, [myProfileId])

  const sendMessage = async () => {
    const content = input.trim()
    if (!content || sending || !myProfileId) return
    setInput('')
    setSending(true)
    const { data } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: myProfileId, content })
      .select('id, sender_id, content, created_at')
      .single()
    if (data) {
      setMessages((prev) => prev.some((m) => m.id === data.id) ? prev : [...prev, data as Message])
    }
    setSending(false)
  }

  const handleUnmatch = async () => {
    if (!matchId) return
    await supabase.from('matches').update({ unmatched_at: new Date().toISOString() }).eq('id', matchId)
    router.replace('/(app)/matches')
  }

  if (loading || !otherProfile) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center" edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color="#f43f5e" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View className="flex-row items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Pressable onPress={() => router.back()} className="p-1 active:opacity-60">
            <ArrowLeft size={22} color="#374151" />
          </Pressable>
          <Pressable
            onPress={() => router.push(`/(app)/profile/${otherProfile.id}`)}
            className="flex-row items-center gap-2.5 flex-1 active:opacity-70"
          >
            <View className="w-9 h-9 rounded-full overflow-hidden bg-gray-100">
              {otherProfile.photoUrl ? (
                <Image source={{ uri: otherProfile.photoUrl }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Text>👤</Text>
                </View>
              )}
            </View>
            <View>
              <Text className="font-semibold text-sm text-gray-900">{otherProfile.name}</Text>
              <Text className="text-xs text-rose-500">Tap to view profile</Text>
            </View>
          </Pressable>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 16, gap: 8 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View className="items-center py-10">
              <Text className="text-3xl mb-2">👋</Text>
              <Text className="text-gray-400 text-sm">Say hello to {otherProfile.name}!</Text>
            </View>
          }
          ListFooterComponent={
            otherTyping ? (
              <View className="flex-row justify-start mt-2">
                <View className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <View className="flex-row gap-1 items-center h-4">
                    {[0, 150, 300].map((delay) => (
                      <View key={delay} className="w-2 h-2 bg-gray-400 rounded-full" />
                    ))}
                  </View>
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const isMe = item.sender_id === myProfileId
            return (
              <View className={`flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                <View
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isMe ? 'rounded-br-sm' : 'bg-gray-100 rounded-bl-sm'
                  }`}
                  style={isMe ? { backgroundColor: '#f43f5e' } : undefined}
                >
                  <Text className={`text-sm leading-relaxed ${isMe ? 'text-white' : 'text-gray-900'}`}>
                    {item.content}
                  </Text>
                </View>
              </View>
            )
          }}
        />

        {/* Input */}
        <View className="flex-row items-end gap-2 px-4 py-3 border-t border-gray-100">
          <TextInput
            value={input}
            onChangeText={(v) => { setInput(v); broadcastTyping() }}
            placeholder={`Message ${otherProfile.name}…`}
            placeholderTextColor="#9ca3af"
            multiline
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-900 max-h-32"
            style={{ textAlignVertical: 'top' }}
            onSubmitEditing={sendMessage}
          />
          <Pressable
            onPress={sendMessage}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-full items-center justify-center active:opacity-70 disabled:opacity-40"
            style={{ backgroundColor: '#f43f5e' }}
          >
            <Send size={18} color="white" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
