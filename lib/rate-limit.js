// Lightweight best-effort server-side rate limiter for Next.js Route Handlers
const trackers = new Map();

/**
 * Check if an action is within rate limits
 * @param {string} identifier - Unique user id or IP
 * @param {string} action - Action category (e.g. 'chat', 'post', 'upload')
 * @param {number} limit - Maximum allowed requests in window
 * @param {number} windowMs - Window duration in milliseconds
 * @returns {{ allowed: boolean, remaining: number, resetInMs: number }}
 */
export function checkRateLimit(identifier, action, limit = 5, windowMs = 30000) {
  const key = `${action}:${identifier || 'anonymous'}`;
  const now = Date.now();
  const record = trackers.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, record.resetAt - now),
    };
  }

  record.count += 1;
  trackers.set(key, record);

  return {
    allowed: true,
    remaining: limit - record.count,
    resetInMs: Math.max(0, record.resetAt - now),
  };
}
