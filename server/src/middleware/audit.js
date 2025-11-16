import { AuditLog } from "../models/index.js";

// Fire-and-forget audit logger. Never throws to caller.
export const logAction = (req, details) => {
  try {
    const sessionUser = req.session?.user || {};
    const {
      action,
      targetType,
      targetId,
      organizationProfile,
      organizationName,
      meta,
    } = details || {};

    const logDoc = {
      action,
      targetType,
      targetId,
      organizationProfile,
      organizationName,
      meta,
      actorId: sessionUser.userId || null,
      actorName: sessionUser.name || null,
      actorEmail: sessionUser.email || null,
      actorPosition: sessionUser.position || null,
      method: req.method,
      path: req.originalUrl || req.url,
      ip: (req.headers["x-forwarded-for"] || req.ip || "").toString(),
    };

    // Minimal validation
    if (!logDoc.action) return;

    // Do not block the request lifecycle
    Promise.resolve()
      .then(() => AuditLog.create(logDoc))
      .catch((err) => {
        // Swallow errors – logging should never break user flows
        console.error("Audit log write failed:", err?.message || err);
      });
  } catch (err) {
    // Last-resort catch
    console.error("logAction error:", err?.message || err);
  }
};
