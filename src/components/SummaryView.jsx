import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { matches, promoTypes } from '../data/matches';
import Flag from './Flag';

export default function SummaryView({ events }) {
  const summary = useMemo(() => {
    const bd = {};
    matches.forEach(m => {
      const evs = events[m.id]||[];
      if (evs.length) { if (!bd[m.date]) bd[m.date]=[]; bd[m.date].push({match:m,evs}); }
    });
    return Object.entries(bd).sort(([a],[b])=>a.localeCompare(b));
  }, [events]);

  const stats = useMemo(() => {
    let total=0; const typeMap={};
    Object.values(events).forEach(evs => evs.forEach(e => { total++; typeMap[e.type]=(typeMap[e.type]||0)+1; }));
    return { total, typeMap, days: summary.length, covered: Object.keys(events).filter(id=>events[id]?.length).length };
  }, [events, summary]);

  if (!stats.total) return (
    <div style={{ textAlign:'center', padding:'100px 0', color:'var(--t3)' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>📋</div>
      <p style={{ fontSize:15, fontWeight:500, marginBottom:6 }}>Nenhum evento cadastrado ainda.</p>
      <p style={{ fontSize:13 }}>Selecione um jogo no calendário e adicione promoções.</p>
    </div>
  );

  return (
    <div>
      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:32 }}>
        {[
          { label:'Total de eventos', value:stats.total,   color:'var(--gold)',  bg:'var(--gold-bg)' },
          { label:'Dias com eventos', value:stats.days,    color:'var(--green)', bg:'var(--green-bg)' },
          { label:'Jogos cobertos',   value:stats.covered, color:'#6366f1',      bg:'rgba(99,102,241,0.08)' },
        ].map(s => (
          <div key={s.label} style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:'var(--radius)', padding:'20px 24px', boxShadow:'var(--shadow-sm)' }}>
            <div style={{ fontFamily:'var(--font-d)', fontSize:40, fontWeight:700, color:s.color, lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--t3)', marginTop:6, fontWeight:500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Type breakdown */}
      <div style={{ display:'flex', gap:10, marginBottom:32, flexWrap:'wrap' }}>
        {promoTypes.filter(pt=>stats.typeMap[pt.id]).map(pt => (
          <div key={pt.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:'var(--radius-s)',
            background:'var(--card)', border:'1px solid var(--line)', boxShadow:'var(--shadow-sm)' }}>
            <span style={{ fontSize:18 }}>{pt.icon}</span>
            <div>
              <div style={{ fontSize:11, color:'var(--t3)', fontWeight:500 }}>{pt.label}</div>
              <div style={{ fontSize:16, fontWeight:800, color:pt.color }}>{stats.typeMap[pt.id]}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
        {summary.map(([date, items], di) => (
          <motion.div key={date} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:di*.05}}>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
              <div style={{ height:1, flex:1, background:'var(--line)' }} />
              <span style={{ fontSize:12, fontWeight:700, color:'var(--t2)', textTransform:'capitalize', whiteSpace:'nowrap',
                padding:'4px 14px', borderRadius:99, background:'var(--card)', border:'1px solid var(--line)' }}>
                {format(parseISO(date),"EEEE, d 'de' MMMM",{locale:ptBR})}
              </span>
              <div style={{ height:1, flex:1, background:'var(--line)' }} />
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {items.map(({match,evs}) => (
                <div key={match.id} style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:'var(--radius)', overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
                  {/* match header */}
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 18px', background:'var(--card2)', borderBottom:'1px solid var(--line)' }}>
                    <Flag team={match.home} size="sm" />
                    <span style={{ fontWeight:700, fontSize:14 }}>{match.home}</span>
                    <span style={{ fontSize:12, color:'var(--t3)', margin:'0 4px' }}>×</span>
                    <span style={{ fontWeight:700, fontSize:14 }}>{match.away}</span>
                    <Flag team={match.away} size="sm" />
                    <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
                      <span style={{ fontSize:12, fontWeight:600, color:'var(--t2)' }}>{match.timeBRT} BRT</span>
                      <span style={{ fontSize:11, color:'var(--t3)' }}>{match.venue}</span>
                    </div>
                  </div>
                  {/* events */}
                  <div style={{ padding:'12px 18px', display:'flex', flexDirection:'column', gap:8 }}>
                    {evs.map(ev => {
                      const type = promoTypes.find(t=>t.id===ev.type);
                      return (
                        <div key={ev.id} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'10px 14px',
                          background:'var(--bg)', borderRadius:'var(--radius-xs)', borderLeft:`4px solid ${type?.color}` }}>
                          <span style={{ fontSize:18 }}>{type?.icon}</span>
                          <div style={{ flex:1 }}>
                            <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:3, flexWrap:'wrap' }}>
                              <span style={{ fontSize:11, fontWeight:700, color:type?.color, background:type?.color+'18', padding:'2px 9px', borderRadius:99 }}>{type?.label}</span>
                              <span style={{ fontSize:14, fontWeight:700, color:'var(--t1)' }}>{ev.title}</span>
                            </div>
                            {ev.description && <p style={{ fontSize:12, color:'var(--t2)' }}>{ev.description}</p>}
                            {ev.rules && <p style={{ fontSize:11, color:'var(--t3)', marginTop:4, fontStyle:'italic' }}>📜 {ev.rules}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
