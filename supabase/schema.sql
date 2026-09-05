-- Supabase の SQL Editor に貼り付けて実行してください

create table public.guestbook (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  message text not null
);

alter table public.guestbook enable row level security;

-- ゲストブックは誰でも書き込み・閲覧OK
create policy "anon can insert guestbook"
  on public.guestbook for insert to anon with check (true);

create policy "anon can read guestbook"
  on public.guestbook for select to anon using (true);
