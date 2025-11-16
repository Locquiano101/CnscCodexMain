import mongoose from "mongoose";

import {
  organizationSchema,
  organizationProfileSchema,
} from "./organization.js";
import { AdviserSchema, LogsSchema, userSchema } from "./users.js";
import {
  proposalConductSchema,
  proposedIndividualActionPlanSchema,
  ProposedActionPlanSchema,
} from "./proposals.js";
import { documentSchema } from "./document.js";
import { accreditationSchema } from "./accreditation.js";
import { rosterMembersSchema, rosterSchema } from "./roster.js";
import {
  accomplishmentSchema,
  subAccomplishmentSchema,
} from "./accomplishment.js";
import { presidentProfileSchema } from "./president_profile.js";
import { ReceiptSchema, financialReportSchema } from "./financial_report.js";
import { postSchema } from "./post.js";
import { notificationSchema } from "./notification.js";
import { auditLogSchema } from "./audit_log.js";
// Compile models
const User = mongoose.model("Users", userSchema);
const Adviser = mongoose.model("Advisers", AdviserSchema);
const Receipt = mongoose.model("Receipts", ReceiptSchema);
const Document = mongoose.model("Documents", documentSchema);
const Proposal = mongoose.model(
  "Proposals",
  proposedIndividualActionPlanSchema
);
const ProposalConduct = mongoose.model(
  "ProposalsConduct",
  proposalConductSchema
);
const Notification = mongoose.model("Notification", notificationSchema);
const AuditLog = mongoose.model("AuditLog", auditLogSchema);

const Roster = mongoose.model("Roster", rosterSchema);
const Logs = mongoose.model("Logs", LogsSchema);
const RosterMember = mongoose.model("RosterMembers", rosterMembersSchema);
const Organization = mongoose.model("Organizations", organizationSchema);
const Accreditation = mongoose.model("Accreditations", accreditationSchema);
const Accomplishment = mongoose.model("Accomplishments", accomplishmentSchema);
const Post = mongoose.model("Posts", postSchema);
const SubAccomplishment = mongoose.model(
  "SubAccomplishment",
  subAccomplishmentSchema
);

const ProposedActionPlan = mongoose.model(
  "ProposedActionPlan",
  ProposedActionPlanSchema
);
const OrganizationProfile = mongoose.model(
  "OrganizationProfile",
  organizationProfileSchema
);

const PresidentProfile = mongoose.model(
  "PresidentProfile",
  presidentProfileSchema
);
const FinancialReport = mongoose.model(
  "FinancialReport",
  financialReportSchema
);

export {
  User,
  Notification,
  AuditLog,
  Adviser,
  Post,
  Proposal,
  Logs,
  Receipt,
  Document,
  Roster,
  RosterMember,
  Organization,
  ProposalConduct,
  Accreditation,
  Accomplishment,
  SubAccomplishment,
  ProposedActionPlan,
  FinancialReport,
  PresidentProfile,
  OrganizationProfile,
};
