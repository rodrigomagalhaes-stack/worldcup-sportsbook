import { useState, useEffect } from 'react';
import { getAltenarEvents, getEventDetails } from '../lib/altenar';

function utcToTimeBRT(isoString) {
  const utcMs = new Date(isoString).getTime();
  const brtDate = new Date(utcMs - 3 * 60 * 60 * 1000);
  const h = String(brtDate.getUTCHours()).padStart(2, '0');
  const m = String(brtDate.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function utcToBRTDate(isoString) {
  const utcMs = new Date(isoString).getTime();
  return new Date(utcMs - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// Cada entrada do Map: { boosts: [], markets: Map<marketId, { name, selections: Map<selectionId, name> }> }
// Keyed por timeBRT ("HH:MM")
export function useAltenarBoosts(selectedDate) {
  const [detailsByTimeBRT, setDetailsByTimeBRT] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedDate) return;

    let active = true;
    setLoading(true);
    setError(null);
    setDetailsByTimeBRT(new Map());

    (async () => {
      try {
        const events = await getAltenarEvents();
        if (!active) return;

        const dayEvents = events.filter(
          ev => ev.startDate && utcToBRTDate(ev.startDate) === selectedDate
        );

        console.log(`[Altenar] ${dayEvents.length} evento(s) no dia ${selectedDate}:`, dayEvents.map(e => `${utcToTimeBRT(e.startDate)} ${e.name}`));

        if (dayEvents.length === 0) { setLoading(false); return; }

        const results = await Promise.allSettled(
          dayEvents.map(ev =>
            getEventDetails(ev.id, ev.name).then(({ boosts, markets, oddsMap }) => ({
              timeBRT: utcToTimeBRT(ev.startDate),
              boosts,
              markets,
              oddsMap,
            }))
          )
        );

        if (!active) return;

        const map = new Map();
        for (const r of results) {
          if (r.status === 'fulfilled' && r.value.boosts.length > 0) {
            map.set(r.value.timeBRT, {
              boosts: r.value.boosts,
              markets: r.value.markets,
              oddsMap: r.value.oddsMap,
            });
          }
        }
        setDetailsByTimeBRT(map);
      } catch (err) {
        if (active) {
          console.error('[Altenar] Erro:', err.message);
          setError(err.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [selectedDate]);

  // Compat: boostsByTimeBRT retorna só os boosts para quem precisar
  const boostsByTimeBRT = new Map(
    [...detailsByTimeBRT.entries()].map(([t, v]) => [t, v.boosts])
  );

  return { detailsByTimeBRT, boostsByTimeBRT, loading, error };
}