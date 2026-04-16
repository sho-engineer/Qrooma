-- Qrooma MVP Initial Schema
-- Apply via: Supabase Dashboard > SQL Editor, or `npx supabase db push`

create extension if not exists "uuid-ossp";

-- ─── encrypted_api_keys ──────────────────────────────────────────────────────
create table public.encrypted_api_keys (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  provider      text not null check (provider in ('openai', 'anthropic', 'google')),
  encrypted_key text not null,
  created_at    timestamptz default now(),
  unique(user_id, provider)
);

-- ─── rooms ───────────────────────────────────────────────────────────────────
create table public.rooms (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  created_at timestamptz default now()
);

-- ─── room_settings ───────────────────────────────────────────────────────────
create table public.room_settings (
  room_id                  uuid primary key references public.rooms(id) on delete cascade,
  mode                     text not null default 'structured_debate'
                             check (mode in ('structured_debate', 'free_talk')),
  side_a_provider          text not null default 'openai'
                             check (side_a_provider in ('openai', 'anthropic', 'google')),
  side_a_model             text not null default 'gpt-4o',
  side_b_provider          text not null default 'anthropic'
                             check (side_b_provider in ('openai', 'anthropic', 'google')),
  side_b_model             text not null default 'claude-sonnet-4-6',
  side_c_provider          text not null default 'google'
                             check (side_c_provider in ('openai', 'anthropic', 'google')),
  side_c_model             text not null default 'gemini-1.5-pro',
  auto_run_on_user_message boolean not null default true
);

-- ─── messages ────────────────────────────────────────────────────────────────
-- Note: run_id FK is added after runs table creation (circular FK workaround)
create table public.messages (
  id         uuid primary key default uuid_generate_v4(),
  room_id    uuid not null references public.rooms(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete set null,
  role       text not null check (role in ('user', 'ai')),
  side       text check (side in ('a', 'b', 'c', 'judge')),
  content    text not null,
  run_id     uuid,
  created_at timestamptz default now()
);

-- ─── runs ────────────────────────────────────────────────────────────────────
create table public.runs (
  id                 uuid primary key default uuid_generate_v4(),
  room_id            uuid not null references public.rooms(id) on delete cascade,
  user_id            uuid not null references auth.users(id) on delete cascade,
  status             text not null default 'queued'
                       check (status in ('queued', 'running', 'done', 'failed')),
  mode               text not null check (mode in ('structured_debate', 'free_talk')),
  trigger_message_id uuid references public.messages(id) on delete set null,
  trigger_run_id     text,
  error_message      text,
  conclusion         jsonb,
  created_at         timestamptz default now()
);

-- Add FK from messages to runs now that runs table exists
alter table public.messages
  add constraint messages_run_id_fkey
  foreign key (run_id) references public.runs(id) on delete set null;

-- ─── run_steps ───────────────────────────────────────────────────────────────
create table public.run_steps (
  id         uuid primary key default uuid_generate_v4(),
  run_id     uuid not null references public.runs(id) on delete cascade,
  step_type  text not null,
  side       text check (side in ('a', 'b', 'c', 'judge')),
  content    text not null,
  metadata   jsonb default '{}',
  created_at timestamptz default now()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
create index on public.rooms(user_id);
create index on public.messages(room_id, created_at);
create index on public.messages(run_id);
create index on public.runs(room_id);
create index on public.runs(user_id);
create index on public.run_steps(run_id, created_at);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.encrypted_api_keys enable row level security;
alter table public.rooms               enable row level security;
alter table public.room_settings       enable row level security;
alter table public.messages            enable row level security;
alter table public.runs                enable row level security;
alter table public.run_steps           enable row level security;

-- encrypted_api_keys: users can only manage their own keys
create policy "users manage own api keys"
  on public.encrypted_api_keys
  for all
  using (auth.uid() = user_id);

-- rooms: users can only manage their own rooms
create policy "users manage own rooms"
  on public.rooms
  for all
  using (auth.uid() = user_id);

-- room_settings: readable/writable by room owner
create policy "room owner manages settings"
  on public.room_settings
  for all
  using (
    exists (
      select 1 from public.rooms r
      where r.id = room_settings.room_id
        and r.user_id = auth.uid()
    )
  );

-- messages: readable/writable by room owner
create policy "room owner manages messages"
  on public.messages
  for all
  using (
    exists (
      select 1 from public.rooms r
      where r.id = messages.room_id
        and r.user_id = auth.uid()
    )
  );

-- runs: users manage their own runs
create policy "users manage own runs"
  on public.runs
  for all
  using (auth.uid() = user_id);

-- run_steps: readable by run owner
create policy "users read own run steps"
  on public.run_steps
  for all
  using (
    exists (
      select 1 from public.runs r
      where r.id = run_steps.run_id
        and r.user_id = auth.uid()
    )
  );

-- Note: Trigger.dev worker uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
-- This is intentional - the background worker needs to write AI results without
-- being bound to user session context.
