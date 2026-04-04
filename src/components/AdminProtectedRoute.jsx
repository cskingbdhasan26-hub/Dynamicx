import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AdminProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (isMounted) setStatus("denied");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!isMounted) return;

        if (userDoc.exists() && userDoc.data().role === "admin") {
          setStatus("allowed");
        } else {
          setStatus("denied");
        }
      } catch (err) {
        console.error("Admin auth check failed:", err);
        if (isMounted) setStatus("denied");
      }
    });

    return () => { isMounted = false; unsubscribe(); };
  }, []);

  if (status === "loading") {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#06060f', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', margin: '0 auto 16px', border: '3px solid rgba(124,58,237,0.25)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'rgba(107,114,128,0.7)', fontSize: '13px', margin: 0 }}>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // ✅ denied হলে /admin-login এ পাঠাও
  return status === "allowed" ? children : <Navigate to="/admin-login" replace />;
};

export default AdminProtectedRoute;