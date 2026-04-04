import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Ban, CheckCircle2, ArrowLeft, X, Activity, Package, UploadCloud, Loader2, CheckCircle, Trash2, AlertTriangle } from 'lucide-react';
import AdminNavbar from '../../components/AdminNavbar';

const CLOUD_NAME    = "dhbsvyzja";
const UPLOAD_PRESET = "DynamicX-Panel";

// ─── Delete Confirm Modal ─────────────────────────────────────────────
const DeleteModal = ({ soft, onClose, onConfirm, isDeleting }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 110,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px', animation: 'fadeIn 0.18s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '420px',
          background: 'linear-gradient(160deg, rgba(20,10,30,0.99), rgba(10,6,20,1))',
          border: '1px solid rgba(248,113,113,0.25)',
          borderRadius: '22px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.04)',
          position: 'relative', overflow: 'hidden',
          animation: 'slideUp 0.22s cubic-bezier(.16,1,.3,1)',
        }}
      >
        <div style={{ height:'1px', background:'linear-gradient(90deg, transparent 5%, rgba(248,113,113,0.5) 50%, transparent 95%)' }} />

        <div style={{ padding: '28px' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'46px', height:'46px', borderRadius:'13px', background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'#f87171', flexShrink:0 }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:'16px', fontWeight:700, color:'white', margin:'0 0 3px', letterSpacing:'0.03em' }}>Delete Software</h3>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', color:'rgba(107,114,128,0.85)', margin:0, fontWeight:300 }}>This action cannot be undone</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'7px', color:'#6b7280', cursor:'pointer', display:'flex' }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px', background:'rgba(248,113,113,0.05)', border:'1px solid rgba(248,113,113,0.15)', borderRadius:'12px', marginBottom:'22px' }}>
            <div style={{ width:'44px', height:'44px', borderRadius:'10px', background:'rgba(6,6,18,0.8)', border:'1px solid rgba(55,48,80,0.6)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {soft.imageUrl
                ? <img src={soft.imageUrl} alt={soft.name} style={{ width:'100%', height:'100%', objectFit:'cover', filter:'grayscale(0.4)' }} />
                : <Package size={18} color="rgba(107,114,128,0.4)" />
              }
            </div>
            <div>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:'13px', fontWeight:600, color:'white', margin:'0 0 3px' }}>{soft.name}</p>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'rgba(248,113,113,0.7)', margin:0, fontWeight:300 }}>Will be permanently deleted</p>
            </div>
          </div>

          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'13px', color:'rgba(156,163,175,0.75)', margin:'0 0 22px', lineHeight:1.6, fontWeight:300 }}>
            Are you sure you want to delete <strong style={{ color:'white', fontWeight:500 }}>{soft.name}</strong>? All associated data will be removed and this cannot be reversed.
          </p>

          <div style={{ display:'flex', gap:'10px' }}>
            <button onClick={onClose} disabled={isDeleting} style={{
              flex:1, padding:'12px', borderRadius:'11px',
              background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
              color:'rgba(156,163,175,0.8)', fontSize:'13px',
              fontFamily:"'DM Sans',sans-serif", fontWeight:500,
              cursor: isDeleting ? 'not-allowed' : 'pointer', transition:'all 0.2s',
            }}>Cancel</button>
            <button onClick={onConfirm} disabled={isDeleting} style={{
              flex:1, padding:'12px', borderRadius:'11px',
              background: isDeleting ? 'rgba(185,28,28,0.25)' : 'linear-gradient(135deg, #dc2626, #b91c1c)',
              border:'none', color:'white', fontSize:'13px',
              fontFamily:"'Cinzel',serif", fontWeight:600, letterSpacing:'0.04em',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:'7px',
              boxShadow: isDeleting ? 'none' : '0 6px 20px rgba(220,38,38,0.35)',
              transition:'all 0.2s',
            }}>
              {isDeleting ? (
                <><div style={{ width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.25)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.65s linear infinite' }} /> Deleting...</>
              ) : (
                <><Trash2 size={14} /> Delete</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Edit Modal ──────────────────────────────────────────────────────
const EditModal = ({ soft, onClose, onSave }) => {
  const [form, setForm] = useState({
    name:     soft.name || '',
    price1:   soft.prices?.oneDay       || '',
    price7:   soft.prices?.sevenDays    || '',
    price10:  soft.prices?.tenDays      || '',
    price15:  soft.prices?.fifteenDays  || '',
    price30:  soft.prices?.thirtyDays   || '',
    price365: soft.prices?.oneYear      || '',
  });
  const [image, setImage]               = useState(null);
  const [imagePreview, setImagePreview] = useState(soft.imageUrl || null);
  const [focused, setFocused]           = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [dragOver, setDragOver]         = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleImageChange = (file) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert("Image must be under 3MB."); return; }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasAnyPrice = form.price1 || form.price7 || form.price10 || form.price15 || form.price30 || form.price365;
    if (!hasAnyPrice) {
      alert("Please set at least one pricing plan.");
      return;
    }
    setIsLoading(true);
    try {
      let imageUrl = soft.imageUrl;
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", UPLOAD_PRESET);
        const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
        const data = await res.json();
        if (!data.secure_url) throw new Error("Image upload failed.");
        imageUrl = data.secure_url;
      }
      await updateDoc(doc(db, "software", soft.id), {
        name: form.name,
        imageUrl,
        "prices.oneDay":      form.price1   ? parseFloat(form.price1)   : null,
        "prices.sevenDays":   form.price7   ? parseFloat(form.price7)   : null,
        "prices.tenDays":     form.price10  ? parseFloat(form.price10)  : null,
        "prices.fifteenDays": form.price15  ? parseFloat(form.price15)  : null,
        "prices.thirtyDays":  form.price30  ? parseFloat(form.price30)  : null,
        "prices.oneYear":     form.price365 ? parseFloat(form.price365) : null,
      });
      onSave();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = (name) => ({
    width: '100%', boxSizing: 'border-box',
    padding: '11px 13px',
    background: focused === name ? 'rgba(124,58,237,0.05)' : 'rgba(6,6,18,0.85)',
    border: focused === name ? '1px solid rgba(124,58,237,0.6)' : '1px solid rgba(55,48,80,0.7)',
    borderRadius: '10px', color: 'white',
    fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
    outline: 'none', transition: 'all 0.2s',
    boxShadow: focused === name ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
  });

  const labelStyle = {
    display: 'block', marginBottom: '6px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '11px', fontWeight: 500,
    color: 'rgba(156,163,175,0.8)', letterSpacing: '0.04em',
  };

  const pricingFields = [
    { key: 'ep1',   label: '1 Day ($)',    value: form.price1,   field: 'price1'   },
    { key: 'ep7',   label: '7 Days ($)',   value: form.price7,   field: 'price7'   },
    { key: 'ep10',  label: '10 Days ($)',  value: form.price10,  field: 'price10'  },
    { key: 'ep15',  label: '15 Days ($)',  value: form.price15,  field: 'price15'  },
    { key: 'ep30',  label: '30 Days ($)',  value: form.price30,  field: 'price30'  },
    { key: 'ep365', label: '365 Days ($)', value: form.price365, field: 'price365' },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px', animation: 'fadeIn 0.18s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '560px',
          background: 'linear-gradient(160deg, rgba(18,14,38,0.99), rgba(10,8,24,1))',
          border: '1px solid rgba(124,58,237,0.22)',
          borderRadius: '22px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)',
          position: 'relative', overflow: 'hidden',
          animation: 'slideUp 0.22s cubic-bezier(.16,1,.3,1)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ height:'1px', background:'linear-gradient(90deg, transparent 5%, rgba(124,58,237,0.55) 50%, transparent 95%)' }} />
        <div style={{ padding: '28px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'22px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:'rgba(167,139,250,0.1)', border:'1px solid rgba(167,139,250,0.22)', display:'flex', alignItems:'center', justifyContent:'center', color:'#a78bfa' }}>
                <Edit size={18} />
              </div>
              <div>
                <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:'16px', fontWeight:700, color:'white', margin:'0 0 3px', letterSpacing:'0.03em' }}>Edit Software</h3>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', color:'rgba(107,114,128,0.85)', margin:0, fontWeight:300 }}>{soft.name}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'7px', color:'#6b7280', cursor:'pointer', display:'flex' }}>
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display:'flex', gap:'18px', marginBottom:'20px', alignItems:'flex-start' }}>
              <div style={{ flexShrink: 0 }}>
                <label style={labelStyle}>Image</label>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handleImageChange(f); }}
                  style={{
                    position: 'relative', width: '110px', height: '110px',
                    borderRadius: '12px',
                    border: dragOver ? '2px dashed rgba(124,58,237,0.7)' : imagePreview ? '2px solid rgba(124,58,237,0.3)' : '2px dashed rgba(55,48,80,0.8)',
                    background: 'rgba(6,6,18,0.8)',
                    display: 'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                    overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity=1}
                        onMouseLeave={e => e.currentTarget.style.opacity=0}
                      >
                        <UploadCloud size={20} color="white" />
                        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'10px', color:'white', marginTop:'4px' }}>Change</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign:'center', padding:'8px', color:'rgba(107,114,128,0.6)' }}>
                      <UploadCloud size={20} style={{ marginBottom:'4px' }} />
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'10px', margin:0 }}>Upload</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={e => handleImageChange(e.target.files[0])} style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer' }} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Software Name <span style={{ color:'#f87171', marginLeft:'2px' }}>*</span></label>
                <input
                  type="text" value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  onFocus={() => setFocused('ename')} onBlur={() => setFocused('')}
                  required style={inputStyle('ename')}
                  placeholder="Software name"
                  className="as-input"
                />
              </div>
            </div>

            <div style={{ height:'1px', background:'linear-gradient(90deg, transparent, rgba(124,58,237,0.15), transparent)', marginBottom:'18px' }} />

            <div style={{ marginBottom:'22px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
                <div style={{ width:'20px', height:'1px', background:'rgba(124,58,237,0.55)' }} />
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#7c3aed', letterSpacing:'0.12em', fontWeight:500 }}>Pricing Plans</span>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'rgba(107,114,128,0.5)', fontWeight:300 }}>(at least one required)</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px' }}>
                {pricingFields.map(f => (
                  <div key={f.key}>
                    <label style={{ ...labelStyle }}>
                      {f.label}
                    </label>
                    <input
                      type="number" step="0.01" min="0"
                      placeholder="0.00"
                      value={f.value}
                      onChange={e => setForm({...form, [f.field]: e.target.value})}
                      onFocus={() => setFocused(f.key)} onBlur={() => setFocused('')}
                      style={inputStyle(f.key)}
                      className="as-input"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', gap:'10px' }}>
              <button type="button" onClick={onClose} style={{
                flex:1, padding:'12px', borderRadius:'11px',
                background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
                color:'rgba(156,163,175,0.8)', fontSize:'13px',
                fontFamily:"'DM Sans',sans-serif", fontWeight:500, cursor:'pointer', transition:'all 0.2s',
              }}>Cancel</button>
              <button type="submit" disabled={isLoading} style={{
                flex:1, padding:'12px', borderRadius:'11px',
                background: isLoading ? 'rgba(109,40,217,0.35)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                border:'none', color:'white', fontSize:'13px',
                fontFamily:"'Cinzel',serif", fontWeight:600, letterSpacing:'0.04em',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'7px',
                boxShadow: isLoading ? 'none' : '0 6px 20px rgba(124,58,237,0.35)',
                transition:'all 0.2s',
              }}>
                {isLoading ? (
                  <><div style={{ width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.25)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.65s linear infinite' }} /> Saving...</>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Main Software Page ───────────────────────────────────────────────
const Software = () => {
  const [softwareList, setSoftwareList]   = useState([]);
  const [availableKeys, setAvailableKeys] = useState([]);
  const [editingSoft, setEditingSoft]     = useState(null);
  const [deletingSoft, setDeletingSoft]   = useState(null);
  const [isDeleting, setIsDeleting]       = useState(false);
  const [mounted, setMounted]             = useState(false);
  const [toast, setToast]                 = useState({ show: false, message: '', type: 'success' });
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
    const unsubSoft = onSnapshot(collection(db, "software"), snap => {
      setSoftwareList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubKeys = onSnapshot(collection(db, "keys"), snap => {
      setAvailableKeys(snap.docs.map(d => d.data()).filter(k => k.status === "available"));
    });
    return () => { unsubSoft(); unsubKeys(); };
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2800);
  };

  const getKeyCount  = (softId, duration) => availableKeys.filter(k => k.softwareId === softId && k.duration === duration).length;
  const getTotalKeys = (softId) => availableKeys.filter(k => k.softwareId === softId).length;

  const handleToggle = async (id, current) => {
    await updateDoc(doc(db, "software", id), { active: !current });
    showToast(!current ? 'Software activated!' : 'Software deactivated!');
  };

  const handleDelete = async () => {
    if (!deletingSoft) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "software", deletingSoft.id));
      setDeletingSoft(null);
      showToast(`"${deletingSoft.name}" deleted successfully.`, 'delete');
    } catch (err) {
      showToast('Error deleting software.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const pricePlans = [
    { field: 'oneDay',      label: '1 Day',    dur: '1 Day'    },
    { field: 'sevenDays',   label: '7 Days',   dur: '7 Days'   },
    { field: 'tenDays',     label: '10 Days',  dur: '10 Days'  },
    { field: 'fifteenDays', label: '15 Days',  dur: '15 Days'  },
    { field: 'thirtyDays',  label: '30 Days',  dur: '30 Days'  },
    { field: 'oneYear',     label: '365 Days', dur: '365 Days' },
  ];

  const toastColor = toast.type === 'delete'
    ? { bg:'rgba(220,38,38,0.12)', border:'rgba(248,113,113,0.3)', icon:'#f87171' }
    : toast.type === 'error'
    ? { bg:'rgba(220,38,38,0.12)', border:'rgba(248,113,113,0.3)', icon:'#f87171' }
    : { bg:'rgba(5,150,105,0.12)', border:'rgba(52,211,153,0.3)',  icon:'#34d399' };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }

        .soft-card { transition: transform 0.22s ease, box-shadow 0.22s ease; }
        .soft-card:hover { transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,0,0,0.4) !important; }

        .as-input::placeholder { color: rgba(107,114,128,0.45); font-style: italic; }
        .as-input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #06060f inset !important;
          -webkit-text-fill-color: white !important;
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }

        .sw-act-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 13px; border-radius: 8px;
          font-size: 12px; font-family: 'DM Sans', sans-serif; font-weight: 500;
          cursor: pointer; border: 1px solid transparent;
          transition: all 0.18s ease; letter-spacing: 0.02em;
        }
        .btn-edit       { color:#818cf8; background:rgba(129,140,248,0.08); border-color:rgba(129,140,248,0.2); }
        .btn-edit:hover { background:rgba(129,140,248,0.16); border-color:rgba(129,140,248,0.4); }
        .btn-deactivate       { color:#f87171; background:rgba(248,113,113,0.08); border-color:rgba(248,113,113,0.2); }
        .btn-deactivate:hover { background:rgba(248,113,113,0.16); border-color:rgba(248,113,113,0.4); }
        .btn-activate       { color:#34d399; background:rgba(52,211,153,0.08); border-color:rgba(52,211,153,0.2); }
        .btn-activate:hover { background:rgba(52,211,153,0.16); border-color:rgba(52,211,153,0.4); }
        .btn-delete       { color:#f87171; background:rgba(248,113,113,0.07); border-color:rgba(248,113,113,0.18); }
        .btn-delete:hover { background:rgba(248,113,113,0.15); border-color:rgba(248,113,113,0.38); }

        @media (max-width: 1024px) { .soft-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 600px)  { .soft-grid { grid-template-columns: 1fr !important; } .page-inner { padding: 88px 14px 40px !important; } }
        @media (max-width: 500px)  {
          .edit-price-grid { grid-template-columns: repeat(2,1fr) !important; }
          .edit-top-row    { flex-direction: column !important; }
        }
      `}</style>

      <div style={{ minHeight:'100vh', background:'#06060f', fontFamily:"'DM Sans', sans-serif", position:'relative', overflow:'hidden' }}>
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, backgroundImage:`linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)`, backgroundSize:'44px 44px' }} />
        <div style={{ position:'fixed', top:'-200px', left:'-200px', zIndex:0, width:'600px', height:'600px', borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle, rgba(109,40,217,0.14) 0%, transparent 65%)' }} />
        <div style={{ position:'fixed', bottom:'-150px', right:'-150px', zIndex:0, width:'500px', height:'500px', borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 65%)' }} />

        <AdminNavbar />

        <div className="page-inner" style={{
          position:'relative', zIndex:1,
          maxWidth:'1280px', margin:'0 auto',
          padding:'96px 32px 48px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition:'opacity 0.5s ease, transform 0.5s ease',
        }}>

          <button onClick={() => navigate('/admin')} style={{ display:'flex', alignItems:'center', gap:'6px', background:'none', border:'none', color:'rgba(107,114,128,0.8)', fontSize:'13px', fontFamily:"'DM Sans',sans-serif", cursor:'pointer', marginBottom:'28px', padding:0, transition:'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color='white'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(107,114,128,0.8)'}
          >
            <ArrowLeft size={15} /> Back to Dashboard
          </button>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'32px', flexWrap:'wrap', gap:'16px' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                <div style={{ width:'28px', height:'1px', background:'rgba(124,58,237,0.55)' }} />
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#7c3aed', letterSpacing:'0.12em', fontWeight:500 }}>Products</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                <div style={{ width:'46px', height:'46px', borderRadius:'13px', background:'rgba(167,139,250,0.1)', border:'1px solid rgba(167,139,250,0.22)', display:'flex', alignItems:'center', justifyContent:'center', color:'#a78bfa' }}>
                  <Package size={22} />
                </div>
                <div>
                  <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:'24px', fontWeight:700, color:'white', margin:'0 0 4px', letterSpacing:'0.04em' }}>Software Management</h1>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'13px', color:'rgba(107,114,128,0.85)', margin:0, fontWeight:300 }}>Manage products, pricing and availability</p>
                </div>
              </div>
            </div>

            <button onClick={() => navigate('/admin/add-software')} style={{
              display:'flex', alignItems:'center', gap:'7px',
              padding:'10px 18px', borderRadius:'11px',
              background:'linear-gradient(135deg, #7c3aed, #4f46e5)',
              border:'none', color:'white', fontSize:'13px',
              fontFamily:"'Cinzel',serif", fontWeight:600, letterSpacing:'0.04em',
              cursor:'pointer', boxShadow:'0 6px 20px rgba(124,58,237,0.35)',
              transition:'all 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 28px rgba(124,58,237,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(124,58,237,0.35)'; }}
            >
              <Plus size={15} /> Add Software
            </button>
          </div>

          {softwareList.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px', color:'rgba(107,114,128,0.5)', fontFamily:"'DM Sans',sans-serif", fontSize:'14px', fontWeight:300 }}>No software added yet.</div>
          ) : (
            <div className="soft-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'18px' }}>
              {softwareList.map((soft, idx) => (
                <div key={soft.id} className="soft-card" style={{
                  background: 'linear-gradient(145deg, rgba(18,14,38,0.96), rgba(10,8,24,0.98))',
                  border: soft.active ? '1px solid rgba(124,58,237,0.15)' : '1px solid rgba(248,113,113,0.15)',
                  borderRadius: '20px', overflow:'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  animation: `fadeUp 0.5s ease ${idx * 0.06}s both`,
                  opacity: soft.active ? 1 : 0.75,
                  display:'flex', flexDirection:'column',
                }}>
                  <div style={{ height:'1px', background: soft.active ? 'linear-gradient(90deg, transparent 5%, rgba(124,58,237,0.35) 50%, transparent 95%)' : 'linear-gradient(90deg, transparent 5%, rgba(248,113,113,0.25) 50%, transparent 95%)' }} />

                  <div style={{ padding:'22px', flex:1, display:'flex', flexDirection:'column' }}>
                    <div style={{ display:'flex', gap:'14px', marginBottom:'18px' }}>
                      <div style={{ width:'60px', height:'60px', borderRadius:'14px', background:'rgba(6,6,18,0.8)', border:'1px solid rgba(55,48,80,0.6)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {soft.imageUrl
                          ? <img src={soft.imageUrl} alt={soft.name} style={{ width:'100%', height:'100%', objectFit:'cover', filter: soft.active ? 'none' : 'grayscale(1)' }} />
                          : <Package size={22} color="rgba(107,114,128,0.4)" />
                        }
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:'14px', fontWeight:700, color:'white', margin:'0 0 6px', letterSpacing:'0.02em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{soft.name}</h3>
                        {soft.active
                          ? <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.25)', color:'#34d399', borderRadius:'100px', padding:'3px 10px', fontSize:'11px', fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>
                              <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#34d399' }} /> Active
                            </span>
                          : <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.25)', color:'#f87171', borderRadius:'100px', padding:'3px 10px', fontSize:'11px', fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>
                              <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#f87171' }} /> Inactive
                            </span>
                        }
                      </div>
                    </div>

                    <div style={{ flex:1, marginBottom:'16px', display:'flex', flexDirection:'column', gap:'8px' }}>
                      {pricePlans.map(plan => soft.prices?.[plan.field] ? (
                        <div key={plan.field} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', background:'rgba(6,6,18,0.5)', borderRadius:'9px', border:'1px solid rgba(55,48,80,0.5)' }}>
                          <div>
                            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', color:'rgba(209,213,219,0.8)', fontWeight:500 }}>{plan.label}</span>
                            <span style={{ display:'block', fontFamily:"'DM Sans',sans-serif", fontSize:'10px', color:'rgba(129,140,248,0.7)', marginTop:'1px' }}>
                              {getKeyCount(soft.id, plan.dur)} keys
                            </span>
                          </div>
                          <span style={{ fontFamily:"'Cinzel',serif", fontSize:'14px', fontWeight:700, color:'white' }}>
                            ${soft.prices[plan.field].toFixed(2)}
                          </span>
                        </div>
                      ) : null)}
                    </div>

                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:'rgba(52,211,153,0.05)', border:'1px solid rgba(52,211,153,0.15)', borderRadius:'9px', marginBottom:'16px' }}>
                      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', color:'rgba(107,114,128,0.8)', fontWeight:400 }}>Total Available Keys</span>
                      <span style={{ fontFamily:"'Cinzel',serif", fontSize:'15px', fontWeight:700, color:'#34d399' }}>{getTotalKeys(soft.id)}</span>
                    </div>

                    <div style={{ display:'flex', gap:'7px' }}>
                      <button onClick={() => setEditingSoft(soft)} className="sw-act-btn btn-edit" style={{ flex:1, justifyContent:'center' }}>
                        <Edit size={13} /> Edit
                      </button>
                      <button onClick={() => handleToggle(soft.id, soft.active)} className={`sw-act-btn ${soft.active ? 'btn-deactivate' : 'btn-activate'}`} style={{ flex:1, justifyContent:'center' }}>
                        {soft.active ? <><Ban size={13} /> Deactivate</> : <><Activity size={13} /> Activate</>}
                      </button>
                      <button onClick={() => setDeletingSoft(soft)} className="sw-act-btn btn-delete" style={{ padding:'7px 10px', justifyContent:'center' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingSoft && (
        <EditModal
          soft={editingSoft}
          onClose={() => setEditingSoft(null)}
          onSave={() => { setEditingSoft(null); showToast('Software updated successfully!'); }}
        />
      )}

      {deletingSoft && (
        <DeleteModal
          soft={deletingSoft}
          onClose={() => !isDeleting && setDeletingSoft(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}

      <div style={{
        position:'fixed', bottom:'28px', right:'28px', zIndex:200,
        display:'flex', alignItems:'center', gap:'10px',
        background: `linear-gradient(135deg, ${toastColor.bg}, ${toastColor.bg})`,
        border:`1px solid ${toastColor.border}`,
        borderRadius:'12px', padding:'12px 18px',
        backdropFilter:'blur(12px)',
        boxShadow:'0 8px 32px rgba(0,0,0,0.4)',
        opacity: toast.show ? 1 : 0,
        transform: toast.show ? 'translateY(0)' : 'translateY(12px)',
        transition:'all 0.3s ease', pointerEvents:'none',
      }}>
        <CheckCircle size={16} color={toastColor.icon} />
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'13px', color:'rgba(255,255,255,0.85)', fontWeight:400 }}>{toast.message}</span>
      </div>
    </>
  );
};

export default Software;