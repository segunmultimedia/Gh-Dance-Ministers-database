import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  Download, 
  LayoutGrid, 
  List, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Building
} from 'lucide-react';
import { getBirthdayStatus, formatFullDate } from '../utils/birthdayUtils';

export default function Members({ 
  members, 
  searchTerm, 
  setSearchTerm, 
  onViewMember, 
  onEditMember, 
  onDeleteMember, 
  onOpenAddMember 
}) {
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Extract unique departments for filter dropdown
  const departments = Array.from(new Set(members.map(m => m.department).filter(Boolean)));

  // Filtering Logic
  const filteredMembers = members.filter(member => {
    // Global search term matching
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      member.name?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower) ||
      member.phone?.toLowerCase().includes(searchLower) ||
      member.department?.toLowerCase().includes(searchLower);

    // Department Filter
    const matchesDept = selectedDept === 'ALL' || member.department === selectedDept;

    // Gender Filter
    const matchesGender = selectedGender === 'ALL' || member.gender === selectedGender;

    // DoB Month Filter
    let matchesMonth = true;
    if (selectedMonth !== 'ALL' && member.dob) {
      const dobMonth = new Date(member.dob).getMonth() + 1;
      matchesMonth = dobMonth === parseInt(selectedMonth);
    }

    return matchesSearch && matchesDept && matchesGender && matchesMonth;
  });

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = ['Full Name', 'Email', 'Phone', 'Date of Birth', 'Gender', 'Department', 'Date Joined', 'Address'];
    const rows = filteredMembers.map(m => [
      `"${m.name || ''}"`,
      `"${m.email || ''}"`,
      `"${m.phone || ''}"`,
      `"${m.dob || ''}"`,
      `"${m.gender || ''}"`,
      `"${m.department || ''}"`,
      `"${m.dateJoined || ''}"`,
      `"${(m.address || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Members_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Top Controls Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Filters Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
            
            {/* Department Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={16} style={{ color: 'var(--text-muted)' }} />
              <select
                className="form-control"
                style={{ width: 'auto', minWidth: '150px' }}
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Gender Filter */}
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '120px' }}
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
            >
              <option value="ALL">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            {/* DoB Month Filter */}
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '140px' }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="ALL">Birth Month</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>

            {(selectedDept !== 'ALL' || selectedGender !== 'ALL' || selectedMonth !== 'ALL') && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSelectedDept('ALL');
                  setSelectedGender('ALL');
                  setSelectedMonth('ALL');
                }}
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* View Mode Toggle */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
              <button 
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 10px', border: 'none' }}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List size={16} />
              </button>
              <button 
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 10px', border: 'none' }}
                onClick={() => setViewMode('grid')}
                title="Grid Card View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>

            {/* Export CSV Button */}
            <button className="btn btn-secondary" onClick={handleExportCSV}>
              <Download size={16} />
              <span>Export CSV</span>
            </button>

            {/* Add Member Button */}
            <button className="btn btn-primary" onClick={onOpenAddMember}>
              <UserPlus size={16} />
              <span>Add Member</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.25rem' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Showing <span style={{ color: 'var(--text-main)', fontWeight: 800 }}>{filteredMembers.length}</span> of {members.length} member records
        </div>
      </div>

      {/* Members Content: Table vs Grid */}
      {viewMode === 'table' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Department</th>
                  <th>Phone & Email</th>
                  <th>Date Joined</th>
                  <th>Date of Birth</th>
                  <th>Birthday Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No member records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const bday = getBirthdayStatus(member.dob);
                    return (
                      <tr key={member.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img
                              src={member.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                              alt={member.name}
                              className="avatar"
                            />
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{member.name}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{member.gender || 'Not specified'}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="badge badge-purple">{member.department || 'General'}</span>
                        </td>

                        <td>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{member.phone || 'No phone'}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{member.email}</div>
                        </td>

                        <td>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {formatFullDate(member.dateJoined || member.createdAt)}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            {formatFullDate(member.dob)}
                          </div>
                        </td>

                        <td>
                          {bday.status === 'today' ? (
                            <span className="badge badge-danger">🎉 Birthday Today!</span>
                          ) : bday.status === 'tomorrow' ? (
                            <span className="badge badge-warning">🎂 Tomorrow</span>
                          ) : bday.daysUntil <= 30 ? (
                            <span className="badge badge-info">In {bday.daysUntil} days</span>
                          ) : (
                            <span className="badge badge-gray">{bday.formattedNextBirthday}</span>
                          )}
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            <button className="btn btn-secondary btn-icon btn-sm" title="View Profile" onClick={() => onViewMember(member)}>
                              <Eye size={15} />
                            </button>
                            <button className="btn btn-secondary btn-icon btn-sm" title="Edit Member" onClick={() => onEditMember(member)}>
                              <Edit3 size={15} />
                            </button>
                            <button className="btn btn-secondary btn-icon btn-sm" style={{ color: '#ef4444' }} title="Delete Member" onClick={() => onDeleteMember(member.id)}>
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
      ) : (
        /* Grid Card View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {filteredMembers.map((member) => {
            const bday = getBirthdayStatus(member.dob);
            return (
              <div key={member.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span className="badge badge-purple">{member.department || 'General'}</span>
                    {bday.status === 'today' && <span className="badge badge-danger">🎉 Today!</span>}
                  </div>

                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                    <img
                      src={member.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt={member.name}
                      style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', marginBottom: '0.75rem', border: '3px solid #e0e7ff' }}
                    />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, textAlign: 'center' }}>{member.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{member.email}</p>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={14} />
                      <span>{member.phone || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} />
                      <span>DoB: {formatFullDate(member.dob)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={14} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.address || 'No address'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => onViewMember(member)}>
                    <Eye size={14} /> Profile
                  </button>
                  <button className="btn btn-secondary btn-icon btn-sm" onClick={() => onEditMember(member)}>
                    <Edit3 size={14} />
                  </button>
                  <button className="btn btn-secondary btn-icon btn-sm" style={{ color: '#ef4444' }} onClick={() => onDeleteMember(member.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
