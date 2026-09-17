import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Dancers from './components/Dancers';
import Birthdays from './components/Birthdays';
import Leaders from './components/Leaders';
import Ministries from './components/Ministries';
import MinistryModal from './components/MinistryModal';
import ExcelImport from './components/ExcelImport';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Login from './components/Login';
import DancerModal from './components/DancerModal';
import DancerDetailModal from './components/DancerDetailModal';
import MigrationWarning from './components/MigrationWarning';

import {
  getCurrentDBVersion,
  exportV2Data,
  initDB,
  seedInitialDataIfNeeded,
  getAllDancers,
  addDancer,
  updateDancer,
  deactivateDancer,
  deleteDancer,
  getAllMinistries,
  addMinistry,
  updateMinistry,
  deactivateMinistry,
  getAllMemberships,
  addMembership,
  updateMembership,
  removeMembership,
  canDeleteDancer,
  canDeleteMinistry,
  getMinistryLeaders,
} from './services/dataService';

import { getBirthdayInfo } from './utils/birthdayUtils';
import { normalizeGhanaPhone } from './utils/phoneUtils';
import { LEADERSHIP_ROLES } from './utils/constants';

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    localStorage.getItem('admin_authenticated') === 'true'
  );
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [notification, setNotification] = useState('');

  // Data state
  const [dancers, setDancers] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Migration state
  const [needsMigration, setNeedsMigration] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [migrationChecked, setMigrationChecked] = useState(false);

  // Dancer modal state
  const [isDancerModalOpen, setIsDancerModalOpen] = useState(false);
  const [dancerToEdit, setDancerToEdit] = useState(null);
  const [selectedDancerForDetail, setSelectedDancerForDetail] = useState(null);

  // Ministry modal state
  const [isMinistryModalOpen, setIsMinistryModalOpen] = useState(false);
  const [ministryToEdit, setMinistryToEdit] = useState(null);

  // Check DB version on startup
  useEffect(() => {
    async function checkMigration() {
      const version = await getCurrentDBVersion();
      if (version > 0 && version < 3) {
        setNeedsMigration(true);
      } else {
        // Either fresh install or already at v3
        await loadData();
      }
      setMigrationChecked(true);
    }
    checkMigration();
  }, []);

  const loadData = async () => {
    await initDB();
    await seedInitialDataIfNeeded();
    await refreshAllData();
    setDataLoaded(true);
  };

  const refreshAllData = async () => {
    const [d, m, mm] = await Promise.all([
      getAllDancers(),
      getAllMinistries(),
      getAllMemberships()
    ]);
    setDancers(d);
    setMinistries(m);
    setMemberships(mm);
  };

  // --- Migration Handlers ---
  const handleExportV2 = async () => {
    setIsExporting(true);
    try {
      const data = await exportV2Data();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GH_Dance_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
    setIsExporting(false);
  };

  const handleProceedMigration = async () => {
    setNeedsMigration(false);
    await loadData();
  };

  // --- Auth Handlers ---
  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setAdminUser(user);
    localStorage.setItem('admin_authenticated', 'true');
    localStorage.setItem('admin_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminUser(null);
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_user');
  };

  // --- Dancer CRUD ---
  const handleOpenAddDancer = () => {
    setDancerToEdit(null);
    setIsDancerModalOpen(true);
  };

  const handleOpenEditDancer = (dancer) => {
    setDancerToEdit(dancer);
    setIsDancerModalOpen(true);
  };

  const handleSaveDancer = async ({ dancerData, ministryId, roles }) => {
    let dancerId;
    const normalizedData = {
      ...dancerData,
      phone: normalizeGhanaPhone(dancerData.phone),
      whatsapp: normalizeGhanaPhone(dancerData.whatsapp || ''),
    };

    if (dancerToEdit) {
      await updateDancer(dancerToEdit.id, normalizedData);
      dancerId = dancerToEdit.id;

      // Update primary membership if ministry changed
      if (ministryId) {
        const existing = memberships.find(
          m => m.dancerId === dancerId && m.isPrimary && m.status === 'active'
        );
        if (existing) {
          await updateMembership(existing.id, {
            ministryId,
            roles: roles || existing.roles,
          });
        } else {
          await addMembership({
            dancerId,
            ministryId,
            roles: roles || ['dancer'],
            isPrimary: true,
            dateJoined: normalizedData.dateJoined || '',
            status: 'active',
          });
        }
      }
    } else {
      const newDancer = await addDancer(normalizedData);
      dancerId = newDancer.id;

      // Create membership if ministry selected
      if (ministryId) {
        await addMembership({
          dancerId,
          ministryId,
          roles: roles || ['dancer'],
          isPrimary: true,
          dateJoined: normalizedData.dateJoined || '',
          status: 'active',
        });
      }
    }

    setIsDancerModalOpen(false);
    setDancerToEdit(null);
    await refreshAllData();
    
    setNotification('Dancer registered successfully.');
    setTimeout(() => setNotification(''), 3000);
  };

  const handleDeleteDancer = async (id) => {
    const safe = canDeleteDancer(id, memberships);
    if (safe) {
      if (confirm('Are you sure you want to permanently delete this dancer record?')) {
        await deleteDancer(id);
        await refreshAllData();
      }
    } else {
      if (confirm('This dancer has active ministry memberships. Deactivate instead of delete?')) {
        await updateDancer(id, { status: 'Inactive' });
        await refreshAllData();
      }
    }
  };

  const handleToggleDancerStatus = async (dancer) => {
    const newStatus = dancer.status === 'Active' ? 'Inactive' : 'Active';
    if (confirm(`Change status of ${dancer.name} to ${newStatus}?`)) {
      await updateDancer(dancer.id, { status: newStatus });
      await refreshAllData();
    }
  };

  // --- Ministry CRUD ---
  const handleOpenAddMinistry = () => {
    setMinistryToEdit(null);
    setIsMinistryModalOpen(true);
  };

  const handleOpenEditMinistry = (ministry) => {
    setMinistryToEdit(ministry);
    setIsMinistryModalOpen(true);
  };

  const handleSaveMinistry = async ({ ministryData, leaderId, assistantLeaderId, newLeaderData, newAssistantData }) => {
    let ministryId;
    let finalLeaderId = leaderId;
    let finalAssistantId = assistantLeaderId;

    if (ministryToEdit) {
      await updateMinistry(ministryToEdit.id, ministryData);
      ministryId = ministryToEdit.id;
    } else {
      const newMinistry = await addMinistry(ministryData);
      ministryId = newMinistry.id;
    }

    if (newLeaderData) {
      const d = await addDancer({ ...newLeaderData, phone: normalizeGhanaPhone(newLeaderData.phone) });
      finalLeaderId = d.id;
    }

    if (newAssistantData) {
      const d = await addDancer({ ...newAssistantData, phone: normalizeGhanaPhone(newAssistantData.phone) });
      finalAssistantId = d.id;
    }

    // Handle leader assignment
    if (finalLeaderId) {
      const existingLeader = memberships.find(
        m => m.ministryId === ministryId && (m.roles || []).includes('ministry_leader') && m.status === 'active'
      );
      if (existingLeader && existingLeader.dancerId !== finalLeaderId) {
        // Remove old leader role
        const newRoles = (existingLeader.roles || []).filter(r => r !== 'ministry_leader');
        if (newRoles.length > 0) {
          await updateMembership(existingLeader.id, { roles: newRoles });
        } else {
          await removeMembership(existingLeader.id);
        }
      }
      // Assign new leader
      const existingMembership = memberships.find(
        m => m.ministryId === ministryId && m.dancerId === finalLeaderId && m.status === 'active'
      );
      if (existingMembership) {
        const roles = new Set(existingMembership.roles || []);
        roles.add('ministry_leader');
        roles.add('dancer');
        await updateMembership(existingMembership.id, { roles: Array.from(roles) });
      } else {
        await addMembership({
          dancerId: finalLeaderId,
          ministryId,
          roles: ['dancer', 'ministry_leader'],
          isPrimary: true,
          dateJoined: new Date().toISOString().slice(0, 10),
          status: 'active',
        });
      }
    } else {
      // Remove any existing leader if no leader selected
      const existingLeader = memberships.find(
        m => m.ministryId === ministryId && (m.roles || []).includes('ministry_leader') && m.status === 'active'
      );
      if (existingLeader) {
        const newRoles = (existingLeader.roles || []).filter(r => r !== 'ministry_leader');
        if (newRoles.length > 0) {
          await updateMembership(existingLeader.id, { roles: newRoles });
        } else {
          await removeMembership(existingLeader.id);
        }
      }
    }

    // Handle assistant assignment
    if (finalAssistantId) {
      const existingAssistant = memberships.find(
        m => m.ministryId === ministryId && (m.roles || []).includes('assistant_leader') && m.status === 'active'
      );
      if (existingAssistant && existingAssistant.dancerId !== finalAssistantId) {
        // Remove old assistant role
        const newRoles = (existingAssistant.roles || []).filter(r => r !== 'assistant_leader');
        if (newRoles.length > 0) {
          await updateMembership(existingAssistant.id, { roles: newRoles });
        } else {
          await removeMembership(existingAssistant.id);
        }
      }
      // Assign new assistant
      const existingMembership = memberships.find(
        m => m.ministryId === ministryId && m.dancerId === finalAssistantId && m.status === 'active'
      );
      if (existingMembership) {
        const roles = new Set(existingMembership.roles || []);
        roles.add('assistant_leader');
        await updateMembership(existingMembership.id, { roles: Array.from(roles) });
      } else {
        await addMembership({
          dancerId: finalAssistantId,
          ministryId,
          roles: ['dancer', 'assistant_leader'],
          isPrimary: true,
          dateJoined: new Date().toISOString().slice(0, 10),
          status: 'active',
        });
      }
    }

    setIsMinistryModalOpen(false);
    setMinistryToEdit(null);
    await refreshAllData();
  };

  const handleDeactivateMinistry = async (id) => {
    if (confirm('Deactivate this ministry? Its members will retain their records.')) {
      await deactivateMinistry(id);
      await refreshAllData();
    }
  };

  // --- Computed values ---
  const birthdaysTodayCount = dancers.filter(d =>
    getBirthdayInfo(d.birthdayDay, d.birthdayMonth).isToday
  ).length;

  const birthdaysUpcomingCount = dancers.filter(d => {
    const info = getBirthdayInfo(d.birthdayDay, d.birthdayMonth, d.birthYear);
    return info.daysUntil !== null && info.daysUntil <= 30;
  }).length;

  const leadersCount = (() => {
    const leaderDancerIds = new Set();
    memberships.forEach(m => {
      if (m.status === 'active' && (m.roles || []).some(r => LEADERSHIP_ROLES.includes(r))) {
        leaderDancerIds.add(m.dancerId);
      }
    });
    return leaderDancerIds.size;
  })();

  // --- Render ---
  if (!migrationChecked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4f46e5', marginBottom: '0.5rem' }}>GH Dance Ministers</div>
          <div style={{ color: '#64748b' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (needsMigration) {
    return (
      <MigrationWarning
        onExport={handleExportV2}
        onProceed={handleProceedMigration}
        isExporting={isExporting}
      />
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => { setActiveTab(tab); setSearchTerm(''); }}
        counts={{
          dancers: dancers.filter(d => d.status === 'active').length,
          ministries: ministries.filter(m => m.status === 'active').length,
          leaders: leadersCount,
          birthdaysToday: birthdaysTodayCount,
          birthdaysUpcoming: birthdaysUpcomingCount
        }}
        adminUser={adminUser}
        onLogout={handleLogout}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="main-wrapper">
        <Header
          activeTab={activeTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onOpenAddDancer={handleOpenAddDancer}
          onOpenAddMinistry={handleOpenAddMinistry}
          toggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
          birthdayNotificationsCount={birthdaysTodayCount}
        />

        <main className="page-content">
          {activeTab === 'dashboard' && (
            <Dashboard
              dancers={dancers}
              ministries={ministries}
              memberships={memberships}
              adminUser={adminUser}
              onViewDancer={(d) => setSelectedDancerForDetail(d)}
              onNavigateToBirthdays={() => setActiveTab('birthdays')}
              onNavigateToDancers={() => { setActiveTab('dancers'); }}
              onRegisterNewDancer={handleOpenAddDancer}
            />
          )}

          {activeTab === 'dancers' && (
            <Dancers
              dancers={dancers}
              ministries={ministries}
              memberships={memberships}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onViewDancer={(d) => setSelectedDancerForDetail(d)}
              onEditDancer={handleOpenEditDancer}
              onDeleteDancer={handleDeleteDancer}
              onToggleDancerStatus={handleToggleDancerStatus}
              onOpenAddDancer={handleOpenAddDancer}
            />
          )}

          {activeTab === 'birthdays' && (
            <Birthdays
              dancers={dancers}
              memberships={memberships}
              ministries={ministries}
              onViewDancer={(d) => setSelectedDancerForDetail(d)}
            />
          )}

          {activeTab === 'ministries' && (
            <Ministries
              ministries={ministries}
              dancers={dancers}
              memberships={memberships}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onAddMinistry={handleOpenAddMinistry}
              onEditMinistry={handleOpenEditMinistry}
              onViewMinistry={(m) => { handleOpenEditMinistry(m); }}
              onDeleteMinistry={handleDeactivateMinistry}
            />
          )}

          {activeTab === 'leaders' && (
            <Leaders
              dancers={dancers}
              ministries={ministries}
              memberships={memberships}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}

          {activeTab === 'import' && (
            <ExcelImport
              onImportComplete={refreshAllData}
              ministries={ministries}
              dancers={dancers}
            />
          )}

          {activeTab === 'reports' && (
            <Reports
              dancers={dancers}
              ministries={ministries}
              memberships={memberships}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              dancers={dancers}
              ministries={ministries}
              memberships={memberships}
              onRefreshData={refreshAllData}
            />
          )}
        </main>
      </div>

      {/* Dancer Add/Edit Modal */}
      <DancerModal
        isOpen={isDancerModalOpen}
        onClose={() => { setIsDancerModalOpen(false); setDancerToEdit(null); }}
        onSave={handleSaveDancer}
        dancerToEdit={dancerToEdit}
        ministries={ministries}
        memberships={memberships}
        dancers={dancers}
        onAddMinistry={() => {
          setIsDancerModalOpen(false);
          setIsMinistryModalOpen(true);
        }}
      />

      {/* Ministry Add/Edit Modal */}
      <MinistryModal
        isOpen={isMinistryModalOpen}
        onClose={() => { setIsMinistryModalOpen(false); setMinistryToEdit(null); }}
        onSave={handleSaveMinistry}
        ministryToEdit={ministryToEdit}
        ministries={ministries}
        dancers={dancers}
        memberships={memberships}
        onAddDancer={handleOpenAddDancer}
      />

      {/* Dancer Detail Modal */}
      <DancerDetailModal
        isOpen={!!selectedDancerForDetail}
        onClose={() => setSelectedDancerForDetail(null)}
        dancer={selectedDancerForDetail}
        ministries={ministries}
        memberships={memberships}
        onEdit={(d) => { setSelectedDancerForDetail(null); handleOpenEditDancer(d); }}
      />
      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          background: '#10b981',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 9999,
          fontWeight: 500
        }}>
          {notification}
        </div>
      )}
    </div>
  );
}
