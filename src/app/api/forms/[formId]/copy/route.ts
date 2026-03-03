import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { formId: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // mode: 'edit' = copy as DRAFT for editing
  //        'use'  = copy as PUBLISHED so you can immediately send the share link to a partner
  const { mode = 'edit' } = await req.json().catch(() => ({ mode: 'edit' }))

  // Source must be public and published
  const source = await prisma.form.findFirst({
    where: {
      id: params.formId,
      visibility: 'PUBLIC',
      status: 'PUBLISHED',
    },
  })

  if (!source) {
    return NextResponse.json(
      { error: 'Template not found or not public.' },
      { status: 404 }
    )
  }

  // For copy+edit, allowCopy must be true
  if (mode === 'edit' && !source.allowCopy) {
    return NextResponse.json(
      { error: 'This template does not allow copying.' },
      { status: 403 }
    )
  }

  // If user already owns this form, just return it
  if (source.userId === session.user.id) {
    return NextResponse.json(
      { id: source.id, mode, alreadyOwned: true },
      { status: 200 }
    )
  }

  const copy = await prisma.form.create({
    data: {
      userId: session.user.id,
      title: mode === 'edit' ? `${source.title} (Copy)` : source.title,
      description: source.description,
      sections: source.sections,
      // 'use' copies are immediately published so the share link works right away
      status: mode === 'use' ? 'PUBLISHED' : 'DRAFT',
      visibility: 'PRIVATE',
      allowCopy: false,
      copiedFromId: source.id,
    },
  })

  return NextResponse.json({ id: copy.id, shareToken: copy.shareToken, mode }, { status: 201 })
}
