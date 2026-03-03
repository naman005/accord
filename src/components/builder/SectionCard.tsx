'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Section, Question } from '@/types'
import { QuestionCard } from './QuestionCard'
import { QuestionEditor } from './QuestionEditor'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CATEGORY_LABELS } from '@/types'
import { GripVertical, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  section: Section
  onUpdateSection: (id: string, updates: Partial<Section>) => void
  onDeleteSection: (id: string) => void
  onAddQuestion: (sectionId: string, q: Omit<Question, 'id' | 'order'>) => void
  onUpdateQuestion: (sectionId: string, qId: string, updates: Partial<Question>) => void
  onDeleteQuestion: (sectionId: string, qId: string) => void
}

export function SectionCard({
  section,
  onUpdateSection,
  onDeleteSection,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [showAddQuestion, setShowAddQuestion] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card ref={setNodeRef} style={style} className="border-2">
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <div className="flex-1">
          <input
            className="font-semibold text-lg bg-transparent border-none outline-none w-full"
            value={section.title}
            onChange={(e) => onUpdateSection(section.id, { title: e.target.value })}
          />
          <Badge variant="secondary" className="mt-1 text-xs">
            {CATEGORY_LABELS[section.category]}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteSection(section.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="space-y-2 pt-0">
          <SortableContext
            items={section.questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            {section.questions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                sectionId={section.id}
                onUpdate={(updates) => onUpdateQuestion(section.id, q.id, updates)}
                onDelete={() => onDeleteQuestion(section.id, q.id)}
              />
            ))}
          </SortableContext>

          {section.questions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
              No questions yet. Add one below.
            </p>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => setShowAddQuestion(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>

          {showAddQuestion && (
            <QuestionEditor
              open={showAddQuestion}
              onClose={() => setShowAddQuestion(false)}
              onSave={(q) => {
                onAddQuestion(section.id, q)
                setShowAddQuestion(false)
              }}
            />
          )}
        </CardContent>
      )}
    </Card>
  )
}