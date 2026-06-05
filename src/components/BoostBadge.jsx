export default function BoostBadge({ boost }) {
  const { price, boostInfo, isBB, odds } = boost;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 10px',
      background: 'linear-gradient(90deg, rgba(251,146,60,0.12) 0%, rgba(251,191,36,0.10) 100%)',
      borderBottom: '1px solid rgba(249,115,22,0.15)',
    }}>
      <span style={{ fontSize: 12, lineHeight: 1, flexShrink: 0 }}>
        {isBB ? '🔗' : '⚡'}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: '#f97316', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 1 }}>
          {isBB ? `Bet Builder · ${odds?.length} seleções` : 'Odd Boost'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textDecoration: 'line-through' }}>
            {price?.toFixed(2)}
          </span>
          <span style={{ fontSize: 10, color: 'var(--t3)' }}>→</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#f97316', fontFamily: 'var(--font-d)' }}>
            {boostInfo?.price?.toFixed(2)}
          </span>
          {boostInfo?.betsLimit && (
            <span style={{ fontSize: 9, color: 'var(--t3)', marginLeft: 2 }}>
              lim. {boostInfo.betsLimit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
