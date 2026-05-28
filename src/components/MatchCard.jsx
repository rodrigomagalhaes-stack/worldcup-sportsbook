import { useState } from 'react';
import { Plus, Star, MapPin } from 'lucide-react';
import { groups } from '../data/matches';
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

export default function MatchCard({ match, events, onAdd, onDelete, onUpdate }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [starAnim, setStarAnim] = useState(false);
  const { favs, toggle: toggleFav } = useFavorites();

  const gc = groups[match.group]?.color || '#888';
  const hasEvents = events.length > 0;
  const isFav = favs.has(match.id);
  const isMadrugada = parseInt(match.timeBRT) <= 4;

  const handleStarClick = (e) => {
    e.stopPropagation();
    toggleFav(match.id);
    setStarAnim(true);
    setTimeout(() => setStarAnim(false), 300);
  };

  return (
    <>
      {/* Card — altura uniforme garantida por height fixo no conteúdo */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setModalOpen(true)}
        style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius)',
          border: `1px solid ${hovered ? gc + '60' : 'var(--line)'}`,
          borderTop: `3px solid ${gc}`,
          boxShadow: hovered ? `var(--shadow), 0 0 0 1px ${gc}18` : 'var(--shadow-sm)',
          transform: hovered ? 'translateY(-3px)' : 'none',
          transition: 'box-shadow .22s cubic-bezier(.4,0,.2,1), transform .22s, border-color .22s',
          position: 'relative',
          cursor: 'pointer',
          /* Todas as partes do card têm altura fixa — grid fica uniforme */
          display: 'flex',
          flexDirection: 'column',
        }}>

        {/* Favorite star */}
        <button
          onClick={handleStarClick}
          className={starAnim ? 'star-pop' : ''}
          title={isFav ? 'Remover favorito' : 'Adicionar favorito'}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 28, height: 28, borderRadius: 8, zIndex: 2,
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isFav ? 'rgba(244,197,66,0.14)' : 'transparent',
            transition: 'all .18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,197,66,0.20)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = isFav ? 'rgba(244,197,66,0.14)' : 'transparent'; }}>
          <Star size={13} fill={isFav ? '#F4C542' : 'none'} stroke={isFav ? '#F4C542' : 'var(--t3)'} style={{ transition: 'all .18s' }} />
        </button>

        {/* ── Corpo do card — padding uniforme, sem expansão ── */}
        <div style={{ padding: '18px 16px 0', display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Grupo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
              padding: '3px 11px', borderRadius: 99,
              background: gc + '14', color: gc, border: `1px solid ${gc}28`,
            }}>
              GRUPO {match.group}
            </span>
          </div>

          {/* Times — zona de altura fixa */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 6,
            marginBottom: 14,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
              <Flag team={match.home} size="lg" />
              <span style={{
                fontSize: 12, fontWeight: 700, color: 'var(--t1)',
                textAlign: 'center', lineHeight: 1.2,
                /* Altura fixa para 2 linhas — nomes curtos/longos ficam iguais */
                minHeight: '2.4em', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {match.home}
              </span>
            </div>

            <div style={{ flexShrink: 0, padding: '0 2px' }}>
              <span style={{ fontFamily: 'var(--font-d)', fontSize: 10, fontWeight: 700, color: 'var(--t3)', letterSpacing: 2 }}>VS</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
              <Flag team={match.away} size="lg" />
              <span style={{
                fontSize: 12, fontWeight: 700, color: 'var(--t1)',
                textAlign: 'center', lineHeight: 1.2,
                minHeight: '2.4em', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {match.away}
              </span>
            </div>
          </div>

          {/* Horário */}
          <div style={{
            textAlign: 'center',
            padding: '10px 0',
            borderTop: '1px solid var(--line)',
            borderBottom: '1px solid var(--line)',
            marginBottom: 10,
          }}>
            <div style={{
              fontFamily: 'var(--font-d)',
              fontSize: 28, fontWeight: 800, color: 'var(--t1)',
              fontVariantNumeric: 'tabular-nums', lineHeight: 1,
            }}>
              {match.timeBRT}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 3 }}>
              <span style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 700, letterSpacing: '0.06em' }}>BRT</span>
              {isMadrugada && (
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 5,
                  background: 'rgba(99,102,241,0.10)', color: '#6366f1',
                  border: '1px solid rgba(99,102,241,0.18)',
                }}>🌙 madrugada</span>
              )}
            </div>
          </div>

          {/* Venue */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 10 }}>
            <MapPin size={9} style={{ color: 'var(--t3)', flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: 'var(--t3)', textAlign: 'center', lineHeight: 1.3 }}>
              {match.venue} · Rod. {match.matchday}
            </span>
          </div>

          {/* Badge eventos */}
          <div style={{ display: 'flex', justifyContent: 'center', minHeight: 22, marginBottom: 4 }}>
            {hasEvents ? (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 99,
                background: 'var(--gold-bg)', color: 'var(--gold)',
                border: '1px solid var(--gold-line)',
              }}>
                ⚡ {events.length} evento{events.length > 1 ? 's' : ''}
              </span>
            ) : null}
          </div>
        </div>

        {/* ── Footer — botão adicionar evento ── */}
        <div style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--line)',
          padding: '10px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 600,
            color: hasEvents ? 'var(--green-dark)' : 'var(--t3)',
            transition: 'color .15s',
          }}>
            <Plus size={12} style={{ color: 'var(--green)' }} />
            {hasEvents ? 'Gerenciar eventos' : 'Adicionar evento'}
          </span>
        </div>
      </div>

      {/* Modal — fora do card, no topo da árvore */}
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
