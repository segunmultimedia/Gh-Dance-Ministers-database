import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Cake, 
  FolderKanban, 
  BarChart3, 
  Settings, 
  LogOut,
  Sparkles,
  ShieldCheck,
  Crown,
  Palette
} from 'lucide-react';
import LogoComponent from './LogoComponent';

export default function Sidebar({ activeTab, setActiveTab, counts, adminUser, onLogout, isMobileOpen, setIsMobileOpen }) {
  const menuGeneral = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members', icon: Users, badge: counts.members },
  ];

  const menuTools = [
    { id: 'leaders', label: 'Group Leaders', icon: Crown, badge: counts.leaders },
    { id: 'flyer', label: 'Flyer Studio', icon: Palette },
    { id: 'files', label: 'Files & Storage', icon: FolderKanban, badge: counts.files },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
      <div>
        {/* Brand Header matching reference image */}
        <div className="brand" style={{ gap: '0.85rem' }}>
          <LogoComponent size={44} />
          <div>
            <div className="brand-name" style={{ fontSize: '1.05rem', lineHeight: '1.2' }}>GH Dance Ministers</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span className="brand-tag">Member Hub</span>
            </div>
          </div>
        </div>

        {/* General Nav */}
        <div className="nav-section">
          <div className="nav-section-title">General</div>
          {menuGeneral.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`badge-count ${item.isAlert ? 'alert' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Tools Nav */}
        <div className="nav-section">
          <div className="nav-section-title">Management</div>
          {menuTools.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="badge-count">{item.badge}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin Profile Footer */}
      <div>
        <div className="user-profile-card">
          <div className="avatar" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <ShieldCheck size={20} />
          </div>
          <div className="user-info">
            <span className="user-name">{adminUser?.name || 'Administrator'}</span>
            <span className="user-role">{adminUser?.email || 'admin@org.com'}</span>
          </div>
        </div>

        <button 
          className="nav-item" 
          onClick={onLogout}
          style={{ width: '100%', marginTop: '0.5rem', color: '#ef4444', justifyContent: 'flex-start' }}
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
