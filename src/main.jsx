import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{minHeight:'100vh',background:'#0a0a12',color:'#f0eeff',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16,padding:24,fontFamily:'system-ui,sans-serif'}}>
        <div style={{fontSize:40}}>⚠️</div>
        <div style={{fontSize:20,fontWeight:700,color:'#ffd93d'}}>Something went wrong</div>
        <div style={{fontSize:13,color:'#6b6b8a',maxWidth:500,textAlign:'center',lineHeight:1.6}}>
          The app crashed on startup. This is usually caused by missing environment variables in Vercel.
        </div>
        <div style={{background:'#1a1a2e',borderRadius:10,padding:'16px 20px',border:'1px solid #2a2a3a',maxWidth:600,width:'100%'}}>
          <div style={{fontSize:12,color:'#ff4757',fontWeight:700,marginBottom:8}}>Error:</div>
          <div style={{fontSize:12,color:'#9090b0',fontFamily:'monospace',wordBreak:'break-all'}}>
            {this.state.error?.message || String(this.state.error)}
          </div>
        </div>
        <div style={{background:'#1a1400',borderRadius:10,padding:'16px 20px',border:'1px solid rgba(255,217,61,.3)',maxWidth:600,width:'100%'}}>
          <div style={{fontSize:12,color:'#ffd93d',fontWeight:700,marginBottom:8}}>How to fix:</div>
          <div style={{fontSize:12,color:'#9090b0',lineHeight:1.8}}>
            1. Go to vercel.com → your project → Settings → Environment Variables<br/>
            2. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are added<br/>
            3. Click Deployments → Redeploy<br/>
            4. If no Supabase yet, remove the import in src/lib/supabase.js
          </div>
        </div>
        <button onClick={()=>window.location.reload()} style={{padding:'10px 24px',background:'#ffd93d',color:'#0a0a12',border:'none',borderRadius:9,cursor:'pointer',fontSize:14,fontWeight:700}}>
          Retry
        </button>
      </div>
    );
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
