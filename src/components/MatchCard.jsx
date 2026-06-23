import { useState } from 'react';
import { Plus, Star, MapPin, Pencil } from 'lucide-react';
import { groups, promoTypes } from '../data/matches';
import Flag from './Flag';
import EventModal from './EventModal';

const STATUS_OPTIONS = [
  { id: 'scheduled', label: 'A confirmar' },
  { id: 'live', label: 'Ao vivo' },
  { id: 'finished', label: 'Finalizado' },
];

function ResultEditor({ match, result, onUpdateResult, onClose }) {
  const [status, setStatus] = useState(result?.status || 'scheduled');
  const [homeScore, setHomeScore] = useState(result?.home_score ?? '');
  const [awayScore, setAwayScore] = useState(result?.away_score ?? '');

  const handleSave = (e) => {
    e.stopPropagation();
    onUpdateResult?.(match.id, {
      status,
      home_score: homeScore === '' ? null : Number(homeScore),
      away_score: awayScore === '' ? null : Number(awayScore),
    });
    onClose();
  };

  return (
    <div onClick={e => e.stopPropagation()} style={{
      padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8,
      background: 'var(--card2)', borderTop: '1px solid var(--line)',
    }}>
      <input type="number" value={homeScore} onChange={e => setHomeScore(e.target.value)}
        placeholder={match.home.slice(0, 3)}
        style={{ width: 40, padding: '5px 6px', borderRadius: 6, border: '1px solid var(--line2)', background: 'var(--bg)', color: 'var(--t1)', fontSize: 12, textAlign: 'center' }} />
      <span style={{ color: 'var(--t3)', fontSize: 11 }}>×</span>
      <input type="number" value={awayScore} onChange={e => setAwayScore(e.target.value)}
        placeholder={match.away.slice(0, 3)}
        style={{ width: 40, padding: '5px 6px', borderRadius: 6, border: '1px solid var(--line2)', background: 'var(--bg)', color: 'var(--t1)', fontSize: 12, textAlign: 'center' }} />
      <select value={status} onChange={e => setStatus(e.target.value)}
        style={{ flex: 1, padding: '5px 6px', borderRadius: 6, border: '1px solid var(--line2)', background: 'var(--bg)', color: 'var(--t1)', fontSize: 11 }}>
        {STATUS_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <button onClick={handleSave} style={{
        padding: '5px 10px', borderRadius: 6, border: 'none', background: 'var(--green)',
        color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
      }}>Salvar</button>
    </div>
  );
}

export default function MatchCard({ match, events, onAdd, onDelete, onUpdate, dayPromoActive, onOpenDayPromo, isFav = false, onToggleFavorite, isAdmin, result, onUpdateResult }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [starAnim, setStarAnim] = useState(false);
  const [editingResult, setEditingResult] = useState(false);
  const isLive = result?.status === 'live';
  const isFinished = result?.status === 'finished' && result.home_score != null && result.away_score != null;

  const gc = groups[match.group]?.color || '#888';
  const hasEvents = events.length > 0;
  const isMadrugada = parseInt(match.timeBRT) <= 4;

  const handleStarClick = (e) => {
    e.stopPropagation();
    onToggleFavorite?.(match.id);
    setStarAnim(true);
    setTimeout(() => setStarAnim(false), 300);
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    setModalOpen(true);
  };

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: isFav ? 'var(--fav-bg)' : 'var(--card)',
          borderRadius: 'var(--radius)',
          border: hovered
            ? `1px solid var(--green)`
            : isFav
              ? `1px solid var(--fav-line)`
              : `1px solid var(--line)`,
          borderTop: isFav ? `3px solid var(--fav-top)` : undefined,
          boxShadow: hovered
            ? `var(--shadow), 0 0 0 1px var(--green-glow)`
            : isFav ? 'var(--shadow)' : 'var(--shadow-sm)',
          transition: 'box-shadow .22s cubic-bezier(.4,0,.2,1), border-color .2s',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>

        {/* Faixa promoção do dia ativa */}
        {dayPromoActive && (
          <button
            onClick={(e) => { e.stopPropagation(); onOpenDayPromo?.(); }}
            title="Ver promoções do dia"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', padding: '5px 10px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #16C47F 0%, #0fa865 100%)',
              color: '#fff', fontSize: 9.5, fontWeight: 800,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
            🎯 Promoção do dia ativa
          </button>
        )}

        {/* ── Cabeçalho: horário + grupo + estrela ── */}
        <div style={{ padding: '12px 14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span style={{
              fontFamily: 'var(--font-d)', fontSize: 22, fontWeight: 800,
              color: 'var(--t1)', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
            }}>
              {match.timeBRT}
            </span>
            <span style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 700, letterSpacing: '0.06em' }}>BRT</span>
            {isMadrugada && <span style={{ fontSize: 11, lineHeight: 1 }} title="Madrugada">🌙</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontSize: 9, fontWeight: 800, letterSpacing: '0.05em',
              padding: '3px 8px', borderRadius: 99,
              background: gc, color: '#fff',
            }}>
              GRUPO {match.group}
            </span>
            <button
              onClick={handleStarClick}
              className={starAnim ? 'star-pop' : ''}
              title={isFav ? 'Remover favorito' : 'Adicionar favorito'}
              style={{
                width: 24, height: 24, borderRadius: 6, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isFav ? 'rgba(217,154,43,0.16)' : 'transparent', transition: 'all .18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(217,154,43,0.20)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = isFav ? 'rgba(217,154,43,0.16)' : 'transparent'; }}>
              <Star size={12} fill={isFav ? '#F4C542' : 'none'} stroke={isFav ? '#F4C542' : 'var(--t3)'} style={{ transition: 'all .18s' }} />
            </button>
          </div>
        </div>

        {/* ── Times: bandeiras em linha ── */}
        <div style={{ padding: '10px 14px 8px', display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {/* Casa */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
            <Flag team={match.home} size="md" />
            <span style={{
              fontSize: 13, fontWeight: 700, color: 'var(--t1)', lineHeight: 1.2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
            }}>
              {match.home}
            </span>
          </div>
          {/* VS / Placar */}
          {isFinished || isLive ? (
            <span style={{
              fontFamily: 'var(--font-d)', fontSize: 16, fontWeight: 800, flexShrink: 0,
              color: isLive ? '#E0383F' : 'var(--t1)', display: 'flex', alignItems: 'center', gap: 5,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {isLive && (
                <span style={{
                  width: 6, height: 6, borderRadius: 99, background: '#E0383F', display: 'inline-block',
                  animation: 'pulse-dot 1.2s infinite',
                }} />
              )}
              {result.home_score ?? 0}-{result.away_score ?? 0}
            </span>
          ) : (
            <span style={{
              fontFamily: 'var(--font-d)', fontSize: 9, fontWeight: 700,
              color: 'var(--t3)', letterSpacing: 2, flexShrink: 0,
            }}>vs</span>
          )}
          {/* Visitante */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
            <span style={{
              fontSize: 13, fontWeight: 700, color: 'var(--t1)', lineHeight: 1.2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              textAlign: 'right', minWidth: 0,
            }}>
              {match.away}
            </span>
            <Flag team={match.away} size="md" />
          </div>
        </div>

        {/* Venue */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, padding: '0 14px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
            <MapPin size={9} style={{ color: 'var(--t3)', flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: 'var(--t3)', lineHeight: 1.3 }}>
              {match.venue} · Rod. {match.matchday}
            </span>
          </div>
          {isAdmin && (
            <button
              onClick={e => { e.stopPropagation(); setEditingResult(p => !p); }}
              title="Editar placar/status"
              style={{
                width: 20, height: 20, borderRadius: 5, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: editingResult ? 'var(--green-bg)' : 'transparent', color: 'var(--t3)',
              }}>
              <Pencil size={10} />
            </button>
          )}
        </div>

        {editingResult && (
          <ResultEditor match={match} result={result} onUpdateResult={onUpdateResult} onClose={() => setEditingResult(false)} />
        )}

        {/* ── Seção de promoções ── */}
        <div style={{ borderTop: '1px solid var(--line)', flex: 1 }}>

          {/* Cabeçalho da seção */}
          <div style={{ padding: '10px 14px 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Promoções
            </span>
            {hasEvents && (
              <span style={{
                fontSize: 10, fontWeight: 800,
                minWidth: 18, height: 18, padding: '0 5px', borderRadius: 99,
                background: 'var(--green)', color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {events.length}
              </span>
            )}
          </div>

          {/* Lista de promoções */}
          {hasEvents ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {events.map((ev, i) => {
                const t = promoTypes.find(p => p.id === ev.type);
                const isLast = i === events.length - 1;
                return (
                  <div
                    key={ev.id}
                    onClick={() => setModalOpen(true)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '9px 14px',
                      borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                      borderBottom: isLast && !isAdmin ? 'none' : undefined,
                      cursor: 'pointer', transition: 'background .12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--card2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Ícone colorido */}
                    <div style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      background: t?.tint || 'var(--card2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15,
                    }}>
                      {t?.icon}
                    </div>
                    {/* Texto */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--t1)', lineHeight: 1.3, marginBottom: ev.description ? 2 : 0 }}>
                        {ev.title}
                      </div>
                      {ev.description && (
                        <div style={{
                          fontSize: 11, color: 'var(--t2)', lineHeight: 1.4,
                          overflow: 'hidden', display: '-webkit-box',
                          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        }}>
                          {ev.description}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '8px 14px 12px' }}>
              <span style={{ fontSize: 11.5, color: 'var(--t3)', fontStyle: 'italic' }}>Sem promoções cadastradas</span>
            </div>
          )}

          {/* Botão adicionar — só admin */}
          {isAdmin && (
            <button
              onClick={handleAddClick}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '11px 14px',
                border: 'none', borderTop: '1px solid var(--line)',
                background: 'transparent',
                color: 'var(--green)', cursor: 'pointer',
                fontSize: 12, fontWeight: 700,
                transition: 'background .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--green-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Plus size={13} />
              Adicionar promoção
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <EventModal
          match={match}
          events={events}
          onAdd={onAdd}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onClose={() => setModalOpen(false)}
          groupColor={gc}
          isAdmin={isAdmin}
        />
      )}
    </>
  );
}
