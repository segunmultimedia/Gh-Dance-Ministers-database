import { openDB } from 'idb';

const DB_NAME = 'MemberDB_System';
const DB_VERSION = 2;

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('members')) {
        const memberStore = db.createObjectStore('members', { keyPath: 'id', autoIncrement: true });
        memberStore.createIndex('name', 'name', { unique: false });
        memberStore.createIndex('email', 'email', { unique: false });
        memberStore.createIndex('department', 'department', { unique: false });
      }

      if (!db.objectStoreNames.contains('files')) {
        const fileStore = db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
        fileStore.createIndex('name', 'name', { unique: false });
        fileStore.createIndex('uploadDate', 'uploadDate', { unique: false });
      }

      if (!db.objectStoreNames.contains('leaders')) {
        const leaderStore = db.createObjectStore('leaders', { keyPath: 'id', autoIncrement: true });
        leaderStore.createIndex('name', 'name', { unique: false });
        leaderStore.createIndex('groupName', 'groupName', { unique: false });
      }

      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });
}

// Default Seed Data
const SAMPLE_MEMBERS = [
  {
    name: 'Savannah Nguyen',
    email: 'savannah.n@organization.org',
    phone: '+1 (555) 234-5678',
    dob: '1995-08-09', // Birthday Today!
    gender: 'Female',
    address: '742 Evergreen Terrace, Springfield, IL',
    department: 'Marketing',
    dateJoined: '2024-01-15',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    notes: 'Key coordinator for annual gala events.'
  },
  {
    name: 'Jerome Bell',
    email: 'jerome.bell@organization.org',
    phone: '+1 (555) 876-5432',
    dob: '1990-08-10', // Birthday Tomorrow!
    gender: 'Male',
    address: '123 Innovation Way, Tech District, CA',
    department: 'IT & Support',
    dateJoined: '2023-11-01',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    notes: 'Manages member portal security.'
  },
  {
    name: 'Darlene Robertson',
    email: 'darlene.r@organization.org',
    phone: '+1 (555) 345-6789',
    dob: '1988-08-14', // Upcoming in 5 days
    gender: 'Female',
    address: '456 Commerce Blvd, Suite 200, NY',
    department: 'Finance',
    dateJoined: '2024-03-10',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    notes: 'Head of audit and budget reporting.'
  },
  {
    name: 'Cody Fisher',
    email: 'cody.fisher@organization.org',
    phone: '+1 (555) 987-1234',
    dob: '1992-09-02',
    gender: 'Male',
    address: '890 Oak Street, Metro City, TX',
    department: 'Operations',
    dateJoined: '2024-06-20',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    notes: 'Logistics team lead.'
  },
  {
    name: 'Eleanor Pena',
    email: 'eleanor.p@organization.org',
    phone: '+1 (555) 432-8765',
    dob: '1996-08-09', // Birthday Today!
    gender: 'Female',
    address: '321 Pine Avenue, Seattle, WA',
    department: 'Human Resources',
    dateJoined: '2024-07-01',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    notes: 'Member onboarding specialist.'
  },
  {
    name: 'Guy Hawkins',
    email: 'guy.hawkins@organization.org',
    phone: '+1 (555) 654-9870',
    dob: '1985-11-20',
    gender: 'Male',
    address: '654 Elm Street, Boston, MA',
    department: 'Executive Board',
    dateJoined: '2022-05-14',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    notes: 'Board Vice President.'
  }
];

const SAMPLE_LEADERS = [
  {
    name: 'Savannah Nguyen',
    groupName: 'Choreography Ministry',
    title: 'Lead Choreographer & Director',
    email: 'savannah.n@organization.org',
    phone: '+1 (555) 234-5678',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    notes: 'Oversees main stage routines and annual ministry concerts.'
  },
  {
    name: 'Guy Hawkins',
    groupName: 'Executive Board',
    title: 'Ministry Director',
    email: 'guy.hawkins@organization.org',
    phone: '+1 (555) 654-9870',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    notes: 'Head of organizational leadership and ministry direction.'
  },
  {
    name: 'Darlene Robertson',
    groupName: 'Praise & Worship Dance',
    title: 'Assistant Leader',
    email: 'darlene.r@organization.org',
    phone: '+1 (555) 345-6789',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    notes: 'Coordinates Sunday service dance routines.'
  },
  {
    name: 'Cody Fisher',
    groupName: 'Youth Dance Ministry',
    title: 'Youth Group Leader',
    email: 'cody.fisher@organization.org',
    phone: '+1 (555) 987-1234',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    notes: 'Leads youth rehearsals and workshops.'
  }
];

export async function seedInitialDataIfNeeded() {
  const db = await initDB();
  const count = await db.count('members');
  if (count === 0) {
    const tx = db.transaction('members', 'readwrite');
    for (const member of SAMPLE_MEMBERS) {
      await tx.store.add({
        ...member,
        createdAt: new Date().toISOString()
      });
    }
    await tx.done;
  }

  // Check if leaders exist
  const leaderCount = await db.count('leaders');
  if (leaderCount === 0) {
    const tx = db.transaction('leaders', 'readwrite');
    for (const leader of SAMPLE_LEADERS) {
      await tx.store.add({
        ...leader,
        createdAt: new Date().toISOString()
      });
    }
    await tx.done;
  }

  // Check if sample files exist
  const fileCount = await db.count('files');
  if (fileCount === 0) {
    const tx = db.transaction('files', 'readwrite');
    
    const samplePdfContent = "PDF Document Sample Content for Member Organization Rules 2026.";
    const pdfBlob = new Blob([samplePdfContent], { type: 'application/pdf' });

    const sampleExcelContent = "Member ID,Name,Department,Status\n1,Savannah Nguyen,Marketing,Active\n2,Jerome Bell,IT & Support,Active";
    const excelBlob = new Blob([sampleExcelContent], { type: 'application/vnd.ms-excel' });

    await tx.store.add({
      name: '2026_Member_Bylaws_Guidelines.pdf',
      type: 'application/pdf',
      size: pdfBlob.size + 42000,
      uploadDate: new Date(Date.now() - 86400000 * 3).toISOString(),
      data: pdfBlob,
      category: 'PDF Document'
    });

    await tx.store.add({
      name: 'Q3_Department_Budget_Report.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: excelBlob.size + 85000,
      uploadDate: new Date(Date.now() - 86400000 * 1).toISOString(),
      data: excelBlob,
      category: 'Excel Spreadsheet'
    });

    await tx.done;
  }
}

/* MEMBER API CRUD */
export async function getAllMembers() {
  const db = await initDB();
  return db.getAll('members');
}

export async function getMemberById(id) {
  const db = await initDB();
  return db.get('members', id);
}

export async function addMember(memberData) {
  const db = await initDB();
  const newMember = {
    ...memberData,
    createdAt: new Date().toISOString()
  };
  const id = await db.add('members', newMember);
  return { ...newMember, id };
}

export async function updateMember(id, memberData) {
  const db = await initDB();
  const existing = await db.get('members', id);
  const updated = {
    ...existing,
    ...memberData,
    updatedAt: new Date().toISOString()
  };
  await db.put('members', updated);
  return updated;
}

export async function deleteMember(id) {
  const db = await initDB();
  return db.delete('members', id);
}

/* GROUP LEADERS API CRUD */
export async function getAllLeaders() {
  const db = await initDB();
  return db.getAll('leaders');
}

export async function addLeader(leaderData) {
  const db = await initDB();
  const newLeader = {
    ...leaderData,
    createdAt: new Date().toISOString()
  };
  const id = await db.add('leaders', newLeader);
  return { ...newLeader, id };
}

export async function updateLeader(id, leaderData) {
  const db = await initDB();
  const existing = await db.get('leaders', id);
  const updated = {
    ...existing,
    ...leaderData,
    updatedAt: new Date().toISOString()
  };
  await db.put('leaders', updated);
  return updated;
}

export async function deleteLeader(id) {
  const db = await initDB();
  return db.delete('leaders', id);
}

/* FILE API CRUD */
export async function getAllFiles() {
  const db = await initDB();
  return db.getAll('files');
}

export async function saveFile(file) {
  const db = await initDB();
  const fileRecord = {
    name: file.name,
    type: file.type,
    size: file.size,
    uploadDate: new Date().toISOString(),
    data: file,
    category: file.name.endsWith('.pdf') ? 'PDF Document' : 'Excel Spreadsheet'
  };
  const id = await db.add('files', fileRecord);
  return { ...fileRecord, id };
}

export async function deleteFile(id) {
  const db = await initDB();
  return db.delete('files', id);
}

export async function getFileById(id) {
  const db = await initDB();
  return db.get('files', id);
}

/* SETTINGS API */
export async function getSetting(key, defaultValue = null) {
  const db = await initDB();
  const record = await db.get('settings', key);
  return record ? record.value : defaultValue;
}

export async function saveSetting(key, value) {
  const db = await initDB();
  await db.put('settings', { key, value });
}

export async function clearAllData() {
  const db = await initDB();
  const tx = db.transaction(['members', 'files', 'leaders'], 'readwrite');
  await tx.objectStore('members').clear();
  await tx.objectStore('files').clear();
  await tx.objectStore('leaders').clear();
  await tx.done;
}
