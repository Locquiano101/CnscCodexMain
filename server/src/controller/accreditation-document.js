import { NodeEmail } from "../middleware/emailer.js";
import {
  Accreditation,
  Document,
  OrganizationProfile,
  Notification,
  User,
} from "../models/index.js";

export const GetAccreditationDocumentsByOrg = async (req, res) => {
  const orgProfileId = req.params.orgProfileId;

  try {
    let accreditation = await Accreditation.findOne({
      organizationProfile: orgProfileId,
      isActive: true, // only fetch if active
    })
      .populate([
        "JointStatement",
        "PledgeAgainstHazing",
        "ConstitutionAndByLaws",
      ])
      .select(" JointStatement PledgeAgainstHazing ConstitutionAndByLaws  ") // only return document fields
      .exec();

    if (!accreditation) {
      return res.status(404).json({
        message: "No active accreditation found for this organization.",
      });
    }

    res.status(200).json(accreditation);
  } catch (error) {
    console.error("Error fetching accreditation documents:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const GetAccreditationDocumentsAll = async (req, res) => {
  try {
    let accreditation = await Accreditation.find({
      isActive: true, // only fetch if active
    })
      .populate([
        "JointStatement",
        "PledgeAgainstHazing",
        "ConstitutionAndByLaws",
        "organizationProfile",
      ])
      .select(
        "organizationProfile JointStatement PledgeAgainstHazing ConstitutionAndByLaws  "
      ) // only return document fields
      .exec();

    if (!accreditation) {
      return res.status(404).json({
        message: "No active accreditation found for this organization.",
      });
    }

    res.status(200).json(accreditation);
  } catch (error) {
    console.error("Error fetching accreditation documents:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const DeactivateAllAccreditations = async (req, res) => {
  try {
    // Deactivate all accreditation records
    const result = await Accreditation.updateMany(
      {},
      { $set: { isActive: false } }
    );

    // Deactivate all organization profiles
    const resultOrganizationProfile = await OrganizationProfile.updateMany(
      {},
      { $set: { isActive: false } }
    );

    // Get all users (only their email)
    const users = await User.find().select("email");

    // Extract all emails into an array
    const recipientEmails = users.map((user) => user.email);

    // Email content
    const subject =
      "Accreditation System Notice: All Accreditations Deactivated";
    const message = `
Hello,

Please be informed that all accreditations and organization profiles have been temporarily deactivated by the system administrator.

If you have any questions or require clarification, please contact the SDU Main Office.

Thank you,
Accreditation Support Team
    `;

    // Send email notification to all users
    await NodeEmail(recipientEmails, subject, message);

    // Respond to client
    res.status(200).json({
      success: true,
      message:
        "All accreditations and organization profiles have been deactivated, and notifications sent.",
      modifiedAccreditations: result.modifiedCount,
      modifiedOrganizations: resultOrganizationProfile.modifiedCount,
      notifiedUsers: recipientEmails.length,
    });
  } catch (error) {
    console.error("Error deactivating accreditations:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export const GetAllAccreditationId = async (req, res) => {
  try {
    const accreditations = await Accreditation.find({}).populate([
      "organizationProfile",
      "FinancialReport",
      "JointStatement",
      "PledgeAgainstHazing",
      "ConstitutionAndByLaws",
      "Roster",
      "PresidentProfile",
    ]);

    // Filter out any accreditation that has missing (null) populated fields
    const filtered = accreditations.filter(
      (acc) =>
        acc.organizationProfile &&
        acc.FinancialReport &&
        acc.JointStatement &&
        acc.PledgeAgainstHazing &&
        acc.ConstitutionAndByLaws &&
        acc.Roster &&
        acc.PresidentProfile
    );

    res.status(200).json(filtered);
  } catch (error) {
    console.error("Error fetching accreditation IDs:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const GetAccreditationById = async (req, res) => {
  try {
    const { id } = req.params; // this is the organizationProfile id

    const accreditation = await Accreditation.findOne({
      organizationProfile: id,
    })
      .populate([
        "organizationProfile",
        "FinancialReport",
        "JointStatement",
        "PledgeAgainstHazing",
        "ConstitutionAndByLaws",
        "Roster",
        "PresidentProfile",
      ])
      .populate({
        path: "organizationProfile",
        populate: [
          { path: "adviser" }, // 👈 populate adviser
          { path: "orgPresident" }, // (optional, if you also want president info)
        ],
      });

    if (!accreditation) {
      return res.status(404).json({ error: "Accreditation not found" });
    }

    res.status(200).json(accreditation);
  } catch (error) {
    console.error(
      "Error fetching accreditation by organizationProfile ID:",
      error
    );
    res.status(500).json({ error: "Server error" });
  }
};

export const UpdateDocumentStatus = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { status, revisionNotes } = req.body;

    if (!documentId) {
      return res
        .status(400)
        .json({ success: false, message: "Document ID is required." });
    }
    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required." });
    }

    // 🔹 Fetch the document with its linked organization profile
    const document = await Document.findById(documentId).populate(
      "organizationProfile"
    );

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found." });
    }

    // 🔹 Handle revision validation
    if (status.toLowerCase().includes("revision")) {
      if (!revisionNotes || revisionNotes.trim() === "") {
        return res.status(400).json({
          success: false,
          message:
            "Revision notes are required when setting status to revision.",
        });
      }
    }

    // 🔹 Update the document
    document.status = status;
    if (revisionNotes && revisionNotes.trim() !== "") {
      document.revisionNotes = revisionNotes;
    }
    await document.save();

    // 🔹 Find all users linked to this organization profile
    const connectedUsers = await User.find({
      organizationProfile: document.organizationProfile?._id,
    }).select("email name");

    if (!connectedUsers.length) {
      return res.status(404).json({
        success: false,
        message: "No connected users found for this document.",
      });
    }

    const recipientEmails = connectedUsers.map((u) => u.email);

    // ✅ Prepare email content
    const subject = `Document Status Updated — ${status}`;
    const message = `
Hello,

The document titled "${
      document.fileName || "an organization document"
    }" has been updated.

📋 Status: ${status}
${revisionNotes ? `📝 Revision Notes: ${revisionNotes}` : ""}

Please log in to the accreditation system to view the full details.

Thank you,
Accreditation Support Team
`;

    // ✅ Send email to all connected users
    await NodeEmail(recipientEmails, subject, message);

    // ✅ Create notification record
    const notifMessage = `Document "${
      document.fileName || "Untitled"
    }" status updated to "${status}".`;

    const notification = new Notification({
      organizationProfile: document.organizationProfile?._id,
      department: document.organizationProfile?.orgDepartment || "N/A",
      type: "Accreditation Update",
      message: notifMessage,
      data: {
        documentId,
        status,
        revisionNotes: revisionNotes || null,
      },
    });

    await notification.save();

    // ✅ Respond
    return res.status(200).json({
      success: true,
      message: `Document status updated to "${status}", notifications sent, and log recorded.`,
      updatedDocument: document,
      notifiedUsers: recipientEmails,
      notificationLog: notification,
    });
  } catch (error) {
    console.error("❌ Error updating document status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const AddAccreditationDocument = async (req, res) => {
  try {
    const { accreditationId, docType } = req.body; // docType must be one of the valid fields
    const documentId = res.locals.documentId; // from file upload middleware

    if (!documentId) {
      return res.status(400).json({ error: "Missing documentId" });
    }

    if (!accreditationId) {
      return res.status(400).json({ error: "Missing accreditationId" });
    }

    const accreditation = await Accreditation.findById(accreditationId);

    if (!accreditation) {
      return res.status(404).json({ error: "Accreditation not found" });
    }

    // Use if-else to assign based on docType
    if (docType === "JointStatement") {
      accreditation.JointStatement = documentId;
    } else if (docType === "PledgeAgainstHazing") {
      accreditation.PledgeAgainstHazing = documentId;
    } else if (docType === "ConstitutionAndByLaws") {
      accreditation.ConstitutionAndByLaws = documentId;
    } else {
      return res.status(400).json({ error: "Invalid document type" });
    }

    await accreditation.save();

    res.status(200).json({
      message: `${docType} uploaded and linked successfully to accreditation`,
      accreditation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const GetAllAccreditationDetails = async (req, res) => {
  try {
    const accreditation = await Accreditation.find()
      .populate([
        "organizationProfile",
        "JointStatement",
        "FinancialReport",
        "PledgeAgainstHazing",
        "Roster",
        "ConstitutionAndByLaws",
        "PresidentProfile",
      ])
      .exec();

    res.status(200).json(accreditation);
  } catch (error) {
    console.error("Error handling accreditation request:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const GetAccreditationDetails = async (req, res) => {
  const orgProfileId = req.params.orgProfileId;

  try {
    let accreditation = await Accreditation.findOne({
      organizationProfile: orgProfileId,
    });

    // If not found → create new
    if (!accreditation) {
      accreditation = new Accreditation({
        organizationProfile: orgProfileId,
        overallStatus: "Pending",
        isActive: true,
        JointStatement: null,
        PledgeAgainstHazing: null,
        ConstitutionAndByLaws: null,
        Roster: null,
        PresidentProfile: null,
      });

      await accreditation.save();
    }

    // else if (!accreditation.isActive) {
    //   // If found but inactive → return inactive response
    //   return res.status(200).json({
    //     message: "This accreditation is inactive",
    //     accreditationId: accreditation._id,
    //     isActive: false,
    //   });
    // }

    // If active → populate and return
    accreditation = await Accreditation.findById(accreditation._id)
      .populate([
        "organizationProfile",
        "JointStatement",
        "FinancialReport",
        "PledgeAgainstHazing",
        "Roster",
        "ConstitutionAndByLaws",
        "PresidentProfile",
      ])
      .exec();

    console.log({ accreditation });

    res.status(200).json(accreditation);
  } catch (error) {
    console.error("Error handling accreditation request:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const SendAccreditationInquiryEmailInquiry = async (req, res) => {
  try {
    const {
      orgId,
      orgName,
      inquiryText,
      inquirySubject,
      userPosition,
      userName,
    } = req.body;

    console.log(orgId);
    // Find all non-adviser users in the organization
    const users = await User.find({
      organizationProfile: orgId,
      position: { $ne: "Adviser" },
    }).select("email");

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No recipients found for this organization.",
      });
    }

    // Extract plain email list
    const recipientEmails = users.map((u) => u.email).filter(Boolean);

    console.log(recipientEmails);
    if (recipientEmails.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No valid email addresses found.",
      });
    }

    // Format the sender information
    const senderInfo =
      userName && userName.trim() !== ""
        ? `${userName} || ${userPosition}`
        : userPosition;

    // Email body
    const message = `
Hello ${orgName},

A new inquiry has been submitted regarding your accreditation documents.

Inquiry Details:
- From: ${senderInfo}
- Message: 
${inquiryText}

Please log in to the system to review and respond.

Thank you,
Accreditation Support Team
    `;

    await NodeEmail(recipientEmails, inquirySubject, message);

    return res.status(200).json({
      success: true,
      message: "Inquiry emails sent successfully.",
      recipients: recipientEmails,
    });
  } catch (error) {
    console.error("❌ Error sending inquiry emails:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send inquiry emails.",
      details: error.message,
    });
  }
};
