import mongoose from "mongoose";
const { Schema } = mongoose;

// ----------------- Accreditation Schema -----------------
export const accreditationSchema = new Schema(
  {
    organizationProfile: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationProfile",
    },
    overallStatus: { type: String, default: "Pending" },
    isActive: { type: Boolean, default: true },
    isRevoked: { type: Boolean, default: false },
    FinancialReport: { type: Schema.Types.ObjectId, ref: "FinancialReport" },
    JointStatement: { type: Schema.Types.ObjectId, ref: "Documents" },
    PledgeAgainstHazing: { type: Schema.Types.ObjectId, ref: "Documents" },
    ConstitutionAndByLaws: { type: Schema.Types.ObjectId, ref: "Documents" },
    Roster: { type: Schema.Types.ObjectId, ref: "Roster" },
    PresidentProfile: { type: Schema.Types.ObjectId, ref: "PresidentProfile" },
  },
  { timestamps: true }
);
