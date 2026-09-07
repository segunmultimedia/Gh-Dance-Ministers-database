import React from 'react';
import { X, Phone, MessageCircle, Mail, MapPin, Calendar, Building2, Crown, Edit3, Shield, Camera } from 'lucide-react';
import { getBirthdayInfo, formatFullDate } from '../utils/birthdayUtils';
import { formatPhoneDisplay, getWhatsAppLink } from '../utils/phoneUtils';
import { getDancerPrimaryMinistry, getDancerMembershipsResolved, getDancerAllRoles } from '../services/dataService';
import { getDancerTypeLabel, getRoleLabel } from '../utils/constants';

export default function DancerDetailModal({ isOpen, onClose, dancer, ministries, memberships, onEdit }) {
  if (!isOpen || !dancer) return null;

  const primaryMinistry = getDancerPrimaryMinistry(dancer.id, memberships, ministries);
  const resolvedMemberships = getDancerMembershipsResolved(dancer.id, memberships, ministries);
  const allRoles = getDancerAllRoles(dancer.id, memberships);
  const birthdayInfo = getBirthdayInfo(dancer.birthdayDay, dancer.birthdayMonth, dancer.birthYear);

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '520px', width: '100%', maxHeight: '100vh', overflowY: 'auto', margin: '0 0 0 auto', height: '100vh', borderRadius: '0' }}>
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <button className="btn-icon" onClick={onClose}><X size={24} /></button>
          <button className="btn btn-secondary btn-sm" onClick={() => onEdit(dancer)}>
            <Edit3 size={16} style={{ marginRight: '0.25rem' }} /> Edit
          </button>
        </div>
        
        <div className="modal-body" style={{ padding: '0 2rem 2rem 2rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
            <div className="avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '1rem', border: '4px solid white', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              {dancer.photo ? <img src={dancer.photo} alt={dancer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={48} color="#94a3b8" />}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#0f172a', textAlign: 'center' }}>{dancer.name}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className="badge badge-gray">{getDancerTypeLabel(dancer.dancerType)}</span>
              <span className={`badge ${dancer.status === 'Active' ? 'badge-success' : 'badge-gray'}`}>{dancer.status}</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', borderRadius: '0.5rem', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {dancer.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <a href={`tel:${dancer.phone}`} style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: '#eff6ff', padding: '0.5rem', borderRadius: '50%' }}><Phone size={18} /></div>
                  <span style={{ fontSize: '1rem', fontWeight: '500' }}>{formatPhoneDisplay(dancer.phone)}</span>
                </a>
              </div>
            )}
            
            {dancer.whatsapp && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <a href={getWhatsAppLink(dancer.whatsapp)} target="_blank" rel="noreferrer" style={{ color: '#16a34a', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: '#dcfce3', padding: '0.5rem', borderRadius: '50%' }}><MessageCircle size={18} /></div>
                  <span style={{ fontSize: '1rem', fontWeight: '500' }}>{formatPhoneDisplay(dancer.whatsapp)} (WhatsApp)</span>
                </a>
              </div>
            )}
            
            {dancer.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <a href={`mailto:${dancer.email}`} style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '0.5rem', borderRadius: '50%' }}><Mail size={18} /></div>
                  <span style={{ fontSize: '1rem' }}>{dancer.email}</span>
                </a>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} color="#6366f1" /> Dance Info
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {resolvedMemberships.length > 0 ? resolvedMemberships.map((rm, i) => (
                <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building2 size={16} color="#64748b" /> {rm.ministry?.name || 'Unknown Ministry'}
                    </div>
                    {rm.membership.isPrimary && <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>Primary</span>}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {rm.membership.roles?.map(r => (
                      <span key={r} className="badge badge-info" style={{ fontSize: '0.75rem' }}>{getRoleLabel(r)}</span>
                    ))}
                  </div>
                </div>
              )) : (
                <div style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.875rem' }}>No active ministry memberships.</div>
              )}
              
              {allRoles.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>All Roles:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {allRoles.map(r => (
                      <span key={r} className="badge badge-gray" style={{ fontSize: '0.75rem' }}>{getRoleLabel(r)}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} color="#6366f1" /> Location
            </h3>
            <div style={{ color: '#475569', fontSize: '0.95rem' }}>
              {[dancer.town, dancer.region].filter(Boolean).join(', ') || 'Not specified'}
              {dancer.church && <div style={{ marginTop: '0.25rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={14} /> {dancer.church}
              </div>}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="#6366f1" /> Birthday
            </h3>
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '0.5rem', padding: '1rem' }}>
              {birthdayInfo ? (
                <>
                  <div style={{ fontSize: '1.125rem', fontWeight: '500', color: '#0f172a', marginBottom: '0.25rem' }}>
                    {birthdayInfo.formattedBirthday}
                  </div>
                  {birthdayInfo.currentAge !== null && <div style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Age: {birthdayInfo.currentAge}</div>}
                  <div style={{ display: 'inline-block', backgroundColor: birthdayInfo.daysUntil === 0 ? '#fee2e2' : birthdayInfo.daysUntil <= 14 ? '#ffedd5' : '#e0f2fe', color: birthdayInfo.daysUntil === 0 ? '#ef4444' : birthdayInfo.daysUntil <= 14 ? '#ea580c' : '#0369a1', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem', fontWeight: '500', marginBottom: '1rem' }}>
                    {birthdayInfo.daysUntil === 0 ? '🎉 Birthday Today!' : birthdayInfo.daysUntil === 1 ? 'Tomorrow' : `In ${birthdayInfo.daysUntil} days`}
                  </div>
                </>
              ) : (
                <div style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1rem' }}>Not specified</div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dancer.allowBirthdayPublication !== false ? '#22c55e' : '#ef4444' }}></span>
                  {dancer.allowBirthdayPublication !== false ? 'Birthday: Published' : 'Birthday: Private'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dancer.allowPhotoPublication !== false ? '#22c55e' : '#ef4444' }}></span>
                  {dancer.allowPhotoPublication !== false ? 'Photo: Published' : 'Photo: Private'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
            {dancer.dateJoined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                <span>Date Joined</span>
                <span>{dancer.dateJoined}</span>
              </div>
            )}
            {dancer.notes && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569', marginBottom: '0.25rem' }}>Notes:</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', whiteSpace: 'pre-wrap', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem' }}>{dancer.notes}</div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem' }}>
              <span>Created: {new Date(dancer.createdAt || Date.now()).toLocaleDateString()}</span>
              {dancer.updatedAt && <span>Updated: {new Date(dancer.updatedAt).toLocaleDateString()}</span>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
