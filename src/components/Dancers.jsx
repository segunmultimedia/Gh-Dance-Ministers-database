import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Edit3, Trash2, Eye, UserMinus, FileDown, Phone, MapPin, Calendar, LayoutGrid, List, Users } from 'lucide-react';
import { GHANA_REGIONS, DANCER_TYPES, getDancerTypeLabel, getRoleLabel } from '../utils/constants';
import { formatPhoneDisplay, getWhatsAppLink } from '../utils/phoneUtils';
import { getDancerPrimaryMinistry, getDancerAllRoles } from '../services/dataService';
import { getBirthdayInfo, formatFullDate } from '../utils/birthdayUtils';

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
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const filteredDancers = useMemo(() => {
    return dancers.filter(dancer => {
      const matchSearch = dancer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (dancer.phone && dancer.phone.includes(searchTerm));
      const matchRegion = regionFilter ? dancer.region === regionFilter : true;
      const matchType = typeFilter ? dancer.dancerType === typeFilter : true;
      
      let matchMinistry = true;
      if (ministryFilter) {
        const primaryMinistry = getDancerPrimaryMinistry(dancer.id, memberships, ministries);
        matchMinistry = primaryMinistry && primaryMinistry.id === ministryFilter;
      }

      return matchSearch && matchRegion && matchType && matchMinistry;
    });
  }, [dancers, searchTerm, regionFilter, typeFilter, ministryFilter, memberships, ministries]);

  const hasActiveFilters = searchTerm || regionFilter || typeFilter || ministryFilter;

  const handleResetFilters = () => {
    setSearchTerm('');
    setRegionFilter('');
    setTypeFilter('');
    setMinistryFilter('');
  };

  const canDeleteDancer = (dancerId) => {
    // If a dancer has any leadership roles, maybe they shouldn't be deleted, just deactivated
    const roles = getDancerAllRoles(dancerId, memberships);
    return !roles.some(r => ['ministry_leader', 'assistant_leader'].includes(r));
  };

  const handleDelete = (dancer) => {
    if (canDeleteDancer(dancer.id)) {
      if (window.confirm(`Are you sure you want to completely delete ${dancer.name}? This action cannot be undone.`)) {
        onDeleteDancer(dancer.id);
      }
    } else {
      if (window.confirm(`${dancer.name} has leadership roles and cannot be fully deleted. Do you want to deactivate their profile instead?`)) {
        onDeactivateDancer(dancer.id);
      }
    }
  };

  const activeMinistries = ministries.filter(m => m.status === 'active');

  return (
    <div className="d-flex flex-column gap-4">
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Dancers Directory</h1>
          <p className="page-header-subtitle">
            Manage all registered members, leaders, and solo ministers in the database.
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-secondary" onClick={onExportCsv}>
            <FileDown size={18} />
            Export CSV
          </button>
          <button className="btn btn-primary" onClick={onAddDancer}>
            <Plus size={18} />
            Register Dancer
          </button>
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
              placeholder="Search by name or phone..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select className="form-control" style={{ width: '160px' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {DANCER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          
          <select className="form-control" style={{ width: '180px' }} value={regionFilter} onChange={e => setRegionFilter(e.target.value)}>
            <option value="">All Regions</option>
            {GHANA_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          
          <select className="form-control" style={{ width: '200px' }} value={ministryFilter} onChange={e => setMinistryFilter(e.target.value)}>
            <option value="">All Ministries</option>
            {activeMinistries.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          
          {hasActiveFilters && (
            <button className="btn btn-secondary btn-sm" onClick={handleResetFilters}>Reset</button>
          )}
        </div>
        
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted small fw-bold">{filteredDancers.length} result{filteredDancers.length !== 1 ? 's' : ''}</span>
          <div className="view-toggle" style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
            <button 
              className="btn-icon" 
              style={{ background: viewMode === 'table' ? '#f3f4f6' : 'transparent', color: viewMode === 'table' ? 'var(--text-main)' : 'var(--text-muted)' }} 
              onClick={() => setViewMode('table')}
            >
              <List size={18} />
            </button>
            <button 
              className="btn-icon" 
              style={{ background: viewMode === 'grid' ? '#f3f4f6' : 'transparent', color: viewMode === 'grid' ? 'var(--text-main)' : 'var(--text-muted)' }} 
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Dancer Name</th>
                <th>Ministry</th>
                <th>Contact</th>
                <th>Roles & Type</th>
                <th>Birthday</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDancers.map(dancer => {
                const ministry = getDancerPrimaryMinistry(dancer.id, memberships, ministries);
                const roles = getDancerAllRoles(dancer.id, memberships);
                const birthdayInfo = getBirthdayInfo(dancer.birthdayDay, dancer.birthdayMonth, dancer.birthYear);
                const isDeletable = canDeleteDancer(dancer.id);
                
                return (
                  <tr key={dancer.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="list-avatar" style={{ width: 40, height: 40, fontSize: '0.9rem', background: dancer.photo ? 'transparent' : 'var(--primary-light)' }}>
                          {dancer.photo ? (
                            <img src={dancer.photo} alt={dancer.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            dancer.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{dancer.name}</div>
                          {dancer.email && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dancer.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      {ministry ? (
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{ministry.name}</div>
                      ) : (
                        <span style={{ color: 'var(--text-light)' }}>None</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{formatPhoneDisplay(dancer.phone)}</div>
                      {dancer.whatsapp && dancer.whatsapp !== dancer.phone && <div style={{ fontSize: '0.8rem', color: '#16a34a' }}>WA: {formatPhoneDisplay(dancer.whatsapp)}</div>}
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        <div>
                          <span className="badge badge-subtle" style={{ background: '#f3f4f6', color: 'var(--text-body)' }}>{getDancerTypeLabel(dancer.dancerType)}</span>
                        </div>
                        {roles.length > 0 && (
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {roles.slice(0, 2).map(r => <span key={r} className="badge" style={{ background: '#e0f2fe', color: '#0284c7', fontSize: '0.7rem' }}>{getRoleLabel(r)}</span>)}
                            {roles.length > 2 && <span className="badge" style={{ background: '#f3f4f6', color: 'var(--text-muted)', fontSize: '0.7rem' }}>+{roles.length - 2}</span>}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {birthdayInfo ? (
                        <div style={{ fontSize: '0.85rem', fontWeight: birthdayInfo.daysUntil <= 14 ? 600 : 400, color: birthdayInfo.daysUntil === 0 ? '#e11d48' : birthdayInfo.daysUntil === 1 ? '#d97706' : 'var(--text-body)' }}>
                          {birthdayInfo.daysUntil === 0 ? 'Today!' : birthdayInfo.daysUntil === 1 ? 'Tomorrow' : birthdayInfo.daysUntil <= 14 ? `In ${birthdayInfo.daysUntil} days` : formatFullDate(dancer.birthdayDay, dancer.birthdayMonth, dancer.birthYear)}
                        </div>
                      ) : <span style={{ color: 'var(--text-light)' }}>-</span>}
                    </td>
                    <td>
                      <div className="permission-dot" style={{ color: dancer.status === 'Active' ? 'var(--success-text)' : 'var(--text-muted)' }}>
                        <div className={`dot-indicator ${dancer.status === 'Active' ? 'dot-success' : ''}`} style={{ background: dancer.status === 'Active' ? undefined : '#9ca3af' }} />
                        {dancer.status}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-1 justify-content-end">
                        <button className="btn-icon" onClick={() => onViewDancer(dancer)} title="View Profile"><Eye size={18} /></button>
                        <button className="btn-icon" onClick={() => onEditDancer(dancer)} title="Edit Dancer"><Edit3 size={18} /></button>
                        <button className="btn-icon" onClick={() => handleDelete(dancer)} title={isDeletable ? "Delete Dancer" : "Deactivate Dancer"} style={{ color: 'var(--danger-text)' }}>
                          {isDeletable ? <Trash2 size={18} /> : <UserMinus size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid-view" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredDancers.map(dancer => {
            const ministry = getDancerPrimaryMinistry(dancer.id, memberships, ministries);
            const roles = getDancerAllRoles(dancer.id, memberships);
            const birthdayInfo = getBirthdayInfo(dancer.birthdayDay, dancer.birthdayMonth, dancer.birthYear);
            const isDeletable = canDeleteDancer(dancer.id);
            
            return (
              <div key={dancer.id} className="card" style={{ opacity: dancer.status === 'Active' ? 1 : 0.75 }}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="list-avatar" style={{ width: 64, height: 64, fontSize: '1.5rem', background: dancer.photo ? 'transparent' : 'var(--primary-light)' }}>
                    {dancer.photo ? <img src={dancer.photo} alt={dancer.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : dancer.name.charAt(0)}
                  </div>
                  <div className="permission-dot" style={{ color: dancer.status === 'Active' ? 'var(--success-text)' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                    <div className={`dot-indicator ${dancer.status === 'Active' ? 'dot-success' : ''}`} style={{ background: dancer.status === 'Active' ? undefined : '#9ca3af' }} />
                    {dancer.status}
                  </div>
                </div>
                
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>{dancer.name}</h3>
                
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="badge badge-subtle">{getDancerTypeLabel(dancer.dancerType)}</span>
                  {ministry && <span className="badge" style={{ background: '#fef3c7', color: '#d97706' }}>{ministry.name}</span>}
                </div>
                
                {roles.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {roles.map(r => <span key={r} className="badge" style={{ background: '#e0f2fe', color: '#0284c7' }}>{getRoleLabel(r)}</span>)}
                  </div>
                )}
                
                <div className="clean-list mt-auto" style={{ gap: '0.5rem' }}>
                  <div className="d-flex align-items-center gap-2" style={{ color: 'var(--text-body)', fontSize: '0.85rem' }}>
                    <Phone size={14} className="text-muted" /> {formatPhoneDisplay(dancer.phone)}
                  </div>
                  {(dancer.town || dancer.region) && (
                    <div className="d-flex align-items-center gap-2" style={{ color: 'var(--text-body)', fontSize: '0.85rem' }}>
                      <MapPin size={14} className="text-muted" /> {[dancer.town, dancer.region].filter(Boolean).join(', ')}
                    </div>
                  )}
                  {birthdayInfo && (
                    <div className="d-flex align-items-center gap-2" style={{ color: birthdayInfo.daysUntil <= 14 ? '#e11d48' : 'var(--text-body)', fontSize: '0.85rem', fontWeight: birthdayInfo.daysUntil <= 14 ? 600 : 400 }}>
                      <Calendar size={14} className={birthdayInfo.daysUntil <= 14 ? '' : 'text-muted'} /> {birthdayInfo.daysUntil === 0 ? 'Birthday Today!' : formatFullDate(dancer.birthdayDay, dancer.birthdayMonth, dancer.birthYear)}
                    </div>
                  )}
                </div>
                
                <div className="d-flex gap-2 mt-4" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => onViewDancer(dancer)}>
                    <Eye size={16} /> View
                  </button>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => onEditDancer(dancer)}>
                    <Edit3 size={16} /> Edit
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(dancer)} style={{ color: 'var(--danger-text)' }}>
                    {isDeletable ? <Trash2 size={16} /> : <UserMinus size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {filteredDancers.length === 0 && (
        <div className="empty-state" style={{ padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
          <Users size={48} style={{ color: 'var(--text-light)', margin: '0 auto 1rem auto', display: 'block' }} />
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No dancers found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Try adjusting your filters or search term to find what you're looking for.</p>
          {hasActiveFilters && (
            <button className="btn btn-secondary" onClick={handleResetFilters}>Clear Filters</button>
          )}
        </div>
      )}
    </div>
  );
}
