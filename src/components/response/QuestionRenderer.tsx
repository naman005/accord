'use client'

import { Question } from '@/types'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

interface Props {
  question: Question
  register: any
  setValue: any
  watch: any
}

export function QuestionRenderer({ question, register, setValue, watch }: Props) {
  const value = watch(question.id)

  return (
    <div className="space-y-2">
      <Label>
        {question.text}
        {question.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {question.type === 'text' && (
        <Input
          {...register(question.id, { required: question.required })}
          placeholder="Your answer..."
        />
      )}

      {question.type === 'yesno' && (
        <Select
          value={value}
          onValueChange={(v) => setValue(question.id, v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      )}

      {question.type === 'select' && question.options && (
        <Select
          value={value}
          onValueChange={(v) => setValue(question.id, v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an option..." />
          </SelectTrigger>
          <SelectContent>
            {question.options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {question.type === 'number' && (
        <Input
          type="number"
          {...register(question.id, { required: question.required })}
          placeholder="Enter a number..."
        />
      )}

      {question.type === 'rating' && (
        <div className="flex gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setValue(question.id, String(n))}
              className={`w-9 h-9 rounded-full border-2 text-sm font-medium transition-colors
                ${value === String(n)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-input hover:border-primary'
                }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}