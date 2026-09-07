// Ghana Phone Number Utilities
const GHANA_CODE = '233';
const VALID_PREFIXES = [
  '20','23','24','25','26','27','28','29',
  '50','54','55','56','57','59'
];

/**
 * Normalize a Ghana phone number to +233XXXXXXXXX format.
 * Handles: 0201234567, 233201234567, +233201234567, 020-123-4567, etc.
 * Returns the cleaned input if it doesn't match Ghana format.
 */
export function normalizeGhanaPhone(input) {
  if (!input) return '';
  let digits = String(input).replace(/\D/g, '');

  // +233XXXXXXXXX or 233XXXXXXXXX (12 digits)
  if (digits.startsWith(GHANA_CODE) && digits.length === 12) {
    return '+' + digits;
  }
  // 0XXXXXXXXX (10 digits, local format)
  if (digits.startsWith('0') && digits.length === 10) {
    return '+' + GHANA_CODE + digits.substring(1);
  }
  // XXXXXXXXX (9 digits, no prefix)
  if (digits.length === 9 && VALID_PREFIXES.some(p => digits.startsWith(p))) {
    return '+' + GHANA_CODE + digits;
  }
  // Return trimmed original if we can't normalize
  return String(input).trim();
}

/**
 * Format for display: +233 20 123 4567
 */
export function formatPhoneDisplay(phone) {
  if (!phone) return '';
  const n = normalizeGhanaPhone(phone);
  if (n.startsWith('+233') && n.length === 13) {
    const r = n.substring(4);
    return `+233 ${r.substring(0, 2)} ${r.substring(2, 5)} ${r.substring(5)}`;
  }
  return phone;
}

/**
 * Validate as a Ghana mobile number.
 */
export function isValidGhanaPhone(phone) {
  if (!phone) return false;
  const n = normalizeGhanaPhone(phone);
  if (!n.startsWith('+233') || n.length !== 13) return false;
  return VALID_PREFIXES.includes(n.substring(4, 6));
}

/**
 * Generate a WhatsApp link.
 */
export function getWhatsAppLink(phone) {
  if (!phone) return '#';
  const n = normalizeGhanaPhone(phone);
  const digits = n.startsWith('+') ? n.substring(1) : n.replace(/\D/g, '');
  return `https://wa.me/${digits}`;
}

/**
 * Check if two phone numbers likely refer to the same person.
 */
export function phonesMatch(a, b) {
  if (!a || !b) return false;
  return normalizeGhanaPhone(a) === normalizeGhanaPhone(b);
}
