import mongoose from "mongoose";
const { Schema } = mongoose;

export const rosterSchema = new Schema(
  {
    organizationProfile: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationProfile",
      require: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "organization",
      require: true,
    },

    isComplete: { type: Boolean, default: false },
    overAllStatus: { type: String, default: "Pending" },
    revisionNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const rosterMembersSchema = new Schema(
  {
    roster: { type: Schema.Types.ObjectId, ref: "Roster" },
    name: String,
    email: String,
    address: String,
    position: String,
    department: String,
    course: String,
    year: String,
    birthDate: Date,
    studentId: String,
    contactNumber: String,
    profilePicture: String,
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);
