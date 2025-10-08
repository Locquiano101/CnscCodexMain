import mongoose from "mongoose";
const { Schema } = mongoose;

export const documentSchema = new Schema(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "organization",
      require: true,
    },

    organizationProfile: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationProfile",
      require: true,
    },

    label: { type: String, default: null },
    fileName: { type: String, default: null },
    revisionNotes: { type: String, default: null },
    isPinned: { type: Boolean, default: false },
    logs: [String],
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);
