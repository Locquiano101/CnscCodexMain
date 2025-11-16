import {
  Accomplishment,
  SubAccomplishment,
  Document,
  User,
} from "../models/index.js";
import { logAction } from "../middleware/audit.js";

export const getAccomplishmentReportAll = async (req, res) => {
  try {
    const report = await Accomplishment.find()
      .populate("organizationProfile")
      .populate({
        path: "accomplishments",
        select:
          "category title description awardedPoints organization organizationProfile documents",
        populate: {
          path: "documents",
          select: "label fileName status",
        },
      })
      .select("accomplishments grandTotal organizationProfile");

    // Map to clean the response: we remove organizationProfile from sub-accomplishments
    const cleanedReport = report.map((item) => {
      const accomplishments = item.accomplishments.map((acc) => {
        // Keep documents but remove redundant org profile inside them
        const documents = acc.documents.map((doc) => ({
          _id: doc._id,
          label: doc.label,
          fileName: doc.fileName,
          status: doc.status,
        }));

        return {
          _id: acc._id,
          category: acc.category,
          title: acc.title,
          description: acc.description,
          awardedPoints: acc.awardedPoints,
          organization: acc.organization,
          documents,
        };
      });

      return {
        _id: item._id,
        accomplishments,
        organizationProfile: item.organizationProfile, // only once here
        grandTotal: item.grandTotal,
      };
    });

    return res.status(200).json(cleanedReport);
  } catch (error) {
    console.error("❌ Error fetching accomplishment report:", error);
    return res.status(500).json({
      error: "Failed to retrieve accomplishment report.",
    });
  }
};

export const gradeAccomplishment = async (req, res) => {
  try {
    const { accomplishmentId, grading } = req.body;

    if (!accomplishmentId || !grading) {
      return res
        .status(400)
        .json({ message: "Missing accomplishment ID or grading data" });
    }

    // Find the sub-accomplishment and update its grading
    const subAccomplishment = await SubAccomplishment.findByIdAndUpdate(
      accomplishmentId,
      {
        $set: {
          grading: grading,
          awardedPoints: grading.totalPoints, // update awardedPoints for the sub-accomplishment
        },
      },
      { new: true }
    );

    if (!subAccomplishment) {
      return res.status(404).json({ message: "Sub-accomplishment not found" });
    }

    // Optionally, update aggregated totals in parent accomplishment
    if (subAccomplishment.organizationProfile) {
      const parent = await Accomplishment.findOne({
        organizationProfile: subAccomplishment.organizationProfile,
        accomplishments: accomplishmentId,
      });

      if (parent) {
        // Example: recalculate grandTotal (sum of all awardedPoints)
        const subAccomplishments = await SubAccomplishment.find({
          _id: { $in: parent.accomplishments },
        });

        const grandTotal = subAccomplishments.reduce(
          (sum, sub) => sum + (sub.awardedPoints || 0),
          0
        );

        parent.grandTotal = grandTotal;
        await parent.save();
      }
    }

    // 📝 Audit log: accomplishment grading updated
    logAction(req, {
      action: "accomplishment.grade.update",
      targetType: "SubAccomplishment",
      targetId: subAccomplishment._id,
      organizationProfile: subAccomplishment.organizationProfile || null,
      organizationName: null,
      meta: {
        awardedPoints: subAccomplishment.awardedPoints,
        totalPoints: grading?.totalPoints,
      },
    });

    return res.status(200).json({
      message: "Grading saved successfully",
      subAccomplishment,
    });
  } catch (error) {
    console.error("Error grading accomplishment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Update Accomplishment status (similar to ProposalConduct)
export const updateAccomplishmentStatus = async (req, res) => {
  try {
    const { accomplishmentId } = req.params;
    const {
      overallStatus,
      inquiryText,
      inquirySubject,
      userName,
      userPosition,
      orgProfileId,
      orgName,
    } = req.body;

    // 🔎 Find Accomplishment by ID
    const accomplishment = await SubAccomplishment.findById(
      accomplishmentId
    ).populate("documents");

    if (!accomplishment) {
      return res
        .status(404)
        .json({ success: false, message: "Accomplishment not found" });
    }

    // ✅ Update Accomplishment
    if (overallStatus) {
      accomplishment.overallStatus = overallStatus;
    }

    if (inquiryText) {
      accomplishment.revision = inquiryText;
    }

    // ✅ Update all linked Documents
    if (accomplishment.documents?.length > 0) {
      for (let doc of accomplishment.documents) {
        if (overallStatus) {
          doc.status = overallStatus; // or map status differently if needed
        }
        if (inquiryText) {
          doc.revisionNotes = inquiryText;
        }

        // optional log entry
        doc.logs.push(
          `[${new Date().toISOString()}] Updated by ${userName} (${userPosition}) → Status: ${overallStatus}`
        );

        await doc.save();
      }
    }

    await accomplishment.save();

    // 📝 Audit log
    logAction(req, {
      action: "accomplishment.status.update",
      targetType: "SubAccomplishment",
      targetId: accomplishment._id,
      organizationProfile: orgProfileId || accomplishment.organizationProfile || null,
      organizationName: orgName || null,
      meta: {
        overallStatus: accomplishment.overallStatus || overallStatus,
        inquiryText: inquiryText || null,
      },
    });

    // 📧 Optional: Send email inquiry
    if (inquiryText && inquirySubject) {
      const users = await User.find({
        organizationProfile: orgProfileId,
        position: { $ne: "Adviser" },
      }).select("email");

      if (users?.length > 0) {
        const recipientEmails = users.map((u) => u.email).filter(Boolean);

        if (recipientEmails.length > 0) {
          const message = `
Hello ${orgName},

An accomplishment status update has been submitted.

Details:
- From: ${userName} || ${userPosition}
- Status: ${accomplishment.overallStatus}
- Message:
${inquiryText}

Please log in to the system to review.

Thank you,
Accreditation Support Team
          `;

          await NodeEmail(recipientEmails, inquirySubject, message);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Accomplishment and documents updated successfully",
      accomplishment,
    });
  } catch (error) {
    console.error("❌ Error updating Accomplishment:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getAccomplishmentReportByOrg = async (req, res) => {
  try {
    const { OrgProfileId } = req.params;

    if (!OrgProfileId) {
      return res.status(400).json({ error: "Missing organizationProfile ID." });
    }

    let report = await Accomplishment.findOne({
      organizationProfile: OrgProfileId,
    })
      .populate({
        path: "accomplishments",
        populate: [
          { path: "proposal" },
          { path: "documents" }, // ✅ corrected
        ],
      })
      .select("accomplishments grandTotal");

    if (!report) {
      report = new Accomplishment({
        organizationProfile: OrgProfileId,
        accomplishments: [],
        totalOrganizationalDevelopment: 0,
        totalOrganizationalPerformance: 0,
        totalServiceCommunity: 0,
        grandTotal: 0,
      });

      await report.save();

      report = await Accomplishment.findById(report._id).populate({
        path: "accomplishments",
        populate: [
          { path: "proposal" },
          { path: "documents" }, // ✅ corrected
        ],
      });
    }

    return res.status(200).json(report);
  } catch (error) {
    console.error("❌ Error fetching/creating accomplishment report:", error);
    return res
      .status(500)
      .json({ error: "Failed to retrieve or create accomplishment report." });
  }
};

// ✅ Add a Sub-Accomplishment (PPA, Meeting, Award, etc.)
export const addAccomplishment = async (req, res) => {
  try {
    const {
      accomplishmentId,
      category,
      title,
      level,
      proposal,
      description,
      date,
      documents,
      organization,
      organizationProfile,
      awardedPoints,
    } = req.body;

    // ✅ Validate required fields
    if (!accomplishmentId || !category) {
      return res.status(400).json({
        error: "Missing required fields (accomplishmentId or category).",
      });
    }

    // ✅ Find parent accomplishment report
    const report = await Accomplishment.findById(accomplishmentId);
    if (!report) {
      return res
        .status(404)
        .json({ error: "Accomplishment report not found." });
    }

    // ✅ Build only the provided fields
    const subAccData = {
      category,
      ...(title && { title }),
      ...(proposal && { proposal }),
      ...(level && { level }),
      ...(description && { description }),
      ...(date && { date }),
      ...(documents && documents.length > 0 && { documents }),
      ...(organization && { organization }),
      ...(organizationProfile && { organizationProfile }),
      ...(typeof awardedPoints === "number" && { awardedPoints }),
    };

    // ✅ Create SubAccomplishment
    const subAcc = new SubAccomplishment(subAccData);
    await subAcc.save();

    // ✅ Link to parent report
    report.accomplishments.push(subAcc._id);
    await report.save();

    // 📝 Audit log
    logAction(req, {
      action: "accomplishment.add",
      targetType: "SubAccomplishment",
      targetId: subAcc._id,
      organizationProfile: organizationProfile || report.organizationProfile || null,
      organizationName: organization || null,
      meta: { category, title },
    });

    return res.status(201).json({
      message: "Sub-accomplishment added successfully.",
      subAccomplishment: subAcc,
    });
  } catch (error) {
    console.error("❌ Error adding sub-accomplishment:", error);
    return res.status(500).json({ error: "Failed to add sub-accomplishment." });
  }
};

export const AddDocumentToSubAccomplishment = async (req, res) => {
  try {
    const { subAccomplishmentId } = req.body;
    const documentId = res.locals.documentId;

    if (!subAccomplishmentId) {
      return res
        .status(400)
        .json({ error: "Missing subAccomplishmentId in request body." });
    }

    const subAcc = await SubAccomplishment.findById(subAccomplishmentId).populate({
      path: "organizationProfile",
      select: "orgName",
    });
    if (!subAcc) {
      return res.status(404).json({ error: "Sub-accomplishment not found." });
    }

    // ✅ Push the new document into documents array
    subAcc.documents.push(documentId);
    await subAcc.save();

    // Optionally load document info for better meta readability
    let docMeta = { documentId };
    try {
      const doc = await Document.findById(documentId).select("fileName label status");
      if (doc) {
        docMeta = { documentId, fileName: doc.fileName, label: doc.label, status: doc.status };
      }
    } catch (_e) {}

    // 📝 Audit log: accomplishment document added
    logAction(req, {
      action: "accomplishment.document.add",
      targetType: "SubAccomplishment",
      targetId: subAcc._id,
      organizationProfile: subAcc.organizationProfile || null,
      organizationName: subAcc.organizationProfile?.orgName || null,
      meta: docMeta,
    });

    return res.status(201).json({
      message: "Document uploaded and linked to sub-accomplishment.",
      documentId,
      subAccomplishment: subAcc,
    });
  } catch (error) {
    console.error("❌ Error linking document:", error);
    return res.status(500).json({ error: "Failed to link document." });
  }
};

export const updateAccomplishment = async (req, res) => {
  const { id } = req.params;
  const { logMessage } = req.body; // pass new fileName from frontend

  try {
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    const oldFileName = res.locals.fileName;
    const newFileName = document.fileName; // current file before replacement
    // ✅ Format the current date/time
    const formattedDate = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "short", // "Sep"
      day: "numeric", // "14"
      hour: "2-digit", // "09"
      minute: "2-digit", // "49"
      hour12: true, // AM/PM
    });

    // ✅ Push log with detailed info
    document.logs.push(
      logMessage ||
        `Document replaced from "${oldFileName}" to "${newFileName}" at ${formattedDate}`
    );

    await document.save();

    // 📝 Audit log: accomplishment document updated
    logAction(req, {
      action: "accomplishment.document.update",
      targetType: "Document",
      targetId: document._id,
      organizationProfile: document.organizationProfile || null,
      organizationName: null,
      meta: { from: oldFileName, to: newFileName },
    });

    return res.status(200).json({
      message: "Log added to document successfully",
      document,
    });
  } catch (error) {
    console.error("❌ Error updating document logs:", error);
    return res.status(500).json({
      error: "Failed to update document logs",
      details: error.message,
    });
  }
};

// Reset all accomplishment grades for an organization profile, preserving history
export const resetAccomplishmentGradesForOrg = async (req, res) => {
  try {
    const { OrgProfileId } = req.params;
    const { resetBy, reason } = req.body || {};

    if (!OrgProfileId) {
      return res.status(400).json({ success: false, message: "Missing organization profile id" });
    }

    // Find parent report
    const report = await Accomplishment.findOne({ organizationProfile: OrgProfileId });
    if (!report) {
      return res.status(404).json({ success: false, message: "Accomplishment report not found" });
    }

    // Load all sub accomplishments
    const subs = await SubAccomplishment.find({ _id: { $in: report.accomplishments } });

    let modifiedCount = 0;
    for (const sub of subs) {
      const prevAwarded = sub.awardedPoints || 0;
      const prevGrading = sub.grading || {};

      // Only snapshot when there is something to preserve
      const hadPointsOrGrading = prevAwarded > 0 || (prevGrading && (prevGrading.totalPoints || 0) > 0);
      if (hadPointsOrGrading) {
        sub.gradingHistory = sub.gradingHistory || [];
        sub.gradingHistory.push({
          snapshotAt: new Date(),
          reason: reason || "reset",
          resetBy: resetBy || "System",
          awardedPoints: prevAwarded,
          grading: prevGrading,
        });
      }

      // Reset current grading
      sub.grading = {
        totalPoints: 0,
        maxPoints: prevGrading?.maxPoints,
        breakdown: {},
        comments: "",
        status: "Pending",
        gradedAt: undefined,
        gradedBy: undefined,
      };
      sub.awardedPoints = 0;

      await sub.save();
      modifiedCount++;
    }

    // Recompute grand total (will be 0 after reset)
    report.grandTotal = 0;
    await report.save();

    return res.status(200).json({
      success: true,
      message: `Reset grades for ${modifiedCount} accomplishments`,
      grandTotal: report.grandTotal,
    });
  } catch (err) {
    console.error("❌ Error resetting accomplishment grades:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
