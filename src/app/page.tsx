import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  ClipboardList, ArrowRight, Shield, BarChart3,
  FileText, Link2, Users, CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default async function LandingPage() {
  const session = await auth()
  if (session?.user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Nav */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm tracking-tight">Accord</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <Badge variant="secondary" className="mb-5 text-xs font-medium">
            Structured Compatibility Evaluation
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
            Before you say yes,<br className="hidden sm:block" />
            ask the right questions.
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Build weighted compatibility questionnaires for serious relationship
            conversations — covering values, finances, family, and lifestyle.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button size="lg" asChild>
              <Link href="/register">
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </section>

        <Separator />

        {/* How it works */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight mb-2">How it works</h2>
            <p className="text-muted-foreground text-sm">Four steps from blank form to compatibility score</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: '1',
                icon: FileText,
                title: 'Build your form',
                desc: 'Create sections for values, finances, family, lifestyle and more. Assign weight to each question.',
              },
              {
                step: '2',
                icon: Link2,
                title: 'Share the link',
                desc: 'Publish and send a unique link to your partner. No account required on their end.',
              },
              {
                step: '3',
                icon: Users,
                title: 'They respond',
                desc: 'Your partner fills out the questionnaire honestly at their own pace.',
              },
              {
                step: '4',
                icon: BarChart3,
                title: 'See the results',
                desc: 'Get a weighted compatibility score and a detailed mismatch breakdown instantly.',
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative rounded-lg border bg-card p-5 text-card-foreground">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Step {step}
                  </span>
                </div>
                <h3 className="font-semibold text-sm mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Features */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-3">
                Everything you need for the conversation
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Accord is a structured evaluation tool — not a dating app or matchmaking platform.
                It gives you a clear, documented picture of where you align and where you differ.
              </p>
              <ul className="space-y-3">
                {[
                  'Drag-and-drop form builder with 5 question types',
                  'Weight-based scoring — critical topics count more',
                  'Detailed mismatch breakdown by section',
                  'Clean printable compatibility report',
                  'Community templates to get started fast',
                  'Public / private visibility control per form',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Shield, label: 'Weight-based scoring' },
                { icon: BarChart3, label: 'Mismatch breakdown' },
                { icon: FileText, label: 'Printable report' },
                { icon: Users, label: 'Community templates' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="rounded-lg border bg-muted/30 p-5 flex flex-col items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-md bg-background border flex items-center justify-center">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium leading-snug">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        {/* Categories */}
        <section className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Every dimension covered</h2>
          <p className="text-muted-foreground text-sm mb-7">Pre-built categories to structure your questionnaire</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'Personal Background', 'Personality & Values', 'Finance & Career',
              'Family & Living', 'Children & Parenting', 'Legal',
              'Lifestyle', 'Intelligence & Reasoning', 'Custom Sections',
            ].map((cat) => (
              <Badge key={cat} variant="outline" className="text-xs px-3 py-1">
                {cat}
              </Badge>
            ))}
          </div>
        </section>

        <Separator />

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Clarity before commitment.</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            Free to use. Build your first compatibility questionnaire in minutes.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">
              Create Free Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center">
              <ClipboardList className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-medium text-foreground">Accord</span>
          </div>
          <span>A structured tool for serious conversations.</span>
        </div>
      </footer>
    </div>
  )
}
