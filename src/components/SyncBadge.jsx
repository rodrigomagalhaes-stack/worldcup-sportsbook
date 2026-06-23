import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/* ─────────────────────────────────────────
   Indicador de sincronização com a API real
   (football-data.org) + botão manual (admin).
───────────────────────────────────────── */
export default function SyncBadge({ syncStatus, onSyncNow, isAdmin }) {
  const [spinning, setSpinning] = useState(false);

  const status = syncStatus?.status || 'idle';
  const lastOk = syncStatus?.last_ok_at;

  const handleClick = async () => {
    if (!onSyncNow || spinning) return;
    setSpinning(true);
    try {
      await onSyncNow();
    } finally {
      setSpinning(false);
    }
  };

  const label = status === 'error'
    ? 'Erro na sincronização'
    : lastOk
      ? `Sincronizado ${formatDistanceToNow(parseISO(lastOk), { locale: ptBR, addSuffix: true })}`
      : 'Aguardando primeira sincronização';

  const Icon = status === 'error' ? AlertCircle : (lastOk ? Wifi : WifiOff);
  const color = status === 'error' ? '#E0383F' : (lastOk ? 'var(--green)' : 'var(--t3)');

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 12px', borderRadius: 99,
      border: '1px solid var(--line)', background: 'var(--card2)',
      fontSize: 11.5, color: 'var(--t2)', flexShrink: 0,
    }} title={syncStatus?.message || ''}>
      <Icon size={13} style={{ color, flexShrink: 0 }} />
      <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
      {isAdmin && onSyncNow && (
        <button onClick={handleClick} disabled={spinning || status === 'running'}
          title="Sincronizar agora"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, borderRadius: 99, border: 'none',
            background: 'transparent', color: 'var(--t2)',
            cursor: spinning ? 'default' : 'pointer', flexShrink: 0,
          }}>
          <motion.div
            animate={(spinning || status === 'running') ? { rotate: 360 } : {}}
            transition={(spinning || status === 'running') ? { duration: 0.9, repeat: Infinity, ease: 'linear' } : {}}
            style={{ display: 'flex' }}>
            <RefreshCw size={13} />
          </motion.div>
        </button>
      )}
    </div>
  );
}
