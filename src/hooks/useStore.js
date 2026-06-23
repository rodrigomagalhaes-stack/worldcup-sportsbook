import { useState, useEffect, useCallback } from 'react';
import { fetchAllEvents, insertEvent, updateEvent as sbUpdate, deleteEvent as sbDelete, fetchGeneralPromotions, insertGeneralPromotion, updateGeneralPromotion as sbUpdateGP, deleteGeneralPromotion, fetchDayPromotions, insertDayPromotion, updateDayPromotion as sbUpdateDP, deleteDayPromotion, fetchFavorites, insertFavorite, deleteFavorite, fetchMatchResults, upsertMatchResult, fetchKnockoutMatches, upsertKnockoutMatch, fetchSyncStatus, triggerSync, supabase } from '../lib/supabase';

const DAY_PROMO_LIMIT_MSG = 'Limite de 2 promoções do dia ativas atingido para esta data.';

function isLimitError(err) {
  return String(err?.message || '').includes('Limite de 2');
}

export function useStore() {
  const [events, setEvents] = useState({});
  const [generalPromotions, setGeneralPromotions] = useState([]);
  const [dayPromotions, setDayPromotions] = useState([]);
  const [matchResults, setMatchResults] = useState({});
  const [knockoutMatches, setKnockoutMatches] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    // Fallback: localStorage para visitantes antes do fetch terminar
    try { return new Set(JSON.parse(localStorage.getItem('sb_favs') || '[]')); } catch { return new Set(); }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAllEvents().then(setEvents),
      fetchGeneralPromotions().then(setGeneralPromotions),
      fetchDayPromotions().then(setDayPromotions),
      fetchMatchResults().then(setMatchResults),
      fetchKnockoutMatches().then(setKnockoutMatches),
      fetchSyncStatus().then(setSyncStatus).catch(() => {}),
      fetchFavorites().then(favSet => {
        setFavorites(favSet);
        // Sincroniza localStorage com o banco
        localStorage.setItem('sb_favs', JSON.stringify([...favSet]));
      }),
    ])
      .catch(err => console.error('Supabase fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  // Dados reais (placar/status) são atualizados no servidor por um cron a
  // cada poucos minutos — repolling periódico mantém a tela ao vivo sem
  // exigir refresh manual.
  useEffect(() => {
    const id = setInterval(() => {
      fetchMatchResults().then(setMatchResults).catch(() => {});
      fetchKnockoutMatches().then(setKnockoutMatches).catch(() => {});
      fetchSyncStatus().then(setSyncStatus).catch(() => {});
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const syncNow = useCallback(async () => {
    setSyncStatus(s => ({ ...(s || {}), status: 'running' }));
    try {
      await triggerSync();
    } catch (err) {
      console.error('syncNow error:', err);
    } finally {
      const [mr, ko, ss] = await Promise.all([
        fetchMatchResults().catch(() => null),
        fetchKnockoutMatches().catch(() => null),
        fetchSyncStatus().catch(() => null),
      ]);
      if (mr) setMatchResults(mr);
      if (ko) setKnockoutMatches(ko);
      if (ss) setSyncStatus(ss);
    }
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

  // ── Match Results (placar fase de grupos, optimistic) ───
  const updateMatchResult = useCallback(async (matchId, patch) => {
    let snapshot;
    setMatchResults(p => { snapshot = p; return { ...p, [matchId]: { ...p[matchId], match_id: matchId, ...patch } }; });
    try {
      const saved = await upsertMatchResult(matchId, patch);
      setMatchResults(p => ({ ...p, [matchId]: saved }));
    } catch (err) {
      if (snapshot) setMatchResults(snapshot);
      console.error('updateMatchResult error:', err);
    }
  }, []);

  // ── Knockout Matches (mata-mata, optimistic) ────────────
  const updateKnockoutMatch = useCallback(async (id, patch) => {
    let snapshot;
    setKnockoutMatches(p => {
      snapshot = p;
      return p.map(m => (m.id === id ? { ...m, ...patch } : m));
    });
    try {
      const saved = await upsertKnockoutMatch(id, patch);
      setKnockoutMatches(p => p.map(m => (m.id === id ? saved : m)));
    } catch (err) {
      if (snapshot) setKnockoutMatches(snapshot);
      console.error('updateKnockoutMatch error:', err);
    }
  }, []);

  // ── Favorites (optimistic) ───────────────────────────────
  const toggleFavorite = useCallback(async (matchId) => {
    const isFav = favorites.has(matchId);
    // Optimistic update
    setFavorites(prev => {
      const next = new Set(prev);
      isFav ? next.delete(matchId) : next.add(matchId);
      localStorage.setItem('sb_favs', JSON.stringify([...next]));
      return next;
    });
    try {
      if (isFav) await deleteFavorite(matchId);
      else await insertFavorite(matchId);
    } catch (err) {
      // Reverter em caso de erro
      setFavorites(prev => {
        const next = new Set(prev);
        isFav ? next.add(matchId) : next.delete(matchId);
        localStorage.setItem('sb_favs', JSON.stringify([...next]));
        return next;
      });
      console.error('toggleFavorite error:', err);
    }
  }, [favorites]);

  return {
    events, loading, addEvent, updateEvent, deleteEvent,
    generalPromotions, addGeneralPromotion, updateGeneralPromotionLocal, deleteGeneralPromotionLocal,
    dayPromotions, addDayPromotion, updateDayPromotionLocal, deleteDayPromotionLocal, activateStandbyPromotion,
    matchResults, updateMatchResult,
    knockoutMatches, updateKnockoutMatch,
    syncStatus, syncNow,
    favorites, toggleFavorite,
  };
}

export function useAuth() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { isAdmin: !!session, authLoading, signIn, signOut };
}

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('sb_theme') || 'light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sb_theme', theme);
  }, [theme]);
  return { theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') };
}
