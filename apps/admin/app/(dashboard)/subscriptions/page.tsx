import { createServiceClient } from '@/lib/supabase/service'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'

export default async function SubscriptionsPage() {
  const supabase = createServiceClient()

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('id, profile_id, tier, status, current_period_end, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const profileIds = [...new Set(subscriptions?.map((s) => s.profile_id) ?? [])]
  const { data: profiles } = profileIds.length
    ? await supabase.from('profiles').select('id, name').in('id', profileIds)
    : { data: [] }
  const nameMap = Object.fromEntries(profiles?.map((p) => [p.id, p.name]) ?? [])

  const premiumCount = subscriptions?.filter(
    (s) => s.tier === 'premium' && s.status === 'active'
  ).length ?? 0
  const freeCount = subscriptions?.filter((s) => s.tier !== 'premium').length ?? 0

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
        <p className="text-gray-500 mt-1 text-sm">User subscription status</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-4">
          <p className="text-sm text-gray-500">Premium</p>
          <p className="text-2xl font-bold text-gray-900">{premiumCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-4">
          <p className="text-sm text-gray-500">Free</p>
          <p className="text-2xl font-bold text-gray-900">{freeCount}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Renews</TableHead>
              <TableHead>Since</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions?.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">
                  {nameMap[sub.profile_id] ?? 'Unknown'}
                </TableCell>
                <TableCell className="capitalize">{sub.tier ?? 'free'}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      sub.status === 'active'
                        ? 'default'
                        : sub.status === 'canceled'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {sub.status ?? 'free'}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-500">
                  {sub.current_period_end
                    ? format(new Date(sub.current_period_end), 'MMM d, yyyy')
                    : '—'}
                </TableCell>
                <TableCell className="text-gray-500">
                  {sub.created_at
                    ? format(new Date(sub.created_at), 'MMM d, yyyy')
                    : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {(!subscriptions || subscriptions.length === 0) && (
          <p className="text-center text-gray-500 text-sm py-12">No subscriptions found</p>
        )}
      </div>
    </div>
  )
}
