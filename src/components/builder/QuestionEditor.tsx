'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Question, QuestionType } from '@/types'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Plus, X } from 'lucide-react'

const schema = z.object({
  text: z.string().min(5),
  type: z.enum(['text', 'select', 'yesno', 'number', 'rating']),
  options: z.array(z.object({ value: z.string() })).optional(),
  weight: z.number().min(1).max(10),
  idealAnswer: z.string().optional(),
  required: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  onSave: (q: Omit<Question, 'id' | 'order'>) => void
  initialValues?: Partial<Question>
}

export function QuestionEditor({ open, onClose, onSave, initialValues }: Props) {
  const { register, control, watch, handleSubmit, setValue, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        text: initialValues?.text ?? '',
        type: initialValues?.type ?? 'text',
        weight: initialValues?.weight ?? 5,
        idealAnswer: initialValues?.idealAnswer ?? '',
        required: initialValues?.required ?? true,
        options: initialValues?.options?.map((v) => ({ value: v })) ?? [],
      },
    })

  const { fields, append, remove } = useFieldArray({ control, name: 'options' })
  const questionType = watch('type')

  const onSubmit = (data: FormValues) => {
    onSave({
      text: data.text,
      type: data.type as QuestionType,
      options: data.options?.map((o) => o.value).filter(Boolean),
      weight: data.weight,
      idealAnswer: data.idealAnswer || undefined,
      required: data.required,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialValues ? 'Edit Question' : 'Add Question'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Question text */}
          <div className="space-y-1">
            <Label>Question Text</Label>
            <Input {...register('text')} placeholder="Enter your question..." />
            {errors.text && (
              <p className="text-xs text-destructive">{errors.text.message}</p>
            )}
          </div>

          {/* Question type */}
          <div className="space-y-1">
            <Label>Question Type</Label>
            <Select
              value={questionType}
              onValueChange={(v) => setValue('type', v as QuestionType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text (open-ended)</SelectItem>
                <SelectItem value="yesno">Yes / No</SelectItem>
                <SelectItem value="select">Multiple Choice</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="rating">Rating (1–10)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options — only for select type */}
          {questionType === 'select' && (
            <div className="space-y-2">
              <Label>Options</Label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    {...register(`options.${index}.value`)}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ value: '' })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Option
              </Button>
            </div>
          )}

          {/* Ideal answer */}
          <div className="space-y-1">
            <Label>
              Your Ideal Answer{' '}
              <span className="text-xs text-muted-foreground">(used for scoring)</span>
            </Label>
            {questionType === 'yesno' ? (
              <Select
                defaultValue={initialValues?.idealAnswer ?? ''}
                onValueChange={(v) => setValue('idealAnswer', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ideal answer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            ) : questionType === 'select' ? (
              <Input
                {...register('idealAnswer')}
                placeholder="Type the exact option text"
              />
            ) : (
              <Input
                {...register('idealAnswer')}
                placeholder={
                  questionType === 'number' || questionType === 'rating'
                    ? 'e.g. 7'
                    : 'Leave blank to skip scoring for this question'
                }
              />
            )}
          </div>

          {/* Weight */}
          <div className="space-y-1">
            <Label>
              Weight: {watch('weight')}{' '}
              <span className="text-xs text-muted-foreground">(1 = least important, 10 = most)</span>
            </Label>
            <input
              type="range"
              min={1}
              max={10}
              {...register('weight', { valueAsNumber: true })}
              className="w-full accent-primary"
            />
          </div>

          {/* Required */}
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('required')} id="required" />
            <Label htmlFor="required">Required</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Question</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}