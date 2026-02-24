import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    if (!email || !password) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      router.replace('/(app)/discover')
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="mb-10">
          <Text className="text-4xl font-bold text-gray-900 mb-1">Welcome back</Text>
          <Text className="text-base text-gray-500">Sign in to Ring Bearer</Text>
        </View>

        {/* Error */}
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <Text className="text-sm text-red-600">{error}</Text>
          </View>
        )}

        {/* Fields */}
        <View className="gap-4 mb-6">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              className="border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-gray-50"
            />
          </View>
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="current-password"
              className="border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-gray-50"
            />
          </View>
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleLogin}
          disabled={loading || !email || !password}
          className="bg-primary rounded-2xl py-4 items-center mb-4 active:opacity-80 disabled:opacity-50"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Sign in</Text>
          )}
        </Pressable>

        {/* Sign up link */}
        <View className="flex-row justify-center gap-1">
          <Text className="text-gray-500 text-sm">Don't have an account?</Text>
          <Link href="/(auth)/signup">
            <Text className="text-primary font-semibold text-sm">Sign up</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
