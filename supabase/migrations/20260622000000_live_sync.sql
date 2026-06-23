-- ============================================================
-- Live sync com football-data.org (fase de grupos + mata-mata)
-- ============================================================

-- Coluna para guardar o id da partida na API externa, uma vez
-- descoberto, para que as próximas sincronizações do mata-mata
-- (onde os times só existem depois de classificados) deixem de
-- depender de inferência posicional e passem a casar por id.
alter table public.knockout_matches
  add column if not exists fd_match_id integer;

create unique index if not exists idx_knockout_fd_match_id
  on public.knockout_matches (fd_match_id)
  where fd_match_id is not null;

alter table public.match_results
  add column if not exists fd_match_id integer;

-- ============================================================
-- TABELA: sync_status — observabilidade da sincronização externa
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

alter table public.sync_status enable row level security;

create policy "sync_status_select" on public.sync_status for select using (true);
create policy "sync_status_update" on public.sync_status for update using (true) with check (true);

-- ============================================================
-- pg_cron + pg_net — dispara a Edge Function periodicamente
-- ============================================================
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
