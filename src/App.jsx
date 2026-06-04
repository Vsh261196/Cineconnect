import React, { useState, useEffect, useCallback } from 'react';

// ============================================================
// CONFIG
// ============================================================
const ADMIN_EMAIL = "your@gmail.com"; // ← your email

// ============================================================
// TMDB API - LIVE MOVIE DATA
// ============================================================
const TMDB_KEY = import.meta.env.VITE_TMDB_KEY || null;
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w300";

// Genre map from TMDB IDs to names
const TMDB_GENRES = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western"
};

// ============================================================
// GTA THEATER CHAINS
// ============================================================
const GTA_THEATERS = [
  { chain: "Cineplex", name: "Cineplex Varsity", city: "Toronto", url: "https://www.cineplex.com/Theatre/cineplex-cinemas-varsity-and-vip", area: "Midtown" },
  { chain: "Cineplex", name: "Scotiabank Theatre Toronto", city: "Toronto", url: "https://www.cineplex.com/Theatre/scotiabank-theatre-toronto", area: "Downtown" },
  { chain: "Cineplex", name: "Cineplex Scarborough", city: "Scarborough", url: "https://www.cineplex.com/Theatre/cineplex-cinemas-scarborough", area: "East GTA" },
  { chain: "Cineplex", name: "SilverCity Mississauga", city: "Mississauga", url: "https://www.cineplex.com/Theatre/silvercity-mississauga-cinemas", area: "West GTA" },
  { chain: "Cineplex", name: "SilverCity Brampton", city: "Brampton", url: "https://www.cineplex.com/Theatre/silvercity-brampton-cinemas", area: "West GTA" },
  { chain: "Cineplex", name: "Cineplex Markham", city: "Markham", url: "https://www.cineplex.com/Theatre/cineplex-cinemas-markham", area: "North GTA" },
  { chain: "Cineplex", name: "SilverCity Yorkdale", city: "Toronto", url: "https://www.cineplex.com/Theatre/silvercity-yorkdale-cinemas", area: "North Toronto" },
  { chain: "Cineplex", name: "Cineplex Oakville", city: "Oakville", url: "https://www.cineplex.com/Theatre/cineplex-cinemas-oakville", area: "West GTA" },
  { chain: "Cineplex", name: "SilverCity Richmond Hill", city: "Richmond Hill", url: "https://www.cineplex.com/Theatre/silvercity-richmond-hill-cinemas", area: "North GTA" },
  { chain: "Cineplex", name: "Cineplex Burlington", city: "Burlington", url: "https://www.cineplex.com/Theatre/cineplex-cinemas-burlington", area: "West GTA" },
  { chain: "Landmark", name: "Landmark Empress Walk", city: "Toronto", url: "https://www.landmarkcinemas.com/empress-walk", area: "North York" },
  { chain: "Landmark", name: "Landmark Winston Churchill", city: "Mississauga", url: "https://www.landmarkcinemas.com/winston-churchill", area: "West GTA" },
  { chain: "AMC", name: "AMC Yonge-Dundas 24", city: "Toronto", url: "https://www.amctheatres.com/movie-theatres/toronto-on/amc-yonge-dundas-24", area: "Downtown" },
  { chain: "AMC", name: "AMC Burlington", city: "Burlington", url: "https://www.amctheatres.com/movie-theatres/burlington-on", area: "West GTA" },
  { chain: "Imagine", name: "Imagine Cinemas Woodbridge", city: "Vaughan", url: "https://imaginecinemas.com/cinema/woodbridge/", area: "North GTA" },
  { chain: "Imagine", name: "Imagine Cinemas Market Square", city: "Toronto", url: "https://imaginecinemas.com/cinema/market-square/", area: "Downtown" },
  { chain: "Imagine", name: "Imagine Cinemas Centre Mall", city: "Hamilton", url: "https://imaginecinemas.com/cinema/centre-mall/", area: "Hamilton" },
  { chain: "IMAX", name: "IMAX Ontario Science Centre", city: "Toronto", url: "https://www.ontariosciencecentre.ca/imax", area: "East Toronto" },
  { chain: "IMAX", name: "IMAX Scotiabank", city: "Toronto", url: "https://www.cineplex.com/Theatre/scotiabank-theatre-toronto", area: "Downtown" },
];

const CHAIN_COLORS = {
  Cineplex: "#e4002b", Landmark: "#1a5fa8",
  AMC: "#ff6b00", Imagine: "#8b5cf6", IMAX: "#1a1a1a",
};

// ============================================================
// SUBSCRIPTION PLANS
// ============================================================
const PLANS = [
  {
    id: "free", name: "Free", price: 0, period: "forever", color: "#666",
    features: ["✅ Browse all outings","✅ Join up to 2 outings/month","✅ View theater listings","✅ Live movie listings","❌ Post outings","❌ Unlimited joins","❌ Verified badge"],
  },
  {
    id: "pro", name: "Pro", price: 4.99, period: "month", color: "#e91e8c", popular: true,
    stripeLink: "https://buy.stripe.com/your_pro_link",
    features: ["✅ Everything in Free","✅ Post unlimited outings","✅ Unlimited joins","✅ Priority matching","✅ Verified host badge","✅ Early access","❌ Group booking tools"],
  },
  {
    id: "premium", name: "Premium", price: 9.99, period: "month", color: "#f5a623",
    stripeLink: "https://buy.stripe.com/your_premium_link",
    features: ["✅ Everything in Pro","✅ Group booking tools","✅ Featured listing boost","✅ Analytics dashboard","✅ Priority support","✅ Custom profile badge","✅ Ad-free experience"],
  },
];

const GENRES = ["All","Action","Comedy","Drama","Horror","Sci-Fi","Animation","Romance","Thriller","Documentary"];
const CITIES = ["All","Toronto","Mississauga","Brampton","Markham","Vaughan","Oakville","Burlington","Richmond Hill","Scarborough","Hamilton"];

const SAMPLE_POSTS = [
  { id: 1, title: "Loading...", host: "Alex K.", city: "Toronto", date: "2025-06-15", time: "7:00 PM", cinema: "Cineplex Varsity", genre: "Animation", spots: 3, verified: true, description: "Looking for fellow movie fans!", booking_url: "https://www.cineplex.com", reports: 0 },
];

const FAQS = [
  { q: "Is CineConnect free to use?", a: "Browsing and joining outings is always free. Posting requires a Pro membership ($4.99/month)." },
  { q: "How are hosts verified?", a: "Hosts submit ID verification. Verified hosts show a green ✓ badge. Always meet in the public cinema lobby." },
  { q: "What if I feel unsafe?", a: "Use the 🚩 Report button on any post. Admin reviews all reports within 24 hours." },
  { q: "How do booking links work?", a: "Clicking Book Tickets takes you directly to the cinema's website to purchase your ticket." },
  { q: "Can I cancel my subscription?", a: "Yes — cancel anytime from Dashboard → Subscription. Access continues until billing period ends." },
  { q: "How do I get a refund?", a: "Contact support within 7 days of charge for a full refund." },
];

// ============================================================
// STYLES
// ============================================================
const styles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0f; color: #e8e8f0; min-height: 100vh; }

  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(10,10,15,0.92); backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding: 0 24px; display: flex; align-items: center; justify-content: space-between; height: 64px;
  }
  .nav-logo {
    display: flex; align-items: center; gap: 10px; font-size: 1.4rem; font-weight: 800; cursor: pointer;
    background: linear-gradient(135deg, #f5a623, #e91e8c); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .nav-links { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .nav-btn { padding: 8px 16px; border-radius: 20px; border: none; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
  .nav-btn-ghost { background: transparent; color: #ccc; }
  .nav-btn-ghost:hover { color: #fff; background: rgba(255,255,255,0.08); }
  .nav-btn-primary { background: linear-gradient(135deg, #f5a623, #e91e8c); color: #fff; }
  .nav-btn-primary:hover { opacity: 0.85; transform: scale(1.03); }
  .nav-btn-admin { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; }

  .main { padding-top: 64px; min-height: 100vh; }

  .hero {
    position: relative; overflow: hidden; padding: 100px 24px 80px; text-align: center;
    background: radial-gradient(ellipse at 50% 0%, rgba(229,30,140,0.15), transparent 70%),
                radial-gradient(ellipse at 80% 80%, rgba(245,166,35,0.1), transparent 60%);
  }
  .hero-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; margin-bottom: 24px; background: rgba(229,30,140,0.15); border: 1px solid rgba(229,30,140,0.3); font-size: 0.8rem; color: #e91e8c; font-weight: 600; }
  .hero h1 { font-size: clamp(2.2rem, 6vw, 4rem); font-weight: 900; line-height: 1.1; margin-bottom: 20px; background: linear-gradient(135deg, #fff 40%, #e91e8c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .hero p { font-size: 1.15rem; color: #aaa; max-width: 520px; margin: 0 auto 36px; line-height: 1.7; }
  .hero-cta { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn-hero-primary { padding: 14px 32px; border-radius: 30px; border: none; background: linear-gradient(135deg, #f5a623, #e91e8c); color: #fff; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
  .btn-hero-primary:hover { transform: scale(1.05); box-shadow: 0 8px 30px rgba(229,30,140,0.4); }
  .btn-hero-secondary { padding: 14px 32px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: #fff; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .btn-hero-secondary:hover { background: rgba(255,255,255,0.1); }

  .stats-bar { display: flex; justify-content: center; gap: 48px; padding: 32px 24px; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap; }
  .stat { text-align: center; }
  .stat-num { font-size: 1.8rem; font-weight: 800; background: linear-gradient(135deg, #f5a623, #e91e8c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .stat-label { font-size: 0.8rem; color: #666; margin-top: 2px; }

  .section { padding: 60px 24px; max-width: 1200px; margin: 0 auto; }
  .section-title { font-size: 1.6rem; font-weight: 800; margin-bottom: 32px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

  /* MOVIE GRID */
  .movies-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
  .movie-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden; cursor: pointer; transition: all 0.25s; }
  .movie-card:hover { border-color: rgba(229,30,140,0.4); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
  .movie-poster-img { width: 100%; aspect-ratio: 2/3; object-fit: cover; display: block; }
  .movie-poster-fallback { width: 100%; aspect-ratio: 2/3; display: flex; align-items: center; justify-content: center; font-size: 3.5rem; background: rgba(255,255,255,0.03); }
  .movie-info { padding: 12px; }
  .movie-title { font-size: 0.85rem; font-weight: 700; margin-bottom: 4px; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .movie-meta { font-size: 0.75rem; color: #888; line-height: 1.6; }
  .movie-score { display: inline-block; padding: 2px 8px; border-radius: 8px; font-size: 0.72rem; font-weight: 700; margin-top: 4px; }
  .score-high { background: rgba(34,197,94,0.2); color: #22c55e; }
  .score-mid { background: rgba(245,166,35,0.2); color: #f5a623; }
  .score-low { background: rgba(239,68,68,0.2); color: #ef4444; }
  .movie-actions { display: flex; gap: 6px; margin-top: 8px; }
  .btn-post-movie { flex: 1; padding: 6px 8px; border-radius: 8px; border: none; background: linear-gradient(135deg, #f5a623, #e91e8c); color: #fff; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
  .btn-post-movie:hover { opacity: 0.85; }
  .btn-book-movie { padding: 6px 10px; border-radius: 8px; border: 1px solid rgba(99,102,241,0.3); background: rgba(99,102,241,0.15); color: #818cf8; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .btn-book-movie:hover { background: rgba(99,102,241,0.3); }

  /* LOADING */
  .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
  .skeleton { background: rgba(255,255,255,0.06); border-radius: 14px; animation: shimmer 1.5s infinite; }
  .skeleton-poster { aspect-ratio: 2/3; }
  .skeleton-text { height: 12px; margin: 8px; border-radius: 6px; }
  @keyframes shimmer { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }

  /* THEATER */
  .theater-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 16px; }
  .theater-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 18px; transition: all 0.2s; }
  .theater-card:hover { border-color: rgba(229,30,140,0.3); transform: translateY(-2px); }
  .theater-chain-badge { display: inline-block; padding: 3px 10px; border-radius: 10px; font-size: 0.72rem; font-weight: 700; margin-bottom: 8px; color: #fff; }
  .theater-name { font-size: 0.95rem; font-weight: 700; margin-bottom: 4px; }
  .theater-meta { font-size: 0.8rem; color: #888; margin-bottom: 12px; }
  .btn-theater { padding: 7px 14px; border-radius: 8px; border: 1px solid rgba(229,30,140,0.25); background: rgba(229,30,140,0.15); color: #e91e8c; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .btn-theater:hover { background: rgba(229,30,140,0.3); }

  /* FILTERS */
  .filters { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 32px; padding: 20px 24px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; }
  .filter-select { padding: 8px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #e8e8f0; font-size: 0.9rem; cursor: pointer; }
  .filter-toggle { padding: 8px 16px; border-radius: 10px; border: none; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .filter-toggle.active { background: linear-gradient(135deg, #f5a623, #e91e8c); color: #fff; }
  .filter-toggle.inactive { background: rgba(255,255,255,0.05); color: #aaa; border: 1px solid rgba(255,255,255,0.1); }

  /* CARDS */
  .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
  .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; transition: all 0.25s; position: relative; overflow: hidden; }
  .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(135deg, #f5a623, #e91e8c); }
  .card:hover { border-color: rgba(229,30,140,0.3); transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
  .card-genre { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; margin-bottom: 10px; background: rgba(229,30,140,0.15); color: #e91e8c; border: 1px solid rgba(229,30,140,0.25); }
  .card-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
  .card-meta { font-size: 0.82rem; color: #888; line-height: 1.8; }
  .card-meta span { display: block; }
  .verified-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 8px; background: rgba(34,197,94,0.15); color: #22c55e; font-size: 0.75rem; font-weight: 600; border: 1px solid rgba(34,197,94,0.25); margin-bottom: 8px; margin-left: 8px; }
  .card-actions { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
  .btn-join { flex: 1; padding: 9px; border-radius: 10px; border: none; background: linear-gradient(135deg, #f5a623, #e91e8c); color: #fff; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: all 0.2s; }
  .btn-join:hover { opacity: 0.85; }
  .btn-book { padding: 9px 14px; border-radius: 10px; border: 1px solid rgba(99,102,241,0.25); background: rgba(99,102,241,0.2); color: #818cf8; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
  .btn-book:hover { background: rgba(99,102,241,0.35); }
  .btn-report { padding: 9px 12px; border-radius: 10px; border: none; background: transparent; color: #666; font-size: 0.85rem; cursor: pointer; }
  .btn-report:hover { color: #ef4444; }

  /* PRICING */
  .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap: 20px; max-width: 900px; margin: 0 auto; }
  .pricing-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 28px; position: relative; transition: all 0.2s; }
  .pricing-card:hover { transform: translateY(-4px); box-shadow: 0 16px 50px rgba(0,0,0,0.3); }
  .pricing-card.popular { border-color: rgba(229,30,140,0.5); background: rgba(229,30,140,0.05); }
  .popular-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #f5a623, #e91e8c); color: #fff; padding: 4px 16px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; }
  .plan-name { font-size: 1.2rem; font-weight: 800; margin-bottom: 8px; }
  .plan-price { font-size: 2.5rem; font-weight: 900; margin-bottom: 4px; }
  .plan-period { font-size: 0.85rem; color: #888; margin-bottom: 20px; }
  .plan-features { list-style: none; margin-bottom: 24px; }
  .plan-features li { padding: 6px 0; font-size: 0.88rem; color: #ccc; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .plan-features li:last-child { border-bottom: none; }
  .btn-plan { width: 100%; padding: 12px; border-radius: 12px; border: none; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
  .btn-plan-primary { background: linear-gradient(135deg, #f5a623, #e91e8c); color: #fff; }
  .btn-plan-primary:hover { opacity: 0.88; transform: scale(1.02); }
  .btn-plan-secondary { background: rgba(255,255,255,0.07); color: #aaa; }
  .btn-plan-secondary:hover { background: rgba(255,255,255,0.12); }

  /* FORMS */
  .page-card { max-width: 560px; margin: 40px auto; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 36px; }
  .page-card h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 8px; }
  .page-card p { color: #888; font-size: 0.9rem; margin-bottom: 24px; }
  .form-group { margin-bottom: 18px; }
  .form-label { display: block; font-size: 0.85rem; font-weight: 600; color: #bbb; margin-bottom: 6px; }
  .form-input, .form-select, .form-textarea { width: 100%; padding: 11px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #e8e8f0; font-size: 0.92rem; transition: border-color 0.2s; }
  .form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: #e91e8c; box-shadow: 0 0 0 3px rgba(229,30,140,0.1); }
  .form-textarea { min-height: 100px; resize: vertical; }
  .form-select option { background: #1a1a2e; }
  .btn-submit { width: 100%; padding: 13px; border-radius: 12px; border: none; background: linear-gradient(135deg, #f5a623, #e91e8c); color: #fff; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; margin-top: 8px; }
  .btn-submit:hover { opacity: 0.88; }
  .form-switch { text-align: center; margin-top: 20px; font-size: 0.9rem; color: #888; }
  .form-switch button { background: none; border: none; color: #e91e8c; font-weight: 600; cursor: pointer; font-size: 0.9rem; }

  /* DASHBOARD */
  .dashboard { padding: 40px 24px; max-width: 1200px; margin: 0 auto; }
  .dashboard-header { margin-bottom: 32px; }
  .dashboard-header h2 { font-size: 1.8rem; font-weight: 800; }
  .dashboard-header p { color: #888; margin-top: 6px; }
  .stats-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); gap: 16px; margin-bottom: 32px; }
  .stat-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px; text-align: center; }
  .stat-card-num { font-size: 2rem; font-weight: 800; background: linear-gradient(135deg, #f5a623, #e91e8c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .stat-card-label { font-size: 0.82rem; color: #777; margin-top: 4px; }
  .tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
  .tab { padding: 9px 20px; border-radius: 10px; border: none; font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .tab.active { background: linear-gradient(135deg, #f5a623, #e91e8c); color: #fff; }
  .tab.inactive { background: rgba(255,255,255,0.05); color: #aaa; border: 1px solid rgba(255,255,255,0.08); }
  .tab.inactive:hover { background: rgba(255,255,255,0.09); color: #fff; }

  .admin-section { background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
  .admin-section h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 16px; color: #a78bfa; }
  .admin-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .admin-row:last-child { border-bottom: none; }
  .btn-danger { padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(239,68,68,0.25); background: rgba(239,68,68,0.15); color: #ef4444; font-size: 0.82rem; font-weight: 600; cursor: pointer; }
  .btn-danger:hover { background: rgba(239,68,68,0.3); }
  .btn-success { padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(34,197,94,0.25); background: rgba(34,197,94,0.15); color: #22c55e; font-size: 0.82rem; font-weight: 600; cursor: pointer; }
  .btn-success:hover { background: rgba(34,197,94,0.3); }

  /* MODAL */
  .modal-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 24px; }
  .modal { background: #13131f; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px; max-width: 480px; width: 100%; max-height: 90vh; overflow-y: auto; }
  .modal h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; }
  .modal p { color: #888; font-size: 0.9rem; margin-bottom: 20px; }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
  .btn-cancel { padding: 9px 20px; border-radius: 10px; border: none; background: rgba(255,255,255,0.06); color: #aaa; font-weight: 600; cursor: pointer; }

  .safety-banner { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2); border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; display: flex; gap: 12px; align-items: flex-start; font-size: 0.88rem; color: #86efac; }

  .live-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #22c55e; margin-right: 6px; animation: pulse 2s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.3); } }

  .toast { position: fixed; bottom: 24px; right: 24px; z-index: 300; background: #1e1e30; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px 20px; font-size: 0.9rem; font-weight: 500; box-shadow: 0 8px 30px rgba(0,0,0,0.4); animation: slideIn 0.3s ease; }
  .toast.success { border-left: 3px solid #22c55e; }
  .toast.error { border-left: 3px solid #ef4444; }
  @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

  .footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 40px 24px; text-align: center; color: #555; font-size: 0.85rem; }
  .footer-links { display: flex; gap: 20px; justify-content: center; margin-top: 12px; flex-wrap: wrap; }
  .footer-links button { background: none; border: none; color: #666; font-size: 0.85rem; cursor: pointer; }
  .footer-links button:hover { color: #e91e8c; }

  .sub-badge { display: inline-block; padding: 2px 10px; border-radius: 10px; font-size: 0.72rem; font-weight: 700; }
  .sub-free { background: rgba(102,102,102,0.2); color: #999; }
  .sub-pro { background: rgba(229,30,140,0.2); color: #e91e8c; }
  .sub-premium { background: rgba(245,166,35,0.2); color: #f5a623; }

  /* API notice */
  .api-notice { background: rgba(245,166,35,0.08); border: 1px solid rgba(245,166,35,0.2); border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; font-size: 0.85rem; color: #fcd34d; display: flex; gap: 10px; align-items: flex-start; }

  @media (max-width: 600px) {
    .nav-links .nav-btn-ghost { display: none; }
    .stats-bar { gap: 24px; }
    .hero { padding: 70px 16px 50px; }
    .section { padding: 40px 16px; }
    .page-card { padding: 24px 16px; margin: 20px 16px; }
    .movies-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
  }
`;

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(SAMPLE_POSTS);
  const [toast, setToast] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [postForm, setPostForm] = useState({ title: '', cinema: '', city: '', date: '', time: '', genre: '', spots: 2, description: '', booking_url: '' });
  const [filterGenre, setFilterGenre] = useState('All');
  const [filterCity, setFilterCity] = useState('All');
  const [filterVerified, setFilterVerified] = useState(false);
  const [dashTab, setDashTab] = useState('browse');
  const [openFaq, setOpenFaq] = useState(null);
  const [supportForm, setSupportForm] = useState({ subject: '', message: '' });
  const [reportPost, setReportPost] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [bookPost, setBookPost] = useState(null);
  const [showPricing, setShowPricing] = useState(false);
  const [theaterFilter, setTheaterFilter] = useState('All');
  const [movieTab, setMovieTab] = useState('now');

  // ── LIVE MOVIE STATE ────────────────────────────────────────
  const [nowPlaying, setNowPlaying] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [moviesError, setMoviesError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ── FETCH LIVE MOVIES FROM TMDB ─────────────────────────────
  const fetchMovies = useCallback(async () => {
    setMoviesLoading(true);
    setMoviesError(null);

    if (!TMDB_KEY) {
      // No API key — show helpful message
      setMoviesError('no_key');
      setMoviesLoading(false);
      return;
    }

    try {
      const headers = { 'Content-Type': 'application/json' };

      // Fetch Now Playing (Canadian region)
      const nowRes = await fetch(
        `${TMDB_BASE}/movie/now_playing?api_key=${TMDB_KEY}&language=en-CA&region=CA&page=1`,
        { headers }
      );

      // Fetch Upcoming (Canadian region)
      const upcomingRes = await fetch(
        `${TMDB_BASE}/movie/upcoming?api_key=${TMDB_KEY}&language=en-CA&region=CA&page=1`,
        { headers }
      );

      if (!nowRes.ok || !upcomingRes.ok) {
        throw new Error('API error');
      }

      const nowData = await nowRes.json();
      const upcomingData = await upcomingRes.json();

      // Transform TMDB data to our format
      const transformMovie = (m) => ({
        id: m.id,
        title: m.title,
        genre: TMDB_GENRES[m.genre_ids?.[0]] || 'Drama',
        rating: m.adult ? '18A' : 'PG',
        score: Math.round(m.vote_average * 10),
        overview: m.overview,
        poster: m.poster_path ? `${TMDB_IMG}${m.poster_path}` : null,
        backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : null,
        releaseDate: m.release_date,
        popularity: m.popularity,
        voteCount: m.vote_count,
      });

      const nowMovies = (nowData.results || [])
        .filter(m => m.vote_count > 10) // filter out obscure films
        .slice(0, 20)
        .map(transformMovie);

      const upcomingMovies = (upcomingData.results || [])
        .filter(m => {
          const release = new Date(m.release_date);
          return release > new Date(); // only future releases
        })
        .slice(0, 20)
        .map(transformMovie);

      setNowPlaying(nowMovies);
      setComingSoon(upcomingMovies);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Movie fetch failed:', err);
      setMoviesError('fetch_failed');
    } finally {
      setMoviesLoading(false);
    }
  }, []);

  // Fetch on mount + refresh every 6 hours
  useEffect(() => {
    fetchMovies();
    const interval = setInterval(fetchMovies, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchMovies]);

  // ── HELPERS ─────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const isAdmin = user?.isAdmin === true;
  const userPlan = user?.plan || 'free';

  // Format release date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // ── AUTH ────────────────────────────────────────────────────
  const handleAuth = (e) => {
    e.preventDefault();
    setAuthError('');
    if (authMode === 'signup') {
      if (!authForm.name || !authForm.email || !authForm.password)
        return setAuthError('Please fill in all fields.');
      if (authForm.password.length < 6)
        return setAuthError('Password must be at least 6 characters.');
      const adminFlag = authForm.email === ADMIN_EMAIL;
      setUser({ name: authForm.name, email: authForm.email, isAdmin: adminFlag, plan: 'free' });
      setPage('home');
      showToast(`Welcome, ${authForm.name}! 🎬`);
    } else {
      if (!authForm.email || !authForm.password)
        return setAuthError('Please enter your email and password.');
      const adminFlag = authForm.email === ADMIN_EMAIL;
      setUser({ name: authForm.email.split('@')[0], email: authForm.email, isAdmin: adminFlag, plan: adminFlag ? 'premium' : 'free' });
      setPage('home');
      showToast('Welcome back! 🎬');
    }
    setAuthForm({ name: '', email: '', password: '' });
  };

  const handleLogout = () => { setUser(null); setPage('home'); showToast('Logged out.'); };

  // ── POSTS ───────────────────────────────────────────────────
  const filteredPosts = posts.filter(p => {
    if (filterGenre !== 'All' && p.genre !== filterGenre) return false;
    if (filterCity !== 'All' && p.city !== filterCity) return false;
    if (filterVerified && !p.verified) return false;
    return true;
  });

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!user) { setPage('auth'); return; }
    if (userPlan === 'free') { setShowPricing(true); return; }
    if (!postForm.title || !postForm.cinema || !postForm.city || !postForm.date) {
      showToast('Please fill in all required fields.', 'error'); return;
    }
    setPosts(prev => [{ ...postForm, id: Date.now(), host: user.name, verified: isAdmin, reports: 0, spots: Number(postForm.spots) }, ...prev]);
    setPostForm({ title: '', cinema: '', city: '', date: '', time: '', genre: '', spots: 2, description: '', booking_url: '' });
    showToast('Outing posted! 🎉');
    setPage('dashboard');
  };

  const handleReport = () => {
    if (!reportReason) { showToast('Please select a reason.', 'error'); return; }
    setPosts(prev => prev.map(p => p.id === reportPost.id ? { ...p, reports: (p.reports || 0) + 1 } : p));
    showToast('Report submitted.');
    setReportPost(null); setReportReason('');
  };

  // ── SHARED COMPONENTS ────────────────────────────────────────

  // Skeleton loader for movies
  const MovieSkeleton = () => (
    <div className="loading-grid">
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="skeleton" style={{ borderRadius: 14, overflow: 'hidden' }}>
          <div className="skeleton skeleton-poster" />
          <div style={{ padding: 12 }}>
            <div className="skeleton skeleton-text" style={{ width: '80%' }} />
            <div className="skeleton skeleton-text" style={{ width: '60%', marginTop: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );

  // Movie card with real poster
  const MovieCard = ({ movie, compact = false }) => (
    <div className="movie-card">
      {movie.poster ? (
        <img
          src={movie.poster}
          alt={movie.title}
          className="movie-poster-img"
          loading="lazy"
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
      ) : null}
      <div className="movie-poster-fallback" style={{ display: movie.poster ? 'none' : 'flex' }}>
        🎬
      </div>
      <div className="movie-info">
        <div className="movie-title">{movie.title}</div>
        <div className="movie-meta">
          <span>{movie.genre}</span>
          {movie.releaseDate && (
            <span style={{ color: movieTab === 'soon' ? '#f5a623' : '#888' }}>
              {movieTab === 'soon' ? `🗓 ${formatDate(movie.releaseDate)}` : formatDate(movie.releaseDate)}
            </span>
          )}
        </div>
        {movie.score > 0 && (
          <span className={`movie-score ${movie.score >= 75 ? 'score-high' : movie.score >= 55 ? 'score-mid' : 'score-low'}`}>
            ⭐ {movie.score}%
          </span>
        )}
        <div className="movie-actions">
          <button className="btn-post-movie"
            onClick={() => {
              setPostForm(p => ({ ...p, title: movie.title, genre: movie.genre }));
              setPage('post');
            }}>
            + Post Outing
          </button>
          <button className="btn-book-movie"
            onClick={() => setBookPost({ title: movie.title, cinema: '', booking_url: 'https://www.cineplex.com' })}>
            🎟️
          </button>
        </div>
      </div>
    </div>
  );

  // API error notice
  const ApiNotice = () => (
    <div className="api-notice">
      <span>⚠️</span>
      <div>
        {moviesError === 'no_key' ? (
          <span>
            <strong>Movie listings need a free API key.</strong> Get yours free at{' '}
            <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" style={{ color: '#f5a623' }}>
              themoviedb.org
            </a>{' '}
            → add <strong>VITE_TMDB_KEY</strong> in Vercel environment variables → Redeploy.
          </span>
        ) : (
          <span>
            <strong>Could not load movies.</strong>{' '}
            <button onClick={fetchMovies} style={{ background: 'none', border: 'none', color: '#f5a623', cursor: 'pointer', fontWeight: 700 }}>
              Try again →
            </button>
          </span>
        )}
      </div>
    </div>
  );

  const PostCard = ({ post }) => (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
        <span className="card-genre">{post.genre}</span>
        {post.verified && <span className="verified-badge">✓ Verified</span>}
        {post.reports >= 3 && <span style={{ marginLeft: 8, fontSize: '0.75rem', color: '#ef4444' }}>⚠️ Flagged</span>}
      </div>
      <div className="card-title">{post.title}</div>
      <div className="card-meta">
        <span>👤 {post.host}</span>
        <span>📍 {post.city} — {post.cinema}</span>
        <span>📅 {post.date} {post.time && `at ${post.time}`}</span>
        <span>🪑 {post.spots} spot{post.spots !== 1 ? 's' : ''} available</span>
        {post.description && <span style={{ marginTop: 6, color: '#bbb', lineHeight: 1.5 }}>{post.description}</span>}
      </div>
      <div className="card-actions">
        <button className="btn-join" onClick={() => { if (!user) { setPage('auth'); return; } showToast(`Joined ${post.host}'s outing! Meet in the lobby. 🎬`); }}>🎬 Join Outing</button>
        <button className="btn-book" onClick={() => setBookPost(post)}>🎟️ Book</button>
        <button className="btn-report" onClick={() => { setReportPost(post); setReportReason(''); }}>🚩</button>
      </div>
    </div>
  );

  const PricingCards = () => (
    <div className="pricing-grid">
      {PLANS.map(plan => (
        <div key={plan.id} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
          {plan.popular && <div className="popular-badge">⭐ Most Popular</div>}
          <div className="plan-name" style={{ color: plan.color }}>{plan.name}</div>
          <div className="plan-price" style={{ color: plan.color }}>{plan.price === 0 ? 'Free' : `$${plan.price}`}</div>
          <div className="plan-period">{plan.price === 0 ? 'forever' : `per ${plan.period}`}</div>
          <ul className="plan-features">{plan.features.map((f, i) => <li key={i}>{f}</li>)}</ul>
          {plan.price === 0
            ? <button className="btn-plan btn-plan-secondary" onClick={() => { setPage('auth'); setShowPricing(false); }}>Get Started Free</button>
            : <a href={plan.stripeLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <button className="btn-plan btn-plan-primary">💳 Subscribe — ${plan.price}/mo</button>
              </a>
          }
        </div>
      ))}
    </div>
  );

  // ── PAGES ────────────────────────────────────────────────────

  const HomePage = () => (
    <div>
      <div className="hero">
        <div className="hero-badge">🎬 Canada's Movie Companion Platform</div>
        <h1>Never Watch a Movie Alone Again</h1>
        <p>Find like-minded movie fans near you, join their outing, and book seats together — safely and easily.</p>
        <div className="hero-cta">
          <button className="btn-hero-primary" onClick={() => setPage('find')}>🔍 Find an Outing</button>
          <button className="btn-hero-secondary" onClick={() => user ? setPage('post') : setPage('auth')}>✏️ Post an Outing</button>
        </div>
      </div>

      <div className="stats-bar">
        {[['1,240+','Active Members'],['380+','Outings Posted'],['28','Cities Covered'],['4.9★','Safety Rating']].map(([n,l]) => (
          <div className="stat" key={l}><div className="stat-num">{n}</div><div className="stat-label">{l}</div></div>
        ))}
      </div>

      {/* Live Now Playing Preview */}
      <div className="section">
        <div className="section-title">
          🎬 Now Playing in GTA
          <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 400, marginLeft: 'auto' }}>
            {lastUpdated ? <><span className="live-dot"></span>Updated {lastUpdated.toLocaleTimeString()}</> : <><span className="live-dot"></span>Loading...</>}
          </span>
        </div>

        {moviesError && <ApiNotice />}

        {moviesLoading ? <MovieSkeleton /> : (
          <div className="movies-grid">
            {nowPlaying.slice(0, 8).map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button className="btn-hero-secondary" onClick={() => setPage('movies')}>View All {nowPlaying.length} Movies →</button>
        </div>
      </div>

      {/* Latest Outings */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="safety-banner">
          🛡️ <span><strong>Safety First:</strong> Always meet in the public cinema lobby. Never share personal details before meeting. Look for the green ✓ verified badge.</span>
        </div>
        <div className="section-title">🔥 Latest Outings</div>
        <div className="cards-grid">{posts.slice(0,3).map(post => <PostCard key={post.id} post={post} />)}</div>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button className="btn-hero-primary" onClick={() => setPage('find')}>View All Outings →</button>
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '60px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="section-title" style={{ justifyContent: 'center', marginBottom: 40 }}>How CineConnect Works</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 24 }}>
            {[['🔍','Find an Outing','Browse by genre, city, or verified hosts.'],['🤝','Join & Connect','Request to join — meet in the cinema lobby.'],['🎟️','Book Your Seat','Use our direct booking links.'],['🎬','Enjoy Together','Watch and make new friends!']].map(([icon,title,desc]) => (
              <div key={title} style={{ textAlign: 'center', padding: '28px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16 }}>
                <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>{icon}</div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: '0.85rem', color: '#888', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title" style={{ justifyContent: 'center' }}>💳 Simple Pricing</div>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: 40 }}>Start free, upgrade when you're ready</p>
        <PricingCards />
      </div>
    </div>
  );

  // MOVIES PAGE - Full live listings
  const MoviesPage = () => (
    <div className="section">
      <div className="section-title">
        🎬 GTA Movie Listings
        <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 400, marginLeft: 'auto' }}>
          {lastUpdated ? <><span className="live-dot"></span>Live · {lastUpdated.toLocaleTimeString()}</> : ''}
          {!moviesLoading && (
            <button onClick={fetchMovies} style={{ marginLeft: 12, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#888', padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer' }}>
              🔄 Refresh
            </button>
          )}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { id: 'now', label: `🎬 Now Playing (${nowPlaying.length})` },
          { id: 'soon', label: `📅 Coming Soon (${comingSoon.length})` },
        ].map(t => (
          <button key={t.id} className={`tab ${movieTab === t.id ? 'active' : 'inactive'}`} onClick={() => setMovieTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {moviesError && <ApiNotice />}

      {moviesLoading ? <MovieSkeleton /> : (
        <>
          {(movieTab === 'now' ? nowPlaying : comingSoon).length === 0 && !moviesError ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎭</div>
              <p>No movies found. {moviesError ? '' : 'Try refreshing.'}</p>
              <button className="btn-hero-primary" style={{ marginTop: 20 }} onClick={fetchMovies}>🔄 Refresh</button>
            </div>
          ) : (
            <div className="movies-grid">
              {(movieTab === 'now' ? nowPlaying : comingSoon).map(m => <MovieCard key={m.id} movie={m} />)}
            </div>
          )}
        </>
      )}

      {!moviesError && !moviesLoading && (
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.8rem', color: '#555' }}>
          Movie data provided by{' '}
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" style={{ color: '#e91e8c' }}>
            The Movie Database (TMDB)
          </a>
        </p>
      )}
    </div>
  );

  // THEATERS PAGE
  const TheatersPage = () => {
    const chains = ['All', ...new Set(GTA_THEATERS.map(t => t.chain))];
    const filtered = theaterFilter === 'All' ? GTA_THEATERS : GTA_THEATERS.filter(t => t.chain === theaterFilter);
    return (
      <div className="section">
        <div className="section-title">🏟️ GTA Theater Directory
          <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 400, marginLeft: 'auto' }}>
            {GTA_THEATERS.length} theaters · {[...new Set(GTA_THEATERS.map(t => t.city))].length} cities
          </span>
        </div>
        <div className="filters" style={{ marginBottom: 28 }}>
          {chains.map(c => (
            <button key={c} className={`filter-toggle ${theaterFilter === c ? 'active' : 'inactive'}`} onClick={() => setTheaterFilter(c)}>{c}</button>
          ))}
        </div>
        <div className="theater-grid">
          {filtered.map((t, i) => (
            <div className="theater-card" key={i}>
              <span className="theater-chain-badge" style={{ background: CHAIN_COLORS[t.chain] || '#666' }}>{t.chain}</span>
              <div className="theater-name">{t.name}</div>
              <div className="theater-meta">📍 {t.city} · {t.area}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={t.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <button className="btn-theater">🎟️ Book Tickets</button>
                </a>
                <button className="btn-theater" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderColor: 'rgba(99,102,241,0.25)' }}
                  onClick={() => { setPostForm(p => ({ ...p, cinema: t.name, city: t.city })); setPage('post'); }}>
                  + Post Here
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
        <button className={`filter-toggle ${filterVerified ? 'active' : 'inactive'}`} onClick={() => setFilterVerified(v => !v)}>✓ Verified Only</button>
        <span style={{ fontSize: '0.85rem', color: '#666', alignSelf: 'center', marginLeft: 'auto' }}>{filteredPosts.length} outing{filteredPosts.length !== 1 ? 's' : ''}</span>
      </div>
      {filteredPosts.length === 0
        ? <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎭</div>
            <p>No outings match your filters.</p>
            <button className="btn-hero-primary" style={{ marginTop: 20 }} onClick={() => user ? setPage('post') : setPage('auth')}>Post an Outing</button>
          </div>
        : <div className="cards-grid">{filteredPosts.map(post => <PostCard key={post.id} post={post} />)}</div>
      }
    </div>
  );

  const PostPage = () => {
    if (!user) return (
      <div className="page-card"><h2>✏️ Post an Outing</h2><p>You need to be logged in.</p>
        <button className="btn-submit" onClick={() => setPage('auth')}>Log In / Sign Up</button>
      </div>
    );
    if (userPlan === 'free') return (
      <div className="page-card">
        <h2>⭐ Pro Feature</h2><p>Posting requires a Pro or Premium subscription.</p>
        <div style={{ background: 'rgba(229,30,140,0.08)', border: '1px solid rgba(229,30,140,0.2)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>🚀 Upgrade to Pro — $4.99/month</div>
          <div style={{ fontSize: '0.85rem', color: '#888' }}>Post unlimited outings, verified badge, priority matching</div>
        </div>
        <button className="btn-submit" onClick={() => setShowPricing(true)}>View Plans & Upgrade</button>
      </div>
    );
    return (
      <div className="page-card">
        <h2>✏️ Post an Outing</h2><p>Share your movie plans and find companions.</p>
        <div className="safety-banner" style={{ marginBottom: 20 }}>🛡️ By posting, you agree to meet companions in the public cinema lobby only.</div>
        <form onSubmit={handlePostSubmit}>
          <div className="form-group">
            <label className="form-label">Movie Title *</label>
            <input className="form-input" placeholder="e.g. Inside Out 2" value={postForm.title} onChange={e => setPostForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Cinema *</label>
            <select className="form-select" value={postForm.cinema}
              onChange={e => { const t = GTA_THEATERS.find(t => t.name === e.target.value); setPostForm(p => ({ ...p, cinema: e.target.value, city: t?.city || p.city, booking_url: t?.url || p.booking_url })); }}>
              <option value="">Select a theater</option>
              {Object.keys(CHAIN_COLORS).map(chain => (
                <optgroup key={chain} label={`── ${chain} ──`}>
                  {GTA_THEATERS.filter(t => t.chain === chain).map(t => <option key={t.name} value={t.name}>{t.name} ({t.city})</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">City *</label>
              <select className="form-select" value={postForm.city} onChange={e => setPostForm(p => ({ ...p, city: e.target.value }))}>
                <option value="">Select city</option>
                {CITIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Genre</label>
              <select className="form-select" value={postForm.genre} onChange={e => setPostForm(p => ({ ...p, genre: e.target.value }))}>
                <option value="">Select genre</option>
                {GENRES.filter(g => g !== 'All').map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className="form-input" value={postForm.date} onChange={e => setPostForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input type="time" className="form-input" value={postForm.time} onChange={e => setPostForm(p => ({ ...p, time: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Available Spots</label>
            <input type="number" min={1} max={10} className="form-input" value={postForm.spots} onChange={e => setPostForm(p => ({ ...p, spots: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Tell people about yourself..." value={postForm.description} onChange={e => setPostForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <button type="submit" className="btn-submit">🎬 Post Outing</button>
        </form>
      </div>
    );
  };

  const AuthPage = () => (
    <div className="page-card">
      <h2>{authMode === 'login' ? '👋 Welcome Back' : '🎬 Join CineConnect'}</h2>
      <p>{authMode === 'login' ? 'Log in to join outings.' : 'Create your free account.'}</p>
      {authError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: '0.88rem', color: '#fca5a5' }}>⚠️ {authError}</div>}
      <form onSubmit={handleAuth}>
        {authMode === 'signup' && (
          <div className="form-group"><label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Your name" value={authForm.name} onChange={e => setAuthForm(p => ({ ...p, name: e.target.value }))} />
          </div>
        )}
        <div className="form-group"><label className="form-label">Email</label>
          <input type="email" className="form-input" placeholder="you@email.com" value={authForm.email} onChange={e => setAuthForm(p => ({ ...p, email: e.target.value }))} />
        </div>
        <div className="form-group"><label className="form-label">Password</label>
          <input type="password" className="form-input" placeholder="Min 6 characters" value={authForm.password} onChange={e => setAuthForm(p => ({ ...p, password: e.target.value }))} />
        </div>
        <button type="submit" className="btn-submit">{authMode === 'login' ? '🔑 Log In' : '🚀 Create Account'}</button>
      </form>
      <div className="form-switch">
        {authMode === 'login'
          ? <span>Don't have an account? <button onClick={() => { setAuthMode('signup'); setAuthError(''); }}>Sign Up Free</button></span>
          : <span>Already have an account? <button onClick={() => { setAuthMode('login'); setAuthError(''); }}>Log In</button></span>}
      </div>
    </div>
  );

  const PricingPage = () => (
    <div className="section">
      <div className="section-title" style={{ justifyContent: 'center' }}>💳 Choose Your Plan</div>
      <p style={{ textAlign: 'center', color: '#888', marginBottom: 40 }}>Start free. Upgrade anytime. Cancel anytime.</p>
      <PricingCards />
      <div style={{ maxWidth: 600, margin: '48px auto 0', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 16 }}>🔒 Payment Security</div>
        <div style={{ display: 'grid', gap: 10, fontSize: '0.88rem', color: '#888' }}>
          <div>✅ Payments processed by <strong style={{ color: '#ccc' }}>Stripe</strong></div>
          <div>✅ We never store your card details</div>
          <div>✅ Cancel anytime — no hidden fees</div>
          <div>✅ 7-day money-back guarantee</div>
        </div>
      </div>
    </div>
  );

  const DashboardPage = () => {
    const myPosts = posts.filter(p => p.host === user?.name);
    const flagged = posts.filter(p => p.reports >= 1);
    const tabs = [
      { id: 'browse', label: '🔍 Browse' },
      { id: 'myposts', label: '📋 My Posts' },
      { id: 'subscription', label: '💳 Subscription' },
      ...(isAdmin ? [{ id: 'admin', label: '👑 Admin' }] : []),
    ];
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>📊 Dashboard</h2>
          <p>Welcome back, <strong>{user?.name}</strong>
            <span className={`sub-badge sub-${userPlan}`} style={{ marginLeft: 10 }}>{userPlan.toUpperCase()}</span>
            {isAdmin && <span style={{ marginLeft: 8, color: '#a78bfa', fontWeight: 700 }}>👑 Admin</span>}
          </p>
        </div>
        <div className="stats-cards">
          {[[posts.length,'Total Outings'],[myPosts.length,'My Posts'],[nowPlaying.length,'Now Playing'],[GTA_THEATERS.length,'GTA Theaters']].map(([val,label]) => (
            <div className="stat-card" key={label}><div className="stat-card-num">{val}</div><div className="stat-card-label">{label}</div></div>
          ))}
        </div>
        <div className="tabs">
          {tabs.map(t => <button key={t.id} className={`tab ${dashTab === t.id ? 'active' : 'inactive'}`} onClick={() => setDashTab(t.id)}>{t.label}</button>)}
        </div>
        {dashTab === 'browse' && <div className="cards-grid">{posts.map(post => <PostCard key={post.id} post={post} />)}</div>}
        {dashTab === 'myposts' && (
          myPosts.length === 0
            ? <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
                <p>No outings posted yet.</p>
                <button className="btn-hero-primary" style={{ marginTop: 16 }} onClick={() => setPage('post')}>Post Your First Outing</button>
              </div>
            : <div className="cards-grid">{myPosts.map(post => (
                <div key={post.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span className="card-genre">{post.genre}</span>
                    <button className="btn-danger" onClick={() => { setPosts(prev => prev.filter(p => p.id !== post.id)); showToast('Post deleted.'); }}>Delete</button>
                  </div>
                  <div className="card-title">{post.title}</div>
                  <div className="card-meta"><span>📍 {post.city} — {post.cinema}</span><span>📅 {post.date}</span></div>
                </div>
              ))}</div>
        )}
        {dashTab === 'subscription' && (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 12 }}>Current Plan</div>
              <span className={`sub-badge sub-${userPlan}`} style={{ fontSize: '1rem', padding: '6px 16px' }}>{userPlan.toUpperCase()}</span>
              {userPlan === 'free' && <><br/><button className="btn-submit" style={{ width: 'auto', padding: '10px 24px', marginTop: 16 }} onClick={() => setShowPricing(true)}>⭐ Upgrade Now</button></>}
              {userPlan !== 'free' && <p style={{ fontSize: '0.85rem', color: '#888', marginTop: 12 }}>Manage at <a href="https://billing.stripe.com" target="_blank" rel="noopener noreferrer" style={{ color: '#e91e8c' }}>Stripe billing portal</a></p>}
            </div>
            <PricingCards />
          </div>
        )}
        {dashTab === 'admin' && isAdmin && (
          <div>
            <div className="admin-section">
              <h3>🚩 Flagged Posts ({flagged.length})</h3>
              {flagged.length === 0
                ? <p style={{ color: '#666', fontSize: '0.9rem' }}>No flagged posts ✅</p>
                : flagged.map(post => (
                  <div className="admin-row" key={post.id}>
                    <div><div style={{ fontWeight: 600 }}>{post.title}</div><div style={{ fontSize: '0.82rem', color: '#888' }}>by {post.host} · {post.reports} report{post.reports !== 1 ? 's' : ''}</div></div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-success" onClick={() => { setPosts(prev => prev.map(p => p.id === post.id ? { ...p, reports: 0 } : p)); showToast('Cleared ✓'); }}>Clear</button>
                      <button className="btn-danger" onClick={() => { setPosts(prev => prev.filter(p => p.id !== post.id)); showToast('Deleted.'); }}>Delete</button>
                    </div>
                  </div>
                ))
              }
            </div>
            <div className="admin-section">
              <h3>📊 Platform Stats</h3>
              <div className="admin-row"><span>Now Playing Movies</span><strong>{nowPlaying.length}</strong></div>
              <div className="admin-row"><span>Coming Soon</span><strong>{comingSoon.length}</strong></div>
              <div className="admin-row"><span>GTA Theaters</span><strong>{GTA_THEATERS.length}</strong></div>
              <div className="admin-row"><span>Total Outings</span><strong>{posts.length}</strong></div>
              <div className="admin-row"><span>Last Movie Refresh</span><strong>{lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'}</strong></div>
              <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                <button className="btn-success" style={{ flex: 1, padding: 10 }} onClick={() => { fetchMovies(); showToast('Movies refreshed! 🎬'); }}>🔄 Refresh Movies</button>
                <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
                  <button className="btn-success" style={{ width: '100%', padding: 10 }}>📊 Stripe Dashboard</button>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const SupportPage = () => (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
      <div className="section-title">🛟 Support & Help</div>
      <div style={{ marginBottom: 36 }}>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px', marginBottom: 12, cursor: 'pointer' }}
            onClick={() => setOpenFaq(openFaq === i ? null : i)}>
            <div style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}><span>{faq.q}</span><span>{openFaq === i ? '▲' : '▼'}</span></div>
            {openFaq === i && <div style={{ color: '#888', fontSize: '0.88rem', marginTop: 10, lineHeight: 1.7 }}>{faq.a}</div>}
          </div>
        ))}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>📬 Contact Us</div>
        <p style={{ color: '#888', fontSize: '0.88rem', marginBottom: 20 }}>We respond within 24 hours.</p>
        <div className="form-group"><label className="form-label">Subject</label>
          <input className="form-input" placeholder="e.g. Subscription issue..." value={supportForm.subject} onChange={e => setSupportForm(p => ({ ...p, subject: e.target.value }))} />
        </div>
        <div className="form-group"><label className="form-label">Message</label>
          <textarea className="form-textarea" placeholder="Describe your issue..." value={supportForm.message} onChange={e => setSupportForm(p => ({ ...p, message: e.target.value }))} />
        </div>
        <button className="btn-submit" onClick={() => {
          if (!supportForm.subject || !supportForm.message) { showToast('Please fill both fields.', 'error'); return; }
          showToast('Message sent! We\'ll reply within 24 hours ✓');
          setSupportForm({ subject: '', message: '' });
        }}>📤 Send Message</button>
      </div>
    </div>
  );

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <>
      <style>{styles}</style>

      <nav className="nav">
        <div className="nav-logo" onClick={() => setPage('home')}><span>🎬</span> CineConnect</div>
        <div className="nav-links">
          <button className="nav-btn nav-btn-ghost" onClick={() => setPage('find')}>Find</button>
          <button className="nav-btn nav-btn-ghost" onClick={() => setPage('movies')}>Movies</button>
          <button className="nav-btn nav-btn-ghost" onClick={() => setPage('theaters')}>Theaters</button>
          <button className="nav-btn nav-btn-ghost" onClick={() => setPage('pricing')}>Pricing</button>
          {isAdmin && <button className="nav-btn nav-btn-admin" onClick={() => { setPage('dashboard'); setDashTab('admin'); }}>👑 Admin</button>}
          {user
            ? <><button className="nav-btn nav-btn-ghost" onClick={() => setPage('dashboard')}>📊 {user.name}</button>
                <button className="nav-btn nav-btn-ghost" onClick={handleLogout}>Log Out</button></>
            : <><button className="nav-btn nav-btn-ghost" onClick={() => { setPage('auth'); setAuthMode('login'); }}>Log In</button>
                <button className="nav-btn nav-btn-primary" onClick={() => { setPage('auth'); setAuthMode('signup'); }}>Sign Up Free</button></>
          }
        </div>
      </nav>

      <main className="main">
        {page === 'home' && <HomePage />}
        {page === 'find' && <FindPage />}
        {page === 'movies' && <MoviesPage />}
        {page === 'theaters' && <TheatersPage />}
        {page === 'pricing' && <PricingPage />}
        {page === 'post' && <PostPage />}
        {page === 'auth' && <AuthPage />}
        {page === 'dashboard' && (user ? <DashboardPage /> : <AuthPage />)}
        {page === 'support' && <SupportPage />}
      </main>

      <footer className="footer">
        <div>© 2025 CineConnect — Find Your Movie Companion in the GTA</div>
        <div className="footer-links">
          <button onClick={() => setPage('find')}>Browse Outings</button>
          <button onClick={() => setPage('movies')}>Movies</button>
          <button onClick={() => setPage('theaters')}>Theaters</button>
          <button onClick={() => setPage('pricing')}>Pricing</button>
          <button onClick={() => setPage('support')}>Support</button>
        </div>
      </footer>

      {showPricing && (
        <div className="modal-overlay" onClick={() => setShowPricing(false)}>
          <div className="modal" style={{ maxWidth: 900 }} onClick={e => e.stopPropagation()}>
            <h3>⭐ Upgrade Your Plan</h3>
            <p>Unlock posting and premium features</p>
            <PricingCards />
            <div className="modal-actions"><button className="btn-cancel" onClick={() => setShowPricing(false)}>Maybe Later</button></div>
          </div>
        </div>
      )}

      {bookPost && (
        <div className="modal-overlay" onClick={() => setBookPost(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>🎟️ Book Tickets — {bookPost.title}</h3>
            <p>Choose your preferred cinema:</p>
            {bookPost.booking_url && (
              <a href={bookPost.booking_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 12 }}>
                <button className="btn-submit" style={{ marginTop: 0 }}>🎬 Book at {bookPost.cinema || 'Cinema'}</button>
              </a>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {GTA_THEATERS.reduce((acc, t) => { if (!acc.find(a => a.chain === t.chain)) acc.push(t); return acc; }, []).map(t => (
                <a key={t.chain} href={`${t.url}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <button style={{ width: '100%', padding: 10, borderRadius: 10, border: `1px solid ${CHAIN_COLORS[t.chain]}44`, background: `${CHAIN_COLORS[t.chain]}18`, color: '#e8e8f0', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                    {t.chain} →
                  </button>
                </a>
              ))}
            </div>
            <div className="modal-actions"><button className="btn-cancel" onClick={() => setBookPost(null)}>Close</button></div>
          </div>
        </div>
      )}

      {reportPost && (
        <div className="modal-overlay" onClick={() => setReportPost(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>🚩 Report This Post</h3>
            <p>Report "{reportPost.title}"</p>
            {['Suspicious or unsafe behaviour','Inappropriate content','Spam or fake post','Harassment','Other'].map(reason => (
              <div key={reason} style={{ marginBottom: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', borderRadius: 10, background: reportReason === reason ? 'rgba(229,30,140,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${reportReason === reason ? 'rgba(229,30,140,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
                  <input type="radio" name="reason" value={reason} checked={reportReason === reason} onChange={() => setReportReason(reason)} style={{ accentColor: '#e91e8c' }} />
                  <span style={{ fontSize: '0.9rem' }}>{reason}</span>
                </label>
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setReportPost(null)}>Cancel</button>
              <button className="btn-submit" style={{ width: 'auto', padding: '9px 20px' }} onClick={handleReport}>Submit Report</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
