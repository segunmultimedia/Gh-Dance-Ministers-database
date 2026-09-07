import React, { useState, useMemo } from 'react';
import { FileDown, LayoutGrid, List, Eye, Edit3, UserMinus, Trash2, Phone, MapPin, MoreVertical } from 'lucide-react';
import { GHANA_REGIONS, DANCER_TYPES, getDancerTypeLabel, getRoleLabel } from '../utils/constants';
import { formatPhoneDisplay, getWhatsAppLink } from '../utils/phoneUtils';
import { getDancerPrimaryMinistry, getDancerAllRoles, canDeleteDancer } from '../services/dataService';
import { getBirthdayInfo } from '../utils/birthdayUtils';

export default function Dancers({ 
  dancers, ministries, memberships,
  onEditDancer, onViewDancer, onDeleteDancer, onDeactivateDancer, onExportCsv, searchTerm
}) {
  const [regionFilter, setRegionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [ministryFilter, setMinistryFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [activeMenuId, setActiveMenuId] = useState(null);

  const activeMinistries = ministries.filter(m => m.status !== 'inactive');

  const filteredDancers = useMemo(() => {
    return dancers.filter(dancer => {
      const matchSearch = dancer.name.toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                         (dancer.phone && dancer.phone.includes(searchTerm || ''));
      const matchRegion = regionFilter ? dancer.region === regionFilter : true;
      const matchType = typeFilter ? dancer.dancerType === typeFilter : true;
      const matchStatus = statusFilter ? dancer.status === statusFilter : true;
      
      let matchMinistry = true;
      let matchRole = true;

      const roles = getDancerAllRoles(dancer.id, memberships);
      if (roleFilter && !roles.includes(roleFilter)) matchRole = false;
      if (ministryFilter) {
        const primaryMinistry = getDancerPrimaryMinistry(dancer.id, memberships, ministries);
        matchMinistry = primaryMinistry && primaryMinistry.id.toString() === ministryFilter;
      }

      return matchSearch && matchRegion && matchType && matchMinistry && matchRole && matchStatus;
    });
  }, [dancers, searchTerm, regionFilter, typeFilter, ministryFilter, roleFilter, statusFilter, memberships, ministries]);

  const allRolesList = Array.from(new Set(memberships.flatMap(m => m.roles)));

  const handleDelete = (dancer) => {
    const isDeletable = canDeleteDancer(dancer.id);
    if (isDeletable) {
      if (window.confirm(`Are you sure you want to completely delete ${dancer.name}?`)) onDeleteDancer(dancer);
    } else {
      if (window.confirm(`Cannot delete ${dancer.name} because they have history. Deactivate them instead?`)) onDeactivateDancer(dancer.id);
    }
    setActiveMenuId(null);
  };

  const handleToggleStatus = (dancer) => {
    if (dancer.status === 'Active') {
      if (window.confirm(`Deactivate ${dancer.name}?`)) onDeactivateDancer(dancer.id);
    } else {
      alert("Please edit the dancer to reactivate them.");
      onEditDancer(dancer);
    }
    setActiveMenuId(null);
  };

  return (
    <div className="page-content">
      
      <div className="toolbar" style={{ borderRadius: 'var(--radius-lg)' }}>
        <div className="toolbar-group">
          <select className="form-control" style={{ width: '150px' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {DANCER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select className="form-control" style={{ width: '150px' }} value={regionFilter} onChange={e => setRegionFilter(e.target.value)}>
            <option value="">All Regions</option>
            {GHANA_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select className="form-control" style={{ width: '160px' }} value={ministryFilter} onChange={e => setMinistryFilter(e.target.value)}>
            <option value="">All Ministries</option>
            {activeMinistries.map(m => <option key={m.id} value={m.id.toString()}>{m.name}</option>)}
          </select>
          <select className="form-control" style={{ width: '150px' }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            {allRolesList.map(r => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
          </select>
          <select className="form-control" style={{ width: '120px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="toolbar-actions">
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{filteredDancers.length} Found</span>
          <div style={{ display: 'flex', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button className="btn-icon" style={{ borderRadius: 0, background: viewMode === 'table' ? 'white' : 'transparent', color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-muted)' }} onClick={() => setViewMode('table')}><List size={18} /></button>
            <button className="btn-icon" style={{ borderRadius: 0, background: viewMode === 'grid' ? 'white' : 'transparent', color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)' }} onClick={() => setViewMode('grid')}><LayoutGrid size={18} /></button>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onExportCsv} title="Export CSV">
            <FileDown size={16} /> <span className="hide-mobile">Export</span>
          </button>
        </div>
      </div>

      <div className="card">
        {filteredDancers.length === 0 ? (
          <div className="empty-state">No dancers match your criteria.</div>
        ) : viewMode === 'table' ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dancer</th>
                  <th>Ministry</th>
                  <th>Contact</th>
                  <th>Type & Roles</th>
                  <th>Birthday</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDancers.map(dancer => {
                  const primaryMinistry = getDancerPrimaryMinistry(dancer.id, memberships, ministries);
                  const roles = getDancerAllRoles(dancer.id, memberships);
                  const isActive = dancer.status === 'Active';
                  const bday = getBirthdayInfo(dancer.birthdayDay, dancer.birthdayMonth, dancer.birthYear);
                  const menuOpen = activeMenuId === dancer.id;

                  return (
                    <tr key={dancer.id} style={{ opacity: isActive ? 1 : 0.6 }}>
                      <td>
                        <div className="cell-identity">
                          <div className="avatar">
                            {dancer.photo ? <img src={dancer.photo} alt={dancer.name} /> : dancer.name.charAt(0)}
                          </div>
                          <div className="identity-text">
                            <span className="identity-primary">{dancer.name}</span>
                            {dancer.email && <span className="identity-secondary">{dancer.email}</span>}
                          </div>
                        </div>
                      </td>
                      <td>
                        {primaryMinistry ? <span className="td-main">{primaryMinistry.name}</span> : <span className="td-quiet">Unassigned</span>}
                      </td>
                      <td>
                        <div className="cell-stack">
                          <span className="stack-primary">{formatPhoneDisplay(dancer.phone)}</span>
                          {dancer.whatsapp && dancer.whatsapp !== dancer.phone && (
                            <a href={getWhatsAppLink(dancer.whatsapp)} target="_blank" rel="noopener noreferrer" className="stack-wa">
                              <Phone size={12} /> WhatsApp
                            </a>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="cell-stack">
                          <span className="stack-primary">{getDancerTypeLabel(dancer.dancerType)}</span>
                          {roles.length > 0 && (
                            <div className="d-flex" style={{ gap: '0.25rem', flexWrap: 'wrap' }}>
                              {roles.slice(0, 2).map((r, i) => <span key={i} className="badge badge-blue">{getRoleLabel(r)}</span>)}
                              {roles.length > 2 && <span className="badge">+{roles.length - 2} more</span>}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="cell-stack">
                          <span className="stack-primary">{bday.birthdayMonth ? bday.formattedBirthday : 'Not provided'}</span>
                          {bday.status === 'today' && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>Today</span>}
                          {bday.status === 'tomorrow' && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning)' }}>Tomorrow</span>}
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
                          <button className="btn-icon" onClick={() => setActiveMenuId(menuOpen ? null : dancer.id)}>
                            <MoreVertical size={18} />
                          </button>
                          {menuOpen && (
                            <>
                              <div className="action-overlay" onClick={() => setActiveMenuId(null)}></div>
                              <div className="action-dropdown">
                                <button onClick={() => { onViewDancer(dancer); setActiveMenuId(null); }}><Eye size={16} /> View Profile</button>
                                <button onClick={() => { onEditDancer(dancer); setActiveMenuId(null); }}><Edit3 size={16} /> Edit Dancer</button>
                                <button onClick={() => handleToggleStatus(dancer)}><UserMinus size={16} /> {isActive ? 'Deactivate' : 'Reactivate'}</button>
                                {canDeleteDancer(dancer.id) && <button className="danger" onClick={() => handleDelete(dancer)}><Trash2 size={16} /> Delete</button>}
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
            {filteredDancers.map(dancer => {
              const isActive = dancer.status === 'Active';
              const primaryMinistry = getDancerPrimaryMinistry(dancer.id, memberships, ministries);
              const roles = getDancerAllRoles(dancer.id, memberships);
              const menuOpen = activeMenuId === dancer.id;

              return (
                <div key={dancer.id} className="data-grid-card" style={{ opacity: isActive ? 1 : 0.6 }}>
                  <div className="d-flex justify-between align-center">
                    <div className="cell-identity">
                      <div className="avatar">
                        {dancer.photo ? <img src={dancer.photo} alt={dancer.name} /> : dancer.name.charAt(0)}
                      </div>
                      <div className="identity-text">
                        <span className="identity-primary">{dancer.name}</span>
                        <span className="identity-secondary">{getDancerTypeLabel(dancer.dancerType)}</span>
                      </div>
                    </div>
                    <div className="action-menu-wrapper">
                      <button className="btn-icon" onClick={() => setActiveMenuId(menuOpen ? null : dancer.id)}><MoreVertical size={18} /></button>
                      {menuOpen && (
                        <>
                          <div className="action-overlay" onClick={() => setActiveMenuId(null)}></div>
                          <div className="action-dropdown">
                            <button onClick={() => { onViewDancer(dancer); setActiveMenuId(null); }}><Eye size={16} /> View Profile</button>
                            <button onClick={() => { onEditDancer(dancer); setActiveMenuId(null); }}><Edit3 size={16} /> Edit Dancer</button>
                            <button onClick={() => handleToggleStatus(dancer)}><UserMinus size={16} /> {isActive ? 'Deactivate' : 'Reactivate'}</button>
                            {canDeleteDancer(dancer.id) && <button className="danger" onClick={() => handleDelete(dancer)}><Trash2 size={16} /> Delete</button>}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="d-flex justify-between align-center mt-4">
                    <div className="status-indicator">
                      <span className={`status-dot ${isActive ? 'active' : 'inactive'}`}></span> {isActive ? 'Active' : 'Inactive'}
                    </div>
                    <span className="td-quiet"><Phone size={14} style={{ verticalAlign: 'middle', marginRight: 4 }}/>{formatPhoneDisplay(dancer.phone)}</span>
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
