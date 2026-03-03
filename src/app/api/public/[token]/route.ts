import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { token: string } }) {
  const form = await prisma.form.findUnique({
    where: { shareToken: params.token, status: 'PUBLISHED' },
  })

  if (!form) return NextResponse.json({ error: 'Form not found or not published' }, { status: 404 })

  // Return form without userId
  const { userId, ...safeForm } = form
  return NextResponse.json(safeForm)
}