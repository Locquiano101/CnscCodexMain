import { sendNotification } from "../middleware/notification.js";
import { logAction } from "../middleware/audit.js";
import {
  Notification,
  Organization,
  OrganizationProfile,
  User,
} from "../models/index.js";
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

// 📩 Get Notifications by OrganizationProfile ID
export const GetNotificationsByOrgProfile = async (req, res) => {
  try {
    const { organizationProfileId } = req.params;

    if (!organizationProfileId) {
      return res.status(400).json({
        success: false,
        error: "organizationProfileId is required",
      });
    }

    const notifications = await Notification.find({
      organizationProfile: organizationProfileId,
    })
      .sort({ createdAt: -1 }) // latest first
      .lean();

    if (!notifications || notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No notifications found for this organization profile",
      });
    }

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (err) {
    console.error("GetNotificationsByOrgProfile error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ⚠️ Accreditation Warning
export const NotifcationWarningAccreditation = async (req, res) => {
  const { organizationProfileId, organizationId, warningNote } = req.body;

  try {
    if (!organizationProfileId || !organizationId) {
      return res.status(400).json({
        success: false,
        error: "organizationProfileId and organizationId are required",
      });
    }

    const result = await sendNotification(
      {
        body: {
          organizationProfileId,
          organizationId,
          subject: "Accreditation Warning",
          message: `This is a warning regarding your accreditation status.\n\n${
            warningNote || ""
          }`,
        },
      },
      { status: () => ({ json: () => {} }) } // fake res
    );
    65;

    res.status(200).json(result);
  } catch (err) {
    console.error("NotifcationWarningAccreditation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ⚠️ Accreditation Suspension
export const NotifcationSuspensionAccreditation = async (req, res) => {
  try {
    const { organizationProfileId, organizationId, warningNote } = req.body;
    console.log(req.body);

    if (!organizationProfileId || !organizationId) {
      return res.status(400).json({
        success: false,
        error: "organizationProfileId and organizationId are required",
      });
    }

    const result = await sendNotification(
      {
        body: {
          organizationProfileId,
          organizationId,
          subject: "Accreditation Suspended",
          message: `This is a note regarding your accreditation suspension.\n\n${
            warningNote || ""
          }`,
        },
      },
      { status: () => ({ json: () => {} }) } // fake res
    );
    65;

    res.status(200).json(result);
  } catch (err) {
    console.error("NotifcationWarningAccreditation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 📅 Accreditation Deadline Set
export const NotifcationAccreditationDeadlineSet = async (req, res) => {
  try {
    const { deadline } = req.body; // deadline passed from frontend

    // 1️⃣ Get all active organization profiles
    const activeOrgProfiles = await OrganizationProfile.find({
      isActive: true,
    }).populate("organization");

    if (!activeOrgProfiles || activeOrgProfiles.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No active organizations found" });
    }

    // 2️⃣ Loop through each org and send personalized notification/email
    const results = [];
    for (const orgProfile of activeOrgProfiles) {
      const organizationProfileId = orgProfile._id;
      const organizationId = orgProfile.organization?._id;
      const orgName =
        orgProfile.orgName || orgProfile.organization?.currentName;

      const subject = "📅 Accreditation Deadline Set";
      const message = `Hello ${orgName},

A new accreditation deadline has been set: ${new Date(
        deadline
      ).toLocaleDateString()}.

Please ensure that your accreditation report and requirements are submitted before this date to avoid penalties or disqualification.

Thank you,
Accreditation Committee`;

      // ✅ wrap like the other controllers (fake req/res)
      let localResult;
      await sendNotification(
        { body: { organizationProfileId, organizationId, subject, message } },
        {
          status: () => ({
            json: (data) => {
              localResult = data;
            },
          }),
        }
      );

      results.push(localResult);
    }

    res.status(200).json({
      success: true,
      message: "Deadline notifications sent to all active organizations",
      results,
    });

    // 📝 Audit log: accreditation deadline updated
    logAction(req, {
      action: "accreditation.deadline.update",
      targetType: "AccreditationSystem",
      targetId: null,
      organizationProfile: null,
      organizationName: null,
      meta: { deadline },
    });
  } catch (err) {
    console.error("NotifcationAccreditationDeadlineSet error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
