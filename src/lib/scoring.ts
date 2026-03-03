import { Section, ScoredQuestion } from '@/types'

function normalizeAnswer(answer: string): string {
  return String(answer).toLowerCase().trim()
}

function answersMatch(ideal: string, given: string): boolean {
  return normalizeAnswer(ideal) === normalizeAnswer(given)
}

export function calculateCompatibility(
  sections: Section[],
  answers: Record<string, string>
): {
  score: number
  breakdown: ScoredQuestion[]
} {
  const breakdown: ScoredQuestion[] = []
  let totalPoints = 0
  let earnedPoints = 0

  for (const section of sections) {
    for (const question of section.questions) {
      // Only score questions where creator set an idealAnswer
      if (!question.idealAnswer) continue

      const respondentAnswer = answers[question.id] ?? ''
      const matched = answersMatch(question.idealAnswer, respondentAnswer)
      const pointsPossible = question.weight
      const pointsEarned = matched ? question.weight : 0

      totalPoints += pointsPossible
      earnedPoints += pointsEarned

      breakdown.push({
        questionId: question.id,
        questionText: question.text,
        sectionTitle: section.title,
        weight: question.weight,
        idealAnswer: question.idealAnswer,
        respondentAnswer,
        matched,
        pointsEarned,
        pointsPossible,
      })
    }
  }

  const score = totalPoints === 0 ? 100 : Math.round((earnedPoints / totalPoints) * 100)

  return { score, breakdown }
}