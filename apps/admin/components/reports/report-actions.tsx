'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function ReportActions({
  reportId,
  reportedProfileId,
}: {
  reportId: string
  reportedProfileId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handle = async (action: 'dismiss' | 'ban') => {
    if (action === 'ban' && !confirm('Ban this user?')) return
    setLoading(action)

    const res = await fetch('/api/admin/reports/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, reportedProfileId, action }),
    })

    if (res.ok) {
      router.refresh()
    } else {
      alert('Action failed.')
    }
    setLoading(null)
  }

  return (
    <div className="flex gap-1.5 justify-end">
      <Button
        size="sm"
        variant="outline"
        onClick={() => handle('dismiss')}
        disabled={loading !== null}
      >
        {loading === 'dismiss' ? '...' : 'Dismiss'}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handle('ban')}
        disabled={loading !== null}
      >
        {loading === 'ban' ? '...' : 'Ban User'}
      </Button>
    </div>
  )
}
