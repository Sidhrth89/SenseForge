create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  plan text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  description text,
  brand_tone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  mode text not null check (mode in ('think', 'create', 'build', 'agents')),
  title text not null,
  input text not null,
  current_version_id uuid,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prompt_versions (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  version integer not null,
  input text not null,
  output jsonb not null,
  created_at timestamptz not null default now(),
  unique (prompt_id, version)
);

alter table public.prompts
  add constraint prompts_current_version_id_fkey
  foreign key (current_version_id) references public.prompt_versions(id)
  deferrable initially deferred;

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.users(id) on delete set null,
  mode text not null check (mode in ('think', 'create', 'build', 'agents')),
  title text not null,
  description text not null,
  prompt text not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  blocks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  workflow_id uuid references public.workflows(id) on delete set null,
  status text not null check (status in ('queued', 'running', 'succeeded', 'failed')),
  input text not null,
  output jsonb,
  logs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.provider_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  provider text not null check (provider in ('openai', 'gemini', 'anthropic', 'openrouter')),
  enabled boolean not null default true,
  preferred_model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  prompt_id uuid references public.prompts(id) on delete cascade,
  template_id uuid references public.templates(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (prompt_id is not null or template_id is not null)
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  provider text not null,
  model text not null,
  mode text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cost_usd numeric(12, 6),
  source text not null default 'web',
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists prompts_user_id_idx on public.prompts(user_id);
create index if not exists prompts_project_id_idx on public.prompts(project_id);
create index if not exists prompt_versions_prompt_id_idx on public.prompt_versions(prompt_id);
create index if not exists workflows_user_id_idx on public.workflows(user_id);
create index if not exists agent_runs_user_id_idx on public.agent_runs(user_id);
create index if not exists usage_events_user_created_idx on public.usage_events(user_id, created_at desc);

alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.prompts enable row level security;
alter table public.prompt_versions enable row level security;
alter table public.templates enable row level security;
alter table public.workflows enable row level security;
alter table public.agent_runs enable row level security;
alter table public.provider_configs enable row level security;
alter table public.favorites enable row level security;
alter table public.usage_events enable row level security;
alter table public.subscriptions enable row level security;

create policy "users can read themselves" on public.users for select using (auth.uid() = id);
create policy "users can update themselves" on public.users for update using (auth.uid() = id);

create policy "users own projects" on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own prompts" on public.prompts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own prompt versions" on public.prompt_versions for all
  using (exists (select 1 from public.prompts p where p.id = prompt_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.prompts p where p.id = prompt_id and p.user_id = auth.uid()));
create policy "users read public or own templates" on public.templates for select using (is_public or owner_id = auth.uid());
create policy "users own templates" on public.templates for insert with check (owner_id = auth.uid());
create policy "users update own templates" on public.templates for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "users own workflows" on public.workflows for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own agent runs" on public.agent_runs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own provider configs" on public.provider_configs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own favorites" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users read usage" on public.usage_events for select using (auth.uid() = user_id);
create policy "users read subscriptions" on public.subscriptions for select using (auth.uid() = user_id);
