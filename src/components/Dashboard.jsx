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
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock
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
  
  // New members within last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
  const newMembersCount = members.filter(m => new Date(m.dateJoined || m.createdAt) >= thirtyDaysAgo).length;

  // Birthday Stats
  const todayBirthdays = members.filter(m => getBirthdayStatus(m.dob).status === 'today');
  const upcomingBirthdays = members.filter(m => {
    const status = getBirthdayStatus(m.dob).status;
    return status === 'tomorrow' || status === 'this_week' || status === 'this_month';
  });

  const totalFiles = files.length;

  // Department counts breakdown
  const deptCounts = members.reduce((acc, m) => {
    const dept = m.department || 'General';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  // Filtered members for quick table view
  let filteredMembers = members;
  if (activeTab === 'today') {
    filteredMembers = todayBirthdays;
  } else if (activeTab === 'new') {
    filteredMembers = members.filter(m => new Date(m.dateJoined || m.createdAt) >= thirtyDaysAgo);
  }

  return (
    <div>
      {/* Violet Hero Banner matching the uploaded reference image */}
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

      {/* 5 Stat Cards Overview Grid */}
      <div className="stats-grid">
        {/* Total Members */}
        <div className="stat-card">
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
            <span style={{ color: 'var(--text-muted)' }}>from last month</span>
          </div>
        </div>

        {/* New Members */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">New Members</span>
            <div className="stat-icon-bg" style={{ background: '#dcfce7', color: '#16a34a' }}>
              <UserPlus size={20} />
            </div>
          </div>
          <div className="stat-value">{newMembersCount}</div>
          <div className="stat-footer">
            <span className="trend-badge positive">
              <TrendingUp size={12} /> +4
            </span>
            <span style={{ color: 'var(--text-muted)' }}>joined in 30 days</span>
          </div>
        </div>

        {/* Birthdays Today */}
        <div 
          className="stat-card" 
          style={{ 
            borderColor: todayBirthdays.length > 0 ? '#f43f5e' : undefined,
            background: todayBirthdays.length > 0 ? '#fff1f2' : undefined,
            cursor: 'pointer' 
          }}
          onClick={onNavigateToBirthdays}
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
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={onNavigateToBirthdays}>
          <div className="stat-header">
            <span className="stat-title">Upcoming Birthdays</span>
            <div className="stat-icon-bg" style={{ background: '#f3e8ff', color: '#9333ea' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div className="stat-value">{upcomingBirthdays.length}</div>
          <div className="stat-footer">
            <span className="trend-badge neutral">Next 30 Days</span>
          </div>
        </div>

        {/* Total Uploaded Files */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Uploaded Files</span>
            <div className="stat-icon-bg" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <FolderKanban size={20} />
            </div>
          </div>
          <div className="stat-value">{totalFiles}</div>
          <div className="stat-footer">
            <span className="trend-badge positive">PDF & Excel</span>
            <span style={{ color: 'var(--text-muted)' }}>stored</span>
          </div>
        </div>
      </div>

      {/* Birthday Alert Notification Card if today has birthdays */}
      {todayBirthdays.length > 0 && (
        <div 
          className="card" 
          style={{ 
            marginBottom: '1.75rem', 
            background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', 
            borderColor: '#fecdd3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '1.25rem 1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#f43f5e', color: 'white', padding: '12px', borderRadius: '12px' }}>
              <Gift size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#9f1239' }}>
                🎉 Celebration Alert: {todayBirthdays.length} Member{todayBirthdays.length > 1 ? 's have' : ' has a'} Birthday Today!
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#be123c' }}>
                {todayBirthdays.map(m => m.name).join(', ')} — Don't forget to send warm wishes from the organization.
              </p>
            </div>
          </div>
          <button className="btn btn-primary" style={{ background: '#e11d48', borderColor: '#e11d48' }} onClick={onNavigateToBirthdays}>
            View Birthday Hub
          </button>
        </div>
      )}

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

      {/* Quick Table View matching the reference image layout */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Recent Member Directory</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quick manage registered members</p>
          </div>

          <div className="tabs-bar" style={{ marginBottom: 0 }}>
            <button className={`tab-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
              All members ({totalMembers})
            </button>
            <button className={`tab-item ${activeTab === 'today' ? 'active' : ''}`} onClick={() => setActiveTab('today')}>
              Birthdays Today ({todayBirthdays.length})
            </button>
            <button className={`tab-item ${activeTab === 'new' ? 'active' : ''}`} onClick={() => setActiveTab('new')}>
              New Registrations ({newMembersCount})
            </button>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Department</th>
                <th>Contact Info</th>
                <th>Date Joined</th>
                <th>Birthday Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No members match this filter tab.
                  </td>
                </tr>
              ) : (
                filteredMembers.slice(0, 6).map((member) => {
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
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
