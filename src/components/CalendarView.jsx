import { useMemo, useState } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, ListOrdered } from 'lucide-react';
import { matches, groups } from '../data/matches';
import Flag from './Flag';

/* ── helpers ─────────────────────────────────────────────── */
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function groupByDate() {
  const map = {};
  matches.forEach(m => {
    if (!map[m.date]) map[m.date] = [];
    map[m.date].push(m);
  });
  Object.keys(map).forEach(d => map[d].sort((a, b) => a.timeBRT.localeCompare(b.timeBRT)));
  return map;
}

function getMonths() {
  const dates = [...new Set(matches.map(m => m.date))].sort();
  const months = [];
  let cur = null;
  dates.forEach(d => {
    const key = d.slice(0, 7); // 'YYYY-MM'
    if (key !== cur) { months.push(key); cur = key; }
  });
  return months;
}

/* ── chip mini de jogo na grade do mês ─────────────────────── */
function MatchChip({ match }) {
  const gc = groups[match.group]?.color || '#888';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 3,
      fontSize: 9, lineHeight: 1.2, overflow: 'hidden',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: gc, flexShrink: 0,
      }} />
      <span style={{ color: 'var(--t3)', flexShrink: 0 }}>{match.timeBRT}</span>
      <span style={{ color: 'var(--t2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {match.home.split(' ')[0]}×{match.away.split(' ')[0]}
      </span>
    </div>
  );
}

/* ── célula de um dia na grade ─────────────────────────────── */
function DayCell({ dateStr, dayNum, inMonth, isToday, isSelected, dayMatches, promoCount, onPick }) {
  const [hov, setHov] = useState(false);
  const hasMatches = dayMatches && dayMatches.length > 0;
  const clickable = inMonth && hasMatches;
  const visible = inMonth;
  const MAX = 3;
  const shown = dayMatches ? dayMatches.slice(0, MAX) : [];
  const extra = dayMatches ? dayMatches.length - MAX : 0;

  return (
    <div
      onClick={() => clickable && onPick(dateStr)}
      onMouseEnter={() => setHov(clickable)}
      onMouseLeave={() => setHov(false)}
      style={{
        minHeight: 80,
        padding: '6px 7px',
        borderRadius: 10,
        border: isSelected ? '1.5px solid var(--green)' : '1px solid transparent',
        background: isSelected
          ? 'var(--green-bg)'
          : hov ? 'var(--green-bg)'
          : isToday ? 'rgba(22,196,127,0.06)'
          : 'transparent',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'background .15s, border-color .15s',
        position: 'relative',
        display: 'flex', flexDirection: 'column', gap: 3,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}>

      {/* Número do dia */}
      <div style={{
        fontFamily: 'var(--font-d)',
        fontSize: 15, fontWeight: 800, lineHeight: 1,
        color: isToday ? '#fff' : hasMatches && inMonth ? 'var(--t1)' : 'var(--t3)',
        width: 22, height: 22, borderRadius: '50%',
        background: isToday ? 'var(--green)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {dayNum}
      </div>

      {/* Chips de jogos */}
      {shown.map(m => <MatchChip key={m.id} match={m} />)}
      {extra > 0 && (
        <div style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600 }}>
          +{extra} jogos
        </div>
      )}

      {/* Badge promoção do dia */}
      {promoCount > 0 && inMonth && (
        <div title={`${promoCount} promoção${promoCount > 1 ? 'ões' : ''} do dia`} style={{
          position: 'absolute', top: 5, right: 5,
          width: 16, height: 16, borderRadius: '50%',
          background: 'var(--green)', color: '#fff',
          fontSize: 8, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 0 2px var(--surface)',
        }}>
          {promoCount}
        </div>
      )}
    </div>
  );
}

/* ── Grade de um mês ────────────────────────────────────────── */
function MonthGrid({ monthKey, byDate, dayPromoCounts, selectedDate, today, onPick }) {
  const firstDay = parseISO(`${monthKey}-01`);
  const monthStart = startOfMonth(firstDay);
  const monthEnd = endOfMonth(firstDay);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // domingo

  // Gera células até completar a última semana
  const cells = [];
  let cur = gridStart;
  while (cur <= monthEnd || cells.length % 7 !== 0) {
    cells.push(new Date(cur));
    cur = addDays(cur, 1);
    if (cells.length > 42) break; // max 6 semanas
  }

  const label = format(firstDay, "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div style={{ marginBottom: 40 }}>
      {/* Cabeçalho do mês */}
      <div style={{
        fontFamily: 'var(--font-d)',
        fontSize: 'clamp(16px,2vw,20px)',
        fontWeight: 800, color: 'var(--t1)',
        textTransform: 'capitalize',
        marginBottom: 12, letterSpacing: '0.01em',
      }}>
        {label}
      </div>

      {/* Dias da semana */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 4, marginBottom: 4,
      }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 10, fontWeight: 700,
            color: 'var(--t3)', textTransform: 'uppercase',
            letterSpacing: '0.06em', padding: '4px 0',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Células dos dias */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((cellDate, i) => {
          const dateStr = format(cellDate, 'yyyy-MM-dd');
          const inM = isSameMonth(cellDate, firstDay);
          return (
            <DayCell
              key={i}
              dateStr={dateStr}
              dayNum={cellDate.getDate()}
              inMonth={inM}
              isToday={dateStr === today}
              isSelected={dateStr === selectedDate}
              dayMatches={inM ? (byDate[dateStr] || []) : []}
              promoCount={inM ? (dayPromoCounts[dateStr] || 0) : 0}
              onPick={onPick}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ── Linha de jogo na visão por rodada ─────────────────────── */
function RoundRow({ match, promoCount, onPick }) {
  const [hov, setHov] = useState(false);
  const gc = groups[match.group]?.color || '#888';
  const dateLabel = format(parseISO(match.date), "d MMM", { locale: ptBR });

  return (
    <div
      onClick={() => onPick(match.date)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: 'clamp(8px,2vw,20px)',
        padding: 'clamp(10px,1.5vw,14px) clamp(12px,2vw,20px)',
        borderRadius: 12,
        background: hov ? 'var(--green-bg)' : 'transparent',
        cursor: 'pointer',
        transition: 'background .15s',
      }}>

      {/* Esquerda: hora + data */}
      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 54 }}>
        <div style={{
          fontFamily: 'var(--font-d)', fontSize: 'clamp(15px,1.8vw,19px)',
          fontWeight: 800, color: 'var(--t1)', lineHeight: 1,
        }}>
          {match.timeBRT}
        </div>
        <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600, textTransform: 'capitalize', marginTop: 2 }}>
          {dateLabel}
        </div>
      </div>

      {/* Centro: times */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 'clamp(6px,1.2vw,14px)', minWidth: 0,
      }}>
        <span style={{
          fontSize: 'clamp(11px,1.3vw,13px)', fontWeight: 700, color: 'var(--t1)',
          textAlign: 'right', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {match.home}
        </span>
        <Flag team={match.home} size="sm" />
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', flexShrink: 0 }}>VS</span>
        <Flag team={match.away} size="sm" />
        <span style={{
          fontSize: 'clamp(11px,1.3vw,13px)', fontWeight: 700, color: 'var(--t1)',
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {match.away}
        </span>
      </div>

      {/* Direita: promoção + grupo + estádio */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, justifyContent: 'flex-end',
      }}>
        {promoCount > 0 && (
          <span title="Promoção do dia" style={{
            fontSize: 12, lineHeight: 1,
          }}>🎯</span>
        )}
        <span style={{
          fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 99,
          background: gc, color: '#fff', letterSpacing: '0.05em',
        }}>
          {match.group}
        </span>
        <span className="venue-label" style={{
          fontSize: 10, color: 'var(--t3)', fontWeight: 500, whiteSpace: 'nowrap',
          maxWidth: 'clamp(0px,12vw,120px)', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {match.venue}
        </span>
      </div>
    </div>
  );
}

/* ── Visão por rodada ────────────────────────────────────────── */
function RoundView({ dayPromoCounts, onPick }) {
  const rounds = useMemo(() => {
    const map = {};
    matches.forEach(m => {
      if (!map[m.matchday]) map[m.matchday] = [];
      map[m.matchday].push(m);
    });
    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([day, ms]) => {
        const sorted = [...ms].sort((a, b) =>
          a.date.localeCompare(b.date) || a.timeBRT.localeCompare(b.timeBRT)
        );
        const dates = sorted.map(m => m.date).sort();
        const first = format(parseISO(dates[0]), "d MMM", { locale: ptBR });
        const last = format(parseISO(dates[dates.length - 1]), "d MMM", { locale: ptBR });
        return { matchday: Number(day), matches: sorted, first, last };
      });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {rounds.map(({ matchday, matches: ms, first, last }) => (
        <div key={matchday} style={{
          background: 'var(--card)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Cabeçalho da rodada */}
          <div style={{
            padding: 'clamp(12px,1.5vw,16px) clamp(16px,2vw,24px)',
            borderBottom: '1px solid var(--line)',
            background: 'var(--card2)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'var(--green)', color: '#fff',
              fontFamily: 'var(--font-d)', fontSize: 17, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {matchday}
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-d)', fontSize: 'clamp(14px,1.8vw,17px)',
                fontWeight: 800, color: 'var(--t1)', lineHeight: 1,
              }}>
                Rodada {matchday}
              </div>
              <div style={{
                fontSize: 11, color: 'var(--t3)', marginTop: 3,
                textTransform: 'capitalize',
              }}>
                {first} – {last} · {ms.length} {ms.length === 1 ? 'jogo' : 'jogos'}
              </div>
            </div>
          </div>

          {/* Jogos */}
          <div style={{ padding: 'clamp(4px,0.5vw,8px) clamp(4px,0.5vw,8px)' }}>
            {ms.map((m, i) => (
              <div key={m.id}>
                <RoundRow
                  match={m}
                  promoCount={dayPromoCounts[m.date] || 0}
                  onPick={onPick}
                />
                {i < ms.length - 1 && (
                  <div style={{ height: 1, background: 'var(--line)', margin: '0 clamp(12px,2vw,20px)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Toggle segmentado ──────────────────────────────────────── */
function ModeToggle({ mode, onChange }) {
  const opts = [
    { id: 'month', label: 'Mês', icon: <CalendarDays size={13} /> },
    { id: 'round', label: 'Por rodada', icon: <ListOrdered size={13} /> },
  ];
  return (
    <div style={{
      display: 'flex', gap: 2, padding: 3,
      background: 'var(--bg)', borderRadius: 'var(--radius-s)',
      border: '1px solid var(--line)', flexShrink: 0,
    }}>
      {opts.map(o => {
        const active = mode === o.id;
        return (
          <button key={o.id} onClick={() => onChange(o.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: 'clamp(5px,0.8vw,7px) clamp(10px,1.2vw,14px)',
              borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 'clamp(11px,1.1vw,13px)', fontWeight: active ? 600 : 500,
              background: active ? 'var(--surface)' : 'transparent',
              color: active ? 'var(--green)' : 'var(--t2)',
              boxShadow: active ? 'var(--shadow-sm)' : 'none',
              transition: 'all .18s cubic-bezier(.4,0,.2,1)',
            }}>
            {o.icon} {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Componente principal ───────────────────────────────────── */
export default function CalendarView({ dayPromoCounts = {}, selectedDate, today, onPick }) {
  const [mode, setMode] = useState('month');
  const byDate = useMemo(() => groupByDate(), []);
  const monthKeys = useMemo(() => getMonths(), []);
  const totalMatches = matches.length;

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto' }}>

      {/* Cabeçalho */}
      <div style={{
        marginBottom: 32, paddingBottom: 24,
        borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-d)',
            fontSize: 'clamp(24px,4vw,36px)',
            fontWeight: 800, color: 'var(--t1)',
            letterSpacing: '0.02em', lineHeight: 1,
          }}>
            Calendário da Copa
          </h1>
          <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 6 }}>
            {totalMatches} jogos · clique em qualquer data para ver os jogos e promoções
          </p>
        </div>
        <ModeToggle mode={mode} onChange={setMode} />
      </div>

      {/* Visão Mês */}
      {mode === 'month' && (
        <div>
          {monthKeys.map(mk => (
            <MonthGrid
              key={mk}
              monthKey={mk}
              byDate={byDate}
              dayPromoCounts={dayPromoCounts}
              selectedDate={selectedDate}
              today={today}
              onPick={onPick}
            />
          ))}
        </div>
      )}

      {/* Visão Por Rodada */}
      {mode === 'round' && (
        <RoundView
          dayPromoCounts={dayPromoCounts}
          onPick={onPick}
        />
      )}
    </div>
  );
}
