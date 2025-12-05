import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { AccreditationRequirement, Document } from "../models/index.js";
import { logAction } from "../middleware/audit.js";
import { invalidateRequirementsCache } from "../middleware/requirement-gating.js";
import { RequirementSubmission } from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_ROOT = path.join(__dirname, "../../uploads/requirements");
// 25MB default limit (previously 10MB); override via env REQUIREMENT_MAX_FILE_MB
const MAX_FILE_BYTES =
  (parseInt(process.env.REQUIREMENT_MAX_FILE_MB, 10) || 25) * 1024 * 1024;
const ALLOWED_MIME = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function slugify(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /accreditation/requirements/visible
export async function listVisibleRequirements(req, res) {
  try {
    const rows = await AccreditationRequirement.find({ enabled: true }).select(
      "key title type"
    );
    // console.log("📋 listVisibleRequirements returning:", rows.length, "requirements");
    // console.log("   Types:", rows.map(r => `${r.type}:${r.key}`).join(", "));
    return res.json(rows);
  } catch (err) {
    console.error("listVisibleRequirements error", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// GET /admin/accreditation/requirements (optional filters)
export async function listAllRequirements(req, res) {
  try {
    const { type, includeDisabled } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (!includeDisabled) filter.enabled = { $ne: false }; // show both true & undefined but not false
    const rows = await AccreditationRequirement.find(filter).sort({
      type: 1,
      key: 1,
    });
    return res.json({ items: rows });
  } catch (err) {
    console.error("listAllRequirements error", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// POST /admin/accreditation/requirements (multipart: file optional but recommended)
export async function createCustomRequirement(req, res) {
  try {
    const { title, description } = req.body;
    if (!title)
      return res
        .status(400)
        .json({ success: false, message: "Title required" });
    const key = slugify(title);
    // ensure unique
    const existing = await AccreditationRequirement.findOne({ key });
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "Requirement key already exists" });

    let documentId = null;
    let storedName = null;
    if (req.file) {
      if (req.file.size > MAX_FILE_BYTES) {
        return res
          .status(413)
          .json({
            success: false,
            message: `File too large. Max ${(
              MAX_FILE_BYTES /
              1024 /
              1024
            ).toFixed(0)}MB`,
          });
      }
      if (!ALLOWED_MIME.includes(req.file.mimetype)) {
        return res
          .status(415)
          .json({
            success: false,
            message: `Unsupported file type: ${req.file.mimetype}`,
          });
      }
      ensureDir(UPLOAD_ROOT);
      const requirementFolder = path.join(UPLOAD_ROOT, key);
      ensureDir(requirementFolder);
      storedName = `${Date.now()}_${req.file.originalname}`;
      fs.writeFileSync(
        path.join(requirementFolder, storedName),
        req.file.buffer
      );
      const doc = await Document.create({
        label: "Accreditation Custom Requirement",
        fileName: storedName,
        organization: null,
        organizationProfile: null,
        status: "Uploaded",
        logs: [
          `[${new Date().toISOString()}] Uploaded custom accreditation requirement file ${storedName}`,
        ],
      });
      documentId = doc._id;
    }

    const requirement = await AccreditationRequirement.create({
      key,
      type: "custom",
      title,
      description,
      removable: true,
      enabled: true,
      document: documentId,
      createdBy: req.session?.user?._id || null,
    });

    await invalidateRequirementsCache();

    logAction(req, {
      action: "requirement.create",
      targetType: "AccreditationRequirement",
      targetId: requirement._id,
      meta: { key, title },
    });

    if (req.file) {
      logAction(req, {
        action: "requirement.document.upload",
        targetType: "AccreditationRequirement",
        targetId: requirement._id,
        meta: {
          key,
          fileName: storedName,
          size: req.file.size,
          mimeType: req.file.mimetype,
          version: 1,
        },
      });
    }

    return res.status(201).json({ success: true, requirement });
  } catch (err) {
    console.error("createCustomRequirement error", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// PATCH /admin/accreditation/requirements/:id (title, description, optional new file)
export async function updateRequirement(req, res) {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const requirement = await AccreditationRequirement.findById(id);
    if (!requirement)
      return res.status(404).json({ success: false, message: "Not found" });
    const changed = [];
    if (title && title !== requirement.title) {
      // Optional uniqueness check: do not allow title change that would collide on slug with another requirement's key
      const newSlug = slugify(title);
      if (requirement.type === "custom" && newSlug !== requirement.key) {
        const collision = await AccreditationRequirement.findOne({
          key: newSlug,
        });
        if (collision) {
          return res
            .status(409)
            .json({
              success: false,
              message: "Another requirement with similar title exists",
            });
        }
        // Keep original key stable to avoid breaking stored file structure; we only update title.
      }
      requirement.title = title;
      changed.push("title");
    }
    if (description !== undefined && description !== requirement.description) {
      requirement.description = description;
      changed.push("description");
    }

    if (req.file) {
      if (req.file.size > MAX_FILE_BYTES) {
        return res
          .status(413)
          .json({
            success: false,
            message: `File too large. Max ${(
              MAX_FILE_BYTES /
              1024 /
              1024
            ).toFixed(0)}MB`,
          });
      }
      if (!ALLOWED_MIME.includes(req.file.mimetype)) {
        return res
          .status(415)
          .json({
            success: false,
            message: `Unsupported file type: ${req.file.mimetype}`,
          });
      }
      // replace file
      ensureDir(UPLOAD_ROOT);
      const requirementFolder = path.join(UPLOAD_ROOT, requirement.key);
      ensureDir(requirementFolder);
      const storedName = `${Date.now()}_${req.file.originalname}`;
      fs.writeFileSync(
        path.join(requirementFolder, storedName),
        req.file.buffer
      );
      const doc = await Document.create({
        label: "Accreditation Custom Requirement",
        fileName: storedName,
        organization: null,
        organizationProfile: null,
        status: "Uploaded",
        logs: [
          `[${new Date().toISOString()}] Re-uploaded requirement file ${storedName}`,
        ],
      });
      requirement.document = doc._id;
      requirement.version = (requirement.version || 1) + 1;
      changed.push("document");
      // Separate audit record for document upload
      logAction(req, {
        action: "requirement.document.upload",
        targetType: "AccreditationRequirement",
        targetId: requirement._id,
        meta: {
          key: requirement.key,
          fileName: storedName,
          size: req.file.size,
          mimeType: req.file.mimetype,
          version: requirement.version,
        },
      });
    }

    await requirement.save();
    await invalidateRequirementsCache();

    logAction(req, {
      action: "requirement.update",
      targetType: "AccreditationRequirement",
      targetId: requirement._id,
      meta: { key: requirement.key, changed },
    });

    return res.json({ success: true, requirement });
  } catch (err) {
    console.error("updateRequirement error", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// PATCH /admin/accreditation/requirements/:id/enable { enabled }
export async function toggleRequirement(req, res) {
  try {
    const { id } = req.params;
    const { enabled } = req.body;
    if (typeof enabled !== "boolean")
      return res
        .status(400)
        .json({ success: false, message: "enabled boolean required" });
    const requirement = await AccreditationRequirement.findById(id);
    if (!requirement)
      return res.status(404).json({ success: false, message: "Not found" });
    const previousEnabled = requirement.enabled;
    requirement.enabled = enabled;
    await requirement.save(); // simple optimistic save
    await invalidateRequirementsCache();

    logAction(req, {
      action: enabled ? "requirement.enable" : "requirement.disable",
      targetType: "AccreditationRequirement",
      targetId: requirement._id,
      meta: { key: requirement.key, previousEnabled, newEnabled: enabled },
    });

    return res.json({ success: true, requirement });
  } catch (err) {
    console.error("toggleRequirement error", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// DELETE /admin/accreditation/requirements/:id
export async function deleteRequirement(req, res) {
  try {
    const { id } = req.params;
    const requirement = await AccreditationRequirement.findById(id);
    if (!requirement)
      return res.status(404).json({ success: false, message: "Not found" });
    if (!requirement.removable || requirement.type !== "custom") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot delete this requirement" });
    }
    // Attempt file cleanup
    const requirementFolder = path.join(UPLOAD_ROOT, requirement.key);
    let cleaned = false;
    if (fs.existsSync(requirementFolder)) {
      try {
        fs.rmSync(requirementFolder, { recursive: true, force: true });
        cleaned = true;
      } catch (cleanupErr) {
        console.error("Failed to cleanup requirement folder", cleanupErr);
      }
    }
    await AccreditationRequirement.deleteOne({ _id: id });
    await invalidateRequirementsCache();

    logAction(req, {
      action: "requirement.delete",
      targetType: "AccreditationRequirement",
      targetId: id,
      meta: { key: requirement.key, fileCleanup: cleaned },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("deleteRequirement error", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// GET /admin/accreditation/requirements/gating-status
export async function gatingStatus(req, res) {
  try {
    const enabledFlag = process.env.ENABLE_REQUIREMENT_GATING === "true";
    const rows = await AccreditationRequirement.find({ enabled: true }).select(
      "key title"
    );
    return res.json({
      gatingEnabled: enabledFlag,
      enabledKeys: rows.map((r) => r.key),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ================= Requirement Submissions (Student-side) =================
// POST /accreditation/requirements/:key/submit  (multipart file)
export async function submitRequirement(req, res) {
  try {
    const { key } = req.params;
    const { organizationProfile } = req.body; // org profile id
    if (!organizationProfile) {
      return res
        .status(400)
        .json({ success: false, message: "organizationProfile required" });
    }
    const requirement = await AccreditationRequirement.findOne({
      key,
      enabled: true,
    });
    if (!requirement) {
      return res
        .status(404)
        .json({ success: false, message: "Requirement not found or disabled" });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "File required" });
    }
    if (req.file.size > MAX_FILE_BYTES) {
      return res
        .status(413)
        .json({
          success: false,
          message: `File too large. Max ${(
            MAX_FILE_BYTES /
            1024 /
            1024
          ).toFixed(0)}MB`,
        });
    }
    if (!ALLOWED_MIME.includes(req.file.mimetype)) {
      return res
        .status(415)
        .json({
          success: false,
          message: `Unsupported file type: ${req.file.mimetype}`,
        });
    }
    // Ensure unique submission (one active submission per org+requirement). Allow overwrite by replacing.
    let submission = await RequirementSubmission.findOne({
      requirementKey: key,
      organizationProfile,
    });
    // New flat storage pattern: /uploads/<organizationProfile>/<storedName>
    // Previous pattern (nested): /uploads/requirements-submissions/<org>/<key>/<storedName>
    const flatFolder = path.join(
      __dirname,
      `../../uploads/${organizationProfile}`
    );
    ensureDir(flatFolder);
    const storedName = `req_${key}_${Date.now()}_${req.file.originalname}`;
    fs.writeFileSync(path.join(flatFolder, storedName), req.file.buffer);
    const doc = await Document.create({
      label: `Requirement Submission: ${key}`,
      fileName: storedName,
      organization: null,
      organizationProfile,
      status: "Uploaded",
      logs: [
        `[${new Date().toISOString()}] Uploaded requirement submission file ${storedName}`,
      ],
    });
    if (!submission) {
      submission = await RequirementSubmission.create({
        requirementKey: key,
        organizationProfile,
        document: doc._id,
        status: "Pending",
        uploadedBy: req.session?.user?._id || null,
        logs: [
          `[${new Date().toISOString()}] Created submission with document ${storedName}`,
        ],
      });
    } else {
      // Attempt migration of old nested file (if any) to flat folder (best-effort, non-blocking)
      try {
        const oldFolder = path.join(
          __dirname,
          `../../uploads/requirements-submissions/${organizationProfile}/${key}`
        );
        if (fs.existsSync(oldFolder)) {
          const oldFiles = fs.readdirSync(oldFolder);
          oldFiles.forEach((f) => {
            const oldPath = path.join(oldFolder, f);
            const newPath = path.join(flatFolder, f);
            if (!fs.existsSync(newPath)) {
              fs.copyFileSync(oldPath, newPath);
            }
          });
        }
      } catch (migrateErr) {
        console.warn(
          "submitRequirement: migration of old nested files failed",
          migrateErr.message
        );
      }
      submission.document = doc._id;
      submission.status = "Pending"; // reset status on re-upload
      submission.logs.push(
        `[${new Date().toISOString()}] Re-uploaded document ${storedName}`
      );
      await submission.save();
    }
    logAction(req, {
      action:
        submission.logs.length === 1
          ? "requirement.submission.create"
          : "requirement.submission.replace",
      targetType: "RequirementSubmission",
      targetId: submission._id,
      meta: {
        key,
        fileName: storedName,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
    // Build accessibleUrl (flat path) if file exists there
    let accessibleUrl = null;
    try {
      const flatPath = path.join(
        __dirname,
        `../../uploads/${organizationProfile}/${storedName}`
      );
      if (fs.existsSync(flatPath)) {
        accessibleUrl = `/uploads/${organizationProfile}/${storedName}`;
      }
    } catch {}
    return res.status(201).json({ success: true, submission, accessibleUrl });
  } catch (err) {
    console.error("submitRequirement error", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// GET /accreditation/requirements/:key/submission/:orgId
export async function getRequirementSubmission(req, res) {
  try {
    const { key, orgId } = req.params;
    const requirement = await AccreditationRequirement.findOne({
      key,
      enabled: true,
    });
    if (!requirement) {
      return res
        .status(404)
        .json({ success: false, message: "Requirement not found or disabled" });
    }
    const submission = await RequirementSubmission.findOne({
      requirementKey: key,
      organizationProfile: orgId,
    }).populate("document");
    if (!submission) return res.json({ success: true, submission: null });
    // Determine accessibleUrl: prefer flat path but fall back to legacy nested
    let accessibleUrl = null;
    try {
      if (submission.document?.fileName) {
        const flatCandidate = path.join(
          __dirname,
          `../../uploads/${orgId}/${submission.document.fileName}`
        );
        if (fs.existsSync(flatCandidate)) {
          accessibleUrl = `/uploads/${orgId}/${submission.document.fileName}`;
        } else {
          const legacyCandidate = path.join(
            __dirname,
            `../../uploads/requirements-submissions/${orgId}/${key}/${submission.document.fileName}`
          );
          if (fs.existsSync(legacyCandidate)) {
            accessibleUrl = `/uploads/requirements-submissions/${orgId}/${key}/${submission.document.fileName}`;
          }
        }
      }
    } catch {}
    return res.json({ success: true, submission, accessibleUrl });
  } catch (err) {
    console.error("getRequirementSubmission error", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// GET /admin/accreditation/requirements/:key/submissions  (list all submissions for requirement)
export async function listRequirementSubmissions(req, res) {
  try {
    const { key } = req.params;
    const submissions = await RequirementSubmission.find({
      requirementKey: key,
    })
      .populate("document")
      .populate("organizationProfile");
    const items = submissions.map((sub) => {
      const orgId = sub.organizationProfile?._id?.toString();
      const fileName = sub.document?.fileName;
      let accessibleUrl = null;
      if (orgId && fileName) {
        const flat = path.join(__dirname, `../../uploads/${orgId}/${fileName}`);
        if (fs.existsSync(flat)) {
          accessibleUrl = `/uploads/${orgId}/${fileName}`;
        } else {
          const legacy = path.join(
            __dirname,
            `../../uploads/requirements-submissions/${orgId}/${key}/${fileName}`
          );
          if (fs.existsSync(legacy)) {
            accessibleUrl = `/uploads/requirements-submissions/${orgId}/${key}/${fileName}`;
          }
        }
      }
      return {
        id: sub._id,
        requirementKey: sub.requirementKey,
        organizationProfile: orgId,
        organizationName:
          sub.organizationProfile?.organizationName ||
          sub.organizationProfile?.organization ||
          null,
        status: sub.status,
        fileName,
        accessibleUrl,
        updatedAt: sub.updatedAt,
        createdAt: sub.createdAt,
        logs: sub.logs || [],
      };
    });
    return res.json({ success: true, items });
  } catch (err) {
    console.error("listRequirementSubmissions error", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// PATCH /admin/accreditation/requirements/:key/submissions/:submissionId/status
// Body: { status: 'Approved' | 'Rejected' | 'Pending', note?: string }
export async function updateRequirementSubmissionStatus(req, res) {
  try {
    const { key, submissionId } = req.params;
    const { status, note } = req.body || {};
    const allowed = [
      "Pending",
      "AdviserApproved",
      "DeanApproved",
      "Approved",
      "RevisionRequested",
      "Rejected",
    ];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }
    const submission = await RequirementSubmission.findOne({
      _id: submissionId,
      requirementKey: key,
    })
      .populate("document")
      .populate("organizationProfile");
    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found" });
    }
    const actorRole = String(req.session?.user?.position || "").toLowerCase();
    const sduRoles = ["sdu", "sdu coordinator", "sdu-coordinator", "sdu-main"];
    const current = submission.status;

    // Disallow manual setting back to Pending (only via re-upload)
    if (status === "Pending" && current !== "Pending") {
      return res
        .status(409)
        .json({
          success: false,
          message: "Cannot revert to Pending manually; re-upload required.",
        });
    }

    // Transition validation
    let valid = false;
    if (actorRole === "adviser") {
      if (
        current === "Pending" &&
        ["AdviserApproved", "RevisionRequested", "Rejected"].includes(status)
      )
        valid = true;
    } else if (actorRole === "dean") {
      if (
        current === "AdviserApproved" &&
        ["DeanApproved", "RevisionRequested", "Rejected"].includes(status)
      )
        valid = true;
    } else if (sduRoles.includes(actorRole)) {
      if (
        current === "DeanApproved" &&
        ["Approved", "RevisionRequested", "Rejected"].includes(status)
      )
        valid = true;
    } else {
      // Other roles (student-leader etc.) cannot change status
      return res
        .status(403)
        .json({
          success: false,
          message: "Role not permitted to change submission status",
        });
    }

    // Allow repeated setting of RevisionRequested or Rejected at same stage (e.g. add note)
    if (
      !valid &&
      ["RevisionRequested", "Rejected"].includes(status) &&
      current === status
    ) {
      valid = true; // allow log append
    }

    if (!valid) {
      return res
        .status(409)
        .json({
          success: false,
          message: `Invalid transition from ${current} to ${status} for role ${actorRole}`,
        });
    }
    // Update status & push log
    submission.status = status;
    const actor =
      req.session?.user?.fullName ||
      req.session?.user?.name ||
      req.session?.user?.email ||
      "system";
    const ts = new Date().toISOString();
    submission.logs = submission.logs || [];
    submission.logs.push(
      `[${ts}] Status set to ${status} by ${actor}${note ? ` - ${note}` : ""}`
    );
    await submission.save();

    // Build accessibleUrl similar to listing logic
    let accessibleUrl = null;
    const orgId = submission.organizationProfile?._id?.toString();
    const fileName = submission.document?.fileName;
    if (orgId && fileName) {
      try {
        const flat = path.join(__dirname, `../../uploads/${orgId}/${fileName}`);
        if (fs.existsSync(flat)) {
          accessibleUrl = `/uploads/${orgId}/${fileName}`;
        } else {
          const legacy = path.join(
            __dirname,
            `../../uploads/requirements-submissions/${orgId}/${key}/${fileName}`
          );
          if (fs.existsSync(legacy)) {
            accessibleUrl = `/uploads/requirements-submissions/${orgId}/${key}/${fileName}`;
          }
        }
      } catch {}
    }

    logAction(req, {
      action: "requirement.submission.status",
      targetType: "RequirementSubmission",
      targetId: submission._id,
      organizationProfile: submission.organizationProfile?._id || null,
      meta: { key, status, note: note || null },
    });

    return res.json({
      success: true,
      submission: {
        id: submission._id,
        requirementKey: submission.requirementKey,
        organizationProfile: orgId,
        organizationName:
          submission.organizationProfile?.organizationName ||
          submission.organizationProfile?.organization ||
          null,
        status: submission.status,
        fileName,
        accessibleUrl,
        logs: submission.logs,
        updatedAt: submission.updatedAt,
        createdAt: submission.createdAt,
      },
    });
  } catch (err) {
    console.error("updateRequirementSubmissionStatus error", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
