import { teamFlags } from '../data/matches';
export default function Flag({ team, size = 'lg' }) {
  const code = teamFlags[team];
  const cls = size === 'sm' ? 'flag-sm' : 'flag-lg';
  if (!code) return <span className={cls} style={{ background:'var(--line)', display:'inline-block', borderRadius: size==='sm'?3:6 }} />;
  return <img src={`https://flagcdn.com/w80/${code}.png`} alt={team} className={cls} onError={e=>{e.target.style.opacity=0.2}} />;
}
