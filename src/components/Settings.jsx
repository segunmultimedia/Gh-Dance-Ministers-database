import React from 'react';
import { exportAllData, clearAllData } from '../services/dataService';
import { Database, Download, Trash2, AlertTriangle, RefreshCw, HardDrive, Shield } from 'lucide-react';

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
    <div className="page-content">
      <div className="settings-page">
        <p className="sp-description">
          Manage your local database, backups and application preferences.
        </p>

        {/* Database Overview */}
        <div className="card sp-section">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={18} className="text-muted" /> Database Overview
            </h3>
          </div>
          <div className="sp-grid-4" style={{ padding: 0 }}>
            <div className="sp-stat-card">
              <div className="sp-stat-label">Total Dancers</div>
              <div className="sp-stat-value">{dancers?.length || 0}</div>
            </div>
            <div className="sp-stat-card">
              <div className="sp-stat-label">Total Ministries</div>
              <div className="sp-stat-value">{ministries?.length || 0}</div>
            </div>
            <div className="sp-stat-card">
              <div className="sp-stat-label">Total Memberships</div>
              <div className="sp-stat-value">{memberships?.length || 0}</div>
            </div>
            <div className="sp-stat-card">
              <div className="sp-stat-label">Database Version</div>
              <div className="sp-stat-value" style={{ fontSize: '1rem', marginTop: '0.5rem' }}>
                <span className="badge badge-blue">v3</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="card sp-section">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} className="text-muted" /> System Information
            </h3>
          </div>
          <div>
            <div className="sp-list-row">
              <span className="sp-list-label">Application Name</span>
              <span className="sp-list-value">GH Dance Ministers Database</span>
            </div>
            <div className="sp-list-row">
              <span className="sp-list-label">Version</span>
              <span className="sp-list-value">Phase 1 (Local)</span>
            </div>
            <div className="sp-list-row">
              <span className="sp-list-label">Storage</span>
              <span className="sp-list-value">IndexedDB (Browser)</span>
            </div>
          </div>
          <div className="sp-note">
            Cloud database, authentication and shared administrator access are planned for Phase 2.
          </div>
        </div>

        {/* Export & Backup */}
        <div className="card sp-section">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HardDrive size={18} className="text-muted" /> Export & Backup
            </h3>
          </div>
          <div className="card-body">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Download a complete JSON backup of dancers, ministries, memberships and import history. Store the file securely.
            </p>
            <button className="btn btn-primary" onClick={handleExportData}>
              <Download size={16} /> Export Database Backup
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card sp-section sp-danger-zone">
          <div className="card-header">
            <h3 className="card-title sp-danger-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} /> Danger Zone
            </h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Refresh Local Data</h4>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>
                Reload all data from the database. This does not delete any records.
              </p>
              <div>
                <button className="btn btn-secondary" onClick={handleRefresh}>
                  <RefreshCw size={16} /> Refresh Data
                </button>
              </div>
            </div>

            <div style={{ height: '1px', background: '#fecaca', margin: '0.5rem 0' }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Clear All Data</h4>
              <p style={{ color: 'var(--danger-hover)', margin: 0, fontSize: '0.85rem' }}>
                This will permanently delete all dancers, ministries, and memberships from this browser. This action cannot be undone.
              </p>
              <div>
                <button className="btn sp-btn-outline-danger" onClick={handleClearData}>
                  <Trash2 size={16} /> Clear All Data
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
