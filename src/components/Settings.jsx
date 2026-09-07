import React from 'react';
import { exportAllData, clearAllData } from '../services/dataService';
import { Settings as SettingsIcon, Database, Download, Trash2, AlertTriangle, RefreshCw, HardDrive, Shield } from 'lucide-react';

export default function Settings({ dancers, ministries, memberships, onRefreshData }) {
  
  const handleExportData = async () => {
    try {
      const jsonData = await exportAllData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gh_dance_database_backup_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data.");
    }
  };

  const handleClearData = async () => {
    const confirm1 = window.confirm("WARNING: This action cannot be undone. All dancers, ministries, and memberships will be permanently deleted. Are you sure you want to proceed?");
    if (confirm1) {
      const confirm2 = window.prompt("Type 'DELETE' to confirm clearing all data:");
      if (confirm2 === 'DELETE') {
        try {
          await clearAllData();
          if (onRefreshData) onRefreshData();
          alert("All data has been cleared successfully.");
        } catch (error) {
          console.error("Error clearing data:", error);
          alert("Failed to clear data.");
        }
      } else {
        alert("Action cancelled.");
      }
    }
  };

  const handleRefresh = () => {
    if (onRefreshData) onRefreshData();
  };

  return (
    <div className="d-flex flex-column gap-4">
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Settings & Data Management</h1>
          <p className="page-header-subtitle">
            Manage your local database, backups, and application preferences.
          </p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Database Overview */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Database size={20} style={{ color: '#9ca3af' }} /> Database Overview</h3>
          </div>
          <div className="clean-list">
            <div className="d-flex justify-content-between py-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-muted">Total Dancers</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{dancers?.length || 0}</span>
            </div>
            <div className="d-flex justify-content-between py-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-muted">Total Ministries</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{ministries?.length || 0}</span>
            </div>
            <div className="d-flex justify-content-between py-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-muted">Total Memberships</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{memberships?.length || 0}</span>
            </div>
            <div className="d-flex justify-content-between py-3">
              <span className="text-muted">Database Version</span>
              <span className="badge badge-subtle">v3</span>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Shield size={20} style={{ color: '#9ca3af' }} /> System Information</h3>
          </div>
          <div className="clean-list">
            <div className="d-flex justify-content-between py-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-muted">App Name</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>GH Dance Ministers Database</span>
            </div>
            <div className="d-flex justify-content-between py-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-muted">Version</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Phase 1 (Local)</span>
            </div>
            <div className="d-flex justify-content-between py-3">
              <span className="text-muted">Storage</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>IndexedDB (Browser)</span>
            </div>
            <div className="mt-3 p-3" style={{ background: '#f8fafc', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <strong>Note:</strong> Phase 2 will include Supabase cloud database, authentication, and multi-admin access.
            </div>
          </div>
        </div>

        {/* Export & Backup */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><HardDrive size={20} style={{ color: '#9ca3af' }} /> Export & Backup</h3>
          </div>
          <div className="mt-2">
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Download a complete JSON backup of all dancers, ministries, memberships, and import history. Keep this safe.
            </p>
            <button className="btn btn-primary" onClick={handleExportData} style={{ width: '100%', padding: '0.85rem' }}>
              <Download size={18} /> Export Full Database Backup
            </button>
          </div>
        </div>

        {/* Data Management (Destructive) */}
        <div className="card" style={{ border: '1px solid #fecdd3' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'var(--danger-text)' }}><AlertTriangle size={20} /> Danger Zone</h3>
          </div>
          <div className="mt-2">
            <button className="btn btn-secondary mb-4" onClick={handleRefresh} style={{ width: '100%', padding: '0.85rem' }}>
              <RefreshCw size={18} /> Refresh Local Data
            </button>
            <div style={{ padding: '1.25rem', backgroundColor: '#fff1f2', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
              <p style={{ color: '#be123c', margin: '0 0 1.25rem 0', fontSize: '0.85rem', fontWeight: 500 }}>
                <strong>WARNING:</strong> This action cannot be undone. All dancers, ministries, and memberships will be permanently deleted from this browser.
              </p>
              <button className="btn btn-danger" onClick={handleClearData} style={{ width: '100%', padding: '0.85rem', background: '#e11d48', color: 'white', border: 'none' }}>
                <Trash2 size={18} /> Clear All Data
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
