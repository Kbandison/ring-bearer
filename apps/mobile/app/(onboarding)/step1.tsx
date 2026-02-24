import { useState } from 'react'
import {
  View, Text, TextInput, Pressable, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

const GENDERS = ['man', 'woman', 'non-binary', 'other'] as const
const SEEKING = ['men', 'women', 'non-binary', 'everyone'] as const

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-5 py-2.5 rounded-full border mr-2 mb-2 ${selected ? 'bg-rose-500 border-rose-500' : 'bg-white border-gray-200'}`}
    >
      <Text className={`text-sm font-medium capitalize ${selected ? 'text-white' : 'text-gray-600'}`}>
        {label}
      </Text>
    </Pressable>
  )
}

export default function Step1() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [gender, setGender] = useState<string>('')
  const [seekingGender, setSeekingGender] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid = name.trim().length >= 2 && birthdate.length === 10 && gender && seekingGender

  const validateAge = (dob: string) => {
    const d = new Date(dob)
    if (isNaN(d.getTime())) return false
    const age = Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    return age >= 18
  }

  const handleNext = async () => {
    if (!isValid) return
    if (!validateAge(birthdate)) {
      setError('You must be at least 18 years old.')
      return
    }
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Upsert profile row (may already exist from trigger)
    const { error: err } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        name: name.trim(),
        birthdate,
        gender,
        seeking_gender: seekingGender,
      }, { onConflict: 'user_id' })

    setLoading(false)
    if (err) { setError(err.message); return }
    router.push('/(onboarding)/step2')
  }

  const formatBirthdate = (text: string) => {
    const digits = text.replace(/\D/g, '')
    let formatted = digits
    if (digits.length > 4) formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`
    if (digits.length > 6) formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`
    setBirthdate(formatted.slice(0, 10))
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-16 pb-10">
          {/* Progress */}
          <View className="flex-row gap-1.5 mb-10">
            {[1,2,3,4].map((s) => (
              <View key={s} className={`flex-1 h-1 rounded-full ${s === 1 ? 'bg-rose-500' : 'bg-gray-200'}`} />
            ))}
          </View>

          <Text className="text-3xl font-bold text-gray-900 mb-1">About you</Text>
          <Text className="text-base text-gray-500 mb-8">Let's start with the basics</Text>

          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <Text className="text-sm text-red-600">{error}</Text>
            </View>
          )}

          <View className="gap-5">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Your name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="First name"
                autoCapitalize="words"
                className="border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-gray-50"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Date of birth</Text>
              <TextInput
                value={birthdate}
                onChangeText={formatBirthdate}
                placeholder="YYYY-MM-DD"
                keyboardType="number-pad"
                maxLength={10}
                className="border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-gray-50"
              />
              <Text className="text-xs text-gray-400 mt-1">Must be 18 or older</Text>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">I am</Text>
              <View className="flex-row flex-wrap">
                {GENDERS.map((g) => (
                  <Chip key={g} label={g} selected={gender === g} onPress={() => setGender(g)} />
                ))}
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Looking for</Text>
              <View className="flex-row flex-wrap">
                {SEEKING.map((s) => (
                  <Chip key={s} label={s} selected={seekingGender === s} onPress={() => setSeekingGender(s)} />
                ))}
              </View>
            </View>
          </View>

          <View className="flex-1" />

          <Pressable
            onPress={handleNext}
            disabled={!isValid || loading}
            className="bg-rose-500 rounded-2xl py-4 items-center mt-8 active:opacity-80 disabled:opacity-40"
          >
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold text-base">Continue</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
