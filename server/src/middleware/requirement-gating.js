import { AccreditationRequirement } from "../models/index.js";

// Simple in-memory cache of enabled requirement keys.
let enabledCache = new Set();
let lastLoadTs = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute; cheap to refresh

async function refreshCache(force = false) {
  const now = Date.now();
  if (!force && now - lastLoadTs < CACHE_TTL_MS) return enabledCache;
  const rows = await AccreditationRequirement.find({ enabled: true }).select("key");
  enabledCache = new Set(rows.map((r) => r.key));
  lastLoadTs = now;
  return enabledCache;
}

export async function requirementEnabled(key) {
  await refreshCache();
  return enabledCache.has(key);
}

// Middleware factory – only enforces when env toggle is on.
export function enforceRequirement(key) {
  return async (req, res, next) => {
    try {
      if (process.env.ENABLE_REQUIREMENT_GATING !== "true") return next();
      const ok = await requirementEnabled(key);
      if (!ok) {
        return res.status(403).json({
          success: false,
          message: "Accreditation requirement disabled",
          requirement: key,
        });
      }
      next();
    } catch (err) {
      console.error("Requirement gating error", err);
      return res.status(500).json({ success: false, error: "Gating failure" });
    }
  };
}

// Cache invalidation helper
export async function invalidateRequirementsCache() {
  await refreshCache(true);
}
