import { useState } from 'react';
import { Megaphone, ChevronRight } from 'lucide-react';
import { promoTypes } from '../data/matches';
import Flag from './Flag';
import DayPromoDetailModal from './DayPromoDetailModal';

/* ─────────────────────────────────────────────────────────────
   FeaturedPromo — card de UMA promoção do dia em destaque
   onClick => abre modal de detalhe (não o drawer)
───────────────────────────────────────────────────────────── */
function FeaturedPromo({ promo, dayMatches, onOpenModal }) {
  const [hovered, setHovered] = useState(false);
  const type = promoTypes.find(t => t.id === promo.type);

  return (
    <div
      onClick={onOpenModal}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: '1 1 280px',
        minWidth: 0,
        background: 'var(--card)',
        borderRadius: 'var(--radius)',
        border: `1px solid var(--line)`,
        borderLeftWidth: 5,
        borderLeftColor: type?.color || 'var(--green)',
        borderLeftStyle: 'solid',
        boxShadow: hovered ? 'var(--shadow)' : 'var(--shadow-sm)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow .2s ease, transform .2s ease, border-color .2s',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

      {/* Conteúdo principal */}
      <div style={{ padding: 'clamp(12px,1.5vw,16px) clamp(14px,2vw,18px)', flex: 1 }}>

        {/* Chip do tipo */}
        <div style={{ marginBottom: 10 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
            background: type?.tint || 'var(--green-bg)', color: type?.color || 'var(--green-dark)',
          }}>
            <span style={{ fontSize: 13, lineHeight: 1 }}>{type?.icon}</span>
            {type?.label || 'Promoção'}
          </span>
        </div>

        {/* Título */}
        <div style={{
          fontFamily: 'var(--font-d)',
          fontSize: 'clamp(17px,2.2vw,22px)',
          fontWeight: 800, color: 'var(--t1)',
          lineHeight: 1.15, marginBottom: 6,
        }}>
          {promo.title}
        </div>

        {/* Descrição */}
        {promo.description && (
          <p style={{
            fontSize: 'clamp(11.5px,1.2vw,13px)',
            color: 'var(--t2)', lineHeight: 1.55,
            marginBottom: promo.rules ? 10 : 0,
          }}>
            {promo.description}
          </p>
        )}

        {/* Regras */}
        {promo.rules && (
          <div style={{
            padding: '6px 10px',
            background: 'var(--card2)',
            borderRadius: 8,
            fontSize: 'clamp(10.5px,1.1vw,12px)',
            color: 'var(--t3)', lineHeight: 1.5,
          }}>
            📜 {promo.rules}
          </div>
        )}
      </div>

      {/* Rodapé: bandeiras + CTA "Ver detalhes" */}
      <div style={{
        padding: 'clamp(8px,1vw,10px) clamp(14px,2vw,18px)',
        background: 'var(--green-bg)',
        borderTop: '1px solid var(--line)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12,
        flexWrap: 'wrap',
      }}>
        {/* Bandeiras */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minWidth: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-dark)', whiteSpace: 'nowrap' }}>
            Abrange {dayMatches.length} {dayMatches.length === 1 ? 'jogo' : 'jogos'}:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            {dayMatches.map(m => (
              <span key={m.id} style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
                <Flag team={m.home} size="sm" />
                <Flag team={m.away} size="sm" />
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          fontSize: 11, fontWeight: 700, color: 'var(--green-dark)',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          Ver detalhes <ChevronRight size={13} />
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DayPromoBanner — faixa completa que agrupa os cards
───────────────────────────────────────────────────────────── */
export default function DayPromoBanner({ promos, dayMatches, onDeletePromo }) {
  const [selectedPromo, setSelectedPromo] = useState(null);

  /* Sem promoções — não renderiza nada */
  if (!promos || promos.length === 0) return null;

  /* Com promoções — header + cards */
  const plural = promos.length > 1;

  return (
    <>
      <div style={{ marginBottom: 'clamp(16px,2.5vw,28px)' }}>

        {/* Cabeçalho da seção */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 'clamp(10px,1.2vw,14px)' }}>
          <Megaphone size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--t3)' }}>
            {plural ? 'Promoções do dia' : 'Promoção do dia'}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99, background: 'var(--green)', color: '#fff' }}>
            {promos.length}/2
          </span>
        </div>

        {/* Cards lado a lado (flex-wrap) */}
        <div style={{ display: 'flex', gap: 'clamp(10px,1.5vw,16px)', flexWrap: 'wrap', alignItems: 'stretch' }}>
          {promos.map(p => (
            <FeaturedPromo
              key={p.id}
              promo={p}
              dayMatches={dayMatches}
              onOpenModal={() => setSelectedPromo(p)}
            />
          ))}
        </div>
      </div>

      {/* Modal de detalhe — abre ao clicar no card */}
      {selectedPromo && (
        <DayPromoDetailModal
          promo={selectedPromo}
          dayMatches={dayMatches}
          onClose={() => setSelectedPromo(null)}
          onDelete={() => {
            onDeletePromo?.(selectedPromo.id);
            setSelectedPromo(null);
          }}
        />
      )}
    </>
  );
}
