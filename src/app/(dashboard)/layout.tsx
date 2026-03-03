import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/shared/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav
        userName={session.user.name ?? ''}
        userEmail={session.user.email ?? ''}
      />
      <main>{children}</main>
    </div>
  )
}
