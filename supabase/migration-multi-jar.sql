-- Multi-jar migration — run once in the Supabase SQL editor BEFORE deploying
-- the multi-jar build. Existing data lands in a default jar called "The Jar".

create table jars (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  emoji text not null default '🫙',
  created_at timestamptz not null default now()
);
alter table jars enable row level security;

-- Fixed uuid so it can double as a column DEFAULT (defaults must be literals).
insert into jars (id, name) values ('a0000000-0000-4000-8000-000000000001', 'The Jar');

-- NOT NULL + DEFAULT in one statement: Postgres backfills existing rows.
-- The DEFAULT also keeps the OLD deployed code's inserts working until the
-- new build goes live — and is harmless forever after, since the new code
-- always writes jar_id explicitly.
alter table purchases add column jar_id uuid not null
  default 'a0000000-0000-4000-8000-000000000001' references jars(id) on delete cascade;
alter table seshes add column jar_id uuid not null
  default 'a0000000-0000-4000-8000-000000000001' references jars(id) on delete cascade;
alter table sales add column jar_id uuid not null
  default 'a0000000-0000-4000-8000-000000000001' references jars(id) on delete cascade;
