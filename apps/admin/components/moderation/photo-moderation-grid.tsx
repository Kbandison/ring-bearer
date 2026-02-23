'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'

type PhotoItem = {
  id: string
  url: string
  profile_id: string
  profileName: string
  moderation_status: string
  created_at: string
}

export function PhotoModerationGrid({
  photos,
  showActions,
}: {
  photos: PhotoItem[]
  showActions: boolean
}) {
  const router = useRouter()
  const [pending, setPending] = useState<Record<string, boolean>>({})

  const moderate = async (photoId: string, action: 'approve' | 'reject') => {
    setPending((p) => ({ ...p, [photoId]: true }))

    const res = await fetch('/api/admin/moderation/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId, action }),
    })

    if (res.ok) {
      router.refresh()
    } else {
      alert('Action failed.')
    }
    setPending((p) => ({ ...p, [photoId]: false }))
  }

  if (photos.length === 0) {
    return (
      <p className="text-center text-gray-500 text-sm py-16">No photos to review</p>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {photos.map((photo) => (
        <div key={photo.id} className="group relative">
          <div className="aspect-square relative overflow-hidden rounded-xl bg-gray-100 border border-gray-200">
            <Image
              src={photo.url}
              alt={`Photo by ${photo.profileName}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            />
          </div>
          <p className="text-xs text-gray-600 mt-1 font-medium truncate">{photo.profileName}</p>
          {showActions && (
            <div className="flex gap-1 mt-1">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-xs border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => moderate(photo.id, 'approve')}
                disabled={pending[photo.id]}
              >
                <Check className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-xs border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => moderate(photo.id, 'reject')}
                disabled={pending[photo.id]}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
