import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('q') ?? ''

  const forms = await prisma.form.findMany({
    where: {
      visibility: 'PUBLIC',
      status: 'PUBLISHED',
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      allowCopy: true,
      copiedFromId: true,
      shareToken: true,
      sections: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { name: true, email: true } },
      _count: { select: { responses: true } },
    },
  })

  return NextResponse.json(forms)
}
