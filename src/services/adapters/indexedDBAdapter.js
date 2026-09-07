import { openDB } from 'idb';
import { normalizeGhanaPhone } from '../../utils/phoneUtils';
import { parseDobToSplit } from '../../utils/birthdayUtils';

const DB_NAME = 'MemberDB_System';
const DB_VERSION = 3;

let dbInstance = null;

/* ─── Version Check (without triggering upgrade) ─── */
export function getCurrentDBVersion() {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME);
      request.onsuccess = (e) => {
        const db = e.target.result;
        const version = db.version;
        db.close();
        resolve(version);
      };
      request.onerror = () => resolve(0);
    } catch {
      resolve(0);
    }
  });
}

/* ─── Export Old v2 Data (before migration) ─── */
export function exportV2Data() {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME);
      request.onsuccess = async (e) => {
        const db = e.target.result;
        const data = { members: [], leaders: [], files: [], exportDate: new Date().toISOString() };
        try {
          const storeNames = Array.from(db.objectStoreNames);
          if (storeNames.includes('members')) {
            const tx = db.transaction('members', 'readonly');
            const store = tx.objectStore('members');
            data.members = await promisifyRequest(store.getAll());
          }
          if (storeNames.includes('leaders')) {
            const tx2 = db.transaction('leaders', 'readonly');
            const store2 = tx2.objectStore('leaders');
            data.leaders = await promisifyRequest(store2.getAll());
          }
          if (storeNames.includes('files')) {
            const tx3 = db.transaction('files', 'readonly');
            const store3 = tx3.objectStore('files');
            const files = await promisifyRequest(store3.getAll());
            // Strip Blob data for JSON export
            data.files = files.map(f => ({ ...f, data: undefined, name: f.name, type: f.type, size: f.size }));
          }
        } catch (err) {
          console.warn('Export partial error:', err);
        }
        db.close();
        resolve(data);
      };
      request.onerror = () => resolve({ members: [], leaders: [], files: [], exportDate: new Date().toISOString() });
    } catch {
      resolve({ members: [], leaders: [], files: [], exportDate: new Date().toISOString() });
    }
  });
}

function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/* ─── Open DB with Upgrade (creates v3 schema) ─── */
export async function initDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, _newVersion, tx) {
      // --- Create new stores if they don't exist ---
      if (!db.objectStoreNames.contains('dancers')) {
        const s = db.createObjectStore('dancers', { keyPath: 'id', autoIncrement: true });
        s.createIndex('name', 'name', { unique: false });
        s.createIndex('phone', 'phone', { unique: false });
        s.createIndex('status', 'status', { unique: false });
        s.createIndex('birthdayMonth', 'birthdayMonth', { unique: false });
      }

      if (!db.objectStoreNames.contains('ministries')) {
        const s = db.createObjectStore('ministries', { keyPath: 'id', autoIncrement: true });
        s.createIndex('name', 'name', { unique: false });
        s.createIndex('status', 'status', { unique: false });
        s.createIndex('region', 'region', { unique: false });
      }

      if (!db.objectStoreNames.contains('ministryMemberships')) {
        const s = db.createObjectStore('ministryMemberships', { keyPath: 'id', autoIncrement: true });
        s.createIndex('dancerId', 'dancerId', { unique: false });
        s.createIndex('ministryId', 'ministryId', { unique: false });
      }

      if (!db.objectStoreNames.contains('importHistory')) {
        const s = db.createObjectStore('importHistory', { keyPath: 'id', autoIncrement: true });
        s.createIndex('fileHash', 'fileHash', { unique: false });
      }

      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      // --- Migrate v2 → v3 ---
      if (oldVersion > 0 && oldVersion < 3) {
        migrateV2ToV3(db, tx);
      }
    },
  });

  return dbInstance;
}

/* ─── v2 → v3 Migration (runs inside upgrade transaction) ─── */
function migrateV2ToV3(db, tx) {
  const storeNames = Array.from(db.objectStoreNames);

  // Migrate members → dancers
  if (storeNames.includes('members')) {
    const membersStore = tx.objectStore('members');
    const dancersStore = tx.objectStore('dancers');
    const ministriesStore = tx.objectStore('ministries');
    const membershipsStore = tx.objectStore('ministryMemberships');

    const ministryMap = {}; // department name → ministryId

    membersStore.openCursor().onsuccess = function(event) {
      const cursor = event.target.result;
      if (!cursor) {
        // After members, migrate leaders
        if (storeNames.includes('leaders')) {
          migrateLeaders(tx, ministryMap);
        }
        // Clean up old stores
        cleanupOldStores(db, storeNames);
        return;
      }

      const m = cursor.value;
      const bday = parseDobToSplit(m.dob);
      const now = new Date().toISOString();

      const dancer = {
        name: m.name || '',
        photo: m.photo || '',
        phone: normalizeGhanaPhone(m.phone || ''),
        whatsapp: '',
        email: m.email || '',
        gender: m.gender || '',
        birthdayDay: bday.birthdayDay,
        birthdayMonth: bday.birthdayMonth,
        birthYear: bday.birthYear,
        dancerType: 'group_member',
        town: '',
        region: '',
        church: '',
        dateJoined: m.dateJoined || m.createdAt || '',
        status: 'active',
        allowBirthdayPublication: true,
        allowPhotoPublication: true,
        notes: m.notes || '',
        createdAt: m.createdAt || now,
        updatedAt: now
      };

      const addReq = dancersStore.add(dancer);
      addReq.onsuccess = function() {
        const dancerId = addReq.result;

        // Create ministry from department if it exists
        const dept = m.department || '';
        if (dept && !ministryMap[dept]) {
          const ministry = {
            name: dept,
            logo: '', phone: '', whatsapp: '', email: '',
            church: '', town: '', region: '',
            dateEstablished: '', status: 'active', notes: '',
            createdAt: now, updatedAt: now
          };
          const mReq = ministriesStore.add(ministry);
          mReq.onsuccess = function() {
            ministryMap[dept] = mReq.result;
            // Create membership
            membershipsStore.add({
              dancerId, ministryId: mReq.result,
              roles: ['dancer'], isPrimary: true,
              dateJoined: m.dateJoined || '', status: 'active',
              createdAt: now, updatedAt: now
            });
          };
        } else if (dept && ministryMap[dept]) {
          membershipsStore.add({
            dancerId, ministryId: ministryMap[dept],
            roles: ['dancer'], isPrimary: true,
            dateJoined: m.dateJoined || '', status: 'active',
            createdAt: now, updatedAt: now
          });
        }
      };

      cursor.continue();
    };
  }
}

function migrateLeaders(tx, ministryMap) {
  const storeNames = Array.from(tx.objectStoreNames || []);
  if (!storeNames.includes('leaders')) return;

  const leadersStore = tx.objectStore('leaders');
  const dancersStore = tx.objectStore('dancers');
  const ministriesStore = tx.objectStore('ministries');
  const membershipsStore = tx.objectStore('ministryMemberships');
  const now = new Date().toISOString();

  leadersStore.openCursor().onsuccess = function(event) {
    const cursor = event.target.result;
    if (!cursor) return;

    const l = cursor.value;
    const groupName = l.groupName || '';

    // Create dancer record for the leader
    const dancer = {
      name: l.name || '',
      photo: l.photo || '',
      phone: normalizeGhanaPhone(l.phone || ''),
      whatsapp: '',
      email: l.email || '',
      gender: '',
      birthdayDay: null, birthdayMonth: null, birthYear: null,
      dancerType: 'group_member',
      town: '', region: '', church: '',
      dateJoined: l.createdAt || '', status: 'active',
      allowBirthdayPublication: true, allowPhotoPublication: true,
      notes: l.notes || '',
      createdAt: l.createdAt || now, updatedAt: now
    };

    const addReq = dancersStore.add(dancer);
    addReq.onsuccess = function() {
      const dancerId = addReq.result;

      if (groupName && !ministryMap[groupName]) {
        const ministry = {
          name: groupName,
          logo: '', phone: '', whatsapp: '', email: '',
          church: '', town: '', region: '',
          dateEstablished: '', status: 'active', notes: '',
          createdAt: now, updatedAt: now
        };
        const mReq = ministriesStore.add(ministry);
        mReq.onsuccess = function() {
          ministryMap[groupName] = mReq.result;
          membershipsStore.add({
            dancerId, ministryId: mReq.result,
            roles: ['dancer', 'ministry_leader'], isPrimary: true,
            dateJoined: '', status: 'active',
            createdAt: now, updatedAt: now
          });
        };
      } else if (groupName && ministryMap[groupName]) {
        membershipsStore.add({
          dancerId, ministryId: ministryMap[groupName],
          roles: ['dancer', 'ministry_leader'], isPrimary: true,
          dateJoined: '', status: 'active',
          createdAt: now, updatedAt: now
        });
      }
    };

    cursor.continue();
  };
}

function cleanupOldStores(db, storeNames) {
  if (storeNames.includes('members')) db.deleteObjectStore('members');
  if (storeNames.includes('leaders')) db.deleteObjectStore('leaders');
  if (storeNames.includes('files')) db.deleteObjectStore('files');
}

/* ─── Seed Data ─── */
export async function seedInitialDataIfNeeded() {
  const db = await initDB();
  const count = await db.count('dancers');
  if (count > 0) return;

  const now = new Date().toISOString();
  const ago = (days) => new Date(Date.now() - days * 86400000).toISOString();

  // Seed Ministries
  const ministries = [
    { name: 'Royal Priesthood Dance Ministry', logo: '', phone: '+233 24 000 1111', whatsapp: '+233 24 000 1111', email: '', church: 'Grace Baptist Church', town: 'Accra', region: 'Greater Accra', dateEstablished: '2018-03-15', status: 'active', notes: 'Flagship dance ministry.', createdAt: ago(400), updatedAt: now },
    { name: 'Glory Dancers International', logo: '', phone: '+233 20 000 2222', whatsapp: '+233 20 000 2222', email: '', church: 'Praise Tabernacle', town: 'Kumasi', region: 'Ashanti', dateEstablished: '2020-06-01', status: 'active', notes: 'Youth-focused dance ministry.', createdAt: ago(300), updatedAt: now },
    { name: 'Praise Flames Ministry', logo: '', phone: '+233 55 000 3333', whatsapp: '+233 55 000 3333', email: '', church: 'Christ the King Parish', town: 'Takoradi', region: 'Western', dateEstablished: '2021-01-10', status: 'active', notes: 'Praise and worship dance.', createdAt: ago(200), updatedAt: now },
    { name: 'Vessels of Honour Dance', logo: '', phone: '', whatsapp: '', email: '', church: 'New Life Assembly', town: 'Tamale', region: 'Northern', dateEstablished: '', status: 'active', notes: '', createdAt: ago(15), updatedAt: now },
  ];

  const ministryIds = [];
  const txM = db.transaction('ministries', 'readwrite');
  for (const m of ministries) {
    const id = await txM.store.add(m);
    ministryIds.push(id);
  }
  await txM.done;

  // Seed Dancers
  const dancers = [
    { name: 'Abena Mensah', photo: '', phone: '+233240001001', whatsapp: '+233240001001', email: 'abena.m@email.com', gender: 'Female', birthdayDay: new Date().getDate(), birthdayMonth: new Date().getMonth() + 1, birthYear: 1995, dancerType: 'group_member', town: 'Accra', region: 'Greater Accra', church: 'Grace Baptist Church', dateJoined: ago(350), status: 'active', allowBirthdayPublication: true, allowPhotoPublication: true, notes: 'Committed dancer and worship leader.', createdAt: ago(350), updatedAt: now },
    { name: 'Kwame Asante', photo: '', phone: '+233200002002', whatsapp: '+233200002002', email: 'kwame.a@email.com', gender: 'Male', birthdayDay: ((new Date().getDate() % 28) + 1), birthdayMonth: new Date().getMonth() + 1, birthYear: 1990, dancerType: 'group_member', town: 'Kumasi', region: 'Ashanti', church: 'Praise Tabernacle', dateJoined: ago(280), status: 'active', allowBirthdayPublication: true, allowPhotoPublication: true, notes: 'Lead choreographer for Glory Dancers.', createdAt: ago(280), updatedAt: now },
    { name: 'Ama Serwaa', photo: '', phone: '+233550003003', whatsapp: '+233550003003', email: '', gender: 'Female', birthdayDay: Math.min(new Date().getDate() + 3, 28), birthdayMonth: new Date().getMonth() + 1, birthYear: 1998, dancerType: 'group_member', town: 'Takoradi', region: 'Western', church: '', dateJoined: ago(180), status: 'active', allowBirthdayPublication: true, allowPhotoPublication: false, notes: '', createdAt: ago(180), updatedAt: now },
    { name: 'Yaw Boateng', photo: '', phone: '+233270004004', whatsapp: '+233270004004', email: 'yaw.b@email.com', gender: 'Male', birthdayDay: 15, birthdayMonth: 12, birthYear: 1992, dancerType: 'solo_minister', town: 'Accra', region: 'Greater Accra', church: 'El Shaddai Ministries', dateJoined: ago(120), status: 'active', allowBirthdayPublication: true, allowPhotoPublication: true, notes: 'Solo praise dancer.', createdAt: ago(120), updatedAt: now },
    { name: 'Efua Dadzie', photo: '', phone: '+233260005005', whatsapp: '+233260005005', email: 'efua.d@email.com', gender: 'Female', birthdayDay: 22, birthdayMonth: ((new Date().getMonth() + 2) % 12) + 1, birthYear: 1997, dancerType: 'solo_affiliated', town: 'Cape Coast', region: 'Central', church: '', dateJoined: ago(60), status: 'active', allowBirthdayPublication: false, allowPhotoPublication: true, notes: 'Solo dancer affiliated with Royal Priesthood.', createdAt: ago(60), updatedAt: now },
    { name: 'Kofi Appiah', photo: '', phone: '+233540006006', whatsapp: '+233540006006', email: '', gender: 'Male', birthdayDay: 8, birthdayMonth: 3, birthYear: null, dancerType: 'group_member', town: 'Tamale', region: 'Northern', church: 'New Life Assembly', dateJoined: ago(10), status: 'active', allowBirthdayPublication: true, allowPhotoPublication: true, notes: 'New member.', createdAt: ago(10), updatedAt: now },
  ];

  const dancerIds = [];
  const txD = db.transaction('dancers', 'readwrite');
  for (const d of dancers) {
    const id = await txD.store.add(d);
    dancerIds.push(id);
  }
  await txD.done;

  // Seed Memberships
  const memberships = [
    { dancerId: dancerIds[0], ministryId: ministryIds[0], roles: ['dancer', 'ministry_leader'], isPrimary: true, dateJoined: ago(350), status: 'active', createdAt: ago(350), updatedAt: now },
    { dancerId: dancerIds[1], ministryId: ministryIds[1], roles: ['dancer', 'choreographer', 'ministry_leader'], isPrimary: true, dateJoined: ago(280), status: 'active', createdAt: ago(280), updatedAt: now },
    { dancerId: dancerIds[2], ministryId: ministryIds[2], roles: ['dancer', 'assistant_leader'], isPrimary: true, dateJoined: ago(180), status: 'active', createdAt: ago(180), updatedAt: now },
    { dancerId: dancerIds[3], ministryId: ministryIds[0], roles: ['dancer'], isPrimary: false, dateJoined: ago(120), status: 'active', createdAt: ago(120), updatedAt: now },
    { dancerId: dancerIds[4], ministryId: ministryIds[0], roles: ['dancer'], isPrimary: true, dateJoined: ago(60), status: 'active', createdAt: ago(60), updatedAt: now },
    { dancerId: dancerIds[5], ministryId: ministryIds[3], roles: ['dancer'], isPrimary: true, dateJoined: ago(10), status: 'active', createdAt: ago(10), updatedAt: now },
  ];

  const txMM = db.transaction('ministryMemberships', 'readwrite');
  for (const mm of memberships) {
    await txMM.store.add(mm);
  }
  await txMM.done;
}

/* ═══════════════════ CRUD: Dancers ═══════════════════ */

export async function getAllDancers() {
  const db = await initDB();
  return db.getAll('dancers');
}

export async function getDancerById(id) {
  const db = await initDB();
  return db.get('dancers', id);
}

export async function addDancer(data) {
  const db = await initDB();
  const now = new Date().toISOString();
  const record = { ...data, createdAt: now, updatedAt: now };
  const id = await db.add('dancers', record);
  return { ...record, id };
}

export async function updateDancer(id, data) {
  const db = await initDB();
  const existing = await db.get('dancers', id);
  if (!existing) throw new Error('Dancer not found');
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
  await db.put('dancers', updated);
  return updated;
}

export async function deactivateDancer(id) {
  return updateDancer(id, { status: 'inactive' });
}

export async function deleteDancer(id) {
  const db = await initDB();
  // Check memberships first
  const memberships = await db.getAllFromIndex('ministryMemberships', 'dancerId', id);
  if (memberships.length > 0) {
    // Deactivate memberships instead of deleting
    const tx = db.transaction('ministryMemberships', 'readwrite');
    for (const m of memberships) {
      await tx.store.put({ ...m, status: 'inactive', updatedAt: new Date().toISOString() });
    }
    await tx.done;
  }
  await db.delete('dancers', id);
}

/* ═══════════════════ CRUD: Ministries ═══════════════════ */

export async function getAllMinistries() {
  const db = await initDB();
  return db.getAll('ministries');
}

export async function getMinistryById(id) {
  const db = await initDB();
  return db.get('ministries', id);
}

export async function addMinistry(data) {
  const db = await initDB();
  const now = new Date().toISOString();
  const record = { ...data, createdAt: now, updatedAt: now };
  const id = await db.add('ministries', record);
  return { ...record, id };
}

export async function updateMinistry(id, data) {
  const db = await initDB();
  const existing = await db.get('ministries', id);
  if (!existing) throw new Error('Ministry not found');
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
  await db.put('ministries', updated);
  return updated;
}

export async function deactivateMinistry(id) {
  return updateMinistry(id, { status: 'inactive' });
}

export async function deleteMinistry(id) {
  const db = await initDB();
  const memberships = await db.getAllFromIndex('ministryMemberships', 'ministryId', id);
  if (memberships.some(m => m.status === 'active')) {
    throw new Error('Cannot delete ministry with active members. Deactivate it instead.');
  }
  await db.delete('ministries', id);
}

/* ═══════════════════ CRUD: Ministry Memberships ═══════════════════ */

export async function getAllMemberships() {
  const db = await initDB();
  return db.getAll('ministryMemberships');
}

export async function getMembershipsByDancer(dancerId) {
  const db = await initDB();
  return db.getAllFromIndex('ministryMemberships', 'dancerId', dancerId);
}

export async function getMembershipsByMinistry(ministryId) {
  const db = await initDB();
  return db.getAllFromIndex('ministryMemberships', 'ministryId', ministryId);
}

export async function addMembership(data) {
  const db = await initDB();
  const now = new Date().toISOString();
  const record = { ...data, createdAt: now, updatedAt: now };
  const id = await db.add('ministryMemberships', record);
  return { ...record, id };
}

export async function updateMembership(id, data) {
  const db = await initDB();
  const existing = await db.get('ministryMemberships', id);
  if (!existing) throw new Error('Membership not found');
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
  await db.put('ministryMemberships', updated);
  return updated;
}

export async function removeMembership(id) {
  const db = await initDB();
  await db.delete('ministryMemberships', id);
}

/* ═══════════════════ CRUD: Import History ═══════════════════ */

export async function getImportHistory() {
  const db = await initDB();
  return db.getAll('importHistory');
}

export async function addImportRecord(data) {
  const db = await initDB();
  const now = new Date().toISOString();
  const record = { ...data, createdAt: now };
  const id = await db.add('importHistory', record);
  return { ...record, id };
}

export async function findImportByHash(hash) {
  const db = await initDB();
  return db.getFromIndex('importHistory', 'fileHash', hash);
}

/* ═══════════════════ Settings ═══════════════════ */

export async function getSetting(key, defaultValue = null) {
  const db = await initDB();
  const record = await db.get('settings', key);
  return record ? record.value : defaultValue;
}

export async function saveSetting(key, value) {
  const db = await initDB();
  await db.put('settings', { key, value });
}

/* ═══════════════════ Bulk Operations ═══════════════════ */

export async function bulkAddDancers(dancers) {
  const db = await initDB();
  const tx = db.transaction('dancers', 'readwrite');
  const ids = [];
  const now = new Date().toISOString();
  for (const d of dancers) {
    const id = await tx.store.add({ ...d, createdAt: now, updatedAt: now });
    ids.push(id);
  }
  await tx.done;
  return ids;
}

export async function exportAllData() {
  const db = await initDB();
  const dancers = await db.getAll('dancers');
  const ministries = await db.getAll('ministries');
  const memberships = await db.getAll('ministryMemberships');
  const importHist = await db.getAll('importHistory');
  return {
    dancers, ministries, memberships,
    importHistory: importHist,
    exportDate: new Date().toISOString(),
    version: DB_VERSION
  };
}

export async function clearAllData() {
  const db = await initDB();
  const tx = db.transaction(['dancers', 'ministries', 'ministryMemberships', 'importHistory'], 'readwrite');
  await tx.objectStore('dancers').clear();
  await tx.objectStore('ministries').clear();
  await tx.objectStore('ministryMemberships').clear();
  await tx.objectStore('importHistory').clear();
  await tx.done;
}
