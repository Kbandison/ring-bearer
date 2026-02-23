import { useState } from 'react'
import { View, Text, Pressable, Alert, ActivityIndicator, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { LogOut, Trash2, ChevronRight, Shield } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'

export default function SettingsScreen() {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    // AuthGuard in _layout will redirect to login
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This permanently deletes your profile, photos, matches, and all messages. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true)
            const { data: { session } } = await supabase.auth.getSession()
            await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/delete-account`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${session?.access_token}` },
            })
            await supabase.auth.signOut()
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-5 py-3">
        <Text className="text-2xl font-bold text-gray-900">Settings</Text>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40, gap: 24 }}>
        {/* Account */}
        <View>
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Account
          </Text>
          <View className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
            <Pressable
              onPress={() => router.push('/(app)/profile/')}
              className="flex-row items-center px-4 py-3.5 active:bg-gray-100"
            >
              <Text className="flex-1 text-sm font-medium text-gray-900">Edit profile</Text>
              <ChevronRight size={16} color="#9ca3af" />
            </Pressable>
          </View>
        </View>

        {/* Legal */}
        <View>
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Legal
          </Text>
          <View className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
            <Pressable className="flex-row items-center px-4 py-3.5 active:bg-gray-100 border-b border-gray-100">
              <Text className="flex-1 text-sm font-medium text-gray-900">Privacy policy</Text>
              <ChevronRight size={16} color="#9ca3af" />
            </Pressable>
            <Pressable className="flex-row items-center px-4 py-3.5 active:bg-gray-100">
              <Text className="flex-1 text-sm font-medium text-gray-900">Terms of service</Text>
              <ChevronRight size={16} color="#9ca3af" />
            </Pressable>
          </View>
        </View>

        {/* Session */}
        <View>
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Session
          </Text>
          <Pressable
            onPress={handleSignOut}
            disabled={signingOut}
            className="flex-row items-center justify-center gap-2 border border-gray-200 rounded-2xl py-4 active:opacity-70 disabled:opacity-50 bg-white"
          >
            {signingOut ? (
              <ActivityIndicator size="small" color="#374151" />
            ) : (
              <>
                <LogOut size={18} color="#374151" />
                <Text className="text-gray-700 font-medium">Sign out</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Danger zone */}
        <View>
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Danger zone
          </Text>
          <Pressable
            onPress={handleDeleteAccount}
            disabled={deleting}
            className="flex-row items-center justify-center gap-2 border border-red-200 rounded-2xl py-4 active:opacity-70 disabled:opacity-50 bg-red-50"
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <>
                <Trash2 size={18} color="#ef4444" />
                <Text className="text-red-500 font-medium">Delete account</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
