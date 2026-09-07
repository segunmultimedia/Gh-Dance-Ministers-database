import React from 'react';
import { 
  LayoutDashboard, Users, Cake, Building2, Crown, 
  Upload, BarChart3, Settings, ShieldCheck, LogOut, X
} from 'lucide-react';
import LogoComponent from './LogoComponent';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  counts = { dancers: 0, ministries: 0, leaders: 0, birthdaysToday: 0 }, 
  adminUser = { name: 'GH Dance Admin', role: 'System Admin' }, 
  onLogout, 
  isMobileOpen, 
  setIsMobileOpen 
}) {
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'dancers', label: 'Dancers', icon: Users, badge: counts.dancers },
    { id: 'birthdays', label: 'Birthdays', icon: Cake, badge: counts.birthdaysToday, isAlert: counts.birthdaysToday > 0 },
    { id: 'ministries', label: 'Ministries', icon: Building2, badge: counts.ministries },
    { id: 'leaders', label: 'Dance Leaders', icon: Crown, badge: counts.leaders },
    { id: 'import', label: 'Import Data', icon: Upload },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const generalItems = navItems.slice(0, 3);
  const managementItems = navItems.slice(3);

  return (
    <>
      {isMobileOpen && (
        <div className="modal-overlay" onClick={() => setIsMobileOpen(false)} style={{ zIndex: 40 }} />
      )}
      <aside className={`sidebar ${isMobileOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="brand">
          <LogoComponent className="brand-logo" />
          <div className="brand-text-container">
            <h1 className="brand-name" style={{ color: 'var(--text-main)' }}>GH Dance Ministers</h1>
            <p className="brand-tag">Database</p>
          </div>
          {isMobileOpen && (
            <button className="btn-icon mobile-close-btn" onClick={() => setIsMobileOpen(false)}>
              <X size={24} />
            </button>
          )}
        </div>

        <div className="sidebar-scroll-area">
          <nav className="sidebar-nav">
            <div className="nav-section">
              <h2 className="nav-section-title">General</h2>
              {generalItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleTabClick(item.id)}
                  >
                    <Icon size={20} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`badge ${isActive ? 'badge-active' : ''} ${item.isAlert && !isActive ? 'badge-danger' : 'badge-subtle'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="nav-section mt-3">
              <h2 className="nav-section-title">Management</h2>
              {managementItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleTabClick(item.id)}
                  >
                    <Icon size={20} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`badge ${isActive ? 'badge-active' : 'badge-subtle'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile-compact">
            <div className="user-profile-avatar">
              <ShieldCheck size={18} />
            </div>
            <div className="user-info">
              <p className="user-name">{adminUser.name || 'GH Dance Admin'}</p>
              <p className="user-role">{adminUser.role || 'System Admin'}</p>
            </div>
          </div>
          <button className="btn-logout" onClick={onLogout}>
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
