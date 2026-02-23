import { createServiceClient } from '@/lib/supabase/service'
import { VoiceModerationList } from '@/components/moderation/voice-moderation-list'

export default async function VoiceIntroModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = 'pending' } = await searchParams
  const supabase = createServiceClient()

  const { data: voiceIntros } = await supabase
    .from('voice_intros')
    .select('id, profile_id, url, duration_seconds, moderation_status, created_at')
    .eq('moderation_status', status)
    .order('created_at', { ascending: true })
    .limit(50)

  const profileIds = [...new Set(voiceIntros?.map((v) => v.profile_id) ?? [])]
  const { data: profiles } = profileIds.length
    ? await supabase.from('profiles').select('id, name').in('id', profileIds)
    : { data: [] }
  const nameMap = Object.fromEntries(profiles?.map((p) => [p.id, p.name]) ?? [])

  const statusTabs = ['pending', 'approved', 'rejected']

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Voice Moderation</h1>
        <p className="text-gray-500 mt-1 text-sm">Review uploaded voice introductions</p>
      </div>

      <div className="flex gap-2 mb-6">
        {statusTabs.map((s) => (
          <a
            key={s}
            href={`/moderation/voice-intros?status=${s}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              status === s
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s}
          </a>
        ))}
      </div>

      <VoiceModerationList
        items={
          voiceIntros?.map((v) => ({
            ...v,
            profileName: nameMap[v.profile_id] ?? 'Unknown',
          })) ?? []
        }
        showActions={status === 'pending'}
      />
    </div>
  )
}
