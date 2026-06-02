import { AnimatePresence, motion } from 'framer-motion';
import { X, Trash2, Edit3, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { promoTypes } from '../data/matches';
import Flag from './Flag';

/* ── Formulário de edição inline ─────────────────────────── */
function EditForm({ promo, onSave, onCancel }) {
  const [f, setF] = useState({
    type: promo.type,
    title: promo.title,
    description: promo.description || '',
    rules: promo.rules || '',
  });

  return (
    <form
      onSubmit={e => { e.preventDefault(); if (f.title.trim()) onSave(f); }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Tipo */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Tipo
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {promoTypes.map(pt => {
            const active = f.type === pt.id;
            return (
              <button type="button" key={pt.id} onClick={() => setF(p => ({ ...p, type: pt.id }))}
                style={{
                  flex: 1, padding: '10px 6px', borderRadius: 11, cursor: 'pointer',
                  border: `1.5px solid ${active ? pt.color : 'var(--line2)'}`,
                  background: active ? pt.tint : 'var(--bg)',
                  textAlign: 'center', transition: 'all .15s',
                }}>
                <div style={{ fontSize: 18, marginBottom: 3 }}>{pt.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: active ? pt.color : 'var(--t2)' }}>{pt.short}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Título */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Título <span style={{ color: 'var(--green)' }}>*</span>
        </label>
        <input
          value={f.title}
          onChange={e => setF(p => ({ ...p, title: e.target.value }))}
          placeholder="Ex: Freebet de abertura"
          required
          style={{ fontSize: 14 }}
        />
      </div>

      {/* Descrição */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Descrição
        </label>
        <textarea rows={3} value={f.description}
          onChange={e => setF(p => ({ ...p, description: e.target.value }))}
          placeholder="Detalhes da promoção..."
          style={{ fontSize: 13, lineHeight: 1.6 }} />
      </div>

      {/* Regras */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Regras e condições
        </label>
        <textarea rows={2} value={f.rules}
          onChange={e => setF(p => ({ ...p, rules: e.target.value }))}
          placeholder="Mínimo R$10 · Odds mínimas 1.5..."
          style={{ fontSize: 13, lineHeight: 1.6 }} />
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
        <button type="button" onClick={onCancel}
          style={{
            padding: '9px 20px', borderRadius: 'var(--radius-xs)',
            border: '1.5px solid var(--line2)', background: 'transparent',
            color: 'var(--t2)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--t2)'; e.currentTarget.style.color = 'var(--t1)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.style.color = 'var(--t2)'; }}>
          Cancelar
        </button>
        <button type="submit"
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 22px', borderRadius: 'var(--radius-xs)',
            border: 'none', background: 'var(--green)', color: '#fff',
            cursor: 'pointer', fontSize: 13, fontWeight: 700,
            boxShadow: '0 4px 14px rgba(22,196,127,0.35)', transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--green-mid)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--green)'; }}>
          <Check size={14} /> Salvar alterações
        </button>
      </div>
    </form>
  );
}

/* ── Modal principal ─────────────────────────────────────── */
export default function DayPromoDetailModal({ promo, dayMatches = [], onClose, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const type = promoTypes.find(t => t.id === promo.type);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { editing ? setEditing(false) : onClose(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, editing]);

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
        onClick={() => { if (editing) setEditing(false); else onClose(); }}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(5px)',
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
            width: '100%', maxWidth: 500,
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
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--t3)', textTransform: 'capitalize' }}>
                    {dateLabel}
                  </span>
                )}
              </div>
              <div style={{
                fontFamily: 'var(--font-d)',
                fontSize: 'clamp(18px,2.5vw,22px)',
                fontWeight: 800, color: 'var(--t1)', lineHeight: 1.2,
              }}>
                {editing ? 'Editar promoção' : promo.title}
              </div>
            </div>
            <button onClick={onClose} aria-label="Fechar"
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

            {editing ? (
              /* ── Modo edição ── */
              <EditForm
                promo={promo}
                onSave={data => { onUpdate(promo.id, data); setEditing(false); onClose(); }}
                onCancel={() => setEditing(false)}
              />
            ) : (
              /* ── Modo visualização ── */
              <>
                {promo.description && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Descrição</p>
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

                {promo.rules && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Regras e condições</p>
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

                {dayMatches.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Abrange {dayMatches.length} {dayMatches.length === 1 ? 'jogo' : 'jogos'}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>{m.timeBRT} BRT</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {promo.created_at && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--card2)', fontSize: 11, color: 'var(--t3)' }}>
                    <span style={{ fontWeight: 600 }}>Criada:</span>{' '}
                    {new Date(promo.created_at).toLocaleString('pt-BR', {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer — só aparece no modo visualização */}
          {!editing && (
            <div style={{
              padding: '16px 24px', borderTop: '1px solid var(--line)',
              background: 'var(--card)',
              display: 'flex', gap: 10, justifyContent: 'flex-end', flexShrink: 0,
            }}>
              <button onClick={() => setEditing(true)} aria-label="Editar promoção"
                style={{
                  padding: '9px 18px', borderRadius: 'var(--radius-xs)',
                  border: '1.5px solid var(--gold-line)', background: 'var(--gold-bg)',
                  color: 'var(--gold)', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = '#000'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--gold-bg)'; e.currentTarget.style.color = 'var(--gold)'; }}>
                <Edit3 size={13} /> Editar
              </button>
              <button onClick={onDelete} aria-label="Remover promoção"
                style={{
                  padding: '9px 18px', borderRadius: 'var(--radius-xs)',
                  border: '1.5px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)',
                  color: 'var(--red)', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--red)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}>
                <Trash2 size={13} /> Remover
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
