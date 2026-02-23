import { AppNav } from '@/components/app-nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-16">{children}</main>
      <AppNav />
    </div>
  )
}
