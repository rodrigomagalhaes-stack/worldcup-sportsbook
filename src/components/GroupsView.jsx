import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { matches, groups } from '../data/matches';
import Flag from './Flag';

/* ─────────────────────────────────────────
   Deriva a estrutura de grupo a partir dos matches.
   Retorna: { A: { color, teams, standings, fixtures }, ... }
───────────────────────────────────────── */
function deriveGroups() {
  const ORDER = Object.keys(groups); // A..L em ordem
  const data = {};

  ORDER.forEach(g => {
    const gc = matches.filter(m => m.group === g)
      .sort((a, b) =>
        a.matchday - b.matchday ||
        a.date.localeCompare(b.date) ||
        a.timeBRT.localeCompare(b.timeBRT)
      );

    // Teams: ordem de primeira aparição
    const teamSet = [];
    const seen = new Set();
    gc.forEach(m => {
      [m.home, m.away].forEach(t => {
        if (!seen.has(t)) { seen.add(t); teamSet.push(t); }
      });
    });

    // Standings: estrutura zerada, pronta para receber scores no futuro
    const standings = teamSet.map(name => ({
      name, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0,
    }));
    // Se algum match tiver score, calcula pontos (hook futuro)
    gc.forEach(m => {
      if (m.score) {
        const [hg, ag] = m.score.split('-').map(Number);
        const hIdx = standings.findIndex(s => s.name === m.home);
        const aIdx = standings.findIndex(s => s.name === m.away);
        if (hIdx < 0 || aIdx < 0) return;
        standings[hIdx].P++;
        standings[aIdx].P++;
        standings[hIdx].GF += hg; standings[hIdx].GA += ag;
        standings[aIdx].GF += ag; standings[aIdx].GA += hg;
        if (hg > ag) { standings[hIdx].W++; standings[aIdx].L++; }
        else if (hg < ag) { standings[aIdx].W++; standings[hIdx].L++; }
        else { standings[hIdx].D++; standings[aIdx].D++; }
      }
    });

    // Classifica por: Pts → GD → GF → nome
    const withPts = standings
      .map(s => ({ ...s, Pts: s.W * 3 + s.D, GD: s.GF - s.GA }))
      .sort((a, b) =>
        b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF || a.name.localeCompare(b.name)
      );

    data[g] = { color: groups[g].color, teams: teamSet, standings: withPts, fixtures: gc };
  });

  return data;
}

/* ─────────────────────────────────────────
   Tabela de classificação de um grupo
───────────────────────────────────────── */
function StandingTable({ standings, color }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--line)' }}>
          <th style={{ width: 20, padding: '4px 4px 4px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--t3)', letterSpacing: '0.05em' }}>#</th>
          <th style={{ padding: '4px 6px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--t3)', letterSpacing: '0.05em' }}>Time</th>
          <th style={{ padding: '4px 4px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--t3)', letterSpacing: '0.05em' }}>J</th>
          <th className="hide-mobile" style={{ padding: '4px 4px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--t3)', letterSpacing: '0.05em' }}>V</th>
          <th className="hide-mobile" style={{ padding: '4px 4px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--t3)', letterSpacing: '0.05em' }}>E</th>
          <th className="hide-mobile" style={{ padding: '4px 4px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--t3)', letterSpacing: '0.05em' }}>D</th>
          <th style={{ padding: '4px 10px 4px 4px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--t3)', letterSpacing: '0.05em' }}>Pts</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((s, i) => {
          const qualified = i < 2;
          return (
            <tr key={s.name} style={{
              background: qualified ? `${color}0D` : 'transparent',
              borderLeft: qualified ? `3px solid ${color}` : '3px solid transparent',
              transition: 'background .12s',
            }}>
              <td style={{ padding: '7px 4px 7px 8px', fontWeight: 700, fontSize: 11, color: qualified ? color : 'var(--t3)', fontVariantNumeric: 'tabular-nums' }}>
                {i + 1}
              </td>
              <td style={{ padding: '5px 6px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Flag team={s.name} size="sm" />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>
                  {s.name}
                </span>
              </td>
              <td style={{ padding: '7px 4px', textAlign: 'center', fontSize: 12, color: 'var(--t2)', fontVariantNumeric: 'tabular-nums' }}>{s.P}</td>
              <td className="hide-mobile" style={{ padding: '7px 4px', textAlign: 'center', fontSize: 12, color: 'var(--t2)', fontVariantNumeric: 'tabular-nums' }}>{s.W}</td>
              <td className="hide-mobile" style={{ padding: '7px 4px', textAlign: 'center', fontSize: 12, color: 'var(--t2)', fontVariantNumeric: 'tabular-nums' }}>{s.D}</td>
              <td className="hide-mobile" style={{ padding: '7px 4px', textAlign: 'center', fontSize: 12, color: 'var(--t2)', fontVariantNumeric: 'tabular-nums' }}>{s.L}</td>
              <td style={{ padding: '7px 10px 7px 4px', textAlign: 'center', fontSize: 13, fontWeight: 800, color: 'var(--t1)', fontVariantNumeric: 'tabular-nums' }}>{s.Pts}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ─────────────────────────────────────────
   Linha de fixture dentro de um card de grupo
───────────────────────────────────────── */
function FixtureRow({ match, promoCount, onPick }) {
  const [hov, setHov] = useState(false);
  const dateLabel = format(parseISO(match.date), "d MMM", { locale: ptBR });

  return (
    <div
      onClick={() => onPick(match.date)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center',
        gap: 10, padding: '7px 14px',
        background: hov ? 'var(--green-bg)' : 'transparent',
        cursor: 'pointer', transition: 'background .13s',
      }}>

      {/* Rodada + data/hora */}
      <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 58 }}>
        <span style={{
          fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 4,
          background: 'var(--card2)', color: 'var(--t3)', letterSpacing: '0.04em',
          display: 'inline-block', marginBottom: 2,
        }}>
          R{match.matchday}
        </span>
        <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
          {dateLabel} {match.timeBRT}
        </div>
      </div>

      {/* Times */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 8, minWidth: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, justifyContent: 'flex-end', minWidth: 0 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {match.home}
          </span>
          <Flag team={match.home} size="sm" />
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', flexShrink: 0 }}>VS</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, justifyContent: 'flex-start', minWidth: 0 }}>
          <Flag team={match.away} size="sm" />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {match.away}
          </span>
        </div>
      </div>

      {/* Badge promoção */}
      <div style={{ flexShrink: 0, width: 16, textAlign: 'center' }}>
        {promoCount > 0 && (
          <span title={`${promoCount} promoção(ões) do dia`} style={{ fontSize: 12, lineHeight: 1 }}>🎯</span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Card completo de um grupo
───────────────────────────────────────── */
function GroupCard({ letter, data, dayPromoCounts, onPick }) {
  const [showAll, setShowAll] = useState(false);
  const MAX_FIXTURES = 3;
  const visibleFixtures = showAll ? data.fixtures : data.fixtures.slice(0, MAX_FIXTURES);
  const hasMore = data.fixtures.length > MAX_FIXTURES;

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* Cabeçalho do card */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px',
        borderBottom: '1px solid var(--line)',
        background: 'var(--card2)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: data.color, color: '#fff',
          fontFamily: 'var(--font-d)', fontSize: 20, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 2px 8px ${data.color}40`,
        }}>
          {letter}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-d)', fontSize: 16, fontWeight: 800, color: 'var(--t1)', lineHeight: 1 }}>
            Grupo {letter}
          </div>
          <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>
            {data.teams.length} seleções · {data.fixtures.length} jogos
          </div>
        </div>
      </div>

      {/* Tabela de classificação */}
      <div style={{ borderBottom: '1px solid var(--line)' }}>
        <StandingTable standings={data.standings} color={data.color} />
      </div>

      {/* Legenda: classificados */}
      <div style={{ padding: '5px 14px 2px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: data.color, opacity: 0.7 }} />
        <span style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600 }}>Classificados (Top 2)</span>
      </div>

      {/* Fixtures */}
      <div style={{ flex: 1 }}>
        <div style={{
          padding: '8px 14px 4px',
          fontSize: 9, fontWeight: 700, color: 'var(--t3)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          Jogos
        </div>
        {visibleFixtures.map(m => (
          <FixtureRow
            key={m.id}
            match={m}
            promoCount={dayPromoCounts[m.date] || 0}
            onPick={onPick}
          />
        ))}
        {hasMore && (
          <button
            onClick={() => setShowAll(p => !p)}
            style={{
              display: 'block', width: '100%', padding: '8px',
              border: 'none', background: 'transparent',
              fontSize: 11, fontWeight: 600, color: 'var(--green-dark)',
              cursor: 'pointer', textAlign: 'center',
              transition: 'background .13s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--green-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {showAll ? '▲ Ocultar jogos' : `▼ Ver todos os ${data.fixtures.length} jogos`}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Componente principal
───────────────────────────────────────── */
export default function GroupsView({ dayPromoCounts = {}, onPick }) {
  const groupData = useMemo(() => deriveGroups(), []);
  const totalTeams = useMemo(() => {
    const s = new Set();
    matches.forEach(m => { s.add(m.home); s.add(m.away); });
    return s.size;
  }, []);

  return (
    <>
      {/* CSS responsivo inline */}
      <style>{`
        @media (max-width: 520px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Cabeçalho */}
        <div style={{
          marginBottom: 32, paddingBottom: 24,
          borderBottom: '1px solid var(--line)',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-d)',
            fontSize: 'clamp(24px,4vw,36px)',
            fontWeight: 800, color: 'var(--t1)',
            letterSpacing: '0.02em', lineHeight: 1,
          }}>
            Fase de Grupos
          </h1>
          <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 6 }}>
            {Object.keys(groupData).length} grupos · {totalTeams} seleções
          </p>
        </div>

        {/* Grade de cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
          gap: 'clamp(14px,2vw,24px)',
        }}>
          {Object.entries(groupData).map(([letter, data]) => (
            <GroupCard
              key={letter}
              letter={letter}
              data={data}
              dayPromoCounts={dayPromoCounts}
              onPick={onPick}
            />
          ))}
        </div>
      </div>
    </>
  );
}
