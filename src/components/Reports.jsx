import React from 'react';
import { Download, Users, Building2, Crown, Calendar, MapPin, Activity } from 'lucide-react';
import { GHANA_REGIONS, DANCER_TYPES, getDancerTypeLabel } from '../utils/constants';
import { getMinistryLeaders, getMinistryMemberCount, getDancerPrimaryMinistry, getAllLeadersResolved } from '../services/dataService';
import { getBirthdayInfo } from '../utils/birthdayUtils';

export default function Reports({ dancers, ministries, memberships }) {
  // Stats calculations
  const activeDancers = dancers.filter(d => d.status === 'Active');
  const activeMinistries = ministries.filter(m => m.status === 'active');
  const allLeaders = getAllLeadersResolved(dancers, memberships, ministries);
  
  const upcomingBirthdays = dancers.filter(d => {
    const bInfo = getBirthdayInfo(d.birthdayDay, d.birthdayMonth, d.birthYear);
    return bInfo && bInfo.daysUntil <= 30;
  });

  const exportCSV = () => {
    // Generate CSV data
    const rows = [
      ['Report Type', 'Metric', 'Value'],
      ['Overview', 'Total Active Dancers', activeDancers.length],
      ['Overview', 'Total Ministries', ministries.length],
      ['Overview', 'Active Ministries', activeMinistries.length],
      ['Overview', 'Total Leaders', allLeaders.length]
    ];
    
    // Add Ministry Stats
    rows.push([]);
    rows.push(['MINISTRY STATS']);
    rows.push(['Ministry Name', 'Status', 'Members', 'Leaders']);
    ministries.forEach(m => {
      const memberCount = getMinistryMemberCount(m.id, memberships);
      const leaderCount = getMinistryLeaders(m.id, memberships, dancers).length;
      rows.push([m.name, m.status, memberCount, leaderCount]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gh-dance-database-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare table data
  const ministryStats = ministries.map(m => {
    return {
      id: m.id,
      name: m.name,
      status: m.status === 'active' ? 'Active' : 'Inactive',
      region: m.region,
      memberCount: getMinistryMemberCount(m.id, memberships),
      leaderCount: getMinistryLeaders(m.id, memberships, dancers).length
    };
  }).sort((a, b) => b.memberCount - a.memberCount);

  const regionStats = GHANA_REGIONS.map(region => {
    const regionDancers = dancers.filter(d => d.region === region).length;
    const regionMinistries = ministries.filter(m => m.region === region).length;
    const regionLeaders = allLeaders.filter(l => l.dancer.region === region).length;
    return { region, dancers: regionDancers, ministries: regionMinistries, leaders: regionLeaders };
  }).filter(r => r.dancers > 0 || r.ministries > 0).sort((a, b) => b.dancers - a.dancers);

  const dancerTypeStats = DANCER_TYPES.map(type => {
    const count = activeDancers.filter(d => d.dancerType === type.id).length;
    const percent = activeDancers.length > 0 ? Math.round((count / activeDancers.length) * 100) : 0;
    return { label: type.label, count, percent };
  }).sort((a, b) => b.count - a.count);

  const birthdayStats = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
    const monthDancers = activeDancers.filter(d => {
      if (!d.birthdayMonth) return false;
      const mStr = String(d.birthdayMonth);
      return mStr === month || mStr === String(index + 1) || mStr === String(index + 1).padStart(2, '0');
    });
    const published = monthDancers.filter(d => d.allowBirthdayPublication).length;
    const privateCount = monthDancers.length - published;
    return { month, total: monthDancers.length, published, private: privateCount };
  });

  return (
    <div className="d-flex flex-column gap-4">
      
      {/* Visual Anchor / Hero Card */}
      <div className="hero-anchor">
        <div className="hero-anchor-content">
          <h1 className="hero-title">Reports & Analytics</h1>
          <p className="hero-subtitle">
            View high-level insights, regional distributions, and database health metrics.
          </p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-white" onClick={exportCSV}>
            <Download size={18} />
            Export Full Report (CSV)
          </button>
        </div>
      </div>

      {/* Premium Stat Cards Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Active Dancers</span>
            <div className="stat-card-icon"><Users size={18} /></div>
          </div>
          <div className="stat-card-value">{activeDancers.length}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Active Ministries</span>
            <div className="stat-card-icon" style={{ background: '#dcfce7', color: '#16a34a' }}><Building2 size={18} /></div>
          </div>
          <div className="stat-card-value">{activeMinistries.length}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Leaders</span>
            <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}><Crown size={18} /></div>
          </div>
          <div className="stat-card-value">{allLeaders.length}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Birthdays (30 days)</span>
            <div className="stat-card-icon" style={{ background: '#ffe4e6', color: '#e11d48' }}><Calendar size={18} /></div>
          </div>
          <div className="stat-card-value">{upcomingBirthdays.length}</div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gap: '2rem' }}>
        
        <div className="d-flex flex-column gap-4" style={{ flex: 2 }}>
          {/* Ministry Membership Report */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Building2 size={20} style={{ color: '#9ca3af' }} /> Ministry Membership Report</h3>
            </div>
            <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto', border: 'none', borderTop: '1px solid var(--border-color)', borderRadius: 0 }}>
              <table className="custom-table" style={{ width: '100%' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th>Ministry Name</th>
                    <th>Region</th>
                    <th>Members</th>
                    <th>Leaders</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ministryStats.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-state">No ministry data available.</td>
                    </tr>
                  ) : (
                    ministryStats.map(m => (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{m.name}</td>
                        <td style={{ color: 'var(--text-body)' }}>{m.region || '-'}</td>
                        <td style={{ fontWeight: 600 }}>{m.memberCount}</td>
                        <td>{m.leaderCount}</td>
                        <td>
                          <div className="permission-dot" style={{ color: m.status === 'Active' ? 'var(--success-text)' : 'var(--text-muted)' }}>
                            <div className={`dot-indicator ${m.status === 'Active' ? 'dot-success' : ''}`} style={{ background: m.status === 'Active' ? undefined : '#9ca3af' }} />
                            {m.status}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Regional Distribution */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><MapPin size={20} style={{ color: '#9ca3af' }} /> Regional Distribution</h3>
            </div>
            <div className="table-container" style={{ border: 'none', borderTop: '1px solid var(--border-color)', borderRadius: 0 }}>
              <table className="custom-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Region</th>
                    <th>Dancers</th>
                    <th>Ministries</th>
                    <th>Leaders</th>
                  </tr>
                </thead>
                <tbody>
                  {regionStats.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="empty-state">No regional data available.</td>
                    </tr>
                  ) : (
                    regionStats.map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{r.region}</td>
                        <td>{r.dancers}</td>
                        <td>{r.ministries}</td>
                        <td>{r.leaders}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column gap-4" style={{ flex: 1 }}>
          {/* Dancer Type Distribution */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Users size={20} style={{ color: '#9ca3af' }} /> Type Distribution</h3>
            </div>
            <div className="dist-list">
              {dancerTypeStats.map((t, i) => (
                <div key={i} className="dist-row">
                  <div className="dist-header">
                    <span className="dist-label">{t.label}</span>
                    <span className="dist-value">{t.count} ({t.percent}%)</span>
                  </div>
                  <div className="dist-track">
                    <div className="dist-bar" style={{ width: `${t.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Birthday Report */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Calendar size={20} style={{ color: '#9ca3af' }} /> Monthly Birthdays</h3>
            </div>
            <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto', border: 'none', borderTop: '1px solid var(--border-color)', borderRadius: 0 }}>
              <table className="custom-table" style={{ width: '100%' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th>Month</th>
                    <th>Total</th>
                    <th>Public</th>
                  </tr>
                </thead>
                <tbody>
                  {birthdayStats.map((b, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{b.month}</td>
                      <td style={{ fontWeight: 600 }}>{b.total}</td>
                      <td style={{ color: 'var(--success-text)' }}>{b.published}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
