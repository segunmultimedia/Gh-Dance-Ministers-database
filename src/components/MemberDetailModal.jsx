import React from 'react';
import { X, Phone, Mail, MapPin, Calendar, Building, Cake, FileText, UserCheck, Edit3 } from 'lucide-react';
import { getBirthdayStatus, formatFullDate, calculateAge } from '../utils/birthdayUtils';

export default function MemberDetailModal({ isOpen, onClose, member, onEdit }) {
  if (!isOpen || !member) return null;

  const bday = getBirthdayStatus(member.dob);
  const age = calculateAge(member.dob);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Member Profile</h2>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Header Avatar Profile Card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', marginBottom: '1.5rem' }}>
            <img
              src={member.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={member.name}
              style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--primary-light)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{member.name}</h2>
                <span className="badge badge-purple">{member.department || 'General'}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{member.email}</p>
              
              {/* Quick Contact Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a href={`mailto:${member.email}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                  <Mail size={14} /> Send Email
                </a>
                {member.phone && (
                  <a href={`tel:${member.phone}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                    <Phone size={14} /> Call Phone
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Birthday Highlight Banner if applicable */}
          {bday.status === 'today' && (
            <div style={{ background: '#ffe4e6', border: '1px solid #fecdd3', color: '#be123c', padding: '0.85rem 1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Cake size={24} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>🎉 Birthday Today!</strong>
                <span style={{ fontSize: '0.8rem' }}>Turning {bday.turningAge} years old today. Send your warm wishes!</span>
              </div>
            </div>
          )}

          {/* Detailed Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Phone Number</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{member.phone || 'N/A'}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Date of Birth</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {formatFullDate(member.dob)} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>(Age: {age})</span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Gender</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{member.gender || 'N/A'}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Date Joined</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{formatFullDate(member.dateJoined || member.createdAt)}</div>
            </div>
          </div>

          {/* Address */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '4px' }}>ADDRESS</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{member.address || 'No physical address provided.'}</div>
          </div>

          {/* Notes */}
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '4px' }}>ADDITIONAL NOTES</div>
            <div style={{ fontSize: '0.875rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #eaecf0', color: '#475569' }}>
              {member.notes || 'No extra notes recorded for this member.'}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={() => { onClose(); onEdit(member); }}>
            <Edit3 size={16} /> Edit Member
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
