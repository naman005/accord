'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FormTemplate } from '@/types'
import { QuestionRenderer } from './QuestionRenderer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CATEGORY_LABELS } from '@/types'
import { CheckCircle2 } from 'lucide-react'

interface Props {
  token: string
}

export function PublicForm({ token }: Props) {
  const [form, setForm] = useState<FormTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [error, setError] = useState('')

  const { register, handleSubmit, setValue, watch } = useForm<Record<string, string>>()

  useEffect(() => {
    fetch(`/api/public/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setForm(data)
      })
      .finally(() => setLoading(false))
  }, [token])

  const onSubmit = async (answers: Record<string, string>) => {
    const { respondentName, ...rest } = answers as any
    const res = await fetch(`/api/public/${token}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ respondentName, answers: rest }),
    })
    const data = await res.json()
    if (res.ok) {
      setScore(data.score)
      setSubmitted(true)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (error) return <div className="flex items-center justify-center min-h-screen text-destructive">{error}</div>
  if (!form) return null

  if (submitted && score !== null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <h1 className="text-3xl font-bold">Response Submitted</h1>
        <p className="text-muted-foreground text-center max-w-sm">
          Thank you for completing this questionnaire. The creator will be able to view your
          compatibility results.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{form.title}</h1>
        {form.description && (
          <p className="text-muted-foreground mt-2">{form.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Respondent name */}
        <div className="space-y-1">
          <Label>Your Name</Label>
          <Input {...register('respondentName')} placeholder="Enter your name" />
        </div>

        {form.sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {CATEGORY_LABELS[section.category]}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {section.questions.map((question) => (
                <QuestionRenderer
                  key={question.id}
                  question={question}
                  register={register}
                  setValue={setValue}
                  watch={watch}
                />
              ))}
            </CardContent>
          </Card>
        ))}

        <Button type="submit" className="w-full" size="lg">
          Submit Response
        </Button>
      </form>
    </div>
  )
}