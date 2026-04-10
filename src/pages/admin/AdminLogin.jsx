import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { Shield, Mail, Lock, LogIn, Zap, Eye, EyeOff } from 'lucide-react';

// ─── Admin Navbar ────────────────────────────────────────────────────
const AdminNavbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(6,6,18,0.94)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(124,58,237,0.15)' : '1px solid transparent',
      padding: '0 24px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(124,58,237,0.5)' }}>
            <Zap size={16} color="white" fill="white" />
          </div>
          <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: '17px', color: 'white', letterSpacing: '0.05em' }}>
            DYNAMIC<span style={{ color: '#7c3aed' }}>X</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.28)', borderRadius: '100px', padding: '6px 14px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 6px #a78bfa', animation: 'nbpulse 2s infinite' }} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#a78bfa', fontWeight: 500, letterSpacing: '0.08em' }}>Admin Portal</span>
        </div>
      </div>
    </nav>
  );
};

// ─── Verifying Screen ─────────────────────────────────────────────────
const AdminVerifying = () => {
  const [step, setStep] = useState(0);
  const steps = ['Authenticating credentials...', 'Checking permissions...', 'Verifying admin access...'];

  useEffect(() => {
    const interval = setInterval(() => setStep(s => (s + 1) % steps.length), 1100);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @keyframes ringPulse  { 0%,100%{opacity:0.25;transform:scale(1)} 50%{opacity:0.08;transform:scale(1.35)} }
        @keyframes ringPulse2 { 0%,100%{opacity:0.15;transform:scale(1)} 50%{opacity:0.04;transform:scale(1.55)} }
        @keyframes shimmer    { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes dotBounce  { 0%,80%,100%{transform:translateY(0);opacity:0.35} 40%{transform:translateY(-6px);opacity:1} }
        @keyframes stepFade   { 0%{opacity:0;transform:translateY(6px)} 15%{opacity:1;transform:translateY(0)} 85%{opacity:1} 100%{opacity:0} }
        .av-shimmer-text {
          background: linear-gradient(90deg, rgba(167,139,250,0.5) 0%, #a78bfa 40%, #c4b5fd 55%, rgba(167,139,250,0.5) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 2.4s linear infinite;
        }
        .av-step-text { animation: stepFade 1.1s ease both; }
      `}</style>

      <AdminNavbar />

      <div style={{
        minHeight: '100vh', background: '#06060f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '80px 16px 32px', fontFamily: "'DM Sans', sans-serif",
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(124,58,237,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.035) 1px,transparent 1px)`, backgroundSize: '44px 44px' }} />
        <div style={{ position: 'absolute', top: '-160px', left: '-160px', width: '520px', height: '520px', borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle,rgba(109,40,217,0.22) 0%,transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-120px', right: '-120px', width: '440px', height: '440px', borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle,rgba(79,70,229,0.17) 0%,transparent 65%)' }} />

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Spinner + Shield */}
          <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '36px' }}>
            <div style={{ position: 'absolute', inset: '-18px', borderRadius: '50%', border: '1px solid rgba(124,58,237,0.3)', animation: 'ringPulse 2.2s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', inset: '-36px', borderRadius: '50%', border: '1px solid rgba(124,58,237,0.15)', animation: 'ringPulse2 2.2s ease-in-out infinite 0.4s' }} />
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: '1.5px solid rgba(124,58,237,0.12)', position: 'absolute' }} />
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#7c3aed', borderRightColor: 'rgba(124,58,237,0.3)', position: 'absolute', animation: 'spin 0.9s cubic-bezier(0.4,0,0.2,1) infinite', boxShadow: '0 0 18px rgba(124,58,237,0.3)' }} />
            <div style={{ width: '46px', height: '46px', borderRadius: '13px', background: 'linear-gradient(135deg,rgba(124,58,237,0.18),rgba(79,70,229,0.1))', border: '1px solid rgba(124,58,237,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(124,58,237,0.18)', position: 'relative', zIndex: 1 }}>
              <Shield size={20} color="#a78bfa" strokeWidth={1.5} />
            </div>
          </div>

          {/* Title */}
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '20px', fontWeight: 700, letterSpacing: '0.06em', margin: '0 0 10px', lineHeight: 1 }} className="av-shimmer-text">
            Admin Portal
          </h2>

          {/* Cycling step text */}
          <div style={{ height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <span key={step} className="av-step-text" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(167,139,250,0.75)', fontWeight: 300, letterSpacing: '0.04em' }}>
              {steps[step]}
            </span>
          </div>

          {/* Bouncing dots */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '28px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#7c3aed', animation: `dotBounce 1.4s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '44px' }}>
            <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(124,58,237,0.35))' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(109,40,217,0.4)' }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'rgba(109,40,217,0.45)', fontWeight: 300, letterSpacing: '0.1em' }}>
                Restricted area — unauthorized access prohibited
              </span>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(109,40,217,0.4)' }} />
            </div>
            <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg,rgba(124,58,237,0.35),transparent)' }} />
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Admin Login Page ────────────────────────────────────────────────
const AdminLogin = () => {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [focused, setFocused]     = useState('');
  const [mounted, setMounted]     = useState(false);
  const [error, setError]         = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setTimeout(() => setMounted(true), 80);
    return () => document.head.removeChild(link);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    setIsVerifying(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", res.user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.role === "admin") {
          navigate("/admin");
        } else {
          await auth.signOut();
          setIsVerifying(false);
          setError("Access Denied. You are not an admin.");
        }
      } else {
        await auth.signOut();
        setIsVerifying(false);
        setError("User not found in database.");
      }
    } catch (err) {
      const msg =
        err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
          ? "Invalid email or password."
          : err.code === 'auth/invalid-email'
          ? "Please enter a valid email address."
          : err.code === 'auth/too-many-requests'
          ? "Too many failed attempts. Please try again later."
          : "Something went wrong. Please try again.";
      setIsVerifying(false);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) return <AdminVerifying />;

  const inputStyle = (name) => ({
    width: '100%', boxSizing: 'border-box',
    padding: '13px 14px 13px 40px',
    background: focused === name ? 'rgba(124,58,237,0.05)' : 'rgba(6,6,18,0.8)',
    border: focused === name ? '1px solid rgba(124,58,237,0.6)' : '1px solid rgba(55,48,80,0.7)',
    borderRadius: '12px', color: 'white',
    fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
    outline: 'none', transition: 'all 0.2s',
    boxShadow: focused === name ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes nbpulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }

        .al-input::placeholder { color: rgba(156,163,175,0.45); font-style: italic; }
        .al-input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #06060f inset !important;
          -webkit-text-fill-color: white !important;
        }
        .al-btn:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 14px 36px rgba(124,58,237,0.48) !important;
        }
        .al-btn:active:not(:disabled) { transform: translateY(0) !important; }
        .al-eye:hover { color: rgba(167,139,250,0.9) !important; }
      `}</style>

      <AdminNavbar />

      <div style={{
        minHeight: '100vh', background: '#06060f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '80px 16px 32px',
        fontFamily: "'DM Sans', sans-serif",
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(124,58,237,0.035) 1px, transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.035) 1px,transparent 1px)`, backgroundSize: '44px 44px' }} />
        <div style={{ position: 'absolute', top: '-160px', left: '-160px', width: '520px', height: '520px', borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle,rgba(109,40,217,0.22) 0%,transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-120px', right: '-120px', width: '440px', height: '440px', borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle,rgba(79,70,229,0.17) 0%,transparent 65%)' }} />

        <div style={{
          position: 'relative', width: '100%', maxWidth: '430px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(28px)',
          transition: 'opacity 0.55s ease, transform 0.55s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(124,58,237,0.45))' }} />
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#7c3aed', letterSpacing: '0.15em', fontWeight: 500 }}>Secure Access</span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,rgba(124,58,237,0.45),transparent)' }} />
          </div>

          <div style={{
            background: 'linear-gradient(160deg,rgba(18,14,38,0.97),rgba(10,8,24,0.99))',
            border: '1px solid rgba(124,58,237,0.18)',
            borderRadius: '24px', padding: '40px 36px',
            boxShadow: '0 40px 100px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.03)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent 5%,rgba(124,58,237,0.5) 50%,transparent 95%)' }} />

            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ width: '68px', height: '68px', borderRadius: '18px', background: 'linear-gradient(135deg,rgba(124,58,237,0.18),rgba(79,70,229,0.1))', border: '1px solid rgba(124,58,237,0.28)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', boxShadow: '0 0 32px rgba(124,58,237,0.18)' }}>
                <Shield size={30} color="#a78bfa" strokeWidth={1.5} />
              </div>
              <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: '24px', fontWeight: 700, color: 'white', letterSpacing: '0.04em', margin: '0 0 6px' }}>Admin Portal</h1>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: 'rgba(156,163,175,0.7)', fontWeight: 300, margin: 0 }}>Authorized personnel only</p>
            </div>

            {error && (
              <div style={{
                marginBottom: '20px', padding: '11px 14px', borderRadius: '10px',
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
                display: 'flex', alignItems: 'center', gap: '8px',
                animation: 'fadeUp 0.25s ease both',
              }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f87171', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: 'rgba(248,113,113,0.9)', fontWeight: 400 }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 500, color: 'rgba(156,163,175,0.8)', letterSpacing: '0.05em' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: focused === 'email' ? '#a78bfa' : '#4b5563', transition: 'color 0.2s', pointerEvents: 'none' }}>
                    <Mail size={14} />
                  </div>
                  <input
                    type="email" className="al-input" placeholder="admin@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    required style={inputStyle('email')}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 500, color: 'rgba(156,163,175,0.8)', letterSpacing: '0.05em' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: focused === 'password' ? '#a78bfa' : '#4b5563', transition: 'color 0.2s', pointerEvents: 'none' }}>
                    <Lock size={14} />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'} className="al-input" placeholder="••••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                    required style={{ ...inputStyle('password'), paddingRight: '42px' }}
                  />
                  <button type="button" className="al-eye" onClick={() => setShowPass(v => !v)}
                    style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(107,114,128,0.5)', transition: 'color 0.2s', padding: 0 }}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,rgba(124,58,237,0.2),transparent)' }} />

              <button type="submit" disabled={isLoading} className="al-btn" style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: isLoading ? 'rgba(109,40,217,0.35)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                color: 'white', fontSize: '13px',
                fontFamily: "'Cinzel',serif", fontWeight: 600, letterSpacing: '0.08em',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: isLoading ? 'none' : '0 8px 28px rgba(124,58,237,0.38)',
                transition: 'all 0.22s ease',
              }}>
                {isLoading ? (
                  <>
                    <div style={{ width: '15px', height: '15px', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.65s linear infinite' }} />
                    Verifying...
                  </>
                ) : (
                  <><LogIn size={15} /> Login as Admin</>
                )}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(109,40,217,0.4)' }} />
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: 'rgba(109,40,217,0.5)', fontWeight: 300, letterSpacing: '0.05em' }}>
                Restricted area — unauthorized access prohibited
              </span>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(109,40,217,0.4)' }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;