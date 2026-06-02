import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Trash2, Megaphone, PauseCircle, ArrowUp, Check, Edit3 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { promoTypes, promoStatuses } from '../data/matches';
import Flag from './Flag';

const typeOf = (id) => promoTypes.find(t => t.id === id);

/* ── Chip de tipo ─────────────────────────────────────────── */
function TypeChip({ type }) {
  const t = typeOf(type);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99,
      background: t?.tint || 'var(--card2)', color: t?.color || 'var(--t2)',
    }}>
      <span style={{ fontSize: 12, lineHeight: 1 }}>{t?.icon}</span>
      {t?.label || 'Tipo'}
    </span>
  );
}

/* ── Mini-formulário inline ───────────────────────────────── */
function PromoMiniForm({ initial, withStatus, onSave, onCancel }) {
  const [f, setF] = useState({
    type: initial?.type || 'boost',
    title: initial?.title || '',
    description: initial?.description || '',
    status: initial?.state || 'standby',
  });

  return (
    <form
      onSubmit={e => { e.preventDefault(); if (f.title.trim()) onSave(f); }}
      style={{
        display: 'flex', flexDirection: 'column', gap: 12,
        padding: 14, borderRadius: 14, border: '1px solid var(--line)',
        background: 'var(--card2)',
      }}>

      {/* Tipo */}
      <div style={{ display: 'flex', gap: 8 }}>
        {promoTypes.map(pt => {
          const active = f.type === pt.id;
          return (
            <button type="button" key={pt.id} onClick={() => setF(p => ({ ...p, type: pt.id }))}
              style={{
                flex: 1, padding: '10px 6px', borderRadius: 11,
                border: `1.5px solid ${active ? pt.color : 'var(--line2)'}`,
                background: active ? pt.tint : 'var(--bg)',
                cursor: 'pointer', textAlign: 'center', transition: 'all .15s',
              }}>
              <div style={{ fontSize: 18, marginBottom: 3 }}>{pt.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: active ? pt.color : 'var(--t2)' }}>{pt.short}</div>
            </button>
          );
        })}
      </div>

      {/* Status (apenas para itens em espera) */}
      {withStatus && (
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(promoStatuses).map(([id, st]) => {
            const active = f.status === id;
            return (
              <button type="button" key={id} onClick={() => setF(p => ({ ...p, status: id }))}
                style={{
                  flex: 1, padding: '8px 6px', borderRadius: 10,
                  border: `1.5px solid ${active ? st.color : 'var(--line2)'}`,
                  background: active ? st.tint : 'var(--bg)',
                  color: active ? st.color : 'var(--t2)',
                  cursor: 'pointer', fontSize: 11, fontWeight: 700, transition: 'all .15s',
                }}>
                {st.label}
              </button>
            );
          })}
        </div>
      )}

      <input
        value={f.title}
        onChange={e => setF(p => ({ ...p, title: e.target.value }))}
        placeholder="Título da promoção *"
        required
        style={{ fontSize: 13 }}
      />
      <textarea
        rows={2}
        value={f.description}
        onChange={e => setF(p => ({ ...p, description: e.target.value }))}
        placeholder="Descrição (opcional)"
        style={{ fontSize: 12.5, lineHeight: 1.5 }}
      />

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel}
          style={{
            padding: '8px 18px', borderRadius: 'var(--radius-xs)',
            border: '1.5px solid var(--line2)', background: 'transparent',
            color: 'var(--t2)', cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
          }}>
          Cancelar
        </button>
        <button type="submit"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 20px', borderRadius: 'var(--radius-xs)',
            border: 'none', background: 'var(--green)', color: '#fff',
            cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
            boxShadow: '0 4px 14px rgba(22,196,127,0.35)',
          }}>
          <Check size={14} /> Salvar
        </button>
      </div>
    </form>
  );
}

/* ── Card de promoção do dia (ativa) ──────────────────────── */
function DayPromoCard({ promo, dayMatches, onDelete, onEdit }) {
  const t = typeOf(promo.type);
  return (
    <div style={{
      borderRadius: 14, border: '1px solid var(--line)',
      borderLeft: `3px solid ${t?.color || 'var(--t3)'}`,
      background: 'var(--card)', overflow: 'hidden',
    }}>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
          <TypeChip type={promo.type} />
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            <button onClick={onEdit} aria-label={`Editar ${promo.title}`}
              style={{ padding: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--t3)', borderRadius: 6, display: 'flex', transition: 'color .12s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}>
              <Edit3 size={14} />
            </button>
            <button onClick={onDelete} aria-label={`Excluir ${promo.title}`}
              style={{ padding: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--t3)', borderRadius: 6, display: 'flex', transition: 'color .12s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', lineHeight: 1.3 }}>{promo.title}</div>
        {promo.description && <p style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.5, marginTop: 4 }}>{promo.description}</p>}
        {promo.rules && (
          <div style={{ marginTop: 8, padding: '6px 10px', background: 'var(--card2)', borderRadius: 8, fontSize: 11.5, color: 'var(--t3)' }}>
            📜 {promo.rules}
          </div>
        )}
      </div>
      {/* Faixa "Abrange os N jogos" */}
      <div style={{
        padding: '8px 14px', background: 'var(--green-bg)',
        borderTop: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-dark)' }}>
          Abrange os {dayMatches.length} jogos:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          {dayMatches.map(m => (
            <span key={m.id} style={{ display: 'inline-flex', gap: 2 }}>
              <Flag team={m.home} size="sm" />
              <Flag team={m.away} size="sm" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Card de stand by / sugestão ──────────────────────────── */
function StandbyCard({ promo, canActivate, onActivate, onDelete }) {
  const st = promoStatuses[promo.state] || promoStatuses.standby;
  return (
    <div style={{
      borderRadius: 14, border: '1px solid var(--line)',
      background: 'var(--card)', padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 8 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99,
          background: st.tint, color: st.color,
        }}>
          {promo.state === 'suggestion' ? '💡' : '⏸'} {st.label}
        </span>
        <TypeChip type={promo.type} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)', lineHeight: 1.3 }}>{promo.title}</div>
      {promo.description && <p style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.5, marginTop: 4 }}>{promo.description}</p>}
      {promo.note && <p style={{ fontSize: 11, color: 'var(--t3)', fontStyle: 'italic', marginTop: 6 }}>· {promo.note}</p>}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={onActivate} disabled={!canActivate}
          title={canActivate ? 'Ativar no dia' : 'Limite de 2 promoções ativas atingido'}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '9px', borderRadius: 'var(--radius-xs)', border: 'none',
            background: canActivate ? 'var(--green)' : 'var(--line)',
            color: canActivate ? '#fff' : 'var(--t3)',
            cursor: canActivate ? 'pointer' : 'not-allowed', fontSize: 12.5, fontWeight: 700,
            boxShadow: canActivate ? '0 4px 14px rgba(22,196,127,0.30)' : 'none',
            transition: 'all .15s',
          }}>
          <ArrowUp size={14} /> Ativar no dia
        </button>
        <button onClick={onDelete} aria-label={`Excluir ${promo.title}`}
          style={{
            padding: '9px 12px', borderRadius: 'var(--radius-xs)',
            border: '1.5px solid var(--line2)', background: 'transparent',
            color: 'var(--t3)', cursor: 'pointer', display: 'flex', transition: 'color .12s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── Título de seção ──────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.5, marginBottom: 14 }}>{children}</p>
  );
}

/* ── Botão tracejado ──────────────────────────────────────── */
function DashedButton({ onClick, children }) {
  return (
    <button onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '13px', borderRadius: 12,
        border: '2px dashed rgba(22,196,127,0.35)',
        background: 'var(--green-bg)', color: 'var(--green-dark)',
        cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all .15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderStyle = 'solid'; e.currentTarget.style.background = 'rgba(22,196,127,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderStyle = 'dashed'; e.currentTarget.style.background = 'var(--green-bg)'; }}>
      <Plus size={15} /> {children}
    </button>
  );
}

export default function PromoDrawer({
  open, onClose, date, dayMatches = [], dayPromos = [], standby = [],
  onAddDayPromo, onDeleteDayPromo, onUpdateDayPromo, onAddStandby, onDeleteStandby, onActivate,
}) {
  const [showDayForm, setShowDayForm] = useState(false);
  const [showStandbyForm, setShowStandbyForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null); // promo sendo editada

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  const dateLabel = date ? format(parseISO(date), "EEEE, d 'de' MMMM", { locale: ptBR }) : '';
  const atLimit = dayPromos.length >= 2;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="promo-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: .2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(3px)', zIndex: 100,
            }} />

          {/* Painel */}
          <motion.aside
            key="promo-panel"
            initial={{ x: '-104%' }} animate={{ x: 0 }} exit={{ x: '-104%' }}
            transition={{ duration: .28, ease: [.4, 0, .2, 1] }}
            style={{
              position: 'fixed', left: 0, top: 0, bottom: 0,
              width: 'min(92vw, 430px)', zIndex: 101,
              background: 'var(--surface)', borderRight: '1px solid var(--line)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex', flexDirection: 'column',
            }}>

            {/* Header */}
            <div style={{
              padding: '18px 20px', borderBottom: '1px solid var(--line)',
              display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg, #16C47F 0%, #0fa865 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 19, boxShadow: 'var(--shadow-green)',
              }}>🎯</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-d)', fontSize: 19, fontWeight: 800, color: 'var(--t1)', letterSpacing: '0.02em', textTransform: 'capitalize', lineHeight: 1.1 }}>
                  Promoções do dia
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--t3)', textTransform: 'capitalize', marginTop: 2 }}>
                  {dateLabel} · {dayMatches.length} {dayMatches.length === 1 ? 'jogo' : 'jogos'}
                </div>
              </div>
              <button onClick={onClose} aria-label="Fechar painel de promoções do dia"
                style={{
                  width: 32, height: 32, borderRadius: 8, border: '1px solid var(--line2)',
                  background: 'var(--bg)', color: 'var(--t2)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--line)'; e.currentTarget.style.color = 'var(--t1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--t2)'; }}>
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 28 }}>

              {/* ── Seção 1: Promoção do dia ── */}
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Megaphone size={16} style={{ color: 'var(--green)' }} />
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)' }}>Promoção do dia</h2>
                  <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: atLimit ? 'var(--green)' : 'var(--t3)' }}>
                    {dayPromos.length}/2
                  </span>
                </div>
                <SectionLabel>
                  Até 2 promoções que valem para <strong style={{ color: 'var(--t2)' }}>todos os jogos</strong> deste dia.
                </SectionLabel>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {dayPromos.map(p => (
                    editingPromo?.id === p.id ? (
                      <div key={p.id} style={{ borderRadius: 14, border: '1px solid var(--line)', background: 'var(--card)', padding: '12px 14px' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
                          Editar promoção
                        </p>
                        <PromoMiniForm
                          initial={editingPromo}
                          onSave={data => { onUpdateDayPromo(p.id, data); setEditingPromo(null); }}
                          onCancel={() => setEditingPromo(null)} />
                      </div>
                    ) : (
                      <DayPromoCard key={p.id} promo={p} dayMatches={dayMatches}
                        onDelete={() => onDeleteDayPromo(p.id)}
                        onEdit={() => { setEditingPromo(p); setShowDayForm(false); }} />
                    )
                  ))}

                  {showDayForm ? (
                    <PromoMiniForm
                      onSave={data => { onAddDayPromo(data); setShowDayForm(false); }}
                      onCancel={() => setShowDayForm(false)} />
                  ) : atLimit ? (
                    <div style={{
                      padding: '13px', borderRadius: 12, textAlign: 'center',
                      background: 'var(--card2)', color: 'var(--t3)', fontSize: 12.5, fontWeight: 600,
                    }}>
                      Limite de 2 promoções por dia atingido
                    </div>
                  ) : (
                    <DashedButton onClick={() => setShowDayForm(true)}>Nova promoção do dia</DashedButton>
                  )}
                </div>
              </section>

              {/* ── Seção 2: Stand by / Sugestões ── */}
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <PauseCircle size={16} style={{ color: 'var(--t2)' }} />
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)' }}>Em stand by / Sugestões</h2>
                  <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: 'var(--t3)' }}>{standby.length}</span>
                </div>
                <SectionLabel>Promoções pausadas ou sugeridas, prontas para ativar no dia.</SectionLabel>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {standby.length === 0 && !showStandbyForm && (
                    <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--t3)', padding: '8px 0' }}>
                      Nada em espera por aqui.
                    </p>
                  )}
                  {standby.map(p => (
                    <StandbyCard key={p.id} promo={p} canActivate={!atLimit}
                      onActivate={() => onActivate(p.id)}
                      onDelete={() => onDeleteStandby(p.id)} />
                  ))}

                  {showStandbyForm ? (
                    <PromoMiniForm withStatus
                      onSave={data => { onAddStandby(data); setShowStandbyForm(false); }}
                      onCancel={() => setShowStandbyForm(false)} />
                  ) : (
                    <DashedButton onClick={() => setShowStandbyForm(true)}>Adicionar à espera</DashedButton>
                  )}
                </div>
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
