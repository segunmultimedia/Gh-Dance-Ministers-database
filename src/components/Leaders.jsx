import React, { useState, useMemo } from 'react';
import { LayoutGrid, List, Eye, Phone, MapPin, MoreVertical } from 'lucide-react';
import { GHANA_REGIONS, getRoleLabel } from '../utils/constants';
import { formatPhoneDisplay, getWhatsAppLink } from '../utils/phoneUtils';
import { getAllLeadersResolved } from '../services/dataService';

export default function Leaders({ dancers, ministries, memberships, onViewDancer, searchTerm }) {
  const [regionFilter, setRegionFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [ministryFilter, setMinistryFilter] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [activeMenuId, setActiveMenuId] = useState(null);

  const activeMinistries = ministries.filter(m => m.status !== 'inactive');
  
  const allLeaders = useMemo(() => {
    return getAllLeadersResolved(dancers, memberships, ministries);
  }, [dancers, memberships, ministries]);

  const allRolesList = Array.from(new Set(allLeaders.map(l => l.role)));

  const filteredLeaders = useMemo(() => {
    return allLeaders.filter(leader => {
      const matchSearch = leader.name.toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                          (leader.phone && leader.phone.includes(searchTerm || ''));
      const matchRegion = regionFilter ? leader.region === regionFilter : true;
      const matchRole = roleFilter ? leader.role === roleFilter : true;
      const matchMinistry = ministryFilter ? (leader.ministryId && leader.ministryId.toString() === ministryFilter) : true;
      return matchSearch && matchRegion && matchRole && matchMinistry;
    });
  }, [allLeaders, searchTerm, regionFilter, roleFilter, ministryFilter]);

  // Aggregate unique leaders for statistics to avoid duplicate counting
  const uniqueLeaderIds = new Set(filteredLeaders.map(l => l.id));

  return (
    <div className="page-content">
      <div className="toolbar" style={{ borderRadius: 'var(--radius-lg)' }}>
        <div className="toolbar-group">
          <select className="form-control" style={{ width: '150px' }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            {allRolesList.map(r => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
          </select>
          <select className="form-control" style={{ width: '160px' }} value={ministryFilter} onChange={e => setMinistryFilter(e.target.value)}>
            <option value="">All Ministries</option>
            {activeMinistries.map(m => <option key={m.id} value={m.id.toString()}>{m.name}</option>)}
          </select>
          <select className="form-control" style={{ width: '150px' }} value={regionFilter} onChange={e => setRegionFilter(e.target.value)}>
            <option value="">All Regions</option>
            {GHANA_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        
        <div className="toolbar-actions">
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{uniqueLeaderIds.size} Leaders Found</span>
          <div style={{ display: 'flex', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button className="btn-icon" style={{ borderRadius: 0, background: viewMode === 'table' ? 'white' : 'transparent', color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-muted)' }} onClick={() => setViewMode('table')}><List size={18} /></button>
            <button className="btn-icon" style={{ borderRadius: 0, background: viewMode === 'grid' ? 'white' : 'transparent', color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)' }} onClick={() => setViewMode('grid')}><LayoutGrid size={18} /></button>
          </div>
        </div>
      </div>

      <div className="card">
        {filteredLeaders.length === 0 ? (
          <div className="empty-state">No leaders match your criteria.</div>
        ) : viewMode === 'table' ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Leader</th>
                  <th>Role</th>
                  <th>Ministry</th>
                  <th>Contact</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaders.map((leader, index) => {
                  const isActive = leader.status === 'Active';
                  // Use index as key because one leader can have multiple roles in different ministries
                  const menuOpen = activeMenuId === index;

                  return (
                    <tr key={index} style={{ opacity: isActive ? 1 : 0.6 }}>
                      <td>
                        <div className="cell-identity">
                          <div className="avatar">
                            {leader.photo ? <img src={leader.photo} alt={leader.name} /> : leader.name.charAt(0)}
                          </div>
                          <span className="identity-primary">{leader.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-orange">{getRoleLabel(leader.role)}</span>
                      </td>
                      <td>
                        {leader.ministryName ? <span className="td-main">{leader.ministryName}</span> : <span className="td-quiet">General Leader</span>}
                      </td>
                      <td>
                        <div className="cell-stack">
                          <span className="stack-primary">{formatPhoneDisplay(leader.phone)}</span>
                          {leader.whatsapp && leader.whatsapp !== leader.phone && (
                            <a href={getWhatsAppLink(leader.whatsapp)} target="_blank" rel="noopener noreferrer" className="stack-wa">
                              <Phone size={12} /> WhatsApp
                            </a>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="cell-stack">
                          <span className="stack-primary">{leader.town || 'Unknown'}</span>
                          {leader.region && <span className="stack-secondary"><MapPin size={12}/> {leader.region}</span>}
                        </div>
                      </td>
                      <td>
                        <div className="status-indicator">
                          <span className={`status-dot ${isActive ? 'active' : 'inactive'}`}></span>
                          {isActive ? 'Active' : 'Inactive'}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="action-menu-wrapper">
                          <button className="btn-icon" onClick={() => setActiveMenuId(menuOpen ? null : index)}>
                            <MoreVertical size={18} />
                          </button>
                          {menuOpen && (
                            <>
                              <div className="action-overlay" onClick={() => setActiveMenuId(null)}></div>
                              <div className="action-dropdown">
                                <button onClick={() => { onViewDancer(leader); setActiveMenuId(null); }}><Eye size={16} /> View Profile</button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="data-grid">
            {filteredLeaders.map((leader, index) => {
              const isActive = leader.status === 'Active';
              const menuOpen = activeMenuId === index;
              return (
                <div key={index} className="data-grid-card" style={{ opacity: isActive ? 1 : 0.6 }}>
                  <div className="d-flex justify-between align-center">
                    <div className="cell-identity">
                      <div className="avatar">
                        {leader.photo ? <img src={leader.photo} alt={leader.name} /> : leader.name.charAt(0)}
                      </div>
                      <div className="identity-text">
                        <span className="identity-primary">{leader.name}</span>
                        <span className="identity-secondary">{getRoleLabel(leader.role)}</span>
                      </div>
                    </div>
                    <div className="action-menu-wrapper">
                      <button className="btn-icon" onClick={() => setActiveMenuId(menuOpen ? null : index)}><MoreVertical size={18} /></button>
                      {menuOpen && (
                        <>
                          <div className="action-overlay" onClick={() => setActiveMenuId(null)}></div>
                          <div className="action-dropdown">
                            <button onClick={() => { onViewDancer(leader); setActiveMenuId(null); }}><Eye size={16} /> View Profile</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2 mt-4">
                    {leader.ministryName && (
                      <div className="d-flex justify-between">
                        <span className="td-quiet">Ministry</span>
                        <span className="td-main" style={{ fontSize: '0.85rem', textAlign: 'right' }}>{leader.ministryName}</span>
                      </div>
                    )}
                    <div className="d-flex justify-between">
                      <span className="td-quiet">Contact</span>
                      <span className="td-main" style={{ fontSize: '0.85rem' }}>{formatPhoneDisplay(leader.phone)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
