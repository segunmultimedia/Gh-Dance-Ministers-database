import React from 'react';
import { BarChart3, PieChart, Users, Printer, Download, Award, Calendar, Layers } from 'lucide-react';

export default function Reports({ members, files }) {
  // Department breakdown
  const deptCounts = members.reduce((acc, m) => {
    const dept = m.department || 'General';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  // Gender breakdown
  const genderCounts = members.reduce((acc, m) => {
    const g = m.gender || 'Not specified';
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});

  // Print Summary Page
  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Header Banner */}
      <div 
        className="hero-banner"
        style={{ 
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          boxShadow: '0 8px 24px -4px rgba(49, 46, 129, 0.3)'
        }}
      >
        <div className="hero-text">
          <h2>📊 Analytics & Executive Reports</h2>
          <p>Comprehensive Insights into member growth, department breakdown, and organization metrics.</p>
        </div>
        <button className="btn-hero" style={{ color: '#312e81' }} onClick={handlePrint}>
          <Printer size={18} />
          <span>Print Executive Summary</span>
        </button>
      </div>

      {/* Grid of Report Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        
        {/* Department Distribution Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '10px', borderRadius: '10px' }}>
              <Layers size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Department Distribution</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Members per department/group</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {Object.entries(deptCounts).map(([dept, count]) => {
              const pct = Math.round((count / (members.length || 1)) * 100);
              return (
                <div key={dept}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                    <span>{dept}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '10px', width: '100%', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--primary-gradient)', borderRadius: '999px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gender Breakdown Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: '#f3e8ff', color: '#9333ea', padding: '10px', borderRadius: '10px' }}>
              <PieChart size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Gender Breakdown</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Diversity representation</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {Object.entries(genderCounts).map(([gender, count]) => {
              const pct = Math.round((count / (members.length || 1)) * 100);
              return (
                <div key={gender}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                    <span>{gender}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '10px', width: '100%', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#8b5cf6', borderRadius: '999px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Organization Health Stats Summary */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Organization Record Highlights</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Registered</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{members.length} Members</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>File Repository</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7' }}>{files.length} Documents</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Departments</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>{Object.keys(deptCounts).length} Groups</div>
          </div>
        </div>
      </div>
    </div>
  );
}
