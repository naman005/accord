export type QuestionType = 'text' | 'select' | 'yesno' | 'number' | 'rating'

export type FormCategory =
  | 'personal_background'
  | 'personality_values'
  | 'finance_career'
  | 'family_living'
  | 'children_parenting'
  | 'legal'
  | 'lifestyle'
  | 'intelligence_reasoning'
  | 'custom'

export const CATEGORY_LABELS: Record<FormCategory, string> = {
  personal_background: 'Personal Background',
  personality_values: 'Personality & Values',
  finance_career: 'Finance & Career',
  family_living: 'Family & Living Preferences',
  children_parenting: 'Children & Parenting',
  legal: 'Legal (Prenup, Assets)',
  lifestyle: 'Lifestyle',
  intelligence_reasoning: 'Intelligence & Reasoning',
  custom: 'Custom Section',
}

export interface Question {
  id: string
  text: string
  type: QuestionType
  options?: string[]
  weight: number
  idealAnswer?: string
  required: boolean
  order: number
}

export interface Section {
  id: string
  title: string
  category: FormCategory
  order: number
  questions: Question[]
}

export type FormVisibility = 'PRIVATE' | 'PUBLIC'
export type FormStatus = 'DRAFT' | 'PUBLISHED'

export interface FormTemplate {
  id: string
  userId: string
  title: string
  description?: string | null
  status: FormStatus
  visibility: FormVisibility
  allowCopy: boolean
  copiedFromId?: string | null
  shareToken: string
  sections: Section[]
  createdAt: string
  updatedAt: string
  user?: { name?: string | null; email: string }
  _count?: { responses: number }
}

export interface ScoredQuestion {
  questionId: string
  questionText: string
  sectionTitle: string
  weight: number
  idealAnswer?: string
  respondentAnswer: string
  matched: boolean
  pointsEarned: number
  pointsPossible: number
}

export interface ResponseRecord {
  id: string
  formId: string
  respondentName?: string
  answers: Record<string, string>
  score: number
  breakdown: ScoredQuestion[]
  createdAt: string
}
