import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { LayoutDashboard, Users, Package, Key, LogOut, Zap, Menu, X, Settings, Mail, Lock, Eye, EyeOff, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

// ─── Settings Modal ──────────────────────────────────────────────────
const SettingsModal = ({ onClose }) => {
  const [tab, setTab]                 = useState('email'); // 'email' | 'password'

  // Email change
  const [newEmail, setNewEmail]       = useState('');
  const [emailPass, setEmailPass]     = useState('');

  // Password change
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass]         = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [showPasses, setShowPasses]   = useState({ current: false, new: false, confirm: false, emailPass: false });
  const [loading, setLoading]         = useState(false);
  const [toast, setToast]             = useState({ show: false, message: '', error: false });
  const [focused, setFocused]         = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const showToast = (message, error = false) => {
    setToast({ show: true, message, error });
    setTimeout(() => setToast({ show: false, message: '', error: false }), 3200);
  };

  const reauth = async (password) => {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  };

  const handleEmailChange = async () => {
    if (!newEmail.trim()) { showToast('Please enter a new email', true); return; }
    if (!emailPass.trim()) { showToast('Please enter your current password', true); return; }
    if (!/\S+@\S+\.\S+/.test(newEmail)) { showToast('Please enter a valid email address', true); return; }
    setLoading(true);
    try {
      await reauth(emailPass);
      const user = auth.currentUser;
      await updateEmail(user, newEmail.trim());
      // ✅ Firestore এও email update করো
      await updateDoc(doc(db, "users", user.uid), { email: newEmail.trim() });
      showToast('Email updated successfully! ✓');
      setNewEmail(''); setEmailPass('');
    } catch (err) {
      if (err.code === 'auth/wrong-password') showToast('Incorrect password!', true);
      else if (err.code === 'auth/email-already-in-use') showToast('This email is already in use!', true);
      else if (err.code === 'auth/requires-recent-login') showToast('Please login again and try', true);
      else showToast('Error: ' + err.message, true);
    } finally { setLoading(false); }
  };

  const handlePasswordChange = async () => {
    if (!currentPass) { showToast('Please enter your current password', true); return; }
    if (!newPass)     { showToast('Please enter a new password', true); return; }
    if (newPass.length < 6) { showToast('Password must be at least 6 characters', true); return; }
    if (newPass !== confirmPass) { showToast('Passwords do not match!', true); return; }
    setLoading(true);
    try {
      await reauth(currentPass);
      await updatePassword(auth.currentUser, newPass);
      showToast('Password updated successfully!');
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } catch (err) {
      if (err.code === 'auth/wrong-password') showToast('Current password is incorrect!', true);
      else if (err.code === 'auth/requires-recent-login') showToast('Please login again and try', true);
      else showToast('Error: ' + err.message, true);
    } finally { setLoading(false); }
  };

  const inp = (name, extra = {}) => ({
    width: '100%', boxSizing: 'border-box',
    padding: '11px 40px 11px 13px',
    background: focused === name ? 'rgba(124,58,237,0.05)' : 'rgba(6,6,18,0.85)',
    border: focused === name ? '1px solid rgba(124,58,237,0.6)' : '1px solid rgba(55,48,80,0.7)',
    borderRadius: '10px', color: 'white',
    fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
    outline: 'none', transition: 'all 0.2s',
    boxShadow: focused === name ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
    ...extra,
  });

  const lbl = { display: 'block', marginBottom: '7px', fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 500, color: 'rgba(156,163,175,0.75)', letterSpacing: '0.05em' };

  const EyeToggle = ({ name }) => (
    <button type="button" onClick={() => setShowPasses(p => ({ ...p, [name]: !p[name] }))}
      style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(107,114,128,0.6)', display: 'flex', padding: '2px', transition: 'color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
      onMouseLeave={e => e.currentTarget.style.color = 'rgba(107,114,128,0.6)'}
    >
      {showPasses[name] ? <EyeOff size={14} /> : <Eye size={14} />}
    </button>
  );

  return (
    <div onMouseDown={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', animation: 'fadeIn 0.18s ease' }}>
      <div onMouseDown={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', background: 'linear-gradient(160deg, rgba(18,14,38,0.99), rgba(10,8,24,1))', border: '1px solid rgba(124,58,237,0.22)', borderRadius: '22px', boxShadow: '0 40px 100px rgba(0,0,0,0.7)', overflow: 'hidden', animation: 'slideUp 0.22s cubic-bezier(.16,1,.3,1)' }}>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent 5%, rgba(124,58,237,0.55) 50%, transparent 95%)' }} />

        <div style={{ padding: '26px 28px 24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                <ShieldCheck size={19} />
              </div>
              <div>
                <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '15px', fontWeight: 700, color: 'white', margin: '0 0 3px', letterSpacing: '0.03em' }}>Account Settings</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'rgba(107,114,128,0.7)', margin: 0 }}>{auth.currentUser?.email}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '7px', color: '#6b7280', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'white'}
              onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
            ><X size={15} /></button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '22px', background: 'rgba(6,6,18,0.6)', border: '1px solid rgba(55,48,80,0.5)', borderRadius: '11px', padding: '4px' }}>
            {[
              { key: 'email', label: 'Change Email', icon: <Mail size={13} /> },
              { key: 'password', label: 'Change Password', icon: <Lock size={13} /> },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, transition: 'all 0.2s', background: tab === t.key ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'transparent', color: tab === t.key ? 'white' : 'rgba(156,163,175,0.65)', boxShadow: tab === t.key ? '0 4px 14px rgba(124,58,237,0.35)' : 'none' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Email Tab */}
          {tab === 'email' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '10px', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: '9px' }}>
                <Mail size={13} color="#a78bfa" />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'rgba(167,139,250,0.85)', fontWeight: 400 }}>Current: <strong style={{ color: '#a78bfa' }}>{auth.currentUser?.email}</strong></span>
              </div>

              <div>
                <label style={lbl}>New Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} onFocus={() => setFocused('newEmail')} onBlur={() => setFocused('')} style={inp('newEmail', { paddingRight: '13px' })} placeholder="admin@example.com" />
                </div>
              </div>
              <div>
                <label style={lbl}>Current Password (to verify)</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPasses.emailPass ? 'text' : 'password'} value={emailPass} onChange={e => setEmailPass(e.target.value)} onFocus={() => setFocused('emailPass')} onBlur={() => setFocused('')} style={inp('emailPass')} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleEmailChange()} />
                  <EyeToggle name="emailPass" />
                </div>
              </div>
              <button onClick={handleEmailChange} disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: '11px', background: loading ? 'rgba(109,40,217,0.35)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', color: 'white', fontSize: '13px', fontFamily: "'Cinzel', serif", fontWeight: 600, letterSpacing: '0.04em', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: loading ? 'none' : '0 6px 20px rgba(124,58,237,0.35)', transition: 'all 0.2s', marginTop: '4px' }}>
                {loading ? <><div style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.65s linear infinite' }} />Updating...</> : <><Mail size={14} />Update Email</>}
              </button>
            </div>
          )}

          {/* Password Tab */}
          {tab === 'password' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={lbl}>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPasses.current ? 'text' : 'password'} value={currentPass} onChange={e => setCurrentPass(e.target.value)} onFocus={() => setFocused('current')} onBlur={() => setFocused('')} style={inp('current')} placeholder="••••••••" />
                  <EyeToggle name="current" />
                </div>
              </div>
              <div>
                <label style={lbl}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPasses.new ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)} onFocus={() => setFocused('new')} onBlur={() => setFocused('')} style={inp('new')} placeholder="Min. 6 characters" />
                  <EyeToggle name="new" />
                </div>
                {/* Password strength */}
                {newPass && (
                  <div style={{ marginTop: '6px', display: 'flex', gap: '4px' }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: newPass.length >= i*3 ? (newPass.length >= 10 ? '#34d399' : newPass.length >= 6 ? '#fbbf24' : '#f87171') : 'rgba(55,48,80,0.5)', transition: 'all 0.3s' }} />
                    ))}
                    <span style={{ fontSize: '10px', color: newPass.length >= 10 ? '#34d399' : newPass.length >= 6 ? '#fbbf24' : '#f87171', fontFamily: "'DM Sans', sans-serif", marginLeft: '4px', whiteSpace: 'nowrap' }}>
                      {newPass.length >= 10 ? 'Strong' : newPass.length >= 6 ? 'Medium' : 'Weak'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label style={lbl}>Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPasses.confirm ? 'text' : 'password'} value={confirmPass} onChange={e => setConfirmPass(e.target.value)} onFocus={() => setFocused('confirm')} onBlur={() => setFocused('')}
                    style={inp('confirm', { borderColor: confirmPass && newPass && confirmPass !== newPass ? 'rgba(248,113,113,0.6)' : focused === 'confirm' ? 'rgba(124,58,237,0.6)' : 'rgba(55,48,80,0.7)' })}
                    placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handlePasswordChange()} />
                  <EyeToggle name="confirm" />
                </div>
                {confirmPass && newPass && confirmPass !== newPass && (
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#f87171', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={10} /> Passwords do not match
                  </p>
                )}
                {confirmPass && newPass && confirmPass === newPass && (
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#34d399', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={10} /> Passwords match ✓
                  </p>
                )}
              </div>
              <button onClick={handlePasswordChange} disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: '11px', background: loading ? 'rgba(109,40,217,0.35)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', color: 'white', fontSize: '13px', fontFamily: "'Cinzel', serif", fontWeight: 600, letterSpacing: '0.04em', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: loading ? 'none' : '0 6px 20px rgba(124,58,237,0.35)', transition: 'all 0.2s', marginTop: '4px' }}>
                {loading ? <><div style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.65s linear infinite' }} />Updating...</> : <><Lock size={14} />Update Password</>}
              </button>
            </div>
          )}
        </div>

        {/* Toast inside modal */}
        <div style={{ margin: '0 28px 20px', padding: '11px 14px', borderRadius: '10px', background: toast.error ? 'rgba(248,113,113,0.1)' : 'rgba(52,211,153,0.1)', border: `1px solid ${toast.error ? 'rgba(248,113,113,0.3)' : 'rgba(52,211,153,0.3)'}`, display: 'flex', alignItems: 'center', gap: '9px', opacity: toast.show ? 1 : 0, transform: toast.show ? 'translateY(0)' : 'translateY(6px)', transition: 'all 0.3s ease', pointerEvents: 'none' }}>
          {toast.error ? <AlertTriangle size={14} color="#f87171" /> : <CheckCircle size={14} color="#34d399" />}
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: toast.error ? '#f87171' : '#34d399', fontWeight: 400 }}>{toast.message}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Admin Navbar ─────────────────────────────────────────────────────
const AdminNavbar = () => {
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin-login');
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
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .anav-link {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 13px; border-radius: 8px;
          font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 500;
          color: rgba(156,163,175,0.8); border: 1px solid transparent;
          cursor: pointer; background: none;
          transition: all 0.2s ease; letter-spacing: 0.02em;
        }
        .anav-link:hover { color: white; background: rgba(124,58,237,0.1); border-color: rgba(124,58,237,0.22); }
        .anav-settings {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 13px; border-radius: 9px;
          font-size: 12px; font-family: 'DM Sans', sans-serif;
          font-weight: 500; letter-spacing: 0.03em;
          color: #a78bfa; background: rgba(124,58,237,0.08);
          border: 1px solid rgba(124,58,237,0.2);
          cursor: pointer; transition: all 0.2s ease;
        }
        .anav-settings:hover { background: rgba(124,58,237,0.18); border-color: rgba(124,58,237,0.45); color: white; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(124,58,237,0.2); }
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
          .anav-settings-text { display: none; }
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
          {/* Logo */}
          <div onClick={() => navigate('/admin')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(124,58,237,0.45)' }}>
              <Zap size={16} color="white" fill="white" />
            </div>
            <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: '17px', color: 'white', letterSpacing: '0.05em' }}>
              DYNAMIC<span style={{ color: '#7c3aed' }}>X</span>
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="desk-nav" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {navLinks.map(link => (
              <button key={link.path} onClick={() => navigate(link.path)} className="anav-link">
                {link.icon} {link.label}
              </button>
            ))}
          </div>

          {/* Right side buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="anav-badge" style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '100px', padding: '5px 13px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 6px #a78bfa', animation: 'nbpulse 2s infinite' }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#a78bfa', fontWeight: 500, letterSpacing: '0.06em' }}>Admin</span>
            </div>

            {/* ✅ Settings Button */}
            <button onClick={() => setSettingsOpen(true)} className="anav-settings" title="Account Settings">
              <Settings size={13} />
              <span className="anav-settings-text">Settings</span>
            </button>

            <button onClick={handleLogout} className="anav-logout">
              <LogOut size={13} /> <span className="anav-logout-text">Logout</span>
            </button>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="mob-toggle"
              style={{ display: 'none', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '8px', padding: '7px', color: '#a78bfa', cursor: 'pointer' }}>
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ borderTop: '1px solid rgba(124,58,237,0.1)', padding: '10px 0 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navLinks.map(link => (
              <button key={link.path} onClick={() => { navigate(link.path); setMobileOpen(false); }} className="mob-link">
                {link.icon} {link.label}
              </button>
            ))}
            {/* Settings in mobile menu too */}
            <button onClick={() => { setSettingsOpen(true); setMobileOpen(false); }} className="mob-link" style={{ color: '#a78bfa' }}>
              <Settings size={14} /> Account Settings
            </button>
          </div>
        )}
      </nav>

      {/* Settings Modal */}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  );
};

export default AdminNavbar;