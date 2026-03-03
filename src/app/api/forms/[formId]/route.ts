import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formSaveSchema } from '@/lib/validations'

async function getOwnedForm(formId: string, userId: string) {
  return prisma.form.findFirst({ where: { id: formId, userId } })
}

export async function GET(
  req: Request,
  { params }: { params: { formId: string } }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await getOwnedForm(params.formId, session.user.id)
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(form)
}

export async function PATCH(
  req: Request,
  { params }: { params: { formId: string } }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await getOwnedForm(params.formId, session.user.id)
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = formSaveSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const updated = await prisma.form.update({
    where: { id: params.formId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      sections: parsed.data.sections as any,
      // Optional fields passed from builder settings panel
      ...(typeof parsed.data.visibility !== 'undefined' && {
        visibility: parsed.data.visibility,
      }),
      ...(typeof parsed.data.allowCopy !== 'undefined' && {
        allowCopy: parsed.data.allowCopy,
      }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  req: Request,
  { params }: { params: { formId: string } }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await getOwnedForm(params.formId, session.user.id)
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.form.delete({ where: { id: params.formId } })
  return NextResponse.json({ success: true })
}
