// Simple in-memory rate limiter middleware factory.
// NOT suitable for multi-process production without external store (Redis, etc.).
// Usage: router.post('/path', rateLimit('requirement-mod', { windowMs: 300000, max: 20 }), handler)

const buckets = new Map(); // key => { count, resetTs }

export function rateLimit(action, { windowMs = 60_000, max = 30 } = {}) {
  return function (req, res, next) {
    try {
      const userId = req.session?.user?._id || req.ip || 'anonymous';
      const bucketKey = `${action}:${userId}`;
      const now = Date.now();
      let bucket = buckets.get(bucketKey);
      if (!bucket || now > bucket.resetTs) {
        bucket = { count: 0, resetTs: now + windowMs };
        buckets.set(bucketKey, bucket);
      }
      bucket.count += 1;
      if (bucket.count > max) {
        const retryAfterMs = bucket.resetTs - now;
        res.setHeader('Retry-After', Math.ceil(retryAfterMs / 1000));
        return res.status(429).json({
          success: false,
          message: 'Rate limit exceeded',
          action,
          windowMs,
          max,
        });
      }
      next();
    } catch (err) {
      console.error('RateLimit middleware error', err);
      next(); // Fail open to avoid blocking legitimate traffic due to limiter error
    }
  };
}

// Optional helper to inspect current limiter state (debug only)
export function __rateLimitDebugDump() {
  const arr = [];
  for (const [key, v] of buckets.entries()) {
    arr.push({ key, count: v.count, resetTs: v.resetTs });
  }
  return arr;
}