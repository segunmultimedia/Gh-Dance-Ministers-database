import React, { useMemo } from 'react';
import { Download, Users, Building2, Crown, Calendar, PieChart, MapPin } from 'lucide-react';
import { GHANA_REGIONS, DANCER_TYPES, MONTH_NAMES_SHORT } from '../utils/constants';

export default function Reports({ dancers, ministries, memberships }) {
  const activeDancers = useMemo(() => dancers.filter(d => d.status === 'Active'), [dancers]);
  const activeMinistries = useMemo(() => ministries.filter(m => m.status === 'active'), [ministries]);
  const activeLeadersCount = useMemo(() => {
    return new Set(memberships.filter(m => m.roles.includes('ministry_leader') || m.roles.includes('assistant_leader')).map(m => m.dancerId)).size;
  }, [memberships]);

  const ministryStats = useMemo(() => {
    return activeMinistries.map(min => {
      const activeMembers = memberships.filter(m => m.ministryId === min.id);
      const dancersInMin = activeMembers.map(m => dancers.find(d => d.id === m.dancerId)).filter(d => d && d.status === 'Active');
      return { id: min.id, name: min.name, count: dancersInMin.length };
    }).sort((a, b) => b.count - a.count);
  }, [activeMinistries, memberships, dancers]);

  const regionStats = useMemo(() => {
    return GHANA_REGIONS.map(region => ({
      region,
      dancers: activeDancers.filter(d => d.region === region).length,
      ministries: activeMinistries.filter(m => m.region === region).length,
    })).filter(s => s.dancers > 0 || s.ministries > 0).sort((a, b) => b.dancers - a.dancers);
  }, [activeDancers, activeMinistries]);

  const typeStats = useMemo(() => {
    return DANCER_TYPES.map(type => ({
      label: type.label,
      count: activeDancers.filter(d => d.dancerType === type.value).length
    }));
  }, [activeDancers]);

  const birthdayStats = useMemo(() => {
    return MONTH_NAMES_SHORT.map((monthStr, index) => ({
      month: monthStr,
      total: activeDancers.filter(d => d.birthdayMonth === index + 1).length
    }));
  }, [activeDancers]);

  const maxBirthdays = Math.max(...birthdayStats.map(s => s.total), 1);

  return (
    <div className="page-content">
      <div className="toolbar" style={{ borderRadius: 'var(--radius-lg)' }}>
        <div className="toolbar-group">
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Reports & Analytics</span>
        </div>
        <div className="toolbar-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
            <Download size={16} /> Export / Print
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Active Dancers</span>
            <div className="avatar" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}><Users size={18} /></div>
          </div>
          <div className="stat-card-value">{activeDancers.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Active Ministries</span>
            <div className="avatar" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><Building2 size={18} /></div>
          </div>
          <div className="stat-card-value">{activeMinistries.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Active Leaders</span>
            <div className="avatar" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}><Crown size={18} /></div>
          </div>
          <div className="stat-card-value">{activeLeadersCount}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} className="text-muted" /> Ministry Memberships
          </h2>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ministry Name</th>
                <th>Status</th>
                <th className="text-right">Active Members</th>
              </tr>
            </thead>
            <tbody>
              {ministryStats.length === 0 ? (
                <tr><td colSpan="3" className="empty-state">No ministries found.</td></tr>
              ) : (
                ministryStats.map(m => (
                  <tr key={m.id}>
                    <td className="td-main">{m.name}</td>
                    <td>
                      <div className="status-indicator">
                        <span className="status-dot active"></span> Active
                      </div>
                    </td>
                    <td className="text-right">
                      <span className="td-main">{m.count}</span> <span className="td-quiet">{m.count === 1 ? 'member' : 'members'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} className="text-muted" /> Regional Distribution
            </h2>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Region</th>
                  <th className="text-right">Dancers</th>
                  <th className="text-right">Ministries</th>
                </tr>
              </thead>
              <tbody>
                {regionStats.length === 0 ? (
                  <tr><td colSpan="3" className="empty-state">No data available.</td></tr>
                ) : (
                  regionStats.map((r, i) => (
                    <tr key={i}>
                      <td className="td-main">{r.region}</td>
                      <td className="text-right td-quiet">{r.dancers}</td>
                      <td className="text-right td-quiet">{r.ministries}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChart size={18} className="text-muted" /> Dancer Types
            </h2>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {typeStats.map((stat, i) => {
                const percent = activeDancers.length > 0 ? Math.round((stat.count / activeDancers.length) * 100) : 0;
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{stat.label}</span>
                      <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>{stat.count} ({percent}%)</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-app)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 3, background: 'var(--primary)', width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} className="text-muted" /> Monthly Birthdays
          </h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: '0.5rem', alignItems: 'flex-end', height: '180px' }}>
            {birthdayStats.map((stat, i) => {
              const heightPercent = maxBirthdays > 0 ? (stat.total / maxBirthdays) * 100 : 0;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{stat.total > 0 ? stat.total : ''}</span>
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', background: 'transparent' }}>
                    <div style={{ width: '100%', height: `${heightPercent}%`, background: stat.total > 0 ? 'var(--primary)' : '#e2e8f0', borderRadius: '4px 4px 0 0', minHeight: stat.total > 0 ? '4px' : '0px', transition: 'height 0.3s ease' }}></div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{stat.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
