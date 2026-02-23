'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

const REASONS = [
  { value: 'inappropriate_photos', label: 'Inappropriate photos' },
  { value: 'harassment', label: 'Harassment or abuse' },
  { value: 'fake_profile', label: 'Fake profile' },
  { value: 'spam', label: 'Spam or scam' },
  { value: 'underage', label: 'Appears underage' },
  { value: 'other', label: 'Other' },
]

interface ReportModalProps {
  reportedProfileId: string
  reportedName: string
  onClose: () => void
  onSubmit: (reason: string, description: string) => Promise<void>
}

export function ReportModal({ reportedName, onClose, onSubmit }: ReportModalProps) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    if (!reason || submitting) return
    setSubmitting(true)
    await onSubmit(reason, description)
    setDone(true)
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-background w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">Report {reportedName}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="text-center py-4">
            <p className="text-2xl mb-2">✅</p>
            <p className="font-semibold">Report submitted</p>
            <p className="text-sm text-muted-foreground mt-1">
              We&apos;ll review it within 24 hours.
            </p>
            <Button className="mt-5 w-full" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              What&apos;s the reason for reporting?
            </p>
            <div className="space-y-2 mb-4">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    reason === r.value
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:border-foreground/50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <textarea
              className="w-full rounded-xl border border-border bg-muted px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring mb-4"
              placeholder="Additional details (optional)"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!reason || submitting}
            >
              {submitting ? 'Submitting…' : 'Submit report'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
