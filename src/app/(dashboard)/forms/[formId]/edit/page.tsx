import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { FormBuilderClient } from '@/components/builder/FormBuilderClient'
import { Section, FormVisibility } from '@/types'

export default async function EditFormPage({
  params,
}: {
  params: { formId: string }
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const form = await prisma.form.findFirst({
    where: { id: params.formId, userId: session.user.id },
  })

  if (!form) notFound()

  return (
    <FormBuilderClient
      formId={form.id}
      initialTitle={form.title}
      initialDescription={form.description ?? ''}
      initialSections={(form.sections as unknown as Section[]) ?? []}
      isPublished={form.status === 'PUBLISHED'}
      shareToken={form.shareToken}
      initialVisibility={(form.visibility as FormVisibility) ?? 'PRIVATE'}
      initialAllowCopy={form.allowCopy ?? false}
    />
  )
}
