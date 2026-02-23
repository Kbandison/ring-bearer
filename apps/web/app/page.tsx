import { redirect } from 'next/navigation'

export default function RootPage() {
  // Middleware handles auth; redirect unauthenticated users to /login
  redirect('/discover')
}
