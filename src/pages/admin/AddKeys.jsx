import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Key, Database, ArrowLeft, CheckCircle, AlertCircle, X } from 'lucide-react';
import AdminNavbar from '../../components/AdminNavbar';

const AlertModal = ({ modal, onClose }) => {
  useEffect(() => {
    if (modal.show) {
      document.body.style.overflow = 'hidden';
      const handler = (e) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', handler);
      return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handler); };
    }
  }, [modal.show, onClose]);

  if (!modal.show) return null;

  const isError   = modal.type === 'error';
  const isWarning = modal.type === 'warning';
  const accent    = isError ? '#f87171' : isWarning ? '#fbbf24' : '#a78bfa';
  const bg        = isError ? 'rgba(248,113,113,0.08)' : isWarning ? 'rgba(251,191,36,0.07)' : 'rgba(124,58,237,0.08)';
  const border    = isError ? 'rgba(248,113,113,0.28)' : isWarning ? 'rgba(251,191,36,0.28)' : 'rgba(124,58,237,0.28)';

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', animation:'fadeIn 0.15s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:'360px', background:'linear-gradient(145deg, rgba(18,14,38,0.99), rgba(8,6,20,1))', border:`1px solid ${border}`, borderRadius:'20px', overflow:'hidden', boxShadow:`0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)`, animation:'slideUp 0.22s cubic-bezier(0.34,1.4,0.64,1)' }}>
        <div style={{ height:'2px', background:`linear-gradient(90deg, transparent 10%, ${accent} 50%, transparent 90%)` }} />
        <div style={{ padding:'26px 26px 22px' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'18px' }}>
            <div style={{ width:'42px', height:'42px', borderRadius:'11px', background:bg, border:`1px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <AlertCircle size={20} color={accent} />
            </div>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(107,114,128,0.45)', padding:'4px', display:'flex', transition:'color 0.15s', marginTop:'-2px' }}
              onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.8)'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(107,114,128,0.45)'}
            ><X size={15} /></button>
          </div>
          <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:'15px', fontWeight:700, color:'white', margin:'0 0 8px', letterSpacing:'0.04em' }}>{modal.title || 'Notice'}</h3>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'13px', color:'rgba(156,163,175,0.85)', margin:'0 0 22px', fontWeight:300, lineHeight:1.65 }}>{modal.message}</p>
          <button onClick={onClose} style={{ width:'100%', padding:'11px', borderRadius:'10px', border:`1px solid ${border}`, background: bg, color: accent, fontSize:'12px', fontFamily:"'Cinzel',serif", fontWeight:600, letterSpacing:'0.08em', cursor:'pointer', transition:'all 0.16s' }}
            onMouseEnter={e => { e.currentTarget.style.background = isError ? 'rgba(248,113,113,0.16)' : isWarning ? 'rgba(251,191,36,0.14)' : 'rgba(124,58,237,0.16)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = bg; }}
          >Understood</button>
        </div>
      </div>
    </div>
  );
};

const AddKeys = () => {
  const [softwareList, setSoftwareList] = useState([]);
  const [selectedSoft, setSelectedSoft] = useState('');
  const [duration, setDuration]         = useState('');
  const [keysInput, setKeysInput]       = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [focused, setFocused]           = useState('');
  const [mounted, setMounted]           = useState(false);
  const [toast, setToast]               = useState({ show: false, message: '' });
  const [modal, setModal]               = useState({ show: false, type: 'warning', title: '', message: '' });
  const navigate = useNavigate();

  const showAlert  = (title, message, type = 'warning') => setModal({ show: true, type, title, message });
  const closeAlert = () => setModal(m => ({ ...m, show: false }));

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setTimeout(() => setMounted(true), 80);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    const fetchSoftware = async () => {
      const snapshot = await getDocs(collection(db, "software"));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setSoftwareList(data.filter(s => s.active));
    };
    fetchSoftware();
  }, []);

  const currentSoftware = softwareList.find(s => s.id === selectedSoft);

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 2800);
  };

  const keyCount = keysInput.split('\n').filter(k => k.trim() !== '').length;

  const handleAddKeys = async (e) => {
    e.preventDefault();
    if (!selectedSoft)     return showAlert('Select Software', 'Please choose a software product first.', 'warning');
    if (!duration)         return showAlert('Select Duration', 'Please select a duration plan for the keys.', 'warning');
    if (!keysInput.trim()) return showAlert('No Keys Found',   'Please paste at least one license key.', 'warning');

    const keysArray = keysInput.split('\n').map(k => k.trim()).filter(k => k !== '');
    if (keysArray.length === 0)
      return showAlert('No Keys Found', 'No valid keys detected. Make sure each key is on its own line.', 'warning');

    setIsLoading(true);
    try {
      const batch = writeBatch(db);
      keysArray.forEach(keyStr => {
        const ref = doc(collection(db, "keys"));
        batch.set(ref, {
          softwareId:   selectedSoft,
          softwareName: currentSoftware.name,
          duration, key: keyStr,
          status: "available",
          createdAt: serverTimestamp(),
        });
      });
      await batch.commit();
      showToast(`${keysArray.length} keys uploaded successfully!`);
      setKeysInput('');
      setDuration('');
      setTimeout(() => navigate('/admin/keys'), 1500);
    } catch (err) {
      showAlert('Upload Failed', err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const allPlans = [
    { label: '1 Day',    value: '1 Day',    field: 'oneDay'      },
    { label: '7 Days',   value: '7 Days',   field: 'sevenDays'   },
    { label: '10 Days',  value: '10 Days',  field: 'tenDays'     },
    { label: '15 Days',  value: '15 Days',  field: 'fifteenDays' },
    { label: '30 Days',  value: '30 Days',  field: 'thirtyDays'  },
    { label: '365 Days', value: '365 Days', field: 'oneYear'     },
  ];

  const durationPlans = allPlans.filter(
    p => currentSoftware?.prices?.[p.field] != null && currentSoftware.prices[p.field] > 0
  );

  const labelStyle = {
    display:'block', marginBottom:'8px',
    fontFamily:"'DM Sans',sans-serif",
    fontSize:'12px', fontWeight:500,
    color:'rgba(156,163,175,0.8)', letterSpacing:'0.04em',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(18px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes spin    { to{transform:rotate(360deg)} }

        .ak-textarea::placeholder { color:rgba(107,114,128,0.35); font-family:'DM Mono',monospace; }
        select option { background:#0d0b1f; color:white; }

        .dur-card {
          cursor:pointer; border-radius:8px; padding:8px 4px 7px;
          text-align:center; display:flex; flex-direction:column;
          align-items:center; gap:3px;
          transition:all 0.15s ease;
          border:1px solid rgba(55,48,80,0.65);
          background:rgba(6,6,18,0.8);
          user-select:none;
        }
        .dur-card:hover { border-color:rgba(124,58,237,0.5); background:rgba(124,58,237,0.07); }
        .dur-card.active {
          border-color:rgba(124,58,237,0.75) !important;
          background:rgba(124,58,237,0.13) !important;
          box-shadow:0 0 0 2px rgba(124,58,237,0.18);
        }

        .submit-btn:hover:not(:disabled) {
          transform:translateY(-2px) !important;
          box-shadow:0 14px 36px rgba(124,58,237,0.45) !important;
        }
        .submit-btn:active:not(:disabled) { transform:translateY(0) !important; }

        @media (max-width:768px) {
          .page-inner { padding:88px 14px 40px !important; }
          .dur-grid   { grid-template-columns:repeat(3,1fr) !important; }
        }
        @media (max-width:420px) {
          .dur-grid   { grid-template-columns:repeat(2,1fr) !important; }
        }
      `}</style>

      <AlertModal modal={modal} onClose={closeAlert} />

      <div style={{ minHeight:'100vh', background:'#06060f', fontFamily:"'DM Sans',sans-serif", position:'relative', overflow:'hidden' }}>
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, backgroundImage:`linear-gradient(rgba(124,58,237,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.03) 1px,transparent 1px)`, backgroundSize:'44px 44px' }} />
        <div style={{ position:'fixed', top:'-200px', left:'-200px', zIndex:0, width:'600px', height:'600px', borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle,rgba(109,40,217,0.14) 0%,transparent 65%)' }} />
        <div style={{ position:'fixed', bottom:'-150px', right:'-150px', zIndex:0, width:'500px', height:'500px', borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle,rgba(79,70,229,0.1) 0%,transparent 65%)' }} />

        <AdminNavbar />

        <div className="page-inner" style={{ position:'relative', zIndex:1, maxWidth:'720px', margin:'0 auto', padding:'96px 32px 48px', opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(16px)', transition:'opacity 0.5s ease, transform 0.5s ease' }}>
          <button onClick={() => navigate('/admin')}
            style={{ display:'flex', alignItems:'center', gap:'6px', background:'none', border:'none', color:'rgba(107,114,128,0.8)', fontSize:'13px', fontFamily:"'DM Sans',sans-serif", cursor:'pointer', marginBottom:'28px', padding:0, transition:'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color='white'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(107,114,128,0.8)'}
          ><ArrowLeft size={15} /> Back to Dashboard</button>

          <div style={{ marginBottom:'28px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
              <div style={{ width:'28px', height:'1px', background:'rgba(124,58,237,0.55)' }} />
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#7c3aed', letterSpacing:'0.12em', fontWeight:500 }}>Keys</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
              <div style={{ width:'46px', height:'46px', borderRadius:'13px', background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.22)', display:'flex', alignItems:'center', justifyContent:'center', color:'#34d399' }}>
                <Database size={22} />
              </div>
              <div>
                <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:'24px', fontWeight:700, color:'white', margin:'0 0 4px', letterSpacing:'0.04em' }}>Add License Keys</h1>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'13px', color:'rgba(107,114,128,0.85)', margin:0, fontWeight:300 }}>Bulk upload keys for your software products</p>
              </div>
            </div>
          </div>

          <div style={{ background:'linear-gradient(145deg,rgba(18,14,38,0.96),rgba(10,8,24,0.98))', border:'1px solid rgba(124,58,237,0.15)', borderRadius:'22px', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.03)', animation:'fadeUp 0.5s ease 0.1s both' }}>
            <div style={{ height:'1px', background:'linear-gradient(90deg,transparent 5%,rgba(124,58,237,0.4) 50%,transparent 95%)' }} />

            <form onSubmit={handleAddKeys} style={{ padding:'28px 32px', display:'flex', flexDirection:'column', gap:'22px' }}>

              {/* Software select */}
              <div>
                <label style={labelStyle}>Select Software</label>
                <div style={{ position:'relative' }}>
                  <select value={selectedSoft} onChange={e => { setSelectedSoft(e.target.value); setDuration(''); }} onFocus={() => setFocused('soft')} onBlur={() => setFocused('')}
                    style={{ width:'100%', boxSizing:'border-box', padding:'12px 36px 12px 14px', background:focused==='soft'?'rgba(124,58,237,0.05)':'rgba(6,6,18,0.8)', border:focused==='soft'?'1px solid rgba(124,58,237,0.6)':'1px solid rgba(55,48,80,0.7)', borderRadius:'12px', color:selectedSoft?'white':'rgba(107,114,128,0.5)', fontSize:'14px', fontFamily:"'DM Sans',sans-serif", outline:'none', cursor:'pointer', transition:'all 0.2s', appearance:'none', WebkitAppearance:'none', boxShadow:focused==='soft'?'0 0 0 3px rgba(124,58,237,0.1)':'none' }}
                  >
                    <option value="">— Choose Software —</option>
                    {softwareList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <div style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'rgba(107,114,128,0.6)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              {/* Duration cards */}
              {selectedSoft && (
                <div>
                  <label style={labelStyle}>Select Duration</label>
                  {durationPlans.length === 0 ? (
                    <div style={{ padding:'12px 16px', borderRadius:'10px', border:'1px solid rgba(251,191,36,0.2)', background:'rgba(251,191,36,0.05)', fontFamily:"'DM Sans',sans-serif", fontSize:'12px', color:'rgba(251,191,36,0.8)' }}>
                      ⚠️ This software has no pricing plans set. Please edit it first.
                    </div>
                  ) : (
                    <div className="dur-grid" style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(durationPlans.length, 3)},1fr)`, gap:'8px' }}>
                      {durationPlans.map(plan => (
                        <label key={plan.value} className={`dur-card ${duration===plan.value?'active':''}`} onClick={() => setDuration(plan.value)}>
                          <input type="radio" name="duration" value={plan.value} onChange={() => setDuration(plan.value)} style={{ display:'none' }} />
                          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', fontWeight:600, letterSpacing:'0.02em', lineHeight:1, color:duration===plan.value?'#c4b5fd':'rgba(156,163,175,0.8)' }}>{plan.label}</span>
                          <span style={{ fontFamily:"'Cinzel',serif", fontSize:'11px', fontWeight:700, lineHeight:1, color:duration===plan.value?'#a78bfa':'rgba(107,114,128,0.65)' }}>${currentSoftware.prices[plan.field].toFixed(2)}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ height:'1px', background:'linear-gradient(90deg,transparent,rgba(124,58,237,0.15),transparent)' }} />

              {/* Keys textarea */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                  <label style={{ ...labelStyle, marginBottom:0 }}>Paste License Keys</label>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'rgba(107,114,128,0.55)', fontWeight:300 }}>One key per line</span>
                </div>
                <textarea value={keysInput} onChange={e => setKeysInput(e.target.value)} onFocus={() => setFocused('keys')} onBlur={() => setFocused('')}
                  className="ak-textarea" rows={8}
                  placeholder={"XXXX-XXXX-XXXX-XXXX\nYYYY-YYYY-YYYY-YYYY\nZZZZ-ZZZZ-ZZZZ-ZZZZ"}
                  style={{ width:'100%', boxSizing:'border-box', padding:'14px 16px', background:focused==='keys'?'rgba(124,58,237,0.04)':'rgba(6,6,18,0.8)', border:focused==='keys'?'1px solid rgba(124,58,237,0.6)':'1px solid rgba(55,48,80,0.7)', borderRadius:'12px', color:'white', fontSize:'13px', fontFamily:"'DM Mono',monospace", outline:'none', resize:'vertical', transition:'all 0.2s', lineHeight:1.7, boxShadow:focused==='keys'?'0 0 0 3px rgba(124,58,237,0.1)':'none' }}
                />
                {keysInput.trim() && (
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', marginTop:'8px' }}>
                    <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#34d399', boxShadow:'0 0 6px #34d399' }} />
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', color:'#34d399', fontWeight:500 }}>{keyCount} {keyCount===1?'key':'keys'} detected</span>
                  </div>
                )}
              </div>

              <div style={{ height:'1px', background:'linear-gradient(90deg,transparent,rgba(124,58,237,0.15),transparent)' }} />

              {/* Submit */}
              <button type="submit" disabled={isLoading} className="submit-btn"
                style={{ width:'100%', padding:'13px', borderRadius:'12px', border:'none', background:isLoading?'rgba(109,40,217,0.35)':'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white', fontSize:'13px', fontFamily:"'Cinzel',serif", fontWeight:600, letterSpacing:'0.08em', cursor:isLoading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:isLoading?'none':'0 8px 28px rgba(124,58,237,0.35)', transition:'all 0.22s ease' }}
              >
                {isLoading ? (
                  <><div style={{ width:'15px', height:'15px', border:'2px solid rgba(255,255,255,0.25)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.65s linear infinite' }} /> Uploading Keys...</>
                ) : (
                  <><Key size={15} /> Upload {keyCount>0?`${keyCount} `:''}Keys</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div style={{ position:'fixed', bottom:'28px', right:'28px', zIndex:200, display:'flex', alignItems:'center', gap:'10px', background:'linear-gradient(135deg,rgba(5,150,105,0.15),rgba(4,120,87,0.1))', border:'1px solid rgba(52,211,153,0.3)', borderRadius:'12px', padding:'12px 18px', backdropFilter:'blur(12px)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)', opacity:toast.show?1:0, transform:toast.show?'translateY(0)':'translateY(12px)', transition:'all 0.3s ease', pointerEvents:'none' }}>
        <CheckCircle size={16} color="#34d399" />
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'13px', color:'rgba(255,255,255,0.85)', fontWeight:400 }}>{toast.message}</span>
      </div>
    </>
  );
};

export default AddKeys;