import { useState, useEffect } from 'react';
import * as API from './lib/supabase.js';

/* ================================================================
   OWNER CONFIG — change to YOUR email before uploading
================================================================ */
const ADMIN_EMAIL    = 'owner@cineconnect.ca';
const ADMIN_PASSWORD = 'CineConnect2026!';

/* ── static data ── */
const GENRES  = ['Action','Comedy','Drama','Horror','Sci-Fi','Romance','Thriller','Animation','Documentary','Fantasy'];
const CITIES  = ['Toronto','Mississauga','Brampton','Vaughan','Markham','Oakville','Burlington','Hamilton'];
const CINEMAS = [
  {name:'Cineplex Odeon',   url:'https://www.cineplex.com',        search:'https://www.cineplex.com/Search#q=',      logo:'🎬',color:'#ff6b6b'},
  {name:'AMC Theatres',     url:'https://www.amctheatres.com',     search:'https://www.amctheatres.com/movies/',     logo:'🎥',color:'#4ecdc4'},
  {name:'Landmark Cinemas', url:'https://www.landmarkcinemas.com', search:'https://www.landmarkcinemas.com/movies/', logo:'🏛️',color:'#ffe66d'},
  {name:'Fandango',         url:'https://www.fandango.com',        search:'https://www.fandango.com/search?q=',     logo:'🎟️',color:'#ff9f43'},
  {name:'IMAX',             url:'https://www.imax.com/movies',     search:'https://www.imax.com/movies/',           logo:'📽️',color:'#a29bfe'},
];
const CM = Object.fromEntries(CINEMAS.map(c=>[c.name,c]));
const GC = {Action:'#ff6b6b',Comedy:'#ffe66d',Drama:'#a29bfe',Horror:'#fd79a8',
            'Sci-Fi':'#74b9ff',Romance:'#fd79a8',Thriller:'#6c5ce7',
            Animation:'#55efc4',Documentary:'#00cec9',Fantasy:'#fdcb6e'};
const SEED = [
  {id:1,movie:'Dune: Part Three',genre:'Sci-Fi',date:'2026-06-10',time:'7:30 PM',city:'Toronto',cinema:'Cineplex Odeon',host:'Alex M.',hi:'AM',rating:4.8,verified:true,spots:3,joined:1,bio:'Love epic sci-fi — coffee before the show?',reports:0,featured:true,hostEmail:'alex@demo.com'},
  {id:2,movie:'Inside Out 3',genre:'Animation',date:'2026-06-12',time:'2:00 PM',city:'Brampton',cinema:'Landmark Cinemas',host:'Priya S.',hi:'PS',rating:5.0,verified:true,spots:4,joined:2,bio:'Family-friendly outings! Huge animation fan.',reports:0,featured:false,hostEmail:'priya@demo.com'},
  {id:3,movie:'The Dark Hours',genre:'Horror',date:'2026-06-15',time:'9:00 PM',city:'Mississauga',cinema:'AMC Theatres',host:'Jordan K.',hi:'JK',rating:4.5,verified:true,spots:2,joined:1,bio:'Horror marathons are my thing. 18+ only.',reports:0,featured:false,hostEmail:'jordan@demo.com'},
  {id:4,movie:'Bloom',genre:'Romance',date:'2026-06-18',time:'6:30 PM',city:'Markham',cinema:'IMAX',host:'Sophie L.',hi:'SL',rating:4.9,verified:true,spots:2,joined:0,bio:'Looking for a fellow romance film enthusiast!',reports:0,featured:true,hostEmail:'sophie@demo.com'},
  {id:5,movie:'The Algorithm',genre:'Thriller',date:'2026-06-22',time:'8:15 PM',city:'Toronto',cinema:'AMC Theatres',host:'Dev P.',hi:'DP',rating:4.7,verified:true,spots:4,joined:3,bio:'Tech thriller — let\'s debate the ending!',reports:0,featured:false,hostEmail:'dev@demo.com'},
  {id:6,movie:'Starfall',genre:'Fantasy',date:'2026-06-25',time:'4:00 PM',city:'Hamilton',cinema:'IMAX',host:'Raj T.',hi:'RT',rating:4.8,verified:true,spots:6,joined:2,bio:'IMAX is the only way — book early!',reports:0,featured:false,hostEmail:'raj@demo.com'},
];

/* ── tokens ── */
const T={bg:'#0a0a12',card:'#12121e',nav:'#0d0d1a',border:'#1e1e30',
         text:'#f0eeff',dim:'#6b6b8a',gold:'#ffd93d',pink:'#ff6b9d',
         green:'#06d6a0',red:'#ff4757',blue:'#4ecdc4',purple:'#a29bfe'};
const inp={width:'100%',background:'#1a1a2e',color:T.text,border:`1px solid ${T.border}`,
           borderRadius:10,padding:'11px 14px',fontSize:14,boxSizing:'border-box',
           fontFamily:'system-ui,sans-serif',outline:'none',transition:'border-color .2s'};
const Btn=(bg,col,ex={})=>({padding:'11px 22px',background:bg,color:col,border:'none',
           borderRadius:10,cursor:'pointer',fontSize:14,fontWeight:600,
           fontFamily:'system-ui,sans-serif',transition:'all .2s',...ex});

const CSS=`
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,sans-serif;background:#0a0a12;color:#f0eeff}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes spin{to{transform:rotate(360deg)}}
.fade{animation:fadeIn .3s ease forwards}
.card-h{transition:transform .2s,box-shadow .2s}
.card-h:hover{transform:translateY(-3px);box-shadow:0 10px 32px rgba(0,0,0,.4)}
.btn-h{transition:all .18s}
.btn-h:hover{opacity:.88;transform:translateY(-1px)}
.btn-h:active{transform:scale(.97)}
input:focus,select:focus,textarea:focus{border-color:#ffd93d!important;box-shadow:0 0 0 3px rgba(255,217,61,.12)}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:#0a0a12}
::-webkit-scrollbar-thumb{background:#1e1e30;border-radius:3px}
.accordion-body{overflow:hidden;transition:max-height .3s ease,opacity .3s ease}
@media(max-width:640px){.hide-m{display:none!important}.show-m{display:flex!important}}
@media(min-width:641px){.show-m{display:none!important}}
`;

/* ================================================================
   APP
================================================================ */
export default function App() {
  const [page,     setPage]    = useState('home');
  const [posts,    setPosts]   = useState(SEED);
  const [user,     setUser]    = useState(null);
  const [loading,  setLoading] = useState(true);
  const [joinedIds,setJoinedIds]= useState([]);
  const [reported, setReported]= useState([]);
  const [menuOpen, setMenuOpen]= useState(false);
  const [toast,    setToast]   = useState(null);
  const [joinModal,setJoinModal]= useState(null);
  const [bookModal,setBookModal]= useState(null);
  const [repModal, setRepModal] = useState(null);
  const [proModal, setProModal] = useState(false);
  const [doneModal,setDoneModal]= useState(null);
  const [fG,setFG]=useState('All');
  const [fC,setFC]=useState('All');
  const [fV,setFV]=useState(false);
  const [adminTab,setAdminTab]=useState('posts');
  const [tickets,  setTickets] = useState([]);
  const [pF,setPF]=useState({movie:'',genre:'Action',date:'',time:'',city:'Toronto',cinema:'Cineplex Odeon',spots:3,bio:'',ok:false});
  const [pErr,setPErr]=useState('');

  const isAdmin = user?.email===ADMIN_EMAIL || user?.email===user?.adminEmail;
  const isPro   = user?.is_pro || isAdmin;
  const myPosts  = posts.filter(p=>p.hostEmail===user?.email||p.user_id===user?.id);
  const myJoined = posts.filter(p=>joinedIds.includes(p.id));
  const flagged  = posts.filter(p=>p.reports>=1);
  const filtered = posts
    .filter(p=>(fG==='All'||p.genre===fG)&&(fC==='All'||p.city===fC)&&(!fV||p.verified))
    .sort((a,b)=>(b.featured?1:0)-(a.featured?1:0));

  const notify=(msg,t='ok')=>{setToast({msg,t});setTimeout(()=>setToast(null),3200);};
  const nav=(p)=>{setPage(p);setMenuOpen(false);window.scrollTo({top:0,behavior:'smooth'});};

  /* ── init: check existing session ── */
  useEffect(()=>{
    API.getSession().then(async session=>{
      if(session?.user){
        const profile=await API.getProfile(session.user.id);
        setUser({...session.user,...profile,email:session.user.email});
        const joins=await API.getUserJoins(session.user.id);
        if(joins.length) setJoinedIds(joins);
      }
      setLoading(false);
    });
    const unsub=API.onAuthChange(async u=>{
      setUser(u);
      if(u){const joins=await API.getUserJoins(u.id);if(joins.length)setJoinedIds(joins);}
    });
    return()=>unsub&&unsub();
  },[]);

  /* ── load posts from Supabase if connected ── */
  useEffect(()=>{
    API.getPosts().then(data=>{if(data&&data.length)setPosts(data);});
  },[]);

  /* ── load support tickets for admin ── */
  useEffect(()=>{
    if(isAdmin){API.getTickets().then(data=>{if(data)setTickets(data);});}
  },[isAdmin]);

  /* ── join ── */
  const confirmJoin=async()=>{
    const p=joinModal;
    setJoinedIds(j=>[...j,p.id]);
    setPosts(ps=>ps.map(x=>x.id===p.id?{...x,joined:x.joined+1}:x));
    if(user?.id) await API.joinPost(p.id,user.id);
    setJoinModal(null);setBookModal(p);
  };

  /* ── report ── */
  const confirmReport=async(reason)=>{
    setReported(r=>[...r,repModal]);
    setPosts(ps=>ps.map(p=>p.id===repModal?{...p,reports:p.reports+1}:p));
    if(user?.id) await API.reportPost(repModal,reason,user.id);
    setRepModal(null);
    notify('Post flagged for review — our safety team will respond within 24h 🛡️','warn');
  };

  /* ── post ── */
  const submitPost=async()=>{
    if(!user){nav('login');return;}
    if(!isPro){setProModal(true);return;}
    if(!pF.movie.trim()){setPErr('Enter a movie title.');return;}
    if(!pF.date){setPErr('Pick a date.');return;}
    if(!pF.time){setPErr('Enter a time.');return;}
    if(!pF.ok){setPErr('Accept the community guidelines first.');return;}
    const np={
      id:Date.now(),movie:pF.movie,genre:pF.genre,date:pF.date,time:pF.time,
      city:pF.city,cinema:pF.cinema,host:user.full_name||user.name||user.email.split('@')[0],
      hi:user.initials||user.email.slice(0,2).toUpperCase(),
      rating:5.0,verified:false,spots:pF.spots,joined:0,
      bio:pF.bio||'Looking forward to it!',reports:0,featured:false,
      hostEmail:user.email,user_id:user.id
    };
    if(API.db){
      const saved=await API.createPost({...np,id:undefined});
      if(saved) np.id=saved.id;
    }
    setPosts(ps=>[np,...ps]);
    setPF({movie:'',genre:'Action',date:'',time:'',city:'Toronto',cinema:'Cineplex Odeon',spots:3,bio:'',ok:false});
    setPErr('');setDoneModal(np);
  };

  /* ── admin actions ── */
  const adminDelete=async id=>{await API.deletePost(id);setPosts(ps=>ps.filter(p=>p.id!==id));notify('Post deleted.','warn');};
  const adminVerify=async id=>{await API.updatePost(id,{verified:true});setPosts(ps=>ps.map(p=>p.id===id?{...p,verified:true}:p));notify('Host verified ✅');};
  const adminFeature=async id=>{const p=posts.find(x=>x.id===id);const f=!p?.featured;await API.updatePost(id,{featured:f});setPosts(ps=>ps.map(x=>x.id===id?{...x,featured:f}:x));notify(f?'Post featured ⭐':'Post unfeatured');};
  const adminResolve=async id=>{await API.resolveTicket(id);setTickets(ts=>ts.map(t=>t.id===id?{...t,status:'resolved'}:t));notify('Ticket resolved ✅');};

  const revenue={clicks:247,subs:12,featured:5,est:(247*0.75+12*4.99+5*2.99).toFixed(0)};

  if(loading) return(
    <div style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}>
      <div style={{width:40,height:40,border:`3px solid ${T.border}`,borderTopColor:T.gold,borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <div style={{fontSize:14,color:T.dim}}>Loading CineConnect...</div>
      <style>{CSS}</style>
    </div>
  );

  return(
    <div style={{minHeight:'100vh',background:T.bg,color:T.text}}>
      <style>{CSS}</style>

      {/* TOAST */}
      {toast&&<div className='fade' style={{position:'fixed',top:14,right:14,zIndex:9999,padding:'12px 18px',borderRadius:10,maxWidth:320,
        background:toast.t==='warn'?'#2d1a00':toast.t==='err'?'#1f0000':'#001a0f',
        borderLeft:`3px solid ${toast.t==='warn'?T.gold:toast.t==='err'?T.red:T.green}`,
        color:T.text,fontSize:13,boxShadow:'0 8px 32px rgba(0,0,0,.6)'}}>
        {toast.msg}
      </div>}

      {/* NAV */}
      {page!=='login'&&page!=='signup'&&(
        <nav style={{background:'rgba(13,13,26,.96)',borderBottom:`1px solid ${T.border}`,padding:'0 20px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:200,backdropFilter:'blur(12px)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={()=>nav('home')}>
            <div style={{width:34,height:34,borderRadius:10,background:'linear-gradient(135deg,#ffd93d,#ff6b9d)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🎬</div>
            <span style={{fontSize:18,fontWeight:800,background:'linear-gradient(135deg,#ffd93d,#ff6b9d)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>CineConnect</span>
          </div>
          <div className='hide-m' style={{display:'flex',gap:2}}>
            {[['home','Home'],['browse','Find Outings'],['support','Support'],
              ...(user?[['post','Post Outing'],['profile','My Profile']]:[] ),
              ...(isAdmin?[['admin','👑 Admin']]:[] )
            ].map(([p,l])=>(
              <button key={p} onClick={()=>nav(p)} className='btn-h' style={{padding:'6px 13px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontFamily:'system-ui,sans-serif',fontWeight:600,
                background:page===p?'rgba(255,217,61,.12)':'transparent',
                color:page===p?T.gold:T.dim,
                borderBottom:page===p?`2px solid ${T.gold}`:'2px solid transparent'}}>{l}</button>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            {!user?(
              <div className='hide-m' style={{display:'flex',gap:8}}>
                <button onClick={()=>nav('login')} className='btn-h' style={{...Btn('transparent',T.dim),border:`1px solid ${T.border}`,padding:'7px 14px',fontSize:13}}>Log In</button>
                <button onClick={()=>nav('signup')} className='btn-h' style={{...Btn('linear-gradient(135deg,#ffd93d,#ff9f43)',T.bg),padding:'7px 14px',fontSize:13,boxShadow:'0 4px 12px rgba(255,217,61,.25)'}}>Sign Up Free</button>
              </div>
            ):(
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                {isPro&&!isAdmin&&<span style={{fontSize:11,background:'rgba(255,217,61,.12)',color:T.gold,padding:'2px 8px',borderRadius:20,fontWeight:600}}>⭐ PRO</span>}
                <div onClick={()=>nav('profile')} style={{width:32,height:32,borderRadius:'50%',background:isAdmin?'linear-gradient(135deg,#a29bfe,#6c5ce7)':'linear-gradient(135deg,#ffd93d,#ff9f43)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:T.bg,cursor:'pointer'}}>
                  {user.initials||user.email?.slice(0,2).toUpperCase()||'ME'}
                </div>
                <button onClick={async()=>{await API.signOut();setUser(null);setJoinedIds([]);nav('home');notify('Signed out.');}} style={{fontSize:12,color:T.dim,background:'none',border:'none',cursor:'pointer',fontFamily:'system-ui,sans-serif'}}>Sign out</button>
              </div>
            )}
            <button onClick={()=>setMenuOpen(!menuOpen)} className='show-m' style={{background:'none',border:'none',color:T.dim,cursor:'pointer',fontSize:22,padding:'4px'}}>☰</button>
          </div>
        </nav>
      )}

      {/* MOBILE MENU */}
      {menuOpen&&(
        <div className='fade' style={{background:'rgba(13,13,26,.98)',borderBottom:`1px solid ${T.border}`,padding:'10px 14px',display:'flex',flexDirection:'column',gap:6,backdropFilter:'blur(12px)'}}>
          {[['home','🏠 Home'],['browse','🔍 Find Outings'],['support','💬 Support'],
            ...(user?[['post','✏️ Post Outing'],['profile','👤 My Profile']]:[] ),
            ...(isAdmin?[['admin','👑 Admin Panel']]:[] )
          ].map(([p,l])=>(
            <button key={p} onClick={()=>nav(p)} style={{padding:'11px 14px',borderRadius:9,border:'none',cursor:'pointer',fontSize:14,fontFamily:'system-ui,sans-serif',fontWeight:600,
              background:page===p?'rgba(255,217,61,.12)':T.card,color:page===p?T.gold:T.text,textAlign:'left'}}>{l}</button>
          ))}
          {!user&&<button onClick={()=>nav('signup')} style={{...Btn('linear-gradient(135deg,#ffd93d,#ff9f43)',T.bg),marginTop:6,borderRadius:9}}>Sign Up Free</button>}
        </div>
      )}

      {/* ══════ LOGIN PAGE ══════ */}
      {page==='login'&&<LoginPage nav={nav} setUser={setUser} notify={notify} isAdmin={isAdmin}/>}

      {/* ══════ SIGNUP PAGE ══════ */}
      {page==='signup'&&<SignupPage nav={nav} setUser={setUser} notify={notify}/>}

      {/* ══════ HOME ══════ */}
      {page==='home'&&(
        <div className='fade'>
          <div style={{background:'linear-gradient(160deg,#0d0d1a,#12091f)',padding:'60px 20px 48px',textAlign:'center',borderBottom:`1px solid ${T.border}`,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 20% 50%,rgba(162,155,254,.1) 0%,transparent 50%),radial-gradient(circle at 80% 30%,rgba(255,107,157,.08) 0%,transparent 50%)',pointerEvents:'none'}}/>
            <div style={{position:'relative',maxWidth:620,margin:'0 auto'}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(255,217,61,.1)',border:'1px solid rgba(255,217,61,.25)',borderRadius:30,padding:'6px 16px',marginBottom:20,fontSize:13,color:T.gold,fontWeight:600}}>
                🎬 Now live across the GTA · 2,400+ members
              </div>
              <h1 style={{fontSize:'clamp(28px,6vw,50px)',fontWeight:800,margin:'0 0 16px',lineHeight:1.1,letterSpacing:'-1.5px'}}>
                <span style={{color:T.text}}>Never Watch a Movie </span>
                <span style={{background:'linear-gradient(135deg,#ffd93d,#ff6b9d)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Alone Again</span>
              </h1>
              <p style={{fontSize:'clamp(14px,2.5vw,17px)',color:'#8b8baa',margin:'0 auto 30px',lineHeight:1.7,maxWidth:460}}>Connect with verified cinema companions in Toronto, Brampton, Mississauga and beyond. Browse outings, join a group, book seats side-by-side.</p>
              <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
                <button onClick={()=>nav('browse')} className='btn-h' style={{...Btn('linear-gradient(135deg,#ffd93d,#ff9f43)',T.bg),padding:'13px 28px',fontSize:15,boxShadow:'0 8px 24px rgba(255,217,61,.3)',borderRadius:12}}>🔍 Find an Outing</button>
                <button onClick={()=>user?nav('post'):nav('signup')} className='btn-h' style={{...Btn('rgba(162,155,254,.12)',T.purple),border:`1px solid ${T.purple}44`,padding:'13px 28px',fontSize:15,borderRadius:12}}>🎭 Host Your Own</button>
              </div>
              {!user&&<p style={{fontSize:12,color:T.dim,marginTop:14}}>Free to browse · <span style={{color:T.gold,cursor:'pointer'}} onClick={()=>nav('signup')}>Sign up</span> to join or post</p>}
            </div>
          </div>

          <div style={{background:T.nav,borderBottom:`1px solid ${T.border}`,display:'flex',overflowX:'auto',justifyContent:'center'}}>
            {[['🎬',posts.length,'Live Outings'],['✅',posts.filter(p=>p.verified).length,'Verified Hosts'],['🏙️',CITIES.length,'GTA Cities'],['⭐','4.8','Avg Rating'],['👥','2,400+','Members']].map(([i,v,l])=>(
              <div key={l} style={{padding:'14px 24px',textAlign:'center',borderRight:`1px solid ${T.border}`,flexShrink:0}}>
                <div style={{fontSize:18}}>{i}</div>
                <div style={{fontSize:19,fontWeight:800,color:T.gold}}>{v}</div>
                <div style={{fontSize:11,color:T.dim,whiteSpace:'nowrap'}}>{l}</div>
              </div>
            ))}
          </div>

          {/* Genre pills */}
          <div style={{maxWidth:1100,margin:'24px auto 0',padding:'0 16px'}}>
            <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4}}>
              {['All',...GENRES].map(g=>(
                <button key={g} onClick={()=>{setFG(g);nav('browse');}} className='btn-h' style={{padding:'6px 15px',borderRadius:30,border:`1px solid ${fG===g?(GC[g]||T.gold)+'88':T.border}`,background:fG===g?(GC[g]||T.gold)+'18':'transparent',color:fG===g?(GC[g]||T.gold):T.dim,fontSize:12,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>{g}</button>
              ))}
            </div>
          </div>

          <section style={{maxWidth:1100,margin:'24px auto',padding:'0 16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h2 style={{fontSize:19,fontWeight:800,margin:0}}>⭐ Featured Outings</h2>
              <button onClick={()=>nav('browse')} className='btn-h' style={{background:'none',border:`1px solid ${T.border}`,color:T.gold,cursor:'pointer',fontSize:13,fontWeight:600,padding:'6px 14px',borderRadius:8}}>View all →</button>
            </div>
            <Grid>{posts.filter(p=>p.featured).map(p=>(
              <Card key={p.id} p={p} joined={joinedIds.includes(p.id)} reported={reported.includes(p.id)} user={user}
                onJoin={()=>user?setJoinModal(p):nav('signup')} onBook={()=>setBookModal(p)} onReport={()=>setRepModal(p.id)}/>
            ))}</Grid>
          </section>

          <section style={{maxWidth:1100,margin:'0 auto 32px',padding:'0 16px'}}>
            <h2 style={{fontSize:19,fontWeight:800,margin:'0 0 16px'}}>🎬 All Upcoming Outings</h2>
            <Grid>{posts.slice(0,4).map(p=>(
              <Card key={p.id} p={p} joined={joinedIds.includes(p.id)} reported={reported.includes(p.id)} user={user}
                onJoin={()=>user?setJoinModal(p):nav('signup')} onBook={()=>setBookModal(p)} onReport={()=>setRepModal(p.id)}/>
            ))}</Grid>
          </section>

          <section style={{background:'linear-gradient(180deg,#0d0d1a,#0a0a12)',padding:'44px 16px',borderTop:`1px solid ${T.border}`}}>
            <div style={{maxWidth:860,margin:'0 auto',textAlign:'center'}}>
              <div style={{fontSize:11,color:T.gold,fontWeight:700,letterSpacing:3,marginBottom:10,textTransform:'uppercase'}}>Simple &amp; Safe</div>
              <h2 style={{fontSize:26,fontWeight:800,margin:'0 0 32px'}}>How CineConnect Works</h2>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))',gap:14}}>
                {[['1','🆔','Create Account','Sign up free. Verified members build trust in the community.',T.purple],
                  ['2','🔍','Browse Outings','Filter by genre, city, or verified-only to find your match.',T.blue],
                  ['3','🤝','Join the Group','Request a spot — meet safely at the public cinema lobby.',T.green],
                  ['4','🎟️','Book Together','Use the in-card booking link to pick adjacent seats.',T.gold]].map(([n,ico,t,d,col])=>(
                  <div key={n} className='card-h' style={{background:T.card,borderRadius:14,padding:'22px 14px',border:`1px solid ${T.border}`,textAlign:'center'}}>
                    <div style={{width:46,height:46,borderRadius:12,background:col+'22',border:`1px solid ${col}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,margin:'0 auto 12px'}}>{ico}</div>
                    <div style={{fontSize:10,color:col,fontWeight:700,letterSpacing:2.5,marginBottom:6}}>STEP {n}</div>
                    <div style={{fontSize:13,fontWeight:700,margin:'0 0 5px'}}>{t}</div>
                    <div style={{fontSize:12,color:T.dim,lineHeight:1.65}}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{background:'linear-gradient(135deg,#12091f,#0a0a12)',padding:'44px 16px',borderTop:'1px solid rgba(162,155,254,.2)',textAlign:'center'}}>
            <div style={{maxWidth:660,margin:'0 auto'}}>
              <div style={{fontSize:38,marginBottom:12,display:'inline-block',animation:'float 4s ease-in-out infinite'}}>⭐</div>
              <h3 style={{fontSize:24,fontWeight:800,margin:'0 0 10px',background:'linear-gradient(135deg,#ffd93d,#a29bfe)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>CineConnect Pro</h3>
              <p style={{fontSize:15,color:'#8b8baa',margin:'0 0 26px',lineHeight:1.7}}>Host unlimited outings, get a verified badge, and appear first in search for just $4.99/month.</p>
              <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap',marginBottom:22}}>
                {[['FREE','$0/mo',['Browse all outings','Join any outing','Book tickets'],false],
                  ['PRO ⭐','$4.99/mo',['Post unlimited outings','Verified host badge','Priority in search','Group messaging'],true]].map(([tier,price,feats,hi])=>(
                  <div key={tier} className='card-h' style={{background:hi?'linear-gradient(135deg,#1f1400,#1a0a20)':T.card,borderRadius:14,padding:'20px 24px',border:hi?`2px solid ${T.gold}55`:`1px solid ${T.border}`,minWidth:170,textAlign:'left'}}>
                    <div style={{fontSize:12,color:hi?T.gold:T.dim,fontWeight:700,marginBottom:5}}>{tier}</div>
                    <div style={{fontSize:24,fontWeight:800,color:hi?T.gold:T.text,marginBottom:10}}>{price}</div>
                    {feats.map(f=><div key={f} style={{fontSize:12,color:hi?'#c0c0e0':T.dim,padding:'3px 0',display:'flex',gap:6,alignItems:'center'}}><span style={{color:hi?T.green:T.dim}}>✓</span>{f}</div>)}
                  </div>
                ))}
              </div>
              <button onClick={()=>user?setProModal(true):nav('signup')} className='btn-h' style={{...Btn('linear-gradient(135deg,#ffd93d,#a29bfe)',T.bg),padding:'13px 30px',fontSize:15,borderRadius:12,boxShadow:'0 8px 24px rgba(255,217,61,.2)'}}>Upgrade to Pro →</button>
            </div>
          </section>

          <div style={{background:'rgba(6,214,160,.05)',padding:'18px 16px',borderTop:'1px solid rgba(6,214,160,.15)',display:'flex',alignItems:'center',justifyContent:'center',gap:12,flexWrap:'wrap'}}>
            <span style={{fontSize:22}}>🛡️</span>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:T.green}}>Safety-first platform</div>
              <div style={{fontSize:12,color:T.dim}}>Verified hosts · Public cinema meetups only · Community reporting · 18+ · Zero tolerance</div>
            </div>
          </div>
        </div>
      )}

      {/* ══════ BROWSE ══════ */}
      {page==='browse'&&(
        <Wrap>
          <PH title='🔍 Find an Outing' sub='Verified cinema companions near you. Booking links on every card.'/>
          <div style={{background:T.card,borderRadius:12,padding:'14px 16px',border:`1px solid ${T.border}`,marginBottom:20,display:'flex',gap:10,flexWrap:'wrap',alignItems:'flex-end'}}>
            <FSel label='Genre' value={fG} set={setFG} opts={['All',...GENRES]}/>
            <FSel label='City'  value={fC} set={setFC} opts={['All',...CITIES]}/>
            <label style={{display:'flex',alignItems:'center',gap:7,fontSize:13,color:'#aaa',cursor:'pointer',fontWeight:500}}>
              <input type='checkbox' checked={fV} onChange={e=>setFV(e.target.checked)} style={{accentColor:T.gold}}/>Verified only
            </label>
            <div style={{marginLeft:'auto',fontSize:13,color:T.dim,fontWeight:600}}>{filtered.length} outing{filtered.length!==1?'s':''}</div>
          </div>
          {filtered.length===0
            ?<Empty icon='🎬' label='No outings match your filters.' act='Clear filters' onAct={()=>{setFG('All');setFC('All');setFV(false);}}/>
            :<Grid>{filtered.map(p=>(
              <Card key={p.id} p={p} joined={joinedIds.includes(p.id)} reported={reported.includes(p.id)} user={user}
                onJoin={()=>user?setJoinModal(p):nav('signup')} onBook={()=>setBookModal(p)} onReport={()=>setRepModal(p.id)}/>
            ))}</Grid>}
        </Wrap>
      )}

      {/* ══════ POST ══════ */}
      {page==='post'&&(
        <Wrap narrow>
          <PH title='✏️ Post an Outing' sub='Share a film you want to see with others nearby.'/>
          {!user&&<InfoBox icon='🔐' title='Sign in to post' sub='Create a free account to get started.' col={T.purple}><button onClick={()=>nav('signup')} className='btn-h' style={{...Btn('linear-gradient(135deg,#ffd93d,#ff9f43)',T.bg),padding:'11px 26px'}}>Create Free Account</button></InfoBox>}
          {user&&!isPro&&<InfoBox icon='⭐' title='Pro membership required' sub='Upgrade for $4.99/mo to host outings and get verified.' col={T.gold}><button onClick={()=>setProModal(true)} className='btn-h' style={{...Btn('linear-gradient(135deg,#ffd93d,#a29bfe)',T.bg),padding:'11px 26px'}}>Upgrade to Pro — $4.99/mo</button></InfoBox>}
          {user&&isPro&&(
            <div style={{background:T.card,borderRadius:14,padding:'24px',border:`1px solid ${T.border}`}}>
              <SL>🎬 Movie Details</SL>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12,marginBottom:16}}>
                <div style={{gridColumn:'1/-1'}}><FL>Movie Title *</FL><input value={pF.movie} onChange={e=>setPF({...pF,movie:e.target.value})} placeholder='e.g. Dune: Part Three' style={inp}/></div>
                <div><FL>Genre</FL><select value={pF.genre} onChange={e=>setPF({...pF,genre:e.target.value})} style={inp}>{GENRES.map(g=><option key={g}>{g}</option>)}</select></div>
                <div><FL>City</FL><select value={pF.city} onChange={e=>setPF({...pF,city:e.target.value})} style={inp}>{CITIES.map(c=><option key={c}>{c}</option>)}</select></div>
                <div><FL>Date *</FL><input type='date' value={pF.date} onChange={e=>setPF({...pF,date:e.target.value})} style={inp}/></div>
                <div><FL>Time *</FL><input type='time' value={pF.time} onChange={e=>setPF({...pF,time:e.target.value})} style={inp}/></div>
                <div><FL>Cinema</FL><select value={pF.cinema} onChange={e=>setPF({...pF,cinema:e.target.value})} style={inp}>{CINEMAS.map(c=><option key={c.name}>{c.name}</option>)}</select></div>
                <div><FL>Open Spots (1–10)</FL><input type='number' min={1} max={10} value={pF.spots} onChange={e=>setPF({...pF,spots:parseInt(e.target.value)||1})} style={inp}/></div>
              </div>
              {CM[pF.cinema]&&<div style={{marginBottom:16,background:'#0d0d1a',borderRadius:9,padding:'10px 14px',border:`1px solid ${CM[pF.cinema].color}44`,display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:18}}>{CM[pF.cinema].logo}</span>
                <div style={{flex:1}}><div style={{fontSize:11,color:T.dim}}>Booking link auto-attached</div><div style={{fontSize:12,color:CM[pF.cinema].color,fontWeight:600}}>{CM[pF.cinema].url}</div></div>
                <a href={CM[pF.cinema].url} target='_blank' rel='noopener noreferrer' style={{fontSize:12,color:CM[pF.cinema].color,background:CM[pF.cinema].color+'18',padding:'4px 10px',borderRadius:20,textDecoration:'none',fontWeight:600}}>Preview →</a>
              </div>}
              <SL>👤 Your Bio</SL>
              <textarea value={pF.bio} onChange={e=>setPF({...pF,bio:e.target.value})} rows={3} placeholder='e.g. Huge sci-fi fan — coffee before the film? All welcome!' style={{...inp,resize:'vertical',marginBottom:14,lineHeight:1.6}}/>
              <div style={{background:'rgba(6,214,160,.05)',borderRadius:11,padding:'14px',border:'1px solid rgba(6,214,160,.15)',marginBottom:16}}>
                <div style={{fontSize:12,color:T.green,fontWeight:700,marginBottom:8}}>🛡️ Community Safety Agreement</div>
                <ul style={{fontSize:12,color:T.dim,lineHeight:1.9,margin:0,paddingLeft:16}}><li>Meet only in the public cinema lobby — never private locations</li><li>Never share personal contact info without mutual consent</li><li>18+ platform — false identity = permanent ban + police report</li></ul>
                <label style={{display:'flex',gap:8,alignItems:'center',marginTop:11,cursor:'pointer'}}>
                  <input type='checkbox' checked={pF.ok} onChange={e=>setPF({...pF,ok:e.target.checked})} style={{accentColor:T.gold,width:16,height:16}}/>
                  <span style={{fontSize:13,color:'#aaa',fontWeight:500}}>I agree and confirm I am 18+</span>
                </label>
              </div>
              {pErr&&<div style={{background:'rgba(255,71,87,.1)',color:T.red,padding:'10px 14px',borderRadius:9,fontSize:13,marginBottom:14,border:`1px solid ${T.red}33`}}>⚠️ {pErr}</div>}
              <button onClick={submitPost} className='btn-h' style={{...Btn('linear-gradient(135deg,#ffd93d,#ff9f43)',T.bg),width:'100%',padding:'13px',fontSize:15,borderRadius:12,boxShadow:'0 8px 24px rgba(255,217,61,.2)'}}>🎬 Publish My CineConnect Outing</button>
            </div>
          )}
        </Wrap>
      )}

      {/* ══════ PROFILE ══════ */}
      {page==='profile'&&user&&(
        <Wrap>
          <div style={{background:'linear-gradient(135deg,#12091f,#0d0d1a)',borderRadius:18,padding:'26px',border:`1px solid ${T.border}`,marginBottom:20,display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
            <div style={{width:58,height:58,borderRadius:'50%',background:isPro?'linear-gradient(135deg,#ffd93d,#ff9f43)':'linear-gradient(135deg,#2a2a42,#1a1a2e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:800,color:isPro?T.bg:'#6b6b8a',flexShrink:0}}>
              {user.initials||user.email?.slice(0,2).toUpperCase()||'ME'}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:18,fontWeight:800}}>{user.full_name||user.email?.split('@')[0]} {isPro&&<span style={{fontSize:12,background:'rgba(255,217,61,.12)',color:T.gold,padding:'2px 9px',borderRadius:20,fontWeight:600}}>PRO ⭐</span>}</div>
              <div style={{fontSize:12,color:T.dim,marginTop:3}}>{user.email} · Member since {user.since||'2026'}</div>
            </div>
            {!isPro&&<button onClick={()=>setProModal(true)} className='btn-h' style={{...Btn('linear-gradient(135deg,#ffd93d,#a29bfe)',T.bg),fontSize:13,padding:'9px 18px',borderRadius:10}}>⭐ Upgrade to Pro</button>}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:12,marginBottom:20}}>
            {[['🎬',posts.length,'Live Outings','#ff6b6b'],['🤝',joinedIds.length,'Joined',T.green],['📋',myPosts.length,'You Hosted',T.blue],['🚩',reported.length,'Reported',T.red]].map(([ico,val,lbl,col])=>(
              <div key={lbl} className='card-h' style={{background:T.card,borderRadius:12,padding:'16px',border:`1px solid ${T.border}`,textAlign:'center'}}>
                <div style={{fontSize:20}}>{ico}</div><div style={{fontSize:24,fontWeight:800,color:col,margin:'4px 0 2px'}}>{val}</div><div style={{fontSize:11,color:T.dim}}>{lbl}</div>
              </div>
            ))}
          </div>
          <div style={{background:T.card,borderRadius:12,padding:'18px',border:`1px solid ${T.border}`,marginBottom:14}}>
            <SL>🤝 Outings Joined</SL>
            {myJoined.length===0?<NoData msg="You haven't joined any outings yet." cta='Browse outings →' onCta={()=>nav('browse')}/>
              :<Grid>{myJoined.map(p=><Card key={p.id} p={p} joined={true} reported={false} user={user} onJoin={()=>{}} onBook={()=>setBookModal(p)} onReport={()=>{}}/>)}</Grid>}
          </div>
          <div style={{background:T.card,borderRadius:12,padding:'18px',border:`1px solid ${T.border}`}}>
            <SL>📋 Your Posted Outings</SL>
            {myPosts.length===0?<NoData msg={isPro?'You haven\'t posted yet.':'Upgrade to Pro to host outings.'} cta={isPro?'Post now →':'Upgrade →'} onCta={()=>isPro?nav('post'):setProModal(true)}/>
              :<Grid>{myPosts.map(p=><Card key={p.id} p={p} joined={false} reported={false} user={user} onJoin={()=>{}} onBook={()=>setBookModal(p)} onReport={()=>{}} isHost/>)}</Grid>}
          </div>
        </Wrap>
      )}

      {/* ══════ SUPPORT PAGE ══════ */}
      {page==='support'&&<SupportPage user={user} notify={notify}/>}

      {/* ══════ ADMIN ══════ */}
      {page==='admin'&&isAdmin&&(
        <Wrap>
          <div style={{background:'linear-gradient(135deg,#12091f,#0a0a12)',borderRadius:18,padding:'20px 22px',border:'1px solid rgba(162,155,254,.3)',marginBottom:20,display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,#a29bfe,#6c5ce7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>👑</div>
            <div><div style={{fontSize:19,fontWeight:800}}>Owner Control Panel</div><div style={{fontSize:12,color:T.dim}}>Full platform control · Only visible to you</div></div>
          </div>

          <div style={{background:'linear-gradient(135deg,#0a180f,#0a0d14)',borderRadius:14,padding:'18px',border:'1px solid rgba(6,214,160,.2)',marginBottom:18}}>
            <SL>💰 Revenue This Month</SL>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:12}}>
              {[['🎟️','Booking Clicks',revenue.clicks,T.blue],['⭐','Pro Subscribers',revenue.subs,T.gold],['📌','Featured Posts',revenue.featured,T.purple],['💵','Est. Revenue','$'+revenue.est,T.green]].map(([ico,lbl,val,col])=>(
                <div key={lbl} style={{background:T.card,borderRadius:11,padding:'14px',border:`1px solid ${col}33`,textAlign:'center'}}>
                  <div>{ico}</div><div style={{fontSize:21,fontWeight:800,color:col,margin:'4px 0 2px'}}>{val}</div><div style={{fontSize:11,color:T.dim}}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          <Tabs tabs={[['posts','📋 Posts'],['flagged',`🚩 Flagged (${flagged.length})`],['tickets',`💬 Support (${tickets.filter(t=>t.status==='open').length})`],['revenue','💰 Revenue'],['publish','🌐 Publish & SEO']]} active={adminTab} set={setAdminTab}/>

          {adminTab==='posts'&&(
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',fontSize:12,borderCollapse:'collapse',background:T.card,borderRadius:12,overflow:'hidden',minWidth:680}}>
                <thead><tr style={{background:'#161626',borderBottom:`1px solid ${T.border}`}}>
                  {['Movie','Host','City','Spots','Reports','Featured','Status','Actions'].map(h=>(
                    <th key={h} style={{textAlign:'left',padding:'10px 12px',color:T.dim,fontWeight:600,fontSize:11,textTransform:'uppercase',letterSpacing:.5}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>{posts.map(p=>(
                  <tr key={p.id} style={{borderBottom:`1px solid ${T.border}`}}>
                    <td style={{padding:'9px 12px',color:T.text,fontWeight:600}}>{p.movie}</td>
                    <td style={{padding:'9px 12px',color:'#aaa'}}>{p.host}</td>
                    <td style={{padding:'9px 12px',color:T.dim}}>{p.city}</td>
                    <td style={{padding:'9px 12px',color:T.dim}}>{p.joined}/{p.spots}</td>
                    <td style={{padding:'9px 12px',color:p.reports>0?T.red:T.dim,fontWeight:p.reports>0?700:400}}>{p.reports}</td>
                    <td style={{padding:'9px 12px',color:p.featured?T.gold:T.dim}}>{p.featured?'⭐ Yes':'—'}</td>
                    <td style={{padding:'9px 12px'}}><span style={{fontSize:11,padding:'3px 9px',borderRadius:20,background:p.verified?'rgba(6,214,160,.15)':'rgba(255,159,67,.15)',color:p.verified?T.green:'#ff9f43',fontWeight:600}}>{p.verified?'✅ Verified':'⏳ Pending'}</span></td>
                    <td style={{padding:'9px 12px'}}><div style={{display:'flex',gap:5}}>
                      {!p.verified&&<AB col={T.green} onClick={()=>adminVerify(p.id)}>Verify</AB>}
                      <AB col={T.gold} onClick={()=>adminFeature(p.id)}>{p.featured?'Unpin':'⭐ Pin'}</AB>
                      <AB col={T.red}  onClick={()=>adminDelete(p.id)}>Delete</AB>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {adminTab==='flagged'&&(
            flagged.length===0?<Empty icon='✅' label='No flagged posts — community is clean!'/>
            :<div style={{overflowX:'auto'}}><table style={{width:'100%',fontSize:12,borderCollapse:'collapse',background:T.card,borderRadius:12,overflow:'hidden'}}>
              <thead><tr style={{background:'#161626',borderBottom:`1px solid ${T.border}`}}>{['Movie','Host','Reports','Action'].map(h=><th key={h} style={{textAlign:'left',padding:'10px 12px',color:T.dim,fontWeight:600,fontSize:11,textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
              <tbody>{flagged.map(p=>(
                <tr key={p.id} style={{borderBottom:`1px solid ${T.border}`}}>
                  <td style={{padding:'9px 12px',color:T.text,fontWeight:600}}>{p.movie}</td>
                  <td style={{padding:'9px 12px',color:'#aaa'}}>{p.host}</td>
                  <td style={{padding:'9px 12px',color:T.red,fontWeight:700}}>{p.reports} report{p.reports!==1?'s':''}</td>
                  <td style={{padding:'9px 12px'}}><button onClick={()=>adminDelete(p.id)} className='btn-h' style={{...Btn(T.red,'#fff'),padding:'5px 12px',fontSize:11,borderRadius:7}}>Remove Post</button></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}

          {adminTab==='tickets'&&(
            <div>
              {tickets.length===0?<Empty icon='💬' label='No support tickets yet.'/>
              :<div style={{display:'grid',gap:10}}>
                {tickets.map(t=>(
                  <div key={t.id} style={{background:T.card,borderRadius:12,padding:'16px',border:`1px solid ${t.status==='open'?T.gold+'44':T.border}`}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10,flexWrap:'wrap',marginBottom:10}}>
                      <div>
                        <div style={{fontSize:14,fontWeight:700,color:T.text}}>{t.subject||'No subject'}</div>
                        <div style={{fontSize:12,color:T.dim}}>{t.name} · {t.email} · {t.type} · {new Date(t.created_at).toLocaleDateString()}</div>
                      </div>
                      <div style={{display:'flex',gap:8,alignItems:'center'}}>
                        <span style={{fontSize:11,padding:'3px 9px',borderRadius:20,background:t.status==='open'?'rgba(255,217,61,.12)':'rgba(6,214,160,.12)',color:t.status==='open'?T.gold:T.green,fontWeight:600}}>{t.status==='open'?'🔴 Open':'✅ Resolved'}</span>
                        {t.status==='open'&&<button onClick={()=>adminResolve(t.id)} className='btn-h' style={{...Btn(T.green+'22',T.green),padding:'4px 11px',fontSize:12,borderRadius:7}}>Resolve</button>}
                      </div>
                    </div>
                    <div style={{fontSize:13,color:'#9090b0',lineHeight:1.7,background:'#0d0d1a',borderRadius:8,padding:'10px 14px'}}>{t.message}</div>
                  </div>
                ))}
              </div>}
            </div>
          )}

          {adminTab==='revenue'&&(
            <div style={{display:'grid',gap:14}}>
              {[{ico:'🎟️',title:'Booking Affiliate Links',col:T.blue,steps:['Apply to Cineplex affiliate at cineplex.com/affiliate','Join Fandango via CJ Affiliate at cj.com','Replace CINEMAS search URLs in App.jsx with your affiliate tracking links','Earn $0.50–$2.00 per booking click — 247 clicks already this month']},
                {ico:'⭐',title:'Pro Subscriptions — $4.99/mo',col:T.gold,steps:['Create Stripe account at stripe.com (free)','Go to Products → Create "CineConnect Pro" at $4.99/mo','Get the Payment Link URL → paste into proModal button href in App.jsx','Webhook: payment.succeeded → call API.setProStatus(userId, true)']},
                {ico:'📌',title:'Featured Post Boosts — $2.99 each',col:T.purple,steps:['Create a $2.99 one-time Stripe product','Host pays → you pin from Admin → Posts → ⭐ Pin button','Featured posts auto-sort to top of Browse and home page','Expect 15–20% of Pro hosts to pay for boosting']},
                {ico:'📣',title:'Google AdSense — $50–200/mo',col:'#ff6b9d',steps:['Apply at adsense.google.com (need content + traffic first)','Once approved, add AdSense script to public/index.html','Insert one banner component below the hero section on home','Best time to apply: after 500+ monthly visitors, 3+ months old site']}].map(r=>(
                <div key={r.title} style={{background:T.card,borderRadius:12,padding:'18px',border:`1px solid ${r.col}33`}}>
                  <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:10}}><span style={{fontSize:18}}>{r.ico}</span><span style={{fontSize:14,fontWeight:700,color:r.col}}>{r.title}</span></div>
                  <ol style={{fontSize:13,color:'#9090b0',lineHeight:2,paddingLeft:20,margin:0}}>{r.steps.map((s,i)=><li key={i}>{s}</li>)}</ol>
                </div>
              ))}
            </div>
          )}

          {adminTab==='publish'&&<PublishGuide/>}
        </Wrap>
      )}

      {/* ══════ MODALS ══════ */}
      {proModal&&<Modal onClose={()=>setProModal(false)}>
        <div style={{textAlign:'center',marginBottom:16}}>
          <div style={{fontSize:40,display:'inline-block',animation:'float 3s ease-in-out infinite',marginBottom:10}}>⭐</div>
          <h3 style={{fontSize:21,fontWeight:800,margin:'0 0 6px',background:'linear-gradient(135deg,#ffd93d,#a29bfe)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>CineConnect Pro</h3>
          <p style={{fontSize:13,color:T.dim,margin:0}}>Host unlimited outings, get verified, appear first in search.</p>
        </div>
        <div style={{background:'linear-gradient(135deg,#1a1000,#100a1a)',borderRadius:12,padding:'16px',border:`1px solid ${T.gold}33`,marginBottom:16}}>
          {['✏️ Post unlimited outings','✅ Verified host badge','📌 Priority in Browse','💬 Group messaging','🎟️ Shareable booking links','🛡️ Safety-verified community'].map(f=>(
            <div key={f} style={{fontSize:13,color:'#c0c0e0',padding:'5px 0',borderBottom:'1px solid rgba(255,217,61,.08)',display:'flex',gap:8}}>{f}</div>
          ))}
          <div style={{fontSize:24,fontWeight:800,color:T.gold,textAlign:'center',marginTop:12}}>$4.99<span style={{fontSize:13,fontWeight:400}}>/month</span></div>
        </div>
        <a href='https://buy.stripe.com/your-payment-link' target='_blank' rel='noopener noreferrer' className='btn-h' style={{...Btn('linear-gradient(135deg,#ffd93d,#a29bfe)',T.bg),display:'block',textAlign:'center',textDecoration:'none',padding:'13px',fontSize:15,borderRadius:12,marginBottom:10,boxShadow:'0 8px 24px rgba(255,217,61,.2)'}}>
          Upgrade Now — $4.99/mo →
        </a>
        <p style={{textAlign:'center',fontSize:12,color:T.dim}}>Secure payment via Stripe · Cancel anytime · Instant access</p>
      </Modal>}

      {joinModal&&<Modal onClose={()=>setJoinModal(null)}>
        <div style={{textAlign:'center',marginBottom:14}}>
          <div style={{fontSize:32,marginBottom:8}}>🎬</div>
          <h3 style={{color:T.text,margin:'0 0 6px',fontSize:18,fontWeight:800}}>Join This Outing</h3>
          <p style={{fontSize:13,color:'#9090b0',lineHeight:1.8,margin:0}}>Joining <b style={{color:T.text}}>{joinModal.host}</b> for<br/><b style={{color:T.gold,fontSize:15}}>{joinModal.movie}</b><br/>{joinModal.date} · {joinModal.time}<br/>{joinModal.cinema}, {joinModal.city}</p>
        </div>
        <div style={{background:'rgba(6,214,160,.07)',borderRadius:10,padding:'11px 14px',border:'1px solid rgba(6,214,160,.2)',marginBottom:14,fontSize:13,color:'#7a9a8a',lineHeight:1.8}}>
          🛡️ <b style={{color:T.green}}>Safety:</b> Meet only in the public cinema lobby. Trust your instincts — report anything suspicious immediately.
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>setJoinModal(null)} className='btn-h' style={{...Btn(T.card,'#6b6b8a'),flex:1,border:`1px solid ${T.border}`,borderRadius:10}}>Cancel</button>
          <button onClick={confirmJoin} className='btn-h' style={{...Btn('linear-gradient(135deg,#ffd93d,#ff9f43)',T.bg),flex:2,borderRadius:10,boxShadow:'0 4px 16px rgba(255,217,61,.2)'}}>✅ Confirm &amp; Book Tickets</button>
        </div>
      </Modal>}

      {bookModal&&<Modal onClose={()=>setBookModal(null)} wide>
        <div style={{textAlign:'center',marginBottom:16}}>
          <div style={{fontSize:28,marginBottom:8}}>🎟️</div>
          <h3 style={{color:T.text,margin:'0 0 4px',fontSize:18,fontWeight:800}}>Book Your Tickets</h3>
          <p style={{fontSize:13,color:T.dim,margin:0}}><b style={{color:T.text}}>{bookModal.movie}</b></p>
          <p style={{fontSize:12,color:T.dim,marginTop:2}}>{bookModal.date} · {bookModal.time} · {bookModal.city}</p>
        </div>
        {CM[bookModal.cinema]&&<div style={{marginBottom:12}}>
          <div style={{fontSize:10,color:T.green,marginBottom:6,fontWeight:700,letterSpacing:1}}>⭐ RECOMMENDED — CINEMA FOR THIS OUTING</div>
          <a href={CM[bookModal.cinema].search+encodeURIComponent(bookModal.movie)} target='_blank' rel='noopener noreferrer' className='btn-h'
            style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderRadius:12,textDecoration:'none',color:T.text,background:CM[bookModal.cinema].color+'18',border:`2px solid ${CM[bookModal.cinema].color}66`}}>
            <span style={{fontSize:26}}>{CM[bookModal.cinema].logo}</span>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:CM[bookModal.cinema].color}}>{CM[bookModal.cinema].name}</div><div style={{fontSize:11,color:T.dim}}>Search "{bookModal.movie}" and pick your showtime</div></div>
            <div style={{...Btn(CM[bookModal.cinema].color,'#fff'),fontSize:12,padding:'7px 14px',borderRadius:9}}>Book Now →</div>
          </a>
        </div>}
        <div style={{fontSize:10,color:'#33334a',marginBottom:6,fontWeight:700,letterSpacing:1}}>OTHER PLATFORMS</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
          {CINEMAS.filter(c=>c.name!==bookModal?.cinema).map(c=>(
            <a key={c.name} href={c.search+encodeURIComponent(bookModal.movie)} target='_blank' rel='noopener noreferrer' className='btn-h'
              style={{display:'flex',alignItems:'center',gap:8,padding:'9px 12px',borderRadius:9,background:'#161624',border:`1px solid ${T.border}`,textDecoration:'none',color:'#9090b0',fontSize:12}}>
              <span style={{fontSize:16}}>{c.logo}</span><span>{c.name}</span><span style={{marginLeft:'auto',color:c.color}}>→</span>
            </a>
          ))}
        </div>
        <div style={{background:T.card,borderRadius:8,padding:'9px 12px',border:`1px solid ${T.border}`,marginBottom:10,fontSize:12,color:T.dim}}>💡 Share the booking link in your group so everyone picks adjacent seats.</div>
        <button onClick={()=>setBookModal(null)} className='btn-h' style={{...Btn('transparent','#6b6b8a'),width:'100%',border:`1px solid ${T.border}`,borderRadius:10}}>Close</button>
      </Modal>}

      {repModal&&<Modal onClose={()=>setRepModal(null)}>
        <div style={{textAlign:'center',marginBottom:12}}><div style={{fontSize:26}}>🚩</div><h3 style={{color:T.red,margin:'8px 0 4px',fontWeight:800}}>Report This Post</h3><p style={{color:T.dim,fontSize:12,margin:0}}>Safety team reviews all reports within 24 hours.</p></div>
        {['Fake or misleading profile','Inappropriate content','Suspected predatory intent','Spam or advertising','User appears under 18','Other safety concern'].map(r=>(
          <button key={r} onClick={()=>confirmReport(r)} className='btn-h' style={{width:'100%',padding:'10px 14px',textAlign:'left',background:T.card,color:'#9090b0',border:`1px solid ${T.border}`,borderRadius:9,cursor:'pointer',fontSize:13,marginBottom:5,display:'block',fontFamily:'system-ui,sans-serif'}}>🚩 {r}</button>
        ))}
        <button onClick={()=>setRepModal(null)} className='btn-h' style={{...Btn('transparent','#6b6b8a'),width:'100%',marginTop:4,border:`1px solid ${T.border}`,borderRadius:10}}>Cancel</button>
      </Modal>}

      {doneModal&&<Modal onClose={()=>setDoneModal(null)}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:48,marginBottom:12,display:'inline-block',animation:'float 2s ease-in-out infinite'}}>🎉</div>
          <h3 style={{fontSize:21,fontWeight:800,margin:'0 0 8px',background:'linear-gradient(135deg,#ffd93d,#ff6b9d)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Outing Published!</h3>
          <p style={{color:'#9090b0',fontSize:14,lineHeight:1.8,margin:'0 0 18px'}}><b style={{color:T.text}}>{doneModal.movie}</b> is live and visible to all CineConnect members in {doneModal.city}.</p>
          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>{setDoneModal(null);nav('browse');}} className='btn-h' style={{...Btn('linear-gradient(135deg,#ffd93d,#ff9f43)',T.bg),flex:1,borderRadius:10}}>View Listings</button>
            <button onClick={()=>{setDoneModal(null);setBookModal(doneModal);}} className='btn-h' style={{...Btn(T.card,T.gold),flex:1,border:`1px solid ${T.gold}44`,borderRadius:10}}>🎟️ Book Tickets</button>
          </div>
        </div>
      </Modal>}
    </div>
  );
}

/* ================================================================
   LOGIN PAGE — full screen split layout
================================================================ */
function LoginPage({nav,setUser,notify}) {
  const [email,setEmail]=useState('');
  const [pass,setPass]=useState('');
  const [err,setErr]=useState('');
  const [loading,setLoading]=useState(false);
  const [resetMode,setResetMode]=useState(false);
  const [resetSent,setResetSent]=useState(false);

  const doLogin=async()=>{
    if(!email.includes('@')){setErr('Enter a valid email address.');return;}
    if(!resetMode&&!pass){setErr('Enter your password.');return;}
    setLoading(true);setErr('');
    if(resetMode){
      const {error}=await API.resetPassword(email);
      setLoading(false);
      if(error){setErr(error.message);}
      else{setResetSent(true);}
      return;
    }
    // Admin shortcut (no Supabase needed)
    if(email==='owner@cineconnect.ca'||email===ADMIN_EMAIL){
      if(pass!==ADMIN_PASSWORD){setErr('Incorrect password.');setLoading(false);return;}
      setUser({name:'Owner',email,initials:'OW',is_pro:true,full_name:'Admin (You)',adminEmail:email});
      notify('Welcome back, Owner 👑');
      nav('admin');setLoading(false);return;
    }
    const {data,error}=await API.signIn(email,pass);
    setLoading(false);
    if(error){setErr(error.message||'Login failed. Check your email and password.');return;}
    if(data?.user){
      const profile=await API.getProfile(data.user.id);
      setUser({...data.user,...profile,email:data.user.email});
      notify(`Welcome back! 🎬`);
      nav('home');
    }
  };

  const doGoogle=async()=>{
    const {error}=await API.signInWithGoogle();
    if(error) setErr('Google sign-in not configured yet. Use email & password.');
  };

  return(
    <div style={{minHeight:'100vh',display:'grid',gridTemplateColumns:'1fr 1fr',background:T.bg}} className='fade'>
      <style>{CSS}</style>
      {/* Left panel */}
      <div style={{background:'linear-gradient(160deg,#0d0d1a,#12091f)',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',padding:'40px',borderRight:`1px solid ${T.border}`,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 30% 50%,rgba(162,155,254,.15) 0%,transparent 55%),radial-gradient(circle at 70% 80%,rgba(255,107,157,.1) 0%,transparent 45%)',pointerEvents:'none'}}/>
        <div style={{position:'relative',textAlign:'center',maxWidth:360}}>
          <div style={{cursor:'pointer',display:'inline-flex',alignItems:'center',gap:10,marginBottom:36}} onClick={()=>nav('home')}>
            <div style={{width:42,height:42,borderRadius:12,background:'linear-gradient(135deg,#ffd93d,#ff6b9d)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🎬</div>
            <span style={{fontSize:22,fontWeight:800,background:'linear-gradient(135deg,#ffd93d,#ff6b9d)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>CineConnect</span>
          </div>
          <h2 style={{fontSize:'clamp(22px,3vw,30px)',fontWeight:800,color:T.text,margin:'0 0 14px',lineHeight:1.2}}>Connect with Cinema Lovers Near You</h2>
          <p style={{fontSize:14,color:T.dim,lineHeight:1.7,margin:'0 0 32px'}}>Join thousands of verified film fans across the GTA. Browse outings, join a group, book seats together.</p>
          <div style={{display:'grid',gap:10,textAlign:'left'}}>
            {[['🔍','Find outings by genre and city'],['✅','Verified hosts only — safe community'],['🎟️','Book tickets directly from every card'],['🛡️','Safety-first — public meetups only']].map(([ico,text])=>(
              <div key={text} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'rgba(255,255,255,.04)',borderRadius:10,border:`1px solid ${T.border}`}}>
                <span style={{fontSize:18}}>{ico}</span>
                <span style={{fontSize:13,color:'#c0c0d0'}}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',padding:'40px 32px',background:T.bg}}>
        <div style={{width:'100%',maxWidth:380}}>
          {resetSent?(
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:48,marginBottom:16}}>📧</div>
              <h3 style={{fontSize:20,fontWeight:800,color:T.text,margin:'0 0 10px'}}>Check your inbox</h3>
              <p style={{fontSize:14,color:T.dim,lineHeight:1.7,margin:'0 0 24px'}}>We sent a password reset link to <b style={{color:T.text}}>{email}</b>. Click the link in the email to set a new password.</p>
              <button onClick={()=>{setResetSent(false);setResetMode(false);}} className='btn-h' style={{...Btn('linear-gradient(135deg,#ffd93d,#ff9f43)',T.bg),width:'100%',padding:'12px',borderRadius:11}}>Back to Login</button>
            </div>
          ):(
            <>
              <h3 style={{fontSize:24,fontWeight:800,color:T.text,margin:'0 0 6px'}}>{resetMode?'Reset Password':'Welcome back'}</h3>
              <p style={{fontSize:14,color:T.dim,margin:'0 0 24px'}}>{resetMode?'Enter your email to receive a reset link':'Log in to your CineConnect account'}</p>

              <div style={{display:'grid',gap:12,marginBottom:16}}>
                <div><FL>Email address</FL><input type='email' value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doLogin()} placeholder='you@email.com' style={inp} autoComplete='email'/></div>
                {!resetMode&&<div>
                  <FL>Password</FL>
                  <input type='password' value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doLogin()} placeholder='Your password' style={inp} autoComplete='current-password'/>
                </div>}
              </div>

              {err&&<div style={{background:'rgba(255,71,87,.1)',color:T.red,padding:'10px 14px',borderRadius:9,fontSize:13,marginBottom:14,border:`1px solid ${T.red}33`}}>⚠️ {err}</div>}

              <button onClick={doLogin} disabled={loading} className='btn-h' style={{...Btn('linear-gradient(135deg,#ffd93d,#ff9f43)',T.bg),width:'100%',padding:'13px',fontSize:15,borderRadius:11,marginBottom:12,boxShadow:'0 8px 20px rgba(255,217,61,.2)',opacity:loading?.7:1}}>
                {loading?'Please wait...':(resetMode?'Send Reset Link':'Log In')}
              </button>

              {!resetMode&&<>
                <div style={{display:'flex',alignItems:'center',gap:12,margin:'4px 0 12px'}}>
                  <div style={{flex:1,height:1,background:T.border}}/>
                  <span style={{fontSize:12,color:T.dim,whiteSpace:'nowrap'}}>or continue with</span>
                  <div style={{flex:1,height:1,background:T.border}}/>
                </div>
                <button onClick={doGoogle} className='btn-h' style={{...Btn(T.card,T.text),width:'100%',padding:'12px',borderRadius:11,border:`1px solid ${T.border}`,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:20}}>
                  <svg width='18' height='18' viewBox='0 0 24 24'><path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/><path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/><path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z'/><path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/></svg>
                  Continue with Google
                </button>
              </>}

              <div style={{display:'flex',justifyContent:'space-between',fontSize:13,flexWrap:'wrap',gap:8}}>
                <span style={{color:T.dim}}>Don't have an account? <span style={{color:T.gold,cursor:'pointer',fontWeight:600}} onClick={()=>nav('signup')}>Sign up free</span></span>
                <span style={{color:T.dim,cursor:'pointer'}} onClick={()=>{setResetMode(!resetMode);setErr('');}}>{resetMode?'Back to login':'Forgot password?'}</span>
              </div>
            </>
          )}
          <button onClick={()=>nav('home')} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',fontSize:13,marginTop:24,display:'block',fontFamily:'system-ui,sans-serif'}}>← Back to CineConnect</button>
        </div>
      </div>

      {/* Mobile: stack vertically */}
      <style>{`@media(max-width:700px){.fade>div:first-child{display:none!important}.fade>div:last-child{grid-column:1/-1}}`}</style>
    </div>
  );
}

/* ================================================================
   SIGNUP PAGE
================================================================ */
function SignupPage({nav,setUser,notify}) {
  const [form,setForm]=useState({name:'',email:'',pass:'',confirm:''});
  const [err,setErr]=useState('');
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);

  const doSignup=async()=>{
    if(!form.name.trim()){setErr('Enter your full name.');return;}
    if(!form.email.includes('@')){setErr('Enter a valid email address.');return;}
    if(form.pass.length<6){setErr('Password must be at least 6 characters.');return;}
    if(form.pass!==form.confirm){setErr('Passwords do not match.');return;}
    setLoading(true);setErr('');
    const {data,error}=await API.signUp(form.email,form.pass,form.name);
    setLoading(false);
    if(error){setErr(error.message||'Signup failed. Please try again.');return;}
    if(data?.user){
      if(data.session){
        const initials=form.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
        setUser({...data.user,full_name:form.name,initials,is_pro:false,email:form.email});
        notify(`Welcome to CineConnect, ${form.name.split(' ')[0]}! 🎬`);
        nav('browse');
      } else { setDone(true); }
    } else {
      // If no Supabase, create local user
      const initials=form.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
      setUser({id:Date.now(),full_name:form.name,email:form.email,initials,is_pro:false,since:'May 2026'});
      notify(`Welcome to CineConnect, ${form.name.split(' ')[0]}! 🎬`);
      nav('browse');
    }
  };

  return(
    <div style={{minHeight:'100vh',display:'grid',gridTemplateColumns:'1fr 1fr',background:T.bg}} className='fade'>
      <style>{CSS}</style>
      {/* Left branding */}
      <div style={{background:'linear-gradient(160deg,#12091f,#0a0a12)',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',padding:'40px',borderRight:`1px solid ${T.border}`,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 60% 40%,rgba(255,217,61,.1) 0%,transparent 50%),radial-gradient(circle at 20% 70%,rgba(162,155,254,.12) 0%,transparent 50%)',pointerEvents:'none'}}/>
        <div style={{position:'relative',textAlign:'center',maxWidth:360}}>
          <div style={{cursor:'pointer',display:'inline-flex',alignItems:'center',gap:10,marginBottom:36}} onClick={()=>nav('home')}>
            <div style={{width:42,height:42,borderRadius:12,background:'linear-gradient(135deg,#ffd93d,#ff6b9d)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🎬</div>
            <span style={{fontSize:22,fontWeight:800,background:'linear-gradient(135deg,#ffd93d,#ff6b9d)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>CineConnect</span>
          </div>
          <h2 style={{fontSize:'clamp(22px,3vw,28px)',fontWeight:800,color:T.text,margin:'0 0 14px',lineHeight:1.2}}>Join 2,400+ Cinema Lovers in the GTA</h2>
          <p style={{fontSize:14,color:T.dim,lineHeight:1.7,margin:'0 0 28px'}}>Free to join. Browse and join outings instantly. Upgrade to Pro to host your own.</p>
          <div style={{background:'linear-gradient(135deg,rgba(255,217,61,.08),rgba(162,155,254,.08))',borderRadius:16,padding:'20px',border:`1px solid ${T.gold}33`}}>
            <div style={{fontSize:13,color:T.gold,fontWeight:700,marginBottom:12}}>Free account includes:</div>
            {['Browse all movie outings','Join any verified outing','Book tickets directly','Community verified safety','GTA-wide coverage'].map(f=>(
              <div key={f} style={{fontSize:13,color:'#c0c0d0',padding:'5px 0',display:'flex',gap:8,alignItems:'center',borderBottom:'1px solid rgba(255,217,61,.06)'}}><span style={{color:T.green}}>✓</span>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',padding:'40px 32px',background:T.bg}}>
        <div style={{width:'100%',maxWidth:380}}>
          {done?(
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:48,marginBottom:16}}>📧</div>
              <h3 style={{fontSize:20,fontWeight:800,color:T.text,margin:'0 0 10px'}}>Verify your email</h3>
              <p style={{fontSize:14,color:T.dim,lineHeight:1.7,margin:'0 0 24px'}}>We sent a verification link to <b style={{color:T.text}}>{form.email}</b>. Click it to activate your account, then log in.</p>
              <button onClick={()=>nav('login')} className='btn-h' style={{...Btn('linear-gradient(135deg,#ffd93d,#ff9f43)',T.bg),width:'100%',padding:'12px',borderRadius:11}}>Go to Login →</button>
            </div>
          ):(
            <>
              <h3 style={{fontSize:24,fontWeight:800,color:T.text,margin:'0 0 6px'}}>Create your account</h3>
              <p style={{fontSize:14,color:T.dim,margin:'0 0 22px'}}>Free forever. No credit card required.</p>
              <div style={{display:'grid',gap:11,marginBottom:16}}>
                <div><FL>Full Name</FL><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder='e.g. Sarah Kim' style={inp} autoComplete='name'/></div>
                <div><FL>Email Address</FL><input type='email' value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder='you@email.com' style={inp} autoComplete='email'/></div>
                <div><FL>Password (min. 6 characters)</FL><input type='password' value={form.pass} onChange={e=>setForm({...form,pass:e.target.value})} placeholder='Create a password' style={inp} autoComplete='new-password'/></div>
                <div><FL>Confirm Password</FL><input type='password' value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} onKeyDown={e=>e.key==='Enter'&&doSignup()} placeholder='Repeat your password' style={inp} autoComplete='new-password'/></div>
              </div>
              {err&&<div style={{background:'rgba(255,71,87,.1)',color:T.red,padding:'10px 14px',borderRadius:9,fontSize:13,marginBottom:14,border:`1px solid ${T.red}33`}}>⚠️ {err}</div>}
              <button onClick={doSignup} disabled={loading} className='btn-h' style={{...Btn('linear-gradient(135deg,#ffd93d,#ff9f43)',T.bg),width:'100%',padding:'13px',fontSize:15,borderRadius:11,marginBottom:14,boxShadow:'0 8px 20px rgba(255,217,61,.2)',opacity:loading?.7:1}}>
                {loading?'Creating account...':'Create Free Account ✨'}
              </button>
              <p style={{fontSize:11,color:'#44445a',textAlign:'center',marginBottom:16}}>By signing up you agree to our Terms of Service and Privacy Policy. 18+ only.</p>
              <div style={{textAlign:'center',fontSize:13,color:T.dim}}>Already have an account? <span style={{color:T.gold,cursor:'pointer',fontWeight:600}} onClick={()=>nav('login')}>Log in</span></div>
            </>
          )}
          <button onClick={()=>nav('home')} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',fontSize:13,marginTop:24,display:'block',fontFamily:'system-ui,sans-serif'}}>← Back to CineConnect</button>
        </div>
      </div>
      <style>{`@media(max-width:700px){.fade>div:first-child{display:none!important}.fade>div:last-child{grid-column:1/-1}}`}</style>
    </div>
  );
}

/* ================================================================
   SUPPORT PAGE
================================================================ */
function SupportPage({user,notify}) {
  const [open,setOpen]=useState(null);
  const [form,setForm]=useState({name:user?.full_name||'',email:user?.email||'',subject:'',message:'',type:'general'});
  const [sending,setSending]=useState(false);
  const [sent,setSent]=useState(false);
  const [err,setErr]=useState('');

  const faqs=[
    {q:'How do I join a movie outing?',a:'Browse the outings page, find one you like, and click "Join Outing". You must be logged in. Once you join, you\'ll see the booking link to reserve your seat at the cinema.'},
    {q:'Is CineConnect free to use?',a:'Browsing and joining outings is completely free. Hosting your own outings requires a Pro membership at $4.99/month, which also gives you a verified badge and priority placement.'},
    {q:'How does verification work?',a:'Hosts can request verification by contacting us. We review their profile and activity. Verified hosts show a green ✅ badge. All users must agree to our safety guidelines on signup.'},
    {q:'What if I feel unsafe at a meetup?',a:'Always meet in the public cinema lobby — never private locations. If something feels wrong, leave immediately and report the host using the 🚩 button. Our team responds within 24 hours.'},
    {q:'How do I cancel or change a booking?',a:'You can leave an outing from your Profile page. For cinema ticket cancellations, contact the cinema directly — booking policies vary by chain.'},
    {q:'Can I post outings without a Pro account?',a:'Free accounts can browse and join outings. To host your own outing and appear as a verified host, you need a Pro account ($4.99/month). You can upgrade from your profile.'},
    {q:'How do I report a fake or suspicious profile?',a:'Click the 🚩 flag icon on any outing card and select the reason. Our safety team reviews all reports within 24 hours and will take action including banning users who violate our guidelines.'},
    {q:'Which cities does CineConnect cover?',a:'We currently cover the Greater Toronto Area including Toronto, Brampton, Mississauga, Vaughan, Markham, Oakville, Burlington, and Hamilton. More cities coming soon!'},
  ];

  const submit=async()=>{
    if(!form.message.trim()){setErr('Please enter your message.');return;}
    if(!form.email.includes('@')){setErr('Enter a valid email address.');return;}
    setSending(true);setErr('');
    const {error}=await API.submitTicket(form);
    setSending(false);
    if(error){setErr('Could not send message. Please email us directly at support@cineconnect.ca');return;}
    setSent(true);
  };

  return(
    <div className='fade'>
      {/* Hero */}
      <div style={{background:'linear-gradient(160deg,#0d0d1a,#12091f)',padding:'52px 20px 44px',textAlign:'center',borderBottom:`1px solid ${T.border}`}}>
        <div style={{fontSize:44,marginBottom:14}}>💬</div>
        <h1 style={{fontSize:'clamp(24px,5vw,38px)',fontWeight:800,margin:'0 0 12px',color:T.text}}>How can we help?</h1>
        <p style={{fontSize:15,color:T.dim,margin:'0 auto',maxWidth:480,lineHeight:1.7}}>Browse our FAQ, contact our team, or report a safety concern. We respond to all messages within 24 hours.</p>
      </div>

      {/* Quick links */}
      <div style={{maxWidth:900,margin:'32px auto 0',padding:'0 16px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14}}>
        {[['🛡️','Safety & Reporting','Report a user or post',T.red],['🎟️','Booking Help','Ticket & cinema questions',T.blue],['⭐','Pro Membership','Upgrade & billing help',T.gold],['🐛','Technical Issue','Something not working?',T.purple]].map(([ico,title,sub,col])=>(
          <div key={title} className='card-h' style={{background:T.card,borderRadius:13,padding:'18px',border:`1px solid ${col}33`,cursor:'pointer',textAlign:'center'}}
            onClick={()=>setForm({...form,type:title.toLowerCase().split(' ')[0],subject:title})}>
            <div style={{fontSize:28,marginBottom:8}}>{ico}</div>
            <div style={{fontSize:14,fontWeight:700,color:col,marginBottom:4}}>{title}</div>
            <div style={{fontSize:12,color:T.dim}}>{sub}</div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{maxWidth:720,margin:'36px auto',padding:'0 16px'}}>
        <h2 style={{fontSize:20,fontWeight:800,margin:'0 0 18px'}}>Frequently Asked Questions</h2>
        <div style={{display:'grid',gap:8}}>
          {faqs.map((f,i)=>(
            <div key={i} style={{background:T.card,borderRadius:12,border:`1px solid ${open===i?T.gold+'55':T.border}`,overflow:'hidden',transition:'border-color .2s'}}>
              <button onClick={()=>setOpen(open===i?null:i)} style={{width:'100%',padding:'16px 18px',background:'transparent',border:'none',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,textAlign:'left',fontFamily:'system-ui,sans-serif'}}>
                <span style={{fontSize:14,fontWeight:600,color:open===i?T.gold:T.text,flex:1}}>{f.q}</span>
                <span style={{fontSize:18,color:T.dim,flexShrink:0,transition:'transform .2s',transform:open===i?'rotate(45deg)':'none'}}>+</span>
              </button>
              {open===i&&<div style={{padding:'0 18px 16px',fontSize:13,color:'#9090b0',lineHeight:1.8,borderTop:`1px solid ${T.border}`}}><div style={{paddingTop:14}}>{f.a}</div></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Contact form */}
      <div style={{maxWidth:680,margin:'0 auto 48px',padding:'0 16px'}}>
        <div style={{background:T.card,borderRadius:16,padding:'28px',border:`1px solid ${T.border}`}}>
          <h2 style={{fontSize:19,fontWeight:800,margin:'0 0 6px'}}>📩 Contact Us</h2>
          <p style={{fontSize:13,color:T.dim,margin:'0 0 22px'}}>Can't find your answer above? Send us a message and we'll respond within 24 hours.</p>
          {sent?(
            <div style={{textAlign:'center',padding:'30px 0'}}>
              <div style={{fontSize:44,marginBottom:12}}>✅</div>
              <h3 style={{fontSize:18,fontWeight:800,color:T.green,margin:'0 0 8px'}}>Message Sent!</h3>
              <p style={{fontSize:14,color:T.dim,lineHeight:1.7}}>Thank you for reaching out. Our team will respond to <b style={{color:T.text}}>{form.email}</b> within 24 hours.</p>
              <button onClick={()=>setSent(false)} className='btn-h' style={{...Btn(T.card,T.text),marginTop:16,border:`1px solid ${T.border}`,borderRadius:9}}>Send another message</button>
            </div>
          ):(
            <div style={{display:'grid',gap:12}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><FL>Your Name</FL><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder='Full name' style={inp}/></div>
                <div><FL>Email Address</FL><input type='email' value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder='you@email.com' style={inp}/></div>
              </div>
              <div><FL>Topic</FL>
                <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={inp}>
                  {[['general','General Question'],['safety','Safety & Reporting'],['booking','Booking Help'],['billing','Pro Membership & Billing'],['technical','Technical Issue'],['other','Other']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div><FL>Subject</FL><input value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder='Brief description of your issue' style={inp}/></div>
              <div><FL>Message *</FL><textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} rows={5} placeholder='Tell us more about your question or issue...' style={{...inp,resize:'vertical',lineHeight:1.6}}/></div>
              {err&&<div style={{background:'rgba(255,71,87,.1)',color:T.red,padding:'10px 14px',borderRadius:9,fontSize:13,border:`1px solid ${T.red}33`}}>⚠️ {err}</div>}
              <button onClick={submit} disabled={sending} className='btn-h' style={{...Btn('linear-gradient(135deg,#ffd93d,#ff9f43)',T.bg),padding:'13px',fontSize:15,borderRadius:11,boxShadow:'0 6px 20px rgba(255,217,61,.2)',opacity:sending?.7:1}}>
                {sending?'Sending...':'Send Message 📩'}
              </button>
              <p style={{fontSize:12,color:T.dim,textAlign:'center'}}>Or email us directly: <a href='mailto:support@cineconnect.ca' style={{color:T.gold}}>support@cineconnect.ca</a></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   PUBLISH GUIDE (admin tab)
================================================================ */
function PublishGuide() {
  const [open,setOpen]=useState(0);
  const steps=[
    {ico:'🗄️',title:'Step 1 — Connect Supabase Database',col:T.green,items:[
      ['Create project','Go to supabase.com → New Project → name it "cineconnect"','https://supabase.com'],
      ['Run SQL schema','SQL Editor → New Query → paste entire SUPABASE_SETUP.sql → Run','https://supabase.com/dashboard'],
      ['Copy your keys','Settings → API → copy Project URL + anon public key','https://supabase.com/dashboard'],
      ['Add to Vercel','Vercel → your project → Settings → Environment Variables → add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY → Redeploy','https://vercel.com'],
    ]},
    {ico:'🔐',title:'Step 2 — Set Up User Authentication',col:T.purple,items:[
      ['Enable Email auth','Supabase → Authentication → Providers → Email → Enable','https://supabase.com/dashboard'],
      ['Enable Google auth','Supabase → Authentication → Providers → Google → Enable → add OAuth credentials from console.cloud.google.com','https://console.cloud.google.com'],
      ['Set redirect URL','Supabase → Auth → URL Configuration → add https://cineconnect.vercel.app','https://supabase.com/dashboard'],
      ['Test signup','Visit your live site → Sign Up → check Supabase → Authentication → Users for the new user','https://cineconnect.vercel.app'],
    ]},
    {ico:'🔍',title:'Step 3 — Get Found on Google',col:T.blue,items:[
      ['Search Console','Go to search.google.com/search-console → Add property → enter cineconnect.vercel.app','https://search.google.com/search-console'],
      ['Verify ownership','Download HTML verification file → upload to /public/ in GitHub → Vercel redeploys → verify','https://search.google.com/search-console'],
      ['Submit sitemap','Search Console → Sitemaps → enter: https://cineconnect.vercel.app/sitemap.xml → Submit','https://search.google.com/search-console'],
      ['Google Analytics','Go to analytics.google.com → Create property → copy GA4 tag → add to index.html <head>','https://analytics.google.com'],
    ]},
    {ico:'📱',title:'Step 4 — Mobile App (PWA)',col:'#ff9f43',items:[
      ['Test PWA now','Your site already works as a PWA — open on iPhone Safari → Share → Add to Home Screen','https://cineconnect.vercel.app'],
      ['Google Play ($25)','Play Console → Create app → use Bubblewrap to generate APK from your PWA → upload','https://play.google.com/console'],
      ['Apple App Store ($99/yr)','developer.apple.com → install Capacitor → npx cap add ios → build in Xcode → submit','https://developer.apple.com'],
    ]},
    {ico:'📣',title:'Step 5 — Promote & Get Users',col:T.pink,items:[
      ['Reddit','Post in r/toronto, r/brampton, r/mississauga — title: "Free app to find movie companions in the GTA"','https://reddit.com/r/toronto'],
      ['Facebook Groups','Search "Toronto Events", "GTA Movies & Shows" — post your link with a screenshot','https://facebook.com/groups'],
      ['Meetup.com','Create group: "CineConnect — GTA Film Fans" — Meetup has huge local community reach','https://meetup.com/create'],
      ['Instagram/TikTok','Post a 30-second screen recording with #torontomovies #gtaevents #cinemabuddies','https://instagram.com'],
      ['Product Hunt','Launch at producthunt.com — great for early adopters and tech community','https://producthunt.com/posts/new'],
    ]},
    {ico:'💰',title:'Step 6 — Revenue Setup',col:T.gold,items:[
      ['Stripe account','Create at stripe.com → Products → "CineConnect Pro" $4.99/mo → get Payment Link → paste in App.jsx proModal','https://stripe.com'],
      ['Cineplex affiliate','Apply at cineplex.com → replace CINEMAS search URLs with affiliate tracking links','https://www.cineplex.com'],
      ['Google AdSense','Apply at adsense.google.com after 3+ months and 500+ visitors — adds banner ad revenue','https://adsense.google.com'],
    ]},
    {ico:'⚖️',title:'Step 7 — Legal (required before promoting)',col:T.red,items:[
      ['Terms of Service','Generate free at termly.io → publish at cineconnect.vercel.app/terms','https://termly.io'],
      ['Privacy Policy','Required for PIPEDA (Canada) — termly.io generates one free — add link to signup page footer','https://termly.io'],
      ['Safety email','Create support@cineconnect.ca (or use Gmail) — respond to reports within 24h',null],
      ['Trademark check','Search "CineConnect" at ic.gc.ca/app/opic-cipo/trdmrks — register if clear (~$350)','https://www.ic.gc.ca/app/opic-cipo/trdmrks/srch/srchForm.do'],
    ]},
  ];

  return(
    <div>
      <div style={{background:'linear-gradient(135deg,#0d1a0d,#0a0d14)',borderRadius:14,padding:'18px',border:'1px solid rgba(6,214,160,.2)',marginBottom:18}}>
        <div style={{fontSize:14,fontWeight:700,color:T.green,marginBottom:8}}>🌐 Complete Publish Checklist</div>
        <div style={{fontSize:13,color:T.dim,lineHeight:1.7}}>Follow these 7 steps in order to go from prototype to a fully live, Google-indexed, revenue-generating platform with real users. Each step is a clickable accordion.</div>
      </div>
      {steps.map((s,i)=>(
        <div key={i} style={{marginBottom:8,background:T.card,borderRadius:12,border:`1px solid ${open===i?s.col+'55':T.border}`,overflow:'hidden'}}>
          <button onClick={()=>setOpen(open===i?null:i)} style={{width:'100%',padding:'14px 18px',background:'transparent',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:10,textAlign:'left',fontFamily:'system-ui,sans-serif'}}>
            <span style={{fontSize:20}}>{s.ico}</span>
            <span style={{flex:1,fontSize:13,fontWeight:700,color:open===i?s.col:T.text}}>{s.title}</span>
            <span style={{fontSize:12,color:T.dim,transition:'transform .2s',display:'inline-block',transform:open===i?'rotate(180deg)':'none'}}>▼</span>
          </button>
          {open===i&&(
            <div style={{padding:'0 18px 16px',borderTop:`1px solid ${T.border}`}}>
              {s.items.map(([label,desc,link],j)=>(
                <div key={j} style={{display:'flex',gap:12,padding:'12px 0',borderBottom:`1px solid ${T.border}`,alignItems:'flex-start'}}>
                  <div style={{width:22,height:22,borderRadius:'50%',background:s.col+'22',border:`1px solid ${s.col}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:s.col,flexShrink:0,marginTop:1}}>{j+1}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:3}}>{label}</div>
                    <div style={{fontSize:12,color:T.dim,lineHeight:1.65}}>{desc}</div>
                  </div>
                  {link&&<a href={link} target='_blank' rel='noopener noreferrer' style={{fontSize:12,color:s.col,background:s.col+'18',padding:'4px 11px',borderRadius:20,textDecoration:'none',fontWeight:600,whiteSpace:'nowrap',flexShrink:0}}>Open →</a>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   CARD
================================================================ */
function Card({p,joined,reported,user,onJoin,onBook,onReport,isHost}){
  const spotsLeft=p.spots-p.joined;
  const gc=GC[p.genre]||'#888';
  const ci=CM[p.cinema];
  return(
    <div className='card-h' style={{background:T.card,borderRadius:15,border:`1px solid ${p.featured?T.gold+'44':T.border}`,overflow:'hidden',display:'flex',flexDirection:'column',position:'relative'}}>
      {p.featured&&<div style={{position:'absolute',top:10,right:10,fontSize:10,background:'linear-gradient(135deg,#ffd93d,#ff9f43)',color:T.bg,padding:'3px 9px',borderRadius:20,fontWeight:700,zIndex:1}}>⭐ FEATURED</div>}
      <div style={{height:3,background:`linear-gradient(90deg,${gc},${gc}88)`}}/>
      <div style={{padding:'15px',flex:1,display:'flex',flexDirection:'column'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:9,gap:8}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:15,fontWeight:800,color:T.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',letterSpacing:'-0.3px'}}>{p.movie}</div>
            <div style={{marginTop:5,display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
              <span style={{fontSize:11,padding:'2px 9px',borderRadius:20,background:gc+'22',color:gc,fontWeight:600}}>{p.genre}</span>
              <span style={{fontSize:11,color:T.dim}}>📍 {p.city}</span>
            </div>
          </div>
          {p.verified&&<span style={{fontSize:10,background:'rgba(6,214,160,.12)',color:T.green,padding:'3px 8px',borderRadius:20,border:'1px solid rgba(6,214,160,.25)',whiteSpace:'nowrap',flexShrink:0,fontWeight:600}}>✅ Verified</span>}
        </div>
        <div style={{fontSize:11,color:T.dim,marginBottom:9,display:'flex',gap:10,flexWrap:'wrap',fontWeight:500}}>
          <span>📅 {p.date}</span><span>🕐 {p.time}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:9,paddingTop:9,borderTop:`1px solid ${T.border}`,marginBottom:11}}>
          <div style={{width:29,height:29,borderRadius:'50%',background:'linear-gradient(135deg,#2a2a42,#1a1a2e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:'#9090b0',flexShrink:0,border:`1px solid ${T.border}`}}>{p.hi||'?'}</div>
          <div style={{minWidth:0,flex:1}}>
            <div style={{fontSize:12,color:T.text,fontWeight:700}}>{p.host} <span style={{color:T.gold,fontWeight:600}}>⭐{p.rating}</span></div>
            <div style={{fontSize:11,color:'#44445a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.bio}</div>
          </div>
        </div>
        <div style={{display:'flex',gap:3,marginBottom:11,alignItems:'center'}}>
          {Array.from({length:p.spots}).map((_,i)=>(
            <div key={i} style={{flex:1,height:5,borderRadius:3,background:i<p.joined?`linear-gradient(90deg,${T.gold},#ff9f43)`:'#1e1e30',transition:'background .3s'}}/>
          ))}
          <span style={{fontSize:10,color:spotsLeft>0?T.dim:T.red,marginLeft:6,fontWeight:600,flexShrink:0}}>{spotsLeft>0?`${spotsLeft} left`:'Full'}</span>
        </div>
        <button onClick={onBook} className='btn-h' style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'9px 12px',borderRadius:9,marginBottom:8,width:'100%',background:ci?ci.color+'15':'#1e1e30',border:`1px solid ${ci?ci.color+'44':T.border}`,color:ci?ci.color:'#6b6b8a',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'system-ui,sans-serif'}}>
          <span style={{fontSize:15}}>{ci?.logo||'🎟️'}</span><span>Book at {p.cinema}</span><span style={{marginLeft:'auto',fontSize:11}}>→</span>
        </button>
        {!isHost&&(
          <div style={{display:'flex',gap:6}}>
            <button onClick={onJoin} disabled={spotsLeft===0||joined} className={spotsLeft>0&&!joined?'btn-h':''} style={{flex:1,padding:'9px',borderRadius:9,border:'none',cursor:spotsLeft===0||joined?'default':'pointer',fontSize:12,fontWeight:700,fontFamily:'system-ui,sans-serif',
              background:joined?'rgba(6,214,160,.12)':spotsLeft===0?'#1a1a2e':'linear-gradient(135deg,#ffd93d,#ff9f43)',
              color:joined?T.green:spotsLeft===0?'#44445a':T.bg,
              boxShadow:joined||spotsLeft===0?'none':'0 4px 12px rgba(255,217,61,.2)'}}>
              {joined?'✅ Joined':spotsLeft===0?'Full':'Join Outing'}
            </button>
            {!reported
              ?<button onClick={onReport} title='Report post' className='btn-h' style={{padding:'9px 11px',borderRadius:9,border:`1px solid ${T.border}`,background:'transparent',color:'#3a3a5a',cursor:'pointer',fontSize:12}}>🚩</button>
              :<span style={{fontSize:10,color:T.red,padding:'9px 6px',fontWeight:600}}>Reported</span>}
          </div>
        )}
        {isHost&&<div style={{textAlign:'center',fontSize:12,color:T.dim,padding:'7px 0',fontWeight:600}}>👑 Your outing · {p.joined} joined</div>}
      </div>
    </div>
  );
}

/* ── helpers ── */
const Wrap    =({children,narrow})=><div className='fade' style={{maxWidth:narrow?700:1100,margin:'0 auto',padding:'28px 16px'}}>{children}</div>;
const PH      =({title,sub})=><div style={{marginBottom:22}}><h2 style={{fontSize:22,fontWeight:800,color:T.text,margin:'0 0 4px',letterSpacing:'-0.5px'}}>{title}</h2><p style={{fontSize:13,color:T.dim,margin:0}}>{sub}</p></div>;
const Grid    =({children})=><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(285px,1fr))',gap:15}}>{children}</div>;
const Empty   =({icon='🎬',label,act,onAct})=><div style={{textAlign:'center',padding:'56px 0',color:T.dim}}><div style={{fontSize:42,marginBottom:12}}>{icon}</div><div style={{marginBottom:16,fontSize:15}}>{label}</div>{act&&<button onClick={onAct} className='btn-h' style={{...Btn('linear-gradient(135deg,#ffd93d,#ff9f43)',T.bg),borderRadius:10}}>{act}</button>}</div>;
const NoData  =({msg,cta,onCta})=><div style={{textAlign:'center',padding:'24px',color:T.dim,fontSize:14}}>{msg} <span style={{color:T.gold,cursor:'pointer',fontWeight:600}} onClick={onCta}>{cta}</span></div>;
const FSel    =({label,value,set,opts})=><div><div style={{fontSize:11,color:T.dim,marginBottom:5,fontWeight:600,textTransform:'uppercase',letterSpacing:.5}}>{label}</div><select value={value} onChange={e=>set(e.target.value)} style={{...inp,width:'auto',minWidth:130}}>{opts.map(o=><option key={o}>{o}</option>)}</select></div>;
const FL      =({children})=><div style={{fontSize:12,color:T.dim,marginBottom:5,fontWeight:500}}>{children}</div>;
const SL      =({children})=><div style={{fontSize:11,color:T.gold,fontWeight:700,letterSpacing:2.5,marginBottom:13,textTransform:'uppercase'}}>{children}</div>;
const AB      =({children,col,onClick})=><button onClick={onClick} className='btn-h' style={{padding:'4px 10px',background:col+'18',color:col,border:`1px solid ${col}33`,borderRadius:7,cursor:'pointer',fontSize:11,fontWeight:600,fontFamily:'system-ui,sans-serif'}}>{children}</button>;
const Tabs    =({tabs,active,set})=><div style={{display:'flex',gap:3,marginBottom:18,background:T.card,padding:5,borderRadius:12,border:`1px solid ${T.border}`,width:'fit-content',flexWrap:'wrap'}}>{tabs.map(([t,l])=><button key={t} onClick={()=>set(t)} style={{padding:'7px 13px',borderRadius:9,border:'none',cursor:'pointer',fontSize:12,fontFamily:'system-ui,sans-serif',fontWeight:600,background:active===t?'linear-gradient(135deg,#ffd93d22,#ff6b9d22)':'transparent',color:active===t?T.gold:'#6b6b8a',borderBottom:active===t?`2px solid ${T.gold}`:'2px solid transparent'}}>{l}</button>)}</div>;
const InfoBox =({icon,title,sub,col,children})=><div style={{background:`linear-gradient(135deg,${col}08,${col}04)`,borderRadius:14,padding:'28px',border:`1px solid ${col}33`,textAlign:'center',marginBottom:20}}><div style={{fontSize:38,marginBottom:12}}>{icon}</div><div style={{fontSize:16,fontWeight:800,color:col,marginBottom:8}}>{title}</div><div style={{fontSize:14,color:T.dim,marginBottom:20,lineHeight:1.6}}>{sub}</div>{children}</div>;
const Modal   =({children,onClose,wide})=>(
  <div className='fade' style={{position:'fixed',inset:0,background:'rgba(0,0,0,.85)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',padding:16,overflowY:'auto',backdropFilter:'blur(8px)'}} onClick={onClose}>
    <div style={{background:'#12121e',borderRadius:18,padding:'26px',maxWidth:wide?540:410,width:'100%',border:`1px solid ${T.border}`,position:'relative',margin:'auto',boxShadow:'0 24px 80px rgba(0,0,0,.7)'}} onClick={e=>e.stopPropagation()}>
      <button onClick={onClose} className='btn-h' style={{position:'absolute',top:12,right:14,background:'none',border:'none',color:T.dim,cursor:'pointer',fontSize:18,lineHeight:1}}>✕</button>
      {children}
    </div>
  </div>
);
