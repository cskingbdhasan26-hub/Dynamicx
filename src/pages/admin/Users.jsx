import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, UserX, Trash2, Users as UsersIcon, DollarSign, X, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import AdminNavbar from '../../components/AdminNavbar';

// ─── Custom Modal Component ──────────────────────────────────────────
const Modal = ({ show, onClose, children }) => {
  useEffect(() => {
    if (show) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  if (!show) return null;

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', animation:'fadeIn 0.18s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:'400px', background:'linear-gradient(160deg, rgba(18,14,38,0.99), rgba(10,8,24,1))', border:'1px solid rgba(124,58,237,0.22)', borderRadius:'20px', boxShadow:'0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)', position:'relative', overflow:'hidden', animation:'slideUp 0.22s cubic-bezier(.16,1,.3,1)' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:'linear-gradient(90deg, transparent 5%, rgba(124,58,237,0.55) 50%, transparent 95%)' }} />
        {children}
      </div>
    </div>
  );
};

// ─── Add Balance Modal ───────────────────────────────────────────────
const AddBalanceModal = ({ show, user, onClose, onConfirm, onSetZero }) => {
  const [amount, setAmount] = useState('');
  const [focused, setFocused] = useState(false);
  const [confirmZero, setConfirmZero] = useState(false);

  useEffect(() => { if (!show) { setAmount(''); setConfirmZero(false); } }, [show]);

  const handleSubmit = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) { alert("Please enter a valid amount."); return; }
    onConfirm(val);
    setAmount('');
  };

  const handleSetZero = () => {
    if (!confirmZero) { setConfirmZero(true); return; }
    onSetZero();
    setConfirmZero(false);
  };

  return (
    <Modal show={show} onClose={onClose}>
      <div style={{ padding:'28px 28px 24px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'22px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'rgba(129,140,248,0.12)', border:'1px solid rgba(129,140,248,0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'#818cf8' }}>
              <DollarSign size={20} />
            </div>
            <div>
              <h3 style={{ fontFamily:"'Cinzel', serif", fontSize:'16px', fontWeight:700, color:'white', margin:'0 0 3px', letterSpacing:'0.03em' }}>Manage Balance</h3>
              <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'12px', color:'rgba(107,114,128,0.9)', margin:0, fontWeight:300 }}>{user?.email}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'6px', color:'#6b7280', cursor:'pointer', transition:'all 0.2s', display:'flex' }}><X size={16} /></button>
        </div>

        <div style={{ background:'rgba(52,211,153,0.06)', border:'1px solid rgba(52,211,153,0.15)', borderRadius:'10px', padding:'12px 16px', marginBottom:'18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'12px', color:'rgba(156,163,175,0.7)', fontWeight:400 }}>Current Balance</span>
          <span style={{ fontFamily:"'Cinzel', serif", fontSize:'16px', color:'#34d399', fontWeight:700 }}>${user?.balance ? user.balance.toFixed(2) : '0.00'}</span>
        </div>

        <div style={{ marginBottom:'14px' }}>
          <label style={{ display:'block', marginBottom:'8px', fontFamily:"'DM Sans', sans-serif", fontSize:'12px', fontWeight:500, color:'rgba(156,163,175,0.8)', letterSpacing:'0.04em' }}>Amount to Add ($)</label>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:focused?'#a78bfa':'#4b5563', fontFamily:"'Cinzel', serif", fontSize:'15px', fontWeight:600, transition:'color 0.2s' }}>$</span>
            <input type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ width:'100%', boxSizing:'border-box', padding:'13px 14px 13px 34px', background:focused?'rgba(124,58,237,0.05)':'rgba(6,6,18,0.8)', border:focused?'1px solid rgba(124,58,237,0.6)':'1px solid rgba(55,48,80,0.7)', borderRadius:'12px', color:'white', fontSize:'15px', fontFamily:"'Cinzel', serif", fontWeight:600, outline:'none', transition:'all 0.2s', boxShadow:focused?'0 0 0 3px rgba(124,58,237,0.1)':'none' }}
              autoFocus
            />
          </div>
        </div>

        <button onClick={handleSetZero} style={{ width:'100%', padding:'10px', borderRadius:'10px', marginBottom:'16px', background:confirmZero?'rgba(248,113,113,0.12)':'rgba(255,255,255,0.04)', border:confirmZero?'1px solid rgba(248,113,113,0.4)':'1px solid rgba(255,255,255,0.08)', color:confirmZero?'#f87171':'rgba(156,163,175,0.6)', fontSize:'12px', fontFamily:"'DM Sans', sans-serif", fontWeight:500, cursor:'pointer', transition:'all 0.2s', letterSpacing:'0.03em' }}>
          {confirmZero ? '⚠️ Confirm Reset to $0.00 — Click again' : 'Reset Balance to $0.00'}
        </button>

        <div style={{ height:'1px', background:'linear-gradient(90deg,transparent,rgba(124,58,237,0.15),transparent)', marginBottom:'16px' }} />

        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={onClose} style={{ flex:1, padding:'12px', borderRadius:'11px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(156,163,175,0.8)', fontSize:'13px', fontFamily:"'DM Sans', sans-serif", fontWeight:500, cursor:'pointer', transition:'all 0.2s' }}>Cancel</button>
          <button onClick={handleSubmit} style={{ flex:1, padding:'12px', borderRadius:'11px', background:'linear-gradient(135deg, #7c3aed, #4f46e5)', border:'none', color:'white', fontSize:'13px', fontFamily:"'Cinzel', serif", fontWeight:600, letterSpacing:'0.04em', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 6px 20px rgba(124,58,237,0.35)' }}>Add Funds</button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Confirm Modal ───────────────────────────────────────────────────
const ConfirmModal = ({ show, type, user, onClose, onConfirm }) => {
  const configs = {
    approve: { icon:<UserCheck size={22}/>, iconColor:'#34d399', iconBg:'rgba(52,211,153,0.12)', iconBorder:'rgba(52,211,153,0.25)', title:'Approve Reseller', message:'Are you sure you want to approve this account? They will get full access.', btnLabel:'Approve', btnStyle:'linear-gradient(135deg, #059669, #047857)', btnShadow:'rgba(5,150,105,0.35)' },
    disable:  { icon:<UserX size={22}/>,    iconColor:'#fb923c', iconBg:'rgba(251,146,60,0.12)', iconBorder:'rgba(251,146,60,0.25)',  title:'Disable Account', message:"Are you sure you want to disable this account? They won't be able to login.", btnLabel:'Disable', btnStyle:'linear-gradient(135deg, #ea580c, #c2410c)', btnShadow:'rgba(234,88,12,0.35)' },
    delete:   { icon:<Trash2 size={22}/>,   iconColor:'#f87171', iconBg:'rgba(248,113,113,0.12)', iconBorder:'rgba(248,113,113,0.25)', title:'Delete User',    message:'This action is permanent and cannot be undone. The user data will be lost forever.', btnLabel:'Delete', btnStyle:'linear-gradient(135deg, #dc2626, #b91c1c)', btnShadow:'rgba(220,38,38,0.35)' },
  };
  const cfg = configs[type] || configs.delete;

  return (
    <Modal show={show} onClose={onClose}>
      <div style={{ padding:'28px 28px 24px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:cfg.iconBg, border:`1px solid ${cfg.iconBorder}`, display:'flex', alignItems:'center', justifyContent:'center', color:cfg.iconColor }}>{cfg.icon}</div>
            <div>
              <h3 style={{ fontFamily:"'Cinzel', serif", fontSize:'16px', fontWeight:700, color:'white', margin:'0 0 3px', letterSpacing:'0.03em' }}>{cfg.title}</h3>
              <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'12px', color:'rgba(107,114,128,0.9)', margin:0, fontWeight:300 }}>{user?.email}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'6px', color:'#6b7280', cursor:'pointer', display:'flex' }}><X size={16} /></button>
        </div>
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', padding:'14px 16px', marginBottom:'20px', display:'flex', gap:'10px', alignItems:'flex-start' }}>
          <AlertTriangle size={16} color="rgba(251,191,36,0.7)" style={{ flexShrink:0, marginTop:'1px' }} />
          <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'13px', color:'rgba(156,163,175,0.8)', margin:0, lineHeight:1.6, fontWeight:300 }}>{cfg.message}</p>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={onClose} style={{ flex:1, padding:'12px', borderRadius:'11px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(156,163,175,0.8)', fontSize:'13px', fontFamily:"'DM Sans', sans-serif", fontWeight:500, cursor:'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex:1, padding:'12px', borderRadius:'11px', background:cfg.btnStyle, border:'none', color:'white', fontSize:'13px', fontFamily:"'Cinzel', serif", fontWeight:600, letterSpacing:'0.04em', cursor:'pointer', boxShadow:`0 6px 20px ${cfg.btnShadow}` }}>{cfg.btnLabel}</button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Toast ───────────────────────────────────────────────────────────
const Toast = ({ show, message }) => (
  <div style={{ position:'fixed', bottom:'28px', right:'28px', zIndex:200, display:'flex', alignItems:'center', gap:'10px', background:'linear-gradient(135deg, rgba(5,150,105,0.15), rgba(4,120,87,0.1))', border:'1px solid rgba(52,211,153,0.3)', borderRadius:'12px', padding:'12px 18px', backdropFilter:'blur(12px)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)', opacity:show?1:0, transform:show?'translateY(0)':'translateY(12px)', transition:'all 0.3s ease', pointerEvents:'none' }}>
    <CheckCircle size={16} color="#34d399" />
    <span style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'13px', color:'rgba(255,255,255,0.85)', fontWeight:400 }}>{message}</span>
  </div>
);

// ─── Main Users Page ─────────────────────────────────────────────────
const Users = () => {
  const [usersList, setUsersList]   = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mounted, setMounted]       = useState(false);
  const navigate = useNavigate();

  const [balanceModal, setBalanceModal] = useState({ show:false, user:null });
  const [confirmModal, setConfirmModal] = useState({ show:false, type:'', user:null });
  const [toast, setToast]               = useState({ show:false, message:'' });

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setTimeout(() => setMounted(true), 80);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "reseller"));
    const unsub = onSnapshot(q, snapshot => {
      setUsersList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const showToast = (msg) => {
    setToast({ show:true, message:msg });
    setTimeout(() => setToast({ show:false, message:'' }), 2800);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "users", id), { status: newStatus });
      showToast(newStatus === 'active' ? 'User approved successfully!' : 'User disabled successfully!');
    } catch (err) { alert("Error: " + err.message); }
    setConfirmModal({ show:false, type:'', user:null });
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteDoc(doc(db, "users", id));
      showToast('User deleted successfully!');
    } catch (err) { alert("Error: " + err.message); }
    setConfirmModal({ show:false, type:'', user:null });
  };

  // ✅ Balance add + transaction record
  const handleAddBalance = async (amount) => {
    const user = balanceModal.user;
    try {
      const newBalance = (user.balance || 0) + amount;
      await updateDoc(doc(db, "users", user.id), { balance: newBalance });

      // Transaction history তে record করো
      await addDoc(collection(db, "purchases"), {
        userId: user.id,
        email: user.email,
        softwareName: "Balance Added",
        imageUrl: null,
        duration: "—",
        price: amount,
        type: "balance_add",
        createdAt: serverTimestamp(),
      });

      showToast(`Added $${amount.toFixed(2)} to ${user.email}`);
    } catch (err) { alert("Error: " + err.message); }
    setBalanceModal({ show:false, user:null });
  };

  // ✅ Reset to zero + transaction record
  const handleSetZero = async () => {
    const user = balanceModal.user;
    try {
      await updateDoc(doc(db, "users", user.id), { balance: 0 });

      // Reset record করো
      await addDoc(collection(db, "purchases"), {
        userId: user.id,
        email: user.email,
        softwareName: "Balance Reset",
        imageUrl: null,
        duration: "—",
        price: 0,
        type: "balance_reset",
        createdAt: serverTimestamp(),
      });

      showToast(`Balance reset to $0.00 for ${user.email}`);
    } catch (err) { alert("Error: " + err.message); }
    setBalanceModal({ show:false, user:null });
  };

  // ── Filter by search query ──
  const filteredUsers = usersList.filter(u =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusBadge = (status) => {
    const map = {
      pending:  { label:'Pending',  color:'#fbbf24', bg:'rgba(251,191,36,0.1)',  border:'rgba(251,191,36,0.25)' },
      active:   { label:'Active',   color:'#34d399', bg:'rgba(52,211,153,0.1)',  border:'rgba(52,211,153,0.25)' },
      disabled: { label:'Disabled', color:'#f87171', bg:'rgba(248,113,113,0.1)', border:'rgba(248,113,113,0.25)' },
    };
    const s = map[status] || map.pending;
    return (
      <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', background:s.bg, border:`1px solid ${s.border}`, color:s.color, borderRadius:'100px', padding:'4px 12px', fontSize:'11px', fontFamily:"'DM Sans', sans-serif", fontWeight:500, letterSpacing:'0.05em' }}>
        <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:s.color, display:'inline-block' }} />
        {s.label}
      </span>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }

        .usr-row { transition: background 0.18s ease; }
        .usr-row:hover { background: rgba(124,58,237,0.04) !important; }

        .act-btn { display:flex; align-items:center; gap:5px; padding:7px 13px; border-radius:8px; font-size:12px; font-family:'DM Sans',sans-serif; font-weight:500; cursor:pointer; border:1px solid transparent; transition:all 0.18s ease; letter-spacing:0.02em; white-space:nowrap; }
        .btn-funds   { color:#818cf8; background:rgba(129,140,248,0.08); border-color:rgba(129,140,248,0.2); }
        .btn-funds:hover   { background:rgba(129,140,248,0.16); border-color:rgba(129,140,248,0.4); }
        .btn-approve { color:#34d399; background:rgba(52,211,153,0.08); border-color:rgba(52,211,153,0.2); }
        .btn-approve:hover { background:rgba(52,211,153,0.16); border-color:rgba(52,211,153,0.4); }
        .btn-disable { color:#fb923c; background:rgba(251,146,60,0.08); border-color:rgba(251,146,60,0.2); }
        .btn-disable:hover { background:rgba(251,146,60,0.16); border-color:rgba(251,146,60,0.4); }
        .btn-delete  { color:#f87171; background:rgba(248,113,113,0.08); border-color:rgba(248,113,113,0.2); }
        .btn-delete:hover  { background:rgba(248,113,113,0.16); border-color:rgba(248,113,113,0.4); }

        .search-input::placeholder { color: rgba(107,114,128,0.4); font-style: italic; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }

        @media (max-width: 768px) {
          .users-table th:nth-child(2), .users-table td:nth-child(2) { display: none; }
          .page-inner { padding: 88px 14px 40px !important; }
        }
        @media (max-width: 560px) {
          .users-table th:nth-child(3), .users-table td:nth-child(3) { display: none; }
          .act-btn span.btn-label { display: none; }
        }
      `}</style>

      <div style={{ minHeight:'100vh', background:'#06060f', fontFamily:"'DM Sans', sans-serif", position:'relative', overflow:'hidden' }}>
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, backgroundImage:`linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)`, backgroundSize:'44px 44px' }} />
        <div style={{ position:'fixed', top:'-200px', left:'-200px', zIndex:0, width:'600px', height:'600px', borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle, rgba(109,40,217,0.14) 0%, transparent 65%)' }} />
        <div style={{ position:'fixed', bottom:'-150px', right:'-150px', zIndex:0, width:'500px', height:'500px', borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 65%)' }} />

        <AdminNavbar />

        <div className="page-inner" style={{ position:'relative', zIndex:1, maxWidth:'1280px', margin:'0 auto', padding:'96px 32px 48px', opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(16px)', transition:'opacity 0.5s ease, transform 0.5s ease' }}>

          <button onClick={() => navigate('/admin')} style={{ display:'flex', alignItems:'center', gap:'6px', background:'none', border:'none', color:'rgba(107,114,128,0.8)', fontSize:'13px', fontFamily:"'DM Sans', sans-serif", fontWeight:400, cursor:'pointer', marginBottom:'28px', transition:'color 0.2s', padding:0 }}
            onMouseEnter={e => e.currentTarget.style.color='white'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(107,114,128,0.8)'}
          ><ArrowLeft size={15} /> Back to Dashboard</button>

          {/* Header + Search */}
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'32px', flexWrap:'wrap', gap:'16px' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                <div style={{ width:'28px', height:'1px', background:'rgba(124,58,237,0.55)' }} />
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#7c3aed', letterSpacing:'0.12em', fontWeight:500 }}>Management</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                <div style={{ width:'46px', height:'46px', borderRadius:'13px', background:'rgba(129,140,248,0.1)', border:'1px solid rgba(129,140,248,0.22)', display:'flex', alignItems:'center', justifyContent:'center', color:'#818cf8' }}>
                  <UsersIcon size={22} />
                </div>
                <div>
                  <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:'24px', fontWeight:700, color:'white', margin:'0 0 4px', letterSpacing:'0.04em' }}>Reseller Management</h1>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'13px', color:'rgba(107,114,128,0.85)', margin:0, fontWeight:300 }}>Approve, disable, or add balance to resellers</p>
                </div>
              </div>
            </div>

            {/* Search Box */}
            <div style={{ position:'relative', minWidth:'260px' }}>
              <Search size={14} style={{ position:'absolute', left:'13px', top:'50%', transform:'translateY(-50%)', color: searchFocused ? '#a78bfa' : 'rgba(107,114,128,0.5)', transition:'color 0.2s', pointerEvents:'none' }} />
              <input
                type="text"
                className="search-input"
                placeholder="Search by email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{
                  width:'100%', boxSizing:'border-box',
                  padding:'10px 36px 10px 36px',
                  background: searchFocused ? 'rgba(124,58,237,0.05)' : 'rgba(6,6,18,0.8)',
                  border: searchFocused ? '1px solid rgba(124,58,237,0.6)' : '1px solid rgba(55,48,80,0.7)',
                  borderRadius:'11px', color:'white',
                  fontSize:'13px', fontFamily:"'DM Sans', sans-serif",
                  outline:'none', transition:'all 0.2s',
                  boxShadow: searchFocused ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(107,114,128,0.5)', display:'flex', padding:'2px' }}
                  onMouseEnter={e => e.currentTarget.style.color='white'}
                  onMouseLeave={e => e.currentTarget.style.color='rgba(107,114,128,0.5)'}
                ><X size={13} /></button>
              )}
            </div>
          </div>

          {/* Result count */}
          {searchQuery && (
            <div style={{ marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', color:'rgba(107,114,128,0.6)', fontWeight:300 }}>
                {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''} for
              </span>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', color:'#a78bfa', fontWeight:500 }}>"{searchQuery}"</span>
            </div>
          )}

          <div style={{ background:'linear-gradient(145deg, rgba(18,14,38,0.96), rgba(10,8,24,0.98))', border:'1px solid rgba(124,58,237,0.15)', borderRadius:'20px', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)', animation:'fadeUp 0.5s ease 0.1s both' }}>
            <div style={{ height:'1px', background:'linear-gradient(90deg, transparent 5%, rgba(124,58,237,0.4) 50%, transparent 95%)' }} />

            <div style={{ overflowX:'auto' }}>
              <table className="users-table" style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'rgba(6,6,18,0.6)' }}>
                    {['Email', 'Balance', 'Status', 'Actions'].map((h, i) => (
                      <th key={h} style={{ padding:'16px 20px', fontFamily:"'DM Sans', sans-serif", fontSize:'11px', fontWeight:500, color:'rgba(107,114,128,0.7)', letterSpacing:'0.1em', textTransform:'uppercase', borderBottom:'1px solid rgba(124,58,237,0.1)', textAlign:i===3?'right':'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding:'48px', textAlign:'center', fontFamily:"'DM Sans',sans-serif", color:'rgba(107,114,128,0.5)', fontSize:'14px', fontWeight:300 }}>
                        {searchQuery ? `No resellers found matching "${searchQuery}"` : 'No resellers found.'}
                      </td>
                    </tr>
                  ) : filteredUsers.map((user, idx) => (
                    <tr key={user.id} className="usr-row" style={{ borderBottom:'1px solid rgba(124,58,237,0.07)' }}>
                      <td style={{ padding:'16px 20px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <div style={{ width:'32px', height:'32px', borderRadius:'9px', background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <span style={{ fontFamily:"'Cinzel',serif", fontSize:'13px', fontWeight:700, color:'#a78bfa' }}>{user.email?.[0]?.toUpperCase()}</span>
                          </div>
                          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'13px', color:'rgba(255,255,255,0.85)', fontWeight:400 }}>
                            {searchQuery ? (() => {
                              const idx = user.email.toLowerCase().indexOf(searchQuery.toLowerCase());
                              if (idx === -1) return user.email;
                              return <>
                                {user.email.slice(0, idx)}
                                <span style={{ color:'#a78bfa', fontWeight:600, background:'rgba(167,139,250,0.12)', borderRadius:'3px', padding:'0 2px' }}>{user.email.slice(idx, idx + searchQuery.length)}</span>
                                {user.email.slice(idx + searchQuery.length)}
                              </>;
                            })() : user.email}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding:'16px 20px' }}>
                        <span style={{ fontFamily:"'Cinzel',serif", fontSize:'14px', fontWeight:700, color:'#34d399' }}>${user.balance ? user.balance.toFixed(2) : '0.00'}</span>
                      </td>
                      <td style={{ padding:'16px 20px' }}>{statusBadge(user.status)}</td>
                      <td style={{ padding:'14px 20px' }}>
                        <div style={{ display:'flex', justifyContent:'flex-end', gap:'6px', flexWrap:'wrap' }}>
                          {user.status === 'active' && (
                            <button className="act-btn btn-funds" onClick={() => setBalanceModal({ show:true, user })}>
                              <DollarSign size={13} /><span className="btn-label">Funds</span>
                            </button>
                          )}
                          {(user.status === 'pending' || user.status === 'disabled') && (
                            <button className="act-btn btn-approve" onClick={() => setConfirmModal({ show:true, type:'approve', user })}>
                              <UserCheck size={13} /><span className="btn-label">Approve</span>
                            </button>
                          )}
                          {user.status === 'active' && (
                            <button className="act-btn btn-disable" onClick={() => setConfirmModal({ show:true, type:'disable', user })}>
                              <UserX size={13} /><span className="btn-label">Disable</span>
                            </button>
                          )}
                          <button className="act-btn btn-delete" onClick={() => setConfirmModal({ show:true, type:'delete', user })}>
                            <Trash2 size={13} /><span className="btn-label">Delete</span>
                          </button>
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

      <AddBalanceModal show={balanceModal.show} user={balanceModal.user} onClose={() => setBalanceModal({ show:false, user:null })} onConfirm={handleAddBalance} onSetZero={handleSetZero} />
      <ConfirmModal show={confirmModal.show} type={confirmModal.type} user={confirmModal.user} onClose={() => setConfirmModal({ show:false, type:'', user:null })}
        onConfirm={() => {
          if (confirmModal.type === 'delete') handleDeleteUser(confirmModal.user.id);
          else handleUpdateStatus(confirmModal.user.id, confirmModal.type === 'approve' ? 'active' : 'disabled');
        }}
      />
      <Toast show={toast.show} message={toast.message} />
    </>
  );
};

export default Users;