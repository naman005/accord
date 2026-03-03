# Accord — Compatibility Questionnaire Builder

A structured evaluation tool for serious marriage and relationship discussions. Build weighted questionnaires, share them with a partner, and get an automatic compatibility score with a detailed mismatch breakdown.

> **Not** a dating app. Not a matrimony platform. A deliberate, form-based tool for honest conversations before commitment.

---

## Features

- **Form Builder** — drag-and-drop sections and questions, five question types (text, yes/no, select, number, rating), per-question weight (1–10) and ideal answer
- **Publish & Share** — one-click publish generates a unique link; the respondent needs no account
- **Compatibility Engine** — server-side weight-based scoring, detailed per-question match/mismatch breakdown
- **Printable Report** — clean report with score card, section-by-section breakdown, print-ready layout
- **Community Templates** — make any published form public; others can use it directly or copy-and-edit it into their own account
- **Visibility Control** — toggle Public/Private per form; separately control whether copying is allowed
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
│   │   ├── layout.tsx               # Auth guard + DashboardNav
│   │   ├── dashboard/page.tsx       # My Forms list
│   │   ├── templates/page.tsx       # Community Templates gallery
│   │   └── forms/
│   │       ├── new/page.tsx         # Create form
│   │       └── [formId]/
│   │           ├── edit/page.tsx    # Builder
│   │           └── responses/
│   │               ├── page.tsx     # All responses for a form
│   │               └── [responseId]/page.tsx   # Single report
│   ├── f/
│   │   └── [token]/page.tsx         # Public response form (no auth)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   └── register/route.ts
│   │   ├── forms/
│   │   │   ├── route.ts             # GET list, POST create
│   │   │   └── [formId]/
│   │   │       ├── route.ts         # GET, PATCH, DELETE
│   │   │       ├── publish/route.ts
│   │   │       ├── visibility/route.ts   # PATCH visibility + allowCopy
│   │   │       ├── copy/route.ts         # POST copy template
│   │   │       └── responses/route.ts    # GET responses
│   │   ├── public/
│   │   │   └── [token]/
│   │   │       ├── route.ts         # GET form by token (public)
│   │   │       └── submit/route.ts  # POST response submission
│   │   └── templates/
│   │       └── route.ts             # GET public gallery
│   ├── layout.tsx
│   └── page.tsx                     # Landing page → redirects to dashboard if authed
├── components/
│   ├── builder/
│   │   ├── FormBuilder.tsx          # State orchestrator
│   │   ├── FormBuilderClient.tsx    # API wiring + visibility dialog
│   │   ├── SectionCard.tsx          # Draggable section
│   │   ├── QuestionCard.tsx         # Draggable question row
│   │   ├── QuestionEditor.tsx       # Add/edit question dialog
│   │   └── AddSectionDialog.tsx     # Add section dialog
│   ├── dashboard/
│   │   └── FormCard.tsx             # Form card with delete confirm
│   ├── report/
│   │   └── CompatibilityReport.tsx  # Score card + breakdown + print
│   ├── response/
│   │   ├── PublicForm.tsx           # Respondent-facing form
│   │   └── QuestionRenderer.tsx     # Renders each question type
│   └── shared/
│       └── DashboardNav.tsx         # Sticky nav with user menu + logout
├── lib/
│   ├── prisma.ts                    # Prisma singleton
│   ├── auth.ts                      # NextAuth config
│   ├── scoring.ts                   # Compatibility engine
│   ├── validations.ts               # Zod schemas
│   └── utils.ts                     # cn(), formatDate, compatibilityLabel, getShareUrl
└── types/
    └── index.ts                     # All shared TS types
```

---

## Database Schema

```
User
 └── Form (many)          status: DRAFT|PUBLISHED
                          visibility: PRIVATE|PUBLIC
                          allowCopy: Boolean
                          copiedFromId: Form? (self-relation)
      └── Response (many) answers: Json
                          score: Float
                          breakdown: Json (ScoredQuestion[])
```

Form sections and questions are stored as a `Json` column (`Section[]`). This avoids schema migrations when question types or fields evolve, at the cost of not being able to SQL-query individual questions.

---

## Scoring Algorithm

Located in `src/lib/scoring.ts`.

1. Iterate every question across all sections that has an `idealAnswer` set by the creator
2. Compare the respondent's answer (normalized: trimmed + lowercased) to the ideal answer
3. Award `weight` points for a match, `0` for a mismatch
4. `score = (earnedPoints / totalPoints) * 100`

Questions without an `idealAnswer` are informational only — they appear in the report but don't affect the score.

---

## Visibility System

| State | Visible in gallery | Respondents can fill | Others can copy |
|---|---|---|---|
| DRAFT + PRIVATE | ✗ | ✗ | ✗ |
| PUBLISHED + PRIVATE | ✗ | ✓ (via direct link) | ✗ |
| PUBLISHED + PUBLIC | ✓ | ✓ | depends on `allowCopy` |

- A form can only be made PUBLIC after it is PUBLISHED
- `allowCopy` only applies when the form is PUBLIC
- Copying creates a new DRAFT form in the copier's account with status PRIVATE, linked to the source via `copiedFromId`

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or [Neon](https://neon.tech) / [Supabase](https://supabase.com))

### 1. Clone & install

```bash
git clone <repo-url>
cd accord
npm install
```

### 2. Environment variables

Create `.env.local`:

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

### 4. shadcn/ui (first time only)

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input label card badge dialog select \
  textarea toast progress separator dropdown-menu alert form skeleton \
  tabs switch alert-dialog
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel + Neon)

1. Create a Neon project → copy the `DATABASE_URL`
2. Push to GitHub, connect to Vercel
3. Add all env vars in Vercel dashboard
4. Add migration to build script:

```json
// package.json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

---

## Roadmap (Post-MVP)

- [ ] Email notification to creator when a response arrives
- [ ] Creator fills own form → side-by-side comparison view
- [ ] Export report to PDF (`@react-pdf/renderer`)
- [ ] Section-level compatibility scores in report
- [ ] Response expiry / one-use links
- [ ] Fuzzy matching for open-text answers
- [ ] Template rating / upvote system in gallery

---

## License

MIT
