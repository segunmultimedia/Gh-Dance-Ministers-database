import React from 'react';
import { Search, Bell, Plus, Menu, UserPlus, FileUp } from 'lucide-react';

export default function Header({ 
  activeTab, 
  searchTerm, 
  setSearchTerm, 
  onOpenAddMember, 
  onOpenUploadFile,
  toggleMobileMenu,
  birthdayNotificationsCount
}) {
  const titles = {
    dashboard: 'Dashboard Overview',
    members: 'Member Directory',
    birthdays: 'Birthday Reminders',
    leaders: 'Group Leadership Directory',
    flyer: 'Auto Flyer Designer Studio',
    files: 'File & Document Repository',
    reports: 'Reports & Analytics',
    settings: 'System Settings'
  };

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          className="btn btn-secondary btn-icon mobile-toggle-btn" 
          onClick={toggleMobileMenu}
        >
          <Menu size={20} />
        </button>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Pages / <span style={{ color: 'var(--text-main)' }}>{titles[activeTab] || 'System'}</span>
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {titles[activeTab] || 'Overview'}
          </h1>
        </div>
      </div>

      <div className="header-actions">
        {/* Search Bar */}
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search name, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Quick Actions */}
        <button className="btn btn-primary" onClick={onOpenAddMember}>
          <UserPlus size={16} />
          <span style={{ display: 'inline' }}>Add Member</span>
        </button>

        <button className="btn btn-secondary" onClick={onOpenUploadFile}>
          <FileUp size={16} />
          <span>Upload File</span>
        </button>

        {/* Notifications Icon */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <div className="btn btn-secondary btn-icon">
            <Bell size={18} />
          </div>
          {birthdayNotificationsCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 800,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white'
            }}>
              {birthdayNotificationsCount}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
