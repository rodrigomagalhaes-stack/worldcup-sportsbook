import { useState } from 'react';
import { Plus, Star, MapPin, Settings2 } from 'lucide-react';
import { groups, promoTypes } from '../data/matches';
import Flag from './Flag';
import EventModal from './EventModal';

function useFavorites() {
  const [favs, setFavs] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('sb_favs') || '[]')); } catch { return new Set(); }
  });
  const toggle = (id) => {
    setFavs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('sb_favs', JSON.stringify([...next]));
      return next;
    });
  };
  return { favs, toggle };
}

function PromoPill({ type }) {
  const t = promoTypes.find(p => p.id === type);
  if (!t) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99,
      background: t.tint, color: t.color,
    }}>
      <span style={{ fontSize: 11, lineHeight: 1 }}>{t.icon}</span>
      {t.short}
    </span>
  );
}

export default function MatchCard({ match, events, onAdd, onDelete, onUpdate, dayPromoActive, onOpenDayPromo }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [starAnim, setStarAnim] = useState(false);
  const { favs, toggle: toggleFav } = useFavorites();

  const gc = groups[match.group]?.color || '#888';
  const hasEvents = events.length > 0;
  const isFav = favs.has(match.id);
  const isMadrugada = parseInt(match.timeBRT) <= 4;

  // Tipos únicos de promoção presentes (para as pills)
  const presentTypes = [...new Set(events.map(e => e.type))];

  const handleStarClick = (e) => {
    e.stopPropagation();
    toggleFav(match.id);
    setStarAnim(true);
    setTimeout(() => setStarAnim(false), 300);
  };

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setModalOpen(true)}
        style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius)',
          border: `1px solid ${hovered ? 'var(--green)' : 'var(--line)'}`,
          boxShadow: hovered ? `var(--shadow), 0 0 0 1px var(--green-glow)` : 'var(--shadow-sm)',
          transform: hovered ? 'translateY(-3px)' : 'none',
          transition: 'box-shadow .22s cubic-bezier(.4,0,.2,1), transform .22s, border-color .22s',
          position: 'relative',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>

        {/* Faixa: promoção do dia ativa */}
        {dayPromoActive && (
          <button
            onClick={(e) => { e.stopPropagation(); onOpenDayPromo?.(); }}
            title="Ver promoções do dia"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', padding: '6px 10px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #16C47F 0%, #0fa865 100%)',
              color: '#fff', fontSize: 10, fontWeight: 800,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
            🎯 Promoção do dia ativa
          </button>
        )}

        {/* Corpo */}
        <div style={{ padding: '14px 16px 0', display: 'flex', flexDirection: 'column' }}>

          {/* Linha meta: horário + grupo/estrela */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{
                fontFamily: 'var(--font-d)', fontSize: 24, fontWeight: 800,
                color: 'var(--t1)', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
              }}>
                {match.timeBRT}
              </span>
              <span style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 700, letterSpacing: '0.06em' }}>BRT</span>
              {isMadrugada && <span style={{ fontSize: 12, lineHeight: 1 }} title="Madrugada">🌙</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: '0.06em',
                padding: '3px 9px', borderRadius: 99,
                background: gc, color: '#fff',
              }}>
                GRUPO {match.group}
              </span>
              <button
                onClick={handleStarClick}
                className={starAnim ? 'star-pop' : ''}
                title={isFav ? 'Remover favorito' : 'Adicionar favorito'}
                style={{
                  width: 26, height: 26, borderRadius: 7, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isFav ? 'rgba(244,197,66,0.14)' : 'transparent', transition: 'all .18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,197,66,0.20)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isFav ? 'rgba(244,197,66,0.14)' : 'transparent'; }}>
                <Star size={13} fill={isFav ? '#F4C542' : 'none'} stroke={isFav ? '#F4C542' : 'var(--t3)'} style={{ transition: 'all .18s' }} />
              </button>
            </div>
          </div>

          {/* Times */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
              <Flag team={match.home} size="lg" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', textAlign: 'center', lineHeight: 1.2, minHeight: '2.4em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {match.home}
              </span>
            </div>
            <div style={{ flexShrink: 0, paddingTop: 18 }}>
              <span style={{ fontFamily: 'var(--font-d)', fontSize: 10, fontWeight: 700, color: 'var(--t3)', letterSpacing: 2 }}>VS</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
              <Flag team={match.away} size="lg" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', textAlign: 'center', lineHeight: 1.2, minHeight: '2.4em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {match.away}
              </span>
            </div>
          </div>

          {/* Venue */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
            <MapPin size={9} style={{ color: 'var(--t3)', flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: 'var(--t3)', textAlign: 'center', lineHeight: 1.3 }}>
              {match.venue} · Rod. {match.matchday}
            </span>
          </div>

          {/* Pills de promoções / vazio */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', minHeight: 24, marginBottom: 12 }}>
            {hasEvents ? (
              presentTypes.map(t => <PromoPill key={t} type={t} />)
            ) : (
              <span style={{ fontSize: 11.5, color: 'var(--t3)', fontStyle: 'italic' }}>Sem promoções</span>
            )}
          </div>
        </div>

        {/* Footer — botão real */}
        <div
          style={{
            marginTop: 'auto', borderTop: '1px solid var(--line)',
            padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontSize: 12, fontWeight: 700,
            color: hovered ? 'var(--green)' : (hasEvents ? 'var(--green-dark)' : 'var(--t2)'),
            background: hovered ? 'var(--green-bg)' : 'transparent',
            transition: 'color .15s, background .15s',
          }}>
          {hasEvents ? <Settings2 size={13} /> : <Plus size={13} style={{ color: 'var(--green)' }} />}
          {hasEvents ? `Gerenciar ${events.length} ${events.length > 1 ? 'promoções' : 'promoção'}` : 'Adicionar promoção'}
        </div>
      </div>

      {/* Modal de eventos do jogo */}
      {modalOpen && (
        <EventModal
          match={match}
          events={events}
          onAdd={onAdd}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onClose={() => setModalOpen(false)}
          groupColor={gc}
        />
      )}
    </>
  );
}
