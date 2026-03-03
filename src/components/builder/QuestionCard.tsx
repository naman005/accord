'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Question } from '@/types'
import { QuestionEditor } from './QuestionEditor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GripVertical, Pencil, Trash2, Star } from 'lucide-react'

const TYPE_LABELS: Record<Question['type'], string> = {
  text: 'Text',
  select: 'Choice',
  yesno: 'Yes / No',
  number: 'Number',
  rating: 'Rating',
}

const TYPE_COLORS: Record<Question['type'], string> = {
  text: 'bg-blue-50 text-blue-700 border-blue-200',
  select: 'bg-violet-50 text-violet-700 border-violet-200',
  yesno: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  number: 'bg-amber-50 text-amber-700 border-amber-200',
  rating: 'bg-rose-50 text-rose-700 border-rose-200',
}

interface Props {
  question: Question
  sectionId: string
  onUpdate: (updates: Partial<Question>) => void
  onDelete: () => void
}

export function QuestionCard({ question, sectionId, onUpdate, onDelete }: Props) {
  const [editOpen, setEditOpen] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-start gap-2 p-3 rounded-lg border bg-background hover:bg-muted/30 transition-colors group"
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0"
          tabIndex={-1}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug line-clamp-2">
            {question.text}
            {question.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </p>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {/* Type badge */}
            <span
              className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${TYPE_COLORS[question.type]}`}
            >
              {TYPE_LABELS[question.type]}
            </span>

            {/* Weight */}
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="w-3 h-3" />
              Weight {question.weight}
            </span>

            {/* Ideal answer indicator */}
            {question.idealAnswer && (
              <span className="text-xs text-muted-foreground italic truncate max-w-[180px]">
                Ideal: {question.idealAnswer}
              </span>
            )}
          </div>
        </div>

        {/* Actions — show on hover */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Edit dialog */}
      {editOpen && (
        <QuestionEditor
          open={editOpen}
          onClose={() => setEditOpen(false)}
          initialValues={question}
          onSave={(updates) => {
            onUpdate(updates)
            setEditOpen(false)
          }}
        />
      )}
    </>
  )
}
