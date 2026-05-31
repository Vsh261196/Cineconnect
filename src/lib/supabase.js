import { createClient } from '@supabase/supabase-js';

const SUPA_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const db = (SUPA_URL && SUPA_KEY)
  ? createClient(SUPA_URL, SUPA_KEY)
  : null;

const warn = (fn) => { console.warn(`Supabase not configured — ${fn} skipped. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to Vercel environment variables.`); };

/* ── AUTH ─────────────────────────────────────────────── */
export async function signUp(email, password, name) {
  if (!db) { warn('signUp'); return { error: { message: 'Backend not connected yet.' } }; }
  const { data, error } = await db.auth.signUp({
    email, password,
    options: { data: { full_name: name, avatar_initials: name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) } }
  });
  return { data, error };
}

export async function signIn(email, password) {
  if (!db) { warn('signIn'); return { error: { message: 'Backend not connected yet.' } }; }
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signInWithGoogle() {
  if (!db) { warn('signInWithGoogle'); return { error: { message: 'Backend not connected.' } }; }
  return db.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
}

export async function signOut() {
  if (!db) return;
  await db.auth.signOut();
}

export async function resetPassword(email) {
  if (!db) { warn('resetPassword'); return { error: { message: 'Backend not connected.' } }; }
  return db.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}?page=reset` });
}

export async function getSession() {
  if (!db) return null;
  const { data } = await db.auth.getSession();
  return data?.session ?? null;
}

export async function getProfile(userId) {
  if (!db) return null;
  const { data } = await db.from('profiles').select('*').eq('id', userId).single();
  return data;
}

export function onAuthChange(cb) {
  if (!db) return () => {};
  const { data } = db.auth.onAuthStateChange(async (_e, session) => {
    if (session?.user) {
      const profile = await getProfile(session.user.id);
      cb({ ...session.user, ...profile });
    } else { cb(null); }
  });
  return data.subscription.unsubscribe;
}

/* ── POSTS ────────────────────────────────────────────── */
export async function getPosts() {
  if (!db) return null;
  const { data, error } = await db.from('posts').select('*')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return null; }
  return data;
}

export async function createPost(post) {
  if (!db) return null;
  const { data, error } = await db.from('posts').insert([post]).select().single();
  if (error) { console.error(error); return null; }
  return data;
}

export async function deletePost(id) {
  if (!db) return;
  await db.from('posts').delete().eq('id', id);
}

export async function updatePost(id, updates) {
  if (!db) return;
  await db.from('posts').update(updates).eq('id', id);
}

/* ── JOINS ────────────────────────────────────────────── */
export async function joinPost(postId, userId) {
  if (!db) return;
  await db.from('joins').upsert([{ post_id: postId, user_id: userId }]);
  await db.rpc('increment_joined', { row_id: postId });
}

export async function getUserJoins(userId) {
  if (!db) return [];
  const { data } = await db.from('joins').select('post_id').eq('user_id', userId);
  return (data || []).map(r => r.post_id);
}

/* ── REPORTS ──────────────────────────────────────────── */
export async function reportPost(postId, reason, reporterId) {
  if (!db) return;
  await db.from('reports').insert([{ post_id: postId, reason, reporter_id: reporterId }]);
  await db.rpc('increment_reports', { row_id: postId });
}

/* ── SUPPORT TICKETS ──────────────────────────────────── */
export async function submitTicket({ name, email, subject, message, type }) {
  if (!db) return { error: { message: 'Backend not connected.' } };
  const { error } = await db.from('support_tickets')
    .insert([{ name, email, subject, message, type, status: 'open' }]);
  return { error };
}

export async function getTickets() {
  if (!db) return [];
  const { data } = await db.from('support_tickets').select('*')
    .order('created_at', { ascending: false });
  return data || [];
}

export async function resolveTicket(id) {
  if (!db) return;
  await db.from('support_tickets').update({ status: 'resolved' }).eq('id', id);
}

/* ── ADMIN ────────────────────────────────────────────── */
export async function getUsers() {
  if (!db) return [];
  const { data } = await db.from('profiles').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function banUser(userId) {
  if (!db) return;
  await db.from('banned_users').upsert([{ user_id: userId, reason: 'Admin ban' }]);
  await db.from('profiles').update({ is_banned: true }).eq('id', userId);
}

export async function setProStatus(userId, isPro) {
  if (!db) return;
  await db.from('profiles').update({ is_pro: isPro }).eq('id', userId);
}
