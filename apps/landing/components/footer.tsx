import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <p className="font-bold text-gray-900 text-sm">Ring Bearer</p>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Dating built on real compatibility,<br />not endless swiping.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">Product</p>
            <ul className="space-y-2">
              <li><Link href="/features" className="text-sm text-gray-500 hover:text-gray-900">Features</Link></li>
              <li><Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900">Pricing</Link></li>
              <li><Link href="/faq" className="text-sm text-gray-500 hover:text-gray-900">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">Company</p>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-gray-500 hover:text-gray-900">About</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">Legal</p>
            <ul className="space-y-2">
              <li><span className="text-sm text-gray-400">Privacy Policy</span></li>
              <li><span className="text-sm text-gray-400">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} Ring Bearer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
