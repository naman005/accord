import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { formId: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await prisma.form.findFirst({
    where: { id: params.formId, userId: session.user.id },
  })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const sections = form.sections as any[]
  const hasQuestions = sections.some((s) => s.questions?.length > 0)
  if (!hasQuestions) {
    return NextResponse.json({ error: 'Form must have at least one question' }, { status: 400 })
  }

  const updated = await prisma.form.update({
    where: { id: params.formId },
    data: { status: 'PUBLISHED' },
  })

  return NextResponse.json(updated)
}