'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FormTemplate, Section } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { formatDate, getShareUrl } from '@/lib/utils'
import {
  Search, Globe, Copy, Link2, Users, FileText,
  Loader2, Info,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type GalleryForm = FormTemplate & {
  user: { name?: string | null; email: string }
  _count: { responses: number }
}

export default function TemplatesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [templates, setTemplates] = useState<GalleryForm[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  // Track which formId is currently being actioned and which mode
  const [busy, setBusy] = useState<{ id: string; mode: 'use' | 'edit' } | null>(null)

  const fetchTemplates = useCallback(async (q: string) => {
    setLoading(true)
    const url = q ? `/api/templates?q=${encodeURIComponent(q)}` : '/api/templates'
    const res = await fetch(url)
    const data = await res.json()
    setTemplates(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchTemplates('') }, [fetchTemplates])

  useEffect(() => {
    const t = setTimeout(() => fetchTemplates(search), 350)
    return () => clearTimeout(t)
  }, [search, fetchTemplates])

  /**
   * "Use Form" — creates a private published copy under your account,
   * then opens your own share link. Responses go to YOU, not the original creator.
   */
  const handleUse = async (form: GalleryForm) => {
    setBusy({ id: form.id, mode: 'use' })
    try {
      const res = await fetch(`/api/forms/${form.id}/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'use' }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Failed')

      const shareUrl = getShareUrl(body.shareToken)
      toast({
        title: 'Form ready',
        description: 'A personal copy was created. Opening your share link…',
      })
      // Open the share link in a new tab — this is the link you send to your partner
      window.open(shareUrl, '_blank')
      // Also navigate to dashboard so user can see their new form + responses later
      router.push('/dashboard')
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setBusy(null)
    }
  }

  /**
   * "Copy & Edit" — creates a DRAFT copy, sends user to the builder.
   */
  const handleCopyEdit = async (form: GalleryForm) => {
    setBusy({ id: form.id, mode: 'edit' })
    try {
      const res = await fetch(`/api/forms/${form.id}/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'edit' }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Failed')

      if (body.alreadyOwned) {
        router.push(`/forms/${body.id}/edit`)
        return
      }

      toast({
        title: 'Template copied!',
        description: 'Opened in the builder. Customize and publish when ready.',
      })
      router.push(`/forms/${body.id}/edit`)
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setBusy(null)
    }
  }

  const sectionCount = (form: GalleryForm) =>
    Array.isArray(form.sections) ? (form.sections as Section[]).length : 0

  const questionCount = (form: GalleryForm) =>
    Array.isArray(form.sections)
      ? (form.sections as Section[]).reduce((acc, s) => acc + (s.questions?.length ?? 0), 0)
      : 0

  const authorName = (form: GalleryForm) =>
    form.user?.name || form.user?.email || 'Anonymous'

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Community Templates
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Browse questionnaires shared by the community. Use one directly or copy it to your account to customise.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="pl-9"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed rounded-lg">
            <Globe className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-medium text-muted-foreground">
              {search ? 'No templates found.' : 'No public templates yet.'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Be the first — publish a form and set it to Public.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/forms/new">Create a Form</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((form) => {
              const isBusyUse = busy?.id === form.id && busy.mode === 'use'
              const isBusyEdit = busy?.id === form.id && busy.mode === 'edit'
              const anyBusy = busy !== null

              return (
                <Card key={form.id} className="flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-semibold leading-snug line-clamp-2 flex-1">
                        {form.title}
                      </CardTitle>
                      {form.allowCopy && (
                        <Badge variant="secondary" className="shrink-0 text-xs gap-1">
                          <Copy className="w-2.5 h-2.5" />
                          Editable
                        </Badge>
                      )}
                    </div>
                    {form.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {form.description}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="flex-1 pb-3">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {sectionCount(form)} section{sectionCount(form) !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {questionCount(form)} question{questionCount(form) !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {form._count.responses} use{form._count.responses !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      by <span className="font-medium">{authorName(form)}</span>
                      {' · '}{formatDate(form.updatedAt)}
                    </p>
                  </CardContent>

                  <CardFooter className="flex gap-2 pt-0 flex-wrap">
                    {/* Use Form — copies silently, responses go to YOUR account */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={anyBusy}
                          onClick={() => handleUse(form)}
                        >
                          {isBusyUse ? (
                            <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Setting up…</>
                          ) : (
                            <><Link2 className="w-3.5 h-3.5 mr-1.5" />Use Form</>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[200px] text-xs">
                        Creates a personal copy and opens your share link. Responses go to your dashboard.
                      </TooltipContent>
                    </Tooltip>

                    {/* Copy & Edit — only when allowCopy = true */}
                    {form.allowCopy && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            disabled={anyBusy}
                            onClick={() => handleCopyEdit(form)}
                          >
                            {isBusyEdit ? (
                              <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Copying…</>
                            ) : (
                              <><Copy className="w-3.5 h-3.5 mr-1.5" />Copy &amp; Edit</>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[200px] text-xs">
                          Copies this template to your account as a draft so you can edit questions and settings.
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
