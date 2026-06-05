import { useMemo } from 'react';
import { useAltenarBoosts } from '../hooks/useAltenarBoosts';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';
import { matches } from '../data/matches';
import MatchCard from './MatchCard';
import DayPromoBanner from './DayPromoBanner';

function BoostSummaryCard({ detailsByTimeBRT, dayMatches, loading }) {
  const allBoosts = useMemo(() => {
    const result = [];
    for (const m of dayMatches) {
      const entry = detailsByTimeBRT.get(m.timeBRT);
      if (!entry) continue;
      const { boosts, markets, oddsMap } = entry;
      for (const boost of boosts) {
        // Para cada seleção do boost, resolver nome do mercado e da seleção
        const labels = (boost.odds ?? []).map(o => ({
          market: markets?.get(o.marketId) ?? '',
          selection: oddsMap?.get(o.selectionId) ?? '',
        }));
        result.push({ boost, match: m, labels });
      }
    }
    return result;
  }, [detailsByTimeBRT, dayMatches]);

  if (loading) return (
    <div style={{
      marginTop: 12, maxWidth: 480,
      borderRadius: 'var(--radius)',
      border: '1px solid rgba(249,115,22,0.20)',
      background: 'rgba(249,115,22,0.04)',
      padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{ fontSize: 18 }}>⚡</span>
      <span style={{ fontSize: 13, color: 'var(--t2)', fontWeight: 500 }}>Buscando boosted odds na Altenar…</span>
    </div>
  );

  if (allBoosts.length === 0) return null;

  return (
    <div style={{
      marginTop: 12, maxWidth: 480,
      borderRadius: 'var(--radius)',
      border: '1px solid rgba(249,115,22,0.25)',
      background: 'var(--card)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 18px',
        background: 'linear-gradient(90deg, rgba(249,115,22,0.10) 0%, rgba(251,191,36,0.07) 100%)',
        borderBottom: '1px solid rgba(249,115,22,0.15)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 16 }}>🔥</span>
        <div>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#f97316' }}>Boosted Odds do Dia</p>
          <p style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1 }}>
            {allBoosts.length} boost{allBoosts.length > 1 ? 's' : ''} disponíve{allBoosts.length > 1 ? 'is' : 'l'} via Altenar
          </p>
        </div>
      </div>

      {/* Lista */}
      {allBoosts.map(({ boost, match, labels }, i) => {
        const isLast = i === allBoosts.length - 1;
        const pct = boost.boostInfo?.price && boost.price
          ? (((boost.boostInfo.price - boost.price) / boost.price) * 100).toFixed(0)
          : null;

        return (
          <div key={boost.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 18px',
            borderBottom: isLast ? 'none' : '1px solid var(--line)',
          }}>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span style={{
                  fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 4,
                  background: boost.isBB ? 'rgba(99,102,241,0.10)' : 'rgba(249,115,22,0.10)',
                  color: boost.isBB ? '#6366f1' : '#f97316',
                  border: `1px solid ${boost.isBB ? 'rgba(99,102,241,0.20)' : 'rgba(249,115,22,0.20)'}`,
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>
                  {boost.isBB ? 'Bet Builder' : 'Odd Boost'}
                </span>
                <span style={{ fontSize: 10, color: 'var(--t3)' }}>{match.timeBRT} BRT</span>
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', marginBottom: 3 }}>
                {match.home} vs. {match.away}
              </p>
              {labels.map((l, li) => l.market && (
                <p key={li} style={{ fontSize: 10, color: 'var(--t3)', lineHeight: 1.4 }}>
                  {l.market}{l.selection ? ` · ${l.selection}` : ''}
                </p>
              ))}
              {boost.boostInfo?.betsLimit && (
                <p style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>
                  Limite: {boost.boostInfo.betsLimit} aposta{boost.boostInfo.betsLimit > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Odds */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t3)', textDecoration: 'line-through' }}>
                {boost.price?.toFixed(2)}
              </span>
              <span style={{ fontSize: 10, color: 'var(--t3)' }}>→</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#f97316', fontFamily: 'var(--font-d)' }}>
                {boost.boostInfo?.price?.toFixed(2)}
              </span>
              {pct && (
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 5,
                  background: 'rgba(22,196,127,0.12)', color: '#16C47F',
                  border: '1px solid rgba(22,196,127,0.25)',
                }}>+{pct}%</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DayView({ selectedDate, events, onAdd, onDelete, onUpdate, dayPromoActive, onOpenDayPromo, promos = [], onDeleteDayPromo, onUpdateDayPromo, favorites, onToggleFavorite, isAdmin }) {
  const { detailsByTimeBRT, boostsByTimeBRT, loading: boostsLoading } = useAltenarBoosts(selectedDate);

  // Ordenação: madrugada (01/02h) vem ANTES dos demais
  const dayMatches = useMemo(() =>
    matches
      .filter(m => m.date === selectedDate)
      .sort((a, b) => {
        const ta = parseInt(a.timeBRT);
        const tb = parseInt(b.timeBRT);
        // 01/02h (<=4) mapeados para -1 para virem primeiro
        const na = ta <= 4 ? ta - 10 : ta;
        const nb = tb <= 4 ? tb - 10 : tb;
        return na - nb;
      }),
    [selectedDate]
  );

  const totalEvs = dayMatches.reduce((a, m) => a + (events[m.id]?.length || 0), 0);
  const hasBrasil = dayMatches.some(m => m.home === 'Brasil' || m.away === 'Brasil');

  if (!selectedDate) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 320, color: 'var(--t3)', gap: 16 }}>
      <span style={{ fontSize: 52 }}>📅</span>
      <p style={{ fontSize: 15, color: 'var(--t2)' }}>Selecione um dia na barra acima</p>
    </div>
  );

  const labelFull = format(parseISO(selectedDate), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div>
      {/* Day header */}
      <div style={{ marginBottom: 'clamp(16px,2.5vw,28px)', display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
            <h1 style={{
              fontFamily: 'var(--font-d)',
              fontSize: 'clamp(20px,3.5vw,34px)',
              fontWeight: 800, color: 'var(--t1)',
              textTransform: 'capitalize', lineHeight: 1,
              letterSpacing: '0.01em',
            }}>
              {labelFull}
            </h1>
            {hasBrasil && (
              <span style={{
                fontSize: 'clamp(18px,2.5vw,24px)',
                lineHeight: 1,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
              }}>🇧🇷</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--t2)' }}>
              <CalendarDays size={13} />
              <span style={{ fontSize: 13 }}>
                {dayMatches.length} {dayMatches.length === 1 ? 'jogo programado' : 'jogos programados'}
              </span>
            </div>
            {totalEvs > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 99,
                background: 'var(--gold-bg)', color: 'var(--gold)',
                border: '1px solid var(--gold-line)',
              }}>
                ⚡ {totalEvs} evento{totalEvs > 1 ? 's' : ''} cadastrado{totalEvs > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Banner de promoções do dia */}
      <DayPromoBanner
        promos={promos}
        dayMatches={dayMatches}
        onDeletePromo={onDeleteDayPromo}
        onUpdatePromo={onUpdateDayPromo}
        isAdmin={isAdmin}
      />

      {/* Cards — grid direto, sem agrupamento por período */}
      {dayMatches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--t3)' }}>
          <p style={{ fontSize: 15 }}>Sem jogos neste dia.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: 'clamp(10px,1.5vw,18px)',
          gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(260px,28vw,340px), 1fr))',
          alignItems: 'start',
        }}>
          {dayMatches.map((m, i) => (
            <motion.div key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * .04, duration: .2 }}
              style={{ display: 'flex', flexDirection: 'column' }}>
              <MatchCard
                match={m}
                events={events[m.id] || []}
                onAdd={onAdd} onDelete={onDelete} onUpdate={onUpdate}
                dayPromoActive={dayPromoActive}
                onOpenDayPromo={onOpenDayPromo}
                isFav={favorites ? favorites.has(m.id) : false}
                onToggleFavorite={onToggleFavorite}
                isAdmin={isAdmin}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Bottom banner */}
      <div style={{
        marginTop: 'clamp(28px,4vw,52px)',
        borderRadius: 'var(--radius)',
        background: 'linear-gradient(135deg, #16C47F 0%, #0b8a56 100%)',
        padding: 'clamp(14px,2vw,22px) clamp(18px,2.5vw,30px)',
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: 'var(--shadow-green)',
      }}>
        <span style={{ fontSize: 26 }}>🏆</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 'clamp(12px,1.4vw,14px)', fontWeight: 700, color: '#fff', marginBottom: 2 }}>
            Todos os jogos. Todas as emoções.
          </p>
          <p style={{ fontSize: 'clamp(10px,1.1vw,12px)', color: 'rgba(255,255,255,0.75)' }}>
            Acompanhe cada partida da Copa 2026 e gerencie suas promoções.
          </p>
        </div>
      </div>

      {/* Card de boosted odds do dia */}
      <BoostSummaryCard
        detailsByTimeBRT={detailsByTimeBRT}
        dayMatches={dayMatches}
        loading={boostsLoading}
      />
    </div>
  );
}