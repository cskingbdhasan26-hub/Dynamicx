import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/config';
import { collection, onSnapshot, doc, getDocs, query, where, limit, updateDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Wallet, LogOut, ShoppingCart, History, Copy, Key, Package, Zap, CheckCircle, Send, Phone, MessageCircle, ExternalLink, ChevronRight, Trash2, Clock, AlertCircle } from 'lucide-react';

const ResellerDashboard = () => {
  const [userData, setUserData]           = useState(null);
  const [softwareList, setSoftwareList]   = useState([]);
  const [availableKeys, setAvailableKeys] = useState([]);
  const [purchases, setPurchases]         = useState([]);
  const [activeTab, setActiveTab]         = useState('software');
  const [isBuying, setIsBuying]           = useState(false);
  const [mounted, setMounted]             = useState(false);
  const [copiedId, setCopiedId]           = useState(null);
  const [confirmModal, setConfirmModal]   = useState(null);
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
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const unsubUser = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.status === "disabled") {
              alert("Your account has been DISABLED by the Admin.");
              signOut(auth);
              navigate('/');
              return;
            }
            setUserData({ id: docSnap.id, ...data });
          }
        });
        const unsubSoft = onSnapshot(collection(db, "software"), (snapshot) => {
          const sList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setSoftwareList(sList.filter(s => s.active === true));
        });
        const unsubKeys = onSnapshot(collection(db, "keys"), (snapshot) => {
          const kList = snapshot.docs.map(d => d.data());
          setAvailableKeys(kList.filter(k => k.status === "available"));
        });
        const qPurchases = query(collection(db, "purchases"), where("userId", "==", user.uid));
        const unsubPurchases = onSnapshot(qPurchases, (snapshot) => {
          const pList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          pList.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
          setPurchases(pList);
        });
        return () => { unsubUser(); unsubSoft(); unsubKeys(); unsubPurchases(); };
      } else {
        navigate('/');
      }
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  const handleLogout = () => { signOut(auth); navigate('/'); };

  const getKeyCount = (softId, duration) =>
    availableKeys.filter(k => k.softwareId === softId && k.duration === duration).length;

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBuyNow = (software, duration, price) => {
    if (isBuying) return;
    if (userData.balance < price) {
      setConfirmModal({ type: 'error', message: `Insufficient balance! You need $${price.toFixed(2)} to buy this.` });
      return;
    }
    setConfirmModal({ type: 'confirm', software, duration, price });
  };

  const handleConfirmBuy = async () => {
    const { software, duration, price } = confirmModal;
    setConfirmModal(null);
    setIsBuying(true);
    try {
      const keysQuery = query(
        collection(db, "keys"),
        where("softwareId", "==", software.id),
        where("duration", "==", duration),
        where("status", "==", "available"),
        limit(1)
      );
      const keySnapshot = await getDocs(keysQuery);
      if (keySnapshot.empty) {
        setConfirmModal({ type: 'error', message: 'Sorry! Out of stock. No keys available right now.' });
        setIsBuying(false);
        return;
      }
      const keyDoc = keySnapshot.docs[0];
      const keyData = keyDoc.data();
      const newBalance = userData.balance - price;
      await updateDoc(doc(db, "users", userData.id), { balance: newBalance });
      await updateDoc(doc(db, "keys", keyDoc.id), { status: "sold", buyerId: userData.id });
      await addDoc(collection(db, "purchases"), {
        userId: userData.id,
        softwareName: software.name,
        duration,
        price,
        key: keyData.key,
        imageUrl: software.imageUrl || "",
        createdAt: serverTimestamp()
      });
      setConfirmModal({ type: 'success', key: keyData.key, softwareName: software.name });
      setActiveTab('purchases');
    } catch (error) {
      setConfirmModal({ type: 'error', message: 'Transaction Failed: ' + error.message });
    } finally {
      setIsBuying(false);
    }
  };

  const handleDeletePurchase = async (purchaseId) => {
    try {
      await deleteDoc(doc(db, "purchases", purchaseId));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const getExpiryInfo = (createdAt, duration) => {
    if (!createdAt) return null;
    const daysMap = { '1 Day': 1, '7 Days': 7, '30 Days': 30 };
    const days = daysMap[duration];
    if (!days) return null;
    const expiry = createdAt.toMillis() + days * 24 * 60 * 60 * 1000;
    const diff = expiry - Date.now();
    if (diff <= 0) return { expired: true, label: 'Expired' };
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const daysLeft  = Math.floor(hoursLeft / 24);
    if (daysLeft >= 1) return { expired: false, label: `${daysLeft}d left` };
    return { expired: false, label: `${hoursLeft}h left` };
  };

  if (!userData) return (
    <div style={{ minHeight: '100vh', background: '#06060f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', margin: '0 auto 16px', border: '2px solid rgba(124,58,237,0.2)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <p style={{ color: 'rgba(107,114,128,0.6)', fontSize: '13px', margin: 0, fontFamily: "'DM Sans',sans-serif" }}>Loading...</p>
      </div>
    </div>
  );

  const contactItems = [
    { icon: <Send size={14} />,          label: 'Telegram',       value: 'Shadow_999x',     color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.25)',  href: 'https://t.me/Shadow_999x',      clickable: true  },
    { icon: <Phone size={14} />,         label: 'Contact',        value: '+880 1623756042', color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)',  href: null,                            clickable: false },
    { icon: <MessageCircle size={14} />, label: 'Discord',        value: 'Shadow_999x',     color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.25)', href: null,                            clickable: false },
    { icon: <ExternalLink size={14} />,  label: 'Discord Server', value: 'Join Server →',   color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)', href: 'https://discord.gg/aXB7HUsHT7', clickable: true  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes nbpulse  { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes glow     { 0%,100%{box-shadow:0 0 8px rgba(52,211,153,0.5)} 50%{box-shadow:0 0 18px rgba(52,211,153,0.9)} }

        .rd-tab { transition: all 0.22s ease; cursor: pointer; border: none; outline: none; }
        .rd-tab-inactive:hover {
          background: rgba(124,58,237,0.12) !important;
          border-color: rgba(124,58,237,0.35) !important;
          color: rgba(255,255,255,0.85) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(124,58,237,0.15) !important;
        }
        .rd-card { transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease; }
        .rd-card:hover { transform: translateY(-4px); box-shadow: 0 20px 56px rgba(0,0,0,0.5) !important; border-color: rgba(124,58,237,0.3) !important; }
        .buy-btn { transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1); border: none; cursor: pointer; outline: none; }
        .buy-btn:hover:not(:disabled) { transform: translateY(-2px) scale(1.03); box-shadow: 0 10px 28px rgba(52,211,153,0.45) !important; filter: brightness(1.08); }
        .buy-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        .buy-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .copy-btn { transition: all 0.2s ease; border: none; cursor: pointer; outline: none; }
        .copy-btn:hover { background: rgba(124,58,237,0.22) !important; transform: scale(1.08); }
        .del-btn { transition: all 0.2s ease; border: none; cursor: pointer; outline: none; }
        .del-btn:hover { background: rgba(248,113,113,0.18) !important; border-color: rgba(248,113,113,0.45) !important; color: #f87171 !important; transform: scale(1.08); }
        .logout-btn { transition: all 0.22s ease; border: none; cursor: pointer; outline: none; }
        .logout-btn:hover { background: rgba(239,68,68,0.18) !important; border-color: rgba(239,68,68,0.5) !important; color: #fca5a5 !important; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(239,68,68,0.2) !important; }
        .contact-row { transition: background 0.18s ease, padding-left 0.18s ease; text-decoration: none; }
        .contact-row:hover { background: rgba(124,58,237,0.06) !important; padding-left: 26px !important; }
        .contact-row:hover .contact-chevron { opacity: 1 !important; transform: translateX(3px) !important; }
        .contact-row:hover .contact-val { filter: brightness(1.2); }
        .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.4) !important; }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.25); border-radius: 3px; }

        .rd-stats-grid     { grid-template-columns: repeat(3,1fr) !important; }
        .rd-purchases-grid { grid-template-columns: repeat(auto-fill,minmax(340px,1fr)) !important; }

        @media (max-width: 640px) {
          .rd-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .rd-stats-grid > div:last-child { grid-column: 1 / -1; }
          .rd-tabs { flex-direction: column !important; gap: 6px !important; }
          .rd-tab  { width: 100%; justify-content: center; }
          .rd-purchases-grid { grid-template-columns: 1fr !important; }
          .rd-price-row { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .rd-price-right { width: 100%; justify-content: space-between !important; }
          .rd-main-pad   { padding: 74px 14px 40px !important; }
          .rd-logo-text  { display: none !important; }
          .rd-user-badge { display: none !important; }
        }
        @media (max-width: 400px) {
          .rd-stats-grid { grid-template-columns: 1fr !important; }
          .rd-stats-grid > div:last-child { grid-column: auto; }
        }
      `}</style>

      <div style={{ minHeight:'100vh', background:'#06060f', fontFamily:"'DM Sans',sans-serif", position:'relative', overflow:'hidden', opacity:mounted?1:0, transition:'opacity 0.5s ease' }}>
        {/* BG */}
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, backgroundImage:`linear-gradient(rgba(124,58,237,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.03) 1px,transparent 1px)`, backgroundSize:'44px 44px' }} />
        <div style={{ position:'fixed', top:'-200px', left:'-200px', width:'600px', height:'600px', borderRadius:'50%', pointerEvents:'none', zIndex:0, background:'radial-gradient(circle,rgba(109,40,217,0.12) 0%,transparent 65%)' }} />
        <div style={{ position:'fixed', bottom:'-150px', right:'-150px', width:'500px', height:'500px', borderRadius:'50%', pointerEvents:'none', zIndex:0, background:'radial-gradient(circle,rgba(79,70,229,0.09) 0%,transparent 65%)' }} />

        {/* Navbar */}
        <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, background:'rgba(6,6,18,0.88)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(124,58,237,0.1)', padding:'0 24px' }}>
          <div style={{ maxWidth:'1100px', margin:'0 auto', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 18px rgba(124,58,237,0.45)' }}>
                <Zap size={16} color="white" fill="white" />
              </div>
              <span className="rd-logo-text" style={{ fontFamily:"'Cinzel',serif", fontWeight:700, fontSize:'17px', color:'white', letterSpacing:'0.05em' }}>
                DYNAMIX<span style={{ color:'#7c3aed' }}>X</span>
              </span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'7px', background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.18)', borderRadius:'100px', padding:'6px 14px' }}>
                <Wallet size={13} color="#34d399" />
                <span style={{ fontSize:'13px', color:'#34d399', fontWeight:600 }}>${userData.balance ? userData.balance.toFixed(2) : '0.00'}</span>
              </div>
              <div className="rd-user-badge" style={{ display:'flex', alignItems:'center', gap:'7px', background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.22)', borderRadius:'100px', padding:'6px 14px' }}>
                <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#a78bfa', boxShadow:'0 0 6px #a78bfa', animation:'nbpulse 2s infinite' }} />
                <span style={{ fontSize:'11px', color:'#a78bfa', fontWeight:500, letterSpacing:'0.06em' }}>{userData.email.split('@')[0]}</span>
              </div>
              <button onClick={handleLogout} className="logout-btn" style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px', borderRadius:'9px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.18)', color:'rgba(252,165,165,0.8)', fontSize:'12px', fontWeight:500, letterSpacing:'0.04em' }}>
                <LogOut size={13} /> Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Main */}
        <div className="rd-main-pad" style={{ position:'relative', zIndex:1, maxWidth:'1100px', margin:'0 auto', padding:'84px 24px 48px' }}>

          {/* Header */}
          <div style={{ marginBottom:'32px', animation:'fadeUp 0.5s ease 0.05s both' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
              <div style={{ width:'28px', height:'1px', background:'rgba(124,58,237,0.55)' }} />
              <span style={{ fontSize:'11px', color:'#7c3aed', letterSpacing:'0.12em', fontWeight:500 }}>RESELLER PORTAL</span>
            </div>
            <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:'24px', fontWeight:700, color:'white', margin:'0 0 6px', letterSpacing:'0.04em' }}>
              Welcome back, {userData.email.split('@')[0]}!
            </h1>
            <p style={{ color:'rgba(107,114,128,0.75)', fontSize:'13px', margin:0, fontWeight:300 }}>Manage your license keys and purchases below.</p>
          </div>

          {/* Stats */}
          <div className="rd-stats-grid" style={{ display:'grid', gap:'14px', marginBottom:'24px', animation:'fadeUp 0.5s ease 0.1s both' }}>
            {[
              { label:'Available Balance', value:`$${userData.balance ? userData.balance.toFixed(2) : '0.00'}`, color:'#34d399', glow:'rgba(52,211,153,0.1)',  border:'rgba(52,211,153,0.18)',  icon:<Wallet size={17}/> },
              { label:'Total Purchases',   value:purchases.length,   color:'#a78bfa', glow:'rgba(167,139,250,0.1)', border:'rgba(167,139,250,0.18)', icon:<History size={17}/> },
              { label:'Available Software',value:softwareList.length,color:'#818cf8', glow:'rgba(129,140,248,0.1)', border:'rgba(129,140,248,0.18)', icon:<Package size={17}/> },
            ].map((stat, i) => (
              <div key={i} className="stat-card" style={{ background:'linear-gradient(145deg,rgba(18,14,38,0.96),rgba(10,8,24,0.98))', border:`1px solid ${stat.border}`, borderRadius:'16px', padding:'20px', position:'relative', overflow:'hidden', boxShadow:'0 8px 28px rgba(0,0,0,0.3)' }}>
                <div style={{ position:'absolute', top:0, right:0, width:'90px', height:'90px', borderRadius:'50%', background:`radial-gradient(circle,${stat.glow} 0%,transparent 70%)`, pointerEvents:'none' }} />
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px', color:stat.color }}>
                  {stat.icon}
                  <span style={{ fontSize:'11px', fontWeight:500, letterSpacing:'0.07em', color:'rgba(107,114,128,0.75)' }}>{stat.label}</span>
                </div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:'26px', fontWeight:700, color:'white' }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Admin Contact */}
          <div style={{ marginBottom:'28px', animation:'fadeUp 0.5s ease 0.15s both' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
              <div style={{ width:'28px', height:'1px', background:'rgba(124,58,237,0.55)' }} />
              <span style={{ fontSize:'11px', color:'#7c3aed', letterSpacing:'0.12em', fontWeight:500 }}>ADMIN CONTACT</span>
              <div style={{ flex:1, height:'1px', background:'linear-gradient(90deg,rgba(124,58,237,0.3),transparent)' }} />
            </div>
            <div style={{ background:'linear-gradient(145deg,rgba(18,14,38,0.96),rgba(10,8,24,0.98))', border:'1px solid rgba(124,58,237,0.14)', borderRadius:'18px', overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.3)' }}>
              <div style={{ height:'1px', background:'linear-gradient(90deg,transparent 5%,rgba(124,58,237,0.4) 50%,transparent 95%)' }} />
              <div style={{ padding:'16px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(55,48,80,0.35)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:'linear-gradient(135deg,rgba(124,58,237,0.28),rgba(79,70,229,0.18))', border:'1px solid rgba(124,58,237,0.38)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 18px rgba(124,58,237,0.22)', flexShrink:0 }}>
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:'17px', fontWeight:700, color:'#a78bfa' }}>S</span>
                  </div>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ fontFamily:"'Cinzel',serif", fontSize:'14px', fontWeight:700, color:'white', letterSpacing:'0.03em' }}>Shadow_999x</span>
                      <span style={{ fontSize:'9px', color:'#34d399', background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.22)', borderRadius:'5px', padding:'2px 7px', fontWeight:600, letterSpacing:'0.07em' }}>ADMIN</span>
                    </div>
                    <p style={{ fontSize:'11px', color:'rgba(107,114,128,0.55)', margin:'2px 0 0', fontWeight:300 }}>Available for support</p>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                  <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#34d399', animation:'glow 2s ease-in-out infinite' }} />
                  <span style={{ fontSize:'10px', color:'rgba(52,211,153,0.7)', fontWeight:500, letterSpacing:'0.05em' }}>Online</span>
                </div>
              </div>
              {contactItems.map((item, i) => {
                const inner = (
                  <>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                      <div style={{ width:'30px', height:'30px', borderRadius:'8px', flexShrink:0, background:item.bg, border:`1px solid ${item.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:item.color }}>
                        {item.icon}
                      </div>
                      <span style={{ fontSize:'12px', color:'rgba(156,163,175,0.55)', fontWeight:400 }}>{item.label}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <span className="contact-val" style={{ fontSize:'13px', fontWeight:600, color:item.color, transition:'filter 0.18s ease' }}>{item.value}</span>
                      {item.clickable && <ChevronRight size={13} className="contact-chevron" style={{ color:item.color, opacity:0, transform:'translateX(-4px)', transition:'all 0.18s ease' }} />}
                    </div>
                  </>
                );
                const rowStyle = { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 22px', borderBottom: i < contactItems.length-1 ? '1px solid rgba(55,48,80,0.25)' : 'none' };
                return item.clickable
                  ? <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className="contact-row" style={{ ...rowStyle, textDecoration:'none' }}>{inner}</a>
                  : <div key={i} style={{ ...rowStyle, cursor:'default' }}>{inner}</div>;
              })}
            </div>
          </div>

          {/* Tabs */}
          <div className="rd-tabs" style={{ display:'flex', gap:'8px', marginBottom:'24px', animation:'fadeUp 0.5s ease 0.2s both' }}>
            {[
              { key:'software',  label:'Available Software', icon:<Package size={14}/> },
              { key:'purchases', label:`Recent Purchases${purchases.length > 0 ? ` (${purchases.length})` : ''}`, icon:<History size={14}/> },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`rd-tab ${activeTab !== tab.key ? 'rd-tab-inactive' : ''}`}
                style={{ display:'flex', alignItems:'center', gap:'7px', padding:'9px 20px', borderRadius:'10px', background:activeTab===tab.key ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(18,14,38,0.8)', color:activeTab===tab.key ? 'white' : 'rgba(156,163,175,0.65)', fontSize:'13px', fontWeight:500, border:activeTab===tab.key ? 'none' : '1px solid rgba(55,48,80,0.55)', boxShadow:activeTab===tab.key ? '0 4px 18px rgba(124,58,237,0.35)' : 'none', letterSpacing:'0.02em' }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Software Tab */}
          {activeTab === 'software' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'14px', animation:'fadeUp 0.4s ease both' }}>
              {softwareList.length === 0 && (
                <div style={{ textAlign:'center', padding:'60px 0', color:'rgba(107,114,128,0.5)' }}>
                  <Package size={38} style={{ margin:'0 auto 12px', display:'block', opacity:0.4 }} />
                  <p style={{ margin:0, fontSize:'13px' }}>No software available at the moment.</p>
                </div>
              )}
              {softwareList.map((soft, si) => (
                <div key={soft.id} className="rd-card" style={{ background:'linear-gradient(145deg,rgba(18,14,38,0.96),rgba(10,8,24,0.98))', border:'1px solid rgba(124,58,237,0.13)', borderRadius:'18px', overflow:'hidden', boxShadow:'0 8px 28px rgba(0,0,0,0.3)', animation:`fadeUp 0.5s ease ${si*0.07}s both` }}>
                  <div style={{ padding:'18px 22px', borderBottom:'1px solid rgba(55,48,80,0.45)', display:'flex', alignItems:'center', gap:'14px' }}>
                    <div style={{ width:'50px', height:'50px', borderRadius:'12px', background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.18)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                      {soft.imageUrl ? <img src={soft.imageUrl} alt={soft.name} style={{ width:'100%', height:'100%', objectFit:'contain' }} /> : <Package size={20} color="#7c3aed" />}
                    </div>
                    <div>
                      <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:'15px', fontWeight:600, color:'white', margin:'0 0 3px', letterSpacing:'0.03em' }}>{soft.name}</h3>
                      <span style={{ fontSize:'11px', color:'rgba(107,114,128,0.6)', fontWeight:300 }}>License Keys Available</span>
                    </div>
                  </div>
                  <div>
                    {[
                      soft.prices?.oneDay     && { duration:'1 Day',   price:soft.prices.oneDay },
                      soft.prices?.sevenDays  && { duration:'7 Days',  price:soft.prices.sevenDays },
                      soft.prices?.thirtyDays && { duration:'30 Days', price:soft.prices.thirtyDays },
                    ].filter(Boolean).map((item, idx, arr) => {
                      const count = getKeyCount(soft.id, item.duration);
                      return (
                        <div key={item.duration} className="rd-price-row" style={{ padding:'14px 22px', borderBottom:idx<arr.length-1 ? '1px solid rgba(55,48,80,0.3)' : 'none', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px' }}>
                          <div>
                            <p style={{ fontWeight:600, color:'white', margin:'0 0 3px', fontSize:'14px' }}>{item.duration}</p>
                            <p style={{ fontSize:'11px', color:count>0 ? '#34d399' : '#f87171', margin:0, fontWeight:400 }}>
                              {count>0 ? `${count} keys in stock` : 'Out of stock'}
                            </p>
                          </div>
                          <div className="rd-price-right" style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                            <span style={{ fontFamily:"'Cinzel',serif", fontSize:'17px', fontWeight:700, color:'white' }}>${item.price.toFixed(2)}</span>
                            <button onClick={() => handleBuyNow(soft, item.duration, item.price)} disabled={isBuying||count===0} className="buy-btn"
                              style={{ display:'flex', alignItems:'center', gap:'7px', padding:'9px 18px', borderRadius:'10px', background:count===0 ? 'rgba(55,48,80,0.35)' : 'linear-gradient(135deg,#34d399,#059669)', color:'white', fontSize:'13px', fontWeight:600, boxShadow:count>0 ? '0 4px 14px rgba(52,211,153,0.3)' : 'none', letterSpacing:'0.02em' }}>
                              <ShoppingCart size={13}/> Buy Now
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Purchases Tab */}
          {activeTab === 'purchases' && (
            <div style={{ animation:'fadeUp 0.4s ease both' }}>
              {purchases.length === 0 ? (
                <div style={{ background:'linear-gradient(145deg,rgba(18,14,38,0.96),rgba(10,8,24,0.98))', border:'1px solid rgba(124,58,237,0.13)', borderRadius:'18px', padding:'60px 24px', textAlign:'center' }}>
                  <History size={38} color="rgba(107,114,128,0.35)" style={{ margin:'0 auto 14px', display:'block' }} />
                  <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:'15px', fontWeight:600, color:'rgba(255,255,255,0.4)', margin:'0 0 6px' }}>No purchases yet</h3>
                  <p style={{ fontSize:'13px', color:'rgba(107,114,128,0.45)', margin:0, fontWeight:300 }}>Your purchased keys will appear here.</p>
                </div>
              ) : (
                <div className="rd-purchases-grid" style={{ display:'grid', gap:'14px' }}>
                  {purchases.map((item, pi) => {
                    const expiry = getExpiryInfo(item.createdAt, item.duration);
                    return (
                      <div key={item.id} className="rd-card" style={{ background:'linear-gradient(145deg,rgba(18,14,38,0.96),rgba(10,8,24,0.98))', border:`1px solid ${expiry?.expired ? 'rgba(248,113,113,0.18)' : 'rgba(124,58,237,0.13)'}`, borderRadius:'16px', padding:'20px', boxShadow:'0 8px 28px rgba(0,0,0,0.3)', animation:`fadeUp 0.5s ease ${pi*0.06}s both` }}>

                        {/* Header row */}
                        <div style={{ display:'flex', alignItems:'flex-start', gap:'12px', marginBottom:'14px' }}>
                          <div style={{ width:'42px', height:'42px', borderRadius:'10px', background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.18)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                            {item.imageUrl ? <img src={item.imageUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'contain' }} /> : <Key size={17} color="#7c3aed" />}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:'14px', fontWeight:600, color:'white', margin:'0 0 6px', letterSpacing:'0.02em' }}>{item.softwareName}</h3>
                            <div style={{ display:'flex', gap:'6px', alignItems:'center', flexWrap:'wrap' }}>
                              <span style={{ fontSize:'11px', color:'rgba(167,139,250,0.8)', background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.18)', padding:'2px 8px', borderRadius:'6px' }}>{item.duration}</span>
                              <span style={{ fontSize:'12px', color:'#34d399', fontWeight:600 }}>${item.price.toFixed(2)}</span>
                              {expiry && (
                                <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', fontSize:'10px', fontWeight:600, padding:'2px 8px', borderRadius:'6px', background:expiry.expired ? 'rgba(248,113,113,0.12)' : 'rgba(52,211,153,0.1)', border:`1px solid ${expiry.expired ? 'rgba(248,113,113,0.3)' : 'rgba(52,211,153,0.25)'}`, color:expiry.expired ? '#f87171' : '#34d399' }}>
                                  {expiry.expired ? <AlertCircle size={10}/> : <Clock size={10}/>}
                                  {expiry.label}
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Delete button */}
                          <button
                            onClick={() => handleDeletePurchase(item.id)}
                            className="del-btn"
                            style={{ flexShrink:0, padding:'7px', borderRadius:'8px', background:'rgba(248,113,113,0.07)', border:'1px solid rgba(248,113,113,0.18)', color:'rgba(248,113,113,0.5)', display:'flex' }}
                          >
                            <Trash2 size={14}/>
                          </button>
                        </div>

                        {/* Key box */}
                        <div style={{ background:'rgba(6,6,18,0.8)', border:'1px solid rgba(55,48,80,0.55)', borderRadius:'10px', padding:'11px 13px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px' }}>
                          <code style={{ color:'#818cf8', fontFamily:'monospace', fontSize:'13px', letterSpacing:'0.05em', wordBreak:'break-all', flex:1 }}>{item.key}</code>
                          <button onClick={() => copyToClipboard(item.key, item.id)} className="copy-btn" style={{ flexShrink:0, padding:'7px', borderRadius:'8px', background:copiedId===item.id ? 'rgba(52,211,153,0.14)' : 'rgba(124,58,237,0.09)', color:copiedId===item.id ? '#34d399' : '#a78bfa' }}>
                            {copiedId===item.id ? <CheckCircle size={14}/> : <Copy size={14}/>}
                          </button>
                        </div>

                        {/* Date */}
                        {item.createdAt && (
                          <p style={{ fontSize:'11px', color:'rgba(107,114,128,0.4)', margin:'9px 0 0', fontWeight:300 }}>
                            Purchased: {new Date(item.createdAt.toMillis()).toLocaleDateString('en-US',{ year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmModal && (
        <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.75)', backdropFilter:'blur(10px)', padding:'24px' }}>
          <div style={{ background:'linear-gradient(145deg,rgba(18,14,38,0.99),rgba(10,8,24,0.99))', border:`1px solid ${confirmModal.type==='success' ? 'rgba(52,211,153,0.28)' : confirmModal.type==='error' ? 'rgba(248,113,113,0.28)' : 'rgba(124,58,237,0.28)'}`, borderRadius:'20px', padding:'32px', maxWidth:'400px', width:'100%', boxShadow:'0 32px 80px rgba(0,0,0,0.65)', animation:'fadeUp 0.25s ease both' }}>
            <div style={{ height:'1px', background:`linear-gradient(90deg,transparent 5%,${confirmModal.type==='success' ? 'rgba(52,211,153,0.45)' : confirmModal.type==='error' ? 'rgba(248,113,113,0.45)' : 'rgba(124,58,237,0.45)'} 50%,transparent 95%)`, marginBottom:'24px' }} />
            <div style={{ textAlign:'center', marginBottom:'20px' }}>
              <div style={{ width:'54px', height:'54px', borderRadius:'15px', margin:'0 auto 14px', background:confirmModal.type==='success' ? 'rgba(52,211,153,0.1)' : confirmModal.type==='error' ? 'rgba(248,113,113,0.1)' : 'rgba(124,58,237,0.1)', border:`1px solid ${confirmModal.type==='success' ? 'rgba(52,211,153,0.28)' : confirmModal.type==='error' ? 'rgba(248,113,113,0.28)' : 'rgba(124,58,237,0.28)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>
                {confirmModal.type==='success' ? '✓' : confirmModal.type==='error' ? '!' : '?'}
              </div>
              <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:'17px', fontWeight:700, color:'white', margin:'0 0 8px', letterSpacing:'0.04em' }}>
                {confirmModal.type==='success' ? 'Purchase Successful!' : confirmModal.type==='error' ? 'Error' : 'Confirm Purchase'}
              </h3>
              {confirmModal.type==='confirm' && (
                <div>
                  <p style={{ fontSize:'13px', color:'rgba(156,163,175,0.75)', margin:'0 0 14px', fontWeight:300, lineHeight:1.6 }}>Are you sure you want to buy</p>
                  <div style={{ background:'rgba(124,58,237,0.07)', border:'1px solid rgba(124,58,237,0.18)', borderRadius:'12px', padding:'14px 18px', marginBottom:'4px' }}>
                    <p style={{ fontFamily:"'Cinzel',serif", fontSize:'15px', color:'white', margin:'0 0 6px', fontWeight:600 }}>{confirmModal.software.name}</p>
                    <div style={{ display:'flex', justifyContent:'center', gap:'10px', alignItems:'center' }}>
                      <span style={{ fontSize:'12px', color:'#a78bfa', background:'rgba(124,58,237,0.1)', padding:'3px 10px', borderRadius:'6px', border:'1px solid rgba(124,58,237,0.2)' }}>{confirmModal.duration}</span>
                      <span style={{ fontFamily:"'Cinzel',serif", fontSize:'18px', color:'#34d399', fontWeight:700 }}>${confirmModal.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <p style={{ fontSize:'11px', color:'rgba(107,114,128,0.55)', margin:'8px 0 0', fontWeight:300 }}>
                    Remaining balance: <span style={{ color:'#fbbf24' }}>${(userData.balance - confirmModal.price).toFixed(2)}</span>
                  </p>
                </div>
              )}
              {confirmModal.type==='success' && (
                <div>
                  <p style={{ fontSize:'13px', color:'rgba(156,163,175,0.75)', margin:'0 0 12px', fontWeight:300 }}>Your key for <span style={{ color:'white', fontWeight:500 }}>{confirmModal.softwareName}</span></p>
                  <div style={{ background:'rgba(6,6,18,0.8)', border:'1px solid rgba(52,211,153,0.25)', borderRadius:'10px', padding:'12px 14px' }}>
                    <code style={{ color:'#818cf8', fontFamily:'monospace', fontSize:'13px', wordBreak:'break-all' }}>{confirmModal.key}</code>
                  </div>
                  <p style={{ fontSize:'11px', color:'rgba(107,114,128,0.45)', margin:'8px 0 0', fontWeight:300 }}>Key saved to Recent Purchases</p>
                </div>
              )}
              {confirmModal.type==='error' && (
                <p style={{ fontSize:'13px', color:'rgba(248,113,113,0.8)', margin:0, fontWeight:300, lineHeight:1.6 }}>{confirmModal.message}</p>
              )}
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              {confirmModal.type==='confirm' ? (
                <>
                  <button onClick={() => setConfirmModal(null)}
                    style={{ flex:1, padding:'12px', borderRadius:'11px', border:'1px solid rgba(55,48,80,0.6)', background:'transparent', color:'rgba(156,163,175,0.7)', fontSize:'13px', fontWeight:500, cursor:'pointer', transition:'all 0.2s' }}
                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'}}
                    onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='rgba(55,48,80,0.6)'}}>
                    Cancel
                  </button>
                  <button onClick={handleConfirmBuy}
                    style={{ flex:1, padding:'12px', borderRadius:'11px', border:'none', background:'linear-gradient(135deg,#34d399,#059669)', color:'white', fontSize:'13px', fontFamily:"'Cinzel',serif", fontWeight:600, cursor:'pointer', boxShadow:'0 4px 16px rgba(52,211,153,0.3)', letterSpacing:'0.04em', transition:'all 0.22s ease' }}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(52,211,153,0.45)'}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 16px rgba(52,211,153,0.3)'}}>
                    Confirm Buy
                  </button>
                </>
              ) : (
                <button onClick={() => setConfirmModal(null)}
                  style={{ flex:1, padding:'12px', borderRadius:'11px', border:'none', background:confirmModal.type==='success' ? 'linear-gradient(135deg,#34d399,#059669)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white', fontSize:'13px', fontFamily:"'Cinzel',serif", fontWeight:600, cursor:'pointer', boxShadow:'0 4px 16px rgba(124,58,237,0.3)', letterSpacing:'0.04em' }}>
                  {confirmModal.type==='success' ? 'View Purchases' : 'OK'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResellerDashboard;