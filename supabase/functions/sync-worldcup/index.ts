// Sincroniza placares/status reais da Copa 2026 a partir da football-data.org
// (fase de grupos -> match_results, mata-mata -> knockout_matches).
//
// Disparada por:
//   - pg_cron a cada 3 minutos (ver supabase/schema.sql / migrations/20260622000000_live_sync.sql)
//   - botão "Sincronizar agora" no painel admin (supabase.functions.invoke('sync-worldcup'))
//
// Secrets necessários (supabase secrets set):
//   FOOTBALL_DATA_API_KEY   -> chave gratuita de football-data.org
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY já são injetadas automaticamente pelo runtime.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const FOOTBALL_DATA_API_KEY = Deno.env.get('FOOTBALL_DATA_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ── Calendário da fase de grupos (espelha src/data/matches.js) ──────────────
// Mantido aqui em duplicidade pois Edge Functions são empacotadas isoladamente
// e não importam arquivos fora de supabase/functions/. Ao alterar matches.js
// (não deveria acontecer após o sorteio), atualize esta lista também.
const GROUP_MATCHES: { id: number; home: string; away: string }[] = [
  { id: 1, home: 'México', away: 'África do Sul' }, { id: 2, home: 'Coreia do Sul', away: 'Republica Tcheca' },
  { id: 3, home: 'Canadá', away: 'Bósnia e Herzegovina' }, { id: 4, home: 'EUA', away: 'Paraguai' },
  { id: 5, home: 'Catar', away: 'Suíça' }, { id: 6, home: 'Brasil', away: 'Marrocos' },
  { id: 7, home: 'Haiti', away: 'Escócia' }, { id: 8, home: 'Austrália', away: 'Turquia' },
  { id: 9, home: 'Alemanha', away: 'Curaçau' }, { id: 10, home: 'Países Baixos', away: 'Japão' },
  { id: 11, home: 'Costa do Marfim', away: 'Equador' }, { id: 12, home: 'Suécia', away: 'Tunísia' },
  { id: 13, home: 'Espanha', away: 'Cabo Verde' }, { id: 14, home: 'Bélgica', away: 'Egito' },
  { id: 15, home: 'Arábia Saudita', away: 'Uruguai' }, { id: 16, home: 'Irã', away: 'Nova Zelândia' },
  { id: 17, home: 'França', away: 'Senegal' }, { id: 18, home: 'Iraque', away: 'Noruega' },
  { id: 19, home: 'Argentina', away: 'Argélia' }, { id: 20, home: 'Áustria', away: 'Jordânia' },
  { id: 21, home: 'Portugal', away: 'R. D. Congo' }, { id: 22, home: 'Inglaterra', away: 'Croácia' },
  { id: 23, home: 'Gana', away: 'Panamá' }, { id: 24, home: 'Uzbequistão', away: 'Colômbia' },
  { id: 25, home: 'Republica Tcheca', away: 'África do Sul' }, { id: 26, home: 'Suíça', away: 'Bósnia e Herzegovina' },
  { id: 27, home: 'Canadá', away: 'Catar' }, { id: 28, home: 'México', away: 'Coreia do Sul' },
  { id: 29, home: 'EUA', away: 'Austrália' }, { id: 30, home: 'Escócia', away: 'Marrocos' },
  { id: 31, home: 'Brasil', away: 'Haiti' }, { id: 32, home: 'Turquia', away: 'Paraguai' },
  { id: 33, home: 'Países Baixos', away: 'Suécia' }, { id: 34, home: 'Alemanha', away: 'Costa do Marfim' },
  { id: 35, home: 'Equador', away: 'Curaçau' }, { id: 36, home: 'Tunísia', away: 'Japão' },
  { id: 37, home: 'Espanha', away: 'Arábia Saudita' }, { id: 38, home: 'Bélgica', away: 'Irã' },
  { id: 39, home: 'Uruguai', away: 'Cabo Verde' }, { id: 40, home: 'Nova Zelândia', away: 'Egito' },
  { id: 41, home: 'Argentina', away: 'Áustria' }, { id: 42, home: 'França', away: 'Iraque' },
  { id: 43, home: 'Noruega', away: 'Senegal' }, { id: 44, home: 'Jordânia', away: 'Argélia' },
  { id: 45, home: 'Portugal', away: 'Uzbequistão' }, { id: 46, home: 'Inglaterra', away: 'Gana' },
  { id: 47, home: 'Panamá', away: 'Croácia' }, { id: 48, home: 'Colômbia', away: 'R. D. Congo' },
  { id: 49, home: 'Suíça', away: 'Canadá' }, { id: 50, home: 'Bósnia e Herzegovina', away: 'Catar' },
  { id: 51, home: 'Escócia', away: 'Brasil' }, { id: 52, home: 'Marrocos', away: 'Haiti' },
  { id: 53, home: 'Republica Tcheca', away: 'México' }, { id: 54, home: 'África do Sul', away: 'Coreia do Sul' },
  { id: 55, home: 'Equador', away: 'Alemanha' }, { id: 56, home: 'Curaçau', away: 'Costa do Marfim' },
  { id: 57, home: 'Japão', away: 'Suécia' }, { id: 58, home: 'Tunísia', away: 'Países Baixos' },
  { id: 59, home: 'Turquia', away: 'EUA' }, { id: 60, home: 'Paraguai', away: 'Austrália' },
  { id: 61, home: 'Noruega', away: 'França' }, { id: 62, home: 'Senegal', away: 'Iraque' },
  { id: 63, home: 'Cabo Verde', away: 'Arábia Saudita' }, { id: 64, home: 'Uruguai', away: 'Espanha' },
  { id: 65, home: 'Egito', away: 'Irã' }, { id: 66, home: 'Nova Zelândia', away: 'Bélgica' },
  { id: 67, home: 'Panamá', away: 'Inglaterra' }, { id: 68, home: 'Croácia', away: 'Gana' },
  { id: 69, home: 'Colômbia', away: 'Portugal' }, { id: 70, home: 'R. D. Congo', away: 'Uzbequistão' },
  { id: 71, home: 'Argélia', away: 'Áustria' }, { id: 72, home: 'Jordânia', away: 'Argentina' },
];

// ── Calendário da fase eliminatória (espelha src/data/knockout.js) ─────────
const KNOCKOUT_SCHEDULE: { id: number; round: string; date: string; timeBRT: string }[] = [
  { id: 73, round: 'R32', date: '2026-06-28', timeBRT: '16:00' }, { id: 76, round: 'R32', date: '2026-06-29', timeBRT: '13:00' },
  { id: 74, round: 'R32', date: '2026-06-29', timeBRT: '17:30' }, { id: 75, round: 'R32', date: '2026-06-29', timeBRT: '21:00' },
  { id: 78, round: 'R32', date: '2026-06-30', timeBRT: '13:00' }, { id: 77, round: 'R32', date: '2026-06-30', timeBRT: '18:00' },
  { id: 79, round: 'R32', date: '2026-06-30', timeBRT: '21:00' }, { id: 80, round: 'R32', date: '2026-07-01', timeBRT: '13:00' },
  { id: 82, round: 'R32', date: '2026-07-01', timeBRT: '17:00' }, { id: 81, round: 'R32', date: '2026-07-01', timeBRT: '21:00' },
  { id: 84, round: 'R32', date: '2026-07-02', timeBRT: '16:00' }, { id: 83, round: 'R32', date: '2026-07-02', timeBRT: '20:00' },
  { id: 85, round: 'R32', date: '2026-07-03', timeBRT: '00:00' }, { id: 88, round: 'R32', date: '2026-07-03', timeBRT: '14:00' },
  { id: 86, round: 'R32', date: '2026-07-03', timeBRT: '19:00' }, { id: 87, round: 'R32', date: '2026-07-03', timeBRT: '21:30' },
  { id: 90, round: 'R16', date: '2026-07-04', timeBRT: '13:00' }, { id: 89, round: 'R16', date: '2026-07-04', timeBRT: '18:00' },
  { id: 91, round: 'R16', date: '2026-07-05', timeBRT: '17:00' }, { id: 92, round: 'R16', date: '2026-07-05', timeBRT: '20:00' },
  { id: 93, round: 'R16', date: '2026-07-06', timeBRT: '15:00' }, { id: 94, round: 'R16', date: '2026-07-06', timeBRT: '21:00' },
  { id: 95, round: 'R16', date: '2026-07-07', timeBRT: '13:00' }, { id: 96, round: 'R16', date: '2026-07-07', timeBRT: '17:00' },
  { id: 97, round: 'QF', date: '2026-07-09', timeBRT: '17:00' }, { id: 98, round: 'QF', date: '2026-07-10', timeBRT: '16:00' },
  { id: 99, round: 'QF', date: '2026-07-11', timeBRT: '18:00' }, { id: 100, round: 'QF', date: '2026-07-11', timeBRT: '21:00' },
  { id: 101, round: 'SF', date: '2026-07-14', timeBRT: '15:00' }, { id: 102, round: 'SF', date: '2026-07-15', timeBRT: '16:00' },
  { id: 103, round: '3RD', date: '2026-07-18', timeBRT: '18:00' }, { id: 104, round: 'FINAL', date: '2026-07-19', timeBRT: '16:00' },
];

// football-data.org usa stages diferentes a depender da temporada; mapeamos
// as variantes conhecidas para os nossos códigos de rodada.
const STAGE_TO_ROUND: Record<string, string> = {
  ROUND_OF_32: 'R32',
  LAST_32: 'R32',
  ROUND_OF_16: 'R16',
  LAST_16: 'R16',
  QUARTER_FINALS: 'QF',
  SEMI_FINALS: 'SF',
  THIRD_PLACE: '3RD',
  FINAL: 'FINAL',
};

const STATUS_MAP: Record<string, string> = {
  SCHEDULED: 'scheduled',
  TIMED: 'scheduled',
  IN_PLAY: 'live',
  PAUSED: 'live',
  FINISHED: 'finished',
  SUSPENDED: 'live',
  POSTPONED: 'scheduled',
};

// PT (nome usado em matches.js / knockout_matches.home_team) -> aliases em inglês
// (normalizados: minúsculas, sem acento) aceitos vindos da football-data.org.
const TEAM_ALIASES: Record<string, string[]> = {
  'México': ['mexico'],
  'África do Sul': ['south africa'],
  'Coreia do Sul': ['south korea', 'korea republic', 'korea south'],
  'Republica Tcheca': ['czech republic', 'czechia'],
  'Canadá': ['canada'],
  'Bósnia e Herzegovina': ['bosnia and herzegovina', 'bosnia-herzegovina', 'bosnia herzegovina'],
  'Catar': ['qatar'],
  'Suíça': ['switzerland'],
  'Brasil': ['brazil'],
  'Marrocos': ['morocco'],
  'Haiti': ['haiti'],
  'Escócia': ['scotland'],
  'EUA': ['united states', 'usa', 'united states of america'],
  'Paraguai': ['paraguay'],
  'Austrália': ['australia'],
  'Turquia': ['turkey', 'turkiye'],
  'Alemanha': ['germany'],
  'Curaçau': ['curacao'],
  'Costa do Marfim': ['ivory coast', 'cote divoire'],
  'Equador': ['ecuador'],
  'Países Baixos': ['netherlands', 'holland'],
  'Japão': ['japan'],
  'Suécia': ['sweden'],
  'Tunísia': ['tunisia'],
  'Bélgica': ['belgium'],
  'Egito': ['egypt'],
  'Irã': ['iran', 'ir iran'],
  'Nova Zelândia': ['new zealand'],
  'Espanha': ['spain'],
  'Cabo Verde': ['cape verde', 'cape verde islands'],
  'Arábia Saudita': ['saudi arabia'],
  'Uruguai': ['uruguay'],
  'França': ['france'],
  'Senegal': ['senegal'],
  'Iraque': ['iraq'],
  'Noruega': ['norway'],
  'Argentina': ['argentina'],
  'Argélia': ['algeria'],
  'Áustria': ['austria'],
  'Jordânia': ['jordan'],
  'Portugal': ['portugal'],
  'R. D. Congo': ['dr congo', 'congo dr', 'democratic republic of the congo'],
  'Uzbequistão': ['uzbekistan'],
  'Colômbia': ['colombia'],
  'Inglaterra': ['england'],
  'Croácia': ['croatia'],
  'Gana': ['ghana'],
  'Panamá': ['panama'],
};

function normalize(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const EN_TO_PT = new Map<string, string>();
for (const [pt, aliases] of Object.entries(TEAM_ALIASES)) {
  for (const alias of aliases) EN_TO_PT.set(alias, pt);
}

function resolvePT(apiTeamName: string | null | undefined): string | null {
  const n = normalize(apiTeamName);
  if (!n) return null;
  if (EN_TO_PT.has(n)) return EN_TO_PT.get(n)!;
  // Fallback: tenta achar por inclusão parcial (ex.: "Korea Republic" variações)
  for (const [alias, pt] of EN_TO_PT) {
    if (n.includes(alias) || alias.includes(n)) return pt;
  }
  return null;
}

function pairKey(a: string, b: string) {
  return [a, b].sort().join('|');
}

const GROUP_MATCH_BY_PAIR = new Map<string, number>();
for (const m of GROUP_MATCHES) GROUP_MATCH_BY_PAIR.set(pairKey(m.home, m.away), m.id);

async function setSyncStatus(patch: Record<string, unknown>) {
  await supabase.from('sync_status').update(patch).eq('id', 1);
}

Deno.serve(async () => {
  if (!FOOTBALL_DATA_API_KEY) {
    await setSyncStatus({ last_run_at: new Date().toISOString(), status: 'error', message: 'FOOTBALL_DATA_API_KEY não configurada' });
    return new Response(JSON.stringify({ error: 'FOOTBALL_DATA_API_KEY não configurada' }), { status: 500 });
  }

  await setSyncStatus({ status: 'running', last_run_at: new Date().toISOString() });

  try {
    const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
      headers: { 'X-Auth-Token': FOOTBALL_DATA_API_KEY },
    });
    if (!res.ok) throw new Error(`football-data.org respondeu ${res.status}: ${await res.text()}`);
    const payload = await res.json();
    const apiMatches: any[] = payload.matches ?? [];

    let synced = 0;

    // ── Fase de grupos ──────────────────────────────────────────
    const groupApiMatches = apiMatches.filter(m => m.stage === 'GROUP_STAGE');
    for (const am of groupApiMatches) {
      const homePT = resolvePT(am.homeTeam?.name);
      const awayPT = resolvePT(am.awayTeam?.name);
      if (!homePT || !awayPT) continue;
      const matchId = GROUP_MATCH_BY_PAIR.get(pairKey(homePT, awayPT));
      if (!matchId) continue;

      const status = STATUS_MAP[am.status] ?? 'scheduled';
      const { error } = await supabase.from('match_results').upsert({
        match_id: matchId,
        status,
        home_score: am.score?.fullTime?.home ?? null,
        away_score: am.score?.fullTime?.away ?? null,
        minute: am.minute ?? null,
        fd_match_id: am.id,
      }, { onConflict: 'match_id' });
      if (!error) synced++;
    }

    // ── Mata-mata ───────────────────────────────────────────────
    const { data: existingKO } = await supabase.from('knockout_matches').select('id, round, date, time_brt, fd_match_id');

    for (const [stage, round] of Object.entries(STAGE_TO_ROUND)) {
      const apiRoundMatches = apiMatches
        .filter(m => m.stage === stage)
        .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
      if (apiRoundMatches.length === 0) continue;

      const ourRoundRows = (existingKO ?? [])
        .filter(r => r.round === round)
        .sort((a, b) => `${a.date} ${a.time_brt}`.localeCompare(`${b.date} ${b.time_brt}`));

      // Índice direto: api match id já mapeado anteriormente
      const byFdId = new Map(ourRoundRows.filter(r => r.fd_match_id).map(r => [r.fd_match_id as number, r.id]));
      // Linhas ainda não mapeadas, na ordem do nosso calendário fixo
      const unmapped = ourRoundRows.filter(r => !r.fd_match_id);
      let unmappedCursor = 0;

      for (const am of apiRoundMatches) {
        let targetId = byFdId.get(am.id);
        if (!targetId && unmappedCursor < unmapped.length) {
          targetId = unmapped[unmappedCursor].id;
          unmappedCursor++;
        }
        if (!targetId) continue;

        const status = STATUS_MAP[am.status] ?? 'scheduled';
        const homePT = resolvePT(am.homeTeam?.name);
        const awayPT = resolvePT(am.awayTeam?.name);

        const patch: Record<string, unknown> = {
          status,
          home_score: am.score?.fullTime?.home ?? null,
          away_score: am.score?.fullTime?.away ?? null,
          home_pen: am.score?.penalties?.home ?? null,
          away_pen: am.score?.penalties?.away ?? null,
          fd_match_id: am.id,
        };
        if (homePT) patch.home_team = homePT;
        if (awayPT) patch.away_team = awayPT;

        const { error } = await supabase.from('knockout_matches').update(patch).eq('id', targetId);
        if (!error) synced++;
      }
    }

    await setSyncStatus({
      status: 'ok',
      last_ok_at: new Date().toISOString(),
      message: `${synced} partidas atualizadas`,
      matches_synced: synced,
    });

    return new Response(JSON.stringify({ ok: true, synced }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    await setSyncStatus({ status: 'error', message: String((err as Error)?.message ?? err) });
    return new Response(JSON.stringify({ error: String((err as Error)?.message ?? err) }), { status: 500 });
  }
});
