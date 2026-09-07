import React from 'react';
import { AlertTriangle, Info, Download, ArrowRight } from 'lucide-react';

export default function MigrationWarning({ onExport, onProceed, isExporting }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706' }}>
            <AlertTriangle size={24} />
            <h2 className="modal-title m-0">Database Upgrade Required</h2>
          </div>
        </div>
        
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0 }}>
            Your database structure is being upgraded to support the new Dance Ministry features. 
            Existing records will be migrated automatically.
          </p>
          
          <div style={{ backgroundColor: '#eff6ff', padding: '0.75rem', borderRadius: '0.375rem', display: 'flex', gap: '0.75rem', color: '#1e40af' }}>
            <Info size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0, fontSize: '0.875rem' }}>
              We strongly recommend downloading a backup of your current data before proceeding.
            </p>
          </div>
          
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
            Your existing data will be preserved and migrated to the new format.
          </p>
        </div>
        
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
          <button 
            className="btn btn-secondary"
            onClick={onExport}
            disabled={isExporting}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Download size={18} />
            <span>{isExporting ? 'Exporting...' : 'Export Backup (JSON)'}</span>
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={onProceed}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span>Proceed with Upgrade</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
