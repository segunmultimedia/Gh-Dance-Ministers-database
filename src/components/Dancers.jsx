import React, { useState, useMemo } from 'react';
import { Search, Plus, FileDown, LayoutGrid, List, Eye, Edit3, UserMinus, Trash2, Phone, MapPin, MoreVertical } from 'lucide-react';
import { GHANA_REGIONS, DANCER_TYPES, getDancerTypeLabel, getRoleLabel } from '../utils/constants';
import { formatPhoneDisplay, getWhatsAppLink } from '../utils/phoneUtils';
import { getDancerPrimaryMinistry, getDancerAllRoles, canDeleteDancer } from '../services/dataService';
import { getBirthdayInfo } from '../utils/birthdayUtils';

export default function Dancers({ 
  dancers, 
  ministries, 
  memberships,
  onAddDancer, 
  onEditDancer, 
  onViewDancer, 
  onDeleteDancer,
  onDeactivateDancer,
  onExportCsv 
}) {
  const [searchTerm, setSearchTerm] = useState('');
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
      const matchSearch = dancer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (dancer.phone && dancer.phone.includes(searchTerm));
      const matchRegion = regionFilter ? dancer.region === regionFilter : true;
      const matchType = typeFilter ? dancer.dancerType === typeFilter : true;
      const matchStatus = statusFilter ? dancer.status === statusFilter : true;
      
      let matchMinistry = true;
      let matchRole = true;

      const roles = getDancerAllRoles(dancer.id, memberships);
      if (roleFilter && !roles.includes(roleFilter)) {
        matchRole = false;
      }

      if (ministryFilter) {
        const primaryMinistry = getDancerPrimaryMinistry(dancer.id, memberships, ministries);
        matchMinistry = primaryMinistry && primaryMinistry.id.toString() === ministryFilter;
      }

      return matchSearch && matchRegion && matchType && matchMinistry && matchRole && matchStatus;
    });
  }, [dancers, searchTerm, regionFilter, typeFilter, ministryFilter, roleFilter, statusFilter, memberships, ministries]);

  const allRolesList = Array.from(new Set(memberships.flatMap(m => m.roles)));
  const hasActiveFilters = searchTerm || regionFilter || typeFilter || ministryFilter || roleFilter || statusFilter;

  const handleResetFilters = () => {
    setSearchTerm('');
    setRegionFilter('');
    setTypeFilter('');
    setMinistryFilter('');
    setRoleFilter('');
    setStatusFilter('');
  };

  const handleDelete = (dancer) => {
    const isDeletable = canDeleteDancer(dancer.id);
    if (isDeletable) {
      if (window.confirm(`Are you sure you want to completely delete ${dancer.name}?`)) {
        onDeleteDancer(dancer);
      }
    } else {
      if (window.confirm(`Cannot delete ${dancer.name} because they have history. Deactivate them instead?`)) {
        onDeactivateDancer(dancer.id);
      }
    }
    setActiveMenuId(null);
  };

  const handleToggleStatus = (dancer) => {
    // Reusing onDeactivateDancer logic or firing an update via onEditDancer could be used,
    // assuming onDeactivateDancer toggles or deactivates. For safety, let's just trigger edit for full control,
    // or trigger onDeactivateDancer if it's currently active.
    if (dancer.status === 'Active') {
      if (window.confirm(`Deactivate ${dancer.name}?`)) onDeactivateDancer(dancer.id);
    } else {
      alert("Please edit the dancer to reactivate them.");
      onEditDancer(dancer);
    }
    setActiveMenuId(null);
  };

  return (
    <div className="dancers-page">
      <div className="page-content">
        <p className="dancers-subtitle">Manage all registered dancers across ministries.</p>

        {/* Filter Toolbar */}
        <div className="dancers-toolbar">
          <div className="dancers-search">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search name or phone..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="dancers-filters-group">
            <select className="dancers-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              {DANCER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            <select className="dancers-select" value={regionFilter} onChange={e => setRegionFilter(e.target.value)}>
              <option value="">All Regions</option>
              {GHANA_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <select className="dancers-select" value={ministryFilter} onChange={e => setMinistryFilter(e.target.value)}>
              <option value="">All Ministries</option>
              {activeMinistries.map(m => <option key={m.id} value={m.id.toString()}>{m.name}</option>)}
            </select>

            <select className="dancers-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              {allRolesList.map(r => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
            </select>

            <select className="dancers-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="dancers-toolbar-actions">
            <span className="dancers-result-count">{filteredDancers.length} Found</span>
            <div className="dancers-view-toggle">
              <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')} title="Table View"><List size={18} /></button>
              <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} title="Grid View"><LayoutGrid size={18} /></button>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={onExportCsv} title="Export CSV" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileDown size={16} /> <span className="hide-mobile">Export</span>
            </button>
          </div>
        </div>

        {/* Data Panel */}
        <div className="dancers-data-panel">
          {filteredDancers.length === 0 ? (
            <div className="dancers-empty">
              <p>No dancers match your criteria.</p>
              {hasActiveFilters ? (
                <button className="btn btn-secondary" onClick={handleResetFilters}>Clear Filters</button>
              ) : (
                <button className="btn btn-primary" onClick={onAddDancer}><Plus size={18} /> Register Dancer</button>
              )}
            </div>
          ) : viewMode === 'table' ? (
            <div className="dancers-table-wrapper">
              <table className="dancers-table">
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
                    const isDeletable = canDeleteDancer(dancer.id);
                    const menuOpen = activeMenuId === dancer.id;

                    return (
                      <tr key={dancer.id} className={!isActive ? 'inactive-row' : ''}>
                        <td className="col-dancer">
                          <div className="dancer-identity">
                            <div className="dancer-avatar">
                              {dancer.photo ? <img src={dancer.photo} alt={dancer.name} /> : <span>{dancer.name.charAt(0).toUpperCase()}</span>}
                            </div>
                            <div className="dancer-name-stack">
                              <div className="dancer-name">{dancer.name}</div>
                              {dancer.email && <div className="dancer-email">{dancer.email}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="col-ministry">
                          {primaryMinistry ? <span className="ministry-name">{primaryMinistry.name}</span> : <span className="text-quiet">No ministry</span>}
                        </td>
                        <td className="col-contact">
                          <div className="contact-stack">
                            <span className="contact-phone">{formatPhoneDisplay(dancer.phone)}</span>
                            {dancer.whatsapp && dancer.whatsapp !== dancer.phone && (
                              <a href={getWhatsAppLink(dancer.whatsapp)} target="_blank" rel="noopener noreferrer" className="contact-wa">
                                <Phone size={12} /> WhatsApp
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="col-roles">
                          <div className="role-stack">
                            <span className="type-label">{getDancerTypeLabel(dancer.dancerType)}</span>
                            {roles.length > 0 && (
                              <div className="badges-row">
                                {roles.slice(0, 2).map((r, i) => <span key={i} className="role-badge">{getRoleLabel(r)}</span>)}
                                {roles.length > 2 && <span className="role-badge-more">+{roles.length - 2} more</span>}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="col-birthday">
                          <div className="birthday-stack">
                            <span className="bday-text">{bday.birthdayMonth ? bday.formattedBirthday : 'Not provided'}</span>
                            {bday.status === 'today' && <span className="bday-highlight today">Today</span>}
                            {bday.status === 'tomorrow' && <span className="bday-highlight tomorrow">Tomorrow</span>}
                            {bday.status === 'this_week' && <span className="bday-highlight upcoming">In {bday.daysUntil} days</span>}
                          </div>
                        </td>
                        <td className="col-status">
                          <div className="status-indicator">
                            <span className={`status-dot ${isActive ? 'active' : 'inactive'}`}></span>
                            <span className="status-text">{isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                        </td>
                        <td className="col-actions text-right">
                          <div className="action-menu-container">
                            <button 
                              className="action-trigger" 
                              onClick={() => setActiveMenuId(menuOpen ? null : dancer.id)}
                            >
                              <MoreVertical size={18} />
                            </button>
                            {menuOpen && (
                              <>
                                <div className="action-menu-overlay" onClick={() => setActiveMenuId(null)}></div>
                                <div className="action-menu">
                                  <button onClick={() => { onViewDancer(dancer); setActiveMenuId(null); }}><Eye size={16} /> View profile</button>
                                  <button onClick={() => { onEditDancer(dancer); setActiveMenuId(null); }}><Edit3 size={16} /> Edit dancer</button>
                                  <button onClick={() => handleToggleStatus(dancer)}><UserMinus size={16} /> {isActive ? 'Deactivate' : 'Reactivate'}</button>
                                  {isDeletable && (
                                    <button className="danger" onClick={() => handleDelete(dancer)}><Trash2 size={16} /> Delete</button>
                                  )}
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
            <div className="dancers-grid">
              {filteredDancers.map(dancer => {
                const primaryMinistry = getDancerPrimaryMinistry(dancer.id, memberships, ministries);
                const roles = getDancerAllRoles(dancer.id, memberships);
                const isActive = dancer.status === 'Active';
                const bday = getBirthdayInfo(dancer.birthdayDay, dancer.birthdayMonth, dancer.birthYear);
                const isDeletable = canDeleteDancer(dancer.id);
                const menuOpen = activeMenuId === dancer.id;

                return (
                  <div key={dancer.id} className={`dancer-card ${!isActive ? 'inactive-card' : ''}`}>
                    <div className="card-top">
                      <div className="dancer-identity">
                        <div className="dancer-avatar">
                          {dancer.photo ? <img src={dancer.photo} alt={dancer.name} /> : <span>{dancer.name.charAt(0).toUpperCase()}</span>}
                        </div>
                        <div className="dancer-name-stack">
                          <div className="dancer-name">{dancer.name}</div>
                          <div className="type-label">{getDancerTypeLabel(dancer.dancerType)}</div>
                        </div>
                      </div>
                      <div className="action-menu-container">
                        <button className="action-trigger" onClick={() => setActiveMenuId(menuOpen ? null : dancer.id)}><MoreVertical size={18} /></button>
                        {menuOpen && (
                          <>
                            <div className="action-menu-overlay" onClick={() => setActiveMenuId(null)}></div>
                            <div className="action-menu">
                              <button onClick={() => { onViewDancer(dancer); setActiveMenuId(null); }}><Eye size={16} /> View profile</button>
                              <button onClick={() => { onEditDancer(dancer); setActiveMenuId(null); }}><Edit3 size={16} /> Edit dancer</button>
                              <button onClick={() => handleToggleStatus(dancer)}><UserMinus size={16} /> {isActive ? 'Deactivate' : 'Reactivate'}</button>
                              {isDeletable && <button className="danger" onClick={() => handleDelete(dancer)}><Trash2 size={16} /> Delete</button>}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="card-middle">
                      {primaryMinistry && (
                        <div className="info-row">
                          <span className="info-label">Ministry</span>
                          <span className="info-value">{primaryMinistry.name}</span>
                        </div>
                      )}
                      <div className="info-row">
                        <span className="info-label">Phone</span>
                        <span className="info-value"><a href={`tel:${dancer.phone}`}>{formatPhoneDisplay(dancer.phone)}</a></span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Status</span>
                        <div className="status-indicator">
                          <span className={`status-dot ${isActive ? 'active' : 'inactive'}`}></span>
                          <span className="status-text">{isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    </div>

                    {roles.length > 0 && (
                      <div className="card-bottom">
                        <div className="badges-row">
                          {roles.map((r, i) => <span key={i} className="role-badge">{getRoleLabel(r)}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
