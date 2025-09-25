import mongoose from "mongoose";
const { Schema } = mongoose;

// Sub-schema for Program/Project/Activity, Meetings, etc.
export const subAccomplishmentSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
    },
    title: String,
    description: String,
    date: Date,
    proposal: { type: Schema.Types.ObjectId, ref: "ProposalsConduct" },
    // For Awards specifically
    level: {
      type: String,
    },
    overallStatus: String,
    revision: String,
    // Documents
    documents: [{ type: Schema.Types.ObjectId, ref: "Documents" }],

    organization: { type: Schema.Types.ObjectId, ref: "Organization" },
    // Scoring    organization: { type: Schema.Types.ObjectId, ref: "Organization" },
    organizationProfile: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationProfile", // ✅ exact match
    },

    awardedPoints: { type: Number, default: 0 },
    awardPointsBreakdown: Object,
  },
  { timestamps: true }
);

// Main schema to group everything by organization/year
export const accomplishmentSchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: "Organization" },
    organizationProfile: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationProfile", // ✅ exact match
    },

    academicYear: String, // e.g., "2024-2025"

    overallStatus: { type: String, default: "Pending" },

    // Store all sub accomplishments (PPAs, awards, outreach, etc.)
    accomplishments: [
      { type: Schema.Types.ObjectId, ref: "SubAccomplishment" },
    ],

    // Aggregated scores
    totalOrganizationalDevelopment: { type: Number, default: 0 },
    totalOrganizationalPerformance: { type: Number, default: 0 },
    totalServiceCommunity: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
  },
  { timestamps: true }
);
