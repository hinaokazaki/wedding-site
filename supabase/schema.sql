-- Supabase の SQL Editor に貼り付けて実行してください

create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  side text not null check (side in ('groom', 'bride')),
  attend boolean not null,
  meal boolean,
  guest_count int not null default 1
);

create table public.guestbook (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  message text not null
);

alter table public.rsvps enable row level security;
alter table public.guestbook enable row level security;

-- 誰でも「送信」はできるが、RSVPの閲覧は不可(本人たちはSupabase管理画面で確認)
create policy "anon can insert rsvps"
  on public.rsvps for insert to anon with check (true);

-- ゲストブックは誰でも書き込み・閲覧OK
create policy "anon can insert guestbook"
  on public.guestbook for insert to anon with check (true);

create policy "anon can read guestbook"
  on public.guestbook for select to anon using (true);
