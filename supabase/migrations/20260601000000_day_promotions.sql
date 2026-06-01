-- ============================================================
-- TABELA: day_promotions  (promoções "do dia" — valem para todos
-- os jogos de uma data; máximo 2 ATIVAS por dia; também guarda
-- itens em stand by / sugestão)
-- ============================================================
create table if not exists public.day_promotions (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  type        text not null check (type in ('boost','mercado','promo')),
  title       text not null,
  description text default '',
  rules       text default '',
  state       text not null default 'active' check (state in ('active','standby','suggestion')),
  note        text default '',
  created_at  timestamptz not null default now()
);

create index if not exists day_promotions_date_idx on public.day_promotions (date);

-- Regra de negócio: no máximo 2 promoções ATIVAS por dia
create or replace function public.enforce_day_promo_limit()
returns trigger language plpgsql as $$
begin
  if NEW.state = 'active' then
    if (select count(*) from public.day_promotions
        where date = NEW.date and state = 'active'
          and id <> coalesce(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) >= 2 then
      raise exception 'Limite de 2 promoções ativas por dia (%)', NEW.date;
    end if;
  end if;
  return NEW;
end $$;

drop trigger if exists trg_day_promo_limit on public.day_promotions;
create trigger trg_day_promo_limit
  before insert or update on public.day_promotions
  for each row execute function public.enforce_day_promo_limit();

-- ============================================================
-- ROW LEVEL SECURITY (mesmo molde de general_promotions)
-- ============================================================
alter table public.day_promotions enable row level security;

create policy "day_promotions_select" on public.day_promotions for select using (true);
create policy "day_promotions_insert" on public.day_promotions for insert with check (true);
create policy "day_promotions_update" on public.day_promotions for update using (true) with check (true);
create policy "day_promotions_delete" on public.day_promotions for delete using (true);
