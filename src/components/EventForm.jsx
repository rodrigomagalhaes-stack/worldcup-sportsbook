import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { promoTypes } from '../data/matches';

export default function EventForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState({
    type: initial?.type || 'boost',
    title: initial?.title || '',
    description: initial?.description || '',
    rules: initial?.rules || '',
  });

  return (
    <form onSubmit={e => { e.preventDefault(); if (f.title.trim()) onSave(f); }}
      style={{ background:'var(--card2)', border:'1.5px solid var(--line2)', borderRadius:'var(--radius-s)', padding:20, marginTop:16, display:'flex', flexDirection:'column', gap:16 }}>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <p style={{ fontSize:12, fontWeight:700, letterSpacing:'0.07em', color:'var(--t3)', textTransform:'uppercase' }}>
          {initial ? 'Editar evento' : 'Novo evento'}
        </p>
        <button type="button" onClick={onCancel} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--t3)', padding:4, borderRadius:4, display:'flex' }}>
          <X size={14} />
        </button>
      </div>

      {/* Type selector */}
      <div>
        <label style={{ fontSize:11, fontWeight:600, color:'var(--t2)', display:'block', marginBottom:8 }}>Tipo de promoção</label>
        <div style={{ display:'flex', gap:8 }}>
          {promoTypes.map(pt => (
            <button type="button" key={pt.id} onClick={() => setF(p => ({...p, type: pt.id}))}
              style={{ flex:1, padding:'10px 8px', borderRadius:var_radius_s, border:'1.5px solid', transition:'all .12s', cursor:'pointer', textAlign:'center',
                background: f.type===pt.id ? pt.color+'18' : 'var(--surface)',
                borderColor: f.type===pt.id ? pt.color : 'var(--line2)',
              }}>
              <div style={{ fontSize:18, marginBottom:3 }}>{pt.icon}</div>
              <div style={{ fontSize:11, fontWeight:600, color: f.type===pt.id ? pt.color : 'var(--t2)', lineHeight:1.3 }}>{pt.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label style={{ fontSize:11, fontWeight:600, color:'var(--t2)', display:'block', marginBottom:6 }}>Título *</label>
        <input value={f.title} onChange={e => setF(p=>({...p,title:e.target.value}))} placeholder="Ex: Odds boosted para goleador da partida" required />
      </div>

      {/* Description */}
      <div>
        <label style={{ fontSize:11, fontWeight:600, color:'var(--t2)', display:'block', marginBottom:6 }}>Descrição</label>
        <textarea rows={2} value={f.description} onChange={e => setF(p=>({...p,description:e.target.value}))} placeholder="Detalhes da promoção para os outros setores..." />
      </div>

      {/* Rules */}
      <div>
        <label style={{ fontSize:11, fontWeight:600, color:'var(--t2)', display:'block', marginBottom:6 }}>Regras e condições</label>
        <textarea rows={2} value={f.rules} onChange={e => setF(p=>({...p,rules:e.target.value}))} placeholder="Mínimo R$10 · Odds mínimas 1.5 · Apenas pré-jogo..." />
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
        <button type="button" onClick={onCancel}
          style={{ padding:'8px 18px', borderRadius:'var(--radius-xs)', border:'1.5px solid var(--line2)', background:'transparent', color:'var(--t2)', cursor:'pointer', fontSize:13, fontWeight:500 }}>
          Cancelar
        </button>
        <button type="submit"
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 20px', borderRadius:'var(--radius-xs)', border:'none', background:'var(--green)', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700 }}>
          <Check size={14} /> Salvar evento
        </button>
      </div>
    </form>
  );
}

// css var helper for inline style
const var_radius_s = 'var(--radius-xs)';
