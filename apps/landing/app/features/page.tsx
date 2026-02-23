import type { Metadata } from 'next'
import { Mic, Eye, Shield, Heart, Zap, MessageCircle, Lock, BarChart3, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Features — Ring Bearer',
  description: 'Voice intros, transparent matching, anti-ghosting, and more.',
}

const FEATURES = [
  {
    icon: Mic,
    title: 'Voice Intros',
    body: 'Record a 30-second voice clip on your profile. People who add a voice intro get 3× more matches — because your voice conveys personality no photo ever could.',
    badge: '3× more matches',
  },
  {
    icon: Eye,
    title: 'Transparent Discovery',
    body: 'No black-box algorithm. You see profiles based on your age, distance, and gender preferences — period. No hidden scoring, no pay-to-be-seen.',
    badge: null,
  },
  {
    icon: Shield,
    title: 'Photo Moderation',
    body: 'Every photo is reviewed before it appears in discovery. No inappropriate content reaches other users.',
    badge: null,
  },
  {
    icon: BarChart3,
    title: 'Response Rate Visibility',
    body: 'See how often someone replies before you invest your time. Anti-ghosting accountability built in — not bolted on.',
    badge: 'Anti-ghosting',
  },
  {
    icon: Heart,
    title: 'Mutual Match Only',
    body: 'You can only message someone after you both like each other. No unsolicited messages, ever.',
    badge: null,
  },
  {
    icon: Zap,
    title: 'Daily Swipe Limit (Free)',
    body: '20 thoughtful swipes per day on the free tier. Designed to encourage quality over quantity — you\'ll be more selective when swipes are limited.',
    badge: null,
  },
  {
    icon: MessageCircle,
    title: 'Real-Time Chat',
    body: 'Instant messaging with typing indicators so conversations feel natural. Unmatch at any time.',
    badge: null,
  },
  {
    icon: Lock,
    title: 'Block & Report',
    body: 'One tap to block someone or submit a report. Our team reviews every report within 24 hours.',
    badge: null,
  },
  {
    icon: Star,
    title: 'Super Likes (Premium)',
    body: '5 super likes per day on Premium. Stand out from the crowd when someone really catches your eye.',
    badge: 'Premium',
  },
]

export default function FeaturesPage() {
  return (
    <main className="pt-24 pb-20">
      {/* Header */}
      <section className="px-4 py-16 text-center bg-gradient-to-b from-rose-50 to-white">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Everything you need.<br />Nothing you don't.
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Every feature in Ring Bearer exists to help you connect with real people — not to keep you endlessly scrolling.
          </p>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, body, badge }) => (
            <div key={title} className="border border-gray-200 rounded-2xl p-6 hover:border-rose-200 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-rose-600" />
                </div>
                {badge && (
                  <span className="text-xs font-semibold bg-rose-100 text-rose-600 px-2.5 py-1 rounded-full">
                    {badge}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-8 text-center">
        <a
          href={process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000'}
          className="inline-block bg-rose-600 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-rose-700 transition-colors"
        >
          Start for free
        </a>
      </section>
    </main>
  )
}
