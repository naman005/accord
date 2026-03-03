'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormBuilder } from './FormBuilder'
import { Section, FormVisibility } from '@/types'
import { getShareUrl } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Copy, ExternalLink, Globe, Lock, Settings } from 'lucide-react'

interface Props {
  formId: string
  initialTitle: string
  initialDescription: string
  initialSections: Section[]
  isPublished: boolean
  shareToken: string
  initialVisibility: FormVisibility
  initialAllowCopy: boolean
}

export function FormBuilderClient({
  formId,
  initialTitle,
  initialDescription,
  initialSections,
  isPublished: initialIsPublished,
  shareToken,
  initialVisibility,
  initialAllowCopy,
}: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPublished, setIsPublished] = useState(initialIsPublished)
  const [visibility, setVisibility] = useState<FormVisibility>(initialVisibility)
  const [allowCopy, setAllowCopy] = useState(initialAllowCopy)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)

  const handleSave = async (data: { title: string; description: string; sections: Section[] }) => {
    const res = await fetch(`/api/forms/${formId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const body = await res.json()
      throw new Error(body.error || 'Save failed')
    }
  }

  const handlePublish = async () => {
    const res = await fetch(`/api/forms/${formId}/publish`, { method: 'POST' })
    if (!res.ok) {
      const body = await res.json()
      throw new Error(body.error || 'Publish failed')
    }
    setIsPublished(true)
    router.refresh()
  }

  const handleSaveVisibility = async () => {
    setSettingsSaving(true)
    try {
      const res = await fetch(`/api/forms/${formId}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility, allowCopy }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Failed to update settings')
      setVisibility(body.visibility)
      setAllowCopy(body.allowCopy)
      toast({ title: 'Settings saved', description: 'Visibility settings updated.' })
      setSettingsOpen(false)
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setSettingsSaving(false)
    }
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(getShareUrl(shareToken))
    toast({ title: 'Link copied!', description: 'Share this with your partner.' })
  }

  const shareUrl = getShareUrl(shareToken)

  return (
    <div>
      {/* Top status/action banner */}
      <div className="border-b bg-muted/40 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={isPublished ? 'default' : 'secondary'} className="gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${isPublished ? 'bg-green-400' : 'bg-muted-foreground/60'}`} />
              {isPublished ? 'Published' : 'Draft'}
            </Badge>

            <Badge variant="outline" className="gap-1 text-xs font-normal">
              {visibility === 'PUBLIC' ? (
                <><Globe className="w-3 h-3" /> Public</>
              ) : (
                <><Lock className="w-3 h-3" /> Private</>
              )}
            </Badge>

            {isPublished && (
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate max-w-[200px] hidden lg:block"
              >
                {shareUrl}
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
              <Settings className="w-3.5 h-3.5 mr-1.5" />
              Visibility
            </Button>
            {isPublished && (
              <>
                <Button variant="outline" size="sm" onClick={copyShareLink}>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copy Link
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    Preview
                  </a>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <FormBuilder
        formId={formId}
        initialTitle={initialTitle}
        initialDescription={initialDescription}
        initialSections={initialSections}
        onSave={handleSave}
        onPublish={handlePublish}
        isPublished={isPublished}
      />

      {/* Visibility Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Visibility Settings</DialogTitle>
            <DialogDescription>
              Control who can see and copy this form template.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {!isPublished && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                Publish this form first before making it visible to others.
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Public Template
                </Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Show this form in the community templates gallery. Other users can discover and use it.
                </p>
              </div>
              <Switch
                checked={visibility === 'PUBLIC'}
                disabled={!isPublished}
                onCheckedChange={(v) => setVisibility(v ? 'PUBLIC' : 'PRIVATE')}
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Allow Copy &amp; Edit
                </Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Let other users copy this template to their own account to modify and use independently.
                  {visibility !== 'PUBLIC' && (
                    <span className="block text-amber-600 dark:text-amber-400 mt-1">
                      Only applies when the template is public.
                    </span>
                  )}
                </p>
              </div>
              <Switch
                checked={allowCopy}
                disabled={visibility !== 'PUBLIC'}
                onCheckedChange={setAllowCopy}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveVisibility} disabled={settingsSaving}>
              {settingsSaving ? 'Saving…' : 'Save Settings'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
