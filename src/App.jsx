import React, { useState, useEffect, useCallback } from 'react';

// ============================================================
// CONFIG
// ============================================================
const ADMIN_EMAIL = "your@gmail.com"; // ← change to your email

const STRIPE_KEY = import.meta.env.VITE_STRIPE_KEY || null;

// ============================================================
// GTA THEATER CHAINS
// ============================================================
const GTA_THEATERS = [
  // CINEPLEX
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

  // LANDMARK
  { chain: "Landmark", name: "Landmark Empress Walk", city: "Toronto", url: "https://www.landmarkcinemas.com/empress-walk", area: "North York" },
  { chain: "Landmark", name: "Landmark Winston Churchill", city: "Mississauga", url: "https://www.landmarkcinemas.com/winston-churchill", area: "West GTA" },

  // AMC
  { chain: "AMC", name: "AMC Yonge-Dundas 24", city: "Toronto", url: "https://www.amctheatres.com/movie-theatres/toronto-on/amc-yonge-dundas-24", area: "Downtown" },
  { chain: "AMC", name: "AMC Burlington", city: "Burlington", url: "https://www.amctheatres.com/movie-theatres/burlington-on", area: "West GTA" },

  // IMAGINE CINEMAS
  { chain: "Imagine", name: "Imagine Cinemas Woodbridge", city: "Vaughan", url: "https://imaginecinemas.com/cinema/woodbridge/", area: "North GTA" },
  { chain: "Imagine", name: "Imagine Cinemas Market Square", city: "Toronto", url: "https://imaginecinemas.com/cinema/market-square/", area: "Downtown" },
  { chain: "Imagine", name: "Imagine Cinemas Centre Mall", city: "Hamilton", url: "https://imaginecinemas.com/cinema/centre-mall/", area: "Hamilton" },

  // IMAX
  { chain: "IMAX", name: "IMAX Ontario Science Centre", city: "Toronto", url: "https://www.ontariosciencecentre.ca/imax", area: "East Toronto" },
  { chain: "IMAX", name: "IMAX Scotiabank", city: "Toronto", url: "https://www.cineplex.com/Theatre/scotiabank-theatre-toronto", area: "Downtown" },
];

const CHAIN_COLORS = {
  Cineplex: "#e4002b",
  Landmark: "#1a5fa8",
  AMC: "#ff6b00",
  Imagine: "#8b5cf6",
  IMAX: "#000000",
};

// ============================================================
// SUBSCRIPTION PLANS
// ============================================================
const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    color: "#666",
    features: [
      "✅ Browse all outings",
      "✅ Join up to 2 outings/month",
      "✅ View theater listings",
      "❌ Post outings",
      "❌ Unlimited joins",
      "❌ Priority matching",
      "❌ Verified badge",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 4.99,
    period: "month",
    color: "#e91e8c",
    popular: true,
    stripeLink: "https://buy.stripe.com/your_pro_link", // ← replace with your Stripe payment link
    features: [
      "✅ Everything in Free",
      "✅ Post unlimited outings",
      "✅ Unlimited joins",
      "✅ Priority matching",
      "✅ Verified host badge",
      "✅ Early access to features",
      "❌ Group booking tools",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 9.99,
    period: "month",
    color: "#f5a623",
    stripeLink: "https://buy.stripe.com/your_premium_link", // ← replace with your Stripe payment link
    features: [
      "✅ Everything in Pro",
      "✅ Group booking tools",
      "✅ Featured listing boost",
      "✅ Analytics dashboard",
      "✅ Priority support",
      "✅ Custom profile badge",
      "✅ Ad-free experience",
    ],
  },
];

// ============================================================
// SAMPLE MOVIES (simulating live fetch)
// ============================================================
const NOW_PLAYING = [
  { id: 1, title: "Inside Out 2", genre: "Animation", rating: "PG", duration: "100 min", score: 91, poster: "🎭" },
  { id: 2, title: "A Quiet Place: Day One", genre: "Horror", rating: "14A", duration: "99 min", score: 78, poster: "👻" },
  { id: 3, title: "Despicable Me 4", genre: "Animation", rating: "G", duration: "94 min", score: 72, poster: "🍌" },
  { id: 4, title: "Twisters", genre: "Action", rating: "PG", duration: "122 min", score: 83, poster: "🌪️" },
  { id: 5, title: "Longlegs", genre: "Thriller", rating: "18A", duration: "101 min", score: 67, poster: "🔍" },
  { id: 6, title: "Fly Me to the Moon", genre: "Romance", rating: "PG", duration: "132 min", score: 74, poster: "🌙" },
  { id: 7, title: "Horizon: An American Saga", genre: "Drama", rating: "14A", duration: "181 min", score: 58, poster: "🤠" },
  { id: 8, title: "MaXXXine", genre: "Horror", rating: "18A", duration: "103 min", score: 80, poster: "🎬" },
];

const COMING_SOON = [
  { id: 9, title: "Deadpool & Wolverine", genre: "Action", rating: "TBD", releaseDate: "Jul 26", poster: "⚔️" },
  { id: 10, title: "Alien: Romulus", genre: "Sci-Fi", rating: "TBD", releaseDate: "Aug 16", poster: "👾" },
  { id: 11, title: "Beetlejuice Beetlejuice", genre: "Comedy", rating: "TBD", releaseDate: "Sep 6", poster: "🪲" },
  { id: 12, title: "Joker: Folie à Deux", genre: "Drama", rating: "TBD", releaseDate: "Oct 4", poster: "🃏" },
  { id: 13, title: "Venom: The Last Dance", genre: "Action", rating: "TBD", releaseDate: "Oct 25", poster: "🕷️" },
  { id: 14, title: "Gladiator II", genre: "Action", rating: "TBD", releaseDate: "Nov 22", poster: "⚔️" },
];

const GENRES = ["All","Action","Comedy","Drama","Horror","Sci-Fi","Animation","Romance","Thriller","Documentary"];
const CITIES = ["All","Toronto","Mississauga","Brampton","Markham","Vaughan","Oakville","Burlington","Richmond Hill","Scarborough","Hamilton"];

const SAMPLE_POSTS = [
  { id: 1, title: "Inside Out 2", host: "Alex K.", city: "Toronto", date: "2025-06-15", time: "7:00 PM", cinema: "Cineplex Varsity", genre: "Animation", spots: 3, verified: true, description: "Looking for fellow animation fans!", booking_url: "https://www.cineplex.com", reports: 0 },
  { id: 2, title: "Twisters", host: "Maria S.", city: "Mississauga", date: "2025-06-18", time: "9:00 PM", cinema: "SilverCity Mississauga", genre: "Action", spots: 4, verified: true, description: "Action night, all welcome!", booking_url: "https://www.cineplex.com", reports: 0 },
  { id: 3, title: "Longlegs", host: "James T.", city: "Brampton", date: "2025-06-20", time: "8:30 PM", cinema: "SilverCity Brampton", genre: "Thriller", spots: 2, verified: false, description: "Thriller fans only!", booking_url: "https://www.cineplex.com", reports: 0 },
];

// ============================================================
// STYLES
// ============================================================
const styles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #0a0a0f; color: #e8e8f0; min-height: 100vh;
  }

  /* NAV */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(10,10,15,0.92); backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding: 0 24px; display: flex; align-items: center;
    justify-content: space-between; height: 64px;
  }
  .nav-logo {
    display: flex; align-items: center; gap: 10px;
    font-size: 1.4rem; font-weight: 800; cursor: pointer;
    background: linear-gradient(135deg, #f5a623, #e91e8c);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .nav-links { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .nav-btn {
    padding: 8px 16px; border-radius: 20px; border: none;
    cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s;
  }
  .nav-btn-ghost { background: transparent; color: #ccc; }
  .nav-btn-ghost:hover { color: #fff; background: rgba(255,255,255,0.08); }
  .nav-btn-primary { background: linear-gradient(135deg, #f5a623, #e91e8c); color: #fff; }
  .nav-btn-primary:hover { opacity: 0.85; transform: scale(1.03); }
  .nav-btn-admin { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; }

  /* MAIN */
  .main { padding-top: 64px; min-height: 100vh; }

  /* HERO */
  .hero {
    position: relative; overflow: hidden;
    padding: 100px 24px 80px; text-align: center;
    background: radial-gradient(ellipse at 50% 0%, rgba(229,30,140,0.15), transparent 70%),
                radial-gradient(ellipse at 80% 80%, rgba(245,166,35,0.1), transparent 60%);
  }
  .hero-badge {
    display: inline-block; padding: 6px 16px; border-radius: 20px; margin-bottom: 24px;
    background: rgba(229,30,140,0.15); border: 1px solid rgba(229,30,140,0.3);
    font-size: 0.8rem; color: #e91e8c; font-weight: 600;
  }
  .hero h1 {
    font-size: clamp(2.2rem, 6vw, 4rem); font-weight: 900; line-height: 1.1; margin-bottom: 20px;
    background: linear-gradient(135deg, #fff 40%, #e91e8c);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .hero p { font-size: 1.15rem; color: #aaa; max-width: 520px; margin: 0 auto 36px; line-height: 1.7; }
  .hero-cta { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn-hero-primary {
    padding: 14px 32px; border-radius: 30px; border: none;
    background: linear-gradient(135deg, #f5a623, #e91e8c);
    color: #fff; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
  }
  .btn-hero-primary:hover { transform: scale(1.05); box-shadow: 0 8px 30px rgba(229,30,140,0.4); }
  .btn-hero-secondary {
    padding: 14px 32px; border-radius: 30px;
    border: 1px solid rgba(255,255,255,0.2);
    background: rgba(255,255,255,0.05);
    color: #fff; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
  }
  .btn-hero-secondary:hover { background: rgba(255,255,255,0.1); }

  /* STATS BAR */
  .stats-bar {
    display: flex; justify-content: center; gap: 48px; padding: 32px 24px;
    border-top: 1px solid rgba(255,255,255,0.06);
    border-bottom: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;
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
  .section-title { font-size: 1.6rem; font-weight: 800; margin-bottom: 32px; display: flex; align-items: center; gap: 10px; }

  /* NOW PLAYING */
  .movies-scroll {
    display: flex; gap: 16px; overflow-x: auto; padding-bottom: 16px;
    scrollbar-width: thin; scrollbar-color: #e91e8c #1a1a2e;
  }
  .movie-card {
    min-width: 180px; background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08); border-radius: 14px;
    padding: 16px; cursor: pointer; transition: all 0.2s; flex-shrink: 0;
  }
  .movie-card:hover { border-color: rgba(229,30,140,0.4); transform: translateY(-3px); }
  .movie-poster { font-size: 3rem; text-align: center; margin-bottom: 10px; }
  .movie-title { font-size: 0.9rem; font-weight: 700; margin-bottom: 6px; line-height: 1.3; }
  .movie-meta { font-size: 0.75rem; color: #888; line-height: 1.6; }
  .movie-score {
    display: inline-block; padding: 2px 8px; border-radius: 8px;
    font-size: 0.75rem; font-weight: 700; margin-top: 6px;
  }
  .score-high { background: rgba(34,197,94,0.2); color: #22c55e; }
  .score-mid { background: rgba(245,166,35,0.2); color: #f5a623; }
  .score-low { background: rgba(239,68,68,0.2); color: #ef4444; }

  /* THEATER GRID */
  .theater-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 16px;
  }
  .theater-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; padding: 18px; transition: all 0.2s;
  }
  .theater-card:hover { border-color: rgba(229,30,140,0.3); transform: translateY(-2px); }
  .theater-chain-badge {
    display: inline-block; padding: 3px 10px; border-radius: 10px;
    font-size: 0.72rem; font-weight: 700; margin-bottom: 8px; color: #fff;
  }
  .theater-name { font-size: 0.95rem; font-weight: 700; margin-bottom: 4px; }
  .theater-meta { font-size: 0.8rem; color: #888; margin-bottom: 12px; }
  .btn-theater {
    padding: 7px 14px; border-radius: 8px; border: none;
    background: rgba(229,30,140,0.15); color: #e91e8c;
    font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
    border: 1px solid rgba(229,30,140,0.25);
  }
  .btn-theater:hover { background: rgba(229,30,140,0.3); }

  /* FILTERS */
  .filters {
    display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 32px;
    padding: 20px 24px; background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07); border-radius: 16px;
  }
  .filter-select {
    padding: 8px 14px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05); color: #e8e8f0; font-size: 0.9rem; cursor: pointer;
  }
  .filter-toggle {
    padding: 8px 16px; border-radius: 10px; border: none;
    font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
  }
  .filter-toggle.active { background: linear-gradient(135deg, #f5a623, #e91e8c); color: #fff; }
  .filter-toggle.inactive { background: rgba(255,255,255,0.05); color: #aaa; border: 1px solid rgba(255,255,255,0.1); }

  /* CARDS GRID */
  .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
  .card {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 20px; transition: all 0.25s; position: relative; overflow: hidden;
  }
  .card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(135deg, #f5a623, #e91e8c);
  }
  .card:hover { border-color: rgba(229,30,140,0.3); transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
  .card-genre {
    display: inline-block; padding: 3px 10px; border-radius: 12px;
    font-size: 0.75rem; font-weight: 600; margin-bottom: 10px;
    background: rgba(229,30,140,0.15); color: #e91e8c; border: 1px solid rgba(229,30,140,0.25);
  }
  .card-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
  .card-meta { font-size: 0.82rem; color: #888; line-height: 1.8; }
  .card-meta span { display: block; }
  .verified-badge {
    display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 8px;
    background: rgba(34,197,94,0.15); color: #22c55e; font-size: 0.75rem; font-weight: 600;
    border: 1px solid rgba(34,197,94,0.25); margin-bottom: 8px; margin-left: 8px;
  }
  .card-actions { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
  .btn-join {
    flex: 1; padding: 9px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #f5a623, #e91e8c);
    color: #fff; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: all 0.2s;
  }
  .btn-join:hover { opacity: 0.85; }
  .btn-book {
    padding: 9px 14px; border-radius: 10px; border: none;
    background: rgba(99,102,241,0.2); color: #818cf8;
    font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
    border: 1px solid rgba(99,102,241,0.25);
  }
  .btn-book:hover { background: rgba(99,102,241,0.35); }
  .btn-report {
    padding: 9px 12px; border-radius: 10px; border: none;
    background: transparent; color: #666; font-size: 0.85rem; cursor: pointer;
  }
  .btn-report:hover { color: #ef4444; }

  /* PRICING */
  .pricing-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap: 20px;
    max-width: 900px; margin: 0 auto;
  }
  .pricing-card {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px; padding: 28px; position: relative; transition: all 0.2s;
  }
  .pricing-card:hover { transform: translateY(-4px); box-shadow: 0 16px 50px rgba(0,0,0,0.3); }
  .pricing-card.popular {
    border-color: rgba(229,30,140,0.5);
    background: rgba(229,30,140,0.05);
  }
  .popular-badge {
    position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
    background: linear-gradient(135deg, #f5a623, #e91e8c);
    color: #fff; padding: 4px 16px; border-radius: 12px;
    font-size: 0.75rem; font-weight: 700;
  }
  .plan-name { font-size: 1.2rem; font-weight: 800; margin-bottom: 8px; }
  .plan-price { font-size: 2.5rem; font-weight: 900; margin-bottom: 4px; }
  .plan-period { font-size: 0.85rem; color: #888; margin-bottom: 20px; }
  .plan-features { list-style: none; margin-bottom: 24px; }
  .plan-features li { padding: 6px 0; font-size: 0.88rem; color: #ccc; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .plan-features li:last-child { border-bottom: none; }
  .btn-plan {
    width: 100%; padding: 12px; border-radius: 12px; border: none;
    font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
  }
  .btn-plan-primary { background: linear-gradient(135deg, #f5a623, #e91e8c); color: #fff; }
  .btn-plan-primary:hover { opacity: 0.88; transform: scale(1.02); }
  .btn-plan-secondary { background: rgba(255,255,255,0.07); color: #aaa; }
  .btn-plan-secondary:hover { background: rgba(255,255,255,0.12); }

  /* PAGE CARD */
  .page-card {
    max-width: 560px; margin: 40px auto;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px; padding: 36px;
  }
  .page-card h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 8px; }
  .page-card p { color: #888; font-size: 0.9rem; margin-bottom: 24px; }

  /* FORM */
  .form-group { margin-bottom: 18px; }
  .form-label { display: block; font-size: 0.85rem; font-weight: 600; color: #bbb; margin-bottom: 6px; }
  .form-input, .form-select, .form-textarea {
    width: 100%; padding: 11px 14px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05); color: #e8e8f0; font-size: 0.92rem;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus {
    outline: none; border-color: #e91e8c; box-shadow: 0 0 0 3px rgba(229,30,140,0.1);
  }
  .form-textarea { min-height: 100px; resize: vertical; }
  .form-select option { background: #1a1a2e; }
  .btn-submit {
    width: 100%; padding: 13px; border-radius: 12px; border: none;
    background: linear-gradient(135deg, #f5a623, #e91e8c);
    color: #fff; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; margin-top: 8px;
  }
  .btn-submit:hover { opacity: 0.88; }
  .form-switch { text-align: center; margin-top: 20px; font-size: 0.9rem; color: #888; }
  .form-switch button { background: none; border: none; color: #e91e8c; font-weight: 600; cursor: pointer; font-size: 0.9rem; }

  /* DASHBOARD */
  .dashboard { padding: 40px 24px; max-width: 1100px; margin: 0 auto; }
  .dashboard-header { margin-bottom: 32px; }
  .dashboard-header h2 { font-size: 1.8rem; font-weight: 800; }
  .dashboard-header p { color: #888; margin-top: 6px; }
  .stats-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); gap: 16px; margin-bottom: 32px; }
  .stat-card {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
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
  .tab.active { background: linear-gradient(135deg, #f5a623, #e91e8c); color: #fff; }
  .tab.inactive { background: rgba(255,255,255,0.05); color: #aaa; border: 1px solid rgba(255,255,255,0.08); }
  .tab.inactive:hover { background: rgba(255,255,255,0.09); color: #fff; }

  /* ADMIN */
  .admin-section {
    background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2);
    border-radius: 16px; padding: 24px; margin-bottom: 24px;
  }
  .admin-section h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 16px; color: #a78bfa; }
  .admin-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .admin-row:last-child { border-bottom: none; }
  .btn-danger {
    padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(239,68,68,0.25);
    background: rgba(239,68,68,0.15); color: #ef4444;
    font-size: 0.82rem; font-weight: 600; cursor: pointer;
  }
  .btn-danger:hover { background: rgba(239,68,68,0.3); }
  .btn-success {
    padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(34,197,94,0.25);
    background: rgba(34,197,94,0.15); color: #22c55e;
    font-size: 0.82rem; font-weight: 600; cursor: pointer;
  }
  .btn-success:hover { background: rgba(34,197,94,0.3); }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.75); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .modal {
    background: #13131f; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px; padding: 32px; max-width: 480px; width: 100%; max-height: 90vh; overflow-y: auto;
  }
  .modal h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; }
  .modal p { color: #888; font-size: 0.9rem; margin-bottom: 20px; }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
  .btn-cancel {
    padding: 9px 20px; border-radius: 10px; border: none;
    background: rgba(255,255,255,0.06); color: #aaa; font-weight: 600; cursor: pointer;
  }

  /* SAFETY BANNER */
  .safety-banner {
    background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2);
    border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;
    display: flex; gap: 12px; align-items: flex-start; font-size: 0.88rem; color: #86efac;
  }

  /* LIVE INDICATOR */
  .live-dot {
    display: inline-block; width: 8px; height: 8px; border-radius: 50%;
    background: #22c55e; margin-right: 6px;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.3); }
  }

  /* TOAST */
  .toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 300;
    background: #1e1e30; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; padding: 14px 20px; font-size: 0.9rem; font-weight: 500;
    box-shadow: 0 8px 30px rgba(0,0,0,0.4); animation: slideIn 0.3s ease;
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
    padding: 40px 24px; text-align: center; color: #555; font-size: 0.85rem;
  }
  .footer-links { display: flex; gap: 20px; justify-content: center; margin-top: 12px; flex-wrap: wrap; }
  .footer-links button { background: none; border: none; color: #666; font-size: 0.85rem; cursor: pointer; }
  .footer-links button:hover { color: #e91e8c; }

  /* SUBSCRIPTION BADGE */
  .sub-badge {
    display: inline-block; padding: 2px 10px; border-radius: 10px;
    font-size: 0.72rem; font-weight: 700;
  }
  .sub-free { background: rgba(102,102,102,0.2); color: #999; }
  .sub-pro { background: rgba(229,30,140,0.2); color: #e91e8c; }
  .sub-premium { background: rgba(245,166,35,0.2); color: #f5a623; }

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
  { q: "Is CineConnect free to use?", a: "Browsing and joining outings is always free. Posting requires a Pro membership ($4.99/month)." },
  { q: "How are hosts verified?", a: "Hosts submit ID verification. Verified hosts show a green ✓ badge. Always meet in the public cinema lobby." },
  { q: "What if I feel unsafe?", a: "Use the 🚩 Report button on any post. Admin reviews all reports within 24 hours." },
  { q: "How do booking links work?", a: "Clicking Book Tickets takes you directly to the cinema's website to purchase your ticket." },
  { q: "Can I cancel my subscription?", a: "Yes — cancel anytime from Dashboard → Subscription. Your access continues until the billing period ends." },
  { q: "How do I get a refund?", a: "Contact support within 7 days of charge for a full refund. Email support@cineconnect.ca" },
];

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
  const [filterChain, setFilterChain] = useState('All');
  const [dashTab, setDashTab] = useState('browse');
  const [openFaq, setOpenFaq] = useState(null);
  const [supportForm, setSupportForm] = useState({ subject: '', message: '' });
  const [reportPost, setReportPost] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [bookPost, setBookPost] = useState(null);
  const [showPricing, setShowPricing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [theaterFilter, setTheaterFilter] = useState('All');
  const [movieTab, setMovieTab] = useState('now');

  // Simulate live updates every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const isAdmin = user?.isAdmin === true;
  const userPlan = user?.plan || 'free';

  // ─── AUTH ────────────────────────────────────────────────────
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
      const name = authForm.email.split('@')[0];
      setUser({ name, email: authForm.email, isAdmin: adminFlag, plan: adminFlag ? 'premium' : 'free' });
      setPage('home');
      showToast('Welcome back! 🎬');
    }
    setAuthForm({ name: '', email: '', password: '' });
  };

  const handleLogout = () => {
    setUser(null);
    setPage('home');
    showToast('Logged out successfully.');
  };

  // ─── POSTS ───────────────────────────────────────────────────
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
    const newPost = { ...postForm, id: Date.now(), host: user.name, verified: isAdmin, reports: 0, spots: Number(postForm.spots) };
    setPosts(prev => [newPost, ...prev]);
    setPostForm({ title: '', cinema: '', city: '', date: '', time: '', genre: '', spots: 2, description: '', booking_url: '' });
    showToast('Outing posted! 🎉');
    setPage('dashboard');
  };

  const handleReport = () => {
    if (!reportReason) { showToast('Please select a reason.', 'error'); return; }
    setPosts(prev => prev.map(p => p.id === reportPost.id ? { ...p, reports: (p.reports || 0) + 1 } : p));
    showToast('Report submitted. We\'ll review within 24 hours.');
    setReportPost(null); setReportReason('');
  };

  const handleDeletePost = (id) => { setPosts(prev => prev.filter(p => p.id !== id)); showToast('Post deleted.'); };
  const handleVerifyHost = (id) => { setPosts(prev => prev.map(p => p.id === id ? { ...p, verified: true } : p)); showToast('Host verified ✓'); };

  // ─── COMPONENTS ──────────────────────────────────────────────
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
        <button className="btn-join" onClick={() => {
          if (!user) { setPage('auth'); return; }
          showToast(`You joined ${post.host}'s outing! Meet in the lobby. 🎬`);
        }}>🎬 Join Outing</button>
        <button className="btn-book" onClick={() => setBookPost(post)}>🎟️ Book</button>
        <button className="btn-report" onClick={() => { setReportPost(post); setReportReason(''); }}>🚩</button>
      </div>
    </div>
  );

  // ─── PAGES ───────────────────────────────────────────────────

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

      {/* Now Playing Preview */}
      <div className="section">
        <div className="section-title">
          🎬 Now Playing in GTA
          <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 400, marginLeft: 'auto' }}>
            <span className="live-dot"></span>
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
        <div className="movies-scroll">
          {NOW_PLAYING.slice(0,6).map(m => (
            <div className="movie-card" key={m.id} onClick={() => { setPostForm(p => ({ ...p, title: m.title, genre: m.genre })); setPage('post'); }}>
              <div className="movie-poster">{m.poster}</div>
              <div className="movie-title">{m.title}</div>
              <div className="movie-meta">
                <span>{m.genre} · {m.rating}</span>
                <span>{m.duration}</span>
              </div>
              <span className={`movie-score ${m.score >= 80 ? 'score-high' : m.score >= 65 ? 'score-mid' : 'score-low'}`}>
                {m.score}%
              </span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button className="btn-hero-secondary" onClick={() => setPage('movies')}>View All Movies →</button>
        </div>
      </div>

      {/* Latest Outings */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="safety-banner">
          🛡️ <span><strong>Safety First:</strong> Always meet in the public cinema lobby. Never share personal details before meeting. Look for the green ✓ verified badge.</span>
        </div>
        <div className="section-title">🔥 Latest Outings</div>
        <div className="cards-grid">
          {posts.slice(0,3).map(post => <PostCard key={post.id} post={post} />)}
        </div>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button className="btn-hero-primary" onClick={() => setPage('find')}>View All Outings →</button>
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '60px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="section-title" style={{ justifyContent: 'center', marginBottom: 40 }}>How CineConnect Works</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 24 }}>
            {[['🔍','Find an Outing','Browse by genre, city, or verified hosts near you.'],
              ['🤝','Join & Connect','Request to join — meet the group in the cinema lobby.'],
              ['🎟️','Book Your Seat','Use our direct booking links to grab your ticket.'],
              ['🎬','Enjoy Together','Watch the movie and make new friends!']].map(([icon,title,desc]) => (
              <div key={title} style={{ textAlign: 'center', padding: '28px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16 }}>
                <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>{icon}</div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: '0.85rem', color: '#888', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="section">
        <div className="section-title" style={{ justifyContent: 'center' }}>💳 Simple Pricing</div>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: 40 }}>Start free, upgrade when you're ready to post outings</p>
        <PricingCards />
      </div>
    </div>
  );

  // MOVIES PAGE
  const MoviesPage = () => (
    <div className="section">
      <div className="section-title">
        🎬 GTA Movie Listings
        <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 400, marginLeft: 'auto' }}>
          <span className="live-dot"></span> Live · {lastUpdated.toLocaleTimeString()}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {['now','soon'].map(t => (
          <button key={t} className={`tab ${movieTab === t ? 'active' : 'inactive'}`} onClick={() => setMovieTab(t)}>
            {t === 'now' ? '🎬 Now Playing' : '📅 Coming Soon'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 20 }}>
        {(movieTab === 'now' ? NOW_PLAYING : COMING_SOON).map(m => (
          <div key={m.id} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: 20, transition: 'all 0.2s',
          }}>
            <div style={{ fontSize: '3.5rem', textAlign: 'center', marginBottom: 12 }}>{m.poster}</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>{m.title}</div>
            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: 8 }}>
              {m.genre} · {m.rating}
              {m.duration && <span> · {m.duration}</span>}
              {m.releaseDate && <span style={{ color: '#f5a623' }}> · {m.releaseDate}</span>}
            </div>
            {m.score && (
              <span className={`movie-score ${m.score >= 80 ? 'score-high' : m.score >= 65 ? 'score-mid' : 'score-low'}`}>
                {m.score}% Score
              </span>
            )}
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button className="btn-join" style={{ fontSize: '0.8rem', padding: '8px' }}
                onClick={() => { setPostForm(p => ({ ...p, title: m.title, genre: m.genre })); setPage('post'); }}>
                + Post Outing
              </button>
              <button className="btn-book" style={{ fontSize: '0.8rem', padding: '8px' }}
                onClick={() => setBookPost({ title: m.title, cinema: '', booking_url: 'https://www.cineplex.com' })}>
                🎟️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // THEATERS PAGE
  const TheatersPage = () => {
    const chains = ['All', ...new Set(GTA_THEATERS.map(t => t.chain))];
    const filtered = theaterFilter === 'All' ? GTA_THEATERS : GTA_THEATERS.filter(t => t.chain === theaterFilter);

    return (
      <div className="section">
        <div className="section-title">
          🏟️ GTA Theater Directory
          <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 400, marginLeft: 'auto' }}>
            {GTA_THEATERS.length} theaters · {[...new Set(GTA_THEATERS.map(t => t.city))].length} cities
          </span>
        </div>

        <div className="filters" style={{ marginBottom: 28 }}>
          {chains.map(c => (
            <button key={c}
              className={`filter-toggle ${theaterFilter === c ? 'active' : 'inactive'}`}
              onClick={() => setTheaterFilter(c)}>
              {c}
            </button>
          ))}
        </div>

        <div className="theater-grid">
          {filtered.map((t, i) => (
            <div className="theater-card" key={i}>
              <div>
                <span className="theater-chain-badge" style={{ background: CHAIN_COLORS[t.chain] || '#666' }}>
                  {t.chain}
                </span>
              </div>
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
        <button className={`filter-toggle ${filterVerified ? 'active' : 'inactive'}`} onClick={() => setFilterVerified(v => !v)}>
          ✓ Verified Only
        </button>
        <span style={{ fontSize: '0.85rem', color: '#666', alignSelf: 'center', marginLeft: 'auto' }}>
          {filteredPosts.length} outing{filteredPosts.length !== 1 ? 's' : ''} found
        </span>
      </div>
      {filteredPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎭</div>
          <p>No outings match your filters.</p>
          <button className="btn-hero-primary" style={{ marginTop: 20 }} onClick={() => user ? setPage('post') : setPage('auth')}>Post an Outing</button>
        </div>
      ) : (
        <div className="cards-grid">{filteredPosts.map(post => <PostCard key={post.id} post={post} />)}</div>
      )}
    </div>
  );

  // POST PAGE
  const PostPage = () => {
    if (!user) return (
      <div className="page-card">
        <h2>✏️ Post an Outing</h2>
        <p>You need to be logged in to post an outing.</p>
        <button className="btn-submit" onClick={() => setPage('auth')}>Log In / Sign Up</button>
      </div>
    );

    if (userPlan === 'free') return (
      <div className="page-card">
        <h2>⭐ Pro Feature</h2>
        <p>Posting outings requires a Pro or Premium subscription.</p>
        <div style={{ background: 'rgba(229,30,140,0.08)', border: '1px solid rgba(229,30,140,0.2)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>🚀 Upgrade to Pro — $4.99/month</div>
          <div style={{ fontSize: '0.85rem', color: '#888' }}>Post unlimited outings, get verified badge, priority matching</div>
        </div>
        <button className="btn-submit" onClick={() => setShowPricing(true)}>View Plans & Upgrade</button>
        <button className="btn-cancel" style={{ width: '100%', marginTop: 10 }} onClick={() => setPage('find')}>Browse Outings Instead</button>
      </div>
    );

    return (
      <div className="page-card">
        <h2>✏️ Post an Outing</h2>
        <p>Share your movie plans and find companions to join you.</p>
        <div className="safety-banner" style={{ marginBottom: 20 }}>
          🛡️ By posting, you agree to meet companions in the public cinema lobby only.
        </div>
        <form onSubmit={handlePostSubmit}>
          <div className="form-group">
            <label className="form-label">Movie Title *</label>
            <input className="form-input" placeholder="e.g. Inside Out 2" value={postForm.title}
              onChange={e => setPostForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Cinema *</label>
            <select className="form-select" value={postForm.cinema}
              onChange={e => {
                const t = GTA_THEATERS.find(t => t.name === e.target.value);
                setPostForm(p => ({ ...p, cinema: e.target.value, city: t?.city || p.city, booking_url: t?.url || p.booking_url }));
              }}>
              <option value="">Select a theater</option>
              {Object.keys(CHAIN_COLORS).map(chain => (
                <optgroup key={chain} label={`── ${chain} ──`}>
                  {GTA_THEATERS.filter(t => t.chain === chain).map(t => (
                    <option key={t.name} value={t.name}>{t.name} ({t.city})</option>
                  ))}
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
            <input type="number" min={1} max={10} className="form-input" value={postForm.spots}
              onChange={e => setPostForm(p => ({ ...p, spots: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Tell people about yourself and what you're looking for..."
              value={postForm.description} onChange={e => setPostForm(p => ({ ...p, description: e.target.value }))} />
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
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: '0.88rem', color: '#fca5a5' }}>
          ⚠️ {authError}
        </div>
      )}
      <form onSubmit={handleAuth}>
        {authMode === 'signup' && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Your name" value={authForm.name} onChange={e => setAuthForm(p => ({ ...p, name: e.target.value }))} />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input type="email" className="form-input" placeholder="you@email.com" value={authForm.email} onChange={e => setAuthForm(p => ({ ...p, email: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
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

  // PRICING CARDS COMPONENT
  const PricingCards = () => (
    <div className="pricing-grid">
      {PLANS.map(plan => (
        <div key={plan.id} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
          {plan.popular && <div className="popular-badge">⭐ Most Popular</div>}
          <div className="plan-name" style={{ color: plan.color }}>{plan.name}</div>
          <div className="plan-price" style={{ color: plan.color }}>
            {plan.price === 0 ? 'Free' : `$${plan.price}`}
          </div>
          <div className="plan-period">
            {plan.price === 0 ? 'forever' : `per ${plan.period}`}
          </div>
          <ul className="plan-features">
            {plan.features.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
          {plan.price === 0 ? (
            <button className="btn-plan btn-plan-secondary"
              onClick={() => { setPage('auth'); setShowPricing(false); }}>
              Get Started Free
            </button>
          ) : (
            <a href={plan.stripeLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button className="btn-plan btn-plan-primary">
                💳 Subscribe — ${plan.price}/mo
              </button>
            </a>
          )}
        </div>
      ))}
    </div>
  );

  // PRICING PAGE
  const PricingPage = () => (
    <div className="section">
      <div className="section-title" style={{ justifyContent: 'center' }}>💳 Choose Your Plan</div>
      <p style={{ textAlign: 'center', color: '#888', marginBottom: 40 }}>
        Start free. Upgrade anytime. Cancel anytime.
      </p>
      <PricingCards />
      <div style={{ maxWidth: 600, margin: '48px auto 0', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 16, fontSize: '1.1rem' }}>🔒 Payment Security</div>
        <div style={{ display: 'grid', gap: 10, fontSize: '0.88rem', color: '#888' }}>
          <div>✅ Payments processed securely by <strong style={{ color: '#ccc' }}>Stripe</strong></div>
          <div>✅ We never store your card details</div>
          <div>✅ Cancel anytime — no hidden fees</div>
          <div>✅ 7-day money-back guarantee</div>
          <div>✅ SSL encrypted transactions</div>
        </div>
      </div>
    </div>
  );

  // DASHBOARD PAGE
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
          <p>
            Welcome back, <strong>{user?.name}</strong>
            <span style={{ marginLeft: 10 }} className={`sub-badge sub-${userPlan}`}>
              {userPlan.toUpperCase()}
            </span>
            {isAdmin && <span style={{ marginLeft: 8, color: '#a78bfa', fontWeight: 700 }}>👑 Admin</span>}
          </p>
        </div>

        <div className="stats-cards">
          {[
            [posts.length, 'Total Outings'],
            [myPosts.length, 'My Posts'],
            [posts.filter(p => p.verified).length, 'Verified Hosts'],
            [GTA_THEATERS.length, 'GTA Theaters'],
          ].map(([val, label]) => (
            <div className="stat-card" key={label}>
              <div className="stat-card-num">{val}</div>
              <div className="stat-card-label">{label}</div>
            </div>
          ))}
        </div>

        <div className="tabs">
          {tabs.map(t => (
            <button key={t.id} className={`tab ${dashTab === t.id ? 'active' : 'inactive'}`} onClick={() => setDashTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {dashTab === 'browse' && (
          <div className="cards-grid">{posts.map(post => <PostCard key={post.id} post={post} />)}</div>
        )}

        {dashTab === 'myposts' && (
          myPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
              <p>You haven't posted any outings yet.</p>
              <button className="btn-hero-primary" style={{ marginTop: 16 }} onClick={() => setPage('post')}>Post Your First Outing</button>
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

        {dashTab === 'subscription' && (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>Current Plan</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <span className={`sub-badge sub-${userPlan}`} style={{ fontSize: '1rem', padding: '6px 16px' }}>
                  {userPlan.toUpperCase()}
                </span>
                <span style={{ color: '#888', fontSize: '0.9rem' }}>
                  {userPlan === 'free' ? 'Free plan — upgrade to post outings' :
                   userPlan === 'pro' ? '$4.99/month — renews automatically' :
                   '$9.99/month — renews automatically'}
                </span>
              </div>
              {userPlan === 'free' && (
                <button className="btn-submit" style={{ width: 'auto', padding: '10px 24px' }}
                  onClick={() => setShowPricing(true)}>
                  ⭐ Upgrade Now
                </button>
              )}
              {userPlan !== 'free' && (
                <div style={{ fontSize: '0.85rem', color: '#888' }}>
                  To cancel your subscription, visit your <a href="https://billing.stripe.com" target="_blank" rel="noopener noreferrer" style={{ color: '#e91e8c' }}>Stripe billing portal</a>
                </div>
              )}
            </div>
            <PricingCards />
          </div>
        )}

        {dashTab === 'admin' && isAdmin && (
          <div>
            <div className="admin-section">
              <h3>🚩 Flagged Posts ({flagged.length})</h3>
              {flagged.length === 0 ? (
                <p style={{ color: '#666', fontSize: '0.9rem' }}>No flagged posts ✅</p>
              ) : flagged.map(post => (
                <div className="admin-row" key={post.id}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{post.title}</div>
                    <div style={{ fontSize: '0.82rem', color: '#888' }}>by {post.host} · {post.reports} report{post.reports !== 1 ? 's' : ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-success" onClick={() => { setPosts(prev => prev.map(p => p.id === post.id ? { ...p, reports: 0 } : p)); showToast('Cleared ✓'); }}>Clear</button>
                    <button className="btn-danger" onClick={() => handleDeletePost(post.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="admin-section">
              <h3>✅ Verify Hosts</h3>
              {posts.filter(p => !p.verified).length === 0 ? (
                <p style={{ color: '#666', fontSize: '0.9rem' }}>All hosts verified ✅</p>
              ) : posts.filter(p => !p.verified).map(post => (
                <div className="admin-row" key={post.id}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{post.host}</div>
                    <div style={{ fontSize: '0.82rem', color: '#888' }}>{post.title}</div>
                  </div>
                  <button className="btn-success" onClick={() => handleVerifyHost(post.id)}>✓ Verify</button>
                </div>
              ))}
            </div>
            <div className="admin-section">
              <h3>💰 Revenue Overview</h3>
              <div className="admin-row"><span>Pro Subscribers</span><strong>—</strong></div>
              <div className="admin-row"><span>Premium Subscribers</span><strong>—</strong></div>
              <div className="admin-row"><span>Total Outings</span><strong>{posts.length}</strong></div>
              <div className="admin-row"><span>GTA Theaters Listed</span><strong>{GTA_THEATERS.length}</strong></div>
              <div style={{ marginTop: 16 }}>
                <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <button className="btn-success" style={{ width: '100%', padding: 12 }}>📊 Open Stripe Dashboard</button>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // SUPPORT PAGE
  const SupportPage = () => (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
      <div className="section-title">🛟 Support & Help</div>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Frequently Asked Questions</div>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px', marginBottom: 12, cursor: 'pointer' }}
            onClick={() => setOpenFaq(openFaq === i ? null : i)}>
            <div style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
              <span>{faq.q}</span><span>{openFaq === i ? '▲' : '▼'}</span>
            </div>
            {openFaq === i && <div style={{ color: '#888', fontSize: '0.88rem', marginTop: 10, lineHeight: 1.7 }}>{faq.a}</div>}
          </div>
        ))}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>📬 Contact Us</div>
        <p style={{ color: '#888', fontSize: '0.88rem', marginBottom: 20 }}>We respond within 24 hours.</p>
        <div className="form-group">
          <label className="form-label">Subject</label>
          <input className="form-input" placeholder="e.g. Subscription issue..." value={supportForm.subject}
            onChange={e => setSupportForm(p => ({ ...p, subject: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea className="form-textarea" placeholder="Describe your issue..." value={supportForm.message}
            onChange={e => setSupportForm(p => ({ ...p, message: e.target.value }))} />
        </div>
        <button className="btn-submit" onClick={() => {
          if (!supportForm.subject || !supportForm.message) { showToast('Please fill in both fields.', 'error'); return; }
          showToast('Message sent! We\'ll reply within 24 hours. ✓');
          setSupportForm({ subject: '', message: '' });
        }}>📤 Send Message</button>
      </div>
    </div>
  );

  // ─── RENDER ──────────────────────────────────────────────────
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
          <button className="nav-btn nav-btn-ghost" onClick={() => setPage('movies')}>Movies</button>
          <button className="nav-btn nav-btn-ghost" onClick={() => setPage('theaters')}>Theaters</button>
          <button className="nav-btn nav-btn-ghost" onClick={() => setPage('pricing')}>Pricing</button>
          {isAdmin && (
            <button className="nav-btn nav-btn-admin" onClick={() => { setPage('dashboard'); setDashTab('admin'); }}>
              👑 Admin
            </button>
          )}
          {user ? (
            <>
              <button className="nav-btn nav-btn-ghost" onClick={() => setPage('dashboard')}>📊 {user.name}</button>
              <button className="nav-btn nav-btn-ghost" onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <>
              <button className="nav-btn nav-btn-ghost" onClick={() => { setPage('auth'); setAuthMode('login'); }}>Log In</button>
              <button className="nav-btn nav-btn-primary" onClick={() => { setPage('auth'); setAuthMode('signup'); }}>Sign Up Free</button>
            </>
          )}
        </div>
      </nav>

      {/* MAIN */}
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

      {/* FOOTER */}
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

      {/* PRICING MODAL */}
      {showPricing && (
        <div className="modal-overlay" onClick={() => setShowPricing(false)}>
          <div className="modal" style={{ maxWidth: 900 }} onClick={e => e.stopPropagation()}>
            <h3>⭐ Upgrade Your Plan</h3>
            <p>Choose a plan to unlock posting and more features</p>
            <PricingCards />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowPricing(false)}>Maybe Later</button>
            </div>
          </div>
        </div>
      )}

      {/* BOOK MODAL */}
      {bookPost && (
        <div className="modal-overlay" onClick={() => setBookPost(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>🎟️ Book Tickets — {bookPost.title}</h3>
            <p>Choose your preferred cinema platform:</p>
            {bookPost.booking_url && (
              <a href={bookPost.booking_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 12 }}>
                <button className="btn-submit" style={{ marginTop: 0 }}>🎬 Book at {bookPost.cinema || 'Cinema'}</button>
              </a>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {GTA_THEATERS.reduce((chains, t) => {
                if (!chains.find(c => c.chain === t.chain)) chains.push(t);
                return chains;
              }, []).map(t => (
                <a key={t.chain} href={t.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <button style={{ width: '100%', padding: '10px', borderRadius: 10, border: `1px solid ${CHAIN_COLORS[t.chain]}33`, background: `${CHAIN_COLORS[t.chain]}11`, color: '#e8e8f0', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                    {t.chain} →
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

      {/* TOAST */}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
