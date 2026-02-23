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
import { BanButton } from '@/components/users/ban-button'
import { format } from 'date-fns'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const { page: pageStr, q } = await searchParams
  const page = Math.max(1, Number(pageStr ?? 1))
  const perPage = 50
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  const supabase = createServiceClient()

  let query = supabase
    .from('profiles')
    .select('id, name, gender, location_name, is_active, is_verified, is_banned, profile_completed, created_at')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  const { data: profiles } = await query

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1 text-sm">All registered profiles</p>
        </div>
      </div>

      <form method="GET" className="mb-4">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by name..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </form>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles?.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">{profile.name}</TableCell>
                <TableCell className="capitalize">{profile.gender}</TableCell>
                <TableCell>{profile.location_name ?? '—'}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {profile.is_banned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : profile.is_active ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    {profile.is_verified && (
                      <Badge variant="outline">Verified</Badge>
                    )}
                    {!profile.profile_completed && (
                      <Badge variant="outline" className="text-amber-600 border-amber-300">
                        Incomplete
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-gray-500">
                  {profile.created_at
                    ? format(new Date(profile.created_at), 'MMM d, yyyy')
                    : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <BanButton
                    profileId={profile.id}
                    isBanned={profile.is_banned ?? false}
                    name={profile.name}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {(!profiles || profiles.length === 0) && (
          <p className="text-center text-gray-500 text-sm py-12">No users found</p>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {page > 1 && (
          <a
            href={`/users?page=${page - 1}${q ? `&q=${q}` : ''}`}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Previous
          </a>
        )}
        {profiles && profiles.length === perPage && (
          <a
            href={`/users?page=${page + 1}${q ? `&q=${q}` : ''}`}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Next
          </a>
        )}
      </div>
    </div>
  )
}
