import React, { useState, useEffect } from 'react';
import { X, Upload, Camera, User, Phone, Mail, Calendar, MapPin, Building, FileText } from 'lucide-react';

export default function MemberModal({ isOpen, onClose, onSave, memberToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dob: '',
    gender: 'Male',
    address: '',
    department: 'Marketing',
    dateJoined: new Date().toISOString().slice(0, 10),
    photo: '',
    notes: ''
  });

  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        name: memberToEdit.name || '',
        phone: memberToEdit.phone || '',
        email: memberToEdit.email || '',
        dob: memberToEdit.dob || '',
        gender: memberToEdit.gender || 'Male',
        address: memberToEdit.address || '',
        department: memberToEdit.department || 'Marketing',
        dateJoined: memberToEdit.dateJoined || new Date().toISOString().slice(0, 10),
        photo: memberToEdit.photo || '',
        notes: memberToEdit.notes || ''
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        dob: '',
        gender: 'Male',
        address: '',
        department: 'Marketing',
        dateJoined: new Date().toISOString().slice(0, 10),
        photo: '',
        notes: ''
      });
    }
  }, [memberToEdit, isOpen]);

  if (!isOpen) return null;

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
    if (!formData.name.trim()) return alert('Please enter full member name');
    if (!formData.email.trim()) return alert('Please enter member email address');
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{memberToEdit ? 'Edit Member Details' : 'Register New Member'}</h2>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Photo Upload Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={formData.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt="Profile Preview"
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
                <label 
                  htmlFor="photo-file"
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
                  <input id="photo-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                </label>
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Profile Photo</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Upload high resolution JPG, PNG image</div>
                <label htmlFor="photo-file" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  <Upload size={14} /> Upload Avatar
                </label>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
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
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@organization.org"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-control"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Department / Group</label>
                <select
                  className="form-control"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="Executive Board">Executive Board</option>
                  <option value="Marketing">Marketing</option>
                  <option value="IT & Support">IT & Support</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Youth Group">Youth Group</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date Joined</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.dateJoined}
                  onChange={(e) => setFormData({ ...formData, dateJoined: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                className="form-control"
                placeholder="742 Evergreen Terrace, Springfield, IL"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Additional Notes</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Responsibilities, committee roles, or emergency contacts..."
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
              {memberToEdit ? 'Save Changes' : 'Create Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
