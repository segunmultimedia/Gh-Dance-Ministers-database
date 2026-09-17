import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, User, Calendar, MapPin, Building2, ShieldCheck } from 'lucide-react';
import { GHANA_REGIONS, DANCER_TYPES, ROLES, MONTH_NAMES } from '../utils/constants';
import { resizeAndCompressImage } from '../utils/imageUtils';
import { normalizeGhanaPhone } from '../utils/phoneUtils';

export default function DancerModal({ isOpen, onClose, onSave, dancerToEdit, ministries = [], memberships = [], dancers = [], onAddMinistry }) {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    phone: '',
    whatsapp: '',
    email: '',
    dateOfBirthText: '',
    birthdayDay: '',
    birthdayMonth: '',
    birthYear: '',
    dancerType: 'group_member',
    town: '',
    region: 'Greater Accra',
    church: '',
    dateJoined: '',
    status: 'Active',
    notes: '',
    allowBirthdayPublication: true,
    allowPhotoPublication: true,
    photo: ''
  });
  
  const [selectedMinistryId, setSelectedMinistryId] = useState('');
  const [selectedRoles, setSelectedRoles] = useState(['dancer']);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [whatsappSameAsPrimary, setWhatsappSameAsPrimary] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsSaving(false);
    setDuplicateWarning(false);
    setWhatsappSameAsPrimary(false);
    
    if (dancerToEdit && isOpen) {
      let dobText = '';
      if (dancerToEdit.birthdayDay && dancerToEdit.birthdayMonth) {
        const y = dancerToEdit.birthYear || new Date().getFullYear();
        const m = String(dancerToEdit.birthdayMonth).padStart(2, '0');
        const d = String(dancerToEdit.birthdayDay).padStart(2, '0');
        dobText = `${y}-${m}-${d}`;
      }

      setFormData({
        ...dancerToEdit,
        dateOfBirthText: dobText,
        birthdayDay: dancerToEdit.birthdayDay || '',
        birthdayMonth: dancerToEdit.birthdayMonth || '',
        birthYear: dancerToEdit.birthYear || ''
      });
      
      const primaryMembership = memberships.find(m => m.dancerId === dancerToEdit.id && m.isPrimary);
      if (primaryMembership) {
        setSelectedMinistryId(primaryMembership.ministryId);
        setSelectedRoles(primaryMembership.roles);
      } else {
        const anyMembership = memberships.find(m => m.dancerId === dancerToEdit.id);
        if (anyMembership) {
          setSelectedMinistryId(anyMembership.ministryId);
          setSelectedRoles(anyMembership.roles);
        } else {
          setSelectedMinistryId('');
          setSelectedRoles(['dancer']);
        }
      }
    } else {
      setFormData({
        name: '',
        gender: 'Male',
        phone: '',
        whatsapp: '',
        email: '',
        dateOfBirthText: '',
        birthdayDay: '',
        birthdayMonth: '',
        birthYear: '',
        dancerType: 'group_member',
        town: '',
        region: 'Greater Accra',
        church: '',
        dateJoined: new Date().toISOString().slice(0, 10),
        status: 'Active',
        notes: '',
        allowBirthdayPublication: true,
        allowPhotoPublication: true,
        photo: ''
      });
      setSelectedMinistryId('');
      setSelectedRoles(['dancer']);
    }
  }, [dancerToEdit, memberships, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const nextData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      if (name === 'phone' && whatsappSameAsPrimary) {
        nextData.whatsapp = nextData.phone;
      }
      return nextData;
    });
  };

  const handleRoleToggle = (role) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.length > 1 ? prev.filter(r => r !== role) : prev;
      } else {
        return [...prev, role];
      }
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const compressedBase64 = await resizeAndCompressImage(file, 400);
      setFormData(prev => ({ ...prev, photo: compressedBase64 }));
    } catch (error) {
      console.error("Error compressing image:", error);
      alert("Failed to process photo. Please try another one.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClose = () => {
    const isDirty = !dancerToEdit && (formData.name || formData.phone || formData.email);
    if (isDirty) {
      if (!confirm('You have unsaved changes. Are you sure you want to close?')) return;
    }
    onClose();
  };

  const handleWhatsappSyncToggle = (e) => {
    const checked = e.target.checked;
    setWhatsappSameAsPrimary(checked);
    if (checked) {
      setFormData(prev => ({ ...prev, whatsapp: prev.phone }));
    }
  };

  const checkDuplicate = () => {
    if (dancerToEdit) return false;
    
    const normPhone = normalizeGhanaPhone(formData.phone);
    const normWa = normalizeGhanaPhone(formData.whatsapp);
    const email = formData.email?.trim().toLowerCase();

    return dancers.some(d => {
      const dPhone = normalizeGhanaPhone(d.phone);
      const dWa = normalizeGhanaPhone(d.whatsapp);
      const dEmail = d.email?.trim().toLowerCase();

      if (normPhone && (normPhone === dPhone || normPhone === dWa)) return true;
      if (normWa && (normWa === dPhone || normWa === dWa)) return true;
      if (email && email === dEmail) return true;
      return false;
    });
  };

  const handleSubmit = async (e, forceSave = false) => {
    e?.preventDefault();
    if (isSaving) return;

    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Name and Primary Phone are required");
      return;
    }

    if (formData.dancerType !== 'solo_minister' && !selectedMinistryId) {
      alert("Please select a primary ministry for this dancer type.");
      return;
    }

    // Parse Date of Birth
    let parsedDay = '';
    let parsedMonth = '';
    let parsedYear = '';
    
    if (formData.dateOfBirthText) {
      const parts = formData.dateOfBirthText.split('-');
      if (parts.length === 3) {
        parsedYear = parseInt(parts[0], 10);
        parsedMonth = parseInt(parts[1], 10);
        parsedDay = parseInt(parts[2], 10);
        
        if (isNaN(parsedDay) || isNaN(parsedMonth) || isNaN(parsedYear) || parsedMonth < 1 || parsedMonth > 12 || parsedDay < 1 || parsedDay > 31) {
          alert("Invalid Date of Birth.");
          return;
        }

        const daysInMonth = new Date(parsedYear, parsedMonth, 0).getDate();
        if (parsedDay > daysInMonth) {
          alert(`Invalid birthday: Month ${parsedMonth} only has ${daysInMonth} days.`);
          return;
        }
      } else {
        alert("Invalid Date of Birth.");
        return;
      }
    }

    if (!forceSave && !duplicateWarning && checkDuplicate()) {
      setDuplicateWarning(true);
      return;
    }

    setIsSaving(true);
    await onSave({
      dancerData: {
        ...formData,
        birthdayDay: parsedDay || '',
        birthdayMonth: parsedMonth || '',
        birthYear: parsedYear || ''
      },
      ministryId: selectedMinistryId,
      roles: selectedRoles
    });
    setIsSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-card" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{dancerToEdit ? 'Edit Dancer' : 'Register New Dancer'}</h2>
            {!dancerToEdit && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Add a dancer to the GH Dance database.</p>}
          </div>
          <button className="btn-icon" onClick={handleClose}><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ padding: '0' }}>
           {/* Duplicate Warning Overlay */}
           {duplicateWarning && (
             <div style={{ padding: '1rem 1.5rem', background: 'var(--warning-bg)', borderBottom: '1px solid #fde68a', color: '#92400e' }}>
               <strong>Wait!</strong> A dancer with this contact information may already exist.
               <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                 <button className="btn btn-sm" style={{ background: 'white', border: '1px solid #d97706', color: '#92400e' }} onClick={() => setDuplicateWarning(false)}>Review Information</button>
                 <button className="btn btn-sm" style={{ background: '#d97706', color: 'white', border: 'none' }} onClick={(e) => handleSubmit(e, true)}>Save Anyway</button>
               </div>
             </div>
           )}

           <form id="dancerForm" onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             
             {/* SECTION 1 - PERSONAL INFORMATION */}
             <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Section 1 — Personal Information</h3>
                
                {/* Photo Upload spanning full width intuitively */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ position: 'relative', width: 80, height: 80 }}>
                    {formData.photo ? (
                      <img src={formData.photo} alt="Photo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '2px solid var(--border)' }}>
                        <User size={32} />
                      </div>
                    )}
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      style={{ position: 'absolute', bottom: -4, right: -4, background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                      title="Upload Photo"
                    >
                      <Camera size={14} />
                    </button>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>Profile Photo</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Optional. Will be resized automatically.</span>
                    {isUploading && <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '4px' }}>Uploading...</div>}
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  <div className="form-group mb-0" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required placeholder="First & Last Name" />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">Gender</label>
                    <select className="form-control" name="gender" value={formData.gender} onChange={handleChange}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-control" name="dateOfBirthText" value={formData.dateOfBirthText} onChange={handleChange} />
                  </div>
                </div>
             </div>

             {/* SECTION 2 - CONTACT INFORMATION */}
             <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Section 2 — Contact Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  <div className="form-group mb-0">
                    <label className="form-label">Primary Phone</label>
                    <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleChange} placeholder="024 XXX XXXX" required />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      WhatsApp Number
                    </label>
                    <input type="tel" className="form-control" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="024 XXX XXXX" disabled={whatsappSameAsPrimary} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={whatsappSameAsPrimary} onChange={handleWhatsappSyncToggle} />
                      WhatsApp number is the same as primary phone
                    </label>
                  </div>
                  <div className="form-group mb-0" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} placeholder="dancer@example.com" />
                  </div>
                </div>
             </div>

             {/* SECTION 3 - DANCE AND MINISTRY INFORMATION */}
             <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Section 3 — Dance and Ministry Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  <div className="form-group mb-0">
                    <label className="form-label">Dancer Type</label>
                    <select className="form-control" name="dancerType" value={formData.dancerType} onChange={handleChange}>
                      {DANCER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">Primary Ministry</label>
                    <select className="form-control" value={selectedMinistryId} onChange={(e) => {
                      if (e.target.value === 'ADD_NEW') onAddMinistry();
                      else setSelectedMinistryId(e.target.value);
                    }} required={formData.dancerType !== 'solo_minister'}>
                      <option value="">None</option>
                      <option value="ADD_NEW">+ Add New Ministry</option>
                      {ministries?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">Date Joined</label>
                    <input type="date" className="form-control" name="dateJoined" value={formData.dateJoined} onChange={handleChange} />
                  </div>
                  <div className="form-group mb-0" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Roles</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', background: 'var(--bg-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                      {ROLES.map(roleObj => (
                        <label key={roleObj.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                          <input type="checkbox" checked={selectedRoles.includes(roleObj.value)} onChange={() => handleRoleToggle(roleObj.value)} />
                          {roleObj.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
             </div>

             {/* SECTION 4 - LOCATION AND AFFILIATION */}
             <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Section 4 — Location and Affiliation</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  <div className="form-group mb-0">
                    <label className="form-label">Town</label>
                    <input type="text" className="form-control" name="town" value={formData.town} onChange={handleChange} placeholder="E.g., Kumasi" />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">Region</label>
                    <select className="form-control" name="region" value={formData.region} onChange={handleChange}>
                      {GHANA_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="form-group mb-0" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Church / Organization</label>
                    <input type="text" className="form-control" name="church" value={formData.church} onChange={handleChange} placeholder="Affiliated church or organization" />
                  </div>
                </div>
             </div>

             {/* SECTION 5 - STATUS AND PERMISSIONS */}
             <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Section 5 — Status and Permissions</h3>
                
                <div className="form-group" style={{ maxWidth: '200px' }}>
                  <label className="form-label">Status</label>
                  <select className="form-control" name="status" value={formData.status} onChange={handleChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', background: 'var(--bg-hover)', padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Publication permissions control whether GH Dance may publicly celebrate the dancer’s birthday or use their photograph.
                  </p>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    <input type="checkbox" name="allowBirthdayPublication" checked={formData.allowBirthdayPublication} onChange={handleChange} />
                    Allow birthday publication
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    <input type="checkbox" name="allowPhotoPublication" checked={formData.allowPhotoPublication} onChange={handleChange} />
                    Allow profile photo publication
                  </label>
                </div>

                <div className="form-group mb-0">
                  <label className="form-label">Notes</label>
                  <textarea className="form-control" name="notes" value={formData.notes} onChange={handleChange} rows="3" placeholder="Any additional information..." />
                </div>
             </div>

           </form>
        </div>

        <div className="modal-footer" style={{ background: '#ffffff', position: 'sticky', bottom: 0, zIndex: 10, borderTop: '1px solid var(--border)' }}>
          <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={isSaving}>Cancel</button>
          <button type="submit" form="dancerForm" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Dancer'}
          </button>
        </div>
      </div>
    </div>
  );
}
