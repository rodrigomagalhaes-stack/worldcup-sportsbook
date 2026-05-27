-- ============================================================
-- Copa 2026 Sportsbook Calendar — Supabase Schema
-- ============================================================
-- Execute este arquivo no SQL Editor do Supabase Dashboard
-- ============================================================

-- Habilita extensão UUID
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABELAS DE REFERÊNCIA
-- ============================================================

-- Grupos da Copa (A a L)
create table if not exists public.groups (
  id    char(1)     primary key,
  color varchar(20) not null
);

-- Seleções participantes
create table if not exists public.teams (
  name      varchar(80) primary key,
  flag_code varchar(20) not null
);

-- Tipos de promoção
create table if not exists public.promo_types (
  id    varchar(20) primary key,
  label varchar(60) not null,
  color varchar(20) not null,
  icon  varchar(10) not null
);

-- ============================================================
-- TABELA: matches
-- ============================================================
create table if not exists public.matches (
  id        integer     primary key,
  date      date        not null,
  time_brt  varchar(5)  not null,
  home      varchar(80) not null references public.teams(name),
  away      varchar(80) not null references public.teams(name),
  "group"   char(1)     not null references public.groups(id),
  venue     varchar(100) not null,
  matchday  smallint    not null check (matchday between 1 and 3)
);

create index if not exists idx_matches_date     on public.matches(date);
create index if not exists idx_matches_group    on public.matches("group");
create index if not exists idx_matches_matchday on public.matches(matchday);

-- ============================================================
-- TABELA: events  (promoções cadastradas por jogo)
-- ============================================================
create table if not exists public.events (
  id          uuid        primary key default uuid_generate_v4(),
  match_id    integer     not null references public.matches(id) on delete cascade,
  type        varchar(20) not null references public.promo_types(id),
  title       varchar(200) not null,
  description text,
  rules       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_events_match_id on public.events(match_id);
create index if not exists idx_events_type     on public.events(type);
create index if not exists idx_events_created  on public.events(created_at);

-- Atualiza updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_updated_at on public.events;
create trigger events_updated_at
  before update on public.events
  for each row execute function public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.groups      enable row level security;
alter table public.teams       enable row level security;
alter table public.promo_types enable row level security;
alter table public.matches     enable row level security;
alter table public.events      enable row level security;

-- Tabelas de referência: leitura pública
create policy "Public read groups"       on public.groups      for select using (true);
create policy "Public read teams"        on public.teams       for select using (true);
create policy "Public read promo_types"  on public.promo_types for select using (true);
create policy "Public read matches"      on public.matches     for select using (true);

-- Events: leitura e escrita públicas (sem auth no app)
create policy "Public read events"      on public.events for select using (true);
create policy "Public insert events"    on public.events for insert with check (true);
create policy "Public update events"    on public.events for update using (true);
create policy "Public delete events"    on public.events for delete using (true);

-- ============================================================
-- SEED: Grupos
-- ============================================================
insert into public.groups (id, color) values
  ('A', '#f97316'),
  ('B', '#ef4444'),
  ('C', '#16a34a'),
  ('D', '#3b82f6'),
  ('E', '#8b5cf6'),
  ('F', '#ec4899'),
  ('G', '#14b8a6'),
  ('H', '#f59e0b'),
  ('I', '#6366f1'),
  ('J', '#06b6d4'),
  ('K', '#84cc16'),
  ('L', '#a855f7')
on conflict (id) do nothing;

-- ============================================================
-- SEED: Tipos de promoção
-- ============================================================
insert into public.promo_types (id, label, color, icon) values
  ('boost',   'Boost de Odds',    '#f59e0b', '🚀'),
  ('mercado', 'Mercado Especial', '#3b82f6', '⚡'),
  ('promo',   'Promoção do Dia',  '#16a34a', '🎯')
on conflict (id) do nothing;

-- ============================================================
-- SEED: Seleções
-- ============================================================
insert into public.teams (name, flag_code) values
  ('México',          'mx'),
  ('África do Sul',   'za'),
  ('Coreia do Sul',   'kr'),
  ('Tchéquia',        'cz'),
  ('Canadá',          'ca'),
  ('Bósnia',          'ba'),
  ('Catar',           'qa'),
  ('Suíça',           'ch'),
  ('Brasil',          'br'),
  ('Marrocos',        'ma'),
  ('Haiti',           'ht'),
  ('Escócia',         'gb-sct'),
  ('EUA',             'us'),
  ('Paraguai',        'py'),
  ('Austrália',       'au'),
  ('Turquia',         'tr'),
  ('Alemanha',        'de'),
  ('Curaçao',         'cw'),
  ('Costa do Marfim', 'ci'),
  ('Equador',         'ec'),
  ('Holanda',         'nl'),
  ('Japão',           'jp'),
  ('Suécia',          'se'),
  ('Tunísia',         'tn'),
  ('Bélgica',         'be'),
  ('Egito',           'eg'),
  ('Irã',             'ir'),
  ('Nova Zelândia',   'nz'),
  ('Espanha',         'es'),
  ('Cabo Verde',      'cv'),
  ('Arábia Saudita',  'sa'),
  ('Uruguai',         'uy'),
  ('França',          'fr'),
  ('Senegal',         'sn'),
  ('Iraque',          'iq'),
  ('Noruega',         'no'),
  ('Argentina',       'ar'),
  ('Argélia',         'dz'),
  ('Áustria',         'at'),
  ('Jordânia',        'jo'),
  ('Portugal',        'pt'),
  ('Rep. Congo',      'cd'),
  ('Uzbequistão',     'uz'),
  ('Colômbia',        'co'),
  ('Inglaterra',      'gb-eng'),
  ('Croácia',         'hr'),
  ('Gana',            'gh'),
  ('Panamá',          'pa')
on conflict (name) do nothing;

-- ============================================================
-- SEED: Partidas (72 jogos — Rodadas 1, 2 e 3)
-- ============================================================
insert into public.matches (id, date, time_brt, home, away, "group", venue, matchday) values
  -- RODADA 1
  (1,  '2026-06-11', '16:00', 'México',          'África do Sul',  'A', 'Cidade do México',  1),
  (2,  '2026-06-11', '23:00', 'Coreia do Sul',   'Tchéquia',       'A', 'Guadalajara',       1),
  (3,  '2026-06-12', '16:00', 'Canadá',          'Bósnia',         'B', 'Toronto',           1),
  (4,  '2026-06-12', '22:00', 'EUA',             'Paraguai',       'D', 'Los Angeles',       1),
  (5,  '2026-06-13', '16:00', 'Catar',           'Suíça',          'B', 'San Francisco',     1),
  (6,  '2026-06-13', '19:00', 'Brasil',          'Marrocos',       'C', 'Nova York/NJ',      1),
  (7,  '2026-06-13', '22:00', 'Haiti',           'Escócia',        'C', 'Boston',            1),
  (8,  '2026-06-13', '22:00', 'Austrália',       'Turquia',        'D', 'Vancouver',         1),
  (9,  '2026-06-14', '14:00', 'Alemanha',        'Curaçao',        'E', 'Houston',           1),
  (10, '2026-06-14', '17:00', 'Holanda',         'Japão',          'F', 'Dallas',            1),
  (11, '2026-06-14', '20:00', 'Costa do Marfim', 'Equador',        'E', 'Filadélfia',        1),
  (12, '2026-06-14', '23:00', 'Suécia',          'Tunísia',        'F', 'Monterrey',         1),
  (13, '2026-06-15', '13:00', 'Espanha',         'Cabo Verde',     'H', 'Atlanta',           1),
  (14, '2026-06-15', '16:00', 'Bélgica',         'Egito',          'G', 'Vancouver',         1),
  (15, '2026-06-15', '19:00', 'Arábia Saudita',  'Uruguai',        'H', 'Miami',             1),
  (16, '2026-06-15', '22:00', 'Irã',             'Nova Zelândia',  'G', 'Los Angeles',       1),
  (17, '2026-06-16', '16:00', 'França',          'Senegal',        'I', 'Nova York/NJ',      1),
  (18, '2026-06-16', '19:00', 'Iraque',          'Noruega',        'I', 'Boston',            1),
  (19, '2026-06-16', '22:00', 'Argentina',       'Argélia',        'J', 'Kansas City',       1),
  (20, '2026-06-17', '01:00', 'Áustria',         'Jordânia',       'J', 'San Francisco',     1),
  (21, '2026-06-17', '14:00', 'Portugal',        'Rep. Congo',     'K', 'Houston',           1),
  (22, '2026-06-17', '17:00', 'Inglaterra',      'Croácia',        'L', 'Dallas',            1),
  (23, '2026-06-17', '20:00', 'Gana',            'Panamá',         'L', 'Toronto',           1),
  (24, '2026-06-17', '23:00', 'Uzbequistão',     'Colômbia',       'K', 'Cidade do México',  1),
  -- RODADA 2
  (25, '2026-06-18', '13:00', 'Tchéquia',        'África do Sul',  'A', 'Atlanta',           2),
  (26, '2026-06-18', '16:00', 'Suíça',           'Bósnia',         'B', 'Los Angeles',       2),
  (27, '2026-06-18', '19:00', 'Canadá',          'Catar',          'B', 'Vancouver',         2),
  (28, '2026-06-18', '22:00', 'México',          'Coreia do Sul',  'A', 'Guadalajara',       2),
  (29, '2026-06-19', '16:00', 'EUA',             'Austrália',      'D', 'Seattle',           2),
  (30, '2026-06-19', '19:00', 'Escócia',         'Marrocos',       'C', 'Boston',            2),
  (31, '2026-06-19', '22:00', 'Brasil',          'Haiti',          'C', 'Filadélfia',        2),
  (32, '2026-06-20', '01:00', 'Turquia',         'Paraguai',       'D', 'San Francisco',     2),
  (33, '2026-06-20', '14:00', 'Holanda',         'Suécia',         'F', 'Houston',           2),
  (34, '2026-06-20', '17:00', 'Alemanha',        'Costa do Marfim','E', 'Toronto',           2),
  (35, '2026-06-20', '21:00', 'Equador',         'Curaçao',        'E', 'Kansas City',       2),
  (36, '2026-06-21', '01:00', 'Tunísia',         'Japão',          'F', 'Monterrey',         2),
  (37, '2026-06-21', '13:00', 'Espanha',         'Arábia Saudita', 'H', 'Atlanta',           2),
  (38, '2026-06-21', '16:00', 'Bélgica',         'Irã',            'G', 'Los Angeles',       2),
  (39, '2026-06-21', '19:00', 'Uruguai',         'Cabo Verde',     'H', 'Miami',             2),
  (40, '2026-06-21', '22:00', 'Nova Zelândia',   'Egito',          'G', 'Vancouver',         2),
  (41, '2026-06-22', '14:00', 'Argentina',       'Áustria',        'J', 'Dallas',            2),
  (42, '2026-06-22', '17:00', 'França',          'Iraque',         'I', 'Filadélfia',        2),
  (43, '2026-06-22', '20:00', 'Noruega',         'Senegal',        'I', 'Nova York/NJ',      2),
  (44, '2026-06-22', '23:00', 'Jordânia',        'Argélia',        'J', 'San Francisco',     2),
  (45, '2026-06-23', '14:00', 'Portugal',        'Uzbequistão',    'K', 'Houston',           2),
  (46, '2026-06-23', '17:00', 'Inglaterra',      'Gana',           'L', 'Boston',            2),
  (47, '2026-06-23', '20:00', 'Panamá',          'Croácia',        'L', 'Toronto',           2),
  (48, '2026-06-24', '01:00', 'Colômbia',        'Rep. Congo',     'K', 'Guadalajara',       2),
  -- RODADA 3
  (49, '2026-06-24', '16:00', 'Suíça',           'Canadá',         'B', 'Vancouver',         3),
  (50, '2026-06-24', '16:00', 'Bósnia',          'Catar',          'B', 'Seattle',           3),
  (51, '2026-06-24', '20:00', 'Escócia',         'Brasil',         'C', 'Miami',             3),
  (52, '2026-06-24', '20:00', 'Marrocos',        'Haiti',          'C', 'Atlanta',           3),
  (53, '2026-06-24', '22:00', 'Tchéquia',        'México',         'A', 'Cidade do México',  3),
  (54, '2026-06-24', '22:00', 'África do Sul',   'Coreia do Sul',  'A', 'Monterrey',         3),
  (55, '2026-06-25', '17:00', 'Equador',         'Alemanha',       'E', 'Nova York/NJ',      3),
  (56, '2026-06-25', '17:00', 'Curaçao',         'Costa do Marfim','E', 'Filadélfia',        3),
  (57, '2026-06-25', '20:00', 'Japão',           'Suécia',         'F', 'Dallas',            3),
  (58, '2026-06-25', '20:00', 'Tunísia',         'Holanda',        'F', 'Kansas City',       3),
  (59, '2026-06-25', '23:00', 'Turquia',         'EUA',            'D', 'Los Angeles',       3),
  (60, '2026-06-25', '23:00', 'Paraguai',        'Austrália',      'D', 'San Francisco',     3),
  (61, '2026-06-26', '16:00', 'Noruega',         'França',         'I', 'Boston',            3),
  (62, '2026-06-26', '16:00', 'Senegal',         'Iraque',         'I', 'Toronto',           3),
  (63, '2026-06-26', '21:00', 'Cabo Verde',      'Arábia Saudita', 'H', 'Houston',           3),
  (64, '2026-06-26', '21:00', 'Uruguai',         'Espanha',        'H', 'Guadalajara',       3),
  (65, '2026-06-26', '23:00', 'Egito',           'Irã',            'G', 'Seattle',           3),
  (66, '2026-06-26', '23:00', 'Nova Zelândia',   'Bélgica',        'G', 'Vancouver',         3),
  (67, '2026-06-27', '18:00', 'Panamá',          'Inglaterra',     'L', 'Nova York/NJ',      3),
  (68, '2026-06-27', '18:00', 'Croácia',         'Gana',           'L', 'Filadélfia',        3),
  (69, '2026-06-27', '20:30', 'Colômbia',        'Portugal',       'K', 'Miami',             3),
  (70, '2026-06-27', '20:30', 'Rep. Congo',      'Uzbequistão',    'K', 'Atlanta',           3),
  (71, '2026-06-27', '23:00', 'Argélia',         'Áustria',        'J', 'Kansas City',       3),
  (72, '2026-06-27', '23:00', 'Jordânia',        'Argentina',      'J', 'Dallas',            3)
on conflict (id) do nothing;
