import mongoose, { Schema } from "mongoose";

export const notificationSchema = new mongoose.Schema(
  {
    organizationProfile: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationProfile",
    },
    department: String,
    type: {
      type: String,
    },
    message: { type: String, required: true },
    data: { type: Object }, // optional payload (like proposalId, link, etc.)
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);
