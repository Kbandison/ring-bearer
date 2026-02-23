'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

const authSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type AuthFormData = z.infer<typeof authSchema>

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  })

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      if (mode === 'signup') {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        })
        if (signUpError) throw signUpError
        if (!signUpData.session) {
          // Email confirmation is enabled — session not yet active
          setError('Check your email for a confirmation link before continuing.')
          setLoading(false)
          return
        }
        router.push('/onboarding')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        })
        if (signInError) throw signInError
        router.push('/onboarding')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading
          ? mode === 'login'
            ? 'Signing in…'
            : 'Creating account…'
          : mode === 'login'
            ? 'Sign in'
            : 'Create account'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {mode === 'login' ? (
          <>
            No account?{' '}
            <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  )
}
