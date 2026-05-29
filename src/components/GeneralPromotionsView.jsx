import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { promoTypes } from '../data/matches';
import GeneralPromotionDetailModal from './GeneralPromotionDetailModal';

function GeneralPromotionForm({ onSave, onCancel }) {
  const [f, setF] = useState({
    type: 'boost',
    title: '',
    description: '',
    rules: '',
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
          placeholder="Ex: Bônus de boas-vindas"
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
          placeholder="Detalhes da promoção..."
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
          placeholder="Mínimo R$10 · Odds mínimas 1.5 · Válido por 7 dias..."
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
          Salvar promoção
        </button>
      </div>
    </form>
  );
}

function GeneralPromotionRow({ promotion, onDelete, onClick }) {
  const type = promoTypes.find(t => t.id === promotion.type);
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
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{promotion.title}</span>
        </div>
        {promotion.description && <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.5 }}>{promotion.description}</p>}
        {promotion.rules && (
          <div style={{ marginTop: 5, padding: '4px 10px', background: 'var(--card2)', borderRadius: 6, fontSize: 11, color: 'var(--t3)' }}>
            📜 {promotion.rules}
          </div>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label={`Deletar promoção: ${promotion.title}`}
        style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--t3)', borderRadius: 6, transition: 'color .12s', display: 'flex', flexShrink: 0 }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}>
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function GeneralPromotionsView({ generalPromotions, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  if (!showForm && generalPromotions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
        <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 6, color: 'var(--t1)' }}>Nenhuma promoção geral cadastrada.</p>
        <p style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 24 }}>Crie promoções que valem para toda a sportsbook.</p>
        <button onClick={() => setShowForm(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 12,
            border: 'none', background: 'var(--green)', color: '#fff',
            cursor: 'pointer', fontSize: 13, fontWeight: 700,
            boxShadow: '0 4px 14px rgba(22,196,127,0.35)',
            transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--green-mid)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(22,196,127,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--green)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(22,196,127,0.35)'; }}>
          <Plus size={15} />
          Criar primeira promoção
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--line)' }}>
        <h1 style={{ fontFamily: 'var(--font-d)', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, color: 'var(--t1)', letterSpacing: '0.02em' }}>
          Promoções Gerais
        </h1>
        <p style={{ fontSize: 14, color: 'var(--t2)', marginTop: 6 }}>Promoções que valem para toda a sportsbook</p>
      </div>

      {/* Promoções existentes */}
      {generalPromotions.length > 0 && !showForm && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Promoções cadastradas ({generalPromotions.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {generalPromotions.map(promo => (
              <GeneralPromotionRow key={promo.id} promotion={promo}
                onDelete={() => onDelete(promo.id)}
                onClick={() => setSelectedPromotion(promo)} />
            ))}
          </div>
        </div>
      )}

      {/* Botão adicionar */}
      {!showForm && (
        <button onClick={() => setShowForm(true)}
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
          Adicionar outra promoção
        </button>
      )}

      {/* Formulário */}
      {showForm && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            Nova promoção geral
          </p>
          <GeneralPromotionForm
            onSave={data => {
              onAdd(data);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Promotion Detail Modal */}
      {selectedPromotion && (
        <GeneralPromotionDetailModal
          promotion={selectedPromotion}
          onClose={() => setSelectedPromotion(null)}
          onDelete={() => {
            onDelete(selectedPromotion.id);
            setSelectedPromotion(null);
          }}
        />
      )}
    </div>
  );
}
