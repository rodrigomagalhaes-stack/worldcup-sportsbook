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

drop trigger if exists general_promotions_updated_at on public.general_promotions;
create trigger general_promotions_updated_at
  before update on public.general_promotions
  for each row execute function public.handle_updated_at();

-- ============================================================
-- TABELA: day_promotions  (promoções "do dia"; máx. 2 ativas/dia)
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
-- TABELA: match_results  (placar/status real — overlay sobre matches)
-- ============================================================
create table if not exists public.match_results (
  match_id   integer primary key references public.matches(id) on delete cascade,
  status     text not null default 'scheduled' check (status in ('scheduled','live','finished')),
  home_score smallint,
  away_score smallint,
  minute     smallint,
  fd_match_id integer,
  updated_at timestamptz not null default now()
);

drop trigger if exists match_results_updated_at on public.match_results;
create trigger match_results_updated_at
  before update on public.match_results
  for each row execute function public.handle_updated_at();

-- ============================================================
-- TABELA: knockout_matches  (calendário fixo + times/placar reais do mata-mata)
-- ============================================================
create table if not exists public.knockout_matches (
  id               integer primary key,
  round            text not null check (round in ('R32','R16','QF','SF','3RD','FINAL')),
  date             date not null,
  time_brt         varchar(5) not null,
  venue            text not null,
  home_slot        text not null,
  away_slot        text not null,
  -- Sem FK para public.teams: os nomes oficiais usados no app (matches.js)
  -- divergem dos nomes seedados na tabela teams (ex.: "Países Baixos" vs
  -- "Holanda"), então uma FK aqui quebraria tanto a digitação manual do
  -- admin quanto o preenchimento automático via sync.
  home_team        varchar(80),
  away_team        varchar(80),
  status           text not null default 'scheduled' check (status in ('scheduled','live','finished')),
  home_score       smallint,
  away_score       smallint,
  home_pen         smallint,
  away_pen         smallint,
  leads_to         integer,
  leads_to_slot    text check (leads_to_slot in ('home','away')),
  loser_leads_to       integer,
  loser_leads_to_slot  text check (loser_leads_to_slot in ('home','away')),
  fd_match_id      integer,
  updated_at       timestamptz not null default now()
);

create index if not exists idx_knockout_round on public.knockout_matches(round);
create unique index if not exists idx_knockout_fd_match_id on public.knockout_matches (fd_match_id) where fd_match_id is not null;

drop trigger if exists knockout_matches_updated_at on public.knockout_matches;
create trigger knockout_matches_updated_at
  before update on public.knockout_matches
  for each row execute function public.handle_updated_at();

-- ============================================================
-- TABELA: sync_status  (observabilidade da sincronização externa)
-- ============================================================
create table if not exists public.sync_status (
  id            smallint primary key default 1 check (id = 1),
  last_run_at   timestamptz,
  last_ok_at    timestamptz,
  status        text not null default 'idle' check (status in ('idle','running','ok','error')),
  message       text,
  matches_synced smallint default 0
);

insert into public.sync_status (id, status) values (1, 'idle')
on conflict (id) do nothing;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.groups             enable row level security;
alter table public.teams              enable row level security;
alter table public.promo_types        enable row level security;
alter table public.matches            enable row level security;
alter table public.events             enable row level security;
alter table public.general_promotions enable row level security;
alter table public.day_promotions     enable row level security;
alter table public.favorites          enable row level security;
alter table public.match_results      enable row level security;
alter table public.knockout_matches   enable row level security;
alter table public.sync_status        enable row level security;

-- Tabelas de referência: leitura pública
create policy "Public read groups"       on public.groups      for select using (true);
create policy "Public read teams"        on public.teams       for select using (true);
create policy "Public read promo_types"  on public.promo_types for select using (true);
create policy "Public read matches"      on public.matches     for select using (true);

-- Match Results: leitura e escrita públicas (sem auth no app)
create policy "match_results_select" on public.match_results for select using (true);
create policy "match_results_insert" on public.match_results for insert with check (true);
create policy "match_results_update" on public.match_results for update using (true) with check (true);
create policy "match_results_delete" on public.match_results for delete using (true);

-- Knockout Matches: leitura e escrita públicas (sem auth no app)
create policy "knockout_matches_select" on public.knockout_matches for select using (true);
create policy "knockout_matches_insert" on public.knockout_matches for insert with check (true);
create policy "knockout_matches_update" on public.knockout_matches for update using (true) with check (true);
create policy "knockout_matches_delete" on public.knockout_matches for delete using (true);

-- Sync Status: leitura pública; escrita feita pela Edge Function (service role, ignora RLS)
create policy "sync_status_select" on public.sync_status for select using (true);
create policy "sync_status_update" on public.sync_status for update using (true) with check (true);

-- Events: leitura e escrita públicas (sem auth no app)
create policy "Public read events"      on public.events for select using (true);
create policy "Public insert events"    on public.events for insert with check (true);
create policy "Public update events"    on public.events for update using (true);
create policy "Public delete events"    on public.events for delete using (true);

-- General Promotions: leitura e escrita públicas (sem auth no app)
create policy "Public read general_promotions"   on public.general_promotions for select using (true);
create policy "Public insert general_promotions" on public.general_promotions for insert with check (true);
create policy "Public update general_promotions" on public.general_promotions for update using (true);
create policy "Public delete general_promotions" on public.general_promotions for delete using (true);

-- Day Promotions: leitura e escrita públicas (sem auth no app)
create policy "day_promotions_select" on public.day_promotions for select using (true);
create policy "day_promotions_insert" on public.day_promotions for insert with check (true);
create policy "day_promotions_update" on public.day_promotions for update using (true) with check (true);
create policy "day_promotions_delete" on public.day_promotions for delete using (true);

-- Favorites: leitura e escrita públicas (single-user/admin)
create table if not exists public.favorites (
  id         uuid    primary key default gen_random_uuid(),
  match_id   bigint  not null,
  created_at timestamptz not null default now(),
  unique (match_id)
);
create index if not exists favorites_match_idx on public.favorites (match_id);
create policy "favorites_select" on public.favorites for select using (true);
create policy "favorites_insert" on public.favorites for insert with check (true);
create policy "favorites_delete" on public.favorites for delete using (true);

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

-- ============================================================
-- SEED: Calendário do mata-mata (32 jogos — slots, sem times definidos)
-- ============================================================
insert into public.knockout_matches
  (id, round, date, time_brt, venue, home_slot, away_slot, leads_to, leads_to_slot, loser_leads_to, loser_leads_to_slot) values
  -- Rodada 32
  (73,  'R32', '2026-06-28', '16:00', 'SoFi Stadium, Inglewood',                  '2º Grupo A', '2º Grupo B',          90,  'home', null, null),
  (76,  'R32', '2026-06-29', '13:00', 'NRG Stadium, Houston',                     '1º Grupo C', '2º Grupo F',          91,  'home', null, null),
  (74,  'R32', '2026-06-29', '17:30', 'Gillette Stadium, Foxborough',             '1º Grupo E', '3º Grupo A/B/C/D/F',  89,  'home', null, null),
  (75,  'R32', '2026-06-29', '21:00', 'Estadio BBVA, Guadalupe',                  '1º Grupo F', '2º Grupo C',          90,  'away', null, null),
  (78,  'R32', '2026-06-30', '13:00', 'AT&T Stadium, Arlington',                  '2º Grupo E', '2º Grupo I',          91,  'away', null, null),
  (77,  'R32', '2026-06-30', '18:00', 'MetLife Stadium, East Rutherford',         '1º Grupo I', '3º Grupo C/D/F/G/H',  89,  'away', null, null),
  (79,  'R32', '2026-06-30', '21:00', 'Estadio Azteca, Cidade do México',         '1º Grupo A', '3º Grupo C/E/F/H/I',  92,  'home', null, null),
  (80,  'R32', '2026-07-01', '13:00', 'Mercedes-Benz Stadium, Atlanta',           '1º Grupo L', '3º Grupo E/H/I/J/K',  92,  'away', null, null),
  (82,  'R32', '2026-07-01', '17:00', 'Lumen Field, Seattle',                     '1º Grupo G', '3º Grupo A/E/H/I/J',  94,  'away', null, null),
  (81,  'R32', '2026-07-01', '21:00', 'Levi''s Stadium, Santa Clara',             '1º Grupo D', '3º Grupo B/E/F/I/J',  94,  'home', null, null),
  (84,  'R32', '2026-07-02', '16:00', 'SoFi Stadium, Inglewood',                  '1º Grupo H', '2º Grupo J',          93,  'away', null, null),
  (83,  'R32', '2026-07-02', '20:00', 'BMO Field, Toronto',                       '2º Grupo K', '2º Grupo L',          93,  'home', null, null),
  (85,  'R32', '2026-07-03', '00:00', 'BC Place, Vancouver',                      '1º Grupo B', '3º Grupo E/F/G/I/J',  96,  'home', null, null),
  (88,  'R32', '2026-07-03', '14:00', 'AT&T Stadium, Arlington',                  '2º Grupo D', '2º Grupo G',          95,  'away', null, null),
  (86,  'R32', '2026-07-03', '19:00', 'Hard Rock Stadium, Miami Gardens',         '1º Grupo J', '2º Grupo H',          95,  'home', null, null),
  (87,  'R32', '2026-07-03', '21:30', 'Arrowhead Stadium, Kansas City',           '1º Grupo K', '3º Grupo D/E/I/J/L',  96,  'away', null, null),
  -- Oitavas de final
  (90,  'R16', '2026-07-04', '13:00', 'NRG Stadium, Houston',                     'Vencedor Jogo 73', 'Vencedor Jogo 75', 97,  'away', null, null),
  (89,  'R16', '2026-07-04', '18:00', 'Lincoln Financial Field, Filadélfia',      'Vencedor Jogo 74', 'Vencedor Jogo 77', 97,  'home', null, null),
  (91,  'R16', '2026-07-05', '17:00', 'MetLife Stadium, East Rutherford',         'Vencedor Jogo 76', 'Vencedor Jogo 78', 99,  'home', null, null),
  (92,  'R16', '2026-07-05', '20:00', 'Estadio Azteca, Cidade do México',         'Vencedor Jogo 79', 'Vencedor Jogo 80', 99,  'away', null, null),
  (93,  'R16', '2026-07-06', '15:00', 'AT&T Stadium, Arlington',                  'Vencedor Jogo 83', 'Vencedor Jogo 84', 98,  'home', null, null),
  (94,  'R16', '2026-07-06', '21:00', 'Lumen Field, Seattle',                     'Vencedor Jogo 81', 'Vencedor Jogo 82', 98,  'away', null, null),
  (95,  'R16', '2026-07-07', '13:00', 'Mercedes-Benz Stadium, Atlanta',           'Vencedor Jogo 86', 'Vencedor Jogo 88', 100, 'home', null, null),
  (96,  'R16', '2026-07-07', '17:00', 'BC Place, Vancouver',                      'Vencedor Jogo 85', 'Vencedor Jogo 87', 100, 'away', null, null),
  -- Quartas de final
  (97,  'QF', '2026-07-09', '17:00', 'Gillette Stadium, Foxborough',              'Vencedor Jogo 89', 'Vencedor Jogo 90', 101, 'home', null, null),
  (98,  'QF', '2026-07-10', '16:00', 'SoFi Stadium, Inglewood',                   'Vencedor Jogo 93', 'Vencedor Jogo 94', 101, 'away', null, null),
  (99,  'QF', '2026-07-11', '18:00', 'Hard Rock Stadium, Miami Gardens',          'Vencedor Jogo 91', 'Vencedor Jogo 92', 102, 'home', null, null),
  (100, 'QF', '2026-07-11', '21:00', 'Arrowhead Stadium, Kansas City',            'Vencedor Jogo 95', 'Vencedor Jogo 96', 102, 'away', null, null),
  -- Semifinal
  (101, 'SF', '2026-07-14', '15:00', 'AT&T Stadium, Arlington',                   'Vencedor Jogo 97', 'Vencedor Jogo 98',  104, 'home', 103, 'home'),
  (102, 'SF', '2026-07-15', '16:00', 'Mercedes-Benz Stadium, Atlanta',            'Vencedor Jogo 99', 'Vencedor Jogo 100', 104, 'away', 103, 'away'),
  -- Disputa de 3º lugar e Final
  (103, '3RD',   '2026-07-18', '18:00', 'Hard Rock Stadium, Miami Gardens',       'Perdedor Jogo 101', 'Perdedor Jogo 102', null, null, null, null),
  (104, 'FINAL', '2026-07-19', '16:00', 'MetLife Stadium, East Rutherford',       'Vencedor Jogo 101', 'Vencedor Jogo 102', null, null, null, null)
on conflict (id) do nothing;

-- ============================================================
-- LIVE SYNC: pg_cron + pg_net — dispara a Edge Function sync-worldcup
-- ============================================================
-- A function usa SUPABASE_SERVICE_ROLE_KEY injetada automaticamente pelo
-- runtime, e a FOOTBALL_DATA_API_KEY definida via `supabase secrets set`
-- (não comite a service role key aqui).
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'sync-worldcup-every-5-min',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://bujsneaqrzvxwdczeabc.supabase.co/functions/v1/sync-worldcup',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer sb_publishable__u6A6ShBGBFIFLGApi6C8g_ByRHUTGq'
    ),
    body := '{}'::jsonb
  );
  $$
);
