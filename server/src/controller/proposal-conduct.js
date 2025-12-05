import { NodeEmail } from "../middleware/emailer.js";
import { ProposalConduct, Proposal, User } from "../models/index.js";
import { logAction } from "../middleware/audit.js";

export const updateProposalConductStatus = async (req, res) => {
  try {
    const { proposalConductId } = req.params;
    const {
      overallStatus,
      revision,
      inquiryText,
      inquirySubject,
      userName,
      orgProfileId,
      orgName,
      userPosition,
    } = req.body;

    // 🔎 Find ProposalConduct by ID and populate its linked documents
    const proposalConduct = await ProposalConduct.findById(
      proposalConductId
    ).populate("document");

    if (!proposalConduct) {
      return res
        .status(404)
        .json({ success: false, message: "ProposalConduct not found" });
    }

    // ✅ Update ProposalConduct
    if (overallStatus) {
      proposalConduct.overallStatus = overallStatus;
    }

    if (inquiryText) {
      proposalConduct.revision = inquiryText;
    }

    // ✅ Update linked Documents
    if (proposalConduct.document?.length > 0) {
      for (let doc of proposalConduct.document) {
        if (overallStatus) {
          doc.status = overallStatus;
        }
        if (inquiryText) {
          doc.revisionNotes = inquiryText;
        }
        doc.logs.push(
          `[${new Date().toISOString()}] Updated by ${userName} (${userPosition}) → Status: ${overallStatus}`
        );

        await doc.save();
      }
    }

    await proposalConduct.save();

    // 📝 Audit log
    logAction(req, {
      action: "proposal-conduct.status.update",
      targetType: "ProposalConduct",
      targetId: proposalConduct._id,
      organizationProfile: proposalConduct.organizationProfile || orgProfileId || null,
      organizationName: orgName || null,
      meta: {
        overallStatus: proposalConduct.overallStatus || overallStatus,
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

A proposal status update has been submitted.

Details:
- From: ${userName} || ${userPosition}
- Status: ${proposalConduct.overallStatus}
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
      message: "ProposalConduct and related documents updated successfully",
      proposalConduct,
    });
  } catch (error) {
    console.error("❌ Error updating ProposalConduct:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const postProposalConduct = async (req, res) => {
  try {
    const {
      ProposedActionPlanSchema,
      ProposedIndividualActionPlan: proposedIndividualId, // only ID comes from client
      organization,
      proposedDate,
      organizationProfile,
      overallStatus,
    } = req.body;

    const documentId = res.locals.documentId;
    if (!documentId) {
      return res.status(400).json({ error: "No document uploaded" });
    }

    // 1️⃣ Find the existing ProposedIndividualActionPlan by ID
    const proposedIndividual = await Proposal.findById(proposedIndividualId);
    if (!proposedIndividual) {
      return res
        .status(404)
        .json({ error: "ProposedIndividualActionPlan not found" });
    }

    // 2️⃣ Copy only schema-approved fields into embedded object
    const embeddedIndividual = {
      activityTitle: proposedIndividual.activityTitle,
      alignedSDG: proposedIndividual.alignedSDG,
      budgetaryRequirements: proposedIndividual.budgetaryRequirements,
      venue: proposedIndividual.venue,
      briefDetails: proposedIndividual.briefDetails,
      AlignedObjective: proposedIndividual.AlignedObjective,
      proposedDate: proposedDate || proposedIndividual.proposedDate,
      Proponents: proposedIndividual.Proponents,
    };

    // 3️⃣ Save ProposalConduct
    const proposalConduct = new ProposalConduct({
      ProposedActionPlanSchema,
      ProposedIndividualActionPlan: embeddedIndividual,
      organization,
      organizationProfile,
      overallStatus: overallStatus || "Pending",
      document: [documentId],
    });

    await proposalConduct.save();

    return res.status(201).json({
      success: true,
      message:
        "Proposal Conduct created with embedded ProposedIndividualActionPlan",
      proposalConduct,
    });
  } catch (error) {
    console.error("❌ postProposalConduct error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const postNewProposalConduct = async (req, res) => {
  try {
    const {
      activityTitle,
      briefDetails,
      alignedObjective,
      venue,
      date,
      budget,
      alignedSDG,
      Proponents,
      organization,
      organizationProfile,
      overallStatus,
    } = req.body;

    const documentId = res.locals.documentId;
    if (!documentId) {
      return res.status(400).json({ error: "No document uploaded" });
    }

    // ✅ Build the embedded object directly
    const embeddedIndividual = {
      activityTitle,
      briefDetails,
      AlignedObjective: alignedObjective,
      venue,
      proposedDate: date ? new Date(date) : null,
      budgetaryRequirements: budget ? Number(budget) : 0,
      alignedSDG: alignedSDG || [],
      Proponents: Proponents || [],
    };

    // ✅ Save ProposalConduct
    const proposalConduct = new ProposalConduct({
      ProposedIndividualActionPlan: embeddedIndividual,
      organization,
      organizationProfile,
      overallStatus: overallStatus || "Pending",
      document: [documentId],
    });

    await proposalConduct.save();

    // 📝 Audit log
    logAction(req, {
      action: "proposal-conduct.create",
      targetType: "ProposalConduct",
      targetId: proposalConduct._id,
      organizationProfile: organizationProfile || proposalConduct.organizationProfile || null,
      organizationName: organization || null,
      meta: { activityTitle },
    });

    // 📝 Room assignment audit if venue provided
    if (venue) {
      logAction(req, {
        action: "schedule.room.assign",
        targetType: "ProposalConduct",
        targetId: proposalConduct._id,
        organizationProfile: organizationProfile || proposalConduct.organizationProfile || null,
        organizationName: organization || null,
        meta: { venue },
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Proposal Conduct created with direct ProposedIndividualActionPlan",
      proposalConduct,
    });
  } catch (error) {
    console.error("❌ postNewProposalConduct error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const updateProposalConduct = async (req, res) => {
  try {
    const { id } = req.params; // ProposalConduct ID
    const {
      activityTitle,
      briefDetails,
      AlignedObjective,
      alignedSDG,
      budgetaryRequirements,
      venue,
      proposalType,
      proposalCategory,
      proposedDate,
      overallStatus,
      organizationProfile,
      organization,
      accreditation,
      documents,
      collaboratingEntities,
    } = req.body;

    // 🔎 Find ProposalConduct first
    const proposalConduct = await ProposalConduct.findById(id);
    if (!proposalConduct) {
      return res
        .status(404)
        .json({ success: false, message: "ProposalConduct not found" });
    }

    const prevVenue = proposalConduct?.ProposedIndividualActionPlan?.venue;

    // 🔄 Update embedded ProposedIndividualActionPlan object
    proposalConduct.ProposedIndividualActionPlan = {
      ...proposalConduct.ProposedIndividualActionPlan, // keep existing fields
      activityTitle,
      briefDetails,
      AlignedObjective,
      alignedSDG,
      budgetaryRequirements,
      venue,
      proposalType,
      ProposalCategory: proposalCategory, // match backend schema
      proposedDate,
    };

    // 🔄 Update other top-level fields
    proposalConduct.organizationProfile = organizationProfile;
    proposalConduct.organization = organization;
    proposalConduct.accreditation = accreditation;
    proposalConduct.overallStatus =
      overallStatus || proposalConduct.overallStatus;
    proposalConduct.document =
      documents && documents.length > 0 ? documents : proposalConduct.document;
    proposalConduct.collaboratingEntities = collaboratingEntities || [];
    proposalConduct.overallStatus = "Revision Update from Student Leader";
    await proposalConduct.save();

    // 📝 Audit log
    logAction(req, {
      action: "proposal-conduct.update",
      targetType: "ProposalConduct",
      targetId: proposalConduct._id,
      organizationProfile: proposalConduct.organizationProfile || organizationProfile || null,
      organizationName: organization || null,
      meta: { activityTitle },
    });

    // 📝 Room change audit if venue changed
    if (typeof venue !== "undefined") {
      const newVenue = venue;
      if (newVenue && newVenue !== prevVenue) {
        logAction(req, {
          action: "schedule.room.change",
          targetType: "ProposalConduct",
          targetId: proposalConduct._id,
          organizationProfile: proposalConduct.organizationProfile || organizationProfile || null,
          organizationName: organization || null,
          meta: { from: prevVenue || null, to: newVenue },
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "ProposalConduct updated successfully",
      proposalConduct,
    });
  } catch (error) {
    console.error("Error updating ProposalConduct:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteProposalConduct = async (req, res) => {
  try {
    const { id } = req.params; // 🔹 ProposalConduct ID from URL

    const deletedConduct = await ProposalConduct.findByIdAndDelete(id);

    if (!deletedConduct) {
      return res.status(404).json({
        success: false,
        message: "ProposalConduct not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "ProposalConduct deleted successfully",
      deletedConduct,
    });
  } catch (error) {
    console.error("Error deleting ProposalConduct:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllSystemWideProposal = async (req, res) => {
  try {
    const conducts = await ProposalConduct.find({ isActive: true })
      .populate({
        path: "organizationProfile",
        match: { orgClass: "System-wide", isActive: true }, // only system-wide orgs
        select:
          "orgName orgAcronym orgStatus orgPresident adviser orgLogo orgClass",
      })
      .populate("document")
      .populate("ProposedIndividualActionPlan");

    // Filter out proposals where the organizationProfile didn't match
    const filteredConducts = conducts.filter(
      (c) => c.organizationProfile !== null
    );

    if (!filteredConducts || filteredConducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No system-wide proposals found.",
      });
    }

    res.json(filteredConducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getProposalConductByOrgProfile = async (req, res) => {
  try {
    const { orgProfileId } = req.params;

    const conducts = await ProposalConduct.find({
      organizationProfile: orgProfileId, // 🔹 direct match
    })
      .populate("document") // include file metadata
      .populate("ProposedIndividualActionPlan"); // optional, if you want Proposal info

    if (!conducts || conducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No ProposalConduct found for this organization profile",
      });
    }

    res.json(conducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDoneProposalConductsByOrgProfile = async (req, res) => {
  try {
    const { orgProfileId } = req.params;

    const doneConducts = await ProposalConduct.find({
      organizationProfile: orgProfileId,
      overallStatus: "Conduct Approved", // ✅ filter only completed conducts
    })
      .populate("document") // include uploaded document(s)
      .populate("ProposedIndividualActionPlan"); // optional for extra details

    if (!doneConducts || doneConducts.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No completed ProposalConduct found for this organization profile",
      });
    }

    res.json(doneConducts);
  } catch (error) {
    console.error("Error fetching done ProposalConducts:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// export const getAllProposalConduct = async (req, res) => {
//   try {
//     const doneConducts = await ProposalConduct.find({
//       overallStatus: "Conduct Approved", // ✅ filter only completed conducts
//     })
//       .populate("document") // include uploaded document(s)
//       .populate("organizationProfile") // include uploaded document(s)
//       .populate("ProposedIndividualActionPlan"); // optional for extra details

//     if (!doneConducts || doneConducts.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "No completed ProposalConduct found for this organization profile",
//       });
//     }

//     res.json(doneConducts);
//   } catch (error) {
//     console.error("Error fetching done ProposalConducts:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

export const getAllProposalConduct = async (req, res) => {
  try {
    const doneConducts = await ProposalConduct.find({})
      .populate("document") // include uploaded document(s)
      .populate({
        path: "organizationProfile",
        populate: { path: "orgPresident", select: "name" } // only get the name
      })      
      .populate("ProposedIndividualActionPlan"); // optional for extra details

    if (!doneConducts || doneConducts.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No completed ProposalConduct found for this organization profile",
      });
    }

    res.json(doneConducts);
  } catch (error) {
    console.error("Error fetching done ProposalConducts:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
