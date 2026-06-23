import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X, MapPin, Trophy } from 'lucide-react';
import { knockoutSchedule, KNOCKOUT_ROUNDS, getKnockoutOrder } from '../data/knockout';
import { teamFlags } from '../data/matches';
import Flag from './Flag';
import SyncBadge from './SyncBadge';

/* ─────────────────────────────────────────
   Combina calendário fixo + overlay dinâmico (Supabase)
───────────────────────────────────────── */
function buildRounds(knockoutMatches) {
  const overlay = knockoutMatches.reduce((acc, m) => { acc[m.id] = m; return acc; }, {});
  const merged = knockoutSchedule.map(m => ({ ...m, ...overlay[m.id], order: getKnockoutOrder(m.id) }));

  return KNOCKOUT_ROUNDS.map(r => ({
    ...r,
    matches: merged.filter(m => m.round === r.id).sort((a, b) => a.order - b.order),
  }));
}

function TeamRow({ name, slot, score, isWinnerSide, finished }) {
  const known = !!name && teamFlags[name];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7, padding: '6px 10px',
      opacity: finished && !isWinnerSide ? 0.55 : 1,
    }}>
      {known ? <Flag team={name} size="sm" /> : <span style={{ width: 16, height: 12, borderRadius: 2, background: 'var(--line)', flexShrink: 0 }} />}
      <span style={{
        flex: 1, minWidth: 0, fontSize: 12, lineHeight: 1.3,
        fontWeight: finished && isWinnerSide ? 800 : 600,
        color: name ? 'var(--t1)' : 'var(--t3)',
        fontStyle: name ? 'normal' : 'italic',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {name || slot}
      </span>
      {score != null && (
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{score}</span>
      )}
    </div>
  );
}

function MatchBox({ match, onClick }) {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished' && match.home_score != null && match.away_score != null;
  const homeWins = isFinished && (match.home_score > match.away_score || (match.home_score === match.away_score && match.home_pen > match.away_pen));
  const awayWins = isFinished && !homeWins;

  return (
    <button onClick={onClick} style={{
      display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer',
      background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-s)',
      boxShadow: 'var(--shadow-sm)', overflow: 'hidden', padding: 0,
      transition: 'border-color .15s, box-shadow .15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}>
      {isLive && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px',
          background: '#E0383F', color: '#fff', fontSize: 9, fontWeight: 800, letterSpacing: '0.05em',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: 99, background: '#fff', animation: 'pulse-dot 1.2s infinite' }} />
          AO VIVO
        </div>
      )}
      <TeamRow name={match.home_team} slot={match.homeSlot} score={isFinished ? match.home_score : null} isWinnerSide={homeWins} finished={isFinished} />
      <div style={{ borderTop: '1px solid var(--line)' }} />
      <TeamRow name={match.away_team} slot={match.awaySlot} score={isFinished ? match.away_score : null} isWinnerSide={awayWins} finished={isFinished} />
      <div style={{ padding: '5px 10px', borderTop: '1px solid var(--line)', background: 'var(--card2)' }}>
        <span style={{ fontSize: 9, color: 'var(--t3)' }}>
          {format(parseISO(match.date), "d MMM", { locale: ptBR })} · {match.timeBRT} BRT
        </span>
      </div>
    </button>
  );
}

const STATUS_OPTIONS = [
  { id: 'scheduled', label: 'A confirmar' },
  { id: 'live', label: 'Ao vivo' },
  { id: 'finished', label: 'Finalizado' },
];

function MatchDetailModal({ match, isAdmin, onUpdate, onClose }) {
  const [homeTeam, setHomeTeam] = useState(match.home_team || '');
  const [awayTeam, setAwayTeam] = useState(match.away_team || '');
  const [homeScore, setHomeScore] = useState(match.home_score ?? '');
  const [awayScore, setAwayScore] = useState(match.away_score ?? '');
  const [status, setStatus] = useState(match.status || 'scheduled');

  const handleSave = () => {
    onUpdate(match.id, {
      home_team: homeTeam || null,
      away_team: awayTeam || null,
      home_score: homeScore === '' ? null : Number(homeScore),
      away_score: awayScore === '' ? null : Number(awayScore),
      status,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .18 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(5px)',
          zIndex: 101, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(12px,3vw,40px)',
        }}>
        <motion.div initial={{ opacity: 0, scale: .94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .94, y: 16 }}
          transition={{ duration: .22, ease: [.4, 0, .2, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--surface)', borderRadius: 'clamp(16px, 4vw, 24px)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-lg)',
            width: 'clamp(90%, 100%, 440px)', maxWidth: 'clamp(90%, 100%, 440px)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Trophy size={16} style={{ color: 'var(--green)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)' }}>Jogo {match.id}</div>
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>{KNOCKOUT_ROUNDS.find(r => r.id === match.round)?.label}</div>
            </div>
            <button onClick={onClose} style={{
              width: 30, height: 30, borderRadius: 8, border: '1px solid var(--line2)', background: 'var(--bg)',
              color: 'var(--t2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}><X size={14} /></button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, color: 'var(--t2)' }}>
              <MapPin size={12} />
              <span style={{ fontSize: 12 }}>{match.venue} · {format(parseISO(match.date), "d 'de' MMMM", { locale: ptBR })} · {match.timeBRT} BRT</span>
            </div>

            {!isAdmin ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <TeamRow name={match.home_team} slot={match.homeSlot} score={match.status === 'finished' ? match.home_score : null} />
                <TeamRow name={match.away_team} slot={match.awaySlot} score={match.status === 'finished' ? match.away_score : null} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{match.homeSlot}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input value={homeTeam} onChange={e => setHomeTeam(e.target.value)} placeholder="Nome da seleção"
                      style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line2)', background: 'var(--bg)', color: 'var(--t1)', fontSize: 13 }} />
                    {homeTeam && <Flag team={homeTeam} size="sm" />}
                  </div>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{match.awaySlot}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input value={awayTeam} onChange={e => setAwayTeam(e.target.value)} placeholder="Nome da seleção"
                      style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line2)', background: 'var(--bg)', color: 'var(--t1)', fontSize: 13 }} />
                    {awayTeam && <Flag team={awayTeam} size="sm" />}
                  </div>
                </label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)' }}>Placar casa</span>
                    <input type="number" value={homeScore} onChange={e => setHomeScore(e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line2)', background: 'var(--bg)', color: 'var(--t1)', fontSize: 13 }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)' }}>Placar fora</span>
                    <input type="number" value={awayScore} onChange={e => setAwayScore(e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line2)', background: 'var(--bg)', color: 'var(--t1)', fontSize: 13 }} />
                  </label>
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)' }}>Status</span>
                  <select value={status} onChange={e => setStatus(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line2)', background: 'var(--bg)', color: 'var(--t1)', fontSize: 13 }}>
                    {STATUS_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                </label>
              </div>
            )}
          </div>

          {isAdmin && (
            <div style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', background: 'var(--card)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleSave} style={{
                padding: '9px 18px', borderRadius: 'var(--radius-xs)', border: 'none', background: 'var(--green)',
                color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>Salvar</button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function KnockoutView({ knockoutMatches = [], isAdmin, onUpdate, syncStatus, onSyncNow }) {
  const rounds = useMemo(() => buildRounds(knockoutMatches), [knockoutMatches]);
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{
        marginBottom: 'clamp(24px, 4vw, 32px)', paddingBottom: 'clamp(16px, 3vw, 24px)', borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 'clamp(12px, 3vw, 24px)', flexWrap: 'wrap',
      }}>
        <div style={{ minWidth: 'min(100%, 280px)' }}>
          <h1 style={{
            fontFamily: 'var(--font-d)', fontSize: 'clamp(24px,5vw,36px)', fontWeight: 800,
            color: 'var(--t1)', letterSpacing: '0.02em', lineHeight: 1,
          }}>
            Mata-mata
          </h1>
          <p style={{ fontSize: 'clamp(12px, 2vw, 13px)', color: 'var(--t2)', marginTop: 6 }}>
            32 jogos · Rodada 32 → Oitavas → Quartas → Semifinal → Final · times e placares preenchidos automaticamente conforme os grupos terminam
          </p>
        </div>
        <SyncBadge syncStatus={syncStatus} onSyncNow={onSyncNow} isAdmin={isAdmin} />
      </div>

      {/* Bracket — horizontal scroll responsivo */}
      <div style={{
        display: 'flex', gap: 'clamp(12px, 2vw, 20px)', overflowX: 'auto',
        paddingBottom: 12,
      }}>
        {rounds.map(round => (
          <div key={round.id} style={{
            flex: '0 0 clamp(200px, 100%, 260px)',
            display: 'flex', flexDirection: 'column',
            minWidth: 'clamp(200px, 100%, 260px)',
          }}>
            <div style={{
              padding: '8px 12px', marginBottom: 14, borderRadius: 99, textAlign: 'center',
              background: 'var(--card2)', border: '1px solid var(--line)',
              fontSize: 11, fontWeight: 800, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {round.label}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: 16 }}>
              {round.matches.map(m => (
                <MatchBox key={m.id} match={m} onClick={() => setSelected(m)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <MatchDetailModal
          match={selected}
          isAdmin={isAdmin}
          onUpdate={onUpdate}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
