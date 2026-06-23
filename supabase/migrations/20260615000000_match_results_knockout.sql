-- ============================================================
-- TABELA: match_results  (placar/status real — overlay sobre matches)
-- ============================================================
create table if not exists public.match_results (
  match_id   integer primary key references public.matches(id) on delete cascade,
  status     text not null default 'scheduled' check (status in ('scheduled','live','finished')),
  home_score smallint,
  away_score smallint,
  minute     smallint,
  updated_at timestamptz not null default now()
);

drop trigger if exists match_results_updated_at on public.match_results;
create trigger match_results_updated_at
  before update on public.match_results
  for each row execute function public.handle_updated_at();

alter table public.match_results enable row level security;

drop policy if exists "match_results_select" on public.match_results;
drop policy if exists "match_results_insert" on public.match_results;
drop policy if exists "match_results_update" on public.match_results;
drop policy if exists "match_results_delete" on public.match_results;
create policy "match_results_select" on public.match_results for select using (true);
create policy "match_results_insert" on public.match_results for insert with check (true);
create policy "match_results_update" on public.match_results for update using (true) with check (true);
create policy "match_results_delete" on public.match_results for delete using (true);

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
  updated_at       timestamptz not null default now()
);

create index if not exists idx_knockout_round on public.knockout_matches(round);

drop trigger if exists knockout_matches_updated_at on public.knockout_matches;
create trigger knockout_matches_updated_at
  before update on public.knockout_matches
  for each row execute function public.handle_updated_at();

alter table public.knockout_matches enable row level security;

drop policy if exists "knockout_matches_select" on public.knockout_matches;
drop policy if exists "knockout_matches_insert" on public.knockout_matches;
drop policy if exists "knockout_matches_update" on public.knockout_matches;
drop policy if exists "knockout_matches_delete" on public.knockout_matches;
create policy "knockout_matches_select" on public.knockout_matches for select using (true);
create policy "knockout_matches_insert" on public.knockout_matches for insert with check (true);
create policy "knockout_matches_update" on public.knockout_matches for update using (true) with check (true);
create policy "knockout_matches_delete" on public.knockout_matches for delete using (true);

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
