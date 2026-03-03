import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  visibility: z.enum(['PRIVATE', 'PUBLIC']),
  allowCopy: z.boolean(),
})

export async function PATCH(
  req: Request,
  { params }: { params: { formId: string } }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await prisma.form.findFirst({
    where: { id: params.formId, userId: session.user.id },
  })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // Can only make public if published
  if (parsed.data.visibility === 'PUBLIC' && form.status !== 'PUBLISHED') {
    return NextResponse.json(
      { error: 'Form must be published before making it public.' },
      { status: 400 }
    )
  }

  const updated = await prisma.form.update({
    where: { id: params.formId },
    data: {
      visibility: parsed.data.visibility,
      allowCopy: parsed.data.allowCopy,
    },
  })

  return NextResponse.json(updated)
}
