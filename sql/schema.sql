-- Placement Resource Hub — Supabase / Postgres schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`)
-- against a fresh project before starting the app.

create extension if not exists pgcrypto;

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  industry text,
  created_at timestamptz default now()
);

create table if not exists experiences (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  role text not null,
  experience_level text check (experience_level in ('intern','fresher','experienced')) default 'fresher',
  difficulty text check (difficulty in ('easy','medium','hard')) default 'medium',
  outcome text check (outcome in ('selected','rejected','pending')) default 'pending',
  rounds text not null,          -- structured free text: "Round 1: OA ... Round 2: Tech ..."
  content text not null,         -- the full write-up
  tags text[] default '{}',
  author_name text,
  status text check (status in ('open','archived')) default 'open',  -- resolve/close equivalent
  ai_summary text,               -- filled by the Gemini bonus feature (JSON string: {summary, tags})
  helpful_count integer not null default 0,  -- anonymous "this helped me" counter
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  title text not null,
  url text not null,
  resource_type text check (resource_type in ('article','video','pdf','sheet','note')) default 'article',
  tags text[] default '{}',
  status text check (status in ('open','archived')) default 'open',
  created_at timestamptz default now()
);

create index if not exists idx_experiences_company on experiences(company_id);
create index if not exists idx_experiences_tags on experiences using gin(tags);
create index if not exists idx_experiences_status on experiences(status);
create index if not exists idx_resources_company on resources(company_id);
create index if not exists idx_resources_tags on resources using gin(tags);
create index if not exists idx_resources_status on resources(status);

-- Atomic increment for the "helpful" counter (POST /api/experiences/[id]/helpful)
-- so concurrent clicks can't race each other into a lost update.
create or replace function increment_helpful_count(experience_id uuid)
returns integer as $$
  update experiences
  set helpful_count = helpful_count + 1
  where id = experience_id
  returning helpful_count;
$$ language sql volatile;

-- Row Level Security: the app talks to Postgres exclusively through the
-- Next.js server (Route Handlers + Server Components) using the
-- SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS entirely. RLS is enabled
-- here anyway as defense-in-depth so the anon/public key (if ever exposed
-- to the browser) grants no direct table access.
alter table companies enable row level security;
alter table experiences enable row level security;
alter table resources enable row level security;
