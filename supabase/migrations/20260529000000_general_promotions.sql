-- ============================================================
-- TABELA: general_promotions  (promoções gerais, fora dos jogos)
-- ============================================================
create table if not exists public.general_promotions (
  id          uuid         primary key default uuid_generate_v4(),
  type        varchar(20)  not null references public.promo_types(id),
  title       varchar(200) not null,
  description text,
  rules       text,
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now()
);

create index if not exists idx_general_promotions_type    on public.general_promotions(type);
create index if not exists idx_general_promotions_created on public.general_promotions(created_at);

-- Atualiza updated_at automaticamente (reusa a função handle_updated_at)
drop trigger if exists general_promotions_updated_at on public.general_promotions;
create trigger general_promotions_updated_at
  before update on public.general_promotions
  for each row execute function public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.general_promotions enable row level security;

create policy "Public read general_promotions"   on public.general_promotions for select using (true);
create policy "Public insert general_promotions" on public.general_promotions for insert with check (true);
create policy "Public update general_promotions" on public.general_promotions for update using (true);
create policy "Public delete general_promotions" on public.general_promotions for delete using (true);
