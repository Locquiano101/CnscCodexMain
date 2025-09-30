import { sendNotification } from "../middleware/notification.js";
import { Organization, OrganizationProfile, User } from "../models/index.js";
// 🔄 Accreditation Reset

export const NotifcationAccreditationReset = async (req, res) => {
  try {
    // 1️⃣ Get active organization profiles
    const activeOrgProfiles = await OrganizationProfile.find({
      isActive: true,
    });

    if (!activeOrgProfiles || activeOrgProfiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active organization profiles found.",
      });
    }

    // 2️⃣ Loop through each profile → get users + org → call sendNotification
    for (const profile of activeOrgProfiles) {
      const org = await Organization.findById(profile.organization);

      // re-use your generic sendNotification
      await sendNotification(
        {
          body: {
            organizationProfileId: profile._id,
            organizationId: org ? org._id : null,
            subject: "Accreditation Reset",
            message:
              "The accreditation process has been reset. All organizations must resubmit their accreditation requirements.",
          },
        },
        {
          status: () => ({ json: () => {} }), // fake res since we don't need direct output
        }
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Accreditation reset notifications sent to all active organizations.",
    });
  } catch (err) {
    console.error("NotifcationAccreditationReset error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ⚠️ Accreditation Warning
export const NotifcationWarningAccreditation = async (req, res) => {
  try {
    const { organizationProfileId, organizationId, warningNote } = req.body;

    if (!organizationProfileId || !organizationId) {
      return res.status(400).json({
        success: false,
        error: "organizationProfileId and organizationId are required",
      });
    }

    const result = await sendNotification({
      organizationProfileId,
      organizationId,
      subject: "Accreditation Warning",
      message: `This is a warning regarding your accreditation status.\n\n${
        warningNote || ""
      }`,
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("NotifcationWarningAccreditation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 📅 Accreditation Deadline Set
export const NotifcationAccreditationDeadlineSet = async (req, res) => {
  try {
    const { organizationProfileId, organizationId, deadline } = req.body;

    const result = await sendNotification({
      organizationProfileId,
      organizationId,
      subject: "Accreditation Deadline Set",
      message: `A new accreditation deadline has been set: ${new Date(
        deadline
      ).toLocaleDateString()}. Please make sure all requirements are submitted before this date.`,
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("NotifcationAccreditationDeadlineSet error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
