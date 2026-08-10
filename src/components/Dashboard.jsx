import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Cake, 
  FolderKanban, 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  Eye, 
  Edit3, 
  Trash2,
  Gift,
  Download,
  FileText,
  FileSpreadsheet,
  File,
  ArrowRight
} from 'lucide-react';
import { getBirthdayStatus, formatFullDate } from '../utils/birthdayUtils';

export default function Dashboard({ 
  members, 
  files, 
  onViewMember, 
  onEditMember, 
  onDeleteMember, 
  onOpenAddMember,
  onNavigateToBirthdays
}) {
  const [activeTab, setActiveTab] = useState('all');

  // Stats Calculations
  const totalMembers = members.length;
  
  // New members within last 30 days or sorted by recency
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
  const newMembersList = [...members]
    .sort((a, b) => new Date(b.dateJoined || b.createdAt || 0) - new Date(a.dateJoined || a.createdAt || 0));
  const newMembersCount = members.filter(m => new Date(m.dateJoined || m.createdAt) >= thirtyDaysAgo).length;

  // Birthday Stats
  const todayBirthdays = members.filter(m => getBirthdayStatus(m.dob).status === 'today');
  
  const upcomingBirthdays = [...members]
    .map(m => ({ member: m, bday: getBirthdayStatus(m.dob) }))
    .filter(item => item.bday.status !== 'past' && item.bday.daysUntil <= 60)
    .sort((a, b) => a.bday.daysUntil - b.bday.daysUntil);

  const totalFiles = files.length;

  // Department counts breakdown
  const deptCounts = members.reduce((acc, m) => {
    const dept = m.department || 'General';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  // File size formatter
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownloadFile = (file) => {
    if (!file.data) {
      alert('File content not available for download.');
      return;
    }
    const blob = file.data instanceof Blob ? file.data : new Blob([file.data], { type: file.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Violet Hero Banner */}
      <div className="hero-banner">
        <div className="hero-text">
          <h2>Welcome back, Administrator!</h2>
          <p>You have {todayBirthdays.length} birthday reminders today and {newMembersCount} new member registrations this month.</p>
        </div>
        <button className="btn-hero" onClick={onOpenAddMember}>
          <UserPlus size={18} />
          <span>Register New Member</span>
        </button>
      </div>

      {/* Slim & Elegant Celebration Alert Banner directly under Welcome Back Administrator */}
      {todayBirthdays.length > 0 && (
        <div 
          style={{ 
            margin: '0 0 1.5rem 0', 
            background: 'linear-gradient(135deg, #fff1f2 0%, #fff5f5 100%)', 
            border: '1px solid #fecdd3',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '0.65rem 1.25rem',
            boxShadow: '0 2px 8px rgba(244, 63, 94, 0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#ffe4e6', color: '#e11d48', padding: '5px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Gift size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Celebration Alert</span>
            </div>
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#9f1239' }}>
                🎉 {todayBirthdays.length} Member{todayBirthdays.length > 1 ? 's have' : ' has a'} Birthday Today!
              </span>
              <span style={{ fontSize: '0.825rem', color: '#be123c', marginLeft: '8px' }}>
                ({todayBirthdays.map(m => m.name).join(', ')})
              </span>
            </div>
          </div>
          <button 
            className="btn btn-secondary btn-sm" 
            style={{ 
              background: '#ffffff', 
              borderColor: '#fecdd3', 
              color: '#be123c',
              fontWeight: 700,
              fontSize: '0.78rem',
              padding: '6px 14px',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }} 
            onClick={onNavigateToBirthdays}
          >
            <span>View Birthday Hub</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* 5 Stat Cards Overview Grid - Clickable to switch active tabs below */}
      <div className="stats-grid">
        {/* Total Members */}
        <div 
          className="stat-card"
          style={{ cursor: 'pointer', borderColor: activeTab === 'all' ? 'var(--primary)' : undefined }}
          onClick={() => setActiveTab('all')}
        >
          <div className="stat-header">
            <span className="stat-title">Total Members</span>
            <div className="stat-icon-bg" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="stat-value">{totalMembers}</div>
          <div className="stat-footer">
            <span className="trend-badge positive">
              <TrendingUp size={12} /> +12%
            </span>
            <span style={{ color: 'var(--text-muted)' }}>Click to view all</span>
          </div>
        </div>

        {/* New Members */}
        <div 
          className="stat-card"
          style={{ cursor: 'pointer', borderColor: activeTab === 'new' ? '#16a34a' : undefined }}
          onClick={() => setActiveTab('new')}
        >
          <div className="stat-header">
            <span className="stat-title">New Members</span>
            <div className="stat-icon-bg" style={{ background: '#dcfce7', color: '#16a34a' }}>
              <UserPlus size={20} />
            </div>
          </div>
          <div className="stat-value">{newMembersCount}</div>
          <div className="stat-footer">
            <span className="trend-badge positive">
              <TrendingUp size={12} /> Recent
            </span>
            <span style={{ color: 'var(--text-muted)' }}>Click to view new</span>
          </div>
        </div>

        {/* Birthdays Today */}
        <div 
          className="stat-card" 
          style={{ 
            borderColor: activeTab === 'today' ? '#e11d48' : todayBirthdays.length > 0 ? '#f43f5e' : undefined,
            background: todayBirthdays.length > 0 ? '#fff1f2' : undefined,
            cursor: 'pointer' 
          }}
          onClick={() => setActiveTab('today')}
        >
          <div className="stat-header">
            <span className="stat-title" style={{ color: todayBirthdays.length > 0 ? '#be123c' : undefined }}>
              Birthdays Today
            </span>
            <div className="stat-icon-bg" style={{ background: '#ffe4e6', color: '#e11d48' }}>
              <Cake size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: todayBirthdays.length > 0 ? '#be123c' : undefined }}>
            {todayBirthdays.length}
          </div>
          <div className="stat-footer">
            <span className={`trend-badge ${todayBirthdays.length > 0 ? 'positive' : 'neutral'}`} style={{ background: todayBirthdays.length > 0 ? '#fecdd3' : undefined, color: todayBirthdays.length > 0 ? '#9f1239' : undefined }}>
              <Gift size={12} /> {todayBirthdays.length > 0 ? 'Action Needed' : 'No birthdays today'}
            </span>
          </div>
        </div>

        {/* Upcoming Birthdays */}
        <div 
          className="stat-card" 
          style={{ cursor: 'pointer', borderColor: activeTab === 'upcoming' ? '#9333ea' : undefined }} 
          onClick={() => setActiveTab('upcoming')}
        >
          <div className="stat-header">
            <span className="stat-title">Upcoming Birthdays</span>
            <div className="stat-icon-bg" style={{ background: '#f3e8ff', color: '#9333ea' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div className="stat-value">{upcomingBirthdays.length}</div>
          <div className="stat-footer">
            <span className="trend-badge neutral">Next 60 Days</span>
          </div>
        </div>

        {/* Uploaded Files */}
        <div 
          className="stat-card"
          style={{ cursor: 'pointer', borderColor: activeTab === 'files' ? '#0284c7' : undefined }}
          onClick={() => setActiveTab('files')}
        >
          <div className="stat-header">
            <span className="stat-title">Uploaded Files</span>
            <div className="stat-icon-bg" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <FolderKanban size={20} />
            </div>
          </div>
          <div className="stat-value">{totalFiles}</div>
          <div className="stat-footer">
            <span className="trend-badge positive">PDF & Excel</span>
            <span style={{ color: 'var(--text-muted)' }}>Click to view</span>
          </div>
        </div>
      </div>

      {/* Analytics & Department Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Growth Visual Canvas / Bar Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Registration Activity</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly new member joining timeline</p>
            </div>
            <span className="badge badge-purple">2026 Trend</span>
          </div>

          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '1rem 0' }}>
            {[
              { month: 'Jan', val: 40 },
              { month: 'Feb', val: 65 },
              { month: 'Mar', val: 50 },
              { month: 'Apr', val: 85 },
              { month: 'May', val: 70 },
              { month: 'Jun', val: 95 },
              { month: 'Jul', val: 80 },
              { month: 'Aug', val: 100 },
            ].map((bar, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div 
                  style={{ 
                    width: '100%', 
                    height: `${bar.val}%`, 
                    background: i === 7 ? 'var(--primary-gradient)' : '#e2e8f0', 
                    borderRadius: '6px',
                    transition: 'all 0.3s ease' 
                  }} 
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{bar.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Department Distribution</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Members grouped by teams</p>
            </div>
            <span className="badge badge-info">{Object.keys(deptCounts).length} Groups</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(deptCounts).slice(0, 4).map(([dept, count], idx) => {
              const pct = Math.round((count / totalMembers) * 100) || 0;
              const colors = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6'];
              const currentColor = colors[idx % colors.length];

              return (
                <div key={dept}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    <span>{dept}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', width: '100%', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: currentColor, borderRadius: '999px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Dynamic Workspace Directory Table with 5 Interactive Tabs */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
              {activeTab === 'all' && 'Total Members Directory'}
              {activeTab === 'new' && 'Recently Added Members'}
              {activeTab === 'today' && 'Birthdays Today'}
              {activeTab === 'upcoming' && 'Upcoming Birthdays'}
              {activeTab === 'files' && 'Uploaded Document Repository'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {activeTab === 'all' && 'View and manage all registered organization members'}
              {activeTab === 'new' && 'Newest member registrations sorted chronologically'}
              {activeTab === 'today' && 'Members celebrating birthdays today'}
              {activeTab === 'upcoming' && 'Chronological list of upcoming birthdays'}
              {activeTab === 'files' && 'Access and download uploaded project files'}
            </p>
          </div>

          <div className="tabs-bar" style={{ marginBottom: 0, flexWrap: 'wrap' }}>
            <button className={`tab-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
              Total Members ({totalMembers})
            </button>
            <button className={`tab-item ${activeTab === 'new' ? 'active' : ''}`} onClick={() => setActiveTab('new')}>
              New Members ({newMembersCount})
            </button>
            <button className={`tab-item ${activeTab === 'today' ? 'active' : ''}`} onClick={() => setActiveTab('today')}>
              Birthdays Today ({todayBirthdays.length})
            </button>
            <button className={`tab-item ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>
              Upcoming Birthdays ({upcomingBirthdays.length})
            </button>
            <button className={`tab-item ${activeTab === 'files' ? 'active' : ''}`} onClick={() => setActiveTab('files')}>
              Uploaded Files ({totalFiles})
            </button>
          </div>
        </div>

        {/* Tab 1, 2, 3, 4: Members Table Views */}
        {activeTab !== 'files' && (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Department</th>
                  <th>Contact Info</th>
                  {activeTab === 'upcoming' ? <th>Birth Date</th> : <th>Date Joined</th>}
                  {activeTab === 'upcoming' ? <th>Turning Age</th> : <th>Birthday Status</th>}
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Active Tab: ALL MEMBERS */}
                {activeTab === 'all' && (
                  members.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No members registered in the database.
                      </td>
                    </tr>
                  ) : (
                    members.map((member) => {
                      const bday = getBirthdayStatus(member.dob);
                      return (
                        <tr key={member.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <img
                                src={member.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                                alt={member.name}
                                className="avatar"
                              />
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{member.name}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{member.email}</div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="badge badge-purple">{member.department || 'General'}</span>
                          </td>

                          <td>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{member.phone || 'N/A'}</div>
                          </td>

                          <td>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              {formatFullDate(member.dateJoined || member.createdAt)}
                            </div>
                          </td>

                          <td>
                            {bday.status === 'today' ? (
                              <span className="badge badge-danger">🎉 Birthday Today!</span>
                            ) : bday.status === 'tomorrow' ? (
                              <span className="badge badge-warning">🎂 Tomorrow</span>
                            ) : bday.daysUntil <= 30 ? (
                              <span className="badge badge-info">In {bday.daysUntil} days</span>
                            ) : (
                              <span className="badge badge-gray">{bday.formattedNextBirthday}</span>
                            )}
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                              <button className="btn btn-secondary btn-icon btn-sm" title="View Profile" onClick={() => onViewMember(member)}>
                                <Eye size={15} />
                              </button>
                              <button className="btn btn-secondary btn-icon btn-sm" title="Edit Member" onClick={() => onEditMember(member)}>
                                <Edit3 size={15} />
                              </button>
                              <button className="btn btn-secondary btn-icon btn-sm" style={{ color: '#ef4444' }} title="Delete Member" onClick={() => onDeleteMember(member.id)}>
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )
                )}

                {/* Active Tab: NEW MEMBERS (Arranged by recency - newest first) */}
                {activeTab === 'new' && (
                  newMembersList.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No members found in recent additions.
                      </td>
                    </tr>
                  ) : (
                    newMembersList.map((member) => {
                      const bday = getBirthdayStatus(member.dob);
                      const isRecent30 = new Date(member.dateJoined || member.createdAt) >= thirtyDaysAgo;
                      return (
                        <tr key={member.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <img
                                src={member.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                                alt={member.name}
                                className="avatar"
                              />
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{member.name}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{member.email}</div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="badge badge-purple">{member.department || 'General'}</span>
                          </td>

                          <td>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{member.phone || 'N/A'}</div>
                          </td>

                          <td>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                              {formatFullDate(member.dateJoined || member.createdAt)}
                            </div>
                          </td>

                          <td>
                            {isRecent30 ? (
                              <span className="badge badge-success">✨ Newly Registered</span>
                            ) : (
                              <span className="badge badge-gray">{formatFullDate(member.dateJoined || member.createdAt)}</span>
                            )}
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                              <button className="btn btn-secondary btn-icon btn-sm" title="View Profile" onClick={() => onViewMember(member)}>
                                <Eye size={15} />
                              </button>
                              <button className="btn btn-secondary btn-icon btn-sm" title="Edit Member" onClick={() => onEditMember(member)}>
                                <Edit3 size={15} />
                              </button>
                              <button className="btn btn-secondary btn-icon btn-sm" style={{ color: '#ef4444' }} title="Delete Member" onClick={() => onDeleteMember(member.id)}>
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )
                )}

                {/* Active Tab: BIRTHDAYS TODAY */}
                {activeTab === 'today' && (
                  todayBirthdays.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No member birthdays today.
                      </td>
                    </tr>
                  ) : (
                    todayBirthdays.map((member) => {
                      return (
                        <tr key={member.id} style={{ background: '#fff1f2' }}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <img
                                src={member.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                                alt={member.name}
                                className="avatar"
                              />
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{member.name}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{member.email}</div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="badge badge-purple">{member.department || 'General'}</span>
                          </td>

                          <td>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{member.phone || 'N/A'}</div>
                          </td>

                          <td>
                            <div style={{ fontSize: '0.85rem', color: '#be123c', fontWeight: 700 }}>
                              {formatFullDate(member.dob)}
                            </div>
                          </td>

                          <td>
                            <span className="badge badge-danger">🎉 Celebrating Today!</span>
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                              <button className="btn btn-secondary btn-icon btn-sm" title="View Profile" onClick={() => onViewMember(member)}>
                                <Eye size={15} />
                              </button>
                              <button className="btn btn-secondary btn-icon btn-sm" title="Edit Member" onClick={() => onEditMember(member)}>
                                <Edit3 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )
                )}

                {/* Active Tab: UPCOMING BIRTHDAYS (Sorted by days until birthday) */}
                {activeTab === 'upcoming' && (
                  upcomingBirthdays.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No upcoming birthdays recorded.
                      </td>
                    </tr>
                  ) : (
                    upcomingBirthdays.map(({ member, bday }) => {
                      return (
                        <tr key={member.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <img
                                src={member.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                                alt={member.name}
                                className="avatar"
                              />
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{member.name}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{member.email}</div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="badge badge-purple">{member.department || 'General'}</span>
                          </td>

                          <td>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                              {bday.formattedNextBirthday}
                            </div>
                          </td>

                          <td>
                            <span className="badge badge-gray">Turning {bday.turningAge}</span>
                          </td>

                          <td>
                            {bday.status === 'today' ? (
                              <span className="badge badge-danger">🎉 Today!</span>
                            ) : bday.status === 'tomorrow' ? (
                              <span className="badge badge-warning">🎂 Tomorrow</span>
                            ) : (
                              <span className="badge badge-info">In {bday.daysUntil} days</span>
                            )}
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                              <button className="btn btn-secondary btn-icon btn-sm" title="View Profile" onClick={() => onViewMember(member)}>
                                <Eye size={15} />
                              </button>
                              <button className="btn btn-secondary btn-icon btn-sm" title="Edit Member" onClick={() => onEditMember(member)}>
                                <Edit3 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: UPLOADED FILES TABLE VIEW */}
        {activeTab === 'files' && (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Type / Format</th>
                  <th>File Size</th>
                  <th>Date Uploaded</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No uploaded files stored in repository yet.
                    </td>
                  </tr>
                ) : (
                  files.map((file) => {
                    const isPdf = file.name.endsWith('.pdf') || file.type?.includes('pdf');
                    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.type?.includes('excel') || file.type?.includes('sheet');
                    return (
                      <tr key={file.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ 
                              background: isPdf ? '#fee2e2' : isExcel ? '#dcfce7' : '#e0e7ff', 
                              color: isPdf ? '#dc2626' : isExcel ? '#16a34a' : '#4f46e5',
                              padding: '10px',
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {isPdf ? <FileText size={20} /> : isExcel ? <FileSpreadsheet size={20} /> : <File size={20} />}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{file.name}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{file.category || 'Uploaded File'}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className={`badge ${isPdf ? 'badge-danger' : isExcel ? 'badge-success' : 'badge-purple'}`}>
                            {isPdf ? 'PDF Document' : isExcel ? 'Excel Sheet' : 'Document'}
                          </span>
                        </td>

                        <td>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{formatFileSize(file.size)}</div>
                        </td>

                        <td>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {formatFullDate(file.uploadDate)}
                          </div>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => handleDownloadFile(file)}
                            style={{ gap: '6px', fontWeight: 600 }}
                          >
                            <Download size={14} /> Download File
                          </button>
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
    </div>
  );
}
