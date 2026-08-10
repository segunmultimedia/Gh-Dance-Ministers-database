import React, { useState, useEffect } from 'react';
import { X, Upload, Camera, Crown, UserCheck } from 'lucide-react';

export default function LeaderModal({ isOpen, onClose, onSave, leaderToEdit, members }) {
  const [formData, setFormData] = useState({
    name: '',
    groupName: 'Choreography Ministry',
    title: 'Lead Director',
    email: '',
    phone: '',
    photo: '',
    notes: ''
  });

  const [selectedMemberId, setSelectedMemberId] = useState('');

  useEffect(() => {
    if (leaderToEdit) {
      setFormData({
        name: leaderToEdit.name || '',
        groupName: leaderToEdit.groupName || 'Choreography Ministry',
        title: leaderToEdit.title || 'Lead Director',
        email: leaderToEdit.email || '',
        phone: leaderToEdit.phone || '',
        photo: leaderToEdit.photo || '',
        notes: leaderToEdit.notes || ''
      });
      setSelectedMemberId('');
    } else {
      setFormData({
        name: '',
        groupName: 'Choreography Ministry',
        title: 'Lead Director',
        email: '',
        phone: '',
        photo: '',
        notes: ''
      });
      setSelectedMemberId('');
    }
  }, [leaderToEdit, isOpen]);

  if (!isOpen) return null;

  // Auto-fill from selected registered member
  const handleMemberSelect = (e) => {
    const memberId = e.target.value;
    setSelectedMemberId(memberId);
    if (memberId) {
      const selected = members.find(m => String(m.id) === String(memberId));
      if (selected) {
        setFormData(prev => ({
          ...prev,
          name: selected.name || '',
          email: selected.email || '',
          phone: selected.phone || '',
          photo: selected.photo || '',
          groupName: selected.department || prev.groupName
        }));
      }
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Please enter leader name');
    if (!formData.groupName.trim()) return alert('Please enter dance group name');
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Crown size={20} className="text-primary" />
            {leaderToEdit ? 'Edit Group Leader' : 'Add Dance Group Leader'}
          </h2>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            {/* Quick Member Import Selector */}
            {!leaderToEdit && members && members.length > 0 && (
              <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid #c7d2fe' }}>
                <label className="form-label" style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <UserCheck size={16} /> Import Info from Registered Member (Optional)
                </label>
                <select
                  className="form-control"
                  value={selectedMemberId}
                  onChange={handleMemberSelect}
                >
                  <option value="">-- Select Member to Promote to Leader --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.department || 'General'})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Photo Avatar Preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={formData.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt="Leader Photo"
                  style={{ width: '76px', height: '76px', borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
                <label 
                  htmlFor="leader-photo-file"
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Camera size={14} />
                  <input id="leader-photo-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                </label>
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Leader Photo</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Upload portrait avatar</div>
                <label htmlFor="leader-photo-file" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  <Upload size={14} /> Upload Avatar
                </label>
              </div>
            </div>

            {/* Fields */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Leader Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Savannah Nguyen"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Dance Group / Ministry *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Choreography Ministry"
                  value={formData.groupName}
                  onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Position / Role Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Lead Director / Choreographer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="leader@organization.org"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Leadership Notes & Responsibilities</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Oversees rehearsals, event choreography, team logistics..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {leaderToEdit ? 'Save Changes' : 'Appoint Leader'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
