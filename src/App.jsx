import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Birthdays from './components/Birthdays';
import Leaders from './components/Leaders';
import FileManager from './components/FileManager';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Login from './components/Login';
import MemberModal from './components/MemberModal';
import MemberDetailModal from './components/MemberDetailModal';
import LeaderModal from './components/LeaderModal';
import FlyerStudio from './components/FlyerStudio';

import { 
  seedInitialDataIfNeeded, 
  getAllMembers, 
  addMember, 
  updateMember, 
  deleteMember, 
  getAllLeaders,
  addLeader,
  updateLeader,
  deleteLeader,
  getAllFiles, 
  saveFile, 
  deleteFile 
} from './services/db';

import { getBirthdayStatus } from './utils/birthdayUtils';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin_authenticated') === 'true';
  });
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Modals state
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState(null);

  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);
  const [leaderToEdit, setLeaderToEdit] = useState(null);

  // Load Data on startup
  useEffect(() => {
    async function loadData() {
      await seedInitialDataIfNeeded();
      await refreshAllData();
    }
    loadData();
  }, []);

  const refreshAllData = async () => {
    const loadedMembers = await getAllMembers();
    const loadedLeaders = await getAllLeaders();
    const loadedFiles = await getAllFiles();
    setMembers(loadedMembers);
    setLeaders(loadedLeaders);
    setFiles(loadedFiles);
  };

  // Auth Handlers
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

  // Member CRUD Handlers
  const handleOpenAddMember = () => {
    setMemberToEdit(null);
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMember = (member) => {
    setMemberToEdit(member);
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = async (formData) => {
    if (memberToEdit) {
      await updateMember(memberToEdit.id, formData);
    } else {
      await addMember(formData);
    }
    setIsMemberModalOpen(false);
    setMemberToEdit(null);
    await refreshAllData();
  };

  const handleDeleteMember = async (id) => {
    if (confirm('Are you sure you want to delete this member record?')) {
      await deleteMember(id);
      await refreshAllData();
    }
  };

  // Leader CRUD Handlers
  const handleOpenAddLeader = () => {
    setLeaderToEdit(null);
    setIsLeaderModalOpen(true);
  };

  const handleOpenEditLeader = (leader) => {
    setLeaderToEdit(leader);
    setIsLeaderModalOpen(true);
  };

  const handleSaveLeader = async (formData) => {
    if (leaderToEdit) {
      await updateLeader(leaderToEdit.id, formData);
    } else {
      await addLeader(formData);
    }
    setIsLeaderModalOpen(false);
    setLeaderToEdit(null);
    await refreshAllData();
  };

  const handleDeleteLeader = async (id) => {
    if (confirm('Are you sure you want to delete this group leader record?')) {
      await deleteLeader(id);
      await refreshAllData();
    }
  };

  // File Upload Handlers
  const handleUploadFile = async (file) => {
    await saveFile(file);
    await refreshAllData();
  };

  const handleDeleteFile = async (id) => {
    if (confirm('Are you sure you want to delete this file document?')) {
      await deleteFile(id);
      await refreshAllData();
    }
  };

  // Count Birthdays Today for Sidebar/Header notifications
  const birthdaysTodayCount = members.filter(m => getBirthdayStatus(m.dob).status === 'today').length;

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={{
          members: members.length,
          leaders: leaders.length,
          files: files.length,
          birthdaysToday: birthdaysTodayCount
        }}
        adminUser={adminUser}
        onLogout={handleLogout}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Workspace */}
      <div className="main-wrapper">
        <Header
          activeTab={activeTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onOpenAddMember={handleOpenAddMember}
          onOpenUploadFile={() => setActiveTab('files')}
          toggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
          birthdayNotificationsCount={birthdaysTodayCount}
        />

        <main className="page-content">
          {activeTab === 'dashboard' && (
            <Dashboard
              members={members}
              files={files}
              onViewMember={(m) => setSelectedMemberForDetail(m)}
              onEditMember={handleOpenEditMember}
              onDeleteMember={handleDeleteMember}
              onOpenAddMember={handleOpenAddMember}
              onNavigateToBirthdays={() => setActiveTab('birthdays')}
            />
          )}

          {activeTab === 'members' && (
            <Members
              members={members}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onViewMember={(m) => setSelectedMemberForDetail(m)}
              onEditMember={handleOpenEditMember}
              onDeleteMember={handleDeleteMember}
              onOpenAddMember={handleOpenAddMember}
            />
          )}

          {activeTab === 'birthdays' && (
            <Birthdays
              members={members}
              onViewMember={(m) => setSelectedMemberForDetail(m)}
            />
          )}

          {activeTab === 'leaders' && (
            <Leaders
              leaders={leaders}
              members={members}
              onOpenAddLeader={handleOpenAddLeader}
              onEditLeader={handleOpenEditLeader}
              onDeleteLeader={handleDeleteLeader}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}

          {activeTab === 'flyer' && (
            <FlyerStudio
              members={members}
              leaders={leaders}
            />
          )}

          {activeTab === 'files' && (
            <FileManager
              files={files}
              onUploadFile={handleUploadFile}
              onDeleteFile={handleDeleteFile}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}

          {activeTab === 'reports' && (
            <Reports
              members={members}
              files={files}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              members={members}
              files={files}
              onRefreshData={refreshAllData}
            />
          )}
        </main>
      </div>

      {/* Add / Edit Member Modal */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => { setIsMemberModalOpen(false); setMemberToEdit(null); }}
        onSave={handleSaveMember}
        memberToEdit={memberToEdit}
      />

      {/* Add / Edit Group Leader Modal */}
      <LeaderModal
        isOpen={isLeaderModalOpen}
        onClose={() => { setIsLeaderModalOpen(false); setLeaderToEdit(null); }}
        onSave={handleSaveLeader}
        leaderToEdit={leaderToEdit}
        members={members}
      />

      {/* Detailed Member Profile Drawer Modal */}
      <MemberDetailModal
        isOpen={!!selectedMemberForDetail}
        onClose={() => setSelectedMemberForDetail(null)}
        member={selectedMemberForDetail}
        onEdit={(m) => { setSelectedMemberForDetail(null); handleOpenEditMember(m); }}
      />
    </div>
  );
}
