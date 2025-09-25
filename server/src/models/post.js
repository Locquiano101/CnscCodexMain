import mongoose from "mongoose";
const { Schema } = mongoose;
// ----------------- Post Schema -----------------
export const postSchema = new Schema(
  {
    organizationProfile: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationProfile",
    },
    status: { type: String, default: "Pending" }, // ✅ fixed syntax for default
    tags: [String],
    title: String,
    caption: String,

    content: [
      {
        type: Schema.Types.ObjectId,
        ref: "Documents", // ✅ matches your model registration
      },
    ],

    revisionNotes: String,
  },
  { timestamps: true }
);
