import { MONTH_NAMES_SHORT } from './constants';

/**
 * Get birthday info from split day/month/optional-year fields.
 * Correctly handles year boundaries (Dec → Jan).
 */
export function getBirthdayInfo(birthdayDay, birthdayMonth, birthYear = null) {
  if (!birthdayDay || !birthdayMonth) {
    return {
      status: 'unknown', daysUntil: null, turningAge: null,
      currentAge: null, isToday: false,
      formattedBirthday: 'Not provided', formattedNextBirthday: '',
      birthdayDay: null, birthdayMonth: null
    };
  }

  const day = Number(birthdayDay);
  const month = Number(birthdayMonth);
  const year = birthYear ? Number(birthYear) : null;

  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth() + 1;
  const todayDay = now.getDate();

  // Build date objects with time stripped
  const todayNoTime = new Date(todayYear, todayMonth - 1, todayDay);
  todayNoTime.setHours(0, 0, 0, 0);

  // This year's birthday
  let thisBday = new Date(todayYear, month - 1, day);
  thisBday.setHours(0, 0, 0, 0);

  // Handle invalid day-of-month (e.g. Feb 30 → JS rolls to Mar 2)
  // Clamp to last day of the month if needed
  if (thisBday.getMonth() !== month - 1) {
    thisBday = new Date(todayYear, month, 0); // last day of target month
    thisBday.setHours(0, 0, 0, 0);
  }

  // Determine next birthday
  let nextBday;
  if (thisBday.getTime() >= todayNoTime.getTime()) {
    nextBday = thisBday;
  } else {
    nextBday = new Date(todayYear + 1, month - 1, day);
    nextBday.setHours(0, 0, 0, 0);
    if (nextBday.getMonth() !== month - 1) {
      nextBday = new Date(todayYear + 1, month, 0);
      nextBday.setHours(0, 0, 0, 0);
    }
  }

  const diffMs = nextBday.getTime() - todayNoTime.getTime();
  const daysUntil = Math.round(diffMs / 86400000);

  // Status
  let status;
  if (daysUntil === 0) status = 'today';
  else if (daysUntil === 1) status = 'tomorrow';
  else if (daysUntil <= 7) status = 'this_week';
  else if (daysUntil <= 30) status = 'this_month';
  else status = 'upcoming';

  // Ages
  let currentAge = null;
  let turningAge = null;
  if (year) {
    currentAge = todayYear - year;
    if (todayMonth < month || (todayMonth === month && todayDay < day)) {
      currentAge--;
    }
    turningAge = nextBday.getFullYear() - year;
  }

  // Formatted strings
  const formattedBirthday = `${day} ${MONTH_NAMES_SHORT[month - 1]}${year ? ` ${year}` : ''}`;
  const formattedNextBirthday = `${MONTH_NAMES_SHORT[nextBday.getMonth()]} ${nextBday.getDate()}`;

  return {
    status,
    daysUntil,
    turningAge,
    currentAge,
    isToday: daysUntil === 0,
    formattedBirthday,
    formattedNextBirthday,
    birthdayDay: day,
    birthdayMonth: month
  };
}

/**
 * Check if a birthday falls within the next N days.
 */
export function isBirthdayInRange(birthdayDay, birthdayMonth, rangeDays) {
  const info = getBirthdayInfo(birthdayDay, birthdayMonth);
  if (info.daysUntil === null) return false;
  return info.daysUntil <= rangeDays;
}

/**
 * Check if a birthday falls in a specific month.
 */
export function isBirthdayInMonth(birthdayMonth, targetMonth) {
  return Number(birthdayMonth) === Number(targetMonth);
}

/**
 * Format an ISO date string for display.
 */
export function formatFullDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Convert old single-dob string to split fields (for migration).
 */
export function parseDobToSplit(dob) {
  if (!dob) return { birthdayDay: null, birthdayMonth: null, birthYear: null };
  const d = new Date(dob);
  if (isNaN(d.getTime())) return { birthdayDay: null, birthdayMonth: null, birthYear: null };
  return {
    birthdayDay: d.getDate(),
    birthdayMonth: d.getMonth() + 1,
    birthYear: d.getFullYear()
  };
}
