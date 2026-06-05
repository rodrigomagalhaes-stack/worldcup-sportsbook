import { AnimatePresence, motion } from 'framer-motion';
import { X, Trash2, Edit3 } from 'lucide-react';
import { useEffect } from 'react';
import { promoTypes } from '../data/matches';

export default function EventDetailModal({ event, onClose, onDelete, onEdit, isAdmin }) {
  const type = promoTypes.find(t => t.id === event.type);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: .18 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.50)',
          backdropFilter: 'blur(5px)',
          zIndex: 101,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 'clamp(12px,3vw,40px)',
        }}>

        {/* Modal */}
        <motion.div
          key="detail-modal"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: .22, ease: [.4,0,.2,1] }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--surface)',
            borderRadius: 24,
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow-lg)',
            width: '100%',
            maxWidth: 480,
            maxHeight: '85vh',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>

          {/* Header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: `3px solid ${type?.color || '#888'}`,
            background: `${type?.color || '#888'}08`,
            display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>
                  {type?.icon}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                  background: `${type?.color || '#888'}18`, color: type?.color || '#888',
                }}>
                  {type?.label || 'Tipo desconhecido'}
                </span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', lineHeight: 1.3 }}>
                {event.title}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar detalhes do evento"
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

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {/* Descrição */}
            {event.description && (
              <div style={{ marginBottom: 24 }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--t3)',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  marginBottom: 10,
                }}>
                  Descrição
                </p>
                <div style={{
                  padding: '14px 16px', borderRadius: 12,
                  background: 'var(--bg)', border: '1px solid var(--line2)',
                  fontSize: 13, color: 'var(--t1)', lineHeight: 1.6,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  {event.description}
                </div>
              </div>
            )}

            {/* Regras */}
            {event.rules && (
              <div style={{ marginBottom: 24 }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--t3)',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  marginBottom: 10,
                }}>
                  Regras e condições
                </p>
                <div style={{
                  padding: '14px 16px', borderRadius: 12,
                  background: 'var(--bg)', border: `1px solid ${type?.color || '#888'}28`,
                  borderLeft: `3px solid ${type?.color || '#888'}`,
                  fontSize: 13, color: 'var(--t1)', lineHeight: 1.6,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  📜 {event.rules}
                </div>
              </div>
            )}

            {/* Metadata */}
            {event.created_at && (
              <div style={{
                padding: '10px 14px', borderRadius: 8,
                background: 'var(--card2)', fontSize: 11, color: 'var(--t3)',
                display: 'flex', gap: 16,
              }}>
                <div>
                  <span style={{ fontWeight: 600 }}>Criado:</span> {new Date(event.created_at).toLocaleString('pt-BR', {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer with actions */}
          {isAdmin && <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--line)',
            background: 'var(--card)',
            display: 'flex', gap: 10, justifyContent: 'flex-end', flexShrink: 0,
          }}>
            <button
              onClick={onEdit}
              aria-label={`Editar evento: ${event.title}`}
              style={{
                padding: '8px 16px', borderRadius: 'var(--radius-xs)',
                border: '1.5px solid var(--gold-line)', background: 'var(--gold-bg)',
                color: 'var(--gold)', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = '#000'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--gold-bg)'; e.currentTarget.style.color = 'var(--gold)'; }}>
              <Edit3 size={13} />
              Editar
            </button>
            <button
              onClick={onDelete}
              aria-label={`Deletar evento: ${event.title}`}
              style={{
                padding: '8px 16px', borderRadius: 'var(--radius-xs)',
                border: '1.5px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)',
                color: 'var(--red)', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--red)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}>
              <Trash2 size={13} />
              Deletar
            </button>
          </div>}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
