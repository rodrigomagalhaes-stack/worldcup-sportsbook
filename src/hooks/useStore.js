import { useState, useEffect, useCallback } from 'react';
import { fetchAllEvents, insertEvent, updateEvent as sbUpdate, deleteEvent as sbDelete, fetchGeneralPromotions, insertGeneralPromotion, updateGeneralPromotion as sbUpdateGP, deleteGeneralPromotion } from '../lib/supabase';

export function useStore() {
  const [events, setEvents] = useState({});
  const [generalPromotions, setGeneralPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAllEvents().then(setEvents),
      fetchGeneralPromotions().then(setGeneralPromotions),
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

  return { events, loading, addEvent, updateEvent, deleteEvent, generalPromotions, addGeneralPromotion, updateGeneralPromotionLocal, deleteGeneralPromotionLocal };
}

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('sb_theme') || 'light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sb_theme', theme);
  }, [theme]);
  return { theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') };
}
