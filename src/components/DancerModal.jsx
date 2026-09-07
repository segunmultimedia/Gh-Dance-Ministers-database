import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, User, Calendar, MapPin, Building2, ShieldCheck } from 'lucide-react';
import { GHANA_REGIONS, DANCER_TYPES, ROLES, MONTH_NAMES } from '../utils/constants';
import { resizeAndCompressImage } from '../utils/imageUtils';

export default function DancerModal({ isOpen, onClose, onSave, dancerToEdit, ministries = [], memberships = [], onAddMinistry }) {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    phone: '',
    whatsapp: '',
    email: '',
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
  const [selectedRoles, setSelectedRoles] = useState(['member']);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (dancerToEdit && isOpen) {
      setFormData({
        ...dancerToEdit,
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
          setSelectedRoles(['member']);
        }
      }
    } else {
      setFormData({
        name: '',
        gender: 'Male',
        phone: '',
        whatsapp: '',
        email: '',
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
      setSelectedRoles(['member']);
    }
  }, [dancerToEdit, memberships, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Name and Primary Phone are required");
      return;
    }

    onSave({
      dancerData: formData,
      ministryId: selectedMinistryId,
      roles: selectedRoles
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h2 className="modal-title d-flex align-items-center gap-2">
            <User size={22} style={{ color: 'var(--primary)' }} /> 
            {dancerToEdit ? 'Edit Dancer' : 'Register Dancer'}
          </h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ padding: '0' }}>
          
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: '#f9fafb' }}>
            <div style={{ position: 'relative', width: 96, height: 96, marginBottom: '1rem' }}>
              {formData.photo ? (
                <img src={formData.photo} alt="Photo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <User size={40} />
                </div>
              )}
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--text-main)', color: 'white', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                title="Upload Photo"
              >
                <Camera size={16} />
              </button>
            </div>
            <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            {isUploading ? <span className="small text-muted">Uploading...</span> : <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Upload Profile Photo</span>}
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
            
            {/* Basic Information */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}><User size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-3px' }}/> Basic Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group mb-0">
                  <label className="form-label">Full Name *</label>
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
              </div>
            </div>

            {/* Ministry & Roles */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}><Building2 size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-3px' }}/> Ministry & Roles</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="form-group mb-0">
                  <label className="form-label">Primary Ministry</label>
                  <select className="form-control" value={selectedMinistryId} onChange={(e) => {
                    if (e.target.value === 'ADD_NEW') onAddMinistry();
                    else setSelectedMinistryId(e.target.value);
                  }}>
                    <option value="">None</option>
                    <option value="ADD_NEW">+ Add New Ministry</option>
                    {ministries?.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Dancer Type</label>
                  <select className="form-control" name="dancerType" value={formData.dancerType} onChange={handleChange}>
                    {Object.keys(DANCER_TYPES).map(k => (
                      <option key={k} value={k}>{DANCER_TYPES[k]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Leadership & Roles</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', background: '#f9fafb', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  {Object.keys(ROLES).map(roleKey => (
                    <label key={roleKey} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-body)' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedRoles.includes(roleKey)} 
                        onChange={() => handleRoleToggle(roleKey)}
                      />
                      {ROLES[roleKey]}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact & Location */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}><MapPin size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-3px' }}/> Contact & Location</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group mb-0">
                  <label className="form-label">Primary Phone *</label>
                  <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleChange} placeholder="024 XXX XXXX" required />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">WhatsApp Number</label>
                  <input type="tel" className="form-control" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="024 XXX XXXX" />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} placeholder="dancer@example.com" />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Town / City</label>
                  <input type="text" className="form-control" name="town" value={formData.town} onChange={handleChange} placeholder="E.g., Kumasi" />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Region</label>
                  <select className="form-control" name="region" value={formData.region} onChange={handleChange}>
                    {GHANA_REGIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Church / Organization</label>
                  <input type="text" className="form-control" name="church" value={formData.church} onChange={handleChange} placeholder="Affiliated church" />
                </div>
              </div>
            </div>

            {/* Birthday & Additional Details */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}><Calendar size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-3px' }}/> Birthday & Additional Details</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="form-group mb-0">
                  <label className="form-label">Birthday Month</label>
                  <select className="form-control" name="birthdayMonth" value={formData.birthdayMonth} onChange={handleChange}>
                    <option value="">Month</option>
                    {MONTH_NAMES.map((m, i) => (
                      <option key={i+1} value={i+1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Birthday Day</label>
                  <select className="form-control" name="birthdayDay" value={formData.birthdayDay} onChange={handleChange}>
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Birth Year</label>
                  <input type="number" className="form-control" name="birthYear" value={formData.birthYear} onChange={handleChange} placeholder="Optional" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="form-group mb-0">
                  <label className="form-label">Date Joined</label>
                  <input type="date" className="form-control" name="dateJoined" value={formData.dateJoined} onChange={handleChange} />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Status</label>
                  <select className="form-control" name="status" value={formData.status} onChange={handleChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', background: '#f9fafb', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  <ShieldCheck size={16} className="text-muted" /> Permissions
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-body)' }}>
                  <input type="checkbox" name="allowBirthdayPublication" checked={formData.allowBirthdayPublication} onChange={handleChange} />
                  Allow birthday publication (show in upcoming birthdays)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-body)' }}>
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

        <div className="modal-footer" style={{ background: '#f9fafb' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>{dancerToEdit ? 'Save Changes' : 'Register Dancer'}</button>
        </div>
      </div>
    </div>
  );
}
