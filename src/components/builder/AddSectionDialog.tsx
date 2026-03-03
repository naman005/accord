'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormCategory, CATEGORY_LABELS } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'

const schema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
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
})

type FormValues = z.infer<typeof schema>

interface Props {
  onAdd: (title: string, category: FormCategory) => void
}

export function AddSectionDialog({ onAdd }: Props) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      category: 'custom',
    },
  })

  const selectedCategory = watch('category')

  const onSubmit = (data: FormValues) => {
    onAdd(data.title, data.category as FormCategory)
    reset()
    setOpen(false)
  }

  const handleCategoryChange = (value: string) => {
    const category = value as FormCategory
    setValue('category', category)
    // Auto-fill title from category label if title is empty
    const currentTitle = watch('title')
    if (!currentTitle || currentTitle === '') {
      setValue('title', CATEGORY_LABELS[category])
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-dashed h-12 text-muted-foreground hover:text-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(CATEGORY_LABELS) as [FormCategory, string][]).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label>Section Title</Label>
            <Input
              {...register('title')}
              placeholder="e.g. Personal Background"
              autoFocus
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                setOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Add Section</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
