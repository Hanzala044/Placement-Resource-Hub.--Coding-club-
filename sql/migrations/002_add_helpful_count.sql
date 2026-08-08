-- Run this if your database was created before helpful_count existed
-- (i.e. you already ran the original sql/schema.sql once). Safe to re-run.
alter table experiences add column if not exists helpful_count integer not null default 0;

create or replace function increment_helpful_count(experience_id uuid)
returns integer as $$
  update experiences
  set helpful_count = helpful_count + 1
  where id = experience_id
  returning helpful_count;
$$ language sql volatile;
