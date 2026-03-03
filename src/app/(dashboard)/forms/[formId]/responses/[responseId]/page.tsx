import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CompatibilityReport } from '@/components/report/CompatibilityReport'
import { ScoredQuestion } from '@/types'

export default async function ResponseDetailPage({
  params,
}: {
  params: { formId: string; responseId: string }
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const response = await prisma.response.findFirst({
    where: { id: params.responseId, formId: params.formId },
    include: {
      form: { select: { userId: true, title: true } },
    },
  })

  if (!response || response.form.userId !== session.user.id) redirect('/dashboard')

  return (
    <CompatibilityReport
      formId={params.formId}
      formTitle={response.form.title}
      respondentName={response.respondentName ?? 'Anonymous'}
      score={response.score ?? 0}
      breakdown={response.breakdown as unknown as ScoredQuestion[]}
      createdAt={response.createdAt.toISOString()}
    />
  )
}
