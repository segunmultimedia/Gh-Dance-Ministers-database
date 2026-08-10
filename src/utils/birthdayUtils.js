/**
 * Utility functions for Birthday calculations and Reminders
 */

export function getBirthdayStatus(dobString, referenceDate = new Date()) {
  if (!dobString) return { status: 'unknown', daysUntil: 999, turningAge: 0 };

  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return { status: 'unknown', daysUntil: 999, turningAge: 0 };

  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const currentYear = today.getFullYear();
  const birthYear = dob.getFullYear();

  // Next birthday date in current year
  let nextBirthday = new Date(currentYear, dob.getMonth(), dob.getDate());
  nextBirthday.setHours(0, 0, 0, 0);

  // If birthday already passed this year, set for next year
  if (nextBirthday < today) {
    nextBirthday.setFullYear(currentYear + 1);
  }

  const diffTime = nextBirthday.getTime() - today.getTime();
  const daysUntil = Math.round(diffTime / (1000 * 60 * 60 * 24));
  const turningAge = nextBirthday.getFullYear() - birthYear;

  let status = 'upcoming';
  let badgeText = `In ${daysUntil} days`;

  if (daysUntil === 0) {
    status = 'today';
    badgeText = 'Birthday Today!';
  } else if (daysUntil === 1) {
    status = 'tomorrow';
    badgeText = 'Birthday Tomorrow!';
  } else if (daysUntil <= 7) {
    status = 'this_week';
    badgeText = `In ${daysUntil} days`;
  } else if (daysUntil <= 30) {
    status = 'this_month';
    badgeText = `In ${daysUntil} days`;
  }

  return {
    status,
    daysUntil,
    turningAge,
    nextBirthdayDate: nextBirthday,
    formattedNextBirthday: nextBirthday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    badgeText
  };
}

export function formatFullDate(dateString) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function calculateAge(dobString) {
  if (!dobString) return 'N/A';
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}
