import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';
import { matches } from '../data/matches';
import MatchCard from './MatchCard';
import DayPromoBanner from './DayPromoBanner';

export default function DayView({ selectedDate, events, onAdd, onDelete, onUpdate, dayPromoActive, onOpenDayPromo, promos = [], onDeleteDayPromo, onUpdateDayPromo, favorites, onToggleFavorite }) {
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(170px,20vw,215px), 1fr))',
        }}>
          {dayMatches.map((m, i) => (
            <motion.div key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * .04, duration: .2 }}>
              <MatchCard
                match={m}
                events={events[m.id] || []}
                onAdd={onAdd} onDelete={onDelete} onUpdate={onUpdate}
                dayPromoActive={dayPromoActive}
                onOpenDayPromo={onOpenDayPromo}
                isFav={favorites ? favorites.has(m.id) : false}
                onToggleFavorite={onToggleFavorite}
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
    </div>
  );
}
