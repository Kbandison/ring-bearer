'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function BanButton({
  profileId,
  isBanned,
  name,
}: {
  profileId: string
  isBanned: boolean
  name: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    const action = isBanned ? 'unban' : 'ban'
    if (!confirm(`${isBanned ? 'Unban' : 'Ban'} ${name}?`)) return

    setLoading(true)
    const res = await fetch('/api/admin/users/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, action }),
    })

    if (res.ok) {
      router.refresh()
    } else {
      alert('Action failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <Button
      size="sm"
      variant={isBanned ? 'outline' : 'destructive'}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? '...' : isBanned ? 'Unban' : 'Ban'}
    </Button>
  )
}
