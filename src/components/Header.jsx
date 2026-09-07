import React from 'react';
import { Menu, Search, Bell, UserPlus } from 'lucide-react';

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

  const showSearch = ['dancers', 'leaders', 'ministries', 'birthdays'].includes(activeTab);

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="btn-icon mobile-toggle-btn" onClick={toggleMobileMenu}>
          <Menu size={24} />
        </button>
        <h1 className="page-title">{getPageTitle()}</h1>
      </div>

      <div className="header-right">
        {showSearch && (
          <div className="search-bar-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        <div className="header-actions">
          {birthdayNotificationsCount > 0 && (
            <button className="notification-btn" title={`${birthdayNotificationsCount} birthdays today`}>
              <Bell size={20} />
              <span className="notification-dot">{birthdayNotificationsCount > 9 ? '9+' : birthdayNotificationsCount}</span>
            </button>
          )}

          {activeTab === 'dancers' && (
            <button className="btn btn-primary btn-sm btn-header" onClick={onOpenAddDancer}>
              <UserPlus size={16} />
              <span>Register New Dancer</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
