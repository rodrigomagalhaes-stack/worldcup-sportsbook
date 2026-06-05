import { teamFlags } from '../data/matches';
export default function Flag({ team, size = 'lg' }) {
  const code = teamFlags[team];
  const cls = size === 'sm' ? 'flag-sm' : size === 'md' ? 'flag-md' : 'flag-lg';
  const radius = size === 'sm' ? 3 : size === 'md' ? 5 : 6;
  if (!code) return <span className={cls} style={{ background:'var(--line)', display:'inline-block', borderRadius: radius }} />;
  return <img src={`https://flagcdn.com/w80/${code}.png`} alt={team} className={cls} onError={e=>{e.target.style.opacity=0.2}} />;
}
