import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateCompatibility } from '@/lib/scoring'
import { Section } from '@/types'

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const form = await prisma.form.findUnique({
    where: { shareToken: params.token, status: 'PUBLISHED' },
  })

  if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 })

  const body = await req.json()
  const { respondentName, answers } = body

  if (!answers || typeof answers !== 'object') {
    return NextResponse.json({ error: 'Invalid answers' }, { status: 400 })
  }

  const sections = form.sections as unknown as Section[]
  const { score, breakdown } = calculateCompatibility(sections, answers)

  const response = await prisma.response.create({
    data: {
      formId: form.id,
      respondentName: respondentName || null,
      answers,
      score,
      breakdown: breakdown as any,
    },
  })

  return NextResponse.json({ responseId: response.id, score, breakdown }, { status: 201 })
}