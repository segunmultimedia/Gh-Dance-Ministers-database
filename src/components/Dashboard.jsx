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
      .slice(0, 5)
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
          <button className="btn btn-secondary" onClick={onNavigateToDancers}>
            Register New Dancer
          </button>
        </div>
      </div>

      {/* Birthday Highlight */}
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
      </div>

      {/* FIXED DASHBOARD ANALYTICS LOWER SECTION */}
      <div className="dashboard-analytics">
        
        {/* ROW 1 */}
        <div className="da-row-1">
          {/* Registration Activity Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Activity size={20} className="text-muted" /> Registration Activity</h3>
            </div>
            <div className="da-chart-container">
              {Math.max(...monthlyRegistrations.map(m => m.count)) === 0 ? (
                <div className="empty-state w-100" style={{ width: '100%' }}>No registration activity this year.</div>
              ) : (
                monthlyRegistrations.map((m, i) => (
                  <div key={i} className="da-chart-col">
                    <div className="da-chart-bar-wrapper">
                      <div className="da-chart-bar" style={{ height: m.height }} title={`${m.count} registrations`}></div>
                    </div>
                    <span className="da-chart-label">{m.month}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Calendar size={20} className="text-muted" /> Recent Registrations</h3>
              <button className="btn-ghost btn-sm" onClick={onNavigateToDancers} style={{ fontSize: '0.8rem', padding: 0 }}>View All</button>
            </div>
            <div className="da-list pb-2">
              {recentActivity.length === 0 ? (
                <div className="empty-state">No recent activity.</div>
              ) : (
                recentActivity.map((d) => (
                  <div key={d.id} className="da-list-item" onClick={() => onViewDancer(d)}>
                    <div className="da-list-left">
                      <div className="avatar">{d.name.charAt(0).toUpperCase()}</div>
                      <div className="da-list-text">
                        <span className="da-list-title">{d.name}</span>
                        <span className="da-list-subtitle">{d.ministryName}</span>
                      </div>
                    </div>
                    <div className="da-list-right">
                      <span className="da-time">{d.timeStr}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ROW 2 */}
        <div className="da-row-2">
          {/* Upcoming Birthdays */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Cake size={20} className="text-muted" /> Upcoming Birthdays</h3>
              <button className="btn-ghost btn-sm" onClick={onNavigateToBirthdays} style={{ fontSize: '0.8rem', padding: 0 }}>View All</button>
            </div>
            <div className="da-list pb-2">
              {nextBirthdays.length === 0 ? (
                <div className="empty-state">No upcoming birthdays.</div>
              ) : (
                nextBirthdays.map((d) => (
                  <div key={d.id} className="da-list-item" onClick={() => onViewDancer(d)}>
                    <div className="da-list-left">
                      <div className="avatar">{d.name.charAt(0).toUpperCase()}</div>
                      <div className="da-list-text">
                        <span className="da-list-title">{d.name}</span>
                        <span className="da-list-subtitle">{d.ministryName}</span>
                      </div>
                    </div>
                    <div className="da-list-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{d.bDayInfo.formattedBirthday}</span>
                      {d.bDayInfo.daysUntil === 0 ? (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--danger)' }}>Today</span>
                      ) : d.bDayInfo.daysUntil === 1 ? (
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning)' }}>Tomorrow</span>
                      ) : (
                        <span className="da-time">In {d.bDayInfo.daysUntil} days</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Ministries */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Building2 size={20} className="text-muted" /> Top Ministries</h3>
            </div>
            <div className="da-list py-2" style={{ gap: '0' }}>
              {topMinistries.length === 0 ? (
                <div className="empty-state">No ministries data.</div>
              ) : (
                topMinistries.map((m) => (
                  <div key={m.id} className="da-progress-row">
                    <div className="da-progress-header">
                      <span className="da-progress-title">{m.name}</span>
                      <span className="da-progress-value">{m.memberCount} dancer{m.memberCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="da-progress-track">
                      <div className="da-progress-bar" style={{ width: `${m.percent}%` }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Regions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><MapPin size={20} className="text-muted" /> Top Regions</h3>
            </div>
            <div className="da-list py-2" style={{ gap: '0' }}>
              {topRegions.length === 0 ? (
                <div className="empty-state">No region data.</div>
              ) : (
                topRegions.map((r) => (
                  <div key={r.region} className="da-progress-row">
                    <div className="da-progress-header">
                      <span className="da-progress-title">{r.region}</span>
                      <span className="da-progress-value">{r.count} dancer{r.count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="da-progress-track">
                      <div className="da-progress-bar" style={{ width: `${r.percent}%` }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
