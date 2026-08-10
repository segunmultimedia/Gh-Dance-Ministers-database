import React, { useState } from 'react';
import { Settings as SettingsIcon, Download, Upload, RefreshCw, Shield, Database, Save, Check } from 'lucide-react';
import { clearAllData, seedInitialDataIfNeeded } from '../services/db';

export default function Settings({ members, files, onRefreshData }) {
  const [orgName, setOrgName] = useState('Gh Dance Database');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Backup Database to JSON
  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      organization: orgName,
      members,
      files: files.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type,
        size: f.size,
        uploadDate: f.uploadDate,
        category: f.category
      }))
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Organization_Database_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset to sample seed data
  const handleResetData = async () => {
    if (confirm('Are you sure you want to reset the database to initial sample data? This will overwrite recent edits.')) {
      await clearAllData();
      await seedInitialDataIfNeeded();
      await onRefreshData();
      alert('Database reset successfully!');
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div>
      {/* Banner */}
      <div 
        className="hero-banner"
        style={{ 
          background: 'linear-gradient(135deg, #334155 0%, #1e293b 50%, #0f172a 100%)',
          boxShadow: '0 8px 24px -4px rgba(30, 41, 59, 0.3)'
        }}
      >
        <div className="hero-text">
          <h2>⚙️ System Settings & Data Storage</h2>
          <p>Manage organization profile, backup local database, and configure preferences.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Organization Preferences */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} className="text-primary" /> Organization Profile
          </h3>

          <form onSubmit={handleSaveSettings}>
            <div className="form-group">
              <label className="form-label">Organization Name</label>
              <input
                type="text"
                className="form-control"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Database Mode</label>
              <input
                type="text"
                className="form-control"
                value="Browser IndexedDB (Offline & Persistent)"
                disabled
                style={{ background: '#f1f5f9', color: '#64748b' }}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              {savedSuccess ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
            </button>
          </form>
        </div>

        {/* Database Backup & Maintenance */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={20} className="text-primary" /> Database Backup & Maintenance
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Export Full Backup</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Download JSON file containing all member records</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleExportBackup}>
                <Download size={14} /> Export JSON
              </button>
            </div>

            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#be123c' }}>Reset Seed Data</strong>
                <span style={{ fontSize: '0.8rem', color: '#9f1239' }}>Restore fresh default sample records</span>
              </div>
              <button className="btn btn-danger btn-sm" onClick={handleResetData}>
                <RefreshCw size={14} /> Reset Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
