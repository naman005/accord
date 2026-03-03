'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { nanoid } from 'nanoid'
import { Section, Question } from '@/types'
import { SectionCard } from './SectionCard'
import { AddSectionDialog } from './AddSectionDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Save, Send } from 'lucide-react'

interface Props {
  formId: string
  initialTitle: string
  initialDescription?: string
  initialSections: Section[]
  onSave: (data: { title: string; description: string; sections: Section[] }) => Promise<void>
  onPublish: () => Promise<void>
  isPublished: boolean
}

export function FormBuilder({
  formId,
  initialTitle,
  initialDescription = '',
  initialSections,
  onSave,
  onPublish,
  isPublished,
}: Props) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  // ── Section operations ──────────────────────────────────────────────────

  const addSection = useCallback((title: string, category: Section['category']) => {
    const newSection: Section = {
      id: nanoid(),
      title,
      category,
      order: sections.length,
      questions: [],
    }
    setSections((prev) => [...prev, newSection])
  }, [sections.length])

  const updateSection = useCallback((sectionId: string, updates: Partial<Section>) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    )
  }, [])

  const deleteSection = useCallback((sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId))
  }, [])

  // ── Question operations ─────────────────────────────────────────────────

  const addQuestion = useCallback((sectionId: string, question: Omit<Question, 'id' | 'order'>) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s
        const newQ: Question = {
          ...question,
          id: nanoid(),
          order: s.questions.length,
        }
        return { ...s, questions: [...s.questions, newQ] }
      })
    )
  }, [])

  const updateQuestion = useCallback((sectionId: string, questionId: string, updates: Partial<Question>) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s
        return {
          ...s,
          questions: s.questions.map((q) =>
            q.id === questionId ? { ...q, ...updates } : q
          ),
        }
      })
    )
  }, [])

  const deleteQuestion = useCallback((sectionId: string, questionId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s
        return { ...s, questions: s.questions.filter((q) => q.id !== questionId) }
      })
    )
  }, [])

  // ── Drag & Drop ─────────────────────────────────────────────────────────

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    // Determine if dragging sections or questions
    const activeSection = sections.find((s) => s.id === active.id)

    if (activeSection) {
      // Reorder sections
      const oldIndex = sections.findIndex((s) => s.id === active.id)
      const newIndex = sections.findIndex((s) => s.id === over.id)
      setSections((prev) =>
        arrayMove(prev, oldIndex, newIndex).map((s, i) => ({ ...s, order: i }))
      )
    } else {
      // Reorder questions within a section
      setSections((prev) =>
        prev.map((s) => {
          const qIds = s.questions.map((q) => q.id)
          if (!qIds.includes(active.id as string)) return s
          const oldIndex = qIds.indexOf(active.id as string)
          const newIndex = qIds.indexOf(over.id as string)
          if (newIndex === -1) return s
          return {
            ...s,
            questions: arrayMove(s.questions, oldIndex, newIndex).map((q, i) => ({
              ...q,
              order: i,
            })),
          }
        })
      )
    }
  }, [sections])

  // ── Save / Publish ──────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({ title, description, sections })
      toast({ title: 'Saved', description: 'Your form has been saved.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    await handleSave()
    try {
      await onPublish()
      toast({ title: 'Published!', description: 'Your form is now live.' })
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Form header */}
      <div className="space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Form title"
          className="text-2xl font-semibold h-12"
        />
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
        />
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between border-b pb-4">
        <p className="text-sm text-muted-foreground">
          {sections.length} sections ·{' '}
          {sections.reduce((acc, s) => acc + s.questions.length, 0)} questions
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          {!isPublished && (
            <Button onClick={handlePublish} disabled={saving}>
              <Send className="w-4 h-4 mr-2" />
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* Sections */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {sections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                onUpdateSection={updateSection}
                onDeleteSection={deleteSection}
                onAddQuestion={addQuestion}
                onUpdateQuestion={updateQuestion}
                onDeleteQuestion={deleteQuestion}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <AddSectionDialog onAdd={addSection} />
    </div>
  )
}