import React, { useState } from 'react';
import { Cake, Gift, Calendar, Sparkles, Mail, Phone, Heart, Award, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getBirthdayStatus, formatFullDate } from '../utils/birthdayUtils';

export default function Birthdays({ members, onViewMember }) {
  const [activeTab, setActiveTab] = useState('all');

  // Trigger celebration confetti
  const handleTriggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Group members by birthday status
  const todayList = members.filter(m => getBirthdayStatus(m.dob).status === 'today');
  const tomorrowList = members.filter(m => getBirthdayStatus(m.dob).status === 'tomorrow');
  const thisWeekList = members.filter(m => getBirthdayStatus(m.dob).status === 'this_week');
  const thisMonthList = members.filter(m => getBirthdayStatus(m.dob).status === 'this_month');

  // Sort upcoming list chronologically
  const upcomingSorted = [...members]
    .map(m => ({ member: m, bday: getBirthdayStatus(m.dob) }))
    .sort((a, b) => a.bday.daysUntil - b.bday.daysUntil);

  return (
    <div>
      {/* Hero Header Banner */}
      <div 
        className="hero-banner" 
        style={{ 
          background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)',
          boxShadow: '0 8px 24px -4px rgba(225, 29, 72, 0.3)'
        }}
      >
        <div className="hero-text">
          <h2>🎂 Member Birthday Tracking Hub</h2>
          <p>Automatically track upcoming birthdays and never miss celebrating organization members.</p>
        </div>
        <button className="btn-hero" style={{ color: '#be123c' }} onClick={handleTriggerConfetti}>
          <PartyPopper size={18} />
          <span>Send Celebration Wishes</span>
        </button>
      </div>

      {/* Overview Birthday Stat Pills */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderColor: todayList.length > 0 ? '#f43f5e' : undefined, background: todayList.length > 0 ? '#fff1f2' : undefined }}>
          <div className="stat-header">
            <span className="stat-title" style={{ color: todayList.length > 0 ? '#be123c' : undefined }}>Birthday Today</span>
            <div className="stat-icon-bg" style={{ background: '#ffe4e6', color: '#e11d48' }}>
              <Gift size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: todayList.length > 0 ? '#be123c' : undefined }}>{todayList.length}</div>
          <div className="stat-footer">
            <span className="trend-badge positive" style={{ background: todayList.length > 0 ? '#fecdd3' : undefined, color: todayList.length > 0 ? '#be123c' : undefined }}>
              {todayList.length > 0 ? 'Celebrate Now!' : 'None today'}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Birthday Tomorrow</span>
            <div className="stat-icon-bg" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Cake size={20} />
            </div>
          </div>
          <div className="stat-value">{tomorrowList.length}</div>
          <div className="stat-footer">
            <span className="trend-badge neutral">Next 24 Hours</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">This Week</span>
            <div className="stat-icon-bg" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div className="stat-value">{thisWeekList.length + todayList.length + tomorrowList.length}</div>
          <div className="stat-footer">
            <span className="trend-badge positive">Next 7 Days</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">This Month</span>
            <div className="stat-icon-bg" style={{ background: '#f3e8ff', color: '#9333ea' }}>
              <Sparkles size={20} />
            </div>
          </div>
          <div className="stat-value">{thisMonthList.length + thisWeekList.length + todayList.length + tomorrowList.length}</div>
          <div className="stat-footer">
            <span className="trend-badge neutral">Next 30 Days</span>
          </div>
        </div>
      </div>

      {/* Section 1: Birthday Today Featured Spotlight */}
      {todayList.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#be123c', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Gift size={20} /> Celebrating Today 🎉
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {todayList.map(member => {
              const bday = getBirthdayStatus(member.dob);
              return (
                <div 
                  key={member.id} 
                  className="card" 
                  style={{ 
                    background: 'linear-gradient(135deg, #ffffff 0%, #fff1f2 100%)', 
                    borderColor: '#fecdd3',
                    borderWidth: '2px',
                    position: 'relative'
                  }}
                >
                  <span className="badge badge-danger" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                    Turning {bday.turningAge} Today!
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <img
                      src={member.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt={member.name}
                      style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #f43f5e' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{member.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{member.department || 'Member'}</p>
                      <div style={{ fontSize: '0.8rem', color: '#be123c', fontWeight: 700, marginTop: '2px' }}>
                        🎂 Born: {formatFullDate(member.dob)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a href={`mailto:${member.email}?subject=Happy Birthday from Organization!`} className="btn btn-primary btn-sm" style={{ flex: 1, background: '#e11d48', borderColor: '#e11d48', textDecoration: 'none' }}>
                      <Mail size={14} /> Send Email Wish
                    </a>
                    {member.phone && (
                      <a href={`tel:${member.phone}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                        <Phone size={14} /> Call
                      </a>
                    )}
                    <button className="btn btn-secondary btn-sm" onClick={() => onViewMember(member)}>
                      Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 2: All Upcoming Birthdays Timeline */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Chronological Birthday Calendar</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upcoming member birthdays ordered by date</p>
          </div>

          <div className="tabs-bar" style={{ marginBottom: 0 }}>
            <button className={`tab-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
              All Upcoming ({upcomingSorted.length})
            </button>
            <button className={`tab-item ${activeTab === 'tomorrow' ? 'active' : ''}`} onClick={() => setActiveTab('tomorrow')}>
              Tomorrow ({tomorrowList.length})
            </button>
            <button className={`tab-item ${activeTab === 'week' ? 'active' : ''}`} onClick={() => setActiveTab('week')}>
              This Week ({thisWeekList.length + todayList.length + tomorrowList.length})
            </button>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Department</th>
                <th>Birth Date</th>
                <th>Turning Age</th>
                <th>Days Until Birthday</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {upcomingSorted.map(({ member, bday }) => {
                if (activeTab === 'tomorrow' && bday.status !== 'tomorrow') return null;
                if (activeTab === 'week' && bday.daysUntil > 7) return null;

                return (
                  <tr key={member.id} style={{ background: bday.status === 'today' ? '#fff1f2' : undefined }}>
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
                      <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                        {bday.formattedNextBirthday}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Original: {formatFullDate(member.dob)}
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-gray">Turning {bday.turningAge}</span>
                    </td>

                    <td>
                      {bday.status === 'today' ? (
                        <span className="badge badge-danger">🎉 Birthday Today!</span>
                      ) : bday.status === 'tomorrow' ? (
                        <span className="badge badge-warning">🎂 Tomorrow!</span>
                      ) : (
                        <span className="badge badge-info">In {bday.daysUntil} days</span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <a href={`mailto:${member.email}`} className="btn btn-secondary btn-sm" title="Send Email Wish">
                          <Mail size={14} /> Wish
                        </a>
                        <button className="btn btn-secondary btn-sm" onClick={() => onViewMember(member)}>
                          View Profile
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
