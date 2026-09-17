import React, { useState, useMemo } from 'react';
import { getDancerPrimaryMinistry, getAllLeadersResolved, getMinistryMemberCount } from '../services/dataService';
import { getBirthdayInfo, formatFullDate } from '../utils/birthdayUtils';
import { GHANA_REGIONS, LEADERSHIP_ROLES, getRoleLabel } from '../utils/constants';
import {
  Users, UserPlus, Cake, Building2, Crown, TrendingUp,
  Calendar, Sparkles, Gift, ArrowRight, MapPin, Activity,
  BarChart3, PieChart, Filter, X, Clock, CalendarDays, CalendarRange
} from 'lucide-react';

export default function Dashboard({ 
  dancers = [], 
  ministries = [], 
  memberships = [], 
  adminUser,
  onViewDancer, 
  onNavigateToBirthdays, 
  onNavigateToDancers,
  onRegisterNewDancer 
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

  // Chart controls
  const [chartFilter, setChartFilter] = useState('monthly');
  const [chartType, setChartType] = useState('bar');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Chart data based on selected filter
  const chartData = useMemo(() => {
    const now = new Date();
    let labels = [];
    let counts = [];

    if (chartFilter === '7days') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }));
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        counts.push(dancers.filter(d => {
          const c = new Date(d.createdAt);
          return c >= dayStart && c < dayEnd;
        }).length);
      }
    } else if (chartFilter === '28days') {
      for (let w = 3; w >= 0; w--) {
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() - (w * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);
        labels.push(`${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
        const wStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
        const wEnd = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate() + 1);
        counts.push(dancers.filter(d => {
          const c = new Date(d.createdAt);
          return c >= wStart && c < wEnd;
        }).length);
      }
    } else if (chartFilter === 'monthly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = now.getFullYear();
      labels = [...months];
      counts = new Array(12).fill(0);
      dancers.forEach(d => {
        const date = new Date(d.createdAt);
        if (date.getFullYear() === currentYear) {
          counts[date.getMonth()]++;
        }
      });
    } else if (chartFilter === 'yearly') {
      const yearCounts = {};
      dancers.forEach(d => {
        const year = new Date(d.createdAt).getFullYear();
        if (!isNaN(year)) yearCounts[year] = (yearCounts[year] || 0) + 1;
      });
      const years = Object.keys(yearCounts).sort();
      labels = years;
      counts = years.map(y => yearCounts[y]);
    }

    const maxCount = Math.max(...counts, 1);
    return { labels, counts, maxCount };
  }, [dancers, chartFilter]);

  // Analytics logic
  const {
    topMinistries,
    topRegions,
    recentActivity,
    nextBirthdays
  } = useMemo(() => {
    // 1. Ministry Distribution
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

    // 2. Region Distribution
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

    // 3. Recent Activity
    const recentActivity = [...dancers]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(d => {
        const primaryMinistry = getDancerPrimaryMinistry(d.id, memberships, ministries);
        const daysAgo = Math.floor((new Date() - new Date(d.createdAt)) / (1000 * 60 * 60 * 24));
        const timeStr = daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;
        return { ...d, ministryName: primaryMinistry?.name || 'No Ministry', timeStr };
      });

    // 4. Next 5 Birthdays
    const nextBirthdays = stats.dancersWithBirthdayInfo
      .sort((a, b) => a.bDayInfo.daysUntil - b.bDayInfo.daysUntil)
      .slice(0, 5)
      .map(d => {
        const primaryMinistry = getDancerPrimaryMinistry(d.id, memberships, ministries);
        return { ...d, ministryName: primaryMinistry?.name || 'No Ministry' };
      });

    return { topMinistries, topRegions, recentActivity, nextBirthdays };
  }, [dancers, ministries, memberships, stats.dancersWithBirthdayInfo]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Visual Anchor / Hero Card */}
      <div className="hero-anchor">
        <div className="hero-anchor-content">
          <h1 className="hero-title">Welcome, {adminUser?.name || 'Admin'}</h1>
          <p className="hero-subtitle">
            You have {stats.todayBirthdays} birthdays today and {stats.newDancers} new registrations this month.
          </p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-secondary" onClick={onRegisterNewDancer}>
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
            <div className="stat-card-icon"><Users size={20} strokeWidth={2} /></div>
          </div>
          <div className="stat-card-value">{stats.totalDancers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Dance Leaders</span>
            <div className="stat-card-icon"><Crown size={20} strokeWidth={2} /></div>
          </div>
          <div className="stat-card-value">{stats.totalLeaders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Ministries</span>
            <div className="stat-card-icon"><Building2 size={20} strokeWidth={2} /></div>
          </div>
          <div className="stat-card-value">{stats.totalMinistries}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">New Dancers</span>
            <div className="stat-card-icon"><UserPlus size={20} strokeWidth={2} /></div>
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
            <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3 className="card-title"><Activity size={20} className="text-muted" /> Registration Activity</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
                {/* Time filter dropdown */}
                <div className="filter-dropdown-container">
                  <button className="filter-dropdown-btn" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                    <Filter size={16} /> Filters
                  </button>
                  
                  {isFilterOpen && (
                    <>
                      <div className="modal-overlay" style={{ background: 'transparent', zIndex: 45 }} onClick={() => setIsFilterOpen(false)} />
                      <div className="filter-dropdown-menu">
                        <div className="filter-dropdown-header">
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Filters</span>
                          <button className="btn-icon" onClick={() => setIsFilterOpen(false)} style={{ width: 24, height: 24, padding: 0 }}><X size={16} /></button>
                        </div>
                        <div className="filter-dropdown-body">
                          <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Time Range</div>
                          {[
                            { id: '7days', label: 'Last 7 Days', icon: Clock },
                            { id: '28days', label: 'Last 28 Days', icon: CalendarDays },
                            { id: 'monthly', label: 'This Year (Monthly)', icon: Calendar },
                            { id: 'yearly', label: 'All Time (Yearly)', icon: CalendarRange }
                          ].map(f => (
                            <button
                              key={f.id}
                              className={`filter-dropdown-item ${chartFilter === f.id ? 'active' : ''}`}
                              onClick={() => { setChartFilter(f.id); setIsFilterOpen(false); }}
                            >
                              <f.icon size={16} style={{ color: 'var(--text-muted)' }} />
                              <span>{f.label}</span>
                              {chartFilter === f.id && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {/* Chart type switcher */}
                <div className="da-filter-pills">
                  {[
                    { id: 'bar', Icon: BarChart3 },
                    { id: 'line', Icon: TrendingUp },
                    { id: 'pie', Icon: PieChart }
                  ].map(ct => (
                    <button key={ct.id} className={`da-filter-pill ${chartType === ct.id ? 'active' : ''}`} onClick={() => setChartType(ct.id)} aria-label={`${ct.id} chart`}>
                      <ct.Icon size={14} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            {chartType === 'bar' && (
              <div className="da-chart-container">
                {chartData.maxCount === 0 || chartData.counts.every(c => c === 0) ? (
                  <div className="empty-state" style={{ width: '100%' }}>No registration activity for this period.</div>
                ) : (
                  chartData.labels.map((label, i) => (
                    <div key={i} className="da-chart-col">
                      <div className="da-chart-bar-wrapper">
                        <div className="da-chart-bar" style={{ height: `${(chartData.counts[i] / chartData.maxCount) * 100}%` }} title={`${label}: ${chartData.counts[i]} registrations`}></div>
                      </div>
                      <span className="da-chart-label">{label}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Line Chart */}
            {chartType === 'line' && (() => {
              const { labels, counts, maxCount } = chartData;
              if (maxCount === 0 || counts.every(c => c === 0)) return <div className="empty-state" style={{ height: 250 }}>No registration activity for this period.</div>;
              const w = 500, h = 220, pt = 20, pr = 15, pb = 30, pl = 35;
              const cw = w - pl - pr, ch = h - pt - pb;
              const pts = counts.map((c, i) => ({
                x: pl + (counts.length === 1 ? cw / 2 : (i / (counts.length - 1)) * cw),
                y: pt + ch - (c / maxCount) * ch, count: c
              }));
              const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
              const area = `${pts[0].x},${pt + ch} ${polyline} ${pts[pts.length - 1].x},${pt + ch}`;
              return (
                <div style={{ padding: '1rem', height: 250 }}>
                  <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
                    {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
                      <g key={i}>
                        <line x1={pl} y1={pt + ch * (1 - pct)} x2={pl + cw} y2={pt + ch * (1 - pct)} stroke="#e2e8f0" strokeWidth="1" />
                        <text x={pl - 6} y={pt + ch * (1 - pct) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{Math.round(maxCount * pct)}</text>
                      </g>
                    ))}
                    <polygon points={area} fill="var(--primary)" opacity="0.08" />
                    <polyline points={polyline} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {pts.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--primary)" stroke="white" strokeWidth="2">
                        <title>{`${labels[i]}: ${p.count}`}</title>
                      </circle>
                    ))}
                    {labels.map((label, i) => (
                      <text key={i} x={pts[i].x} y={h - 8} textAnchor="middle" fontSize="10" fill="#64748b">{label}</text>
                    ))}
                  </svg>
                </div>
              );
            })()}

            {/* Pie Chart */}
            {chartType === 'pie' && (() => {
              const { labels, counts } = chartData;
              const total = counts.reduce((s, c) => s + c, 0);
              const colors = ['#f97316', '#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6', '#f43f5e', '#84cc16', '#a855f7', '#0ea5e9'];
              if (total === 0) return <div className="empty-state" style={{ height: 250 }}>No registration activity for this period.</div>;
              let cum = 0;
              const slices = counts.map((count, i) => {
                const pct = count / total;
                const start = cum;
                cum += pct;
                return { label: labels[i], count, pct, start, color: colors[i % colors.length] };
              }).filter(s => s.count > 0);
              const stops = slices.map(s => `${s.color} ${s.start * 360}deg ${(s.start + s.pct) * 360}deg`).join(', ');
              return (
                <div style={{ padding: '1.25rem', height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                  <div style={{ width: 160, height: 160, borderRadius: '50%', background: `conic-gradient(${stops})`, flexShrink: 0, boxShadow: 'inset 0 0 0 0 white' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.8rem', maxHeight: 200, overflowY: 'auto' }}>
                    {slices.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', marginLeft: 'auto', paddingLeft: '0.75rem' }}>{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Recent Registrations */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><Calendar size={20} className="text-muted" /> Recent Registrations</h3>
              <button className="da-view-all-btn" onClick={onNavigateToDancers}>
                View All <ArrowRight size={14} />
              </button>
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
              <button className="da-view-all-btn" onClick={onNavigateToBirthdays}>
                View All <ArrowRight size={14} />
              </button>
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
