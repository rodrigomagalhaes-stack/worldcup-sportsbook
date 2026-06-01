import { useState, useEffect, useCallback } from 'react';
import { fetchAllEvents, insertEvent, updateEvent as sbUpdate, deleteEvent as sbDelete, fetchGeneralPromotions, insertGeneralPromotion, updateGeneralPromotion as sbUpdateGP, deleteGeneralPromotion, fetchDayPromotions, insertDayPromotion, updateDayPromotion as sbUpdateDP, deleteDayPromotion } from '../lib/supabase';

const DAY_PROMO_LIMIT_MSG = 'Limite de 2 promoções do dia ativas atingido para esta data.';

function isLimitError(err) {
  return String(err?.message || '').includes('Limite de 2');
}

export function useStore() {
  const [events, setEvents] = useState({});
  const [generalPromotions, setGeneralPromotions] = useState([]);
  const [dayPromotions, setDayPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAllEvents().then(setEvents),
      fetchGeneralPromotions().then(setGeneralPromotions),
      fetchDayPromotions().then(setDayPromotions),
    ])
      .catch(err => console.error('Supabase fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const addEvent = useCallback(async (matchId, ev) => {
    try {
      const saved = await insertEvent(matchId, ev);
      setEvents(p => ({ ...p, [matchId]: [...(p[matchId] || []), saved] }));
    } catch (err) {
      console.error('addEvent error:', err);
    }
  }, []);

  const updateEvent = useCallback(async (matchId, evId, upd) => {
    try {
      const saved = await sbUpdate(evId, upd);
      setEvents(p => ({
        ...p,
        [matchId]: (p[matchId] || []).map(e => e.id === evId ? saved : e),
      }));
    } catch (err) {
      console.error('updateEvent error:', err);
    }
  }, []);

  const deleteEvent = useCallback(async (matchId, evId) => {
    try {
      await sbDelete(evId);
      setEvents(p => ({
        ...p,
        [matchId]: (p[matchId] || []).filter(e => e.id !== evId),
      }));
    } catch (err) {
      console.error('deleteEvent error:', err);
    }
  }, []);

  const addGeneralPromotion = useCallback(async (promo) => {
    try {
      const saved = await insertGeneralPromotion(promo);
      setGeneralPromotions(p => [saved, ...p]);
    } catch (err) {
      console.error('addGeneralPromotion error:', err);
    }
  }, []);

  const updateGeneralPromotionLocal = useCallback(async (promoId, upd) => {
    try {
      const saved = await sbUpdateGP(promoId, upd);
      setGeneralPromotions(p => p.map(gp => gp.id === promoId ? saved : gp));
    } catch (err) {
      console.error('updateGeneralPromotion error:', err);
    }
  }, []);

  const deleteGeneralPromotionLocal = useCallback(async (promoId) => {
    try {
      await deleteGeneralPromotion(promoId);
      setGeneralPromotions(p => p.filter(gp => gp.id !== promoId));
    } catch (err) {
      console.error('deleteGeneralPromotion error:', err);
    }
  }, []);

  // ── Day Promotions (optimistic) ──────────────────────────
  const addDayPromotion = useCallback(async (data) => {
    const payload = { state: 'active', description: '', rules: '', note: '', ...data };
    const tempId = `temp-${Date.now()}`;
    const optimistic = { id: tempId, created_at: new Date().toISOString(), ...payload };
    setDayPromotions(p => [...p, optimistic]);
    try {
      const saved = await insertDayPromotion(payload);
      setDayPromotions(p => p.map(x => (x.id === tempId ? saved : x)));
    } catch (err) {
      setDayPromotions(p => p.filter(x => x.id !== tempId));
      if (isLimitError(err)) alert(DAY_PROMO_LIMIT_MSG);
      else console.error('addDayPromotion error:', err);
    }
  }, []);

  const updateDayPromotionLocal = useCallback(async (id, patch) => {
    let snapshot;
    setDayPromotions(p => { snapshot = p; return p.map(x => (x.id === id ? { ...x, ...patch } : x)); });
    try {
      const saved = await sbUpdateDP(id, patch);
      setDayPromotions(p => p.map(x => (x.id === id ? saved : x)));
    } catch (err) {
      if (snapshot) setDayPromotions(snapshot);
      if (isLimitError(err)) alert(DAY_PROMO_LIMIT_MSG);
      else console.error('updateDayPromotion error:', err);
    }
  }, []);

  const deleteDayPromotionLocal = useCallback(async (id) => {
    let snapshot;
    setDayPromotions(p => { snapshot = p; return p.filter(x => x.id !== id); });
    try {
      await deleteDayPromotion(id);
    } catch (err) {
      if (snapshot) setDayPromotions(snapshot);
      console.error('deleteDayPromotion error:', err);
    }
  }, []);

  const activateStandbyPromotion = useCallback((id) => {
    return updateDayPromotionLocal(id, { state: 'active' });
  }, [updateDayPromotionLocal]);

  return {
    events, loading, addEvent, updateEvent, deleteEvent,
    generalPromotions, addGeneralPromotion, updateGeneralPromotionLocal, deleteGeneralPromotionLocal,
    dayPromotions, addDayPromotion, updateDayPromotionLocal, deleteDayPromotionLocal, activateStandbyPromotion,
  };
}

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('sb_theme') || 'light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sb_theme', theme);
  }, [theme]);
  return { theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') };
}
