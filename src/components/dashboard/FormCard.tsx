'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FormTemplate } from '@/types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { formatDate, getShareUrl } from '@/lib/utils'
import { Copy, Edit, Eye, Globe, Lock, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Props {
  form: FormTemplate & { _count: { responses: number } }
}

export function FormCard({ form }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleting, setDeleting] = useState(false)

  const copyLink = () => {
    navigator.clipboard.writeText(getShareUrl(form.shareToken))
    toast({ title: 'Link copied!', description: 'Share this with your partner.' })
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/forms/${form.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast({ title: 'Form deleted', description: `"${form.title}" has been removed.` })
      router.refresh()
    } catch {
      toast({ title: 'Error', description: 'Could not delete form.', variant: 'destructive' })
      setDeleting(false)
    }
  }

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold leading-snug line-clamp-2 flex-1">
            {form.title}
          </CardTitle>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant={form.status === 'PUBLISHED' ? 'default' : 'secondary'} className="text-xs">
              {form.status === 'PUBLISHED' ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </div>

        {/* Visibility row */}
        <div className="flex items-center gap-2 mt-1">
          {form.visibility === 'PUBLIC' ? (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <Globe className="w-3 h-3" /> Public
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" /> Private
            </span>
          )}
          {form.allowCopy && (
            <span className="text-xs text-muted-foreground">· Copy allowed</span>
          )}
        </div>

        {form.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{form.description}</p>
        )}
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{form._count.responses} response{form._count.responses !== 1 ? 's' : ''}</span>
          <span className="text-muted-foreground/30">·</span>
          <span>Updated {formatDate(form.updatedAt)}</span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-0 flex-wrap">
        <Button asChild variant="outline" size="sm">
          <Link href={`/forms/${form.id}/edit`}>
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit
          </Link>
        </Button>

        <Button asChild variant="outline" size="sm">
          <Link href={`/forms/${form.id}/responses`}>
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            Responses
          </Link>
        </Button>

        {form.status === 'PUBLISHED' && (
          <Button variant="outline" size="sm" onClick={copyLink}>
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            Copy Link
          </Button>
        )}

        {/* Delete — with confirm dialog */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={deleting}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this form?</AlertDialogTitle>
              <AlertDialogDescription>
                <strong>"{form.title}"</strong> and all its responses will be permanently deleted.
                This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
