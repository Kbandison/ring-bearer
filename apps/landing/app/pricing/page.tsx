import type { Metadata } from 'next'
import { Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing — Ring Bearer',
  description: 'Free to join. Upgrade for unlimited swipes and more.',
}

const FREE_FEATURES = [
  '20 swipes per day',
  'Unlimited matches',
  'Real-time messaging',
  'Voice intro recording',
  'Photo upload (up to 6)',
  'Block & report',
]

const PREMIUM_FEATURES = [
  'Unlimited swipes',
  '5 super likes per day',
  'Unlimited matches',
  'Real-time messaging',
  'Voice intro recording',
  'Photo upload (up to 6)',
  'Block & report',
  'Priority support',
]

export default function PricingPage() {
  const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000'

  return (
    <main className="pt-24 pb-20">
      {/* Header */}
      <section className="px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Simple, honest pricing</h1>
          <p className="text-lg text-gray-500">
            No tricks, no "boost" purchases, no dark patterns. Just two tiers.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="px-4 py-8">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-6">
          {/* Free */}
          <div className="border border-gray-200 rounded-2xl p-8">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Free</p>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-extrabold text-gray-900">$0</span>
            </div>
            <p className="text-sm text-gray-500 mb-8">Always free. No credit card needed.</p>

            <a
              href={`${WEB_URL}/signup`}
              className="block w-full text-center border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-full hover:bg-gray-50 transition-colors mb-8"
            >
              Get started
            </a>

            <ul className="space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-gray-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Premium */}
          <div className="border-2 border-rose-500 rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                Most popular
              </span>
            </div>

            <p className="text-sm font-semibold text-rose-600 uppercase tracking-wide mb-1">Premium</p>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-extrabold text-gray-900">$12.99</span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>
            <p className="text-sm text-gray-500 mb-8">Cancel anytime. No hidden fees.</p>

            <a
              href={`${WEB_URL}/signup`}
              className="block w-full text-center bg-rose-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-rose-700 transition-colors mb-8"
            >
              Start with Premium
            </a>

            <ul className="space-y-3">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-rose-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="px-4 py-16 text-center">
        <p className="text-gray-500 text-sm">
          Questions about billing?{' '}
          <a href="/faq" className="text-rose-600 font-medium hover:underline">
            Check the FAQ
          </a>
        </p>
      </section>
    </main>
  )
}
