import { createServiceClient } from '@/lib/supabase/service'
import { SignupsChart } from '@/components/analytics/signups-chart'
import { SwipesChart } from '@/components/analytics/swipes-chart'
import { format, subDays, startOfDay } from 'date-fns'

export default async function AnalyticsPage() {
  const supabase = createServiceClient()

  // Get signups per day for last 30 days
  const thirtyDaysAgo = startOfDay(subDays(new Date(), 29)).toISOString()

  const { data: recentProfiles } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: true })

  // Get swipes per day for last 30 days
  const { data: recentSwipes } = await supabase
    .from('daily_swipe_counts')
    .select('swipe_date, swipe_count')
    .gte('swipe_date', thirtyDaysAgo.split('T')[0]!)
    .order('swipe_date', { ascending: true })

  // Build 30-day signup series
  const signupByDay: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const day = format(subDays(new Date(), i), 'MMM d')
    signupByDay[day] = 0
  }
  for (const profile of recentProfiles ?? []) {
    if (!profile.created_at) continue
    const day = format(new Date(profile.created_at), 'MMM d')
    if (day in signupByDay) signupByDay[day] = (signupByDay[day] ?? 0) + 1
  }
  const signupData = Object.entries(signupByDay).map(([date, count]) => ({ date, count }))

  // Aggregate swipes by day
  const swipeByDay: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const day = format(subDays(new Date(), i), 'MMM d')
    swipeByDay[day] = 0
  }
  for (const row of recentSwipes ?? []) {
    if (!row.swipe_date) continue
    const day = format(new Date(row.swipe_date), 'MMM d')
    if (day in swipeByDay) swipeByDay[day] = (swipeByDay[day] ?? 0) + (row.swipe_count ?? 0)
  }
  const swipeData = Object.entries(swipeByDay).map(([date, count]) => ({ date, count }))

  // Totals
  const totalSignups = recentProfiles?.length ?? 0
  const totalSwipes = swipeData.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1 text-sm">Last 30 days</p>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-4">
          <p className="text-sm text-gray-500">New Signups (30d)</p>
          <p className="text-2xl font-bold text-gray-900">{totalSignups}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-4">
          <p className="text-sm text-gray-500">Total Swipes (30d)</p>
          <p className="text-2xl font-bold text-gray-900">{totalSwipes.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Daily Signups</h2>
          <SignupsChart data={signupData} />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Daily Swipes</h2>
          <SwipesChart data={swipeData} />
        </div>
      </div>
    </div>
  )
}
