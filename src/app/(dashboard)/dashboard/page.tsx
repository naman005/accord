import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { FormCard } from '@/components/dashboard/FormCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const forms = await prisma.form.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { responses: true } } },
  })

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Forms</h1>
          <p className="text-muted-foreground">{forms.length} templates created</p>
        </div>
        <Button asChild>
          <Link href="/forms/new">
            <Plus className="w-4 h-4 mr-2" />
            New Form
          </Link>
        </Button>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No forms yet. Create your first one.</p>
          <Button asChild>
            <Link href="/forms/new">Create Form</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forms.map((form) => (
            <FormCard key={form.id} form={form as any} />
          ))}
        </div>
      )}
    </div>
  )
}