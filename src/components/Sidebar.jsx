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
        <div className="modal-overlay" onClick={() => setIsMobileOpen(false)} style={{ zIndex: 35 }} />
      )}
      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <LogoComponent />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.2 }}>GH Dance</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Database</span>
          </div>
          {isMobileOpen && (
            <button className="btn-icon" onClick={() => setIsMobileOpen(false)} style={{ marginLeft: 'auto' }}>
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">General</div>
          {generalItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button key={item.id} className={`sidebar-link ${isActive ? 'active' : ''}`} onClick={() => handleTabClick(item.id)} style={{ background: 'transparent', border: 'none', width: '100%' }}>
                <div className="sidebar-link-content">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`badge ${item.isAlert ? 'badge-orange' : ''}`} style={{ border: 'none', background: isActive ? 'white' : 'var(--bg-app)' }}>{item.badge}</span>
                )}
              </button>
            );
          })}

          <div className="nav-section">Management</div>
          {managementItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button key={item.id} className={`sidebar-link ${isActive ? 'active' : ''}`} onClick={() => handleTabClick(item.id)} style={{ background: 'transparent', border: 'none', width: '100%' }}>
                <div className="sidebar-link-content">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="badge" style={{ border: 'none', background: isActive ? 'white' : 'var(--bg-app)' }}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={16} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{adminUser.name || 'GH Dance Admin'}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{adminUser.role || 'System Admin'}</span>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onLogout} style={{ width: '100%', justifyContent: 'center' }}>
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
