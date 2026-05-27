import { useRef, useEffect } from 'react';
import { format, parseISO, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { matches } from '../data/matches';

const DATES = [...new Set(matches.map(m => m.date))].sort();

export default function DateBar({ selectedDate, onSelect, events }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const selected = container.querySelector('[data-selected="true"]');
    if (selected) {
      const containerRect = container.getBoundingClientRect();
      const selectedRect = selected.getBoundingClientRect();
      const offset = selectedRect.left - containerRect.left - containerRect.width / 2 + selectedRect.width / 2;
      container.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }, [selectedDate]);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  const evCountByDate = {};
  Object.entries(events).forEach(([matchId, evs]) => {
    const match = matches.find(m => m.id === Number(matchId));
    if (match && evs.length) evCountByDate[match.date] = (evCountByDate[match.date] || 0) + evs.length;
  });

  const brasilDates = new Set(
    matches.filter(m => m.home === 'Brasil' || m.away === 'Brasil').map(m => m.date)
  );

  return (
    <div style={{
      position: 'relative',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--line)',
      display: 'flex',
      alignItems: 'stretch',
    }}>

      {/* Left arrow */}
      <button onClick={() => scroll(-1)}
        style={{
          flexShrink: 0, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: 'none', borderRight: '1px solid var(--line)',
          cursor: 'pointer', color: 'var(--t3)', transition: 'all .15s', zIndex: 2,
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.background = 'var(--green-bg)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--t3)'; e.currentTarget.style.background = 'transparent'; }}>
        <ChevronLeft size={15} />
      </button>

      {/* Scrollable strip — flex com itens que crescem para preencher a tela */}
      <div
        ref={scrollRef}
        className="no-scroll"
        style={{
          flex: 1,
          overflowX: 'auto',
          display: 'flex',
          alignItems: 'stretch',
          /* Cada item tem minWidth mas pode crescer — preenche tudo */
        }}>
        {DATES.map(date => {
          const p = parseISO(date);
          const sel = date === selectedDate;
          const today = isToday(p);
          const br = brasilDates.has(date);
          const ec = evCountByDate[date] || 0;
          const dayMatchCount = matches.filter(m => m.date === date).length;

          return (
            <button
              key={date}
              data-selected={sel}
              onClick={() => onSelect(date)}
              style={{
                /* Cresce igualmente para preencher 100% da largura visível */
                flex: '1 0 64px',
                minWidth: 64,
                maxWidth: 110,
                padding: '8px 2px 10px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 2,
                border: 'none',
                borderBottom: sel ? '2px solid var(--green)' : '2px solid transparent',
                background: sel
                  ? (br ? 'rgba(22,196,127,0.10)' : 'var(--green-bg)')
                  : 'transparent',
                cursor: 'pointer',
                transition: 'all .18s cubic-bezier(.4,0,.2,1)',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'var(--bg)'; }}
              onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent'; }}>

              {/* Dia da semana / HOJE */}
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.07em',
                textTransform: 'uppercase', lineHeight: 1,
                color: today ? 'var(--green)' : sel ? 'var(--green)' : 'var(--t3)',
              }}>
                {today ? 'HOJE' : format(p, 'EEE', { locale: ptBR })}
              </span>

              {/* Número do dia */}
              <span style={{
                fontFamily: 'var(--font-d)',
                fontSize: 'clamp(18px,2.4vw,26px)',
                fontWeight: 800, lineHeight: 1,
                color: sel ? 'var(--green)' : today ? 'var(--green)' : 'var(--t1)',
                transition: 'color .18s',
              }}>
                {format(p, 'd')}
              </span>

              {/* Mês */}
              <span style={{
                fontSize: 9,
                color: sel ? 'var(--green-dark)' : 'var(--t3)',
                fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1,
              }}>
                {format(p, 'MMM', { locale: ptBR })}
              </span>

              {/* Brasil flag OR jogos count */}
              {br ? (
                <span style={{
                  fontSize: 13, lineHeight: 1, marginTop: 2,
                  filter: sel ? 'none' : 'saturate(0.7)',
                  transition: 'filter .18s',
                }}>
                  🇧🇷
                </span>
              ) : (
                <span style={{
                  fontSize: 9, fontWeight: 600, marginTop: 2, lineHeight: 1,
                  color: sel ? 'var(--green)' : 'var(--t3)',
                }}>
                  {dayMatchCount}j
                </span>
              )}

              {/* Event badge */}
              {ec > 0 && (
                <span style={{
                  position: 'absolute', top: 6, right: 5,
                  width: 14, height: 14, borderRadius: 99,
                  background: 'var(--gold)', color: '#000',
                  fontSize: 8, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {ec}
                </span>
              )}

              {/* Today dot */}
              {today && (
                <span style={{
                  position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
                  width: 4, height: 4, borderRadius: 99, background: 'var(--green)',
                  animation: 'pulse-dot 2s infinite',
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Right arrow */}
      <button onClick={() => scroll(1)}
        style={{
          flexShrink: 0, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: 'none', borderLeft: '1px solid var(--line)',
          cursor: 'pointer', color: 'var(--t3)', transition: 'all .15s', zIndex: 2,
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.background = 'var(--green-bg)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--t3)'; e.currentTarget.style.background = 'transparent'; }}>
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
