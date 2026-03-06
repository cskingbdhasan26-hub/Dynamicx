import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, onSnapshot, query, where, orderBy, limit, doc, deleteDoc, getDocs } from 'firebase/firestore';
import {
  Users, Package, Key, DollarSign, UserPlus, FilePlus, Database,
  ShoppingBag, Clock, Trash2, ChevronRight, X, AlertTriangle,
} from 'lucide-react';
import AdminNavbar from '../../components/AdminNavbar';

// ── Delete Confirm Modal ──────────────────────────────────────────────
const DeleteTxModal = ({ show, onClose, onConfirm }) => {
  if (!show) return null;
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', animation:'fadeIn 0.18s ease' }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:'360px', background:'linear-gradient(160deg,rgba(18,14,38,0.99),rgba(10,8,24,1))', border:'1px solid rgba(248,113,113,0.22)', borderRadius:'20px', boxShadow:'0 40px 100px rgba(0,0,0,0.7)', overflow:'hidden', animation:'slideUp 0.22s cubic-bezier(.16,1,.3,1)' }}>
        <div style={{ height:'1px', background:'linear-gradient(90deg,transparent 5%,rgba(248,113,113,0.4) 50%,transparent 95%)' }}/>
        <div style={{ padding:'24px 26px 22px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
            <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'#f87171' }}><Trash2 size={18}/></div>
            <div>
              <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:'15px', fontWeight:700, color:'white', margin:'0 0 3px' }}>Delete Transaction</h3>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'rgba(107,114,128,0.7)', margin:0 }}>This cannot be undone</p>
            </div>
          </div>
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', padding:'12px 14px', marginBottom:'18px', display:'flex', gap:'9px', alignItems:'flex-start' }}>
            <AlertTriangle size={14} color="rgba(251,191,36,0.7)" style={{ flexShrink:0, marginTop:'1px' }}/>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', color:'rgba(156,163,175,0.8)', margin:0, lineHeight:1.6, fontWeight:300 }}>This transaction record will be permanently deleted.</p>
          </div>
          <div style={{ display:'flex', gap:'9px' }}>
            <button onClick={onClose} style={{ flex:1, padding:'11px', borderRadius:'10px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(156,163,175,0.8)', fontSize:'13px', fontFamily:"'DM Sans',sans-serif", cursor:'pointer' }}>Cancel</button>
            <button onClick={onConfirm} style={{ flex:1, padding:'11px', borderRadius:'10px', background:'linear-gradient(135deg,#dc2626,#b91c1c)', border:'none', color:'white', fontSize:'13px', fontFamily:"'Cinzel',serif", fontWeight:600, cursor:'pointer', boxShadow:'0 6px 20px rgba(220,38,38,0.35)' }}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Admin Dashboard ───────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats]               = useState({ resellers:0, software:0, keys:0, totalBalance:0 });
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [usersMap, setUsersMap]         = useState({}); // userId -> { email, balance }
  const [showAll, setShowAll]           = useState(false);
  const [deleteTx, setDeleteTx]         = useState(null);
  const [mounted, setMounted]           = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setTimeout(() => setMounted(true), 80);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    // Stats
    const qUsers = query(collection(db,"users"), where("role","==","reseller"));
    const unsubUsers = onSnapshot(qUsers, snapshot => {
      let activeCount=0, balanceSum=0;
      const map = {};
      snapshot.forEach(d => {
        const data = d.data();
        if (data.status==="active") activeCount++;
        if (data.balance) balanceSum += data.balance;
        map[d.id] = { email: data.email, balance: data.balance || 0 };
      });
      setStats(prev => ({ ...prev, resellers:activeCount, totalBalance:balanceSum }));
      setUsersMap(map);
    });

    const qSoftware = query(collection(db,"software"), where("active","==",true));
    const unsubSoftware = onSnapshot(qSoftware, s => setStats(prev => ({ ...prev, software:s.size })));

    const qKeys = query(collection(db,"keys"), where("status","==","available"));
    const unsubKeys = onSnapshot(qKeys, s => setStats(prev => ({ ...prev, keys:s.size })));

    // All purchases (real-time)
    const unsubAll = onSnapshot(
      query(collection(db,"purchases"), orderBy("createdAt","desc")),
      snap => {
        const list = snap.docs.map(d => ({ id:d.id, ...d.data() }));
        setAllTransactions(list);
        setTransactions(list.slice(0, 10));
      }
    );

    return () => { unsubUsers(); unsubSoftware(); unsubKeys(); unsubAll(); };
  }, []);

  const displayedTx = showAll ? allTransactions : transactions;

  const handleDelete = async () => {
    if (!deleteTx) return;
    try { await deleteDoc(doc(db,"purchases",deleteTx.id)); }
    catch(e) { alert("Error: "+e.message); }
    setDeleteTx(null);
  };

  const statCards = [
    { label:'Total Resellers', value:stats.resellers,                     sub:'Active accounts', icon:<Users size={20}/>,      color:'#818cf8', glow:'rgba(129,140,248,0.13)', border:'rgba(129,140,248,0.2)' },
    { label:'Total Software',  value:stats.software,                      sub:'Active products', icon:<Package size={20}/>,    color:'#a78bfa', glow:'rgba(167,139,250,0.13)', border:'rgba(167,139,250,0.2)' },
    { label:'Available Keys',  value:stats.keys,                          sub:'Ready to sell',   icon:<Key size={20}/>,        color:'#34d399', glow:'rgba(52,211,153,0.1)',   border:'rgba(52,211,153,0.2)'  },
    { label:'Total Balance',   value:`$${stats.totalBalance.toFixed(2)}`, sub:'All resellers',   icon:<DollarSign size={20}/>, color:'#fbbf24', glow:'rgba(251,191,36,0.1)',   border:'rgba(251,191,36,0.2)'  },
  ];

  const quickActions = [
    { label:'Manage Resellers', desc:'Review and approve requests', icon:<UserPlus size={22}/>, color:'#818cf8', bg:'rgba(129,140,248,0.1)', border:'rgba(129,140,248,0.2)', path:'/admin/users' },
    { label:'Add Software',     desc:'Add new software product',    icon:<FilePlus size={22}/>, color:'#a78bfa', bg:'rgba(167,139,250,0.1)', border:'rgba(167,139,250,0.2)', path:'/admin/add-software' },
    { label:'Add Keys',         desc:'Bulk add license keys',       icon:<Database size={22}/>, color:'#34d399', bg:'rgba(52,211,153,0.1)',  border:'rgba(52,211,153,0.2)',  path:'/admin/add-keys' },
  ];

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts.toMillis ? ts.toMillis() : ts);
    return d.toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
  };

  const durationColor = (dur) => ({
    '1 Day':'#38bdf8','7 Days':'#818cf8','10 Days':'#a78bfa',
    '15 Days':'#f472b6','30 Days':'#34d399','365 Days':'#fbbf24',
  }[dur] || '#a78bfa');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .stat-card{transition:transform 0.22s ease}.stat-card:hover{transform:translateY(-4px)}
        .act-card{transition:transform 0.22s ease,box-shadow 0.22s ease;cursor:pointer}.act-card:hover{transform:translateY(-3px)}
        .tx-row{transition:background 0.15s}.tx-row:hover{background:rgba(124,58,237,0.05)!important}
        .del-btn{opacity:0;transition:opacity 0.15s}.tx-row:hover .del-btn{opacity:1}
        .dash-grid{grid-template-columns:repeat(4,1fr)!important}
        .action-grid{grid-template-columns:repeat(3,1fr)!important}
        @media(max-width:1024px){.dash-grid{grid-template-columns:repeat(2,1fr)!important}.action-grid{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:560px){.dash-grid{grid-template-columns:1fr!important}.action-grid{grid-template-columns:1fr!important}.dash-inner{padding:88px 16px 40px!important}}
      `}</style>

      <DeleteTxModal show={!!deleteTx} onClose={()=>setDeleteTx(null)} onConfirm={handleDelete}/>

      <div style={{ minHeight:'100vh', background:'#06060f', fontFamily:"'DM Sans',sans-serif", position:'relative', overflow:'hidden' }}>
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, backgroundImage:`linear-gradient(rgba(124,58,237,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.03) 1px,transparent 1px)`, backgroundSize:'44px 44px' }}/>
        <div style={{ position:'fixed', top:'-200px', left:'-200px', zIndex:0, width:'600px', height:'600px', borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle,rgba(109,40,217,0.15) 0%,transparent 65%)' }}/>
        <div style={{ position:'fixed', bottom:'-150px', right:'-150px', zIndex:0, width:'500px', height:'500px', borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle,rgba(79,70,229,0.12) 0%,transparent 65%)' }}/>

        <AdminNavbar/>

        <div className="dash-inner" style={{ position:'relative', zIndex:1, maxWidth:'1280px', margin:'0 auto', padding:'96px 32px 48px', opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(16px)', transition:'opacity 0.5s ease,transform 0.5s ease' }}>

          {/* Header */}
          <div style={{ marginBottom:'40px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
              <div style={{ width:'28px', height:'1px', background:'rgba(124,58,237,0.55)' }}/>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#7c3aed', letterSpacing:'0.12em', fontWeight:500 }}>Overview</span>
            </div>
            <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:'26px', fontWeight:700, color:'white', letterSpacing:'0.04em', margin:'0 0 8px' }}>Admin Dashboard</h1>
            <p style={{ color:'rgba(107,114,128,0.9)', fontSize:'14px', margin:0, fontWeight:300 }}>Welcome back! Here's your real-time system overview.</p>
          </div>

          {/* Stats */}
          <div className="dash-grid" style={{ display:'grid', gap:'16px', marginBottom:'40px' }}>
            {statCards.map((card,i) => (
              <div key={i} className="stat-card" style={{ background:'linear-gradient(145deg,rgba(18,14,38,0.96),rgba(10,8,24,0.98))', border:`1px solid ${card.border}`, borderRadius:'18px', padding:'24px', position:'relative', overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.3)', animation:`fadeUp 0.5s ease ${i*0.08}s both` }}>
                <div style={{ position:'absolute', top:0, right:0, width:'110px', height:'110px', borderRadius:'50%', background:`radial-gradient(circle,${card.glow} 0%,transparent 70%)`, pointerEvents:'none' }}/>
                <div style={{ position:'absolute', top:'20px', right:'20px', width:'42px', height:'42px', borderRadius:'12px', background:card.glow, border:`1px solid ${card.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:card.color }}>{card.icon}</div>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'rgba(107,114,128,0.8)', letterSpacing:'0.08em', marginBottom:'10px', fontWeight:500 }}>{card.label}</p>
                <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:'30px', fontWeight:700, color:'white', margin:'0 0 8px', letterSpacing:'-0.02em' }}>{card.value}</h2>
                <p style={{ fontSize:'12px', color:card.color, margin:0, fontWeight:400 }}>↑ {card.sub}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom:'40px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
              <div style={{ width:'28px', height:'1px', background:'rgba(124,58,237,0.55)' }}/>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#7c3aed', letterSpacing:'0.12em', fontWeight:500 }}>Quick Actions</span>
            </div>
            <div className="action-grid" style={{ display:'grid', gap:'16px' }}>
              {quickActions.map((a,i) => (
                <button key={i} onClick={()=>navigate(a.path)} className="act-card" style={{ background:'linear-gradient(145deg,rgba(18,14,38,0.96),rgba(10,8,24,0.98))', border:`1px solid ${a.border}`, borderRadius:'18px', padding:'22px', display:'flex', alignItems:'center', gap:'16px', textAlign:'left', boxShadow:'0 8px 32px rgba(0,0,0,0.25)', animation:`fadeUp 0.5s ease ${0.32+i*0.08}s both` }}>
                  <div style={{ width:'50px', height:'50px', borderRadius:'14px', background:a.bg, border:`1px solid ${a.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:a.color, flexShrink:0 }}>{a.icon}</div>
                  <div>
                    <p style={{ fontFamily:"'Cinzel',serif", fontSize:'14px', fontWeight:600, color:'white', margin:'0 0 5px', letterSpacing:'0.03em' }}>{a.label}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', color:'rgba(107,114,128,0.8)', margin:0, fontWeight:300 }}>{a.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Transaction History */}
          <div style={{ animation:'fadeUp 0.5s ease 0.55s both' }}>

            {/* Section header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'28px', height:'1px', background:'rgba(124,58,237,0.55)' }}/>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#7c3aed', letterSpacing:'0.12em', fontWeight:500 }}>Transaction History</span>
                <span style={{ fontFamily:"'Cinzel',serif", fontSize:'12px', color:'rgba(107,114,128,0.5)' }}>({allTransactions.length})</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'5px 12px', borderRadius:'8px', background:'rgba(124,58,237,0.07)', border:'1px solid rgba(124,58,237,0.18)' }}>
                  <Clock size={11} color="#a78bfa"/>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#a78bfa', fontWeight:500 }}>
                    {showAll ? `All ${allTransactions.length}` : 'Latest 10'} purchases
                  </span>
                </div>
                {allTransactions.length > 10 && (
                  <button onClick={()=>setShowAll(v=>!v)} style={{ display:'flex', alignItems:'center', gap:'5px', padding:'5px 13px', borderRadius:'8px', background: showAll?'rgba(124,58,237,0.15)':'rgba(255,255,255,0.05)', border: showAll?'1px solid rgba(124,58,237,0.4)':'1px solid rgba(255,255,255,0.1)', color: showAll?'#a78bfa':'rgba(156,163,175,0.7)', fontSize:'11px', fontFamily:"'DM Sans',sans-serif", fontWeight:500, cursor:'pointer', transition:'all 0.2s' }}>
                    {showAll ? <><X size={11}/> Show Less</> : <><ChevronRight size={11}/> View All</>}
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div style={{ background:'linear-gradient(145deg,rgba(18,14,38,0.96),rgba(10,8,24,0.98))', border:'1px solid rgba(124,58,237,0.13)', borderRadius:'20px', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.4)' }}>
              <div style={{ height:'1px', background:'linear-gradient(90deg,transparent 5%,rgba(124,58,237,0.35) 50%,transparent 95%)' }}/>

              {displayedTx.length === 0 ? (
                <div style={{ padding:'52px', textAlign:'center' }}>
                  <ShoppingBag size={36} color="rgba(107,114,128,0.3)" style={{ margin:'0 auto 12px', display:'block' }}/>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'13px', color:'rgba(107,114,128,0.45)', margin:0, fontWeight:300 }}>No transactions yet.</p>
                </div>
              ) : (
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:'rgba(6,6,18,0.6)' }}>
                        {['Reseller', 'Balance', 'Software', 'Duration', 'Amount', 'Date', ''].map((h,i) => (
                          <th key={i} style={{ padding:'12px 16px', fontFamily:"'DM Sans',sans-serif", fontSize:'10px', fontWeight:500, color:'rgba(107,114,128,0.65)', letterSpacing:'0.1em', textTransform:'uppercase', borderBottom:'1px solid rgba(124,58,237,0.1)', textAlign: i===6?'right':'left', whiteSpace:'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {displayedTx.map((tx, idx) => {
                        const dc = durationColor(tx.duration);
                        const userInfo = usersMap[tx.userId] || {};
                        const email = tx.email || userInfo.email || 'Unknown';
                        const balance = userInfo.balance;
                        return (
                          <tr key={tx.id} className="tx-row" style={{ borderBottom: idx < displayedTx.length-1 ? '1px solid rgba(124,58,237,0.07)':'none' }}>

                            {/* Reseller */}
                            <td style={{ padding:'13px 16px', whiteSpace:'nowrap' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                                <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                  <span style={{ fontFamily:"'Cinzel',serif", fontSize:'12px', fontWeight:700, color:'#a78bfa' }}>{(email||'?')[0].toUpperCase()}</span>
                                </div>
                                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', color:'rgba(209,213,219,0.85)', fontWeight:400 }}>{email}</span>
                              </div>
                            </td>

                            {/* Available Balance */}
                            <td style={{ padding:'13px 16px', whiteSpace:'nowrap' }}>
                              {balance != null ? (
                                <span style={{ fontFamily:"'Cinzel',serif", fontSize:'12px', fontWeight:700, color:'#34d399' }}>${balance.toFixed(2)}</span>
                              ) : (
                                <span style={{ color:'rgba(107,114,128,0.4)', fontSize:'13px' }}>—</span>
                              )}
                            </td>

                            {/* Software */}
                            <td style={{ padding:'13px 16px', whiteSpace:'nowrap' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                                {tx.imageUrl
                                  ? <img src={tx.imageUrl} alt="" style={{ width:'22px', height:'22px', borderRadius:'5px', objectFit:'cover', flexShrink:0 }}/>
                                  : <Package size={14} color="rgba(107,114,128,0.5)"/>
                                }
                                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', color:'rgba(209,213,219,0.85)', fontWeight:500 }}>{tx.softwareName}</span>
                              </div>
                            </td>

                            {/* Duration */}
                            <td style={{ padding:'13px 16px' }}>
                              <span style={{ display:'inline-flex', alignItems:'center', fontFamily:"'DM Sans',sans-serif", fontSize:'11px', fontWeight:600, color:dc, background:`${dc}18`, border:`1px solid ${dc}35`, borderRadius:'6px', padding:'3px 9px' }}>
                                {tx.duration}
                              </span>
                            </td>

                            {/* Amount */}
                            <td style={{ padding:'13px 16px', whiteSpace:'nowrap' }}>
                              <span style={{ fontFamily:"'Cinzel',serif", fontSize:'13px', fontWeight:700, color:'#34d399' }}>${tx.price?.toFixed(2)}</span>
                            </td>

                            {/* Date */}
                            <td style={{ padding:'13px 16px', whiteSpace:'nowrap' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                                <Clock size={11} color="rgba(107,114,128,0.45)"/>
                                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'rgba(107,114,128,0.6)', fontWeight:300 }}>{formatDate(tx.createdAt)}</span>
                              </div>
                            </td>

                            {/* Delete */}
                            <td style={{ padding:'13px 16px', textAlign:'right' }}>
                              <button className="del-btn" onClick={()=>setDeleteTx(tx)} title="Delete" style={{ width:'28px', height:'28px', borderRadius:'7px', background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', color:'#f87171', cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}
                                onMouseEnter={e=>{e.currentTarget.style.background='rgba(248,113,113,0.18)';e.currentTarget.style.borderColor='rgba(248,113,113,0.45)';}}
                                onMouseLeave={e=>{e.currentTarget.style.background='rgba(248,113,113,0.08)';e.currentTarget.style.borderColor='rgba(248,113,113,0.2)';}}
                              ><Trash2 size={13}/></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* View all / show less footer */}
            {allTransactions.length > 10 && (
              <div style={{ textAlign:'center', marginTop:'14px' }}>
                <button onClick={()=>setShowAll(v=>!v)} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 20px', borderRadius:'10px', background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)', color:'#a78bfa', fontSize:'12px', fontFamily:"'DM Sans',sans-serif", fontWeight:500, cursor:'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(124,58,237,0.15)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(124,58,237,0.08)'}
                >
                  {showAll ? <><X size={12}/> Show Less</> : <><ChevronRight size={12}/> View All Transactions ({allTransactions.length})</>}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminDashboard;