import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/logout-button'
import { EditProfileForm } from '@/components/settings/edit-profile-form'
import { DeleteAccountButton } from '@/components/settings/delete-account-button'
import { ChevronRight } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, bio, seeking_gender, min_age, max_age')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-24">
      <h1 className="text-xl font-bold mb-8">Settings</h1>

      <div className="space-y-10">
        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Profile
          </p>
          <Link
            href="/profile/me"
            className="flex items-center justify-between px-4 py-3 rounded-xl border border-border hover:bg-muted transition-colors mb-4"
          >
            <span className="text-sm font-medium">View my profile</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
          <EditProfileForm profile={profile} />
        </section>

        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Account
          </p>
          <div className="space-y-2">
            <LogoutButton />
            <DeleteAccountButton />
          </div>
        </section>
      </div>
    </div>
  )
}
