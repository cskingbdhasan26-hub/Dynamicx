import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Plus, Key, ArrowLeft, Trash2, Copy, User, Edit, X, CheckCircle, AlertTriangle, Package } from 'lucide-react';
import AdminNavbar from '../../components/AdminNavbar';

// ─── Edit Key Modal ──────────────────────────────────────────────────
const EditKeyModal = ({ keyItem, softwareList, onClose, onSave }) => {
  const [keyVal,   setKeyVal]   = useState(keyItem.key);
  const [softId,   setSoftId]   = useState(keyItem.softwareId);
  const [duration, setDuration] = useState(keyItem.duration);
  const [status,   setStatus]   = useState(keyItem.status);
  const [focused,  setFocused]  = useState('');
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const currentSoft = softwareList.find(s => s.id === softId);

  const allPlans = [
    { label: '1 Day',    value: '1 Day',    field: 'oneDay' },
    { label: '7 Days',   value: '7 Days',   field: 'sevenDays' },
    { label: '10 Days',  value: '10 Days',  field: 'tenDays' },
    { label: '15 Days',  value: '15 Days',  field: 'fifteenDays' },
    { label: '30 Days',  value: '30 Days',  field: 'thirtyDays' },
    { label: '365 Days', value: '365 Days', field: 'oneYear' },
  ].filter(p => currentSoft?.prices?.[p.field] > 0);

  const handleSave = async () => {
    if (!keyVal.trim()) { alert("Key cannot be empty."); return; }
    setSaving(true);
    try {
      await updateDoc(doc(db, "keys", keyItem.id), {
        key:          keyVal.trim(),
        softwareId:   softId,
        softwareName: currentSoft?.name || keyItem.softwareName,
        duration,
        status,
      });
      onSave();
    } catch (err) {
      alert("Error: " + err.message);
    } finally { setSaving(false); }
  };

  const inp = (name) => ({
    width:'100%', boxSizing:'border-box', padding:'11px 13px',
    background: focused===name ? 'rgba(124,58,237,0.05)' : 'rgba(6,6,18,0.85)',
    border: focused===name ? '1px solid rgba(124,58,237,0.6)' : '1px solid rgba(55,48,80,0.7)',
    borderRadius:'10px', color:'white',
    fontSize:'13px', fontFamily: name==='key' ? "'DM Mono',monospace" : "'DM Sans',sans-serif",
    outline:'none', transition:'all 0.2s',
    boxShadow: focused===name ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
    appearance:'none', WebkitAppearance:'none',
  });

  const lbl = { display:'block', marginBottom:'7px', fontFamily:"'DM Sans',sans-serif", fontSize:'11px', fontWeight:500, color:'rgba(156,163,175,0.75)', letterSpacing:'0.05em' };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', animation:'fadeIn 0.18s ease' }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:'480px', background:'linear-gradient(160deg,rgba(18,14,38,0.99),rgba(10,8,24,1))', border:'1px solid rgba(124,58,237,0.22)', borderRadius:'22px', boxShadow:'0 40px 100px rgba(0,0,0,0.7)', overflow:'hidden', animation:'slideUp 0.22s cubic-bezier(.16,1,.3,1)', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ height:'1px', background:'linear-gradient(90deg,transparent 5%,rgba(124,58,237,0.55) 50%,transparent 95%)' }} />
        <div style={{ padding:'26px 28px 24px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'22px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:'rgba(129,140,248,0.1)', border:'1px solid rgba(129,140,248,0.22)', display:'flex', alignItems:'center', justifyContent:'center', color:'#818cf8' }}><Edit size={18}/></div>
              <div>
                <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:'15px', fontWeight:700, color:'white', margin:'0 0 3px', letterSpacing:'0.03em' }}>Edit Key</h3>
                <p style={{ fontFamily:"'DM Mono',monospace", fontSize:'11px', color:'rgba(107,114,128,0.7)', margin:0 }}>{keyItem.key.length>28 ? keyItem.key.slice(0,28)+'…' : keyItem.key}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'7px', color:'#6b7280', cursor:'pointer', display:'flex' }}><X size={15}/></button>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div>
              <label style={lbl}>License Key</label>
              <input type="text" value={keyVal} onChange={e=>setKeyVal(e.target.value)} onFocus={()=>setFocused('key')} onBlur={()=>setFocused('')} style={inp('key')} placeholder="XXXX-XXXX-XXXX-XXXX"/>
            </div>
            <div>
              <label style={lbl}>Software</label>
              <div style={{ position:'relative' }}>
                <select value={softId} onChange={e=>{setSoftId(e.target.value);setDuration('');}} onFocus={()=>setFocused('soft')} onBlur={()=>setFocused('')} style={inp('soft')}>
                  {softwareList.map(s=><option key={s.id} value={s.id} style={{background:'#0d0b1f'}}>{s.name}</option>)}
                </select>
                <div style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'rgba(107,114,128,0.6)' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </div>
            </div>
            {allPlans.length > 0 && (
              <div>
                <label style={lbl}>Duration</label>
                <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(allPlans.length,3)},1fr)`, gap:'7px' }}>
                  {allPlans.map(plan => (
                    <label key={plan.value} onClick={()=>setDuration(plan.value)} style={{ cursor:'pointer', borderRadius:'8px', padding:'7px 4px 6px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:'2px', border: duration===plan.value ? '1px solid rgba(124,58,237,0.75)' : '1px solid rgba(55,48,80,0.65)', background: duration===plan.value ? 'rgba(124,58,237,0.13)' : 'rgba(6,6,18,0.8)', boxShadow: duration===plan.value ? '0 0 0 2px rgba(124,58,237,0.18)' : 'none', transition:'all 0.15s', userSelect:'none' }}>
                      <input type="radio" name="edit-dur" value={plan.value} onChange={()=>setDuration(plan.value)} style={{display:'none'}}/>
                      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'10px', fontWeight:600, color: duration===plan.value ? '#c4b5fd' : 'rgba(156,163,175,0.75)', lineHeight:1 }}>{plan.label}</span>
                      <span style={{ fontFamily:"'Cinzel',serif", fontSize:'10px', fontWeight:700, color: duration===plan.value ? '#a78bfa' : 'rgba(107,114,128,0.6)', lineHeight:1 }}>${currentSoft?.prices?.[plan.field]?.toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label style={lbl}>Status</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                {['available','sold'].map(s => (
                  <label key={s} onClick={()=>setStatus(s)} style={{ cursor:'pointer', borderRadius:'9px', padding:'9px 12px', display:'flex', alignItems:'center', gap:'8px', border: status===s ? (s==='available' ? '1px solid rgba(52,211,153,0.6)' : '1px solid rgba(248,113,113,0.6)') : '1px solid rgba(55,48,80,0.65)', background: status===s ? (s==='available' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)') : 'rgba(6,6,18,0.8)', transition:'all 0.15s', userSelect:'none' }}>
                    <input type="radio" name="edit-status" value={s} onChange={()=>setStatus(s)} style={{display:'none'}}/>
                    <div style={{ width:'7px', height:'7px', borderRadius:'50%', background: s==='available' ? '#34d399' : '#f87171', flexShrink:0 }}/>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', fontWeight:500, color: status===s ? (s==='available' ? '#34d399' : '#f87171') : 'rgba(107,114,128,0.7)' }}>{s==='available' ? 'Available' : 'Sold'}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display:'flex', gap:'10px', marginTop:'22px' }}>
            <button onClick={onClose} style={{ flex:1, padding:'11px', borderRadius:'10px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(156,163,175,0.8)', fontSize:'13px', fontFamily:"'DM Sans',sans-serif", fontWeight:500, cursor:'pointer' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ flex:1, padding:'11px', borderRadius:'10px', background: saving?'rgba(109,40,217,0.35)':'linear-gradient(135deg,#7c3aed,#4f46e5)', border:'none', color:'white', fontSize:'13px', fontFamily:"'Cinzel',serif", fontWeight:600, letterSpacing:'0.04em', cursor: saving?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', boxShadow: saving?'none':'0 6px 20px rgba(124,58,237,0.35)', transition:'all 0.2s' }}>
              {saving ? <><div style={{ width:'13px', height:'13px', border:'2px solid rgba(255,255,255,0.25)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.65s linear infinite' }}/>Saving...</> : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ────────────────────────────────────────────
const DeleteModal = ({ keyItem, onClose, onConfirm }) => (
  <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', animation:'fadeIn 0.18s ease' }}>
    <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:'380px', background:'linear-gradient(160deg,rgba(18,14,38,0.99),rgba(10,8,24,1))', border:'1px solid rgba(248,113,113,0.2)', borderRadius:'20px', boxShadow:'0 40px 100px rgba(0,0,0,0.7)', overflow:'hidden', animation:'slideUp 0.22s cubic-bezier(.16,1,.3,1)' }}>
      <div style={{ height:'1px', background:'linear-gradient(90deg,transparent 5%,rgba(248,113,113,0.4) 50%,transparent 95%)'}}/>
      <div style={{ padding:'24px 26px 22px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
          <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'#f87171' }}><Trash2 size={18}/></div>
          <div>
            <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:'15px', fontWeight:700, color:'white', margin:'0 0 3px' }}>Delete Key</h3>
            <p style={{ fontFamily:"'DM Mono',monospace", fontSize:'11px', color:'rgba(107,114,128,0.7)', margin:0 }}>{keyItem.key.length>26 ? keyItem.key.slice(0,26)+'…' : keyItem.key}</p>
          </div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', padding:'12px 14px', marginBottom:'18px', display:'flex', gap:'9px', alignItems:'flex-start' }}>
          <AlertTriangle size={14} color="rgba(251,191,36,0.7)" style={{ flexShrink:0, marginTop:'1px' }}/>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', color:'rgba(156,163,175,0.8)', margin:0, lineHeight:1.6, fontWeight:300 }}>This action is permanent and cannot be undone.</p>
        </div>
        <div style={{ display:'flex', gap:'9px' }}>
          <button onClick={onClose} style={{ flex:1, padding:'11px', borderRadius:'10px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(156,163,175,0.8)', fontSize:'13px', fontFamily:"'DM Sans',sans-serif", cursor:'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex:1, padding:'11px', borderRadius:'10px', background:'linear-gradient(135deg,#dc2626,#b91c1c)', border:'none', color:'white', fontSize:'13px', fontFamily:"'Cinzel',serif", fontWeight:600, cursor:'pointer', boxShadow:'0 6px 20px rgba(220,38,38,0.35)' }}>Delete</button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────
const Keys = () => {
  const [softwareList, setSoftwareList] = useState([]);
  const [allKeys,      setAllKeys]      = useState([]);
  const [usersMap,     setUsersMap]     = useState({});
  const [mounted,      setMounted]      = useState(false);
  const [editKey,      setEditKey]      = useState(null);
  const [deleteKey,    setDeleteKey]    = useState(null);
  const [toast,        setToast]        = useState({ show:false, message:'' });
  const [filterSoft,   setFilterSoft]   = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setTimeout(() => setMounted(true), 80);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    const us = onSnapshot(collection(db,"software"), s=>setSoftwareList(s.docs.map(d=>({id:d.id,...d.data()}))));
    const uk = onSnapshot(collection(db,"keys"),     s=>setAllKeys(s.docs.map(d=>({id:d.id,...d.data()}))));
    const uu = onSnapshot(collection(db,"users"),    s=>{ const m={}; s.docs.forEach(d=>{m[d.id]=d.data().email;}); setUsersMap(m); });
    return () => { us(); uk(); uu(); };
  }, []);

  const showToast = (msg) => { setToast({show:true,message:msg}); setTimeout(()=>setToast({show:false,message:''}),2500); };

  const avail      = allKeys.filter(k=>k.status==="available");
  const getCount   = (sid,dur) => avail.filter(k=>k.softwareId===sid&&k.duration===dur).length;
  const getTotal   = (sid)     => avail.filter(k=>k.softwareId===sid).length;
  const handleCopy = (str)     => { navigator.clipboard.writeText(str); showToast("Key copied!"); };
  const handleDel  = async ()  => {
    try { await deleteDoc(doc(db,"keys",deleteKey.id)); showToast("Key deleted!"); }
    catch(e){ alert("Error: "+e.message); }
    setDeleteKey(null);
  };

  const plans = [
    {field:'oneDay',     label:'1 Day',    dur:'1 Day'   },
    {field:'sevenDays',  label:'7 Days',   dur:'7 Days'  },
    {field:'tenDays',    label:'10 Days',  dur:'10 Days' },
    {field:'fifteenDays',label:'15 Days',  dur:'15 Days' },
    {field:'thirtyDays', label:'30 Days',  dur:'30 Days' },
    {field:'oneYear',    label:'365 Days', dur:'365 Days'},
  ];

  // ✅ Sold উপরে (latest first), Available নিচে
  const filtered = allKeys
    .filter(k => {
      if (filterSoft   !== 'all' && k.softwareId !== filterSoft)  return false;
      if (filterStatus !== 'all' && k.status     !== filterStatus) return false;
      return true;
    })
    .sort((a, b) => {
      // Sold সবার আগে
      if (a.status === 'sold' && b.status !== 'sold') return -1;
      if (a.status !== 'sold' && b.status === 'sold') return 1;
      // Sold গুলোর মধ্যে সবচেয়ে নতুন purchase সবার উপরে
      if (a.status === 'sold' && b.status === 'sold') {
        const aTime = a.soldAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0;
        const bTime = b.soldAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      }
      return 0;
    });

  const badge = (status) => {
    const ok = status==='available';
    return <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', background: ok?'rgba(52,211,153,0.1)':'rgba(248,113,113,0.1)', border:`1px solid ${ok?'rgba(52,211,153,0.25)':'rgba(248,113,113,0.25)'}`, color: ok?'#34d399':'#f87171', borderRadius:'100px', padding:'3px 10px', fontSize:'11px', fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}><span style={{ width:'5px', height:'5px', borderRadius:'50%', background: ok?'#34d399':'#f87171' }}/>{ok?'Available':'Sold'}</span>;
  };

  const selStyle = { padding:'8px 28px 8px 11px', borderRadius:'9px', background:'rgba(6,6,18,0.8)', border:'1px solid rgba(55,48,80,0.7)', color:'rgba(209,213,219,0.85)', fontSize:'12px', fontFamily:"'DM Sans',sans-serif", outline:'none', cursor:'pointer', appearance:'none', WebkitAppearance:'none' };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeIn  {from{opacity:0}to{opacity:1}}
        @keyframes slideUp {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp  {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin    {to{transform:rotate(360deg)}}
        .key-row{transition:background 0.15s}
        .key-row:hover{background:rgba(124,58,237,0.04)!important}
        .ic-btn{width:29px;height:29px;border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid transparent;transition:all 0.15s;background:transparent}
        .ic-btn-copy:hover{color:#818cf8!important;background:rgba(129,140,248,0.1);border-color:rgba(129,140,248,0.25)}
        .ic-btn-edit:hover{color:#a78bfa!important;background:rgba(167,139,250,0.1);border-color:rgba(167,139,250,0.25)}
        .ic-btn-del:hover{color:#f87171!important;background:rgba(248,113,113,0.1);border-color:rgba(248,113,113,0.25)}
        .ov-card{transition:transform 0.2s}
        .ov-card:hover{transform:translateY(-2px)}
        select option{background:#0d0b1f;color:white}
        @media(max-width:1024px){.ov-grid{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:600px){.ov-grid{grid-template-columns:1fr!important}.page-inner{padding:88px 14px 40px!important}}
        @media(max-width:680px){
          .kt th:nth-child(3),.kt td:nth-child(3),
          .kt th:nth-child(5),.kt td:nth-child(5){display:none}
        }
      `}</style>

      <div style={{ minHeight:'100vh', background:'#06060f', fontFamily:"'DM Sans',sans-serif", position:'relative', overflow:'hidden' }}>
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, backgroundImage:`linear-gradient(rgba(124,58,237,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.03) 1px,transparent 1px)`, backgroundSize:'44px 44px' }}/>
        <div style={{ position:'fixed', top:'-200px', left:'-200px', zIndex:0, width:'600px', height:'600px', borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle,rgba(109,40,217,0.14) 0%,transparent 65%)' }}/>
        <div style={{ position:'fixed', bottom:'-150px', right:'-150px', zIndex:0, width:'500px', height:'500px', borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle,rgba(79,70,229,0.1) 0%,transparent 65%)' }}/>

        <AdminNavbar/>

        <div className="page-inner" style={{ position:'relative', zIndex:1, maxWidth:'1280px', margin:'0 auto', padding:'96px 32px 48px', opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(16px)', transition:'opacity 0.5s ease,transform 0.5s ease' }}>

          <button onClick={()=>navigate('/admin')} style={{ display:'flex', alignItems:'center', gap:'6px', background:'none', border:'none', color:'rgba(107,114,128,0.8)', fontSize:'13px', fontFamily:"'DM Sans',sans-serif", cursor:'pointer', marginBottom:'28px', padding:0, transition:'color 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.color='white'}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(107,114,128,0.8)'}
          ><ArrowLeft size={15}/> Back to Dashboard</button>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'32px', flexWrap:'wrap', gap:'16px' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                <div style={{ width:'28px', height:'1px', background:'rgba(124,58,237,0.55)' }}/>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#7c3aed', letterSpacing:'0.12em', fontWeight:500 }}>License Keys</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                <div style={{ width:'46px', height:'46px', borderRadius:'13px', background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.22)', display:'flex', alignItems:'center', justifyContent:'center', color:'#34d399' }}><Key size={22}/></div>
                <div>
                  <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:'24px', fontWeight:700, color:'white', margin:'0 0 4px', letterSpacing:'0.04em' }}>Key Management</h1>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'13px', color:'rgba(107,114,128,0.85)', margin:0, fontWeight:300 }}>Add, edit, and manage all license keys</p>
                </div>
              </div>
            </div>
            <button onClick={()=>navigate('/admin/add-keys')} style={{ display:'flex', alignItems:'center', gap:'7px', padding:'10px 18px', borderRadius:'11px', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', border:'none', color:'white', fontSize:'13px', fontFamily:"'Cinzel',serif", fontWeight:600, letterSpacing:'0.04em', cursor:'pointer', boxShadow:'0 6px 20px rgba(124,58,237,0.35)', transition:'all 0.2s' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 10px 28px rgba(124,58,237,0.45)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 6px 20px rgba(124,58,237,0.35)'}}
            ><Plus size={15}/> Add Keys</button>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
            <div style={{ width:'22px', height:'1px', background:'rgba(124,58,237,0.55)' }}/>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#7c3aed', letterSpacing:'0.12em', fontWeight:500 }}>Software Overview</span>
          </div>
          <div className="ov-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'36px' }}>
            {softwareList.map((soft,idx) => (
              <div key={soft.id} className="ov-card" style={{ background:'linear-gradient(145deg,rgba(18,14,38,0.96),rgba(10,8,24,0.98))', border:'1px solid rgba(124,58,237,0.13)', borderRadius:'18px', overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.3)', animation:`fadeUp 0.5s ease ${idx*0.06}s both` }}>
                <div style={{ height:'1px', background:'linear-gradient(90deg,transparent 5%,rgba(124,58,237,0.28) 50%,transparent 95%)' }}/>
                <div style={{ padding:'16px 18px' }}>
                  <div style={{ display:'flex', gap:'12px', alignItems:'center', marginBottom:'12px' }}>
                    <div style={{ width:'42px', height:'42px', borderRadius:'10px', background:'rgba(6,6,18,0.8)', border:'1px solid rgba(55,48,80,0.5)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {soft.imageUrl ? <img src={soft.imageUrl} alt={soft.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <Package size={16} color="rgba(107,114,128,0.4)"/>}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:'12px', fontWeight:700, color:'white', margin:'0 0 3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{soft.name}</h3>
                      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#34d399', fontWeight:500 }}>{getTotal(soft.id)} available</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                    {plans.map(p => soft.prices?.[p.field]>0 ? (
                      <div key={p.field} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 10px', background:'rgba(6,6,18,0.5)', borderRadius:'7px', border:'1px solid rgba(55,48,80,0.4)' }}>
                        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'rgba(156,163,175,0.7)', fontWeight:500 }}>{p.label}</span>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'rgba(129,140,248,0.8)', fontWeight:500 }}>{getCount(soft.id,p.dur)} keys</span>
                          <span style={{ fontFamily:"'Cinzel',serif", fontSize:'11px', fontWeight:700, color:'white' }}>${soft.prices[p.field].toFixed(2)}</span>
                        </div>
                      </div>
                    ) : null)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px', flexWrap:'wrap', gap:'12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <div style={{ width:'22px', height:'1px', background:'rgba(124,58,237,0.55)' }}/>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#7c3aed', letterSpacing:'0.12em', fontWeight:500 }}>All Keys</span>
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:'12px', color:'rgba(107,114,128,0.6)', marginLeft:'4px' }}>({filtered.length})</span>
            </div>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {[
                { val:filterSoft, set:setFilterSoft, opts:[{v:'all',l:'All Software'},...softwareList.map(s=>({v:s.id,l:s.name}))] },
                { val:filterStatus, set:setFilterStatus, opts:[{v:'all',l:'All Status'},{v:'available',l:'Available'},{v:'sold',l:'Sold'}] },
              ].map((f,i) => (
                <div key={i} style={{ position:'relative' }}>
                  <select value={f.val} onChange={e=>f.set(e.target.value)} style={selStyle}>
                    {f.opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                  <div style={{ position:'absolute', right:'9px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'rgba(107,114,128,0.5)' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:'linear-gradient(145deg,rgba(18,14,38,0.96),rgba(10,8,24,0.98))', border:'1px solid rgba(124,58,237,0.13)', borderRadius:'20px', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.4)', animation:'fadeUp 0.5s ease 0.2s both' }}>
            <div style={{ height:'1px', background:'linear-gradient(90deg,transparent 5%,rgba(124,58,237,0.35) 50%,transparent 95%)' }}/>
            <div style={{ overflowX:'auto' }}>
              <table className="kt" style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'rgba(6,6,18,0.6)' }}>
                    {['Software','License Key','Duration','Status','Buyer','Actions'].map((h,i)=>(
                      <th key={h} style={{ padding:'13px 16px', fontFamily:"'DM Sans',sans-serif", fontSize:'10px', fontWeight:500, color:'rgba(107,114,128,0.7)', letterSpacing:'0.1em', textTransform:'uppercase', borderBottom:'1px solid rgba(124,58,237,0.1)', textAlign:i===5?'right':'left', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length===0 ? (
                    <tr><td colSpan="6" style={{ padding:'48px', textAlign:'center', fontFamily:"'DM Sans',sans-serif", color:'rgba(107,114,128,0.5)', fontSize:'13px', fontWeight:300 }}>No keys found.</td></tr>
                  ) : filtered.map((k,idx) => (
                    <tr key={k.id} className="key-row" style={{ borderBottom:'1px solid rgba(124,58,237,0.07)', background: k.status==='sold' ? 'rgba(248,113,113,0.02)' : 'transparent' }}>
                      <td style={{ padding:'12px 16px', fontFamily:"'DM Sans',sans-serif", fontSize:'12px', color:'rgba(209,213,219,0.85)', fontWeight:500, whiteSpace:'nowrap' }}>{k.softwareName}</td>
                      <td style={{ padding:'12px 16px', fontFamily:"'DM Mono',monospace", fontSize:'12px', color:'#818cf8', letterSpacing:'0.04em', maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{k.key}</td>
                      <td style={{ padding:'12px 16px', whiteSpace:'nowrap' }}>
                        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'rgba(107,114,128,0.8)', background:'rgba(55,48,80,0.35)', border:'1px solid rgba(55,48,80,0.5)', borderRadius:'6px', padding:'3px 8px', fontWeight:500 }}>{k.duration}</span>
                      </td>
                      <td style={{ padding:'12px 16px' }}>{badge(k.status)}</td>
                      <td style={{ padding:'12px 16px' }}>
                        {k.status==='sold' && k.buyerId ? (
                          <div style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(129,140,248,0.08)', border:'1px solid rgba(129,140,248,0.2)', borderRadius:'7px', padding:'4px 9px', width:'max-content' }}>
                            <User size={11} color="#818cf8"/>
                            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#818cf8', fontWeight:400 }}>{usersMap[k.buyerId]||'Unknown'}</span>
                          </div>
                        ) : <span style={{ color:'rgba(107,114,128,0.4)', fontSize:'13px' }}>—</span>}
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', justifyContent:'flex-end', gap:'4px' }}>
                          <button className="ic-btn ic-btn-copy" onClick={()=>handleCopy(k.key)} title="Copy"  style={{ color:'rgba(107,114,128,0.55)' }}><Copy  size={13}/></button>
                          <button className="ic-btn ic-btn-edit" onClick={()=>setEditKey(k)}     title="Edit"  style={{ color:'rgba(107,114,128,0.55)' }}><Edit  size={13}/></button>
                          <button className="ic-btn ic-btn-del"  onClick={()=>setDeleteKey(k)}   title="Delete"style={{ color:'rgba(107,114,128,0.55)' }}><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {editKey   && <EditKeyModal keyItem={editKey} softwareList={softwareList} onClose={()=>setEditKey(null)} onSave={()=>{setEditKey(null);showToast("Key updated successfully!");}}/>}
      {deleteKey && <DeleteModal  keyItem={deleteKey} onClose={()=>setDeleteKey(null)} onConfirm={handleDel}/>}

      <div style={{ position:'fixed', bottom:'28px', right:'28px', zIndex:200, display:'flex', alignItems:'center', gap:'10px', background:'linear-gradient(135deg,rgba(5,150,105,0.15),rgba(4,120,87,0.1))', border:'1px solid rgba(52,211,153,0.3)', borderRadius:'12px', padding:'12px 18px', backdropFilter:'blur(12px)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)', opacity:toast.show?1:0, transform:toast.show?'translateY(0)':'translateY(12px)', transition:'all 0.3s ease', pointerEvents:'none' }}>
        <CheckCircle size={16} color="#34d399"/>
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'13px', color:'rgba(255,255,255,0.85)', fontWeight:400 }}>{toast.message}</span>
      </div>
    </>
  );
};

export default Keys;