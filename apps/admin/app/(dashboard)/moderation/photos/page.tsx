import { createServiceClient } from '@/lib/supabase/service'
import { PhotoModerationGrid } from '@/components/moderation/photo-moderation-grid'

export default async function PhotoModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = 'pending' } = await searchParams
  const supabase = createServiceClient()

  const { data: photos } = await supabase
    .from('photos')
    .select('id, profile_id, url, moderation_status, created_at')
    .eq('moderation_status', status)
    .order('created_at', { ascending: true })
    .limit(48)

  const profileIds = [...new Set(photos?.map((p) => p.profile_id) ?? [])]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', profileIds)
  const nameMap = Object.fromEntries(profiles?.map((p) => [p.id, p.name]) ?? [])

  const statusTabs = ['pending', 'approved', 'rejected']

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Photo Moderation</h1>
        <p className="text-gray-500 mt-1 text-sm">Review uploaded profile photos</p>
      </div>

      <div className="flex gap-2 mb-6">
        {statusTabs.map((s) => (
          <a
            key={s}
            href={`/moderation/photos?status=${s}`}
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

      <PhotoModerationGrid
        photos={photos?.map((p) => ({ ...p, profileName: nameMap[p.profile_id] ?? 'Unknown' })) ?? []}
        showActions={status === 'pending'}
      />
    </div>
  )
}
