import React, { useState, useRef } from 'react';
import { 
  FolderKanban, 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  Download, 
  Trash2, 
  Search, 
  CheckCircle2, 
  File, 
  HardDrive,
  Eye,
  AlertCircle
} from 'lucide-react';

export default function FileManager({ files, onUploadFile, onDeleteFile, searchTerm, setSearchTerm }) {
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'PDF', 'EXCEL'
  const fileInputRef = useRef(null);

  // File Upload Dropzone Handler
  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file) => {
    // Validate file type
    const nameLower = file.name.toLowerCase();
    const isPdf = nameLower.endsWith('.pdf');
    const isExcel = nameLower.endsWith('.xls') || nameLower.endsWith('.xlsx') || nameLower.endsWith('.csv');

    if (!isPdf && !isExcel) {
      alert('Please upload PDF (.pdf) or Excel (.xlsx, .xls, .csv) files.');
      return;
    }

    onUploadFile(file);
  };

  // Trigger File Download from Blob
  const handleDownloadFile = (fileRecord) => {
    try {
      let blob = fileRecord.data;

      // If stored data is Base64 string fallback
      if (typeof blob === 'string') {
        const byteCharacters = atob(blob.split(',')[1] || blob);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: fileRecord.type });
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileRecord.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not download file: ' + err.message);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Filter files logic
  const filteredFiles = files.filter(f => {
    const searchMatch = !searchTerm || f.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const nameLower = f.name.toLowerCase();
    const isPdf = nameLower.endsWith('.pdf');
    const isExcel = nameLower.endsWith('.xls') || nameLower.endsWith('.xlsx') || nameLower.endsWith('.csv');

    if (filterType === 'PDF') return searchMatch && isPdf;
    if (filterType === 'EXCEL') return searchMatch && isExcel;
    return searchMatch;
  });

  return (
    <div>
      {/* Top Banner */}
      <div 
        className="hero-banner" 
        style={{ 
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)',
          boxShadow: '0 8px 24px -4px rgba(3, 105, 161, 0.3)'
        }}
      >
        <div className="hero-text">
          <h2>📂 Organization File & Document Management</h2>
          <p>Upload, organize, store, and download official PDF and Excel documents securely.</p>
        </div>
        <button 
          className="btn-hero" 
          style={{ color: '#0369a1' }} 
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={18} />
          <span>Upload File</span>
        </button>
      </div>

      {/* Drag and Drop Uploader Box */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div 
          className="dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".pdf,.xls,.xlsx,.csv" 
            style={{ display: 'none' }} 
            onChange={handleFileChange} 
          />
          <div style={{ background: '#e0f2fe', color: '#0284c7', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <Upload size={28} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Drag & Drop PDF or Excel files here
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Supports PDF (.pdf) and Excel (.xls, .xlsx, .csv) documents up to 25MB
          </p>
          <button type="button" className="btn btn-secondary btn-sm">
            Browse Computer Files
          </button>
        </div>
      </div>

      {/* Files Filter & Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Stored Documents ({filteredFiles.length})</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Managed files available for instant download</p>
          </div>

          <div className="tabs-bar" style={{ marginBottom: 0 }}>
            <button className={`tab-item ${filterType === 'ALL' ? 'active' : ''}`} onClick={() => setFilterType('ALL')}>
              All Files ({files.length})
            </button>
            <button className={`tab-item ${filterType === 'PDF' ? 'active' : ''}`} onClick={() => setFilterType('PDF')}>
              PDF Documents
            </button>
            <button className={`tab-item ${filterType === 'EXCEL' ? 'active' : ''}`} onClick={() => setFilterType('EXCEL')}>
              Excel Spreadsheets
            </button>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>File Type</th>
                <th>Upload Date</th>
                <th>File Size</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No files found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => {
                  const isPdf = file.name.toLowerCase().endsWith('.pdf');
                  return (
                    <tr key={file.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div 
                            style={{ 
                              width: '38px', 
                              height: '38px', 
                              borderRadius: '8px', 
                              background: isPdf ? '#fee2e2' : '#dcfce7', 
                              color: isPdf ? '#dc2626' : '#16a34a',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800
                            }}
                          >
                            {isPdf ? <FileText size={20} /> : <FileSpreadsheet size={20} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{file.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{file.category || (isPdf ? 'PDF File' : 'Excel Sheet')}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`badge ${isPdf ? 'badge-danger' : 'badge-success'}`}>
                          {isPdf ? 'PDF' : 'EXCEL'}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {new Date(file.uploadDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {formatFileSize(file.size)}
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button className="btn btn-primary btn-sm" onClick={() => handleDownloadFile(file)}>
                            <Download size={14} /> Download
                          </button>
                          <button 
                            className="btn btn-secondary btn-icon btn-sm" 
                            style={{ color: '#ef4444' }} 
                            title="Delete File" 
                            onClick={() => onDeleteFile(file.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
