import { useState, useEffect, useCallback } from 'react';
import { fetchAllEvents, insertEvent, updateEvent as sbUpdate, deleteEvent as sbDelete } from '../lib/supabase';

export function useStore() {
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllEvents()
      .then(setEvents)
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

  return { events, loading, addEvent, updateEvent, deleteEvent };
}

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('sb_theme') || 'light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sb_theme', theme);
  }, [theme]);
  return { theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') };
}
