// Server-side input validation and plain-text sanitization helpers

export function sanitizePlainText(input, maxLength = 500) {
  if (typeof input !== 'string') return '';
  // Strip HTML tags to ensure plain text only
  const stripped = input.replace(/<[^>]*>?/gm, '').trim();
  return stripped.slice(0, maxLength);
}

export function isValidHttpUrl(string) {
  if (!string || typeof string !== 'string') return false;
  try {
    const url = new URL(string.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

export function validateBranch(branch) {
  const allowed = ['CSE', 'ECE', 'ME', 'Civil', 'BBA', 'Other'];
  return allowed.includes(branch) ? branch : 'Other';
}

export function validateSemester(semester) {
  const sem = parseInt(semester, 10);
  return sem >= 1 && sem <= 8 ? sem : 1;
}
