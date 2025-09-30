import { NodeEmail } from "./emailer.js"; // path depends on your setup
import { Logs, Notification, User } from "../models/index.js";

export const sendNotification = async (req, res) => {
  try {
    const {
      organizationProfileId,
      organizationId,
      subject,
      message,
      type,
      data,
    } = req.body;

    if (!subject || !message) {
      return res
        .status(400)
        .json({ success: false, error: "Missing subject or message" });
    }

    // 1️⃣ Save log entry
    await Logs.create({
      action: subject,
      organizationProfile: organizationProfileId,
      Organization: organizationId,
    });

    // 2️⃣ Save notification
    const notification = await Notification.create({
      organizationProfile: organizationProfileId,
      organization: organizationId || null,
      subject,
      message,
      type: type || "General",
      data: data || {},
    });

    // 3️⃣ Get recipients
    const users = await User.find({
      organizationProfile: organizationProfileId,
    });

    const recipients = [...users.map((u) => u.email)].filter(Boolean);

    if (recipients.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No recipients found",
        notification, // still return notification record
      });
    }

    // 4️⃣ Send emails
    for (const email of recipients) {
      await NodeEmail(email, subject, message);
    }

    return res.status(200).json({
      success: true,
      recipients: recipients.length,
      notification,
    });
  } catch (err) {
    console.error("sendNotification controller error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
