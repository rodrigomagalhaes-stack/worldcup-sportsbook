import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Trash2, Edit3, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { promoTypes } from '../data/matches';
import EventDetailModal from './EventDetailModal';

function EventForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState({
    type: initial?.type || 'boost',
    title: initial?.title || '',
    description: initial?.description || '',
    rules: initial?.rules || '',
  });

  return (
    <form onSubmit={e => { e.preventDefault(); if (f.title.trim()) onSave(f); }}
      style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Tipo */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Tipo de promoção
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          {promoTypes.map(pt => (
            <button type="button" key={pt.id} onClick={() => setF(p => ({ ...p, type: pt.id }))}
              style={{
                flex: 1, padding: '14px 8px', borderRadius: 12,
                border: `1.5px solid ${f.type === pt.id ? pt.color : 'var(--line2)'}`,
                cursor: 'pointer', textAlign: 'center', transition: 'all .15s',
                background: f.type === pt.id ? pt.color + '14' : 'var(--bg)',
                boxShadow: f.type === pt.id ? `0 0 0 3px ${pt.color}20` : 'none',
              }}>
              <div style={{ fontSize: 22, marginBottom: 5 }}>{pt.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: f.type === pt.id ? pt.color : 'var(--t2)', lineHeight: 1.3 }}>
                {pt.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Título */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Título <span style={{ color: 'var(--green)' }}>*</span>
        </label>
        <input
          value={f.title}
          onChange={e => setF(p => ({ ...p, title: e.target.value }))}
          placeholder="Ex: Odds boosted para goleador da partida"
          required
          style={{ fontSize: 14 }}
        />
      </div>

      {/* Descrição */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Descrição
        </label>
        <textarea
          rows={3}
          value={f.description}
          onChange={e => setF(p => ({ ...p, description: e.target.value }))}
          placeholder="Detalhes da promoção para os outros setores..."
          style={{ fontSize: 13, lineHeight: 1.6 }}
        />
      </div>

      {/* Regras */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Regras e condições
        </label>
        <textarea
          rows={3}
          value={f.rules}
          onChange={e => setF(p => ({ ...p, rules: e.target.value }))}
          placeholder="Mínimo R$10 · Odds mínimas 1.5 · Apenas pré-jogo..."
          style={{ fontSize: 13, lineHeight: 1.6 }}
        />
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
        <button type="button" onClick={onCancel}
          style={{
            padding: '10px 22px', borderRadius: 'var(--radius-xs)',
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
            padding: '10px 24px', borderRadius: 'var(--radius-xs)',
            border: 'none', background: 'var(--green)', color: '#fff',
            cursor: 'pointer', fontSize: 13, fontWeight: 700,
            boxShadow: '0 4px 14px rgba(22,196,127,0.35)',
            transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--green-mid)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(22,196,127,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--green)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(22,196,127,0.35)'; }}>
          <Check size={15} /> Salvar evento
        </button>
      </div>
    </form>
  );
}

function EventRow({ event, onDelete, onEdit, onClick }) {
  const type = promoTypes.find(t => t.id === event.type);
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '12px 14px', background: 'var(--bg)',
        borderRadius: 12, borderLeft: `3px solid ${type?.color || '#888'}`,
        cursor: 'pointer', transition: 'all .15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--card2)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.boxShadow = 'none'; }}>
      <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{type?.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${type?.color || '#888'}18`, color: type?.color || '#888' }}>
            {type?.label}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{event.title}</span>
        </div>
        {event.description && <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.5 }}>{event.description}</p>}
        {event.rules && (
          <div style={{ marginTop: 5, padding: '4px 10px', background: 'var(--card2)', borderRadius: 6, fontSize: 11, color: 'var(--t3)' }}>
            📜 {event.rules}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <button onClick={onEdit}
          style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--t3)', borderRadius: 6, transition: 'color .12s', display: 'flex' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}>
          <Edit3 size={14} />
        </button>
        <button onClick={onDelete}
          style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--t3)', borderRadius: 6, transition: 'color .12s', display: 'flex' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function EventModal({ match, events, onAdd, onDelete, onUpdate, onClose, groupColor }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedEventDetail, setSelectedEventDetail] = useState(null);

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
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 'clamp(12px,3vw,40px)',
        }}>

        {/* Modal */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: .2, ease: [.4,0,.2,1] }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--surface)',
            borderRadius: 24,
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow-lg)',
            width: '100%',
            maxWidth: 520,
            maxHeight: '90vh',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>

          {/* Modal header */}
          <div style={{
            padding: '20px 24px 16px',
            borderBottom: `3px solid ${groupColor}`,
            background: groupColor + '08',
            display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Times */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
                  padding: '2px 9px', borderRadius: 99,
                  background: groupColor + '18', color: groupColor, border: `1px solid ${groupColor}30`,
                  flexShrink: 0,
                }}>
                  GRUPO {match.group}
                </span>
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {match.home} <span style={{ color: 'var(--t3)', fontWeight: 400 }}>vs</span> {match.away}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-d)', fontSize: 20, fontWeight: 800, color: 'var(--t1)' }}>
                  {match.timeBRT} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--t3)' }}>BRT</span>
                </span>
                <span style={{ fontSize: 11, color: 'var(--t3)' }}>
                  {match.venue} · Rodada {match.matchday}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label={`Fechar modal de eventos para ${match.home} vs ${match.away}`}
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

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

            {/* Eventos existentes */}
            {events.length > 0 && !showForm && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                  Eventos cadastrados
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {events.map(ev => (
                    <EventRow key={ev.id} event={ev}
                      onClick={() => setSelectedEventDetail(ev)}
                      onDelete={() => onDelete(match.id, ev.id)}
                      onEdit={() => { setEditing(ev); setShowForm(true); }} />
                  ))}
                </div>
              </div>
            )}

            {/* Botão adicionar */}
            {!showForm && (
              <button onClick={() => { setEditing(null); setShowForm(true); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '13px', borderRadius: 12,
                  border: '2px dashed rgba(22,196,127,0.35)',
                  background: 'var(--green-bg)', color: 'var(--green-dark)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderStyle = 'solid'; e.currentTarget.style.background = 'rgba(22,196,127,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderStyle = 'dashed'; e.currentTarget.style.background = 'var(--green-bg)'; }}>
                <Plus size={15} />
                {events.length > 0 ? 'Adicionar outro evento' : 'Adicionar evento'}
              </button>
            )}

            {/* Formulário */}
            {showForm && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                  {editing ? 'Editar evento' : 'Novo evento'}
                </p>
                <EventForm
                  initial={editing}
                  onSave={data => {
                    editing ? onUpdate(match.id, editing.id, data) : onAdd(match.id, data);
                    setShowForm(false); setEditing(null);
                  }}
                  onCancel={() => { setShowForm(false); setEditing(null); }}
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Event Detail Modal */}
      {selectedEventDetail && (
        <EventDetailModal
          event={selectedEventDetail}
          onClose={() => setSelectedEventDetail(null)}
          onDelete={() => {
            onDelete(match.id, selectedEventDetail.id);
            setSelectedEventDetail(null);
          }}
          onEdit={() => {
            setEditing(selectedEventDetail);
            setShowForm(true);
            setSelectedEventDetail(null);
          }}
        />
      )}
    </AnimatePresence>
  );
}
