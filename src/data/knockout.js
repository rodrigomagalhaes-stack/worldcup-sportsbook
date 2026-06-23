// Calendário oficial da fase eliminatória (Copa 2026) — datas/horários (BRT)/sedes fixos.
// Os times reais (quando ainda não definidos), placar e status ficam na tabela
// `knockout_matches` do Supabase, sobreposta a este calendário pelo `id`.

export const KNOCKOUT_ROUNDS = [
  { id: 'R32',   label: 'Rodada 32' },
  { id: 'R16',   label: 'Oitavas de Final' },
  { id: 'QF',    label: 'Quartas de Final' },
  { id: 'SF',    label: 'Semifinal' },
  { id: '3RD',   label: 'Disputa de 3º Lugar' },
  { id: 'FINAL', label: 'Final' },
];

export const knockoutSchedule = [
  // ── RODADA 32 ──
  { id: 73, round: 'R32', date: '2026-06-28', timeBRT: '16:00', venue: 'SoFi Stadium, Inglewood',          homeSlot: '2º Grupo A',  awaySlot: '2º Grupo B',  leadsTo: 90, leadsToSlot: 'home' },
  { id: 76, round: 'R32', date: '2026-06-29', timeBRT: '13:00', venue: 'NRG Stadium, Houston',             homeSlot: '1º Grupo C',  awaySlot: '2º Grupo F',  leadsTo: 91, leadsToSlot: 'home' },
  { id: 74, round: 'R32', date: '2026-06-29', timeBRT: '17:30', venue: 'Gillette Stadium, Foxborough',     homeSlot: '1º Grupo E',  awaySlot: '3º Grupo A/B/C/D/F', leadsTo: 89, leadsToSlot: 'home' },
  { id: 75, round: 'R32', date: '2026-06-29', timeBRT: '21:00', venue: 'Estadio BBVA, Guadalupe',          homeSlot: '1º Grupo F',  awaySlot: '2º Grupo C',  leadsTo: 90, leadsToSlot: 'away' },
  { id: 78, round: 'R32', date: '2026-06-30', timeBRT: '13:00', venue: 'AT&T Stadium, Arlington',          homeSlot: '2º Grupo E',  awaySlot: '2º Grupo I',  leadsTo: 91, leadsToSlot: 'away' },
  { id: 77, round: 'R32', date: '2026-06-30', timeBRT: '18:00', venue: 'MetLife Stadium, East Rutherford', homeSlot: '1º Grupo I',  awaySlot: '3º Grupo C/D/F/G/H', leadsTo: 89, leadsToSlot: 'away' },
  { id: 79, round: 'R32', date: '2026-06-30', timeBRT: '21:00', venue: 'Estadio Azteca, Cidade do México', homeSlot: '1º Grupo A',  awaySlot: '3º Grupo C/E/F/H/I', leadsTo: 92, leadsToSlot: 'home' },
  { id: 80, round: 'R32', date: '2026-07-01', timeBRT: '13:00', venue: 'Mercedes-Benz Stadium, Atlanta',   homeSlot: '1º Grupo L',  awaySlot: '3º Grupo E/H/I/J/K', leadsTo: 92, leadsToSlot: 'away' },
  { id: 82, round: 'R32', date: '2026-07-01', timeBRT: '17:00', venue: 'Lumen Field, Seattle',             homeSlot: '1º Grupo G',  awaySlot: '3º Grupo A/E/H/I/J', leadsTo: 94, leadsToSlot: 'away' },
  { id: 81, round: 'R32', date: '2026-07-01', timeBRT: '21:00', venue: "Levi's Stadium, Santa Clara",      homeSlot: '1º Grupo D',  awaySlot: '3º Grupo B/E/F/I/J', leadsTo: 94, leadsToSlot: 'home' },
  { id: 84, round: 'R32', date: '2026-07-02', timeBRT: '16:00', venue: 'SoFi Stadium, Inglewood',          homeSlot: '1º Grupo H',  awaySlot: '2º Grupo J',  leadsTo: 93, leadsToSlot: 'away' },
  { id: 83, round: 'R32', date: '2026-07-02', timeBRT: '20:00', venue: 'BMO Field, Toronto',               homeSlot: '2º Grupo K',  awaySlot: '2º Grupo L',  leadsTo: 93, leadsToSlot: 'home' },
  { id: 85, round: 'R32', date: '2026-07-03', timeBRT: '00:00', venue: 'BC Place, Vancouver',              homeSlot: '1º Grupo B',  awaySlot: '3º Grupo E/F/G/I/J', leadsTo: 96, leadsToSlot: 'home' },
  { id: 88, round: 'R32', date: '2026-07-03', timeBRT: '14:00', venue: 'AT&T Stadium, Arlington',          homeSlot: '2º Grupo D',  awaySlot: '2º Grupo G',  leadsTo: 95, leadsToSlot: 'away' },
  { id: 86, round: 'R32', date: '2026-07-03', timeBRT: '19:00', venue: 'Hard Rock Stadium, Miami Gardens', homeSlot: '1º Grupo J',  awaySlot: '2º Grupo H',  leadsTo: 95, leadsToSlot: 'home' },
  { id: 87, round: 'R32', date: '2026-07-03', timeBRT: '21:30', venue: 'Arrowhead Stadium, Kansas City',   homeSlot: '1º Grupo K',  awaySlot: '3º Grupo D/E/I/J/L', leadsTo: 96, leadsToSlot: 'away' },

  // ── OITAVAS DE FINAL ──
  { id: 90, round: 'R16', date: '2026-07-04', timeBRT: '13:00', venue: 'NRG Stadium, Houston',             homeSlot: 'Vencedor Jogo 73', awaySlot: 'Vencedor Jogo 75', leadsTo: 97,  leadsToSlot: 'away' },
  { id: 89, round: 'R16', date: '2026-07-04', timeBRT: '18:00', venue: 'Lincoln Financial Field, Filadélfia', homeSlot: 'Vencedor Jogo 74', awaySlot: 'Vencedor Jogo 77', leadsTo: 97,  leadsToSlot: 'home' },
  { id: 91, round: 'R16', date: '2026-07-05', timeBRT: '17:00', venue: 'MetLife Stadium, East Rutherford', homeSlot: 'Vencedor Jogo 76', awaySlot: 'Vencedor Jogo 78', leadsTo: 99,  leadsToSlot: 'home' },
  { id: 92, round: 'R16', date: '2026-07-05', timeBRT: '20:00', venue: 'Estadio Azteca, Cidade do México', homeSlot: 'Vencedor Jogo 79', awaySlot: 'Vencedor Jogo 80', leadsTo: 99,  leadsToSlot: 'away' },
  { id: 93, round: 'R16', date: '2026-07-06', timeBRT: '15:00', venue: 'AT&T Stadium, Arlington',          homeSlot: 'Vencedor Jogo 83', awaySlot: 'Vencedor Jogo 84', leadsTo: 98,  leadsToSlot: 'home' },
  { id: 94, round: 'R16', date: '2026-07-06', timeBRT: '21:00', venue: 'Lumen Field, Seattle',             homeSlot: 'Vencedor Jogo 81', awaySlot: 'Vencedor Jogo 82', leadsTo: 98,  leadsToSlot: 'away' },
  { id: 95, round: 'R16', date: '2026-07-07', timeBRT: '13:00', venue: 'Mercedes-Benz Stadium, Atlanta',   homeSlot: 'Vencedor Jogo 86', awaySlot: 'Vencedor Jogo 88', leadsTo: 100, leadsToSlot: 'home' },
  { id: 96, round: 'R16', date: '2026-07-07', timeBRT: '17:00', venue: 'BC Place, Vancouver',              homeSlot: 'Vencedor Jogo 85', awaySlot: 'Vencedor Jogo 87', leadsTo: 100, leadsToSlot: 'away' },

  // ── QUARTAS DE FINAL ──
  { id: 97,  round: 'QF', date: '2026-07-09', timeBRT: '17:00', venue: 'Gillette Stadium, Foxborough',      homeSlot: 'Vencedor Jogo 89', awaySlot: 'Vencedor Jogo 90', leadsTo: 101, leadsToSlot: 'home' },
  { id: 98,  round: 'QF', date: '2026-07-10', timeBRT: '16:00', venue: 'SoFi Stadium, Inglewood',           homeSlot: 'Vencedor Jogo 93', awaySlot: 'Vencedor Jogo 94', leadsTo: 101, leadsToSlot: 'away' },
  { id: 99,  round: 'QF', date: '2026-07-11', timeBRT: '18:00', venue: 'Hard Rock Stadium, Miami Gardens',  homeSlot: 'Vencedor Jogo 91', awaySlot: 'Vencedor Jogo 92', leadsTo: 102, leadsToSlot: 'home' },
  { id: 100, round: 'QF', date: '2026-07-11', timeBRT: '21:00', venue: 'Arrowhead Stadium, Kansas City',    homeSlot: 'Vencedor Jogo 95', awaySlot: 'Vencedor Jogo 96', leadsTo: 102, leadsToSlot: 'away' },

  // ── SEMIFINAL ──
  { id: 101, round: 'SF', date: '2026-07-14', timeBRT: '15:00', venue: 'AT&T Stadium, Arlington',          homeSlot: 'Vencedor Jogo 97', awaySlot: 'Vencedor Jogo 98', leadsTo: 104, leadsToSlot: 'home', loserLeadsTo: 103, loserLeadsToSlot: 'home' },
  { id: 102, round: 'SF', date: '2026-07-15', timeBRT: '16:00', venue: 'Mercedes-Benz Stadium, Atlanta',   homeSlot: 'Vencedor Jogo 99', awaySlot: 'Vencedor Jogo 100', leadsTo: 104, leadsToSlot: 'away', loserLeadsTo: 103, loserLeadsToSlot: 'away' },

  // ── DISPUTA DE 3º LUGAR E FINAL ──
  { id: 103, round: '3RD',   date: '2026-07-18', timeBRT: '18:00', venue: 'Hard Rock Stadium, Miami Gardens',  homeSlot: 'Perdedor Jogo 101', awaySlot: 'Perdedor Jogo 102', leadsTo: null, leadsToSlot: null },
  { id: 104, round: 'FINAL', date: '2026-07-19', timeBRT: '16:00', venue: 'MetLife Stadium, East Rutherford',  homeSlot: 'Vencedor Jogo 101', awaySlot: 'Vencedor Jogo 102', leadsTo: null, leadsToSlot: null },
];

// Posição visual de cada jogo dentro da sua rodada, calculada para que jogos
// adjacentes no bracket sempre alimentem o mesmo jogo da rodada seguinte.
const BRACKET_ORDER = [
  74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87, // R32
  89, 90, 93, 94, 91, 92, 95, 96, // R16
  97, 98, 99, 100,               // QF
  101, 102,                      // SF
  103,                           // 3RD
  104,                           // FINAL
];

export function getKnockoutOrder(matchId) {
  const idx = BRACKET_ORDER.indexOf(matchId);
  return idx === -1 ? 0 : idx;
}
