-- Enable UUID extension
create extension if not exists "pgcrypto";

-- CANVASES
create table if not exists canvases (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default 'Il mio Business Model Canvas',
  edit_token  text unique not null,
  view_token  text unique not null,
  created_by  text not null,
  created_at  timestamptz default now()
);

-- NOTES
create table if not exists notes (
  id          uuid primary key default gen_random_uuid(),
  canvas_id   uuid references canvases(id) on delete cascade,
  section     text not null,
  content     text default '',
  color       text default 'nc-yellow',
  author      text not null,
  position    int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger notes_updated_at
  before update on notes
  for each row execute function update_updated_at();

-- RLS (Row Level Security) — public access via tokens
alter table canvases enable row level security;
alter table notes enable row level security;

-- Chiunque può leggere canvases e notes (la protezione è nei token)
create policy "public read canvases" on canvases for select using (true);
create policy "public insert canvases" on canvases for insert with check (true);
create policy "public update canvases" on canvases for update using (true);
create policy "public delete canvases" on canvases for delete using (true);

create policy "public read notes" on notes for select using (true);
create policy "public insert notes" on notes for insert with check (true);
create policy "public update notes" on notes for update using (true);
create policy "public delete notes" on notes for delete using (true);

-- Realtime
alter publication supabase_realtime add table notes;
alter publication supabase_realtime add table canvases;