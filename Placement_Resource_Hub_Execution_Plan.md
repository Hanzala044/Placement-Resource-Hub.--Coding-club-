# Placement Resource Hub — 1-Day Execution Plan
**AITM Coding Club Screening — Track 2**

Stack: **Next.js** (App Router, TypeScript) — frontend *and* backend in one app · Supabase/Postgres (DB) · Clerk (bonus auth) · Gemini AI (bonus assistant) · **Vercel — single deployment**

---

## 1. Scope Lock (read this before coding)

Core loop the assessment requires: **create → view → update → resolve/delete**, persisted, searchable/filterable, responsive, validated. For this track that maps to two entities:

- **Interview Experiences** — the primary record (company, role, rounds, questions, outcome)
- **Resources** — supporting material (prep links, notes, PDFs) tagged to a company/role

Don't scope-creep into a full LMS. One day means: 2 entities, clean CRUD, one good search/filter bar, one AI bonus feature, deployed. Cut anything else.

**Single-deployment note (replaces the old FastAPI/Render split):** Next.js Route Handlers (`app/api/**/route.ts`) run as Vercel serverless functions inside the *same* project as your frontend. One `git push` → one Vercel build → one URL. No second service to provision, no CORS config, no keeping two `.env` files in sync. This is strictly less infrastructure than the original plan, so it doesn't cost you any of the 1-day budget — it saves you the hour that was previously "deploy backend + frontend."

---

## 2. Data Model (Supabase / Postgres) — unchanged

```sql
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  industry text,
  created_at timestamptz default now()
);

create table experiences (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  role text not null,
  experience_level text check (experience_level in ('intern','fresher','experienced')) default 'fresher',
  difficulty text check (difficulty in ('easy','medium','hard')) default 'medium',
  outcome text check (outcome in ('selected','rejected','pending')) default 'pending',
  rounds text not null,          -- structured free text: "Round 1: OA ... Round 2: Tech ..."
  content text not null,          -- the full write-up
  tags text[] default '{}',
  author_name text,
  status text check (status in ('open','archived')) default 'open',  -- resolve/close equivalent
  ai_summary text,                -- filled by Gemini bonus feature
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table resources (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  title text not null,
  url text not null,
  resource_type text check (resource_type in ('article','video','pdf','sheet','note')) default 'article',
  tags text[] default '{}',
  status text check (status in ('open','archived')) default 'open',
  created_at timestamptz default now()
);

create index idx_experiences_company on experiences(company_id);
create index idx_experiences_tags on experiences using gin(tags);
create index idx_resources_tags on resources using gin(tags);
```

`status` gives you the "resolve/close" lifecycle the rubric wants — archived entries stay in the DB (audit trail) but drop out of default listings.

---

## 3. Backend — Next.js Route Handlers

Same endpoint surface as before, just served from the app itself instead of a separate FastAPI process. Route Handlers use the Supabase **service-role** client server-side (never exposed to the browser).

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/companies` | list companies (for dropdowns + company pages) |
| POST | `/api/companies` | create if not exists (upsert by name) |
| GET | `/api/experiences?company=&tag=&difficulty=&search=&status=open` | list + filter |
| POST | `/api/experiences` | create (validate: role, rounds, content non-empty) |
| GET | `/api/experiences/[id]` | detail |
| PATCH | `/api/experiences/[id]` | edit fields |
| PATCH | `/api/experiences/[id]/archive` | resolve/close |
| DELETE | `/api/experiences/[id]` | hard delete |
| GET | `/api/resources?company=&tag=&type=&search=` | list + filter |
| POST | `/api/resources` | create |
| PATCH | `/api/resources/[id]` | edit |
| DELETE | `/api/resources/[id]` | delete |
| POST | `/api/experiences/[id]/ai-summary` | Gemini bonus: generates a 2–3 line TL;DR + auto-suggested tags |

**Project layout:**
```
app/
  api/
    companies/route.ts
    experiences/route.ts
    experiences/[id]/route.ts
    experiences/[id]/archive/route.ts
    experiences/[id]/ai-summary/route.ts
    resources/route.ts
    resources/[id]/route.ts
  page.tsx                    # Dashboard: companies grid, counts, global search
  company/[id]/page.tsx        # experiences + resources for one company
  experience/[id]/page.tsx
  submit-experience/page.tsx
  submit-resource/page.tsx
  layout.tsx
components/
  FilterBar.tsx
  ExperienceCard.tsx
  ResourceCard.tsx
  Navbar.tsx
lib/
  supabase.ts                  # createServerClient (service role) + browser client
  gemini.ts                     # Gemini call helper
  validators.ts                 # zod schemas, shared by forms and route handlers
middleware.ts                   # Clerk: gate mutation routes only (bonus)
.env.local                      # you fill this in yourself — see below
```

**Validation:** use [zod](https://zod.dev) schemas in `lib/validators.ts`, imported by both the form component (client-side check) and the route handler (server-side check, the one that actually matters). This is the direct replacement for the old Pydantic models — same "no empty submissions" guarantee, one schema instead of two.

Env vars you'll set yourself (names only, no values here):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only, used in route handlers, never NEXT_PUBLIC_
GEMINI_API_KEY=                 # server-only
CLERK_SECRET_KEY=               # if you do the auth bonus
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
```
Set these in **both** `.env.local` (for `next dev`) **and** the Vercel dashboard → Settings → Environment Variables (for Production) — the two are not shared automatically, and this is the single most common "works on localhost, 500s in prod" trap with this stack.

---

## 4. Frontend — same Next.js app, no separate client project

```
app/                # see layout above — pages are React Server Components by default
components/
  FilterBar.tsx       # tag/difficulty/type filters
  ExperienceCard.tsx
  ResourceCard.tsx
  Navbar.tsx
lib/
  supabase.ts
```

Two valid ways to wire pages to data — pick per-page, don't overthink it:
- **Read paths** (Dashboard, CompanyPage, ExperienceDetail): fetch directly from Supabase inside the Server Component (`await supabase.from(...)`) — no round trip through your own API needed, Next.js's biggest win over the old two-app setup.
- **Write paths** (submit forms, archive, delete, AI summary): go through the `/api/*` Route Handlers listed above. Keeping these as real HTTP endpoints (rather than Server Actions) means you still have an explicit "API" you can point to and explain in the interview, matching the rubric's "real-world backend work" line.

Filtering stays server-side (query params on `/api/experiences`, `/api/resources`, or server-side Supabase queries on the read pages) — not client-side `.filter()` — for the same rubric reason as before.

---

## 5. Feature Checklist — Rubric Mapping

| Requirement | How it's satisfied |
|---|---|
| Create/view/update/resolve-delete | Experiences + Resources full CRUD via Route Handlers, archive as resolve |
| Data persists | Supabase Postgres |
| Search/filter | Company, tag, difficulty/type, free-text search param |
| Responsive | Tailwind, test at 375px width before submitting |
| Input validation | zod schema shared by form + Route Handler |
| Bonus: auth | Clerk `middleware.ts` gates mutation routes only; GET/read pages stay public |
| Bonus: AI | Gemini auto-summary + auto-tag suggestion on experience submit |
| Single deployment | One Next.js app, one Vercel project, no CORS |

---

## 6. Hour-by-Hour Timeline (one day, ~12 working hours)

Compressing to one day means **your commit history is your only evidence of iterative work** — the rubric explicitly penalizes "single commit with entire project dumped at once." Commit at every checkpoint below, even mid-feature. Because Vercel auto-deploys every push to `main` (and gives preview URLs for other branches), there's no separate "deploy" hour anymore — deployment is continuous from hour 0.

| Hours | Work | Commit |
|---|---|---|
| 0–1 | `create-next-app` (TS, App Router, Tailwind), Supabase project + schema (Section 2), `vercel link`, env vars added to `.env.local` **and** Vercel dashboard, push → first auto-deploy | `chore: project scaffold + db schema` |
| 1–3 | Experiences CRUD Route Handlers + zod schemas | `feat: experiences CRUD API` |
| 3–4 | Resources CRUD Route Handlers + filter query params | `feat: resources CRUD + filtering` |
| 4–6 | Dashboard + CompanyPage + Experience/ResourceCard, server components wired to real data | `feat: dashboard and company pages` |
| 6–7 | SubmitExperience + SubmitResource forms with validation | `feat: submission forms with validation` |
| 7–8 | FilterBar wired end-to-end (search, tag, difficulty/type) | `feat: search and filter UI` |
| 8–9 | Gemini AI summary Route Handler + "Generate summary" button | `feat: AI-assisted summary (Gemini)` |
| 9–10 | Clerk middleware on mutation routes (if time) + responsive pass + empty/loading/error states | `feat: auth guard + responsive fixes` |
| 10–11 | Smoke test the *live* Vercel URL end-to-end, fix anything that's fine locally but broken in prod (usually a missing prod env var) | `fix: production smoke-test fixes` |
| 11–12 | README (Section 7), final walkthrough | `docs: README + final fixes` |

That's still comfortably 10 commits with real content deltas — clears the "minimum 5 meaningful commits" bar, and it's one deploy pipeline the whole day instead of two.

Skip Clerk entirely if hour 9 arrives and core CRUD/search isn't rock-solid — it's a bonus, and a broken core flow is a disqualifying red flag while missing auth isn't.

---

## 7. Gemini AI Integration (bonus feature, keep it small)

`app/api/experiences/[id]/ai-summary/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data: exp, error } = await supabaseAdmin
    .from("experiences")
    .select("content")
    .eq("id", params.id)
    .single();

  if (error || !exp) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const prompt =
    "Summarize this interview experience in 2-3 sentences, " +
    "then suggest 3-5 short topic tags as a comma-separated list.\n\n" +
    exp.content;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  const raw = response.text ?? "";

  await supabaseAdmin
    .from("experiences")
    .update({ ai_summary: raw })
    .eq("id", params.id);

  return NextResponse.json({ raw });
}
```

Parse `raw` into `summary` + `tags` (simple string split is fine for a 1-day build) on the client, show it on the experience detail page with a "Regenerate" button that re-POSTs the same route. That's enough to demonstrate the AI Assistant line in your stack without eating your remaining hours.

---

## 8. README Template

```markdown
# Placement Resource Hub

## Problem
[2-3 sentences — scattered placement info across seniors' notes/WhatsApp, inaccessible to juniors]

## What I built
[Bullet the core features actually shipped]

## Tech stack
Next.js (App Router, TypeScript) · Supabase (Postgres) · Clerk (bonus) · Gemini AI (bonus) — single deployment on Vercel

## Setup
1. Clone repo
2. `npm install`
3. Copy `.env.example` → `.env.local`, fill in Supabase/Gemini/Clerk keys
4. `npm run dev`
5. Deploy: push to `main` (Vercel auto-deploys) or `vercel --prod`

## One challenge I hit
[Be specific and technical — e.g. Supabase RLS blocking anon writes from a Route Handler using the anon key instead of the service role key]

## One thing I'd improve with more time
[Be specific — e.g. proper tag taxonomy instead of free text, pagination, Clerk-gated edit ownership]

## Live links
- App (and API — same deployment): [vercel url]
- Repo: [github url]
```

Generic answers here are explicitly penalized in the rubric — write the actual bug you hit, not a placeholder.

---

## 9. Pre-Submit Red-Flag Check

- [ ] Live link loads and isn't showing a build error
- [ ] Create → view → update → archive/delete all work on the *deployed* app, not just localhost
- [ ] Vercel dashboard has **all** env vars set for the **Production** environment (not just `.env.local`) — this is the #1 "works locally, breaks live" failure with this stack
- [ ] At least 5 commits, spread across the build (not one dump)
- [ ] You can explain, out loud, what the `ai-summary` route does and why the query filters are structured the way they are
- [ ] Mobile width (375px) doesn't break the layout
- [ ] Empty submit is blocked (zod validation actually fires, server-side not just client-side)
- [ ] README has real, specific answers — not "Next.js because it's popular"
