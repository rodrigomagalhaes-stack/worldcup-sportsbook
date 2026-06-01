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
