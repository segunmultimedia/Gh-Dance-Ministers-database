import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { normalizeGhanaPhone, isValidGhanaPhone, phonesMatch } from '../utils/phoneUtils';
import { hashFile } from '../utils/imageUtils';
import { addDancer, addMinistry, addMembership, addImportRecord, findImportByHash, getImportHistory } from '../services/dataService';
import { DANCER_TYPES, GHANA_REGIONS } from '../utils/constants';
import { 
  Upload, FileSpreadsheet, CheckCircle2, AlertCircle, XCircle, 
  ArrowRight, ArrowLeft, Download, History, RefreshCw, Search, 
  Trash2, Edit3 
} from 'lucide-react';

export default function ExcelImport({ onImportComplete, ministries, dancers }) {
  const [step, setStep] = useState(1);
  const [parsedRows, setParsedRows] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [validatedRows, setValidatedRows] = useState([]);
  const [importResults, setImportResults] = useState(null);
  const [importHistory, setImportHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [filter, setFilter] = useState('All');
  const [importing, setImporting] = useState(false);

  const loadHistory = async () => {
    const history = await getImportHistory();
    setImportHistory(history || []);
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert('Please upload a valid Excel or CSV file.');
      return;
    }

    try {
      const hash = await hashFile(file);
      setFileInfo({ name: file.name, hash, file });
      
      const previousImport = await findImportByHash(hash);
      if (previousImport) {
        const proceed = window.confirm(`This file was previously imported on ${new Date(previousImport.date).toLocaleDateString()}. Import again?`);
        if (!proceed) return;
      }

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      
      if (json.length === 0) {
        alert('The uploaded file is empty.');
        return;
      }

      setParsedRows(json);
      
      // Auto-detect columns
      const headers = Object.keys(json[0]);
      const initialMapping = {};
      headers.forEach(header => {
        const lower = header.toLowerCase().trim();
        if (['name', 'full name'].includes(lower)) initialMapping[header] = 'name';
        else if (['phone', 'tel', 'mobile'].includes(lower)) initialMapping[header] = 'phone';
        else if (['whatsapp', 'wa', 'wa number'].includes(lower)) initialMapping[header] = 'whatsapp';
        else if (['ministry', 'group', 'dance group'].includes(lower)) initialMapping[header] = 'ministry';
        else if (['email'].includes(lower)) initialMapping[header] = 'email';
        else if (['gender', 'sex'].includes(lower)) initialMapping[header] = 'gender';
        else if (['town', 'city'].includes(lower)) initialMapping[header] = 'town';
        else if (['region'].includes(lower)) initialMapping[header] = 'region';
        else if (['church'].includes(lower)) initialMapping[header] = 'church';
      });
      
      setColumnMapping(initialMapping);
      setStep(2);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please ensure it is a valid Excel or CSV file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleMapContinue = () => {
    // Validate mapping
    const values = Object.values(columnMapping);
    if (!values.includes('name')) {
      alert('You must map at least one column to "Name".');
      return;
    }

    // Validate rows
    const validated = parsedRows.map((row, index) => {
      const mappedData = {};
      Object.keys(columnMapping).forEach(sourceCol => {
        const targetField = columnMapping[sourceCol];
        if (targetField && targetField !== 'skip') {
          mappedData[targetField] = row[sourceCol];
        }
      });

      const errors = [];
      let status = 'valid';
      
      if (!mappedData.name || String(mappedData.name).trim() === '') {
        errors.push('Name is required');
        status = 'error';
      }

      if (!mappedData.phone || String(mappedData.phone).trim() === '') {
        errors.push('Phone is required');
        status = 'error';
      } else {
        const phoneStr = String(mappedData.phone).trim();
        mappedData.phone = normalizeGhanaPhone(phoneStr);
        if (!isValidGhanaPhone(mappedData.phone)) {
          errors.push('Invalid Ghana phone format');
          if (status !== 'error') status = 'warning';
        }
      }

      // Check duplicates
      if (mappedData.phone) {
        const isDuplicate = dancers.some(d => phonesMatch(d.phone, mappedData.phone) || phonesMatch(d.whatsapp, mappedData.phone));
        if (isDuplicate) {
          errors.push('Duplicate phone number found in database');
          status = 'duplicate';
        }
      }

      let ministryMatch = null;
      let ministryName = mappedData.ministry ? String(mappedData.ministry).trim() : '';
      if (ministryName) {
        const match = ministries.find(m => m.name.toLowerCase().includes(ministryName.toLowerCase()));
        if (match) {
          ministryMatch = match;
        } else {
          errors.push('New ministry will need to be created');
          if (status === 'valid') status = 'warning';
        }
      }

      return {
        originalRow: index,
        data: mappedData,
        status,
        errors,
        ministryMatch,
        ministryName,
        createMinistry: !ministryMatch && ministryName ? true : false,
        include: status !== 'error' && status !== 'duplicate'
      };
    });

    setValidatedRows(validated);
    setStep(3);
  };

  const handleImport = async () => {
    setImporting(true);
    let imported = 0;
    let skipped = 0;
    let duplicates = 0;
    let failed = 0;

    const rowsToProcess = validatedRows.filter(r => r.include);
    skipped = validatedRows.length - rowsToProcess.length;
    
    // Count non-included types
    validatedRows.forEach(r => {
      if (!r.include) {
        if (r.status === 'duplicate') duplicates++;
        else if (r.status === 'error') failed++;
        // already counted in skipped, adjust if needed, but we separate reasons
      }
    });

    for (const row of rowsToProcess) {
      try {
        const newDancerId = await addDancer({
          name: row.data.name || '',
          phone: row.data.phone || '',
          whatsapp: row.data.whatsapp || '',
          email: row.data.email || '',
          gender: row.data.gender || '',
          town: row.data.town || '',
          region: row.data.region || '',
          church: row.data.church || '',
          dancerType: row.data.dancerType || '',
          status: 'Active',
          allowBirthdayPublication: true,
          allowPhotoPublication: true,
          notes: 'Imported via Excel'
        });

        let memMinistryId = row.ministryMatch ? row.ministryMatch.id : null;
        if (row.createMinistry && row.ministryName) {
           const newMin = await addMinistry({ name: row.ministryName, status: 'active' });
           memMinistryId = newMin.id;
        }

        if (memMinistryId && newDancerId) {
          await addMembership({
            dancerId: newDancerId,
            ministryId: memMinistryId,
            roles: ['dancer'],
            isPrimary: true,
            status: 'active'
          });
        }
        
        imported++;
      } catch (err) {
        console.error('Failed to import row', row, err);
        failed++;
      }
    }

    const results = { imported, skipped, duplicates, failed, total: validatedRows.length };
    setImportResults(results);
    
    if (fileInfo && fileInfo.hash) {
      await addImportRecord({
        fileName: fileInfo.name,
        fileHash: fileInfo.hash,
        results,
        date: new Date().toISOString()
      });
    }

    if (onImportComplete) {
      onImportComplete();
    }
    
    setStep(4);
    setImporting(false);
  };

  const toggleHistory = () => {
    if (!showHistory) {
      loadHistory();
    }
    setShowHistory(!showHistory);
  };

  const resetImport = () => {
    setStep(1);
    setParsedRows([]);
    setColumnMapping({});
    setValidatedRows([]);
    setImportResults(null);
    setFileInfo(null);
    setShowHistory(false);
  };

  const renderStep1 = () => (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', marginBottom: '1rem' }}>
          <Upload size={32} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Upload Excel Data</h2>
        <p style={{ color: 'var(--text-muted)' }}>Import dancers and leaders from an existing spreadsheet (.xlsx, .xls, .csv)</p>
      </div>

      <div 
        onDrop={handleFileDrop} 
        onDragOver={handleDragOver}
        style={{ 
          border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '4rem 2rem', 
          backgroundColor: '#f8fafc', cursor: 'pointer', transition: 'all 0.2s',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
        }}
        onClick={() => document.getElementById('file-upload').click()}
      >
        <div style={{ padding: '1rem', backgroundColor: '#e0e7ff', borderRadius: '50%', color: '#4f46e5' }}>
          <Upload size={32} />
        </div>
        <h3 style={{ margin: 0, color: '#1e293b' }}>Click or drag file to this area to upload</h3>
        <p style={{ margin: 0, color: '#64748b' }}>Support for a single or bulk upload. Strictly .xlsx, .xls, .csv</p>
        <input 
          id="file-upload" 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          style={{ display: 'none' }} 
          onChange={handleFileDrop} 
        />
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem', color: '#94a3b8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileSpreadsheet size={20} />
          <span>Excel/CSV Supported</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5 }}>
          <Upload size={20} />
          <span>PDF Import — Coming Soon</span>
        </div>
      </div>

      <div style={{ marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={toggleHistory}>
          <History size={16} /> View Import History
        </button>
      </div>

      {showHistory && (
        <div style={{ marginTop: '2rem', textAlign: 'left' }}>
          <h3 style={{ marginBottom: '1rem' }}>Previous Imports</h3>
          {importHistory.length === 0 ? (
            <p className="text-muted">No import history found.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Date</th>
                    <th>Imported</th>
                    <th>Skipped</th>
                    <th>Duplicates</th>
                    <th>Failed</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {importHistory.map((hist, i) => (
                    <tr key={i}>
                      <td>{hist.fileName}</td>
                      <td>{new Date(hist.date).toLocaleString()}</td>
                      <td style={{ color: '#10b981' }}>{hist.results?.imported || 0}</td>
                      <td style={{ color: '#64748b' }}>{hist.results?.skipped || 0}</td>
                      <td style={{ color: '#f59e0b' }}>{hist.results?.duplicates || 0}</td>
                      <td style={{ color: '#ef4444' }}>{hist.results?.failed || 0}</td>
                      <td>{hist.results?.total || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => {
    const headers = parsedRows.length > 0 ? Object.keys(parsedRows[0]) : [];
    const previewRows = parsedRows.slice(0, 3);
    
    const targetOptions = [
      { value: 'skip', label: '-- Skip Column --' },
      { value: 'name', label: 'Name' },
      { value: 'phone', label: 'Phone' },
      { value: 'whatsapp', label: 'WhatsApp' },
      { value: 'email', label: 'Email' },
      { value: 'ministry', label: 'Ministry' },
      { value: 'gender', label: 'Gender' },
      { value: 'birthdayDay', label: 'Birthday Day' },
      { value: 'birthdayMonth', label: 'Birthday Month' },
      { value: 'birthYear', label: 'Birth Year' },
      { value: 'town', label: 'Town' },
      { value: 'region', label: 'Region' },
      { value: 'church', label: 'Church' },
      { value: 'dancerType', label: 'Dancer Type' },
      { value: 'notes', label: 'Notes' }
    ];

    return (
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileSpreadsheet /> Column Mapping
        </h2>
        <p className="text-muted">Map your file columns to the correct database fields.</p>

        <div className="table-wrapper" style={{ margin: '2rem 0' }}>
          <table className="data-table" style={{ width: '100%', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                {headers.map(header => (
                  <th key={header} style={{ padding: '1rem' }}>
                    <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>{header}</div>
                    <select 
                      className="form-control"
                      value={columnMapping[header] || 'skip'}
                      onChange={(e) => setColumnMapping({...columnMapping, [header]: e.target.value})}
                    >
                      {targetOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, i) => (
                <tr key={i}>
                  {headers.map(header => (
                    <td key={header} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={() => setStep(1)}>
            <ArrowLeft size={16} /> Back
          </button>
          <button className="btn btn-primary" onClick={handleMapContinue}>
            Continue <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    const validCount = validatedRows.filter(r => r.status === 'valid').length;
    const warningCount = validatedRows.filter(r => r.status === 'warning').length;
    const errorCount = validatedRows.filter(r => r.status === 'error').length;
    const duplicateCount = validatedRows.filter(r => r.status === 'duplicate').length;
    const includedCount = validatedRows.filter(r => r.include).length;

    const filteredRows = validatedRows.filter(r => {
      if (filter === 'All') return true;
      if (filter === 'Valid') return r.status === 'valid';
      if (filter === 'Warnings') return r.status === 'warning';
      if (filter === 'Errors') return r.status === 'error';
      if (filter === 'Duplicates') return r.status === 'duplicate';
      return true;
    });

    return (
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ marginTop: 0 }}>Preview & Validation</h2>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div className="stat-card" style={{ padding: '1rem', flex: 1, minWidth: '150px' }}>
            <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <CheckCircle2 /> {validCount} Valid
            </div>
          </div>
          <div className="stat-card" style={{ padding: '1rem', flex: 1, minWidth: '150px' }}>
            <div style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <AlertCircle /> {warningCount} Warnings
            </div>
          </div>
          <div className="stat-card" style={{ padding: '1rem', flex: 1, minWidth: '150px' }}>
            <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <XCircle /> {errorCount} Errors
            </div>
          </div>
          <div className="stat-card" style={{ padding: '1rem', flex: 1, minWidth: '150px' }}>
            <div style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <RefreshCw /> {duplicateCount} Duplicates
            </div>
          </div>
        </div>

        <div className="tabs-bar" style={{ marginBottom: '1rem' }}>
          {['All', 'Valid', 'Warnings', 'Errors', 'Duplicates'].map(f => (
            <button 
              key={f}
              className={`tab-item ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
              style={{ padding: '0.5rem 1rem', border: 'none', background: filter === f ? '#e0e7ff' : 'transparent', color: filter === f ? '#4f46e5' : '#64748b', borderRadius: '4px', cursor: 'pointer', fontWeight: filter === f ? 'bold' : 'normal' }}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '2rem' }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <tr>
                <th>Include</th>
                <th>Status</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Ministry Match</th>
                <th>Messages</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, i) => (
                <tr key={i} style={{ backgroundColor: row.status === 'error' ? '#fef2f2' : row.status === 'duplicate' ? '#eff6ff' : row.status === 'warning' ? '#fffbeb' : '#fff' }}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={row.include} 
                      disabled={row.status === 'error' || row.status === 'duplicate'}
                      onChange={(e) => {
                        const newRows = [...validatedRows];
                        const idx = validatedRows.findIndex(r => r.originalRow === row.originalRow);
                        newRows[idx].include = e.target.checked;
                        setValidatedRows(newRows);
                      }}
                    />
                  </td>
                  <td>
                    {row.status === 'valid' && <CheckCircle2 color="#10b981" size={18} />}
                    {row.status === 'warning' && <AlertCircle color="#f59e0b" size={18} />}
                    {row.status === 'error' && <XCircle color="#ef4444" size={18} />}
                    {row.status === 'duplicate' && <RefreshCw color="#3b82f6" size={18} />}
                  </td>
                  <td>{row.data.name}</td>
                  <td>{row.data.phone}</td>
                  <td>
                    <select
                      className="form-control"
                      style={{ minWidth: '150px', padding: '0.2rem', fontSize: '0.82rem' }}
                      value={row.ministryMatch ? row.ministryMatch.id : (row.createMinistry ? 'create_new' : '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        const newRows = [...validatedRows];
                        const idx = validatedRows.findIndex(r => r.originalRow === row.originalRow);
                        if (val === 'create_new') {
                          newRows[idx].ministryMatch = null;
                          newRows[idx].createMinistry = true;
                        } else if (val === '') {
                          newRows[idx].ministryMatch = null;
                          newRows[idx].createMinistry = false;
                        } else {
                          newRows[idx].ministryMatch = ministries.find(m => m.id === Number(val));
                          newRows[idx].createMinistry = false;
                        }
                        setValidatedRows(newRows);
                      }}
                    >
                      <option value="">-- No Ministry --</option>
                      {row.ministryName && <option value="create_new">Create New: {row.ministryName}</option>}
                      {ministries.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {row.errors.map((err, idx) => (
                      <div key={idx} style={{ fontSize: '0.8rem', color: row.status === 'error' || row.status === 'duplicate' ? '#ef4444' : '#f59e0b' }}>
                        • {err}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => setStep(2)}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ fontWeight: 'bold' }}>
            {includedCount} records selected for import
          </div>
          <button 
            className="btn btn-primary" 
            onClick={handleImport}
            disabled={includedCount === 0 || importing}
          >
            {importing ? 'Importing...' : `Import ${includedCount} Valid Records`}
          </button>
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: '#d1fae5', color: '#10b981', marginBottom: '1.5rem' }}>
        <CheckCircle2 size={40} />
      </div>
      <h2 style={{ marginTop: 0, marginBottom: '2rem' }}>Import Complete!</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
        <div className="stat-card" style={{ padding: '1.5rem', width: '150px' }}>
          <div className="stat-value" style={{ color: '#10b981' }}>{importResults?.imported || 0}</div>
          <div className="stat-title">Imported</div>
        </div>
        <div className="stat-card" style={{ padding: '1.5rem', width: '150px' }}>
          <div className="stat-value" style={{ color: '#64748b' }}>{importResults?.skipped || 0}</div>
          <div className="stat-title">Skipped</div>
        </div>
        <div className="stat-card" style={{ padding: '1.5rem', width: '150px' }}>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{importResults?.duplicates || 0}</div>
          <div className="stat-title">Duplicates</div>
        </div>
        <div className="stat-card" style={{ padding: '1.5rem', width: '150px' }}>
          <div className="stat-value" style={{ color: '#ef4444' }}>{importResults?.failed || 0}</div>
          <div className="stat-title">Failed</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button className="btn btn-secondary" onClick={resetImport}>
          Import Another File
        </button>
        <button className="btn btn-primary" onClick={() => { if(onImportComplete) onImportComplete(); }}>
          Done
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
}
