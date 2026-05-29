import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, BarChart3, Zap, Sun, Moon, Printer, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import DateBar from './components/DateBar';
import DayView from './components/DayView';
import SummaryView from './components/SummaryView';
import GeneralPromotionsView from './components/GeneralPromotionsView';
import { useStore, useTheme } from './hooks/useStore';
import { matches } from './data/matches';

function getDefault() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const all = [...new Set(matches.map(m => m.date))].sort();
  return all.includes(today) ? today : all[0];
}

const TABS = [
  { id: 'day',      label: 'Calendário', icon: CalendarDays },
  { id: 'summary',  label: 'Resumo',     icon: BarChart3 },
  { id: 'general',  label: 'Geral',      icon: Zap },
];

export default function App() {
  const [tab, setTab] = useState('day');
  const [date, setDate] = useState(getDefault);
  const { events, loading, addEvent, updateEvent, deleteEvent, generalPromotions, addGeneralPromotion, updateGeneralPromotionLocal, deleteGeneralPromotionLocal } = useStore();
  const { theme, toggle } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <header style={{
        flexShrink: 0,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--line)',
        boxShadow: 'var(--shadow-sm)',
        zIndex: 50,
      }}>
        {/* Logo + Nav */}
        <div style={{ height: 58, display: 'flex', alignItems: 'center', padding: '0 clamp(16px,3vw,32px)', gap: 'clamp(12px,2vw,24px)' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'linear-gradient(135deg, #16C47F 0%, #0fa865 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: 'var(--shadow-green)',
            }}>🏆</div>
            <div>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: 'clamp(15px,2vw,18px)', fontWeight: 800, color: 'var(--t1)', letterSpacing: '0.06em', lineHeight: 1 }}>
                COPA 2026
              </div>
              <div style={{ fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 1 }}>
                Sportsbook Calendar
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 28, background: 'var(--line2)', flexShrink: 0 }} />

          {/* Segmented control */}
          <nav style={{
            display: 'flex', gap: 2, padding: '3px',
            background: 'var(--bg)', borderRadius: 'var(--radius-s)',
            border: '1px solid var(--line)',
          }}>
            {TABS.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: 'clamp(5px,0.8vw,7px) clamp(10px,1.5vw,16px)',
                    borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: 'clamp(11px,1.2vw,13px)', fontWeight: active ? 600 : 500,
                    transition: 'all .18s cubic-bezier(.4,0,.2,1)',
                    background: active ? 'var(--surface)' : 'transparent',
                    color: active ? 'var(--green)' : 'var(--t2)',
                    boxShadow: active ? 'var(--shadow-sm)' : 'none',
                  }}>
                  <Icon size={13} />
                  {t.label}
                </button>
              );
            })}
          </nav>

          {/* Right actions */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => window.print()} title="Imprimir"
              style={{
                width: 36, height: 36, borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--line)', background: 'transparent',
                color: 'var(--t3)', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--t1)'; e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.style.background = 'var(--card2)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--t3)'; e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'transparent'; }}>
              <Printer size={14} />
            </button>

            <button onClick={toggle}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px clamp(10px,1.5vw,16px)',
                borderRadius: 'var(--radius-xs)', border: '1px solid var(--line)',
                background: 'var(--card2)', color: 'var(--t2)', cursor: 'pointer',
                fontSize: 'clamp(11px,1.2vw,13px)', fontWeight: 500,
                transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.background = 'var(--green-bg)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--t2)'; e.currentTarget.style.background = 'var(--card2)'; }}>
              {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
              <span style={{ display: 'none', ['@media(minWidth:480px)']: { display: 'inline' } }}>
                {theme === 'dark' ? 'Claro' : 'Escuro'}
              </span>
              {theme === 'dark' ? 'Claro' : 'Escuro'}
            </button>
          </div>
        </div>

        {/* DateBar */}
        {tab === 'day' && (
          <DateBar selectedDate={date} onSelect={setDate} events={events} />
        )}
      </header>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: 'clamp(20px,3vw,40px) clamp(16px,4vw,48px)' }}>
        {loading ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 16, height: '100%', minHeight: 320, color: 'var(--t3)',
          }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'flex' }}>
              <Loader2 size={36} style={{ color: 'var(--green)' }} />
            </motion.div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--t2)' }}>Carregando dados...</p>
          </div>
        ) : (
        <AnimatePresence mode="wait">
          {tab === 'day' && (
            <motion.div key="day"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: .14 }}>
              <DayView selectedDate={date} events={events} onAdd={addEvent} onDelete={deleteEvent} onUpdate={updateEvent} />
            </motion.div>
          )}
          {tab === 'summary' && (
            <motion.div key="sum"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: .14 }}>
              <div style={{ maxWidth: 960, margin: '0 auto' }}>
                <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--line)' }}>
                  <h1 style={{ fontFamily: 'var(--font-d)', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, color: 'var(--t1)', letterSpacing: '0.02em' }}>
                    Resumo Geral
                  </h1>
                  <p style={{ fontSize: 14, color: 'var(--t2)', marginTop: 6 }}>Todos os eventos cadastrados na Copa 2026</p>
                </div>
                <SummaryView events={events} onDelete={deleteEvent} onUpdate={updateEvent} generalPromotions={generalPromotions} />
              </div>
            </motion.div>
          )}
          {tab === 'general' && (
            <motion.div key="gen"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: .14 }}>
              <GeneralPromotionsView
                generalPromotions={generalPromotions}
                onAdd={addGeneralPromotion}
                onUpdate={updateGeneralPromotionLocal}
                onDelete={deleteGeneralPromotionLocal}
              />
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </main>
    </div>
  );
}
