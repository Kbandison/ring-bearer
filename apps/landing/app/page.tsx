import Link from 'next/link'
import {
  Mic,
  Shield,
  Eye,
  Heart,
  Zap,
  MessageCircle,
  Smartphone,
  Apple,
} from 'lucide-react'

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000'

const FEATURE_HIGHLIGHTS = [
  {
    icon: Mic,
    title: 'Voice Intros',
    body: 'Hear someone before you match. A 30-second voice clip tells you more than 10 photos ever could.',
  },
  {
    icon: Eye,
    title: 'Transparent Matching',
    body: 'No fake profiles, no artificial scarcity. See real people, real compatibility, real chances.',
  },
  {
    icon: Shield,
    title: 'Anti-Ghosting',
    body: 'Response rates are visible. You can see who actually replies before you invest your time.',
  },
]

const TRUST_ITEMS = [
  'No bots or fake profiles',
  'Photos moderated before going live',
  'Response rate transparency',
  'No dark-pattern monetization',
  'No algorithm designed to keep you swiping',
]

const IOS_STEPS = [
  'Open Safari and visit this page',
  'Tap the Share button (box with arrow)',
  'Scroll down and tap "Add to Home Screen"',
  'Tap "Add"',
]

const ANDROID_STEPS = [
  'Open Chrome and visit this page',
  'Tap the menu (three dots, top right)',
  'Tap "Add to Home Screen"',
  'Tap "Add"',
]

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center bg-gradient-to-b from-rose-50 to-white">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Heart className="w-3.5 h-3.5" />
            Built for real connections
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            Dating that actually<br />
            <span className="text-rose-600">works for you</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Ring Bearer is built on real compatibility — not algorithms designed to keep you swiping forever. Hear a voice, see a real person, make a real connection.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`${WEB_URL}/signup`}
              className="w-full sm:w-auto bg-rose-600 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-rose-700 transition-colors text-base"
            >
              Get started free
            </a>
            <Link
              href="/features"
              className="w-full sm:w-auto border border-gray-300 text-gray-700 font-semibold px-8 py-3.5 rounded-full hover:bg-gray-50 transition-colors text-base"
            >
              See how it works
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">Free to join. No credit card required.</p>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Why Ring Bearer is different
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            Every feature is designed to help you find someone real, not to maximize your time in the app.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            {FEATURE_HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-gray-50 rounded-2xl p-6">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-rose-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/features"
              className="text-sm font-medium text-rose-600 hover:text-rose-700 underline underline-offset-2"
            >
              See all features →
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '01', icon: Zap, title: 'Create your profile', body: 'Add photos, a bio, and optionally a short voice intro. Your voice sets you apart.' },
              { step: '02', icon: Heart, title: 'Discover real people', body: 'Browse profiles filtered by age, distance, and what you\'re looking for. No fake accounts.' },
              { step: '03', icon: MessageCircle, title: 'Match & connect', body: 'When it\'s mutual, start a real conversation. No games, no "premium likes" required.' },
            ].map(({ step, icon: Icon, title, body }) => (
              <div key={step} className="text-center">
                <div className="text-xs font-bold text-rose-500 mb-3 tracking-widest">{step}</div>
                <div className="w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Icon className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-start">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built with honesty at the core
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Most dating apps profit from your loneliness. We profit when you find someone. That changes everything about how we design our product.
            </p>
            <ul className="space-y-3">
              {TRUST_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 text-green-600 text-xs font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 bg-rose-50 rounded-2xl p-8 border border-rose-100">
            <p className="text-2xl font-bold text-gray-900 mb-2">Free to start</p>
            <p className="text-gray-500 mb-6 text-sm">20 swipes per day at no cost. Upgrade for unlimited access.</p>
            <a
              href={`${WEB_URL}/signup`}
              className="block w-full bg-rose-600 text-white font-semibold px-6 py-3 rounded-full text-center hover:bg-rose-700 transition-colors"
            >
              Join for free
            </a>
            <Link
              href="/pricing"
              className="block w-full text-center text-sm text-gray-500 mt-3 hover:text-gray-700"
            >
              View pricing →
            </Link>
          </div>
        </div>
      </section>

      {/* PWA Install */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Smartphone className="w-3.5 h-3.5" />
            Install as an app
          </div>
          <h2 className="text-3xl font-bold mb-4">Add to your home screen</h2>
          <p className="text-gray-400 mb-12 max-w-xl mx-auto">
            Ring Bearer works like a native app — no App Store required. Install it in seconds from your browser.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto text-left">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Apple className="w-5 h-5" />
                <span className="font-semibold">iPhone / iPad</span>
              </div>
              <ol className="space-y-2">
                {IOS_STEPS.map((step, i) => (
                  <li key={i} className="text-sm text-gray-400 flex gap-2.5">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs text-white font-bold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-5 h-5" />
                <span className="font-semibold">Android</span>
              </div>
              <ol className="space-y-2">
                {ANDROID_STEPS.map((step, i) => (
                  <li key={i} className="text-sm text-gray-400 flex gap-2.5">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs text-white font-bold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 text-center bg-rose-600">
        <div className="max-w-xl mx-auto">
          <h2 className="text-4xl font-extrabold text-white mb-4">Ready to find your person?</h2>
          <p className="text-rose-100 mb-8">Join thousands already using Ring Bearer to make real connections.</p>
          <a
            href={`${WEB_URL}/signup`}
            className="inline-block bg-white text-rose-600 font-bold px-10 py-4 rounded-full hover:bg-rose-50 transition-colors text-lg"
          >
            Get started — it's free
          </a>
        </div>
      </section>
    </main>
  )
}
