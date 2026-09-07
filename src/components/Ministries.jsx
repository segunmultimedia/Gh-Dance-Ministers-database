import React, { useState, useMemo } from 'react';
import { Search, MapPin, Users, Crown, Edit3, Power, Eye, Building2, Plus, LayoutGrid, List } from 'lucide-react';
import { GHANA_REGIONS } from '../utils/constants';
import { getMinistryLeaders, getMinistryMemberCount } from '../services/dataService';

export default function Ministries({ 
  ministries, 
  memberships, 
  dancers, 
  onAddMinistry, 
  onEditMinistry, 
  onViewMinistry,
  onUpdateMinistryStatus 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  const filteredMinistries = useMemo(() => {
    return ministries.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (m.church && m.church.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchRegion = regionFilter ? m.region === regionFilter : true;
      const matchStatus = statusFilter ? m.status === statusFilter : true;
      return matchSearch && matchRegion && matchStatus;
    });
  }, [ministries, searchTerm, regionFilter, statusFilter]);

  const activeMinistries = ministries.filter(m => m.status === 'active').length;
  const regionsCovered = new Set(ministries.map(m => m.region)).size;

  const resetFilters = () => {
    setSearchTerm('');
    setRegionFilter('');
    setStatusFilter('');
  };

  const handleDeactivate = async (ministry) => {
    const newStatus = ministry.status === 'active' ? 'inactive' : 'active';
    const confirmMsg = newStatus === 'inactive' 
      ? `Are you sure you want to deactivate ${ministry.name}? Members will still exist but the ministry will be hidden from primary lists.`
      : `Reactivate ${ministry.name}?`;
      
    if (window.confirm(confirmMsg)) {
      await onUpdateMinistryStatus(ministry.id, newStatus);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Dance Ministries</h1>
          <p className="page-header-subtitle">
            Manage your registered ministries, churches, and affiliated organizations.
          </p>
        </div>
        <button className="btn btn-primary" onClick={onAddMinistry}>
          <Plus size={18} />
          Register Ministry
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Ministries</span>
            <div className="stat-card-icon" style={{ background: '#f3f4f6', color: '#6b7280' }}><Building2 size={18} /></div>
          </div>
          <div className="stat-card-value">{ministries.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Active Ministries</span>
            <div className="stat-card-icon" style={{ background: '#dcfce7', color: '#16a34a' }}><Building2 size={18} /></div>
          </div>
          <div className="stat-card-value">{activeMinistries}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Regions Covered</span>
            <div className="stat-card-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}><MapPin size={18} /></div>
          </div>
          <div className="stat-card-value">{regionsCovered}</div>
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
              placeholder="Search ministries..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="form-control" 
            style={{ width: '180px' }}
            value={regionFilter} 
            onChange={e => setRegionFilter(e.target.value)}
          >
            <option value="">All Regions</option>
            {GHANA_REGIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select 
            className="form-control"
            style={{ width: '160px' }} 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {(searchTerm || regionFilter || statusFilter !== 'active') && (
            <button className="btn btn-secondary btn-sm" onClick={resetFilters}>Reset</button>
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
          {filteredMinistries.length === 0 ? (
            <div className="empty-state w-100" style={{ gridColumn: '1 / -1' }}>No ministries found matching your filters.</div>
          ) : (
            filteredMinistries.map(ministry => {
              const leaders = getMinistryLeaders(ministry.id, memberships, dancers);
              const memberCount = getMinistryMemberCount(ministry.id, memberships);
              const isInactive = ministry.status !== 'active';
              
              return (
                <div key={ministry.id} className="card" style={{ opacity: isInactive ? 0.75 : 1 }}>
                  <div className="d-flex gap-3 mb-3">
                    <div className="list-avatar" style={{ width: 48, height: 48, flexShrink: 0, fontSize: '1.2rem', background: ministry.logo ? 'transparent' : 'var(--primary-light)' }}>
                      {ministry.logo ? (
                        <img src={ministry.logo} alt={ministry.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        ministry.name.charAt(0)
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ministry.name}
                      </h3>
                      {ministry.church && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ministry.church}</p>}
                    </div>
                  </div>
                  
                  <div className="clean-list" style={{ gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>
                      <MapPin size={16} className="text-light" />
                      <span>{ministry.town ? `${ministry.town}, ` : ''}{ministry.region}</span>
                    </div>
                    {leaders.length > 0 && (
                      <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>
                        <Crown size={16} className="text-light" />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{leaders.map(l => l.name).join(', ')}</span>
                      </div>
                    )}
                    <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>
                      <Users size={16} className="text-light" />
                      <span>{memberCount} Dancer{memberCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-center justify-content-between mt-auto" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <div className="permission-dot" style={{ fontWeight: 600, color: isInactive ? 'var(--text-muted)' : 'var(--success-text)' }}>
                      <div className={`dot-indicator ${isInactive ? 'bg-gray-400' : 'dot-success'}`} style={{ background: isInactive ? '#9ca3af' : undefined }} />
                      {isInactive ? 'Inactive' : 'Active'}
                    </div>
                    <div className="d-flex gap-1">
                      <button className="btn-icon" onClick={() => onViewMinistry(ministry)} title="View Details"><Eye size={18} /></button>
                      <button className="btn-icon" onClick={() => onEditMinistry(ministry)} title="Edit"><Edit3 size={18} /></button>
                      <button className="btn-icon" onClick={() => handleDeactivate(ministry)} title={isInactive ? 'Activate' : 'Deactivate'} style={{ color: isInactive ? 'var(--success-text)' : 'var(--danger-text)' }}>
                        <Power size={18} />
                      </button>
                    </div>
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
                <th>Ministry</th>
                <th>Location</th>
                <th>Leader(s)</th>
                <th>Members</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMinistries.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">No ministries found.</div>
                  </td>
                </tr>
              ) : (
                filteredMinistries.map(ministry => {
                  const leaders = getMinistryLeaders(ministry.id, memberships, dancers);
                  const memberCount = getMinistryMemberCount(ministry.id, memberships);
                  const isInactive = ministry.status !== 'active';
                  
                  return (
                    <tr key={ministry.id} style={{ opacity: isInactive ? 0.75 : 1 }}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="list-avatar" style={{ width: 36, height: 36, fontSize: '0.9rem', background: ministry.logo ? 'transparent' : 'var(--primary-light)' }}>
                            {ministry.logo ? (
                              <img src={ministry.logo} alt={ministry.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              ministry.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{ministry.name}</div>
                            {ministry.church && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ministry.church}</div>}
                          </div>
                        </div>
                      </td>
                      <td>{ministry.town ? `${ministry.town}, ` : ''}{ministry.region}</td>
                      <td>{leaders.length > 0 ? leaders.map(l => l.name).join(', ') : '-'}</td>
                      <td>{memberCount}</td>
                      <td>
                        <div className="permission-dot" style={{ color: isInactive ? 'var(--text-muted)' : 'var(--success-text)' }}>
                          <div className={`dot-indicator ${isInactive ? '' : 'dot-success'}`} style={{ background: isInactive ? '#9ca3af' : undefined }} />
                          {isInactive ? 'Inactive' : 'Active'}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-1 justify-content-end">
                          <button className="btn-icon" onClick={() => onViewMinistry(ministry)} title="View Details"><Eye size={18} /></button>
                          <button className="btn-icon" onClick={() => onEditMinistry(ministry)} title="Edit"><Edit3 size={18} /></button>
                          <button className="btn-icon" onClick={() => handleDeactivate(ministry)} title={isInactive ? 'Activate' : 'Deactivate'} style={{ color: isInactive ? 'var(--success-text)' : 'var(--danger-text)' }}>
                            <Power size={18} />
                          </button>
                        </div>
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
