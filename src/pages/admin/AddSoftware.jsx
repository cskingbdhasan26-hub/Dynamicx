import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Package, UploadCloud, ArrowLeft, Loader2, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar';

const AddSoftware = () => {
  const [name, setName]               = useState('');
  const [price1, setPrice1]           = useState('');
  const [price7, setPrice7]           = useState('');
  const [price15, setPrice15]         = useState('');
  const [price30, setPrice30]         = useState('');
  const [price365, setPrice365]       = useState('');
  const [image, setImage]             = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [focused, setFocused]         = useState('');
  const [mounted, setMounted]         = useState(false);
  const [dragOver, setDragOver]       = useState(false);
  const [toast, setToast]             = useState({ show: false, message: '' });

  const navigate = useNavigate();

  const CLOUD_NAME    = "dhbsvyzja";
  const UPLOAD_PRESET = "DynamicX-Panel";

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setTimeout(() => setMounted(true), 80);
    return () => document.head.removeChild(link);
  }, []);

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 2800);
  };

  const handleImageChange = (file) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert("Image must be under 3MB."); return; }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImageChange(file);
  };

  const handleAddSoftware = async (e) => {
    e.preventDefault();
    // ── Only name is required now ──
    if (!name) {
      alert("Please provide a Software Name.");
      return;
    }
    // At least one price must be set
    if (!price1 && !price7 && !price15 && !price30 && !price365) {
      alert("Please set at least one pricing plan.");
      return;
    }
    setIsLoading(true);
    try {
      let imageUrl = null;

      // Upload image only if provided
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
        const data = await res.json();
        if (!data.secure_url) throw new Error("Image upload failed. Check Cloudinary settings.");
        imageUrl = data.secure_url;
      }

      // Save to Firestore
      await addDoc(collection(db, "software"), {
        name,
        imageUrl,
        prices: {
          oneDay:      price1   ? parseFloat(price1)   : null,
          sevenDays:   price7   ? parseFloat(price7)   : null,
          fifteenDays: price15  ? parseFloat(price15)  : null,
          thirtyDays:  price30  ? parseFloat(price30)  : null,
          oneYear:     price365 ? parseFloat(price365) : null,
        },
        active: true,
        createdAt: serverTimestamp(),
      });

      showToast("Software published successfully!");
      setTimeout(() => navigate('/admin/software'), 1500);
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = (name) => ({
    width: '100%', boxSizing: 'border-box',
    padding: '12px 14px',
    background: focused === name ? 'rgba(124,58,237,0.05)' : 'rgba(6,6,18,0.8)',
    border: focused === name ? '1px solid rgba(124,58,237,0.6)' : '1px solid rgba(55,48,80,0.7)',
    borderRadius: '11px', color: 'white',
    fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
    outline: 'none', transition: 'all 0.2s',
    boxShadow: focused === name ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
  });

  const labelStyle = {
    display: 'block', marginBottom: '7px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '12px', fontWeight: 500,
    color: 'rgba(156,163,175,0.8)', letterSpacing: '0.04em',
  };

  const pricingFields = [
    { key: 'p1',   label: '1 Day ($)',   value: price1,   setter: setPrice1,   required: false },
    { key: 'p7',   label: '7 Days ($)',  value: price7,   setter: setPrice7,   required: false },
    { key: 'p15',  label: '15 Days ($)', value: price15,  setter: setPrice15,  required: false },
    { key: 'p30',  label: '30 Days ($)', value: price30,  setter: setPrice30,  required: false },
    { key: 'p365', label: '365 Days ($)',value: price365, setter: setPrice365, required: false },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }

        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        .as-input::placeholder { color: rgba(107,114,128,0.45); font-style: italic; }
        .as-input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #06060f inset !important;
          -webkit-text-fill-color: white !important;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 14px 36px rgba(124,58,237,0.45) !important;
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0) !important; }
        @media (max-width: 768px) {
          .form-layout { flex-direction: column !important; }
          .image-col   { width: 100% !important; }
          .fields-col  { width: 100% !important; }
          .price-grid  { grid-template-columns: repeat(2,1fr) !important; }
          .page-inner  { padding: 88px 14px 40px !important; }
        }
        @media (max-width: 420px) {
          .price-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#06060f', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden' }}>

        {/* Grid bg */}
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, backgroundImage:`linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)`, backgroundSize:'44px 44px' }} />
        <div style={{ position:'fixed', top:'-200px', left:'-200px', zIndex:0, width:'600px', height:'600px', borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle, rgba(109,40,217,0.14) 0%, transparent 65%)' }} />
        <div style={{ position:'fixed', bottom:'-150px', right:'-150px', zIndex:0, width:'500px', height:'500px', borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 65%)' }} />

        <AdminNavbar />

        {/* Content */}
        <div className="page-inner" style={{
          position: 'relative', zIndex: 1,
          maxWidth: '860px', margin: '0 auto',
          padding: '96px 32px 48px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>

          {/* Back */}
          <button onClick={() => navigate('/admin')} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', color: 'rgba(107,114,128,0.8)',
            fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
            cursor: 'pointer', marginBottom: '28px', padding: 0, transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(107,114,128,0.8)'}
          >
            <ArrowLeft size={15} /> Back to Dashboard
          </button>

          {/* Page header */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
              <div style={{ width:'28px', height:'1px', background:'rgba(124,58,237,0.55)' }} />
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#7c3aed', letterSpacing:'0.12em', fontWeight:500 }}>Software</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
              <div style={{ width:'46px', height:'46px', borderRadius:'13px', background:'rgba(167,139,250,0.1)', border:'1px solid rgba(167,139,250,0.22)', display:'flex', alignItems:'center', justifyContent:'center', color:'#a78bfa' }}>
                <Package size={22} />
              </div>
              <div>
                <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:'24px', fontWeight:700, color:'white', margin:'0 0 4px', letterSpacing:'0.04em' }}>Add New Software</h1>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'13px', color:'rgba(107,114,128,0.85)', margin:0, fontWeight:300 }}>Upload software details, image and pricing</p>
              </div>
            </div>
          </div>

          {/* Card */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(18,14,38,0.96), rgba(10,8,24,0.98))',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '22px', overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
            animation: 'fadeUp 0.5s ease 0.1s both',
          }}>
            <div style={{ height:'1px', background:'linear-gradient(90deg, transparent 5%, rgba(124,58,237,0.4) 50%, transparent 95%)' }} />

            <form onSubmit={handleAddSoftware} style={{ padding: '32px' }}>

              {/* Top layout: Image + Name */}
              <div className="form-layout" style={{ display:'flex', gap:'28px', marginBottom:'28px' }}>

                {/* Image Upload */}
                <div className="image-col" style={{ width: '220px', flexShrink: 0 }}>
                  <label style={labelStyle}>Software Icon <span style={{ color:'rgba(107,114,128,0.5)', fontWeight:300 }}>(optional)</span></label>
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    style={{
                      position: 'relative',
                      width: '100%', height: '200px',
                      borderRadius: '14px',
                      border: dragOver
                        ? '2px dashed rgba(124,58,237,0.7)'
                        : imagePreview ? '2px solid rgba(124,58,237,0.3)' : '2px dashed rgba(55,48,80,0.8)',
                      background: dragOver ? 'rgba(124,58,237,0.06)' : 'rgba(6,6,18,0.8)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: dragOver ? '0 0 0 3px rgba(124,58,237,0.15)' : 'none',
                    }}
                  >
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.9 }} />
                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setImage(null); setImagePreview(null); }}
                          style={{
                            position:'absolute', top:'8px', right:'8px',
                            width:'26px', height:'26px', borderRadius:'8px',
                            background:'rgba(0,0,0,0.7)', border:'1px solid rgba(255,255,255,0.15)',
                            color:'white', display:'flex', alignItems:'center', justifyContent:'center',
                            cursor:'pointer',
                          }}
                        >
                          <X size={13} />
                        </button>
                      </>
                    ) : (
                      <div style={{ textAlign:'center', padding:'16px', color: dragOver ? '#a78bfa' : 'rgba(107,114,128,0.6)', transition:'color 0.2s' }}>
                        <UploadCloud size={28} style={{ marginBottom:'8px' }} />
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', fontWeight:500, margin:'0 0 4px' }}>Click or drag to upload</p>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', margin:0, opacity:0.7 }}>PNG, JPG up to 3MB</p>
                      </div>
                    )}
                    <input
                      type="file" accept="image/*"
                      onChange={e => handleImageChange(e.target.files[0])}
                      style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer' }}
                    />
                  </div>
                </div>

                {/* Name field */}
                <div className="fields-col" style={{ flex: 1 }}>
                  <label style={labelStyle}>Software Name <span style={{ color:'#f87171', marginLeft:'2px' }}>*</span></label>
                  <input
                    type="text"
                    className="as-input"
                    placeholder="e.g. Br Mods (Root)"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused('')}
                    required
                    style={inputStyle('name')}
                  />

                  {/* Info box */}
                  <div style={{
                    marginTop: '16px',
                    background: 'rgba(124,58,237,0.05)',
                    border: '1px solid rgba(124,58,237,0.15)',
                    borderRadius: '10px', padding: '14px 16px',
                  }}>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', color:'rgba(167,139,250,0.7)', margin:'0 0 6px', fontWeight:500 }}>💡 Pricing Tips</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'rgba(107,114,128,0.7)', margin:0, lineHeight:1.7, fontWeight:300 }}>
                      Set <strong style={{color:'rgba(167,139,250,0.8)'}}>any pricing plan</strong> you want. Leave fields empty to hide that plan from resellers. At least one plan is required.
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height:'1px', background:'linear-gradient(90deg, transparent, rgba(124,58,237,0.15), transparent)', marginBottom:'24px' }} />

              {/* Pricing Section */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'18px' }}>
                  <div style={{ width:'22px', height:'1px', background:'rgba(124,58,237,0.55)' }} />
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#7c3aed', letterSpacing:'0.12em', fontWeight:500 }}>Pricing Plans</span>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'rgba(107,114,128,0.5)', fontWeight:300 }}>(at least one required)</span>
                </div>

                <div className="price-grid" style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'12px' }}>
                  {pricingFields.map(field => (
                    <div key={field.key}>
                      <label style={{ ...labelStyle, color: 'rgba(156,163,175,0.7)' }}>
                        {field.label}
                      </label>
                      <input
                        type="number"
                        step="0.01" min="0"
                        className="as-input"
                        placeholder="0.00"
                        value={field.value}
                        onChange={e => field.setter(e.target.value)}
                        onFocus={() => setFocused(field.key)}
                        onBlur={() => setFocused('')}
                        style={inputStyle(field.key)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height:'1px', background:'linear-gradient(90deg, transparent, rgba(124,58,237,0.15), transparent)', marginBottom:'24px' }} />

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="submit-btn"
                style={{
                  width: '100%', padding: '14px',
                  borderRadius: '12px', border: 'none',
                  background: isLoading ? 'rgba(109,40,217,0.35)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  color: 'white', fontSize: '13px',
                  fontFamily: "'Cinzel', serif", fontWeight: 600, letterSpacing: '0.08em',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: isLoading ? 'none' : '0 8px 28px rgba(124,58,237,0.35)',
                  transition: 'all 0.22s ease',
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{ width:'15px', height:'15px', border:'2px solid rgba(255,255,255,0.25)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.65s linear infinite' }} />
                    Uploading & Saving...
                  </>
                ) : (
                  <><Package size={15} /> Publish Software</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div style={{
        position: 'fixed', bottom: '28px', right: '28px', zIndex: 200,
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'linear-gradient(135deg, rgba(5,150,105,0.15), rgba(4,120,87,0.1))',
        border: '1px solid rgba(52,211,153,0.3)',
        borderRadius: '12px', padding: '12px 18px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        opacity: toast.show ? 1 : 0,
        transform: toast.show ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.3s ease', pointerEvents: 'none',
      }}>
        <CheckCircle size={16} color="#34d399" />
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'13px', color:'rgba(255,255,255,0.85)', fontWeight:400 }}>{toast.message}</span>
      </div>
    </>
  );
};

export default AddSoftware;