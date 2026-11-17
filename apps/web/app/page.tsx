import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const cookieStore = await cookies()
  const hasSession = cookieStore.has('admin_session')

  if (hasSession) {
    redirect('/admin')
  }
  redirect('/login')
}
