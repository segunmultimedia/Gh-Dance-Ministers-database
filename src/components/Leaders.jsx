import React, { useState, useMemo } from 'react';
import { Search, MapPin, Phone, Mail, MessageCircle, Crown, LayoutGrid, List, Users, BookOpen } from 'lucide-react';
import { LEADERSHIP_ROLES, getRoleLabel } from '../utils/constants';
import { getWhatsAppLink, formatPhoneDisplay } from '../utils/phoneUtils';

export default function Leaders({ leadersResolved }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const filteredLeaders = useMemo(() => {
    return leadersResolved.filter(item => {
      const { dancer, assignments } = item;
      
      const matchSearch = dancer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          assignments.some(a => a.ministry && a.ministry.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchRole = roleFilter 
        ? assignments.some(a => a.roles.includes(roleFilter))
        : true;
        
      return matchSearch && matchRole;
    });
  }, [leadersResolved, searchTerm, roleFilter]);

  // Statistics
  const totalLeaders = leadersResolved.length;
  const uniqueMinistriesLed = new Set(
    leadersResolved.flatMap(item => 
      item.assignments
        .filter(a => a.roles.includes('ministry_leader') && a.ministry)
        .map(a => a.ministry.id)
    )
  ).size;
  const totalChoreographers = leadersResolved.filter(item => 
    item.assignments.some(a => a.roles.includes('choreographer'))
  ).length;
  const totalInstructors = leadersResolved.filter(item => 
    item.assignments.some(a => a.roles.includes('instructor'))
  ).length;

  return (
    <div className="d-flex flex-column gap-4">
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Dance Leaders</h1>
          <p className="page-header-subtitle">
            Manage ministry leaders, assistant leaders, choreographers, and instructors.
          </p>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Leaders</span>
            <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}><Crown size={18} /></div>
          </div>
          <div className="stat-card-value">{totalLeaders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Ministries Led</span>
            <div className="stat-card-icon" style={{ background: '#f3f4f6', color: '#6b7280' }}><Users size={18} /></div>
          </div>
          <div className="stat-card-value">{uniqueMinistriesLed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Choreographers</span>
            <div className="stat-card-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}><LayoutGrid size={18} /></div>
          </div>
          <div className="stat-card-value">{totalChoreographers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Instructors</span>
            <div className="stat-card-icon" style={{ background: '#dcfce7', color: '#16a34a' }}><BookOpen size={18} /></div>
          </div>
          <div className="stat-card-value">{totalInstructors}</div>
        </div>
      </div>

      {/* Unified Toolbar */}
      <div className="toolbar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div className="filters-group" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
          <div className="search-bar-container" style={{ display: 'block' }}>
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search leaders or ministries..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="form-control" 
            style={{ width: '200px' }}
            value={roleFilter} 
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="">All Leadership Roles</option>
            {LEADERSHIP_ROLES.map(r => (
              <option key={r} value={r}>{getRoleLabel(r)}</option>
            ))}
          </select>
          {(searchTerm || roleFilter) && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearchTerm(''); setRoleFilter(''); }}>Reset</button>
          )}
        </div>
        
        <div className="view-toggle" style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
          <button 
            className="btn-icon" 
            style={{ background: viewMode === 'grid' ? '#f3f4f6' : 'transparent', color: viewMode === 'grid' ? 'var(--text-main)' : 'var(--text-muted)' }} 
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            className="btn-icon" 
            style={{ background: viewMode === 'table' ? '#f3f4f6' : 'transparent', color: viewMode === 'table' ? 'var(--text-main)' : 'var(--text-muted)' }} 
            onClick={() => setViewMode('table')}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid-view" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredLeaders.length === 0 ? (
            <div className="empty-state w-100" style={{ gridColumn: '1 / -1' }}>No leaders found matching your filters.</div>
          ) : (
            filteredLeaders.map(item => {
              const { dancer, assignments } = item;
              return (
                <div key={dancer.id} className="card">
                  <div className="d-flex gap-3 mb-3">
                    <div className="list-avatar" style={{ width: 56, height: 56, flexShrink: 0, fontSize: '1.5rem', background: dancer.photo ? 'transparent' : 'var(--primary-light)' }}>
                      {dancer.photo ? (
                        <img src={dancer.photo} alt={dancer.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        dancer.name.charAt(0)
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {dancer.name}
                      </h3>
                      <div className="d-flex align-items-center gap-1" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <MapPin size={14} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dancer.town ? `${dancer.town}, ` : ''}{dancer.region}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="clean-list" style={{ gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {assignments.map((assignment, idx) => (
                      <div key={idx} style={{ background: '#f9fafb', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
                        <div className="d-flex align-items-center gap-2 mb-2" style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                          <Users size={16} className="text-muted" />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {assignment.ministry ? assignment.ministry.name : 'Unknown Ministry'}
                          </span>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                          {assignment.roles.filter(r => ['ministry_leader', 'assistant_leader', 'choreographer', 'instructor'].includes(r)).map(role => (
                            <span key={role} className="badge badge-subtle" style={{ background: role === 'ministry_leader' ? '#fef3c7' : '#f3f4f6', color: role === 'ministry_leader' ? '#d97706' : 'var(--text-body)' }}>
                              {getRoleLabel(role)}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="d-flex align-items-center justify-content-center gap-4 mt-auto" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    {dancer.phone && (
                      <a href={`tel:${dancer.phone}`} className="btn-icon" style={{ color: 'var(--text-main)' }} title={formatPhoneDisplay(dancer.phone)}>
                        <Phone size={18} />
                      </a>
                    )}
                    {dancer.whatsapp && (
                      <a href={getWhatsAppLink(dancer.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-icon" style={{ color: '#16a34a' }} title="WhatsApp">
                        <MessageCircle size={18} />
                      </a>
                    )}
                    {dancer.email && (
                      <a href={`mailto:${dancer.email}`} className="btn-icon" style={{ color: 'var(--text-main)' }} title={dancer.email}>
                        <Mail size={18} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Leader Name</th>
                <th>Ministry & Roles</th>
                <th>Contact</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaders.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    <div className="empty-state">No leaders found.</div>
                  </td>
                </tr>
              ) : (
                filteredLeaders.map(item => {
                  const { dancer, assignments } = item;
                  return (
                    <tr key={dancer.id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="list-avatar" style={{ width: 40, height: 40, fontSize: '1rem', background: dancer.photo ? 'transparent' : 'var(--primary-light)' }}>
                            {dancer.photo ? (
                              <img src={dancer.photo} alt={dancer.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              dancer.name.charAt(0)
                            )}
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{dancer.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-3">
                          {assignments.map((assignment, idx) => (
                            <div key={idx}>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                                {assignment.ministry ? assignment.ministry.name : 'Unknown'}
                              </div>
                              <div className="d-flex flex-wrap gap-2">
                                {assignment.roles.filter(r => ['ministry_leader', 'assistant_leader', 'choreographer', 'instructor'].includes(r)).map(role => (
                                  <span key={role} className="badge badge-subtle" style={{ background: role === 'ministry_leader' ? '#fef3c7' : '#f3f4f6', color: role === 'ministry_leader' ? '#d97706' : 'var(--text-body)' }}>
                                    {getRoleLabel(role)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-2" style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>
                          {dancer.phone && <div className="d-flex align-items-center gap-2"><Phone size={14} className="text-muted" /> <a href={`tel:${dancer.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{formatPhoneDisplay(dancer.phone)}</a></div>}
                          {dancer.email && <div className="d-flex align-items-center gap-2"><Mail size={14} className="text-muted" /> <a href={`mailto:${dancer.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{dancer.email}</a></div>}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-body)' }}>
                        {dancer.town ? `${dancer.town}, ` : ''}{dancer.region}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
