import React, { useMemo } from 'react';
import { getDancerPrimaryMinistry, getAllLeadersResolved, getMinistryMemberCount } from '../services/dataService';
import { getBirthdayInfo, formatFullDate } from '../utils/birthdayUtils';
import { GHANA_REGIONS, LEADERSHIP_ROLES, getRoleLabel } from '../utils/constants';
import {
  Users, UserPlus, Cake, Building2, Crown, TrendingUp,
  Calendar, Sparkles, Gift, ArrowRight, MapPin, Activity
} from 'lucide-react';

export default function Dashboard({ 
  dancers = [], 
  ministries = [], 
  memberships = [], 
  onViewDancer, 
  onNavigateToBirthdays, 
  onNavigateToDancers 
}) {
  const stats = useMemo(() => {
    const activeMinistries = ministries.filter(m => m.status === 'active');
    
    // Total Leaders
    const leaderIds = new Set();
    memberships.forEach(m => {
      if (m.roles && (m.roles.includes('ministry_leader') || m.roles.includes('assistant_leader'))) {
        leaderIds.add(m.dancerId);
      }
    });
    
    const now = new Date();
    const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    
    const newDancersCount = dancers.filter(d => new Date(d.createdAt) >= twentyEightDaysAgo).length;
    const newMinistriesCount = ministries.filter(m => new Date(m.createdAt) >= twentyEightDaysAgo).length;
    
    let upcomingBirthdaysCount = 0;
    let todayBirthdaysCount = 0;
    
    const dancersWithBirthdayInfo = dancers.map(d => {
      const bDayInfo = getBirthdayInfo(d.birthdayDay, d.birthdayMonth, d.birthYear);
      return { ...d, bDayInfo };
    }).filter(d => d.bDayInfo.daysUntil !== 'unknown');
    
    dancersWithBirthdayInfo.forEach(d => {
      if (d.bDayInfo.daysUntil === 0) todayBirthdaysCount++;
      if (d.bDayInfo.daysUntil <= 30) upcomingBirthdaysCount++;
    });
    
    return {
      totalDancers: dancers.length,
      totalLeaders: leaderIds.size,
      totalMinistries: activeMinistries.length,
      upcomingBirthdays: upcomingBirthdaysCount,
      todayBirthdays: todayBirthdaysCount,
      newDancers: newDancersCount,
      newMinistries: newMinistriesCount,
      dancersWithBirthdayInfo
    };
  }, [dancers, ministries, memberships]);

  // Analytics logic
  const {
    monthlyRegistrations,
    topMinistries,
    topRegions,
    recentActivity,
    nextBirthdays
  } = useMemo(() => {
    // 1. Registration Activity (Monthly for current year)
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCounts = new Array(12).fill(0);
    
    dancers.forEach(d => {
      const date = new Date(d.createdAt);
      if (date.getFullYear() === currentYear) {
        monthlyCounts[date.getMonth()]++;
      }
    });
    
    const maxMonthlyCount = Math.max(...monthlyCounts, 1);
    const monthlyRegistrations = months.map((month, i) => ({
      month,
      count: monthlyCounts[i],
      height: `${(monthlyCounts[i] / maxMonthlyCount) * 100}%`,
      isCurrentMonth: i === currentMonth
    }));

    // 2. Ministry Distribution
    const minCounts = ministries.map(m => ({
      ...m,
      memberCount: getMinistryMemberCount(m.id, memberships)
    })).sort((a, b) => b.memberCount - a.memberCount).slice(0, 5);
    
    const maxMinCount = Math.max(...minCounts.map(m => m.memberCount), 1);
    const minColors = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
    
    const topMinistries = minCounts.map((m, i) => ({
      ...m,
      percent: (m.memberCount / maxMinCount) * 100,
      color: minColors[i % minColors.length]
    }));

    // 3. Region Distribution
    const regionCounts = {};
    dancers.forEach(d => {
      if (d.region) {
        regionCounts[d.region] = (regionCounts[d.region] || 0) + 1;
      }
    });
    
    const topRegionsSorted = Object.entries(regionCounts)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
      
    const maxRegionCount = Math.max(...topRegionsSorted.map(r => r.count), 1);
    
    const topRegions = topRegionsSorted.map((r, i) => ({
      ...r,
      percent: (r.count / maxRegionCount) * 100,
      color: minColors[i % minColors.length]
    }));

    // 4. Recent Activity
    const recentActivity = [...dancers]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(d => {
        const primaryMinistry = getDancerPrimaryMinistry(d.id, memberships, ministries);
        const daysAgo = Math.floor((new Date() - new Date(d.createdAt)) / (1000 * 60 * 60 * 24));
        const timeStr = daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;
        return { ...d, ministryName: primaryMinistry?.name || 'No Ministry', timeStr };
      });

    // 5. Next 5 Birthdays
    const nextBirthdays = stats.dancersWithBirthdayInfo
      .sort((a, b) => a.bDayInfo.daysUntil - b.bDayInfo.daysUntil)
      .slice(0, 5)
      .map(d => {
        const primaryMinistry = getDancerPrimaryMinistry(d.id, memberships, ministries);
        return { ...d, ministryName: primaryMinistry?.name || 'No Ministry' };
      });

    return { monthlyRegistrations, topMinistries, topRegions, recentActivity, nextBirthdays };
  }, [dancers, ministries, memberships, stats.dancersWithBirthdayInfo]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Visual Anchor / Hero Card */}
      <div className="hero-anchor">
        <div className="hero-anchor-content">
          <h1 className="hero-title">Good morning, GH Dance Admin</h1>
          <p className="hero-subtitle">
            You have {stats.todayBirthdays} birthdays today and {stats.newDancers} new registrations this month.
          </p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-white" onClick={onNavigateToDancers}>
            Register New Dancer
          </button>
        </div>
      </div>

      {/* Birthday Highlight (replaces alert) */}
      {stats.todayBirthdays > 0 && (
        <div className="birthday-highlight">
          <div className="birthday-highlight-text">
            <Gift size={20} />
            <span><strong>It's Celebration Time!</strong> {stats.todayBirthdays} dancer{stats.todayBirthdays !== 1 ? 's' : ''} celebrating today.</span>
          </div>
          <button className="btn btn-sm btn-danger" onClick={onNavigateToBirthdays} style={{ background: '#be123c', color: 'white', border: 'none' }}>
            View Birthdays
          </button>
        </div>
      )}

      {/* Premium Stat Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Dancers</span>
            <div className="stat-card-icon"><Users size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.totalDancers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Dance Leaders</span>
            <div className="stat-card-icon"><Crown size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.totalLeaders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Ministries</span>
            <div className="stat-card-icon"><Building2 size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.totalMinistries}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Birthdays in 30 Days</span>
            <div className="stat-card-icon" style={{ color: '#e11d48', background: '#ffe4e6' }}><Cake size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.upcomingBirthdays}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">New Dancers</span>
            <div className="stat-card-icon" style={{ color: '#16a34a', background: '#dcfce7' }}><UserPlus size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.newDancers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">New Ministries</span>
            <div className="stat-card-icon" style={{ color: '#0284c7', background: '#e0f2fe' }}><Sparkles size={18} /></div>
          </div>
          <div className="stat-card-value">{stats.newMinistries}</div>
        </div>
      </div>

      {/* Analytics Layout */}
      <div className="dashboard-grid">
        
        {/* Left Column */}
        <div className="d-flex flex-column gap-4">
          
          {/* Registration Activity */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Activity size={20} className="text-muted" style={{ color: '#9ca3af' }}/> Registration Activity</h3>
            </div>
            <div className="chart-container">
              {Math.max(...monthlyRegistrations.map(m => m.count)) === 0 ? (
                <div className="empty-state w-100">
                  No registration activity this year.
                </div>
              ) : (
                monthlyRegistrations.map((m, i) => (
                  <div key={i} className="chart-bar-wrapper">
                    <div className="chart-bar-container">
                      <div className={`chart-bar ${m.isCurrentMonth ? 'active' : ''}`} style={{ 
                        height: m.height
                      }} title={`${m.count} registrations`} />
                    </div>
                    <span className="chart-label">{m.month}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Calendar size={20} style={{ color: '#9ca3af' }}/> Recent Registrations</h3>
            </div>
            <div className="clean-list">
              {recentActivity.length === 0 ? <p className="empty-state">No recent activity</p> : null}
              {recentActivity.map((d) => (
                <div key={d.id} className="clean-list-item" onClick={() => onViewDancer(d)}>
                  <div className="list-avatar" style={{ background: '#dcfce7', color: '#16a34a' }}>{d.name.charAt(0)}</div>
                  <div className="d-flex flex-column" style={{ flex: 1 }}>
                    <span className="list-avatar-text">{d.name}</span>
                    <span className="list-avatar-sub">{d.ministryName}</span>
                  </div>
                  <div className="d-flex flex-column">
                    <span className="list-right-text">{d.timeStr}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="d-flex flex-column gap-4">
          
          {/* Upcoming Birthdays */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Cake size={20} style={{ color: '#9ca3af' }}/> Upcoming Birthdays</h3>
              <button className="btn btn-sm" onClick={onNavigateToBirthdays} style={{ color: 'var(--primary)', fontWeight: 600, background: 'transparent', border: 'none', padding: 0 }}>View All</button>
            </div>
            <div className="clean-list">
              {nextBirthdays.length === 0 ? <p className="empty-state">No upcoming birthdays</p> : null}
              {nextBirthdays.map((d) => (
                <div key={d.id} className="clean-list-item" onClick={() => onViewDancer(d)}>
                  <div className="list-avatar">{d.name.charAt(0)}</div>
                  <div className="d-flex flex-column" style={{ flex: 1 }}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="list-avatar-text" style={{ margin: 0 }}>{d.name}</span>
                      <div className={`dot-indicator ${d.allowBirthdayPublication ? 'dot-success' : 'dot-danger'}`} title={d.allowBirthdayPublication ? "Published" : "Private"} />
                    </div>
                    <span className="list-avatar-sub">{d.ministryName}</span>
                  </div>
                  <div className="d-flex flex-column" style={{ textAlign: 'right' }}>
                    <span className="list-right-text">{d.bDayInfo.formattedBirthday}</span>
                    <span className="list-right-sub" style={{ color: d.bDayInfo.daysUntil === 0 ? '#e11d48' : 'var(--text-muted)' }}>
                      {d.bDayInfo.daysUntil === 0 ? 'Today' : d.bDayInfo.daysUntil === 1 ? 'Tomorrow' : `In ${d.bDayInfo.daysUntil} days`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ministry Distribution */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Building2 size={20} style={{ color: '#9ca3af' }}/> Top Ministries</h3>
            </div>
            <div className="dist-list">
              {topMinistries.length === 0 ? <p className="empty-state">No ministries data</p> : null}
              {topMinistries.map((m, i) => (
                <div key={m.id} className="dist-row">
                  <div className="dist-header">
                    <span className="dist-label">{m.name}</span>
                    <span className="dist-value">{m.memberCount} dancer{m.memberCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="dist-track">
                    <div className="dist-bar" style={{ width: `${m.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Region Distribution */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><MapPin size={20} style={{ color: '#9ca3af' }}/> Top Regions</h3>
            </div>
            <div className="dist-list">
              {topRegions.length === 0 ? <p className="empty-state">No region data</p> : null}
              {topRegions.map((r, i) => (
                <div key={r.region} className="dist-row">
                  <div className="dist-header">
                    <span className="dist-label">{r.region}</span>
                    <span className="dist-value">{r.count} dancer{r.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="dist-track">
                    <div className="dist-bar" style={{ width: `${r.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
