import React, { useState, useMemo } from 'react';
import { Search, Cake, Filter, Eye, AlertCircle } from 'lucide-react';
import { getBirthdayInfo, isBirthdayInMonth } from '../utils/birthdayUtils';
import { getDancerPrimaryMinistry } from '../services/dataService';
import { MONTH_NAMES } from '../utils/constants';

export default function Birthdays({ dancers, memberships, ministries, onViewDancer }) {
  const [activeTab, setActiveTab] = useState('next30'); // 'today', 'next7', 'next30', 'all'
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' or 1-12
  const [searchTerm, setSearchTerm] = useState('');

  const processedDancers = useMemo(() => {
    return dancers
      .map(dancer => {
        const primaryMinistry = getDancerPrimaryMinistry(dancer.id, memberships, ministries);
        const bDayInfo = getBirthdayInfo(dancer.birthdayDay, dancer.birthdayMonth, dancer.birthYear);
        return {
          ...dancer,
          ministryName: primaryMinistry ? primaryMinistry.name : 'No Ministry',
          bDayInfo
        };
      })
      .filter(dancer => dancer.bDayInfo !== null) // Exclude unknown birthdays
      .sort((a, b) => {
        // For "All" view, sort by month then day. Otherwise sort by daysUntil
        if (activeTab === 'all' && selectedMonth === 'all') {
          if (a.birthdayMonth !== b.birthdayMonth) return a.birthdayMonth - b.birthdayMonth;
          return a.birthdayDay - b.birthdayDay;
        }
        return a.bDayInfo.daysUntil - b.bDayInfo.daysUntil;
      });
  }, [dancers, memberships, ministries, activeTab, selectedMonth]);

  const filteredDancers = useMemo(() => {
    return processedDancers.filter(dancer => {
      // Name search
      if (searchTerm && !dancer.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // If a specific month is selected, only filter by that month (ignore the tab)
      if (selectedMonth !== 'all') {
        return isBirthdayInMonth(dancer.birthdayMonth, parseInt(selectedMonth));
      }
      
      // Otherwise apply tab filters
      const days = dancer.bDayInfo.daysUntil;
      if (activeTab === 'today') return days === 0;
      if (activeTab === 'next7') return days >= 0 && days <= 7;
      if (activeTab === 'next30') return days >= 0 && days <= 30;
      
      return true; // 'all' tab
    });
  }, [processedDancers, activeTab, selectedMonth, searchTerm]);

  // Handle tab click (resets month filter)
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSelectedMonth('all');
  };

  // Handle month change (resets tab to 'all' if a specific month is chosen)
  const handleMonthChange = (e) => {
    const val = e.target.value;
    setSelectedMonth(val);
    if (val !== 'all') {
      setActiveTab('all');
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Birthday Hub</h1>
          <p className="page-header-subtitle">
            Track and celebrate the upcoming birthdays of your dancers and leaders.
          </p>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="tabs-bar">
        <button className={`tab-item ${activeTab === 'today' && selectedMonth === 'all' ? 'active' : ''}`} onClick={() => handleTabClick('today')}>
          Today
        </button>
        <button className={`tab-item ${activeTab === 'next7' && selectedMonth === 'all' ? 'active' : ''}`} onClick={() => handleTabClick('next7')}>
          Next 7 Days
        </button>
        <button className={`tab-item ${activeTab === 'next30' && selectedMonth === 'all' ? 'active' : ''}`} onClick={() => handleTabClick('next30')}>
          Next 30 Days
        </button>
        <button className={`tab-item ${activeTab === 'all' || selectedMonth !== 'all' ? 'active' : ''}`} onClick={() => handleTabClick('all')}>
          All Birthdays
        </button>
      </div>

      {/* Controls Bar */}
      <div className="toolbar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div className="filters-group" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
          <div className="search-bar-container" style={{ display: 'block' }}>
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search dancer name..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="form-control" 
            style={{ width: '180px' }}
            value={selectedMonth} 
            onChange={handleMonthChange}
          >
            <option value="all">All Months</option>
            {MONTH_NAMES.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        
        <div className="text-muted small fw-bold">
          {filteredDancers.length} birthday{filteredDancers.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Results */}
      <div className="card">
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Dancer Name</th>
                <th>Ministry</th>
                <th>Birthday</th>
                <th>Status</th>
                <th>Permissions</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDancers.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <p>No birthdays found for the selected filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDancers.map(dancer => {
                  const isToday = dancer.bDayInfo.daysUntil === 0;
                  const isTomorrow = dancer.bDayInfo.daysUntil === 1;
                  const isSoon = dancer.bDayInfo.daysUntil > 1 && dancer.bDayInfo.daysUntil <= 7;
                  
                  return (
                    <tr key={dancer.id} style={{ background: isToday ? '#fff1f2' : 'transparent' }}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="list-avatar" style={{ width: 40, height: 40, fontSize: '0.9rem', background: dancer.photo ? 'transparent' : 'var(--primary-light)' }}>
                            {dancer.photo ? (
                              <img src={dancer.photo} alt={dancer.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              dancer.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: isToday ? '#e11d48' : 'var(--text-main)' }}>
                              {dancer.name} {isToday && <Cake size={14} style={{ display: 'inline', marginLeft: '4px', color: '#e11d48' }} />}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {dancer.bDayInfo.currentAge !== null ? `Turning ${dancer.bDayInfo.currentAge}` : 'Age unknown'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                        {dancer.ministryName}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {dancer.bDayInfo.formattedBirthday}
                        </div>
                      </td>
                      <td>
                        <div style={{ 
                          fontWeight: 600, 
                          color: isToday ? '#e11d48' : isTomorrow ? '#d97706' : isSoon ? '#0284c7' : 'var(--text-muted)' 
                        }}>
                          {isToday ? 'Today!' : isTomorrow ? 'Tomorrow' : `In ${dancer.bDayInfo.daysUntil} days`}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1" style={{ fontSize: '0.8rem' }}>
                          <div className="d-flex align-items-center gap-2">
                            <div className={`dot-indicator ${dancer.allowBirthdayPublication ? 'dot-success' : 'dot-danger'}`} />
                            <span style={{ color: dancer.allowBirthdayPublication ? 'var(--text-main)' : 'var(--text-muted)' }}>
                              {dancer.allowBirthdayPublication ? 'Birth Date Public' : 'Birth Date Private'}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <div className={`dot-indicator ${dancer.allowPhotoPublication ? 'dot-success' : 'dot-danger'}`} />
                            <span style={{ color: dancer.allowPhotoPublication ? 'var(--text-main)' : 'var(--text-muted)' }}>
                              {dancer.allowPhotoPublication ? 'Photo Public' : 'Photo Private'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex justify-content-end">
                          <button className="btn btn-secondary btn-sm" onClick={() => onViewDancer(dancer)}>
                            <Eye size={16} className="me-2" /> View
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
