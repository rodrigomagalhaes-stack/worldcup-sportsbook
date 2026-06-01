import { AnimatePresence, motion } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { promoTypes } from '../data/matches';
import Flag from './Flag';

export default function DayPromoDetailModal({ promo, dayMatches = [], onClose, onDelete }) {
  const type = promoTypes.find(t => t.id === promo.type);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const dateLabel = promo.date
    ? format(parseISO(promo.date), "EEEE, d 'de' MMMM", { locale: ptBR })
    : '';

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        key="dp-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: .18 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.50)',
          backdropFilter: 'blur(5px)',
          zIndex: 110,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 'clamp(12px,3vw,40px)',
        }}>

        {/* Modal */}
        <motion.div
          key="dp-modal"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: .22, ease: [.4, 0, .2, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--surface)',
            borderRadius: 24,
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow-lg)',
            width: '100%',
            maxWidth: 500,
            maxHeight: '88vh',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>

          {/* Header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: `3px solid ${type?.color || 'var(--green)'}`,
            background: `${type?.color || '#16C47F'}08`,
            display: 'flex', alignItems: 'flex-start', gap: 14, flexShrink: 0,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Chip tipo + data */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                  background: type?.tint || `${type?.color || '#888'}18`,
                  color: type?.color || '#888',
                }}>
                  <span style={{ fontSize: 14, lineHeight: 1 }}>{type?.icon}</span>
                  {type?.label || 'Promoção'}
                </span>
                {dateLabel && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: 'var(--t3)',
                    textTransform: 'capitalize',
                  }}>
                    {dateLabel}
                  </span>
                )}
              </div>
              {/* Título */}
              <div style={{
                fontFamily: 'var(--font-d)',
                fontSize: 'clamp(18px,2.5vw,22px)',
                fontWeight: 800, color: 'var(--t1)', lineHeight: 1.2,
              }}>
                {promo.title}
              </div>
            </div>

            {/* Botão fechar */}
            <button onClick={onClose} aria-label="Fechar detalhes da promoção do dia"
              style={{
                width: 32, height: 32, borderRadius: 8, border: '1px solid var(--line2)',
                background: 'var(--bg)', color: 'var(--t2)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .15s', flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--line)'; e.currentTarget.style.color = 'var(--t1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--t2)'; }}>
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

            {/* Descrição */}
            {promo.description && (
              <div style={{ marginBottom: 20 }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--t3)',
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
                }}>Descrição</p>
                <div style={{
                  padding: '14px 16px', borderRadius: 12,
                  background: 'var(--bg)', border: '1px solid var(--line2)',
                  fontSize: 13, color: 'var(--t1)', lineHeight: 1.6,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  {promo.description}
                </div>
              </div>
            )}

            {/* Regras */}
            {promo.rules && (
              <div style={{ marginBottom: 20 }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--t3)',
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
                }}>Regras e condições</p>
                <div style={{
                  padding: '14px 16px', borderRadius: 12,
                  background: 'var(--bg)',
                  border: `1px solid ${type?.color || '#888'}28`,
                  borderLeft: `3px solid ${type?.color || '#888'}`,
                  fontSize: 13, color: 'var(--t1)', lineHeight: 1.6,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  📜 {promo.rules}
                </div>
              </div>
            )}

            {/* Jogos abrangidos */}
            {dayMatches.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--t3)',
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
                }}>
                  Abrange {dayMatches.length} {dayMatches.length === 1 ? 'jogo' : 'jogos'}
                </p>
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  {dayMatches.map(m => (
                    <div key={m.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 10,
                      background: 'var(--bg)', border: '1px solid var(--line)',
                    }}>
                      <Flag team={m.home} size="sm" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>{m.home}</span>
                      <span style={{ fontSize: 10, color: 'var(--t3)', margin: '0 2px' }}>×</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>{m.away}</span>
                      <Flag team={m.away} size="sm" />
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>
                        {m.timeBRT} BRT
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            {promo.created_at && (
              <div style={{
                padding: '10px 14px', borderRadius: 8,
                background: 'var(--card2)', fontSize: 11, color: 'var(--t3)',
              }}>
                <span style={{ fontWeight: 600 }}>Criada:</span>{' '}
                {new Date(promo.created_at).toLocaleString('pt-BR', {
                  year: 'numeric', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--line)',
            background: 'var(--card)',
            display: 'flex', gap: 10, justifyContent: 'flex-end', flexShrink: 0,
          }}>
            <button onClick={onDelete} aria-label={`Deletar promoção: ${promo.title}`}
              style={{
                padding: '9px 18px', borderRadius: 'var(--radius-xs)',
                border: '1.5px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)',
                color: 'var(--red)', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--red)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}>
              <Trash2 size={13} />
              Remover promoção
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
