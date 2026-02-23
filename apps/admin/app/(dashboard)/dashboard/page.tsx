import { createServiceClient } from '@/lib/supabase/service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Heart, MessageSquare, Flag } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createServiceClient()

  const [
    { count: totalUsers },
    { count: activeUsers },
    { count: totalMatches },
    { count: pendingReports },
    { count: pendingPhotos },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .is('unmatched_at', null),
    supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('photos')
      .select('id', { count: 'exact', head: true })
      .eq('moderation_status', 'pending'),
  ])

  const stats = [
    {
      label: 'Total Users',
      value: totalUsers ?? 0,
      sub: `${activeUsers ?? 0} active`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Active Matches',
      value: totalMatches ?? 0,
      sub: 'not unmatched',
      icon: Heart,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
    },
    {
      label: 'Pending Reports',
      value: pendingReports ?? 0,
      sub: 'need review',
      icon: Flag,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Photos to Review',
      value: pendingPhotos ?? 0,
      sub: 'awaiting moderation',
      icon: MessageSquare,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Overview of Ring Bearer activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
              <div className={`${bg} p-2 rounded-lg`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
