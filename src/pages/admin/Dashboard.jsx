import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import {
  Users, Package, Key, DollarSign, UserPlus, FilePlus, Database,
} from 'lucide-react';
import AdminNavbar from '../../components/AdminNavbar';

// ─── Admin Dashboard ─────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats]     = useState({ resellers: 0, software: 0, keys: 0, totalBalance: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setTimeout(() => setMounted(true), 80);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    const qUsers = query(collection(db, "users"), where("role", "==", "reseller"));
    const unsubUsers = onSnapshot(qUsers, snapshot => {
      let activeCount = 0, balanceSum = 0;
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.status === "active") activeCount++;
        if (d.balance) balanceSum += d.balance;
      });
      setStats(prev => ({ ...prev, resellers: activeCount, totalBalance: balanceSum }));
    });
    const qSoftware = query(collection(db, "software"), where("active", "==", true));
    const unsubSoftware = onSnapshot(qSoftware, s => setStats(prev => ({ ...prev, software: s.size })));
    const qKeys = query(collection(db, "keys"), where("status", "==", "available"));
    const unsubKeys = onSnapshot(qKeys, s => setStats(prev => ({ ...prev, keys: s.size })));
    return () => { unsubUsers(); unsubSoftware(); unsubKeys(); };
  }, []);

  const statCards = [
    { label: 'Total Resellers', value: stats.resellers,                     sub: 'Active accounts', icon: <Users size={20} />,      color: '#818cf8', glow: 'rgba(129,140,248,0.13)', border: 'rgba(129,140,248,0.2)' },
    { label: 'Total Software',  value: stats.software,                      sub: 'Active products', icon: <Package size={20} />,    color: '#a78bfa', glow: 'rgba(167,139,250,0.13)', border: 'rgba(167,139,250,0.2)' },
    { label: 'Available Keys',  value: stats.keys,                          sub: 'Ready to sell',   icon: <Key size={20} />,        color: '#34d399', glow: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.2)'  },
    { label: 'Total Balance',   value: `$${stats.totalBalance.toFixed(2)}`, sub: 'All resellers',   icon: <DollarSign size={20} />, color: '#fbbf24', glow: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.2)'  },
  ];

  const quickActions = [
    { label: 'Manage Resellers', desc: 'Review and approve requests', icon: <UserPlus size={22} />, color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)', path: '/admin/users' },
    { label: 'Add Software',     desc: 'Add new software product',    icon: <FilePlus size={22} />, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)', path: '/admin/add-software' },
    { label: 'Add Keys',         desc: 'Bulk add license keys',       icon: <Database size={22} />, color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)',  path: '/admin/add-keys' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .stat-card { transition: transform 0.22s ease; }
        .stat-card:hover { transform: translateY(-4px); }
        .act-card  { transition: transform 0.22s ease; cursor: pointer; }
        .act-card:hover  { transform: translateY(-3px); }
        .dash-grid   { grid-template-columns: repeat(4,1fr) !important; }
        .action-grid { grid-template-columns: repeat(3,1fr) !important; }
        @media (max-width: 1024px) {
          .dash-grid   { grid-template-columns: repeat(2,1fr) !important; }
          .action-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 560px) {
          .dash-grid   { grid-template-columns: 1fr !important; }
          .action-grid { grid-template-columns: 1fr !important; }
          .dash-inner  { padding: 88px 16px 40px !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#06060f', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden' }}>

        {/* Grid bg */}
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, backgroundImage:`linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)`, backgroundSize:'44px 44px' }} />
        {/* Glows */}
        <div style={{ position:'fixed', top:'-200px', left:'-200px', zIndex:0, width:'600px', height:'600px', borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle, rgba(109,40,217,0.15) 0%, transparent 65%)' }} />
        <div style={{ position:'fixed', bottom:'-150px', right:'-150px', zIndex:0, width:'500px', height:'500px', borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 65%)' }} />

        {/* ✅ AdminNavbar - no props needed */}
        <AdminNavbar />

        {/* Content */}
        <div className="dash-inner" style={{
          position: 'relative', zIndex: 1,
          maxWidth: '1280px', margin: '0 auto',
          padding: '96px 32px 48px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>

          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
              <div style={{ width:'28px', height:'1px', background:'rgba(124,58,237,0.55)' }} />
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#7c3aed', letterSpacing:'0.12em', fontWeight:500 }}>Overview</span>
            </div>
            <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:'26px', fontWeight:700, color:'white', letterSpacing:'0.04em', margin:'0 0 8px' }}>Admin Dashboard</h1>
            <p style={{ color:'rgba(107,114,128,0.9)', fontSize:'14px', margin:0, fontWeight:300 }}>Welcome back! Here's your real-time system overview.</p>
          </div>

          {/* Stats */}
          <div className="dash-grid" style={{ display:'grid', gap:'16px', marginBottom:'40px' }}>
            {statCards.map((card, i) => (
              <div key={i} className="stat-card" style={{
                background: 'linear-gradient(145deg, rgba(18,14,38,0.96), rgba(10,8,24,0.98))',
                border: `1px solid ${card.border}`, borderRadius: '18px', padding: '24px',
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)',
                animation: `fadeUp 0.5s ease ${i * 0.08}s both`,
              }}>
                <div style={{ position:'absolute', top:0, right:0, width:'110px', height:'110px', borderRadius:'50%', background:`radial-gradient(circle, ${card.glow} 0%, transparent 70%)`, pointerEvents:'none' }} />
                <div style={{ position:'absolute', top:'20px', right:'20px', width:'42px', height:'42px', borderRadius:'12px', background:card.glow, border:`1px solid ${card.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:card.color }}>
                  {card.icon}
                </div>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'rgba(107,114,128,0.8)', letterSpacing:'0.08em', marginBottom:'10px', fontWeight:500 }}>{card.label}</p>
                <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:'30px', fontWeight:700, color:'white', margin:'0 0 8px', letterSpacing:'-0.02em' }}>{card.value}</h2>
                <p style={{ fontSize:'12px', color:card.color, margin:0, fontWeight:400 }}>↑ {card.sub}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
              <div style={{ width:'28px', height:'1px', background:'rgba(124,58,237,0.55)' }} />
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#7c3aed', letterSpacing:'0.12em', fontWeight:500 }}>Quick Actions</span>
            </div>
            <div className="action-grid" style={{ display:'grid', gap:'16px' }}>
              {quickActions.map((a, i) => (
                <button key={i} onClick={() => navigate(a.path)} className="act-card" style={{
                  background: 'linear-gradient(145deg, rgba(18,14,38,0.96), rgba(10,8,24,0.98))',
                  border: `1px solid ${a.border}`, borderRadius: '18px', padding: '22px',
                  display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                  animation: `fadeUp 0.5s ease ${0.32 + i * 0.08}s both`,
                }}>
                  <div style={{ width:'50px', height:'50px', borderRadius:'14px', background:a.bg, border:`1px solid ${a.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:a.color, flexShrink:0 }}>
                    {a.icon}
                  </div>
                  <div>
                    <p style={{ fontFamily:"'Cinzel',serif", fontSize:'14px', fontWeight:600, color:'white', margin:'0 0 5px', letterSpacing:'0.03em' }}>{a.label}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', color:'rgba(107,114,128,0.8)', margin:0, fontWeight:300 }}>{a.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminDashboard;