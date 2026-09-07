import React from 'react';
import { Menu, Search, Bell, Plus } from 'lucide-react';

export default function Header({
  activeTab,
  searchTerm,
  setSearchTerm,
  onOpenAddDancer,
  toggleMobileMenu,
  birthdayNotificationsCount = 0
}) {
  const getPageTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'dancers': return 'Dancers Directory';
      case 'birthdays': return 'Birthday Hub';
      case 'ministries': return 'Ministries';
      case 'leaders': return 'Dance Leaders';
      case 'import': return 'Import Data';
      case 'reports': return 'Reports';
      case 'settings': return 'Settings';
      default: return 'Database';
    }
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="mobile-toggle-btn" onClick={toggleMobileMenu}>
          <Menu size={24} />
        </button>
        <h1 style={{ fontSize: '1.25rem', margin: 0 }}>{getPageTitle()}</h1>
      </div>

      <div className="header-right">
        {['dancers', 'leaders', 'ministries', 'birthdays'].includes(activeTab) && (
          <div className="search-wrapper">
            <Search size={16} className="lucide" />
            <input
              type="text"
              className="search-input"
              placeholder="Quick search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {birthdayNotificationsCount > 0 && (
          <button className="btn-icon" style={{ position: 'relative' }} title={`${birthdayNotificationsCount} birthdays today`}>
            <Bell size={20} />
            <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, background: 'var(--danger)', borderRadius: '50%', border: '2px solid white' }}></span>
          </button>
        )}

        {activeTab === 'dancers' && (
          <button className="btn btn-primary btn-sm" onClick={onOpenAddDancer}>
            <Plus size={16} /> <span className="hide-mobile">Register Dancer</span>
          </button>
        )}
      </div>
    </header>
  );
}
