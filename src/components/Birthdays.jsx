import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, Image as ImageIcon, Phone } from 'lucide-react';
import { MONTH_NAMES } from '../utils/constants';
import { getBirthdayInfo, isBirthdayInRange, isBirthdayInMonth } from '../utils/birthdayUtils';
import { getDancerPrimaryMinistry } from '../services/dataService';
import { formatPhoneDisplay } from '../utils/phoneUtils';

export default function Birthdays({ dancers, ministries, memberships, searchTerm }) {
  const [filter, setFilter] = useState('upcoming'); // upcoming, today, 7days, 30days, month, all
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());

  const filteredDancers = useMemo(() => {
    let results = dancers.filter(d => d.status !== 'Inactive' && d.birthdayDay && d.birthdayMonth);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(d => d.name.toLowerCase().includes(term));
    }

    if (filter === 'today') {
      results = results.filter(d => isBirthdayInRange(d.birthdayDay, d.birthdayMonth, 0));
    } else if (filter === '7days') {
      results = results.filter(d => isBirthdayInRange(d.birthdayDay, d.birthdayMonth, 7));
    } else if (filter === '30days') {
      results = results.filter(d => isBirthdayInRange(d.birthdayDay, d.birthdayMonth, 30));
    } else if (filter === 'month') {
      results = results.filter(d => isBirthdayInMonth(d.birthdayMonth, selectedMonth));
    }

    const withInfo = results.map(d => {
      const info = getBirthdayInfo(d.birthdayDay, d.birthdayMonth, d.birthYear);
      const ministry = getDancerPrimaryMinistry(d.id, memberships, ministries);
      return { ...d, bdayInfo: info, primaryMinistry: ministry };
    });

    if (filter === 'month' || filter === 'all') {
      withInfo.sort((a, b) => {
        if (a.bdayInfo.birthdayMonth !== b.bdayInfo.birthdayMonth) return a.bdayInfo.birthdayMonth - b.bdayInfo.birthdayMonth;
        return a.bdayInfo.birthdayDay - b.bdayInfo.birthdayDay;
      });
    } else {
      withInfo.sort((a, b) => a.bdayInfo.daysUntil - b.bdayInfo.daysUntil);
    }

    return withInfo;
  }, [dancers, filter, selectedMonth, searchTerm, memberships, ministries]);

  return (
    <div className="page-content">
      <div className="toolbar" style={{ borderRadius: 'var(--radius-lg)' }}>
        <div className="toolbar-group">
          <div style={{ display: 'flex', background: 'var(--bg-app)', padding: '0.25rem', borderRadius: 'var(--radius-md)', gap: '0.25rem', flexWrap: 'wrap' }}>
            {[
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'today', label: 'Today' },
              { id: '7days', label: 'Next 7 Days' },
              { id: '30days', label: 'Next 30 Days' },
              { id: 'month', label: 'By Month' },
              { id: 'all', label: 'All' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  padding: '0.4rem 0.85rem',
                  border: 'none',
                  borderRadius: '4px',
                  background: filter === tab.id ? 'white' : 'transparent',
                  color: filter === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: filter === tab.id ? 600 : 500,
                  boxShadow: filter === tab.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.85rem'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {filter === 'month' && (
            <select className="form-control" style={{ width: '150px' }} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              {MONTH_NAMES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          )}
        </div>
        
        <div className="toolbar-actions">
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{filteredDancers.length} Birthdays</span>
        </div>
      </div>

      <div className="card">
        {filteredDancers.length === 0 ? (
          <div className="empty-state">No birthdays found for this filter.</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dancer</th>
                  <th>Ministry</th>
                  <th>Birthday</th>
                  <th>Countdown</th>
                  <th>Publication Permissions</th>
                  <th className="text-right">Contact</th>
                </tr>
              </thead>
              <tbody>
                {filteredDancers.map(dancer => {
                  const bday = dancer.bdayInfo;
                  const isToday = bday.status === 'today';
                  
                  return (
                    <tr key={dancer.id} style={{ background: isToday ? 'var(--primary-light)' : 'transparent' }}>
                      <td>
                        <div className="cell-identity">
                          <div className="avatar" style={{ background: isToday ? 'var(--primary)' : 'var(--bg-app)', color: isToday ? 'white' : 'var(--text-muted)' }}>
                            {dancer.photo ? <img src={dancer.photo} alt={dancer.name} /> : dancer.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="identity-primary">{dancer.name}</span>
                        </div>
                      </td>
                      <td>
                        {dancer.primaryMinistry ? <span className="td-main">{dancer.primaryMinistry.name}</span> : <span className="td-quiet">Unassigned</span>}
                      </td>
                      <td>
                        <div className="cell-stack">
                          <span className="stack-primary" style={{ fontWeight: 600 }}>{bday.formattedBirthday}</span>
                          {bday.turningAge !== null && <span className="stack-secondary">Turning {bday.turningAge}</span>}
                        </div>
                      </td>
                      <td>
                        {isToday ? (
                          <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>🎉 Today!</span>
                        ) : bday.status === 'tomorrow' ? (
                          <span style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '0.85rem' }}>Tomorrow</span>
                        ) : (
                          <span className="td-quiet" style={{ fontWeight: 500 }}>In {bday.daysUntil} days</span>
                        )}
                      </td>
                      <td>
                        <div className="cell-stack" style={{ gap: '0.4rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: dancer.allowBirthdayPublication ? 'var(--success)' : 'var(--text-quiet)' }}>
                            {dancer.allowBirthdayPublication ? <Eye size={14} /> : <EyeOff size={14} />}
                            {dancer.allowBirthdayPublication ? 'Birthday publication allowed' : 'Birthday publication not allowed'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: dancer.allowPhotoPublication ? 'var(--success)' : 'var(--text-quiet)' }}>
                            {dancer.allowPhotoPublication ? <ImageIcon size={14} /> : <EyeOff size={14} />}
                            {dancer.allowPhotoPublication ? 'Photo publication allowed' : 'Photo publication not allowed'}
                          </div>
                        </div>
                      </td>
                      <td className="text-right">
                        <a href={`tel:${dancer.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-main)', textDecoration: 'none', background: 'var(--bg-app)', padding: '0.4rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 500 }}>
                          <Phone size={14} style={{ color: 'var(--text-muted)' }}/>
                          {formatPhoneDisplay(dancer.phone)}
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
