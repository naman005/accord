import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export const formCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
})

export const questionSchema = z.object({
  id: z.string(),
  text: z.string().min(5, 'Question must be at least 5 characters'),
  type: z.enum(['text', 'select', 'yesno', 'number', 'rating']),
  options: z.array(z.string()).optional(),
  weight: z.coerce.number().min(1).max(10),
  idealAnswer: z.string().optional(),
  required: z.boolean(),
  order: z.number(),
})

export const sectionSchema = z.object({
  id: z.string(),
  title: z.string().min(2),
  category: z.enum([
    'personal_background',
    'personality_values',
    'finance_career',
    'family_living',
    'children_parenting',
    'legal',
    'lifestyle',
    'intelligence_reasoning',
    'custom',
  ]),
  order: z.number(),
  questions: z.array(questionSchema),
})

export const formSaveSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  sections: z.array(sectionSchema),
  visibility: z.enum(['PRIVATE', 'PUBLIC']).optional(),
  allowCopy: z.boolean().optional(),
})
