import { useState } from 'react';
import { Megaphone, Plus, ChevronRight } from 'lucide-react';
import { promoTypes } from '../data/matches';
import Flag from './Flag';

/* ─────────────────────────────────────────────────────────────
   FeaturedPromo — card de UMA promoção do dia em destaque
───────────────────────────────────────────────────────────── */
function FeaturedPromo({ promo, dayMatches, onOpen }) {
  const [hovered, setHovered] = useState(false);
  const type = promoTypes.find(t => t.id === promo.type);

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: '1 1 280px',
        minWidth: 0,
        background: 'var(--card)',
        borderRadius: 'var(--radius)',
        borderLeft: `5px solid ${type?.color || 'var(--green)'}`,
        border: `1px solid var(--line)`,
        borderLeftWidth: 5,
        borderLeftColor: type?.color || 'var(--green)',
        boxShadow: hovered ? 'var(--shadow)' : 'var(--shadow-sm)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow .2s ease, transform .2s ease',
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

      {/* Rodapé: bandeiras + CTA */}
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
          Gerenciar <ChevronRight size={13} />
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DayPromoBanner — faixa completa que agrupa os cards
───────────────────────────────────────────────────────────── */
export default function DayPromoBanner({ promos, dayMatches, onOpen }) {
  /* Estado vazio — faixa tracejada */
  if (!promos || promos.length === 0) {
    return (
      <div
        onClick={onOpen}
        style={{
          marginBottom: 'clamp(16px,2.5vw,28px)',
          padding: 'clamp(16px,2.5vw,22px) clamp(18px,3vw,28px)',
          borderRadius: 'var(--radius)',
          border: '2px dashed var(--line2)',
          background: 'var(--card2)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center',
          gap: 'clamp(12px,2vw,20px)',
          flexWrap: 'wrap',
          transition: 'border-color .15s, background .15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--green)';
          e.currentTarget.style.background = 'var(--green-bg)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--line2)';
          e.currentTarget.style.background = 'var(--card2)';
        }}>

        <span style={{ fontSize: 'clamp(28px,4vw,36px)', lineHeight: 1, flexShrink: 0 }}>🎯</span>

        <div style={{ flex: 1, minWidth: 180 }}>
          <p style={{
            fontSize: 'clamp(13px,1.4vw,15px)', fontWeight: 700,
            color: 'var(--t1)', marginBottom: 3,
          }}>
            Nenhuma promoção do dia ainda
          </p>
          <p style={{ fontSize: 'clamp(11px,1.1vw,12.5px)', color: 'var(--t3)' }}>
            Crie uma promoção que vale para os{' '}
            <strong style={{ color: 'var(--t2)' }}>{dayMatches.length} {dayMatches.length === 1 ? 'jogo' : 'jogos'}</strong>{' '}
            deste dia.
          </p>
        </div>

        <button
          onClick={e => { e.stopPropagation(); onOpen(); }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: 'clamp(8px,1vw,10px) clamp(14px,1.5vw,20px)',
            borderRadius: 'var(--radius-s)',
            border: 'none', background: 'var(--green)', color: '#fff',
            cursor: 'pointer', fontSize: 'clamp(11px,1.1vw,13px)', fontWeight: 700,
            boxShadow: '0 4px 14px rgba(22,196,127,0.35)',
            transition: 'background .15s',
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--green-mid)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}>
          <Plus size={14} /> Criar promoção
        </button>
      </div>
    );
  }

  /* Com promoções — header + cards */
  const plural = promos.length > 1;

  return (
    <div style={{ marginBottom: 'clamp(16px,2.5vw,28px)' }}>

      {/* Cabeçalho da seção */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        marginBottom: 'clamp(10px,1.2vw,14px)',
      }}>
        <Megaphone size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />
        <span style={{
          fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--t3)',
        }}>
          {plural ? 'Promoções do dia' : 'Promoção do dia'}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700,
          padding: '1px 7px', borderRadius: 99,
          background: 'var(--green)', color: '#fff',
        }}>
          {promos.length}/2
        </span>
      </div>

      {/* Cards lado a lado (flex-wrap) */}
      <div style={{
        display: 'flex', gap: 'clamp(10px,1.5vw,16px)',
        flexWrap: 'wrap', alignItems: 'stretch',
      }}>
        {promos.map(p => (
          <FeaturedPromo
            key={p.id}
            promo={p}
            dayMatches={dayMatches}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  );
}
