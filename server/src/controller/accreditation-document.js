import { NodeEmail } from "../middleware/emailer.js";
import {
  Accreditation,
  Document,
  OrganizationProfile,
  Adviser,
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
    const result = await Accreditation.updateMany(
      {}, // match all documents
      { $set: { isActive: false } }
    );
    // Find all non-adviser users in the organization
    const users = await User.find({}).select("email");

    const resultOrganizationProfile = await OrganizationProfile.updateMany(
      {}, // match all documents
      { $set: { isActive: false } }
    );

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

    res.status(200).json({
      message: "All accreditations have been deactivated",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error deactivating accreditations:", error);
    res.status(500).json({ error: "Server error" });
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

    res.status(200).json(accreditations);
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
      return res.status(400).json({ error: "Missing documentId" });
    }
    if (!status) {
      return res.status(400).json({ error: "Missing status" });
    }

    // If status contains "revision", ensure notes exist
    if (status.toLowerCase().includes("revision")) {
      if (!revisionNotes || revisionNotes.trim() === "") {
        return res
          .status(400)
          .json({ error: "Missing revision notes for revision status" });
      }

      const updatedDoc = await Document.findByIdAndUpdate(
        documentId,
        { status, revisionNotes },
        { new: true }
      );

      if (!updatedDoc) {
        return res.status(404).json({ error: "Document not found" });
      }

      return res.status(200).json({
        message: `Document status updated to ${status} with revision notes`,
        document: updatedDoc,
      });
    }

    // Normal status update (no revision)
    const updatedDoc = await Document.findByIdAndUpdate(
      documentId,
      { status },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.status(200).json({
      message: `Document status updated to ${status}`,
      document: updatedDoc,
    });
  } catch (error) {
    console.error("Error updating document status:", error);
    res.status(500).json({ error: error.message });
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

    console.log(accreditation);

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
