import { RoomLocation } from "../models/index.js";
import { logAction } from "../middleware/audit.js";

// Public read (active rooms by optional campus)
export const listRooms = async (req, res) => {
  try {
    const { campus } = req.query;
    const filter = { active: true };
    if (campus) filter.campus = campus;

    const rooms = await RoomLocation.find(filter).sort({ name: 1 }).lean();
    return res.status(200).json({ items: rooms });
  } catch (err) {
    console.error("listRooms error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Admin list with filters
export const adminListRooms = async (req, res) => {
  try {
    const { q, campus, active } = req.query;
    const filter = {};
    if (campus) filter.campus = campus;
    if (active !== undefined) filter.active = String(active) === "true";
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { building: { $regex: q, $options: "i" } },
      ];
    }

    const rooms = await RoomLocation.find(filter)
      .sort({ campus: 1, name: 1 })
      .lean();
    return res.status(200).json({ items: rooms });
  } catch (err) {
    console.error("adminListRooms error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createRoom = async (req, res) => {
  try {
    const data = req.body || {};
    const room = await RoomLocation.create(data);

    logAction(req, {
      action: "room.create",
      targetType: "RoomLocation",
      targetId: room._id,
      organizationProfile: null,
      organizationName: null,
      meta: { name: room.name, campus: room.campus, type: room.type },
    });

    return res.status(201).json(room);
  } catch (err) {
    console.error("createRoom error:", err);
    if (err.code === 11000) {
      return res.status(409).json({ message: "Duplicate room for campus" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body || {};
    const room = await RoomLocation.findByIdAndUpdate(id, data, { new: true });
    if (!room) return res.status(404).json({ message: "Room not found" });

    logAction(req, {
      action: "room.update",
      targetType: "RoomLocation",
      targetId: room._id,
      organizationProfile: null,
      organizationName: null,
      meta: { name: room.name, campus: room.campus, type: room.type },
    });

    return res.status(200).json(room);
  } catch (err) {
    console.error("updateRoom error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const setRoomActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body || {};
    const room = await RoomLocation.findByIdAndUpdate(
      id,
      { active: Boolean(active) },
      { new: true }
    );
    if (!room) return res.status(404).json({ message: "Room not found" });

    logAction(req, {
      action: room.active ? "room.reactivate" : "room.deactivate",
      targetType: "RoomLocation",
      targetId: room._id,
      organizationProfile: null,
      organizationName: null,
      meta: { name: room.name, campus: room.campus },
    });

    return res.status(200).json(room);
  } catch (err) {
    console.error("setRoomActive error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
