import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { LayoutDashboard, Users, Package, Key, LogOut, Zap, Menu, X } from 'lucide-react';

const AdminNavbar = () => {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin-login'); // ✅ Admin logout → admin login page
  };

  const navLinks = [
    { label: 'Dashboard', icon: <LayoutDashboard size={14} />, path: '/admin' },
    { label: 'Resellers', icon: <Users size={14} />,           path: '/admin/users' },
    { label: 'Software',  icon: <Package size={14} />,         path: '/admin/software' },
    { label: 'Keys',      icon: <Key size={14} />,             path: '/admin/keys' },
  ];

  return (
    <>
      <style>{`
        @keyframes nbpulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .anav-link {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 13px; border-radius: 8px;
          font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 500;
          color: rgba(156,163,175,0.8); border: 1px solid transparent;
          cursor: pointer; background: none;
          transition: all 0.2s ease; letter-spacing: 0.02em;
        }
        .anav-link:hover { color: white; background: rgba(124,58,237,0.1); border-color: rgba(124,58,237,0.22); }
        .anav-logout {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 9px;
          font-size: 12px; font-family: 'DM Sans', sans-serif;
          font-weight: 500; letter-spacing: 0.04em;
          color: #fca5a5; background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          cursor: pointer; transition: all 0.2s ease;
        }
        .anav-logout:hover { background: rgba(239,68,68,0.16); border-color: rgba(239,68,68,0.4); color: white; }
        .mob-link {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px; border-radius: 10px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: rgba(156,163,175,0.8); cursor: pointer;
          background: none; border: 1px solid transparent; width: 100%;
          transition: all 0.2s;
        }
        .mob-link:hover { color: white; background: rgba(124,58,237,0.1); border-color: rgba(124,58,237,0.2); }
        @media (max-width: 768px) {
          .desk-nav      { display: none !important; }
          .mob-toggle    { display: flex !important; }
          .anav-badge    { display: none !important; }
        }
        @media (max-width: 400px) {
          .anav-logout-text { display: none; }
        }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(6,6,18,0.94)' : 'rgba(6,6,18,0.7)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(124,58,237,0.12)',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div onClick={() => navigate('/admin')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(124,58,237,0.45)' }}>
              <Zap size={16} color="white" fill="white" />
            </div>
            <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: '17px', color: 'white', letterSpacing: '0.05em' }}>
              DYNAMIX<span style={{ color: '#7c3aed' }}>X</span>
            </span>
          </div>

          <div className="desk-nav" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {navLinks.map(link => (
              <button key={link.path} onClick={() => navigate(link.path)} className="anav-link">
                {link.icon} {link.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="anav-badge" style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '100px', padding: '5px 13px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 6px #a78bfa', animation: 'nbpulse 2s infinite' }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#a78bfa', fontWeight: 500, letterSpacing: '0.06em' }}>Admin</span>
            </div>
            <button onClick={handleLogout} className="anav-logout">
              <LogOut size={13} /> <span className="anav-logout-text">Logout</span>
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="mob-toggle"
              style={{ display: 'none', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '8px', padding: '7px', color: '#a78bfa', cursor: 'pointer' }}>
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div style={{ borderTop: '1px solid rgba(124,58,237,0.1)', padding: '10px 0 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navLinks.map(link => (
              <button key={link.path} onClick={() => { navigate(link.path); setMobileOpen(false); }} className="mob-link">
                {link.icon} {link.label}
              </button>
            ))}
          </div>
        )}
      </nav>
    </>
  );
};

export default AdminNavbar;