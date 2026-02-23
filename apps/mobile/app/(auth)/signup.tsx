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
import { Link } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function SignupScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = async () => {
    if (!email || !password) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-8">
        <Text className="text-5xl mb-4">🎉</Text>
        <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">Check your email</Text>
        <Text className="text-base text-gray-500 text-center leading-relaxed">
          We sent a confirmation link to {email}. Click it to activate your account.
        </Text>
        <Link href="/(auth)/login" className="mt-8">
          <Text className="text-primary font-semibold text-base">Back to sign in</Text>
        </Link>
      </View>
    )
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
        <View className="mb-10">
          <Text className="text-4xl font-bold text-gray-900 mb-1">Create account</Text>
          <Text className="text-base text-gray-500">Join Ring Bearer today</Text>
        </View>

        {error && (
          <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <Text className="text-sm text-red-600">{error}</Text>
          </View>
        )}

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
              placeholder="At least 8 characters"
              secureTextEntry
              autoComplete="new-password"
              className="border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-gray-50"
            />
          </View>
        </View>

        <Pressable
          onPress={handleSignup}
          disabled={loading || !email || !password}
          className="bg-primary rounded-2xl py-4 items-center mb-4 active:opacity-80 disabled:opacity-50"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Create account</Text>
          )}
        </Pressable>

        <View className="flex-row justify-center gap-1">
          <Text className="text-gray-500 text-sm">Already have an account?</Text>
          <Link href="/(auth)/login">
            <Text className="text-primary font-semibold text-sm">Sign in</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
