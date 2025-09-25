import mongoose from "mongoose";
const { Schema } = mongoose;

export const organizationProfileSchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: "Organizations" },
    orgPresident: { type: Schema.Types.ObjectId, ref: "PresidentProfile" },
    adviser: { type: Schema.Types.ObjectId, ref: "Advisers" },
    overAllStatus: { type: String, default: "Pending" },
    orgLogo: String,
    orgName: String, // Name used this year
    orgClass: String,
    orgCourse: String,
    orgStatus: String, // Active, Inactive, Disqualified
    orgAcronym: String,
    orgDepartment: String,
    orgSpecialization: String,
    revisionNotes: String,
    isActive: { type: Boolean, default: true },
    isAllowedForReuse: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const organizationSchema = new Schema(
  {
    originalName: String,
    establishedDate: Date,
    currentName: String,

    organizationProfile: [
      {
        type: Schema.Types.ObjectId,
        ref: "OrganizationProfile",
      },
    ],
  },
  { timestamps: true }
);
