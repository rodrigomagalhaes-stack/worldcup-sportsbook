import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Events ──────────────────────────────────────────────────

export async function fetchEventsByMatch(matchId) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at');
  if (error) throw error;
  return data;
}

export async function fetchAllEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at');
  if (error) throw error;
  // Retorna no mesmo formato do useStore: { [matchId]: [...events] }
  return data.reduce((acc, ev) => {
    const key = ev.match_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(ev);
    return acc;
  }, {});
}

export async function insertEvent(matchId, ev) {
  const { data, error } = await supabase
    .from('events')
    .insert({ match_id: matchId, ...ev })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEvent(evId, updates) {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', evId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEvent(evId) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', evId);
  if (error) throw error;
}

// ── General Promotions ──────────────────────────────────────

export async function fetchGeneralPromotions() {
  const { data, error } = await supabase
    .from('general_promotions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertGeneralPromotion(promo) {
  const { data, error } = await supabase
    .from('general_promotions')
    .insert(promo)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateGeneralPromotion(promoId, updates) {
  const { data, error } = await supabase
    .from('general_promotions')
    .update(updates)
    .eq('id', promoId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteGeneralPromotion(promoId) {
  const { error } = await supabase
    .from('general_promotions')
    .delete()
    .eq('id', promoId);
  if (error) throw error;
}

// ── Day Promotions (promoções do dia) ───────────────────────

export async function fetchDayPromotions() {
  const { data, error } = await supabase
    .from('day_promotions')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function insertDayPromotion(promo) {
  const { data, error } = await supabase
    .from('day_promotions')
    .insert(promo)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDayPromotion(promoId, updates) {
  const { data, error } = await supabase
    .from('day_promotions')
    .update(updates)
    .eq('id', promoId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDayPromotion(promoId) {
  const { error } = await supabase
    .from('day_promotions')
    .delete()
    .eq('id', promoId);
  if (error) throw error;
}

// ── Match Results (placar real da fase de grupos) ───────────

export async function fetchMatchResults() {
  const { data, error } = await supabase
    .from('match_results')
    .select('*');
  if (error) throw error;
  return data.reduce((acc, r) => { acc[r.match_id] = r; return acc; }, {});
}

export async function upsertMatchResult(matchId, patch) {
  const { data, error } = await supabase
    .from('match_results')
    .upsert({ match_id: matchId, ...patch }, { onConflict: 'match_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Knockout Matches (mata-mata) ─────────────────────────────

export async function fetchKnockoutMatches() {
  const { data, error } = await supabase
    .from('knockout_matches')
    .select('*')
    .order('id');
  if (error) throw error;
  return data;
}

export async function upsertKnockoutMatch(id, patch) {
  const { data, error } = await supabase
    .from('knockout_matches')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Sync Status (live sync com football-data.org) ───────────

export async function fetchSyncStatus() {
  const { data, error } = await supabase
    .from('sync_status')
    .select('*')
    .eq('id', 1)
    .single();
  if (error) throw error;
  return data;
}

export async function triggerSync() {
  const { data, error } = await supabase.functions.invoke('sync-worldcup');
  if (error) throw error;
  return data;
}

// ── Favorites ────────────────────────────────────────────────

export async function fetchFavorites() {
  const { data, error } = await supabase
    .from('favorites')
    .select('match_id');
  if (error) throw error;
  return new Set(data.map(r => r.match_id));
}

export async function insertFavorite(matchId) {
  const { error } = await supabase
    .from('favorites')
    .insert({ match_id: matchId });
  if (error) throw error;
}

export async function deleteFavorite(matchId) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('match_id', matchId);
  if (error) throw error;
}
