import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { formId: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await prisma.form.findFirst({
    where: { id: params.formId, userId: session.user.id },
  })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const responses = await prisma.response.findMany({
    where: { formId: params.formId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(responses)
}