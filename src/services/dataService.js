/**
 * Data Service — Public API for all data operations.
 * All components import from this file only.
 * Phase 1: delegates to IndexedDB adapter.
 * Phase 2: swap to Supabase adapter.
 */

import * as adapter from './adapters/indexedDBAdapter';

// Re-export everything from the active adapter
export const getCurrentDBVersion = adapter.getCurrentDBVersion;
export const exportV2Data = adapter.exportV2Data;
export const initDB = adapter.initDB;
export const seedInitialDataIfNeeded = adapter.seedInitialDataIfNeeded;

// Dancers
export const getAllDancers = adapter.getAllDancers;
export const getDancerById = adapter.getDancerById;
export const addDancer = adapter.addDancer;
export const updateDancer = adapter.updateDancer;
export const deactivateDancer = adapter.deactivateDancer;
export const deleteDancer = adapter.deleteDancer;

// Ministries
export const getAllMinistries = adapter.getAllMinistries;
export const getMinistryById = adapter.getMinistryById;
export const addMinistry = adapter.addMinistry;
export const updateMinistry = adapter.updateMinistry;
export const deactivateMinistry = adapter.deactivateMinistry;
export const deleteMinistry = adapter.deleteMinistry;

// Memberships
export const getAllMemberships = adapter.getAllMemberships;
export const getMembershipsByDancer = adapter.getMembershipsByDancer;
export const getMembershipsByMinistry = adapter.getMembershipsByMinistry;
export const addMembership = adapter.addMembership;
export const updateMembership = adapter.updateMembership;
export const removeMembership = adapter.removeMembership;

// Import
export const bulkAddDancers = adapter.bulkAddDancers;
export const getImportHistory = adapter.getImportHistory;
export const addImportRecord = adapter.addImportRecord;
export const findImportByHash = adapter.findImportByHash;

// Settings
export const getSetting = adapter.getSetting;
export const saveSetting = adapter.saveSetting;

// Bulk / Export
export const exportAllData = adapter.exportAllData;
export const clearAllData = adapter.clearAllData;

/* ═══════════ Relationship Helpers (in-memory joins) ═══════════ */

/**
 * Get a dancer's primary ministry from loaded data.
 */
export function getDancerPrimaryMinistry(dancerId, memberships, ministries) {
  const pm = memberships.find(m => m.dancerId === dancerId && m.isPrimary && m.status === 'active');
  if (!pm) return null;
  return ministries.find(m => m.id === pm.ministryId) || null;
}

/**
 * Get all active roles for a dancer across all ministries.
 */
export function getDancerAllRoles(dancerId, memberships) {
  const active = memberships.filter(m => m.dancerId === dancerId && m.status === 'active');
  const roles = new Set();
  active.forEach(m => (m.roles || []).forEach(r => roles.add(r)));
  return Array.from(roles);
}

/**
 * Get a dancer's memberships with ministry info resolved.
 */
export function getDancerMembershipsResolved(dancerId, memberships, ministries) {
  return memberships
    .filter(m => m.dancerId === dancerId && m.status === 'active')
    .map(m => ({
      ...m,
      ministry: ministries.find(min => min.id === m.ministryId) || null
    }));
}

/**
 * Get the leader(s) of a ministry.
 */
export function getMinistryLeaders(ministryId, memberships, dancers) {
  return memberships
    .filter(m => m.ministryId === ministryId && m.status === 'active' && (m.roles || []).some(r => r === 'ministry_leader' || r === 'assistant_leader'))
    .map(m => ({
      ...m,
      dancer: dancers.find(d => d.id === m.dancerId) || null
    }));
}

/**
 * Get active member count of a ministry.
 */
export function getMinistryMemberCount(ministryId, memberships) {
  return memberships.filter(m => m.ministryId === ministryId && m.status === 'active').length;
}

/**
 * Get all unique dancers who hold leadership roles across any ministry.
 */
export function getAllLeadersResolved(memberships, dancers, ministries) {
  const leaderMemberships = memberships.filter(
    m => m.status === 'active' && (m.roles || []).some(r => r === 'ministry_leader' || r === 'assistant_leader' || r === 'choreographer' || r === 'instructor')
  );

  // Group by dancerId to avoid duplicates
  const leaderMap = {};
  leaderMemberships.forEach(m => {
    if (!leaderMap[m.dancerId]) {
      leaderMap[m.dancerId] = {
        dancer: dancers.find(d => d.id === m.dancerId),
        assignments: []
      };
    }
    leaderMap[m.dancerId].assignments.push({
      ...m,
      ministry: ministries.find(min => min.id === m.ministryId)
    });
  });

  return Object.values(leaderMap).filter(entry => entry.dancer);
}

/**
 * Check if a dancer can be safely deleted (has no active relationships).
 */
export function canDeleteDancer(dancerId, memberships) {
  return !memberships.some(m => m.dancerId === dancerId && m.status === 'active');
}

/**
 * Check if a ministry can be safely deleted (has no active members).
 */
export function canDeleteMinistry(ministryId, memberships) {
  return !memberships.some(m => m.ministryId === ministryId && m.status === 'active');
}
