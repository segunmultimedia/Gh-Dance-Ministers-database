import React, { useState, useEffect, useRef } from 'react';
import { X, Building2, Camera, Upload } from 'lucide-react';
import { GHANA_REGIONS } from '../utils/constants';
import { resizeAndCompressImage } from '../utils/imageUtils';

export default function MinistryModal({ isOpen, onClose, onSave, ministryToEdit, dancers, memberships, ministries = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    church: '',
    phone: '',
    whatsapp: '',
    email: '',
    town: '',
    region: '',
    dateEstablished: '',
    status: 'active',
    notes: '',
    logo: ''
  });
  
  const [selectedLeaderId, setSelectedLeaderId] = useState('');
  const [selectedAssistantLeaderId, setSelectedAssistantLeaderId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (ministryToEdit && isOpen) {
      setFormData({ ...ministryToEdit });
      
      const ministryMemberships = memberships.filter(m => m.ministryId === ministryToEdit.id);
      
      const leaderMembership = ministryMemberships.find(m => m.roles.includes('ministry_leader'));
      if (leaderMembership) setSelectedLeaderId(leaderMembership.dancerId);
      else setSelectedLeaderId('');

      const assistantMembership = ministryMemberships.find(m => m.roles.includes('assistant_leader'));
      if (assistantMembership) setSelectedAssistantLeaderId(assistantMembership.dancerId);
      else setSelectedAssistantLeaderId('');

    } else {
      setFormData({
        name: '',
        church: '',
        phone: '',
        whatsapp: '',
        email: '',
        town: '',
        region: '',
        dateEstablished: '',
        status: 'active',
        notes: '',
        logo: ''
      });
      setSelectedLeaderId('');
      setSelectedAssistantLeaderId('');
    }
  }, [ministryToEdit, memberships, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const compressedBase64 = await resizeAndCompressImage(file, 400);
      setFormData(prev => ({ ...prev, logo: compressedBase64 }));
    } catch (error) {
      console.error("Error compressing image:", error);
      alert("Failed to process image. Please try another one.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const minName = formData.name.trim();
    if (!minName) {
      alert("Ministry Name is required");
      return;
    }

    if (!ministryToEdit) {
      const isDuplicate = ministries.some(m => m.name.toLowerCase().trim() === minName.toLowerCase());
      if (isDuplicate) {
        if (!window.confirm(`A ministry named "${minName}" already exists. Are you sure you want to create a duplicate?`)) {
          return;
        }
      }
    }

    onSave({
      ministryData: formData,
      leaderId: selectedLeaderId,
      assistantLeaderId: selectedAssistantLeaderId
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h2 className="modal-title d-flex align-items-center gap-2">
            <Building2 size={22} style={{ color: 'var(--primary)' }} /> 
            {ministryToEdit ? 'Edit Ministry' : 'Register Ministry'}
          </h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ padding: '0' }}>
          
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: '#f9fafb' }}>
            <div style={{ position: 'relative', width: 96, height: 96, marginBottom: '1rem' }}>
              {formData.logo ? (
                <img src={formData.logo} alt="Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <Building2 size={40} />
                </div>
              )}
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--text-main)', color: 'white', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                title="Upload Logo"
              >
                <Camera size={16} />
              </button>
            </div>
            <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            {isUploading ? <span className="small text-muted">Uploading...</span> : <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Upload Ministry Logo</span>}
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
            
            {/* Basic Information */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Basic Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group mb-0">
                  <label className="form-label">Ministry Name *</label>
                  <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required placeholder="E.g., Anointed Vessels" />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Church / Organization</label>
                  <input type="text" className="form-control" name="church" value={formData.church} onChange={handleChange} placeholder="Affiliated church" />
                </div>
              </div>
            </div>

            {/* Leadership */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Leadership</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group mb-0">
                  <label className="form-label">Ministry Leader</label>
                  <select className="form-control" value={selectedLeaderId} onChange={(e) => setSelectedLeaderId(e.target.value)}>
                    <option value="">-- Select Leader --</option>
                    {dancers.map(d => (
                      <option key={d.id} value={d.id}>{d.name} {d.phone ? `(${d.phone})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Assistant Leader</label>
                  <select className="form-control" value={selectedAssistantLeaderId} onChange={(e) => setSelectedAssistantLeaderId(e.target.value)}>
                    <option value="">-- Select Assistant --</option>
                    {dancers.map(d => (
                      <option key={d.id} value={d.id}>{d.name} {d.phone ? `(${d.phone})` : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Contact & Location */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Contact & Location</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group mb-0">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleChange} placeholder="024 XXX XXXX" />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">WhatsApp Number</label>
                  <input type="tel" className="form-control" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="024 XXX XXXX" />
                </div>
                <div className="form-group mb-0" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} placeholder="ministry@example.com" />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Town / City</label>
                  <input type="text" className="form-control" name="town" value={formData.town} onChange={handleChange} placeholder="E.g., Accra" />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Region</label>
                  <select className="form-control" name="region" value={formData.region} onChange={handleChange}>
                    <option value="">-- Select Region --</option>
                    {GHANA_REGIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Additional Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="form-group mb-0">
                  <label className="form-label">Date Established</label>
                  <input type="date" className="form-control" name="dateEstablished" value={formData.dateEstablished} onChange={handleChange} />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Status</label>
                  <select className="form-control" name="status" value={formData.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Notes</label>
                <textarea className="form-control" name="notes" value={formData.notes} onChange={handleChange} rows="3" placeholder="Any additional information..."></textarea>
              </div>
            </div>

          </form>
        </div>

        <div className="modal-footer" style={{ background: '#f9fafb' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{ministryToEdit ? 'Save Changes' : 'Register Ministry'}</button>
        </div>
      </div>
    </div>
  );
}
