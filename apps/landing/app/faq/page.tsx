import type { Metadata } from 'next'
import { FaqAccordion } from '@/components/faq-accordion'

export const metadata: Metadata = {
  title: 'FAQ — Ring Bearer',
  description: 'Frequently asked questions about Ring Bearer.',
}

export default function FaqPage() {
  return (
    <main className="pt-24 pb-20">
      <section className="px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Frequently asked questions</h1>
          <p className="text-lg text-gray-500">
            Everything you need to know about Ring Bearer.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          <FaqAccordion />
          <p className="text-center text-sm text-gray-400 mt-8">
            Still have questions?{' '}
            <a href="mailto:support@ringbearer.app" className="text-rose-600 hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </section>
    </main>
  )
}
