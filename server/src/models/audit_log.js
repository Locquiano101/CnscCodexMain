import mongoose from "mongoose";

const { Schema } = mongoose;

// AuditLog schema to capture who did what to which resource and when
export const auditLogSchema = new Schema(
  {
    action: { type: String, required: true }, // e.g., 'proposal.update-status'

    // Actor performing the action (from session)
    actorId: { type: Schema.Types.ObjectId, ref: "Users" },
    actorName: { type: String },
    actorEmail: { type: String },
    actorPosition: { type: String },

    // Target entity
    targetType: { type: String }, // e.g., 'ProposalConduct', 'Roster', 'PresidentProfile'
    targetId: { type: Schema.Types.ObjectId },

    // Organization context
    organizationProfile: { type: Schema.Types.ObjectId, ref: "OrganizationProfile" },
    organizationName: { type: String },

    // Request info
    method: { type: String },
    path: { type: String },
    ip: { type: String },

    // Additional arbitrary metadata for debugging or display
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Helpful indexes for fast lookups and searches
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ organizationProfile: 1 });
auditLogSchema.index({ actorPosition: 1 });
auditLogSchema.index({ actorEmail: 1 });
auditLogSchema.index({ action: 1 });
// Text index for fuzzy search across common fields
auditLogSchema.index({ action: "text", actorName: "text", organizationName: "text", targetType: "text" });
