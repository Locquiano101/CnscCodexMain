import mongoose from "mongoose";

const requirementSubmissionSchema = new mongoose.Schema(
  {
    requirementKey: { type: String, required: true, index: true },
    organizationProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizationProfile",
      required: true,
      index: true,
    },
    document: { type: mongoose.Schema.Types.ObjectId, ref: "Documents" },
  // Extended multi-stage statuses:
  // Pending -> AdviserApproved -> DeanApproved -> Approved (final)
  // RevisionRequested can appear at any intermediate stage; Rejected is hard failure.
  status: { type: String, enum: ["Pending", "AdviserApproved", "DeanApproved", "Approved", "RevisionRequested", "Rejected"], default: "Pending" },
    logs: [{ type: String }],
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  },
  { timestamps: true }
);

export { requirementSubmissionSchema };
