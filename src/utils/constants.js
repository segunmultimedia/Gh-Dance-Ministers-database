// Ghana Regions (all 16 current regions)
export const GHANA_REGIONS = [
  'Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern',
  'Greater Accra', 'North East', 'Northern', 'Oti', 'Savannah',
  'Upper East', 'Upper West', 'Volta', 'Western', 'Western North'
];

// Dancer Types
export const DANCER_TYPES = [
  { value: 'group_member', label: 'Group Member' },
  { value: 'solo_minister', label: 'Solo Minister' },
  { value: 'solo_affiliated', label: 'Solo Minister (Affiliated)' }
];

// Roles (a person can have multiple)
export const ROLES = [
  { value: 'dancer', label: 'Dancer' },
  { value: 'ministry_leader', label: 'Ministry Leader' },
  { value: 'assistant_leader', label: 'Assistant Leader' },
  { value: 'choreographer', label: 'Choreographer' },
  { value: 'instructor', label: 'Instructor/Trainer' },
  { value: 'administrator', label: 'Administrator' }
];

export const LEADERSHIP_ROLES = ['ministry_leader', 'assistant_leader'];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function getDancerTypeLabel(value) {
  const type = DANCER_TYPES.find(t => t.value === value);
  return type ? type.label : value || 'Unknown';
}

export function getRoleLabel(value) {
  const role = ROLES.find(r => r.value === value);
  return role ? role.label : value || 'Unknown';
}
