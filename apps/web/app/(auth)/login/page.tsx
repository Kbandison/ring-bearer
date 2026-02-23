import { AuthForm } from '@/components/auth/auth-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Ring Bearer</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <AuthForm mode="login" />
        </div>
      </div>
    </div>
  )
}
