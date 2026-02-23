'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await fetch('/api/account', { method: 'DELETE' })
    // Auth cookie gone — reload to /login via middleware
    window.location.href = '/login'
  }

  if (confirming) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
        <p className="text-sm font-medium text-destructive">Are you sure?</p>
        <p className="text-sm text-muted-foreground">
          This permanently deletes your profile, matches, and messages. This cannot be undone.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setConfirming(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Yes, delete'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
      onClick={() => setConfirming(true)}
    >
      Delete account
    </Button>
  )
}
