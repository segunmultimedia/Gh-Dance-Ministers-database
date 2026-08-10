import React, { useState } from 'react';
import { 
  Crown, 
  UserPlus, 
  Search, 
  Mail, 
  Phone, 
  Award, 
  Building, 
  Edit3, 
  Trash2, 
  Users, 
  Sparkles,
  LayoutGrid,
  List
} from 'lucide-react';

export default function Leaders({ 
  leaders, 
  members, 
  onOpenAddLeader, 
  onEditLeader, 
  onDeleteLeader,
  searchTerm,
  setSearchTerm
}) {
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Extract unique group names
  const groups = Array.from(new Set(leaders.map(l => l.groupName).filter(Boolean)));

  // Filter leaders
  const filteredLeaders = leaders.filter(leader => {
    const searchMatch = !searchTerm || 
      leader.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leader.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leader.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leader.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const groupMatch = selectedGroup === 'ALL' || leader.groupName === selectedGroup;

    return searchMatch && groupMatch;
  });

  return (
    <div>
      {/* Top Banner */}
      <div 
        className="hero-banner"
        style={{ 
          background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 50%, #3730a3 100%)',
          boxShadow: '0 8px 24px -4px rgba(79, 70, 229, 0.3)'
        }}
      >
        <div className="hero-text">
          <h2>👑 Dance Group Leadership Directory</h2>
          <p>Manage group directors, lead choreographers, assistant leaders, and ministry heads.</p>
        </div>
        <button className="btn-hero" onClick={onOpenAddLeader}>
          <UserPlus size={18} />
          <span>Add Group Leader</span>
        </button>
      </div>

      {/* Leader Stat Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Leaders</span>
            <div className="stat-icon-bg" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
              <Crown size={20} />
            </div>
          </div>
          <div className="stat-value">{leaders.length}</div>
          <div className="stat-footer">
            <span className="trend-badge positive">Appointed Leaders</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Dance Ministries</span>
            <div className="stat-icon-bg" style={{ background: '#f3e8ff', color: '#9333ea' }}>
              <Building size={20} />
            </div>
          </div>
          <div className="stat-value">{groups.length}</div>
          <div className="stat-footer">
            <span className="trend-badge neutral">Active Groups</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Registered Members</span>
            <div className="stat-icon-bg" style={{ background: '#dcfce7', color: '#16a34a' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="stat-value">{members.length}</div>
          <div className="stat-footer">
            <span className="trend-badge positive">Under Leadership</span>
          </div>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Building size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '180px' }}
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="ALL">All Dance Groups</option>
              {groups.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            {selectedGroup !== 'ALL' && (
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedGroup('ALL')}>
                Reset Filter
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* View Mode Toggle */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
              <button 
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 10px', border: 'none' }}
                onClick={() => setViewMode('grid')}
                title="Grid Card View"
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 10px', border: 'none' }}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List size={16} />
              </button>
            </div>

            <button className="btn btn-primary" onClick={onOpenAddLeader}>
              <UserPlus size={16} />
              <span>Add Leader</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leaders Display: Grid vs Table */}
      {viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredLeaders.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No leaders found matching your search.
            </div>
          ) : (
            filteredLeaders.map((leader) => (
              <div key={leader.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span className="badge badge-purple">{leader.groupName || 'Dance Group'}</span>
                    <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Crown size={12} /> Leader
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1rem' }}>
                    <img
                      src={leader.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt={leader.name}
                      style={{ width: '76px', height: '76px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)', marginBottom: '0.75rem' }}
                    />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{leader.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, marginTop: '2px' }}>{leader.title}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{leader.email}</p>
                  </div>

                  {leader.notes && (
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: '#475569', marginBottom: '1rem', border: '1px solid #eaecf0' }}>
                      {leader.notes}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                  <a href={`mailto:${leader.email}`} className="btn btn-secondary btn-sm" style={{ flex: 1, textDecoration: 'none' }}>
                    <Mail size={14} /> Email
                  </a>
                  {leader.phone && (
                    <a href={`tel:${leader.phone}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                      <Phone size={14} /> Call
                    </a>
                  )}
                  <button className="btn btn-secondary btn-icon btn-sm" onClick={() => onEditLeader(leader)}>
                    <Edit3 size={14} />
                  </button>
                  <button className="btn btn-secondary btn-icon btn-sm" style={{ color: '#ef4444' }} onClick={() => onDeleteLeader(leader.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Table View */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Leader Name</th>
                  <th>Dance Group / Ministry</th>
                  <th>Position Title</th>
                  <th>Contact Phone</th>
                  <th>Email Address</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaders.map((leader) => (
                  <tr key={leader.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={leader.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={leader.name}
                          className="avatar"
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{leader.name}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-purple">{leader.groupName}</span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)' }}>{leader.title}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{leader.phone || 'N/A'}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{leader.email}</div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button className="btn btn-secondary btn-icon btn-sm" title="Edit Leader" onClick={() => onEditLeader(leader)}>
                          <Edit3 size={15} />
                        </button>
                        <button className="btn btn-secondary btn-icon btn-sm" style={{ color: '#ef4444' }} title="Delete Leader" onClick={() => onDeleteLeader(leader.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
