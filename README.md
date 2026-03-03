# Accord — Compatibility Questionnaire Builder

A structured evaluation tool for serious marriage and relationship discussions. Build weighted questionnaires, share them with a partner, and get an automatic compatibility score with a detailed mismatch breakdown.

> **Not** a dating app. Not a matrimony platform. A deliberate, form-based tool for honest conversations before commitment.

---

## Features

- **Form Builder** — drag-and-drop sections and questions, five question types (text, yes/no, select, number, rating), per-question weight (1–10) and ideal answer
- **Publish & Share** — one-click publish generates a unique link; respondents need no account
- **Compatibility Engine** — server-side weight-based scoring with detailed per-question match/mismatch breakdown
- **Printable Report** — clean score card and section-by-section breakdown, print-ready layout
- **Community Templates** — make any published form public; others can use it directly (responses go to their own account) or copy-and-edit it into their own dashboard
- **Visibility Control** — toggle Public/Private per form; separately control whether copying is allowed
- **Response Ownership** — "Use Form" from the gallery auto-creates a private published copy under your account, so all responses go to you, not the original creator
- **Dashboard** — manage all forms, delete with confirmation, view all responses at a glance

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth v5 (JWT, credentials) |
| UI | shadcn/ui + TailwindCSS |
| Forms | React Hook Form + Zod |
| Drag & Drop | dnd-kit |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                          # Auth guard + DashboardNav
│   │   ├── dashboard/page.tsx                  # My Forms list
│   │   ├── templates/page.tsx                  # Community Templates gallery
│   │   └── forms/
│   │       ├── new/page.tsx                    # Create form
│   │       └── [formId]/
│   │           ├── edit/page.tsx               # Builder
│   │           └── responses/
│   │               ├── page.tsx                # All responses for a form
│   │               └── [responseId]/page.tsx   # Single compatibility report
│   ├── f/
│   │   └── [token]/page.tsx                    # Public response form (no auth required)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   └── register/route.ts
│   │   ├── forms/
│   │   │   ├── route.ts                        # GET list, POST create
│   │   │   └── [formId]/
│   │   │       ├── route.ts                    # GET, PATCH, DELETE
│   │   │       ├── publish/route.ts
│   │   │       ├── visibility/route.ts         # PATCH visibility + allowCopy
│   │   │       ├── copy/route.ts               # POST copy (mode: use | edit)
│   │   │       └── responses/route.ts          # GET responses
│   │   ├── public/
│   │   │   └── [token]/
│   │   │       ├── route.ts                    # GET form by share token (public)
│   │   │       └── submit/route.ts             # POST response submission
│   │   └── templates/
│   │       └── route.ts                        # GET public gallery (with search)
│   ├── layout.tsx
│   └── page.tsx                                # Landing page (redirects if authed)
├── components/
│   ├── builder/
│   │   ├── FormBuilder.tsx                     # State orchestrator
│   │   ├── FormBuilderClient.tsx               # API wiring + visibility dialog
│   │   ├── SectionCard.tsx                     # Draggable section
│   │   ├── QuestionCard.tsx                    # Draggable question row
│   │   ├── QuestionEditor.tsx                  # Add/edit question dialog
│   │   └── AddSectionDialog.tsx                # Add section dialog
│   ├── dashboard/
│   │   └── FormCard.tsx                        # Form card with delete confirm
│   ├── report/
│   │   └── CompatibilityReport.tsx             # Score card + breakdown + print
│   ├── response/
│   │   ├── PublicForm.tsx                      # Respondent-facing form
│   │   └── QuestionRenderer.tsx                # Renders each question type
│   └── shared/
│       └── DashboardNav.tsx                    # Sticky nav with user menu + logout
├── lib/
│   ├── prisma.ts                               # Prisma singleton
│   ├── auth.ts                                 # NextAuth config
│   ├── scoring.ts                              # Compatibility engine
│   ├── validations.ts                          # Zod schemas
│   └── utils.ts                               # cn(), formatDate, compatibilityLabel, getShareUrl
└── types/
    └── index.ts                                # All shared TypeScript types
```

---

## Database Schema

```
User
 └── Form (many)          status: DRAFT | PUBLISHED
                          visibility: PRIVATE | PUBLIC
                          allowCopy: Boolean
                          copiedFromId: Form? (self-relation for tracking copies)
      └── Response (many) answers: Json
                          score: Float
                          breakdown: Json  → ScoredQuestion[]
```

Form sections and questions are stored as a `Json` column (`Section[]`). This avoids schema migrations when question types or fields evolve, at the cost of not being able to SQL-query individual questions directly.

---

## Visibility & Copy System

| State | Appears in gallery | Respondents can fill | Others can copy |
|---|---|---|---|
| DRAFT + PRIVATE | ✗ | ✗ | ✗ |
| PUBLISHED + PRIVATE | ✗ | ✓ via direct link only | ✗ |
| PUBLISHED + PUBLIC | ✓ | ✓ | depends on `allowCopy` |

**Use Form** (gallery): Silently creates a private published copy under the viewer's account, then opens that copy's share link. Responses go to the viewer's dashboard — never the original creator's.

**Copy & Edit** (gallery): Only shown when `allowCopy = true`. Creates a DRAFT copy in the viewer's account and opens the builder. Requires `allowCopy` to be enabled by the original owner.

**Making private again**: Toggle visibility back to Private at any time from the builder's Visibility panel. Existing responses are unaffected.

---

## Scoring Algorithm

Located in `src/lib/scoring.ts`.

1. Iterate every question that has an `idealAnswer` set by the creator
2. Compare the respondent's answer (normalized: trimmed + lowercased) to the ideal
3. Award `weight` points for a match, `0` for a mismatch
4. `score = (earnedPoints / totalPoints) × 100`

Questions without an `idealAnswer` are informational — they appear in the report but don't affect the score. This lets creators include open-ended questions purely for conversation without penalizing mismatches.

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (local Docker, [Neon](https://neon.tech), or [Supabase](https://supabase.com))

### 1. Clone & install

```bash
git clone <repo-url>
cd accord
npm install
```

### 2. Environment variables

Create `.env.local` in the project root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/accord"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database setup

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. shadcn/ui components

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input label card badge dialog select \
  textarea toast progress separator dropdown-menu alert form skeleton \
  tabs switch alert-dialog tooltip
```

### 5. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel + Neon)

1. Create a [Neon](https://neon.tech) project → copy the `DATABASE_URL`
2. Push to GitHub and connect the repo to Vercel
3. Set all four env vars in the Vercel dashboard
4. Add the migration step to your build command:

```json
// package.json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

Vercel will run migrations automatically on each deploy.

---

## Roadmap

- [ ] Email notification to creator when a response is submitted
- [ ] Creator fills their own form → side-by-side comparison view
- [ ] Export report to PDF via `@react-pdf/renderer`
- [ ] Section-level compatibility sub-scores in the report
- [ ] Response expiry and one-use share links
- [ ] Fuzzy/semantic matching for open-text answers
- [ ] Template rating and upvote system in the gallery

---

## License

MIT
