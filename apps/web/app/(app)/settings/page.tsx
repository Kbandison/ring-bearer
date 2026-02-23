import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/logout-button'
import { DeleteAccountButton } from '@/components/settings/delete-account-button'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-24">
      <h1 className="text-xl font-bold mb-8">Settings</h1>

      <div className="space-y-8">
        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Account
          </p>
          <div className="bg-muted/40 rounded-2xl border border-border overflow-hidden divide-y divide-border">
            <div className="px-4 py-3">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-sm font-medium truncate">{user.email}</p>
            </div>
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Session
          </p>
          <LogoutButton />
        </section>

        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Danger zone
          </p>
          <DeleteAccountButton />
        </section>
      </div>
    </div>
  )
}
