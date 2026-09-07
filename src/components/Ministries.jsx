import React, { useState, useMemo } from 'react';
import { Plus, LayoutGrid, List, Eye, Edit3, Trash2, MapPin, Users, MoreVertical } from 'lucide-react';
import { canDeleteMinistry, getMinistryLeaders } from '../services/dataService';

export default function Ministries({ ministries, dancers, memberships, onAddMinistry, onEditMinistry, onViewMinistry, onDeleteMinistry, searchTerm }) {
  const [viewMode, setViewMode] = useState('table');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);

  const filteredMinistries = useMemo(() => {
    return ministries.filter(m => {
      const matchSearch = m.name.toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                          (m.town && m.town.toLowerCase().includes((searchTerm || '').toLowerCase()));
      const matchStatus = statusFilter ? m.status === statusFilter : true;
      return matchSearch && matchStatus;
    });
  }, [ministries, searchTerm, statusFilter]);

  const handleDelete = (ministry) => {
    if (canDeleteMinistry(ministry.id, memberships)) {
      if (window.confirm(`Are you sure you want to delete ${ministry.name}?`)) onDeleteMinistry(ministry);
    } else {
      alert(`Cannot delete ${ministry.name} because it has assigned dancers. Deactivate it or reassign dancers first.`);
    }
    setActiveMenuId(null);
  };

  return (
    <div className="page-content">
      <div className="toolbar" style={{ borderRadius: 'var(--radius-lg)' }}>
        <div className="toolbar-group">
          <select className="form-control" style={{ width: '150px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <div className="toolbar-actions">
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{filteredMinistries.length} Ministries</span>
          <div style={{ display: 'flex', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button className="btn-icon" style={{ borderRadius: 0, background: viewMode === 'table' ? 'white' : 'transparent', color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-muted)' }} onClick={() => setViewMode('table')}><List size={18} /></button>
            <button className="btn-icon" style={{ borderRadius: 0, background: viewMode === 'grid' ? 'white' : 'transparent', color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)' }} onClick={() => setViewMode('grid')}><LayoutGrid size={18} /></button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={onAddMinistry}>
            <Plus size={16} /> <span className="hide-mobile">Add Ministry</span>
          </button>
        </div>
      </div>

      <div className="card">
        {filteredMinistries.length === 0 ? (
          <div className="empty-state">No ministries match your criteria.</div>
        ) : viewMode === 'table' ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ministry</th>
                  <th>Leader</th>
                  <th>Location</th>
                  <th>Dancers</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMinistries.map(ministry => {
                  const isActive = ministry.status === 'active';
                  const leaders = getMinistryLeaders(ministry.id, memberships, dancers);
                  const leaderNames = leaders.map(l => l.name).join(', ') || 'No leader';
                  const memberCount = memberships.filter(m => m.ministryId === ministry.id).length;
                  const menuOpen = activeMenuId === ministry.id;

                  return (
                    <tr key={ministry.id} style={{ opacity: isActive ? 1 : 0.6 }}>
                      <td>
                        <div className="cell-identity">
                          <div className="avatar" style={{ borderRadius: 'var(--radius-sm)' }}>
                            {ministry.logo ? <img src={ministry.logo} alt={ministry.name} /> : ministry.name.charAt(0)}
                          </div>
                          <span className="identity-primary" style={{ whiteSpace: 'normal', maxWidth: '200px' }}>{ministry.name}</span>
                        </div>
                      </td>
                      <td><span className="td-main">{leaderNames}</span></td>
                      <td>
                        <div className="cell-stack">
                          <span className="stack-primary">{ministry.town || 'Not specified'}</span>
                          {ministry.region && <span className="stack-secondary"><MapPin size={12}/> {ministry.region}</span>}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-blue"><Users size={12} style={{ marginRight: 4 }}/> {memberCount}</span>
                      </td>
                      <td>
                        <div className="status-indicator">
                          <span className={`status-dot ${isActive ? 'active' : 'inactive'}`}></span>
                          {isActive ? 'Active' : 'Inactive'}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="action-menu-wrapper">
                          <button className="btn-icon" onClick={() => setActiveMenuId(menuOpen ? null : ministry.id)}>
                            <MoreVertical size={18} />
                          </button>
                          {menuOpen && (
                            <>
                              <div className="action-overlay" onClick={() => setActiveMenuId(null)}></div>
                              <div className="action-dropdown">
                                <button onClick={() => { onViewMinistry(ministry); setActiveMenuId(null); }}><Eye size={16} /> View Ministry</button>
                                <button onClick={() => { onEditMinistry(ministry); setActiveMenuId(null); }}><Edit3 size={16} /> Edit Ministry</button>
                                {canDeleteMinistry(ministry.id, memberships) && <button className="danger" onClick={() => handleDelete(ministry)}><Trash2 size={16} /> Delete</button>}
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
            {filteredMinistries.map(ministry => {
              const isActive = ministry.status === 'active';
              const leaders = getMinistryLeaders(ministry.id, memberships, dancers);
              const leaderNames = leaders.map(l => l.name).join(', ') || 'No leader';
              const memberCount = memberships.filter(m => m.ministryId === ministry.id).length;
              const menuOpen = activeMenuId === ministry.id;

              return (
                <div key={ministry.id} className="data-grid-card" style={{ opacity: isActive ? 1 : 0.6 }}>
                  <div className="d-flex justify-between align-center">
                    <div className="cell-identity">
                      <div className="avatar" style={{ borderRadius: 'var(--radius-sm)' }}>
                        {ministry.logo ? <img src={ministry.logo} alt={ministry.name} /> : ministry.name.charAt(0)}
                      </div>
                      <span className="identity-primary">{ministry.name}</span>
                    </div>
                    <div className="action-menu-wrapper">
                      <button className="btn-icon" onClick={() => setActiveMenuId(menuOpen ? null : ministry.id)}><MoreVertical size={18} /></button>
                      {menuOpen && (
                        <>
                          <div className="action-overlay" onClick={() => setActiveMenuId(null)}></div>
                          <div className="action-dropdown">
                            <button onClick={() => { onViewMinistry(ministry); setActiveMenuId(null); }}><Eye size={16} /> View Ministry</button>
                            <button onClick={() => { onEditMinistry(ministry); setActiveMenuId(null); }}><Edit3 size={16} /> Edit Ministry</button>
                            {canDeleteMinistry(ministry.id, memberships) && <button className="danger" onClick={() => handleDelete(ministry)}><Trash2 size={16} /> Delete</button>}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="d-flex flex-column gap-2 mt-4">
                    <div className="d-flex justify-between">
                      <span className="td-quiet">Leader</span>
                      <span className="td-main" style={{ fontSize: '0.85rem' }}>{leaderNames}</span>
                    </div>
                    <div className="d-flex justify-between">
                      <span className="td-quiet">Members</span>
                      <span className="badge badge-blue">{memberCount}</span>
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
