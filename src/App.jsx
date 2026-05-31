import React, { useState, useEffect } from 'react';

// ============================================================
// CONFIG — change these to your real values
// ============================================================
const ADMIN_EMAIL = "sandhuvishu16@yahoo.com"; // ← your email

// ============================================================
// SUPABASE SAFE CLIENT
// ============================================================
const supabase = null;

// ============================================================
// SAMPLE DATA (shown when Supabase not connected)
// ============================================================
const SAMPLE_POSTS = [
  {
    id: 1,
    title: "Dune: Part Two",
    host: "Alex K.",
    city: "Toronto",
    date: "2025-06-15",
    time: "7:00 PM",
    cinema: "Cineplex Varsity",
    genre: "Sci-Fi",
    spots: 3,
    verified: true,
    description: "Looking for fellow sci-fi fans to enjoy this epic sequel together!",
    booking_url: "https://www.cineplex.com",
    reports: 0,
  },
  {
    id: 2,
    title: "Inside Out 2",
    host: "Maria S.",
    city: "Mississauga",
    date: "2025-06-18",
    time: "2:00 PM",
    cinema: "Cineplex Heartland",
    genre: "Animation",
    spots: 4,
    verified: true,
    description: "Family-friendly outing, all ages welcome!",
    booking_url: "https://www.cineplex.com",
    reports: 0,
  },
  {
    id: 3,
    title: "A Quiet Place: Day One",
    host: "James T.",
    city: "Brampton",
    date: "2025-06-20",
    time: "9:00 PM",
    cinema: "Cineplex Orion Gate",
    genre: "Horror",
    spots: 2,
    verified: false,
    description: "Horror fans only — no talking during the movie!",
    booking_url: "https://www.cineplex.com",
    reports: 0,
  },
];

const GENRES = ["All","Action","Comedy","Drama","Horror","Sci-Fi","Animation","Romance","Thriller","Documentary"];
const CITIES = ["All","Toronto","Mississauga","Brampton","Markham","Vaughan","Oakville","Hamilton"];
const CINEMAS = [
  { name: "Cineplex", url: "https://www.cineplex.com" },
  { name: "AMC", url: "https://www.amctheatres.com" },
  { name: "Landmark", url: "https://www.landmarkcinemas.com" },
  { name: "Fandango", url: "https://www.fandango.com" },
  { name: "IMAX", url: "https://www.imax.com" },
];

// ============================================================
// STYLES
// ============================================================
const styles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #0a0a0f;
    color: #e8e8f0;
    min-height: 100vh;
  }

  /* NAV */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(10,10,15,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding: 0 24px;
    display: flex; align-items: center; justify-content: space-between;
    height: 64px;
  }
  .nav-logo {
    display: flex; align-items: center; gap: 10px;
    font-size: 1.4rem; font-weight: 800; cursor: pointer;
    background: linear-gradient(135deg, #f5a623, #e91e8c);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .nav-logo span { font-size: 1.6rem; }
  .nav-links { display: flex; align-items: center; gap: 8px; }
  .nav-btn {
    padding: 8px 16px; border-radius: 20px; border: none;
    cursor: pointer; font-size: 0.85rem; font-weight: 600;
    transition: all 0.2s;
  }
  .nav-btn-ghost {
    background: transparent; color: #ccc;
  }
  .nav-btn-ghost:hover { color: #fff; background: rgba(255,255,255,0.08); }
  .nav-btn-primary {
    background: linear-gradient(135deg, #f5a623, #e91e8c);
    color: #fff;
  }
  .nav-btn-primary:hover { opacity: 0.85; transform: scale(1.03); }
  .nav-btn-admin {
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    color: #fff;
  }

  /* MAIN */
  .main { padding-top: 64px; min-height: 100vh; }

  /* HERO */
  .hero {
    position: relative; overflow: hidden;
    padding: 100px 24px 80px;
    text-align: center;
    background: radial-gradient(ellipse at 50% 0%, rgba(229,30,140,0.15), transparent 70%),
                radial-gradient(ellipse at 80% 80%, rgba(245,166,35,0.1), transparent 60%);
  }
  .hero-badge {
    display: inline-block;
    padding: 6px 16px; border-radius: 20px; margin-bottom: 24px;
    background: rgba(229,30,140,0.15);
    border: 1px solid rgba(229,30,140,0.3);
    font-size: 0.8rem; color: #e91e8c; font-weight: 600;
    letter-spacing: 0.05em;
  }
  .hero h1 {
    font-size: clamp(2.2rem, 6vw, 4rem);
    font-weight: 900; line-height: 1.1;
    margin-bottom: 20px;
    background: linear-gradient(135deg, #fff 40%, #e91e8c);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .hero p {
    font-size: 1.15rem; color: #aaa;
    max-width: 520px; margin: 0 auto 36px;
    line-height: 1.7;
  }
  .hero-cta { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn-hero-primary {
    padding: 14px 32px; border-radius: 30px; border: none;
    background: linear-gradient(135deg, #f5a623, #e91e8c);
    color: #fff; font-size: 1rem; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-hero-primary:hover { transform: scale(1.05); box-shadow: 0 8px 30px rgba(229,30,140,0.4); }
  .btn-hero-secondary {
    padding: 14px 32px; border-radius: 30px;
    border: 1px solid rgba(255,255,255,0.2);
    background: rgba(255,255,255,0.05);
    color: #fff; font-size: 1rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-hero-secondary:hover { background: rgba(255,255,255,0.1); }

  /* STATS BAR */
  .stats-bar {
    display: flex; justify-content: center; gap: 48px;
    padding: 32px 24px;
    border-top: 1px solid rgba(255,255,255,0.06);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    flex-wrap: wrap;
  }
  .stat { text-align: center; }
  .stat-num {
    font-size: 1.8rem; font-weight: 800;
    background: linear-gradient(135deg, #f5a623, #e91e8c);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .stat-label { font-size: 0.8rem; color: #666; margin-top: 2px; }

  /* SECTION */
  .section { padding: 60px 24px; max-width: 1100px; margin: 0 auto; }
  .section-title {
    font-size: 1.6rem; font-weight: 800; margin-bottom: 32px;
    display: flex; align-items: center; gap: 10px;
  }

  /* FILTERS */
  .filters {
    display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 32px;
    padding: 20px 24px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
  }
  .filter-select {
    padding: 8px 14px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    color: #e8e8f0; font-size: 0.9rem; cursor: pointer;
  }
  .filter-toggle {
    padding: 8px 16px; border-radius: 10px; border: none;
    font-size: 0.85rem; font-weight: 600; cursor: pointer;
    transition: all 0.2s;
  }
  .filter-toggle.active {
    background: linear-gradient(135deg, #f5a623, #e91e8c); color: #fff;
  }
  .filter-toggle.inactive {
    background: rgba(255,255,255,0.05); color: #aaa;
    border: 1px solid rgba(255,255,255,0.1);
  }

  /* CARDS GRID */
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  /* CARD */
  .card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 20px;
    transition: all 0.25s; cursor: default;
    position: relative; overflow: hidden;
  }
  .card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(135deg, #f5a623, #e91e8c);
  }
  .card:hover {
    border-color: rgba(229,30,140,0.3);
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.3);
  }
  .card-genre {
    display: inline-block; padding: 3px 10px; border-radius: 12px;
    font-size: 0.75rem; font-weight: 600; margin-bottom: 10px;
    background: rgba(229,30,140,0.15); color: #e91e8c;
    border: 1px solid rgba(229,30,140,0.25);
  }
  .card-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
  .card-meta { font-size: 0.82rem; color: #888; line-height: 1.8; }
  .card-meta span { display: block; }
  .verified-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 8px;
    background: rgba(34,197,94,0.15); color: #22c55e;
    font-size: 0.75rem; font-weight: 600;
    border: 1px solid rgba(34,197,94,0.25);
    margin-bottom: 8px; margin-left: 8px;
  }
  .card-actions { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
  .btn-join {
    flex: 1; padding: 9px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #f5a623, #e91e8c);
    color: #fff; font-weight: 700; font-size: 0.88rem;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-join:hover { opacity: 0.85; }
  .btn-book {
    padding: 9px 14px; border-radius: 10px; border: none;
    background: rgba(99,102,241,0.2); color: #818cf8;
    font-weight: 600; font-size: 0.85rem;
    cursor: pointer; transition: all 0.2s;
    border: 1px solid rgba(99,102,241,0.25);
  }
  .btn-book:hover { background: rgba(99,102,241,0.35); }
  .btn-report {
    padding: 9px 12px; border-radius: 10px; border: none;
    background: transparent; color: #666;
    font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
  }
  .btn-report:hover { color: #ef4444; }

  /* PAGE CARDS (post/login forms) */
  .page-card {
    max-width: 560px; margin: 40px auto;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px; padding: 36px;
  }
  .page-card h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 8px; }
  .page-card p { color: #888; font-size: 0.9rem; margin-bottom: 24px; }

  /* FORM */
  .form-group { margin-bottom: 18px; }
  .form-label {
    display: block; font-size: 0.85rem; font-weight: 600;
    color: #bbb; margin-bottom: 6px;
  }
  .form-input, .form-select, .form-textarea {
    width: 100%; padding: 11px 14px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    color: #e8e8f0; font-size: 0.92rem;
    transition: border-color 0.2s;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus {
    outline: none; border-color: #e91e8c;
    box-shadow: 0 0 0 3px rgba(229,30,140,0.1);
  }
  .form-textarea { min-height: 100px; resize: vertical; }
  .form-select option { background: #1a1a2e; }
  .btn-submit {
    width: 100%; padding: 13px; border-radius: 12px; border: none;
    background: linear-gradient(135deg, #f5a623, #e91e8c);
    color: #fff; font-size: 1rem; font-weight: 700;
    cursor: pointer; transition: all 0.2s; margin-top: 8px;
  }
  .btn-submit:hover { opacity: 0.88; transform: scale(1.01); }
  .form-switch {
    text-align: center; margin-top: 20px;
    font-size: 0.9rem; color: #888;
  }
  .form-switch button {
    background: none; border: none; color: #e91e8c;
    font-weight: 600; cursor: pointer; font-size: 0.9rem;
  }
  .form-switch button:hover { text-decoration: underline; }

  /* DASHBOARD */
  .dashboard { padding: 40px 24px; max-width: 1100px; margin: 0 auto; }
  .dashboard-header { margin-bottom: 32px; }
  .dashboard-header h2 { font-size: 1.8rem; font-weight: 800; }
  .dashboard-header p { color: #888; margin-top: 6px; }
  .stats-cards {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px; margin-bottom: 32px;
  }
  .stat-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; padding: 20px; text-align: center;
  }
  .stat-card-num {
    font-size: 2rem; font-weight: 800;
    background: linear-gradient(135deg, #f5a623, #e91e8c);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .stat-card-label { font-size: 0.82rem; color: #777; margin-top: 4px; }
  .tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
  .tab {
    padding: 9px 20px; border-radius: 10px; border: none;
    font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
  }
  .tab.active {
    background: linear-gradient(135deg, #f5a623, #e91e8c); color: #fff;
  }
  .tab.inactive {
    background: rgba(255,255,255,0.05); color: #aaa;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .tab.inactive:hover { background: rgba(255,255,255,0.09); color: #fff; }

  /* ADMIN */
  .admin-section {
    background: rgba(124,58,237,0.08);
    border: 1px solid rgba(124,58,237,0.2);
    border-radius: 16px; padding: 24px; margin-bottom: 24px;
  }
  .admin-section h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 16px; color: #a78bfa; }
  .admin-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .admin-row:last-child { border-bottom: none; }
  .btn-danger {
    padding: 6px 14px; border-radius: 8px; border: none;
    background: rgba(239,68,68,0.15); color: #ef4444;
    font-size: 0.82rem; font-weight: 600; cursor: pointer;
    border: 1px solid rgba(239,68,68,0.25); transition: all 0.2s;
  }
  .btn-danger:hover { background: rgba(239,68,68,0.3); }
  .btn-success {
    padding: 6px 14px; border-radius: 8px; border: none;
    background: rgba(34,197,94,0.15); color: #22c55e;
    font-size: 0.82rem; font-weight: 600; cursor: pointer;
    border: 1px solid rgba(34,197,94,0.25); transition: all 0.2s;
  }
  .btn-success:hover { background: rgba(34,197,94,0.3); }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .modal {
    background: #13131f; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px; padding: 32px; max-width: 440px; width: 100%;
  }
  .modal h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; }
  .modal p { color: #888; font-size: 0.9rem; margin-bottom: 20px; }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
  .btn-cancel {
    padding: 9px 20px; border-radius: 10px; border: none;
    background: rgba(255,255,255,0.06); color: #aaa;
    font-weight: 600; cursor: pointer; transition: all 0.2s;
  }
  .btn-cancel:hover { background: rgba(255,255,255,0.1); }

  /* SUPPORT */
  .support-page { max-width: 760px; margin: 0 auto; padding: 40px 24px; }
  .faq-item {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px; padding: 18px 20px; margin-bottom: 12px;
    cursor: pointer; transition: all 0.2s;
  }
  .faq-item:hover { border-color: rgba(229,30,140,0.3); }
  .faq-q { font-weight: 600; font-size: 0.95rem; display: flex; justify-content: space-between; }
  .faq-a { color: #888; font-size: 0.88rem; margin-top: 10px; line-height: 1.7; }

  /* SAFETY BANNER */
  .safety-banner {
    background: rgba(34,197,94,0.08);
    border: 1px solid rgba(34,197,94,0.2);
    border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;
    display: flex; gap: 12px; align-items: flex-start;
    font-size: 0.88rem; color: #86efac;
  }

  /* TOAST */
  .toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 300;
    background: #1e1e30; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; padding: 14px 20px;
    font-size: 0.9rem; font-weight: 500;
    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    animation: slideIn 0.3s ease;
  }
  .toast.success { border-left: 3px solid #22c55e; }
  .toast.error { border-left: 3px solid #ef4444; }
  @keyframes slideIn {
    from { transform: translateX(100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  /* FOOTER */
  .footer {
    border-top: 1px solid rgba(255,255,255,0.06);
    padding: 40px 24px; text-align: center; color: #555;
    font-size: 0.85rem;
  }
  .footer-links { display: flex; gap: 20px; justify-content: center; margin-top: 12px; flex-wrap: wrap; }
  .footer-links button {
    background: none; border: none; color: #666;
    font-size: 0.85rem; cursor: pointer; transition: color 0.2s;
  }
  .footer-links button:hover { color: #e91e8c; }

  /* RESPONSIVE */
  @media (max-width: 600px) {
    .nav-links .nav-btn-ghost { display: none; }
    .stats-bar { gap: 24px; }
    .hero { padding: 70px 16px 50px; }
    .section { padding: 40px 16px; }
    .page-card { padding: 24px 16px; margin: 20px 16px; }
  }
`;

// ============================================================
// FAQ DATA
// ============================================================
const FAQS = [
  { q: "Is CineConnect free to use?", a: "Browsing and joining outings is always free. Posting an outing requires a Pro membership ($4.99/month) to keep the platform safe and spam-free." },
  { q: "How are hosts verified?", a: "Hosts can submit ID verification through our admin process. Verified hosts show a green ✓ badge. Always meet in the public cinema lobby." },
  { q: "What if I feel unsafe?", a: "Use the 🚩 Report button on any post. Our admin reviews all reports within 24 hours. Always meet in public, never share personal details before meeting." },
  { q: "How do booking links work?", a: "Clicking Book Tickets takes you directly to the cinema's website to purchase your ticket independently. CineConnect doesn't process payments for tickets." },
  { q: "Can I cancel or change my outing?", a: "Yes — go to Dashboard → My Posts → Edit or Delete your outing at any time. Joined members are notified automatically." },
  { q: "How do I get verified as a host?", a: "Go to Dashboard → My Profile → Request Verification. Admin will review within 48 hours." },
];

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null); // { name, email, isAdmin }
  const [posts, setPosts] = useState(SAMPLE_POSTS);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // { type, data }

  // Auth state
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  // Post form
  const [postForm, setPostForm] = useState({
    title: '', cinema: '', city: '', date: '', time: '',
    genre: '', spots: 2, description: '', booking_url: '',
  });

  // Filters
  const [filterGenre, setFilterGenre] = useState('All');
  const [filterCity, setFilterCity] = useState('All');
  const [filterVerified, setFilterVerified] = useState(false);

  // Dashboard tab — ADMIN tab hidden from everyone except admin
  const [dashTab, setDashTab] = useState('browse');

  // Support FAQ open
  const [openFaq, setOpenFaq] = useState(null);
  const [supportForm, setSupportForm] = useState({ subject: '', message: '' });

  // Report modal
  const [reportPost, setReportPost] = useState(null);
  const [reportReason, setReportReason] = useState('');

  // Book modal
  const [bookPost, setBookPost] = useState(null);

  // ─── helpers ────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const isAdmin = user?.isAdmin === true;

  // ─── AUTH ────────────────────────────────────────────────────
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (authMode === 'signup') {
      if (!authForm.name || !authForm.email || !authForm.password) {
        return setAuthError('Please fill in all fields.');
      }
      if (authForm.password.length < 6) {
        return setAuthError('Password must be at least 6 characters.');
      }
      // Supabase signup
      if (supabase) {
        const { error } = await supabase.auth.signUp({
          email: authForm.email, password: authForm.password,
          options: { data: { full_name: authForm.name } },
        });
        if (error) return setAuthError(error.message);
        showToast('Account created! Check your email to verify.');
      }
      const adminFlag = authForm.email === ADMIN_EMAIL;
      setUser({ name: authForm.name, email: authForm.email, isAdmin: adminFlag });
      setPage('home');
      showToast(`Welcome, ${authForm.name}! 🎬`);
    } else {
      // login
      if (!authForm.email || !authForm.password) {
        return setAuthError('Please enter your email and password.');
      }
      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email: authForm.email, password: authForm.password,
        });
        if (error) return setAuthError('Invalid email or password.');
      }
      const adminFlag = authForm.email === ADMIN_EMAIL;
      const name = authForm.email.split('@')[0];
      setUser({ name, email: authForm.email, isAdmin: adminFlag });
      setPage('home');
      showToast(`Welcome back! 🎬`);
    }
    setAuthForm({ name: '', email: '', password: '' });
  };

  const handleLogout = () => {
    if (supabase) supabase.auth.signOut();
    setUser(null);
    setPage('home');
    showToast('Logged out successfully.');
  };

  // ─── POSTS ──────────────────────────────────────────────────
  const filteredPosts = posts.filter(p => {
    if (filterGenre !== 'All' && p.genre !== filterGenre) return false;
    if (filterCity !== 'All' && p.city !== filterCity) return false;
    if (filterVerified && !p.verified) return false;
    return true;
  });

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!user) { setPage('auth'); return; }
    if (!postForm.title || !postForm.cinema || !postForm.city || !postForm.date) {
      showToast('Please fill in all required fields.', 'error'); return;
    }
    const newPost = {
      ...postForm, id: Date.now(),
      host: user.name, verified: isAdmin,
      reports: 0, spots: Number(postForm.spots),
    };
    setPosts(prev => [newPost, ...prev]);
    setPostForm({ title: '', cinema: '', city: '', date: '', time: '', genre: '', spots: 2, description: '', booking_url: '' });
    showToast('Outing posted! 🎉');
    setPage('dashboard');
  };

  const handleReport = () => {
    if (!reportReason) { showToast('Please select a reason.', 'error'); return; }
    setPosts(prev => prev.map(p =>
      p.id === reportPost.id ? { ...p, reports: (p.reports || 0) + 1 } : p
    ));
    showToast('Report submitted. We\'ll review within 24 hours.');
    setReportPost(null); setReportReason('');
  };

  const handleDeletePost = (id) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    showToast('Post deleted.');
  };

  const handleVerifyHost = (id) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, verified: true } : p));
    showToast('Host verified ✓');
  };

  // ─── PAGES ──────────────────────────────────────────────────

  // HOME
  const HomePage = () => (
    <div>
      {/* Hero */}
      <div className="hero">
        <div className="hero-badge">🎬 Canada's Movie Companion Platform</div>
        <h1>Never Watch a Movie Alone Again</h1>
        <p>Find like-minded movie fans near you, join their outing, and book seats together — safely and easily.</p>
        <div className="hero-cta">
          <button className="btn-hero-primary" onClick={() => setPage('find')}>
            🔍 Find an Outing
          </button>
          <button className="btn-hero-secondary" onClick={() => user ? setPage('post') : setPage('auth')}>
            ✏️ Post an Outing
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        {[
          ['1,240+', 'Active Members'],
          ['380+', 'Outings Posted'],
          ['28', 'Cities Covered'],
          ['4.9★', 'Safety Rating'],
        ].map(([n, l]) => (
          <div className="stat" key={l}>
            <div className="stat-num">{n}</div>
            <div className="stat-label">{l}</div>
          </div>
        ))}
      </div>

      {/* Safety Banner */}
      <div className="section">
        <div className="safety-banner">
          <span>🛡️</span>
          <span>
            <strong>Safety First:</strong> Always meet in the public cinema lobby.
            Never share personal details before meeting. Use the Report button if anything feels off.
            All hosts can be verified — look for the green ✓ badge.
          </span>
        </div>

        {/* Featured */}
        <div className="section-title">🔥 Latest Outings</div>
        <div className="cards-grid">
          {posts.slice(0, 3).map(post => <PostCard key={post.id} post={post} />)}
        </div>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button className="btn-hero-primary" onClick={() => setPage('find')}>
            View All Outings →
          </button>
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '60px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="section-title" style={{ justifyContent: 'center', marginBottom: 40 }}>
            How CineConnect Works
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 24 }}>
            {[
              ['🔍', 'Find an Outing', 'Browse outings by genre, city, or verified hosts near you.'],
              ['🤝', 'Join & Connect', 'Request to join — meet the group in the cinema lobby.'],
              ['🎟️', 'Book Your Seat', 'Use our direct booking links to grab your ticket.'],
              ['🎬', 'Enjoy Together', 'Watch the movie and make new friends who share your taste!'],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{
                textAlign: 'center', padding: '28px 16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16,
              }}>
                <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>{icon}</div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: '0.85rem', color: '#888', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // POST CARD COMPONENT
  const PostCard = ({ post }) => (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
        <span className="card-genre">{post.genre}</span>
        {post.verified && <span className="verified-badge">✓ Verified</span>}
        {post.reports >= 3 && (
          <span style={{ marginLeft: 8, fontSize: '0.75rem', color: '#ef4444' }}>⚠️ Flagged</span>
        )}
      </div>
      <div className="card-title">{post.title}</div>
      <div className="card-meta">
        <span>👤 {post.host}</span>
        <span>📍 {post.city} — {post.cinema}</span>
        <span>📅 {post.date} {post.time && `at ${post.time}`}</span>
        <span>🪑 {post.spots} spot{post.spots !== 1 ? 's' : ''} available</span>
        {post.description && (
          <span style={{ marginTop: 6, color: '#bbb', lineHeight: 1.5 }}>{post.description}</span>
        )}
      </div>
      <div className="card-actions">
        <button className="btn-join" onClick={() => {
          if (!user) { setPage('auth'); return; }
          showToast(`You joined ${post.host}'s outing! Meet in the lobby. 🎬`);
        }}>
          🎬 Join Outing
        </button>
        <button className="btn-book" onClick={() => setBookPost(post)}>
          🎟️ Book
        </button>
        <button className="btn-report" onClick={() => { setReportPost(post); setReportReason(''); }}>
          🚩
        </button>
      </div>
    </div>
  );

  // FIND PAGE
  const FindPage = () => (
    <div className="section">
      <div className="section-title">🔍 Find an Outing</div>
      <div className="filters">
        <select className="filter-select" value={filterGenre} onChange={e => setFilterGenre(e.target.value)}>
          {GENRES.map(g => <option key={g}>{g}</option>)}
        </select>
        <select className="filter-select" value={filterCity} onChange={e => setFilterCity(e.target.value)}>
          {CITIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <button
          className={`filter-toggle ${filterVerified ? 'active' : 'inactive'}`}
          onClick={() => setFilterVerified(v => !v)}
        >
          ✓ Verified Only
        </button>
        <span style={{ fontSize: '0.85rem', color: '#666', alignSelf: 'center', marginLeft: 'auto' }}>
          {filteredPosts.length} outing{filteredPosts.length !== 1 ? 's' : ''} found
        </span>
      </div>
      {filteredPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎭</div>
          <p>No outings match your filters. Try adjusting or post your own!</p>
          <button className="btn-hero-primary" style={{ marginTop: 20 }}
            onClick={() => user ? setPage('post') : setPage('auth')}>
            Post an Outing
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredPosts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  );

  // POST PAGE
  const PostPage = () => {
    if (!user) {
      return (
        <div className="page-card">
          <h2>✏️ Post an Outing</h2>
          <p>You need to be logged in to post an outing.</p>
          <button className="btn-submit" onClick={() => setPage('auth')}>Log In / Sign Up</button>
        </div>
      );
    }
    return (
      <div className="page-card">
        <h2>✏️ Post an Outing</h2>
        <p>Share your movie plans and find companions to join you.</p>
        <div className="safety-banner" style={{ marginBottom: 20 }}>
          🛡️ By posting, you agree to meet companions in the public cinema lobby only.
        </div>
        <form onSubmit={handlePostSubmit}>
          {[
            { label: 'Movie Title *', key: 'title', placeholder: 'e.g. Dune: Part Two' },
            { label: 'Cinema Name *', key: 'cinema', placeholder: 'e.g. Cineplex Varsity' },
            { label: 'Booking URL', key: 'booking_url', placeholder: 'https://cineplex.com/...' },
          ].map(({ label, key, placeholder }) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}</label>
              <input className="form-input" placeholder={placeholder}
                value={postForm[key]}
                onChange={e => setPostForm(p => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">City *</label>
              <select className="form-select" value={postForm.city}
                onChange={e => setPostForm(p => ({ ...p, city: e.target.value }))}>
                <option value="">Select city</option>
                {CITIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Genre</label>
              <select className="form-select" value={postForm.genre}
                onChange={e => setPostForm(p => ({ ...p, genre: e.target.value }))}>
                <option value="">Select genre</option>
                {GENRES.filter(g => g !== 'All').map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className="form-input" value={postForm.date}
                onChange={e => setPostForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input type="time" className="form-input" value={postForm.time}
                onChange={e => setPostForm(p => ({ ...p, time: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Available Spots</label>
            <input type="number" min={1} max={10} className="form-input" value={postForm.spots}
              onChange={e => setPostForm(p => ({ ...p, spots: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Tell people about yourself and what you're looking for..."
              value={postForm.description}
              onChange={e => setPostForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <button type="submit" className="btn-submit">🎬 Post Outing</button>
        </form>
      </div>
    );
  };

  // AUTH PAGE
  const AuthPage = () => (
    <div className="page-card">
      <h2>{authMode === 'login' ? '👋 Welcome Back' : '🎬 Join CineConnect'}</h2>
      <p>{authMode === 'login' ? 'Log in to join outings and connect with movie fans.' : 'Create your free account to get started.'}</p>
      {authError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: '0.88rem', color: '#fca5a5' }}>
          ⚠️ {authError}
        </div>
      )}
      <form onSubmit={handleAuth}>
        {authMode === 'signup' && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Your name" value={authForm.name}
              onChange={e => setAuthForm(p => ({ ...p, name: e.target.value }))} />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input type="email" className="form-input" placeholder="you@email.com" value={authForm.email}
            onChange={e => setAuthForm(p => ({ ...p, email: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input type="password" className="form-input" placeholder="Min 6 characters" value={authForm.password}
            onChange={e => setAuthForm(p => ({ ...p, password: e.target.value }))} />
        </div>
        <button type="submit" className="btn-submit">
          {authMode === 'login' ? '🔑 Log In' : '🚀 Create Account'}
        </button>
      </form>
      <div className="form-switch">
        {authMode === 'login' ? (
          <span>Don't have an account? <button onClick={() => { setAuthMode('signup'); setAuthError(''); }}>Sign Up Free</button></span>
        ) : (
          <span>Already have an account? <button onClick={() => { setAuthMode('login'); setAuthError(''); }}>Log In</button></span>
        )}
      </div>
    </div>
  );

  // DASHBOARD PAGE
  const DashboardPage = () => {
    const myPosts = posts.filter(p => p.host === user?.name);
    const flagged = posts.filter(p => p.reports >= 1);

    // Build tabs — admin tab ONLY injected if isAdmin
    const tabs = [
      { id: 'browse', label: '🔍 Browse' },
      { id: 'myposts', label: '📋 My Posts' },
      ...(isAdmin ? [{ id: 'admin', label: '👑 Admin' }] : []),
    ];

    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>📊 Dashboard</h2>
          <p>
            Welcome back, <strong>{user?.name || 'Guest'}</strong>
            {isAdmin && <span style={{ marginLeft: 8, color: '#a78bfa', fontWeight: 700 }}>👑 Admin</span>}
          </p>
        </div>

        {/* Stats */}
        <div className="stats-cards">
          {[
            ['stat-card-num', posts.length, 'Total Outings'],
            ['stat-card-num', myPosts.length, 'My Posts'],
            ['stat-card-num', posts.filter(p => p.verified).length, 'Verified Hosts'],
            ...(isAdmin ? [['stat-card-num', flagged.length, 'Flagged Posts']] : []),
          ].map(([cls, val, label]) => (
            <div className="stat-card" key={label}>
              <div className={cls}>{val}</div>
              <div className="stat-card-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {tabs.map(t => (
            <button key={t.id} className={`tab ${dashTab === t.id ? 'active' : 'inactive'}`}
              onClick={() => setDashTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Browse Tab */}
        {dashTab === 'browse' && (
          <div className="cards-grid">
            {posts.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        )}

        {/* My Posts Tab */}
        {dashTab === 'myposts' && (
          myPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
              <p>You haven't posted any outings yet.</p>
              <button className="btn-hero-primary" style={{ marginTop: 16 }} onClick={() => setPage('post')}>
                Post Your First Outing
              </button>
            </div>
          ) : (
            <div className="cards-grid">
              {myPosts.map(post => (
                <div key={post.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span className="card-genre">{post.genre}</span>
                    <button className="btn-danger" onClick={() => handleDeletePost(post.id)}>Delete</button>
                  </div>
                  <div className="card-title">{post.title}</div>
                  <div className="card-meta">
                    <span>📍 {post.city} — {post.cinema}</span>
                    <span>📅 {post.date}</span>
                    <span>🚩 {post.reports || 0} report{post.reports !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ADMIN TAB — only rendered if isAdmin (tabs won't even show it otherwise) */}
        {dashTab === 'admin' && isAdmin && (
          <div>
            <div className="admin-section">
              <h3>🚩 Flagged Posts ({flagged.length})</h3>
              {flagged.length === 0 ? (
                <p style={{ color: '#666', fontSize: '0.9rem' }}>No flagged posts right now ✅</p>
              ) : (
                flagged.map(post => (
                  <div className="admin-row" key={post.id}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{post.title}</div>
                      <div style={{ fontSize: '0.82rem', color: '#888' }}>
                        by {post.host} · {post.reports} report{post.reports !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-success" onClick={() => {
                        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, reports: 0 } : p));
                        showToast('Post cleared ✓');
                      }}>Clear</button>
                      <button className="btn-danger" onClick={() => handleDeletePost(post.id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="admin-section">
              <h3>✅ Verify Hosts</h3>
              {posts.filter(p => !p.verified).length === 0 ? (
                <p style={{ color: '#666', fontSize: '0.9rem' }}>All hosts are verified ✅</p>
              ) : (
                posts.filter(p => !p.verified).map(post => (
                  <div className="admin-row" key={post.id}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{post.host}</div>
                      <div style={{ fontSize: '0.82rem', color: '#888' }}>{post.title}</div>
                    </div>
                    <button className="btn-success" onClick={() => handleVerifyHost(post.id)}>
                      ✓ Verify
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="admin-section">
              <h3>📊 Platform Stats</h3>
              <div className="admin-row"><span>Total Posts</span><strong>{posts.length}</strong></div>
              <div className="admin-row"><span>Verified Hosts</span><strong>{posts.filter(p => p.verified).length}</strong></div>
              <div className="admin-row"><span>Cities Active</span><strong>{[...new Set(posts.map(p => p.city))].length}</strong></div>
              <div className="admin-row"><span>Flagged Posts</span><strong style={{ color: flagged.length > 0 ? '#ef4444' : '#22c55e' }}>{flagged.length}</strong></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // SUPPORT PAGE
  const SupportPage = () => (
    <div className="support-page">
      <div className="section-title">🛟 Support & Help</div>

      <div style={{ marginBottom: 36 }}>
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Frequently Asked Questions</div>
        {FAQS.map((faq, i) => (
          <div className="faq-item" key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
            <div className="faq-q">
              <span>{faq.q}</span>
              <span>{openFaq === i ? '▲' : '▼'}</span>
            </div>
            {openFaq === i && <div className="faq-a">{faq.a}</div>}
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: 24,
      }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>📬 Contact Us</div>
        <p style={{ color: '#888', fontSize: '0.88rem', marginBottom: 20 }}>
          Can't find your answer? Send us a message and we'll respond within 24 hours.
        </p>
        <div className="form-group">
          <label className="form-label">Subject</label>
          <input className="form-input" placeholder="e.g. Safety concern, account issue..."
            value={supportForm.subject}
            onChange={e => setSupportForm(p => ({ ...p, subject: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea className="form-textarea" placeholder="Describe your issue..."
            value={supportForm.message}
            onChange={e => setSupportForm(p => ({ ...p, message: e.target.value }))} />
        </div>
        <button className="btn-submit" onClick={() => {
          if (!supportForm.subject || !supportForm.message) {
            showToast('Please fill in both fields.', 'error'); return;
          }
          showToast('Message sent! We\'ll reply within 24 hours. ✓');
          setSupportForm({ subject: '', message: '' });
        }}>
          📤 Send Message
        </button>
      </div>
    </div>
  );

  // ─── RENDER ─────────────────────────────────────────────────
  return (
    <>
      <style>{styles}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo" onClick={() => setPage('home')}>
          <span>🎬</span> CineConnect
        </div>
        <div className="nav-links">
          <button className="nav-btn nav-btn-ghost" onClick={() => setPage('find')}>Find</button>
          <button className="nav-btn nav-btn-ghost" onClick={() => setPage('support')}>Support</button>

          {/* ADMIN BUTTON — only visible to admin user */}
          {isAdmin && (
            <button className="nav-btn nav-btn-admin"
              onClick={() => { setPage('dashboard'); setDashTab('admin'); }}>
              👑 Admin
            </button>
          )}

          {user ? (
            <>
              <button className="nav-btn nav-btn-ghost" onClick={() => setPage('dashboard')}>
                📊 {user.name}
              </button>
              <button className="nav-btn nav-btn-ghost" onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <>
              <button className="nav-btn nav-btn-ghost" onClick={() => { setPage('auth'); setAuthMode('login'); }}>
                Log In
              </button>
              <button className="nav-btn nav-btn-primary" onClick={() => { setPage('auth'); setAuthMode('signup'); }}>
                Sign Up Free
              </button>
            </>
          )}
        </div>
      </nav>

      {/* MAIN */}
      <main className="main">
        {page === 'home' && <HomePage />}
        {page === 'find' && <FindPage />}
        {page === 'post' && <PostPage />}
        {page === 'auth' && <AuthPage />}
        {page === 'dashboard' && (user ? <DashboardPage /> : <AuthPage />)}
        {page === 'support' && <SupportPage />}
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div>© 2025 CineConnect — Find Your Movie Companion</div>
        <div className="footer-links">
          <button onClick={() => setPage('find')}>Browse Outings</button>
          <button onClick={() => setPage('support')}>Support</button>
          <button onClick={() => setPage('support')}>Privacy Policy</button>
          <button onClick={() => setPage('support')}>Terms of Service</button>
          <button onClick={() => setPage('post')}>Post an Outing</button>
        </div>
      </footer>

      {/* BOOK MODAL */}
      {bookPost && (
        <div className="modal-overlay" onClick={() => setBookPost(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>🎟️ Book Tickets — {bookPost.title}</h3>
            <p>Choose a cinema platform to book your seat:</p>
            {bookPost.booking_url && (
              <a href={bookPost.booking_url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', marginBottom: 12 }}>
                <button className="btn-submit" style={{ marginTop: 0 }}>
                  🎬 Book at {bookPost.cinema || 'Cinema'}
                </button>
              </a>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {CINEMAS.map(c => (
                <a key={c.name} href={`${c.url}/search?q=${encodeURIComponent(bookPost.title)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}>
                  <button style={{
                    width: '100%', padding: '10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)', color: '#e8e8f0',
                    cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s',
                  }}>
                    {c.name} →
                  </button>
                </a>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setBookPost(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {reportPost && (
        <div className="modal-overlay" onClick={() => setReportPost(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>🚩 Report This Post</h3>
            <p>Select a reason for reporting "{reportPost.title}"</p>
            {[
              'Suspicious or unsafe behaviour',
              'Inappropriate content',
              'Spam or fake post',
              'Harassment',
              'Other',
            ].map(reason => (
              <div key={reason} style={{ marginBottom: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                  padding: '10px 14px', borderRadius: 10,
                  background: reportReason === reason ? 'rgba(229,30,140,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${reportReason === reason ? 'rgba(229,30,140,0.3)' : 'rgba(255,255,255,0.07)'}`,
                }}>
                  <input type="radio" name="reason" value={reason}
                    checked={reportReason === reason}
                    onChange={() => setReportReason(reason)}
                    style={{ accentColor: '#e91e8c' }} />
                  <span style={{ fontSize: '0.9rem' }}>{reason}</span>
                </label>
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setReportPost(null)}>Cancel</button>
              <button className="btn-submit" style={{ width: 'auto', padding: '9px 20px' }}
                onClick={handleReport}>
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}
    </>
  );
}
