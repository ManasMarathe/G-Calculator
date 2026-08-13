-- G-Tracker schema — run this once in the Supabase SQL editor.

create table members (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  emoji text not null default '🌿',
  created_at timestamptz not null default now()
);

create table purchases (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id),
  grams numeric(8,2) not null check (grams > 0),
  total_cost numeric(10,2) not null check (total_cost > 0),
  note text,
  created_at timestamptz not null default now()
);

create table seshes (
  id uuid primary key default gen_random_uuid(),
  start_grams numeric(8,2) not null check (start_grams >= 0),
  end_grams numeric(8,2) not null check (end_grams >= 0),
  grams_smoked numeric(8,2) generated always as (start_grams - end_grams) stored,
  cost_per_gram numeric(10,2) not null, -- snapshot of the weighted avg at sesh time
  note text,
  created_at timestamptz not null default now(),
  check (end_grams <= start_grams)
);

create table sesh_participants (
  sesh_id uuid not null references seshes(id) on delete cascade,
  member_id uuid not null references members(id),
  primary key (sesh_id, member_id)
);

-- Flips: grams leave the jar for cash instead of smoke. The seller holds the
-- money (they're debited the full price); the profit above the jar's cost is
-- split equally between the picked beneficiaries.
create table sales (
  id uuid primary key default gen_random_uuid(),
  -- Constraint named explicitly: queries.ts uses it as a PostgREST embed hint
  -- to disambiguate from the m2m path through sale_beneficiaries.
  sold_by uuid not null constraint sales_sold_by_fkey references members(id),
  grams numeric(8,2) not null check (grams > 0),
  total_price numeric(10,2) not null check (total_price > 0),
  cost_per_gram numeric(10,2) not null, -- snapshot of the weighted avg at sale time
  note text,
  created_at timestamptz not null default now()
);

create table sale_beneficiaries (
  sale_id uuid not null references sales(id) on delete cascade,
  member_id uuid not null references members(id),
  primary key (sale_id, member_id)
);

-- RLS on with zero policies: the anon key can't touch anything.
-- The app talks to the DB server-side with the service-role key (bypasses RLS).
alter table members enable row level security;
alter table purchases enable row level security;
alter table seshes enable row level security;
alter table sesh_participants enable row level security;
alter table sales enable row level security;
alter table sale_beneficiaries enable row level security;
