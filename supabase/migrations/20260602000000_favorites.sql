-- ============================================================
-- TABELA: favorites  (jogos favoritados; single-user/admin)
-- ============================================================
create table if not exists public.favorites (
  id         uuid    primary key default gen_random_uuid(),
  match_id   bigint  not null,
  created_at timestamptz not null default now(),
  unique (match_id)
);

create index if not exists favorites_match_idx on public.favorites (match_id);

-- ============================================================
-- ROW LEVEL SECURITY  (mesmo molde das outras tabelas)
-- ============================================================
alter table public.favorites enable row level security;

drop policy if exists "favorites_select" on public.favorites;
drop policy if exists "favorites_insert" on public.favorites;
drop policy if exists "favorites_delete" on public.favorites;

create policy "favorites_select" on public.favorites for select using (true);
create policy "favorites_insert" on public.favorites for insert with check (true);
create policy "favorites_delete" on public.favorites for delete using (true);
