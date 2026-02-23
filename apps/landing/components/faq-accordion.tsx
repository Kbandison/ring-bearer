'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-5 flex items-center justify-between gap-4"
      >
        <span className="font-medium text-gray-900 text-sm sm:text-base">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="text-sm text-gray-500 leading-relaxed pb-5">{a}</p>
      )}
    </div>
  )
}

const FAQS = [
  {
    q: 'Is Ring Bearer really free?',
    a: 'Yes. You can create a profile, add photos, record a voice intro, and get up to 20 swipes per day completely free. Premium adds unlimited swipes and super likes for $12.99/month.',
  },
  {
    q: 'What is a voice intro?',
    a: 'A voice intro is a short recording (up to 30 seconds) you can add to your profile. It lets potential matches hear your personality before they swipe. Profiles with voice intros typically get 3× more matches.',
  },
  {
    q: 'How does matching work?',
    a: "When you like someone and they like you back, it's a match. Only then can you message each other. There are no unsolicited messages on Ring Bearer.",
  },
  {
    q: 'What is the daily swipe limit?',
    a: "Free users get 20 swipes per day, which resets at midnight. This is intentional — fewer, more thoughtful swipes lead to better matches. Premium users get unlimited swipes.",
  },
  {
    q: 'How do I upgrade to Premium?',
    a: "Go to Settings in the app and tap \"Upgrade to Premium.\" You'll be taken through a secure Stripe checkout. You can cancel anytime from your account settings.",
  },
  {
    q: 'Can I cancel my Premium subscription?',
    a: 'Yes, anytime. Go to Settings → Subscription → Cancel. Your premium features stay active until the end of your billing period.',
  },
  {
    q: 'How do I report or block someone?',
    a: 'Open a chat or a profile and tap the menu (three dots). You\'ll see options to Report or Block. Reports are reviewed by our team within 24 hours.',
  },
  {
    q: 'Are photos moderated?',
    a: 'Yes. Every photo is reviewed before it appears in discovery. This keeps the platform safe and free of inappropriate content.',
  },
  {
    q: 'What does "response rate" mean?',
    a: "Response rate shows how often a user replies to their first message from a new match. It's visible on profiles so you can gauge how engaged someone is before you match.",
  },
  {
    q: 'How do I install Ring Bearer on my phone?',
    a: 'Ring Bearer is a Progressive Web App (PWA). On iPhone: open Safari, tap Share, then "Add to Home Screen." On Android: open Chrome, tap the menu, then "Add to Home Screen." It works exactly like a native app.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Go to Settings → Delete Account. Your profile, matches, and messages are permanently removed. This action cannot be undone.',
  },
]

export function FaqAccordion() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-6 sm:px-8">
      {FAQS.map(({ q, a }) => (
        <FaqItem key={q} q={q} a={a} />
      ))}
    </div>
  )
}
