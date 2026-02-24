import { useState, useRef } from 'react'
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { Mic, Square, Play, Pause, RotateCcw, Check } from 'lucide-react-native'
import { useAudioPlayer, useAudioPlayerStatus, useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio'
import { supabase } from '@/lib/supabase'
import * as FileSystem from 'expo-file-system'

type Stage = 'idle' | 'recording' | 'preview' | 'uploading'

export default function Step4() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('idle')
  const [recordingUri, setRecordingUri] = useState<string | null>(null)
  const [finishing, setFinishing] = useState(false)

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const player = useAudioPlayer(recordingUri ?? undefined)
  const playerStatus = useAudioPlayerStatus(player)

  const startRecording = async () => {
    const perm = await AudioModule.requestRecordingPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow microphone access to record a voice intro.')
      return
    }
    await recorder.prepareToRecordAsync()
    recorder.record()
    setStage('recording')
  }

  const stopRecording = async () => {
    await recorder.stop()
    const uri = recorder.uri
    if (uri) {
      setRecordingUri(uri)
      setStage('preview')
    }
  }

  const togglePlayback = () => {
    if (playerStatus.playing) {
      player.pause()
    } else {
      player.seekTo(0)
      player.play()
    }
  }

  const reRecord = () => {
    player.pause()
    setRecordingUri(null)
    setStage('idle')
  }

  const uploadAndFinish = async () => {
    if (!recordingUri) { await finish(); return }
    setStage('uploading')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase
      .from('profiles').select('id').eq('user_id', user.id).single()
    if (!profile) return

    const path = `${profile.id}/${Date.now()}.m4a`
    const fileContent = await FileSystem.readAsStringAsync(recordingUri, {
      encoding: FileSystem.EncodingType.Base64,
    })

    const binary = Uint8Array.from(atob(fileContent), (c) => c.charCodeAt(0))
    const { error } = await supabase.storage
      .from('voice-intros')
      .upload(path, binary, { contentType: 'audio/m4a' })

    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('voice-intros').getPublicUrl(path)
      // Remove old intro if exists
      await supabase.from('voice_intros').delete().eq('profile_id', profile.id)
      await supabase.from('voice_intros').insert({
        profile_id: profile.id,
        url: publicUrl,
        storage_path: path,
        moderation_status: 'pending',
      })
    }

    await finish()
  }

  const finish = async () => {
    setFinishing(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('profiles')
      .update({ profile_completed: true })
      .eq('user_id', user.id)
    router.replace('/(app)/discover')
  }

  const stageLabel = {
    idle: 'Tap to start recording',
    recording: 'Recording… tap to stop',
    preview: 'Preview your voice intro',
    uploading: 'Uploading…',
  }[stage]

  return (
    <View className="flex-1 bg-white px-6 pt-16 pb-10">
      {/* Progress */}
      <View className="flex-row gap-1.5 mb-10">
        {[1,2,3,4].map((s) => (
          <View key={s} className="flex-1 h-1 rounded-full bg-rose-500" />
        ))}
      </View>

      <Text className="text-3xl font-bold text-gray-900 mb-1">Voice intro</Text>
      <Text className="text-base text-gray-500 mb-10">
        A short clip (5–60 sec) helps you stand out. You can skip this anytime.
      </Text>

      {/* Recorder UI */}
      <View className="flex-1 items-center justify-center gap-8">
        {/* Big mic button */}
        <Pressable
          onPress={stage === 'idle' ? startRecording : stage === 'recording' ? stopRecording : undefined}
          disabled={stage === 'preview' || stage === 'uploading'}
          className={`w-28 h-28 rounded-full items-center justify-center shadow-lg ${
            stage === 'recording' ? 'bg-red-500' : 'bg-rose-500'
          } disabled:opacity-50`}
          style={{ elevation: 8 }}
        >
          {stage === 'recording'
            ? <Square size={36} color="white" fill="white" />
            : <Mic size={36} color="white" />
          }
        </Pressable>

        <Text className="text-sm text-gray-500 text-center">{stageLabel}</Text>

        {/* Preview controls */}
        {stage === 'preview' && (
          <View className="flex-row gap-4 items-center">
            <Pressable
              onPress={reRecord}
              className="flex-row items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 active:opacity-70"
            >
              <RotateCcw size={16} color="#6b7280" />
              <Text className="text-sm text-gray-600 font-medium">Re-record</Text>
            </Pressable>
            <Pressable
              onPress={togglePlayback}
              className="flex-row items-center gap-2 px-5 py-2.5 rounded-full bg-gray-100 active:opacity-70"
            >
              {playerStatus.playing
                ? <Pause size={16} color="#111827" />
                : <Play size={16} color="#111827" />
              }
              <Text className="text-sm text-gray-900 font-medium">
                {playerStatus.playing ? 'Pause' : 'Play'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Bottom actions */}
      <View className="gap-3">
        {stage === 'preview' && (
          <Pressable
            onPress={uploadAndFinish}
            disabled={finishing}
            className="bg-rose-500 rounded-2xl py-4 items-center active:opacity-80 disabled:opacity-40"
          >
            {finishing
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-semibold text-base">Save & Finish</Text>
            }
          </Pressable>
        )}
        {stage === 'uploading' && (
          <View className="rounded-2xl py-4 items-center bg-rose-100">
            <ActivityIndicator color="#f43f5e" />
          </View>
        )}
        <Pressable
          onPress={finish}
          disabled={finishing || stage === 'uploading'}
          className="py-3 items-center"
        >
          <Text className="text-gray-400 text-sm">Skip for now</Text>
        </Pressable>
      </View>
    </View>
  )
}
