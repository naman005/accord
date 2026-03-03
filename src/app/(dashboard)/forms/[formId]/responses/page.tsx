import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatDate, compatibilityLabel } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'

export default async function ResponsesPage({
  params,
}: {
  params: { formId: string }
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const form = await prisma.form.findFirst({
    where: { id: params.formId, userId: session.user.id },
    include: { responses: { orderBy: { createdAt: 'desc' } } },
  })

  if (!form) redirect('/dashboard')

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold">{form.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {form.responses.length} response{form.responses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {form.responses.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <FileText className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">No responses yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Share the form link with your partner to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {form.responses.map((r) => {
            const compat = compatibilityLabel(r.score ?? 0)
            return (
              <div
                key={r.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {r.respondentName || 'Anonymous'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(r.createdAt)}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold tabular-nums">
                    {r.score?.toFixed(0)}%
                  </p>
                  <p className={`text-xs font-medium ${compat.color}`}>
                    {compat.label}
                  </p>
                </div>

                <Button asChild variant="outline" size="sm" className="shrink-0">
                  <Link href={`/forms/${params.formId}/responses/${r.id}`}>
                    View Report
                  </Link>
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
