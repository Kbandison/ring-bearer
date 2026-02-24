import { useState } from 'react'
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

const MIN_CHARS = 50

export default function Step2() {
  const router = useRouter()
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)

  const handleNext = async (skip = false) => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (!skip && bio.trim()) {
      const { data: profile } = await supabase
        .from('profiles').select('id').eq('user_id', user.id).single()
      if (profile) {
        await supabase.from('profiles').update({ bio: bio.trim() }).eq('id', profile.id)
      }
    }

    setLoading(false)
    router.push('/(onboarding)/step3')
  }

  const charCount = bio.trim().length
  const isGood = charCount >= MIN_CHARS

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-16 pb-10">
          {/* Progress */}
          <View className="flex-row gap-1.5 mb-10">
            {[1,2,3,4].map((s) => (
              <View key={s} className={`flex-1 h-1 rounded-full ${s <= 2 ? 'bg-rose-500' : 'bg-gray-200'}`} />
            ))}
          </View>

          <Text className="text-3xl font-bold text-gray-900 mb-1">Your bio</Text>
          <Text className="text-base text-gray-500 mb-8">Tell people what makes you unique</Text>

          <View className="relative">
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Share a bit about yourself — your interests, what you're looking for, a fun fact…"
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              className="border border-gray-200 rounded-2xl px-4 py-4 text-base text-gray-900 bg-gray-50"
              style={{ minHeight: 180 }}
            />
            <View className="flex-row items-center justify-between mt-2">
              <Text className={`text-xs ${isGood ? 'text-emerald-500' : 'text-gray-400'}`}>
                {isGood ? '✓ Great bio!' : `${MIN_CHARS - charCount} more characters recommended`}
              </Text>
              <Text className="text-xs text-gray-400">{charCount}</Text>
            </View>
          </View>

          <View className="flex-1" />

          <View className="gap-3 mt-8">
            <Pressable
              onPress={() => handleNext(false)}
              disabled={loading}
              className="bg-rose-500 rounded-2xl py-4 items-center active:opacity-80 disabled:opacity-40"
            >
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold text-base">Continue</Text>}
            </Pressable>
            <Pressable onPress={() => handleNext(true)} className="py-3 items-center">
              <Text className="text-gray-400 text-sm">Skip for now</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
