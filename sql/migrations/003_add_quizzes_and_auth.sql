-- sql/migrations/003_add_quizzes_and_auth.sql

-- 1. Create Saved Items table for Bookmarking feature
create table if not exists saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id text not null, -- Clerk user_id
  item_type text check (item_type in ('experience', 'resource')) not null,
  item_id uuid not null, -- References experiences.id or resources.id
  created_at timestamptz default now()
);

create index if not exists idx_saved_items_user on saved_items(user_id);

-- 2. Create Quiz Scores table for the scoreboard
create table if not exists quiz_scores (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  user_id text not null, -- Clerk user_id
  user_name text not null, -- Display name for the scoreboard
  score int not null,
  total int not null,
  created_at timestamptz default now()
);

create index if not exists idx_quiz_scores_topic on quiz_scores(topic);

alter table saved_items enable row level security;
alter table quiz_scores enable row level security;
