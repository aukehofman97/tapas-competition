-- Participants: one row per registered user (one tapa per person)
create table if not exists participants (
  name        text primary key,
  tapa_name   text not null,
  created_at  timestamptz default now()
);

-- Votes: one row per (voter, tapa) pair
create table if not exists votes (
  id            uuid default gen_random_uuid() primary key,
  tapa_creator  text not null references participants(name) on delete cascade,
  voter_name    text not null,
  taste         smallint not null check (taste between 0 and 10),
  presentation  smallint not null check (presentation between 0 and 10),
  originality   smallint not null check (originality between 0 and 10),
  texture       smallint not null check (texture between 0 and 10),
  authenticity  smallint not null check (authenticity between 0 and 10),
  created_at    timestamptz default now(),
  unique (tapa_creator, voter_name),
  check (tapa_creator != voter_name)
);

-- Enable RLS
alter table participants enable row level security;
alter table votes enable row level security;

-- Public policies (low-stakes social app, no auth)
create policy "public select participants" on participants for select using (true);
create policy "public insert participants" on participants for insert with check (true);
create policy "public delete participants" on participants for delete using (true);

create policy "public select votes" on votes for select using (true);
create policy "public insert votes" on votes for insert with check (true);
create policy "public update votes" on votes for update using (true);
create policy "public delete votes" on votes for delete using (true);

-- Realtime: enable for both tables
alter publication supabase_realtime add table participants;
alter publication supabase_realtime add table votes;
