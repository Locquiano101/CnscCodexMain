import { AuditLog } from "../models/index.js";

// GET /audit-logs?page=1&limit=20&action=...&orgProfile=...&role=...
export const ListAuditLogs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const skip = (page - 1) * limit;

    const { action, orgProfile, role, actorEmail, search, from, to } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (orgProfile) filter.organizationProfile = orgProfile;
    if (role) filter.actorPosition = role;
    if (actorEmail) filter.actorEmail = actorEmail;

    // Date window (default: last 30 days) to keep queries snappy
    const now = new Date();
    const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fromDate = from ? new Date(from) : defaultFrom;
    const toDate = to ? new Date(to) : now;
    if (!from && !to) {
      // Apply default window only when the client didn't specify
      filter.createdAt = { $gte: fromDate, $lte: toDate };
    } else if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = fromDate;
      if (to) filter.createdAt.$lte = toDate;
    }

    // Prefer text search if available for speed and relevance
    let useTextSearch = false;
    let textFilter = {};
    if (search && String(search).trim().length > 0) {
      useTextSearch = true;
      textFilter = { $text: { $search: String(search).trim() } };
    }

    const baseQuery = useTextSearch ? { ...filter, ...textFilter } : filter;

    // Projection: send only fields needed by the UI
    const projection = {
      action: 1,
      actorName: 1,
      actorEmail: 1,
      actorPosition: 1,
      targetType: 1,
      targetId: 1,
      organizationName: 1,
      organizationProfile: 1,
      meta: 1,
      createdAt: 1,
      // Exclude heavy/unused fields implicitly by not selecting them
    };

    // Fetch limit+1 to determine hasMore without a separate count
    const itemsRaw = await AuditLog.find(baseQuery)
      .select(projection)
      .sort(useTextSearch ? { score: { $meta: "textScore" }, _id: -1 } : { _id: -1 })
      .skip(skip)
      .limit(limit + 1)
      .lean();

    const hasMore = itemsRaw.length > limit;
    const items = hasMore ? itemsRaw.slice(0, limit) : itemsRaw;

    return res.status(200).json({
      page,
      limit,
      hasMore,
      nextPage: hasMore ? page + 1 : null,
      items,
    });
  } catch (err) {
    console.error("ListAuditLogs error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
