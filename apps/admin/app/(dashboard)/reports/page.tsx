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
import { ReportActions } from '@/components/reports/report-actions'
import { format } from 'date-fns'

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'destructive' },
  reviewed: { label: 'Reviewed', variant: 'secondary' },
  dismissed: { label: 'Dismissed', variant: 'outline' },
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = 'pending' } = await searchParams
  const supabase = createServiceClient()

  const { data: reports } = await supabase
    .from('reports')
    .select('id, reason, details, status, created_at, reporter_id, reported_id')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(100)

  // Fetch profile names for reporters and reported users
  const profileIds = [
    ...new Set([
      ...(reports?.map((r) => r.reporter_id) ?? []),
      ...(reports?.map((r) => r.reported_id) ?? []),
    ]),
  ]

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', profileIds)

  const nameMap = Object.fromEntries(profiles?.map((p) => [p.id, p.name]) ?? [])

  const statusTabs = ['pending', 'reviewed', 'dismissed']

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1 text-sm">User-submitted reports</p>
      </div>

      <div className="flex gap-2 mb-6">
        {statusTabs.map((s) => (
          <a
            key={s}
            href={`/reports?status=${s}`}
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

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reporter</TableHead>
              <TableHead>Reported User</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports?.map((report) => {
              const badgeConfig = STATUS_BADGE[report.status ?? 'pending'] ?? STATUS_BADGE['pending']!
              return (
                <TableRow key={report.id}>
                  <TableCell>{nameMap[report.reporter_id] ?? 'Unknown'}</TableCell>
                  <TableCell className="font-medium">
                    {nameMap[report.reported_id] ?? 'Unknown'}
                  </TableCell>
                  <TableCell className="capitalize">{report.reason.replace(/_/g, ' ')}</TableCell>
                  <TableCell className="max-w-xs">
                    <span className="text-gray-500 text-sm line-clamp-2">
                      {report.details ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={badgeConfig.variant}>{badgeConfig.label}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {report.created_at
                      ? format(new Date(report.created_at), 'MMM d, yyyy')
                      : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    {report.status === 'pending' && (
                      <ReportActions reportId={report.id} reportedProfileId={report.reported_id} />
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {(!reports || reports.length === 0) && (
          <p className="text-center text-gray-500 text-sm py-12">
            No {status} reports
          </p>
        )}
      </div>
    </div>
  )
}
