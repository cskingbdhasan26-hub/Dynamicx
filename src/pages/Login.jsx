import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [focused, setFocused]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", res.user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // ✅ ROLE CHECK FIRST — admin has no status field
        if (userData.role === "admin") {
          navigate("/admin");
        } else if (userData.status === "pending") {
          setError("Your account is awaiting admin approval. You will be notified within 12–24 hours.");
          await auth.signOut();
        } else if (userData.status === "disabled") {
          setError("Your account has been disabled. Please contact the administrator.");
          await auth.signOut();
        } else if (userData.role === "reseller" && userData.status === "active") {
          navigate("/reseller");
        } else {
          setError("Access denied. Please contact the administrator.");
          await auth.signOut();
        }
      } else {
        setError("User data not found. Please contact support.");
        await auth.signOut();
      }
    } catch (err) {
      const msg =
        err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
          ? "Invalid email or password."
          : err.code === 'auth/invalid-email'
          ? "Please enter a valid email address."
          : err.code === 'auth/too-many-requests'
          ? "Too many failed attempts. Please try again later."
          : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputBase = (name) => ({
    width: '100%', boxSizing: 'border-box',
    padding: '13px 14px 13px 42px',
    background: focused === name ? 'rgba(124,58,237,0.05)' : 'rgba(6,6,18,0.7)',
    border: focused === name
      ? '1px solid rgba(124,58,237,0.6)'
      : '1px solid rgba(55,48,80,0.7)',
    borderRadius: '12px', color: 'white',
    fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
    outline: 'none', transition: 'all 0.2s',
    boxShadow: focused === name ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .lg-input::placeholder { color:rgba(107,114,128,0.4); font-style:italic; }
        .lg-input:-webkit-autofill {
          -webkit-box-shadow:0 0 0 100px #06060f inset !important;
          -webkit-text-fill-color:white !important;
        }
        .submit-btn:hover:not(:disabled) {
          transform:translateY(-2px) !important;
          box-shadow:0 14px 36px rgba(124,58,237,0.45) !important;
        }
        .submit-btn:active:not(:disabled) { transform:translateY(0) !important; }
        .eye-btn:hover { color:rgba(167,139,250,0.9) !important; }
        .signup-link:hover { color:#a78bfa !important; }
      `}</style>

      <div style={{
        minHeight: '100vh', background: '#06060f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
        position: 'relative', overflow: 'hidden', padding: '24px',
      }}>
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.03) 1px,transparent 1px)`, backgroundSize: '44px 44px' }} />
        <div style={{ position: 'fixed', top: '-200px', left: '-200px', width: '600px', height: '600px', borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle,rgba(109,40,217,0.14) 0%,transparent 65%)' }} />
        <div style={{ position: 'fixed', bottom: '-150px', right: '-150px', width: '500px', height: '500px', borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle,rgba(79,70,229,0.1) 0%,transparent 65%)' }} />

        <div style={{
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: '420px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px', animation: 'fadeUp 0.5s ease 0.05s both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}>
                <LogIn size={18} color="white" />
              </div>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: '18px', fontWeight: 700, color: 'white', letterSpacing: '0.08em' }}>DynamicX</span>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(107,114,128,0.7)', margin: 0, letterSpacing: '0.06em', fontWeight: 300 }}>RESELLER PORTAL</p>
          </div>

          <div style={{
            background: 'linear-gradient(145deg,rgba(18,14,38,0.96),rgba(10,8,24,0.98))',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '22px', overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
            animation: 'fadeUp 0.5s ease 0.12s both',
          }}>
            <div style={{ height: '1px', background: 'linear-gradient(90deg,transparent 5%,rgba(124,58,237,0.5) 50%,transparent 95%)' }} />

            <div style={{ padding: '32px' }}>
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '20px', height: '1px', background: 'rgba(124,58,237,0.55)' }} />
                  <span style={{ fontSize: '10px', color: '#7c3aed', letterSpacing: '0.14em', fontWeight: 500 }}>SECURE ACCESS</span>
                </div>
                <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: '22px', fontWeight: 700, color: 'white', margin: '0 0 6px', letterSpacing: '0.04em' }}>
                  Welcome Back
                </h1>
                <p style={{ fontSize: '13px', color: 'rgba(107,114,128,0.8)', margin: 0, fontWeight: 300, lineHeight: 1.6 }}>
                  Sign in to your reseller account to continue.
                </p>
              </div>

              {error && (
                <div style={{
                  marginBottom: '20px', padding: '11px 14px', borderRadius: '10px',
                  background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f87171', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: 'rgba(248,113,113,0.9)', fontWeight: 400 }}>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: focused === 'email' ? '#a78bfa' : 'rgba(107,114,128,0.55)', transition: 'color 0.2s', pointerEvents: 'none' }}>
                    <Mail size={15} />
                  </div>
                  <input
                    type="email" required placeholder="Email address"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    className="lg-input" style={inputBase('email')}
                  />
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: focused === 'pass' ? '#a78bfa' : 'rgba(107,114,128,0.55)', transition: 'color 0.2s', pointerEvents: 'none' }}>
                    <Lock size={15} />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'} required placeholder="Password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('pass')} onBlur={() => setFocused('')}
                    className="lg-input" style={{ ...inputBase('pass'), paddingRight: '42px' }}
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(v => !v)}
                    style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(107,114,128,0.5)', transition: 'color 0.2s', padding: 0 }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <button type="submit" disabled={isLoading} className="submit-btn" style={{
                  marginTop: '4px', width: '100%', padding: '13px',
                  borderRadius: '12px', border: 'none',
                  background: isLoading ? 'rgba(109,40,217,0.35)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                  color: 'white', fontSize: '13px',
                  fontFamily: "'Cinzel',serif", fontWeight: 600, letterSpacing: '0.08em',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: isLoading ? 'none' : '0 8px 28px rgba(124,58,237,0.35)',
                  transition: 'all 0.22s ease',
                }}>
                  {isLoading ? (
                    <>
                      <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.65s linear infinite' }} />
                      Signing In...
                    </>
                  ) : (
                    <><LogIn size={14} /> Sign In</>
                  )}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0 20px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(55,48,80,0.6)' }} />
                <span style={{ fontSize: '11px', color: 'rgba(107,114,128,0.5)', fontWeight: 300 }}>Don't have an account?</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(55,48,80,0.6)' }} />
              </div>

              <Link to="/signup" style={{ display: 'block', textDecoration: 'none' }}>
                <div className="signup-link" style={{
                  width: '100%', padding: '12px',
                  borderRadius: '12px', border: '1px solid rgba(124,58,237,0.25)',
                  background: 'transparent', color: 'rgba(167,139,250,0.8)',
                  fontSize: '13px', fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'all 0.2s', cursor: 'pointer',
                  boxSizing: 'border-box', textAlign: 'center',
                }}>
                  Create a reseller account →
                </div>
              </Link>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: 'rgba(107,114,128,0.4)', fontWeight: 300, animation: 'fadeUp 0.5s ease 0.25s both' }}>
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;