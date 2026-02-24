import '../global.css'
import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { useRouter, useSegments } from 'expo-router'
import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'

function AuthGuard({ session }: { session: Session | null | undefined }) {
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (session === undefined) return // still loading

    const inAuthGroup = (segments[0] as string) === '(auth)'
    const inOnboarding = (segments[0] as string) === '(onboarding)'

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (session && inAuthGroup) {
      // Check if onboarding is complete
      supabase
        .from('profiles')
        .select('profile_completed')
        .eq('user_id', session.user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.profile_completed) {
            router.replace('/(app)/discover')
          } else {
            router.replace('/(onboarding)/step1')
          }
        })
    }
  }, [session, segments, router])

  return null
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthGuard session={session} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(app)" />
        </Stack>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
