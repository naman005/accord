'use client'

import Link from 'next/link'
import { ScoredQuestion } from '@/types'
import { compatibilityLabel, formatDate } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Printer, CheckCircle2, XCircle } from 'lucide-react'

interface Props {
  formId: string
  formTitle: string
  respondentName: string
  score: number
  breakdown: ScoredQuestion[]
  createdAt: string
}

export function CompatibilityReport({
  formId,
  formTitle,
  respondentName,
  score,
  breakdown,
  createdAt,
}: Props) {
  const compat = compatibilityLabel(score)

  const matched = breakdown.filter((b) => b.matched).length
  const mismatched = breakdown.filter((b) => !b.matched).length

  // Group by section
  const bySectionMap = new Map<string, ScoredQuestion[]>()
  for (const item of breakdown) {
    if (!bySectionMap.has(item.sectionTitle)) {
      bySectionMap.set(item.sectionTitle, [])
    }
    bySectionMap.get(item.sectionTitle)!.push(item)
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8 print:py-4">
      {/* Back button + actions — hidden when printing */}
      <div className="flex items-start justify-between print:hidden">
        <div>
          <Link
            href={`/forms/${formId}/responses`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Responses
          </Link>
          <h1 className="text-2xl font-bold">Compatibility Report</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {formTitle} · {formatDate(createdAt)}
          </p>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="shrink-0 mt-1">
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </div>

      {/* Score card */}
      <div className="border rounded-xl p-8 text-center space-y-4">
        <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
          {respondentName}'s Compatibility Score
        </p>
        <p className="text-8xl font-black tabular-nums leading-none">
          {score.toFixed(0)}%
        </p>
        <p className={`text-lg font-semibold ${compat.color}`}>{compat.label}</p>
        <Progress value={score} className="w-48 mx-auto h-2.5" />
        <div className="flex justify-center gap-8 pt-1 text-sm">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            {matched} matched
          </span>
          <span className="flex items-center gap-1.5 text-red-500">
            <XCircle className="w-4 h-4" />
            {mismatched} mismatched
          </span>
        </div>
      </div>

      {/* Breakdown by section */}
      {Array.from(bySectionMap.entries()).map(([sectionTitle, questions]) => {
        const sectionMatched = questions.filter((q) => q.matched).length
        return (
          <div key={sectionTitle} className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-base font-semibold">{sectionTitle}</h2>
              <span className="text-xs text-muted-foreground">
                {sectionMatched}/{questions.length} matched
              </span>
            </div>

            {questions.map((q) => (
              <div
                key={q.questionId}
                className={`rounded-lg p-4 border-l-4 ${
                  q.matched
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20'
                    : 'border-red-400 bg-red-50/60 dark:bg-red-950/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium leading-snug flex-1">{q.questionText}</p>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    ×{q.weight}
                  </Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Ideal Answer
                    </p>
                    <p className="font-medium">{q.idealAnswer || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Their Answer
                    </p>
                    <p className={`font-medium ${!q.matched ? 'text-red-600 dark:text-red-400' : ''}`}>
                      {q.respondentAnswer || '—'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
