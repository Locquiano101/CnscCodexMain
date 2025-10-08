import {
  Accreditation,
  OrganizationProfile,
  PresidentProfile,
  Notification,
  User,
} from "../models/index.js";
import { NodeEmail } from "./../middleware/emailer.js";

export const NotifyPresidentOrg = async (req, res) => {
  try {
    // 🔍 1. Find all users that belong to an organization
    const users = await User.find({
      organizationProfile: { $ne: null },
    })
      .populate({
        path: "organizationProfile",
        populate: { path: "organization" },
      })
      .select("email name position organizationProfile");

    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ message: "No users connected to any organization found." });
    }

    // 📧 2. Prepare email content
    const subject = "President Profile Evaluation Result";
    const message = `
Hello Organization Member,

We would to inform you that your organization need to pas pass the President Profile evaluation.

Please review your organization’s information and ensure all required details are complete.  
You may log in to the Accreditation System to check any remarks or revision notes from the committee.

Thank you,  
Accreditation Support Team
    `;

    // 📨 3. Collect all valid recipient emails
    const recipientEmails = users.map((u) => u.email).filter(Boolean);

    if (recipientEmails.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid email addresses found." });
    }

    // 🧾 4. Send notification emails to all org-linked users
    await NodeEmail(recipientEmails, subject, message);

    // 🛎️ 5. Create in-system notifications for each organization
    const orgProfileIds = [
      ...new Set(
        users.map((u) => u.organizationProfile?._id?.toString()).filter(Boolean)
      ),
    ];

    const notificationsToInsert = orgProfileIds.map((orgProfileId) => ({
      organizationProfile: orgProfileId,
      type: "President Profile",
      message:
        "Your organization did not pass the President Profile evaluation. Please review the revision notes and resubmit as needed.",
      read: false,
    }));

    if (notificationsToInsert.length > 0) {
      await Notification.insertMany(notificationsToInsert);
    }

    // ✅ 6. Return success response
    res.status(200).json({
      success: true,
      message: `Notification sent to ${recipientEmails.length} users across ${orgProfileIds.length} organizations.`,
      recipients: recipientEmails,
    });
  } catch (error) {
    console.error("❌ Error sending president profile notifications:", error);
    res.status(500).json({ message: "Internal server error.", error });
  }
};

export const UpdatePresidentProfileStatus = async (req, res) => {
  const { presidentId } = req.params;
  const { overallStatus, revisionNotes } = req.body;

  if (!presidentId) {
    return res
      .status(400)
      .json({ success: false, message: "President ID is required." });
  }

  if (!overallStatus) {
    return res
      .status(400)
      .json({ success: false, message: "Overall status is required." });
  }

  try {
    // 🔹 Find the president profile and linked organizationProfile
    const profile = await PresidentProfile.findById(presidentId).populate(
      "organizationProfile"
    );

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "President profile not found." });
    }

    // 🔹 Update status and revision notes
    profile.overAllStatus = overallStatus;
    if (revisionNotes && revisionNotes.trim() !== "") {
      profile.revisionNotes = revisionNotes;
    }

    await profile.save();

    // 🔹 Find all users linked to the same organizationProfile
    const connectedUsers = await User.find({
      organizationProfile: profile.organizationProfile?._id,
    }).select("email name");

    if (!connectedUsers.length) {
      return res.status(404).json({
        success: false,
        message: "No connected users found for this president profile.",
      });
    }

    const recipientEmails = connectedUsers.map((user) => user.email);

    // ✅ Prepare email content
    const subject = `President Profile Status Updated — ${overallStatus}`;
    const message = `
Hello,

The President Profile for "${
      profile.name || "your organization president"
    }" has been updated.

📋 Status: ${overallStatus}
${revisionNotes ? `📝 Revision Notes: ${revisionNotes}` : ""}

Please log in to the accreditation system to view the full details.

Thank you,
Accreditation Support Team
`;

    // ✅ Send email to all connected users
    await NodeEmail(recipientEmails, subject, message);

    // ✅ Create a notification record (for internal tracking or in-app alerts)
    const notifMessage = `President Profile for "${
      profile.name || "Organization President"
    }" was updated to "${overallStatus}".`;
    const notification = new Notification({
      organizationProfile: profile.organizationProfile?._id,
      department: profile.organizationProfile?.orgDepartment || "N/A",
      type: "Accreditation Update",
      message: notifMessage,
      data: {
        presidentId,
        status: overallStatus,
        revisionNotes: revisionNotes || null,
      },
    });

    await notification.save();

    // ✅ Response
    return res.status(200).json({
      success: true,
      message: `President profile ${overallStatus.toLowerCase()} successfully, notifications sent, and log recorded.`,
      updatedProfile: profile,
      notifiedUsers: recipientEmails,
      notificationLog: notification,
    });
  } catch (error) {
    console.error("❌ Error updating president profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const AddPresident = async (req, res) => {
  try {
    const {
      name,
      organizationProfile,
      department,
      course,
      year,
      age,
      sex,
      religion,
      organization,
      nationality,
      birthplace,
      permanentAddress,
      parentGuardian,
      addressPhoneNo,
      sourceOfFinancialSupport,
      talentSkills,
      currentAddress,
      AccreditationId,
      contactNo,
      facebookAccount,
      classSchedule, // should be an array of { subject, place, time, day }
    } = req.body;

    const newPresidentProfile = new PresidentProfile({
      name,
      organizationProfile,
      organization,
      department,
      course,
      year,
      age,
      sex,
      profilePicture: null,
      religion,
      nationality,
      birthplace,
      presentAddress: currentAddress,
      permanentAddress,
      parentGuardian,
      addressPhoneNo,
      sourceOfFinancialSupport,
      talentSkills,
      contactNo,
      facebookAccount,
      classSchedule,
    });

    // Basic validation
    if (!organizationProfile) {
      console.error("Missing organization ID");
      return res
        .status(400)
        .json({ message: "organization Profile ID is required." });
    }

    const FindOrg = await OrganizationProfile.findById(organizationProfile);

    if (!FindOrg) {
      console.error("Organization not found:", organizationProfile);
      return res.status(404).json({ message: "Organization not found." });
    }

    const findAccreditation = await Accreditation.findById(AccreditationId);
    if (!findAccreditation) {
      console.error("Accreditation not found:", findAccreditation);
      return res.status(404).json({ message: "Accreditation not found." });
    }

    const savedProfile = await newPresidentProfile.save();

    await OrganizationProfile.findByIdAndUpdate(
      organizationProfile,
      { orgPresident: savedProfile._id },
      { new: true }
    );

    await Accreditation.findByIdAndUpdate(
      AccreditationId,
      { PresidentProfile: savedProfile._id },
      { new: true }
    );

    res.status(200).json({
      message: "Student profile created successfually.",
      profile: savedProfile,
    });
  } catch (error) {
    console.error("Error in PostStudentProfile:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const UpdatePresidentProfile = async (req, res) => {
  const file = res.locals.fileName;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { presidentId } = req.params; // assuming the president's profile ID is passed as a URL param

  if (!presidentId) {
    return res
      .status(400)
      .json({ message: "President profile ID is required." });
  }

  try {
    // Update the president profile with the uploaded file's filename
    const updatedProfile = await PresidentProfile.findByIdAndUpdate(
      presidentId,
      { profilePicture: file }, // or file.originalname if you prefer the original name
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "President profile not found." });
    }

    res.json({
      message: "Profile picture updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.log("Error updating profile picture:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const GetAllPresidents = async (req, res) => {
  try {
    const presidents = await PresidentProfile.find().populate({
      path: "organizationProfile",
    });

    res.status(200).json(presidents);
  } catch (error) {
    console.error("Error fetching all presidents:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const GetPresidentByOrg = async (req, res) => {
  const { orgId } = req.params;

  try {
    const president = await PresidentProfile.find({ organization: orgId });
    if (!president) {
      return res
        .status(404)
        .json({ message: "President not found for this organization." });
    }
    res.status(200).json(president);
  } catch (error) {
    console.error("Error fetching president by organization:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const GetPresidentById = async (req, res) => {
  const { orgPresidentId } = req.params;

  try {
    const president = await PresidentProfile.findById(orgPresidentId);
    if (!president) {
      return res.status(404).json({ message: "President not found." });
    }
    res.status(200).json(president);
  } catch (error) {
    console.error("Error fetching president by ID:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getPreviousPresidentsByOrg = async (req, res) => {
  const { orgId } = req.params;

  try {
    // Find all presidents for the org whose status indicates they are no longer serving
    const previousPresidents = await PresidentProfile.find({
      organization: orgId,
      overAllStatus: { $ne: "Active" }, // Only non-active presidents
    }).sort({ createdAt: -1 }); // Most recent first

    if (!previousPresidents.length) {
      return res.status(404).json({
        message: "No previous presidents found for this organization.",
      });
    }

    res.status(200).json(previousPresidents);
  } catch (error) {
    console.error("Error fetching previous presidents:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
