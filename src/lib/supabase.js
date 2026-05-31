// CineConnect — Supabase Backend
// App runs in demo mode if env vars are missing

import { createClient } from '@supabase/supabase-js';

const SUPA_URL = import.meta.env.VITE_SUPABASE_URL  || '';
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export let db = null;
try {
  if (SUPA_URL && SUPA_KEY) {
    db = createClient(SUPA_URL, SUPA_KEY);
    console.info('[CineConnect] Supabase connected ✅');
  } else {
    console.info('[CineConnect] Supabase not configured — running in demo mode.');
  }
} catch (e) {
  console.error('[CineConnect] Supabase init failed:', e.message);
  db = null;
}

const skip = (fn) => console.info(`[CineConnect] Demo mode — ${fn} skipped.`);
const safe = async (fn, fallback) => { try { return await fn(); } catch(e) { console.error(e.message); return fallback; }};

/* ── AUTH ─────────────────────────────────────────────── */
export async function signUp(email, password, name) {
  if (!db) { skip('signUp'); return { error:{ message:'Backend not connected. Add Supabase keys in Vercel → Settings → Environment Variables.' }}; }
  return safe(()=>db.auth.signUp({ email, password, options:{ data:{ full_name:name }}}), { error:{ message:'Signup failed.' }});
}

export async function signIn(email, password) {
  if (!db) { skip('signIn'); return { error:{ message:'Backend not connected. Add Supabase keys in Vercel → Settings → Environment Variables.' }}; }
  return safe(()=>db.auth.signInWithPassword({ email, password }), { error:{ message:'Login failed.' }});
}

export async function signInWithGoogle() {
  if (!db) return { error:{ message:'Backend not connected.' }};
  return safe(()=>db.auth.signInWithOAuth({ provider:'google', options:{ redirectTo:window.location.origin }}), { error:{ message:'Google auth failed.' }});
}

export async function signOut() {
  if (!db) return;
  await safe(()=>db.auth.signOut(), null);
}

export async function resetPassword(email) {
  if (!db) return { error:{ message:'Backend not connected.' }};
  return safe(()=>db.auth.resetPasswordForEmail(email, { redirectTo:`${window.location.origin}?page=reset` }), { error:{ message:'Reset failed.' }});
}

export async function getSession() {
  if (!db) return null;
  return safe(async()=>{ const { data } = await db.auth.getSession(); return data?.session ?? null; }, null);
}

export async function getProfile(userId) {
  if (!db) return null;
  return safe(async()=>{ const { data } = await db.from('profiles').select('*').eq('id',userId).single(); return data; }, null);
}

export function onAuthChange(cb) {
  if (!db) return ()=>{};
  try {
    const { data } = db.auth.onAuthStateChange(async(_e, session)=>{
      try {
        if (session?.user) { const p = await getProfile(session.user.id); cb({...session.user,...p}); }
        else cb(null);
      } catch { cb(null); }
    });
    return data?.subscription?.unsubscribe ?? (()=>{});
  } catch { return ()=>{}; }
}

/* ── POSTS ────────────────────────────────────────────── */
export async function getPosts() {
  if (!db) return null;
  return safe(async()=>{
    const { data, error } = await db.from('posts').select('*')
      .order('featured',{ ascending:false }).order('created_at',{ ascending:false });
    if (error) throw error;
    return data;
  }, null);
}

export async function createPost(post) {
  if (!db) return null;
  return safe(async()=>{ const { data, error } = await db.from('posts').insert([post]).select().single(); if(error) throw error; return data; }, null);
}

export async function deletePost(id) {
  if (!db) return;
  await safe(()=>db.from('posts').delete().eq('id',id), null);
}

export async function updatePost(id, updates) {
  if (!db) return;
  await safe(()=>db.from('posts').update(updates).eq('id',id), null);
}

/* ── JOINS ────────────────────────────────────────────── */
export async function joinPost(postId, userId) {
  if (!db) return;
  await safe(async()=>{ await db.from('joins').upsert([{post_id:postId,user_id:userId}]); await db.rpc('increment_joined',{row_id:postId}); }, null);
}

export async function getUserJoins(userId) {
  if (!db) return [];
  return safe(async()=>{ const { data } = await db.from('joins').select('post_id').eq('user_id',userId); return (data||[]).map(r=>r.post_id); }, []);
}

/* ── REPORTS ──────────────────────────────────────────── */
export async function reportPost(postId, reason, reporterId) {
  if (!db) return;
  await safe(async()=>{ await db.from('reports').insert([{post_id:postId,reason,reporter_id:reporterId}]); await db.rpc('increment_reports',{row_id:postId}); }, null);
}

/* ── SUPPORT ──────────────────────────────────────────── */
export async function submitTicket({ name, email, subject, message, type }) {
  if (!db) return { error:{ message:'Backend not connected.' }};
  return safe(async()=>{ const { error } = await db.from('support_tickets').insert([{name,email,subject,message,type,status:'open'}]); return { error }; }, { error:{ message:'Could not send ticket.' }});
}

export async function getTickets() {
  if (!db) return [];
  return safe(async()=>{ const { data } = await db.from('support_tickets').select('*').order('created_at',{ascending:false}); return data||[]; }, []);
}

export async function resolveTicket(id) {
  if (!db) return;
  await safe(()=>db.from('support_tickets').update({status:'resolved'}).eq('id',id), null);
}

/* ── ADMIN ────────────────────────────────────────────── */
export async function getUsers() {
  if (!db) return [];
  return safe(async()=>{ const { data } = await db.from('profiles').select('*').order('created_at',{ascending:false}); return data||[]; }, []);
}

export async function banUser(userId) {
  if (!db) return;
  await safe(async()=>{ await db.from('banned_users').upsert([{user_id:userId,reason:'Admin ban'}]); await db.from('profiles').update({is_banned:true}).eq('id',userId); }, null);
}

export async function setProStatus(userId, isPro) {
  if (!db) return;
  await safe(()=>db.from('profiles').update({is_pro:isPro}).eq('id',userId), null);
}
