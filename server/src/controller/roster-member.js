import {
  RosterMember,
  Accreditation,
  Roster,
  User,
  Notification,
} from "../models/index.js";
import { NodeEmail } from "../middleware/emailer.js";
import { logAction } from "../middleware/audit.js";

export const ApprovedRosterList = async (req, res) => {
  try {
    const { rosterId } = req.params;
    const { overAllStatus, revisionNotes, isComplete } = req.body;

    if (!rosterId) {
      return res
        .status(400)
        .json({ success: false, message: "Roster ID is required." });
    }

    // 🔹 Build an update object only with provided fields
    const updateFields = {};
    if (overAllStatus) updateFields.overAllStatus = overAllStatus;
    if (revisionNotes !== undefined) updateFields.revisionNotes = revisionNotes;
    if (isComplete !== undefined) updateFields.isComplete = isComplete;

    // 🔹 Update and populate the roster (assuming roster links to an organizationProfile)
    const updatedRoster = await Roster.findByIdAndUpdate(
      rosterId,
      updateFields,
      {
        new: true,
      }
    ).populate("organizationProfile");

    if (!updatedRoster) {
      return res
        .status(404)
        .json({ success: false, message: "Roster not found." });
    }

    // 🔹 Find all connected users under the same organizationProfile
    const connectedUsers = await User.find({
      organizationProfile: updatedRoster.organizationProfile?._id,
    }).select("email name");

    if (!connectedUsers.length) {
      return res.status(404).json({
        success: false,
        message: "No connected users found for this roster.",
      });
    }

    const recipientEmails = connectedUsers.map((u) => u.email);

    // ✅ Prepare email message
    const subject = `Roster Status Update — ${overAllStatus || "Updated"}`;
    const message = `
Hello,

The roster linked to "${
      updatedRoster.organizationProfile?.orgName || "your organization"
    }" has been updated.

📋 Status: ${overAllStatus || "N/A"}
${revisionNotes ? `📝 Revision Notes: ${revisionNotes}` : ""}
${
  isComplete !== undefined
    ? `✅ Completion Status: ${isComplete ? "Complete" : "Incomplete"}`
    : ""
}

Please log in to the accreditation system to view the full details.

Thank you,
Accreditation Support Team
`;

    // ✅ Send emails to all connected users
    await NodeEmail(recipientEmails, subject, message);

    // ✅ Create a Notification record
    const notifMessage = `Roster for "${
      updatedRoster.organizationProfile?.orgName || "Organization"
    }" has been updated — Status: "${overAllStatus || "Updated"}".`;

    const notification = new Notification({
      organizationProfile: updatedRoster.organizationProfile?._id,
      department: updatedRoster.organizationProfile?.orgDepartment || "N/A",
      type: "Accreditation Update",
      message: notifMessage,
      data: {
        rosterId,
        status: overAllStatus || "Updated",
        revisionNotes: revisionNotes || null,
        isComplete: isComplete ?? null,
      },
    });

    await notification.save();

    // ✅ Respond
    // 📝 Audit log
    logAction(req, {
      action: "roster.status.update",
      targetType: "Roster",
      targetId: updatedRoster._id,
      organizationProfile: updatedRoster.organizationProfile?._id,
      organizationName: updatedRoster.organizationProfile?.orgName,
      meta: {
        status: overAllStatus || "Updated",
        revisionNotes: revisionNotes || null,
        isComplete: isComplete ?? null,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Roster ${
        overAllStatus?.toLowerCase() || "updated"
      } successfully, notifications sent, and log recorded.`,
      updatedRoster,
      notifiedUsers: recipientEmails,
      notificationLog: notification,
    });
  } catch (error) {
    console.error("❌ Error updating roster:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const SendEmailToOrgUsers = async (req, res) => {
  try {
    const { organizationId, subject, message } = req.body;

    if (!organizationId || !subject || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔍 Find users linked to this OrganizationProfile and position = Student-Leader
    const users = await User.find({
      organizationProfile: organizationId,
      position: "student-leader", // ✅ filter by role
    });

    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found for this organization" });
    }

    // ✉️ Send email to each user
    const emailPromises = users.map((user) =>
      NodeEmail(user.email, subject, message)
    );

    res.status(200).json({
      message: "Emails processed",
    });
  } catch (error) {
    console.error("Error in SendEmailToOrgUsers:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const revisionNoteRosterList = async (req, res) => {
  try {
    const { rosterId } = req.params;
    const { revisionNotes, position } = req.body;

    // Find and update the roster's overall status
    const updatedRoster = await Roster.findByIdAndUpdate(
      rosterId,
      { overAllStatus: `Revision from ${position}`, revisionNotes },
      { new: true }
    );

    if (!updatedRoster) {
      return res.status(404).json({ message: "Roster not found" });
    }

    // 📝 Audit log
    logAction(req, {
      action: "roster.revision",
      targetType: "Roster",
      targetId: updatedRoster._id,
      organizationProfile: updatedRoster.organizationProfile || null,
      organizationName: null,
      meta: { revisionNotes, from: position },
    });

    res.status(200).json({
      message: "Roster status updated successfully",
      roster: updatedRoster,
    });
  } catch (error) {
    console.error("Error updating roster status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const CompleteRosterList = async (req, res) => {
  try {
    const { rosterId } = req.params;

    // Find and update the roster's overall status
    const updatedRoster = await Roster.findByIdAndUpdate(
      rosterId,
      { isComplete: true },
      { new: true }
    );

    if (!updatedRoster) {
      return res.status(404).json({ message: "Roster not found" });
    }

    // 📝 Audit log
    logAction(req, {
      action: "roster.complete",
      targetType: "Roster",
      targetId: updatedRoster._id,
      organizationProfile: updatedRoster.organizationProfile || null,
      organizationName: null,
    });

    res.status(200).json({
      message: "Roster status updated successfully",
      roster: updatedRoster,
    });
  } catch (error) {
    console.error("Error updating roster status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const GetRosterMembersByOrganizationIdSDU = async (req, res) => {
  const { orgProfileId } = req.params;

  try {
    // Find the roster tied to the given organization profile
    const roster = await Roster.findOne({ organizationProfile: orgProfileId });

    if (!roster) {
      return res.status(404).json({
        message: "No roster found for this organization.",
      });
    }

    // Find roster members belonging to this roster
    const members = await RosterMember.find({ roster: roster._id });

    return res.status(200).json({
      message: "Roster members fetched successfully.",
      roster: roster,
      rosterMembers: members,
    });
  } catch (error) {
    console.error("Error fetching roster members for organization:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const GetAllRostersWithMembers = async (req, res) => {
  try {
    // Step 1: Fetch all rosters with organization profile
    const rosters = await Roster.find()
      .populate("organizationProfile") // populate org details
      .lean();

    // Step 2: Fetch all members linked to rosters
    const members = await RosterMember.find()
      .populate({
        path: "roster",
        populate: { path: "organizationProfile" }, // nested populate
      })
      .lean();

    // Step 3: Group members by rosterId
    const membersByRoster = {};
    members.forEach((member) => {
      const rosterId = member.roster?._id?.toString();
      if (!membersByRoster[rosterId]) {
        membersByRoster[rosterId] = [];
      }
      membersByRoster[rosterId].push(member);
    });

    // Step 4: Attach members to each roster
    const result = rosters.map((roster) => ({
      ...roster,
      members: membersByRoster[roster._id.toString()] || [],
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching rosters:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const AddNewRosterMember = async (req, res) => {
  const {
    organizationProfile,
    name,
    email,
    address,
    position,
    birthDate,
    status,
    studentId,
    contactNumber,
  } = req.body;

  const profilePicture = res.locals.fileName;

  // Validate required fields
  if (!organizationProfile || !name || !email) {
    return res.status(400).json({
      message: "organizationProfile, name, and email are required.",
    });
  }

  try {
    // Step 1: Find or create the roster
    let roster = await Roster.findOne({ organizationProfile });

    if (!roster) {
      roster = new Roster({ organizationProfile });
      await roster.save();
    }

    // Step 2: Create new roster member and assign roster ID
    const newMember = new RosterMember({
      roster: roster._id,
      name,
      email,
      address,
      position,
      birthDate,
      status,
      profilePicture,
      studentId,
      contactNumber,
    });

    // Step 3: Save the new member
    const savedMember = await newMember.save();

    // 📝 Audit log
    logAction(req, {
      action: "roster.member.add",
      targetType: "RosterMember",
      targetId: savedMember._id,
      organizationProfile: organizationProfile,
      organizationName: null,
      meta: { name, email, position },
    });

    return res.status(201).json({
      message: "Roster member added successfully.",
      rosterMember: savedMember,
    });
  } catch (error) {
    console.error("Error adding roster member:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const GetRosterMemberByOrganization = async (req, res) => {
  const { orgProfileId } = req.params;

  try {
    // Step 1: Try to find the existing roster
    let roster = await Roster.findOne({ organizationProfile: orgProfileId });

    // Step 2: If not found, create a new one
    if (!roster) {
      roster = new Roster({
        organizationProfile: orgProfileId,
        createdAt: new Date(),
      });
      await roster.save();
    }

    // Step 3: Ensure accreditation has the roster linked
    let accreditation = await Accreditation.findOne({
      organizationProfile: orgProfileId,
    });

    if (accreditation && !accreditation.Roster) {
      accreditation.Roster = roster._id;
      await accreditation.save();
    }

    // Step 4: Find all roster members linked to this roster
    const members = await RosterMember.find({ roster: roster._id });

    return res.status(200).json({
      message: "Roster members fetched successfully.",
      roster,
      rosterMembers: members,
    });
  } catch (error) {
    console.error("Error fetching or creating roster:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
// GET /api/roster/member-count/:orgProfileId
export const GetRosterMemberCount = async (req, res) => {
  const { orgProfileId } = req.params;

  try {
    // 1️⃣ Find the roster for this organization
    const roster = await Roster.findOne({ organizationProfile: orgProfileId });

    if (!roster) {
      return res.status(404).json({
        success: false,
        message: "Roster not found for this organization.",
        count: 0,
      });
    }

    // 2️⃣ Count the members for this roster
    const memberCount = await RosterMember.countDocuments({
      roster: roster._id,
    });

    return res.status(200).json({
      success: true,
      count: memberCount, // only the count
    });
  } catch (error) {
    console.error("Error fetching roster member count:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
