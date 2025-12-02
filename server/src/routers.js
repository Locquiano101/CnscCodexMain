import express from "express";
import multer from "multer";
import * as Controller from "./controller/index.js";
import { ensureAuthenticated, requireRoles } from "./middleware/auth.js";
import { enforceRequirement } from "./middleware/requirement-gating.js";
import { rateLimit } from "./middleware/rate-limit.js";

const router = express.Router();
const storage = multer.memoryStorage();
export const upload = multer({ storage });

/* =========================================================
   📄 GET ROUTES
========================================================= */

/* ---------- GENERAL ---------- */
router.get("/session-check", Controller.CheckSession);
router.get("/userInfo/:userId", Controller.GetUserInformation);
router.get(
  "/getOrganizationProfile/:orgProfileId",
  Controller.GetOrganizationProfileInformation
);
router.get("/documents/:id", Controller.getDocumentById);

/* ---------- USERS ---------- */
router.get("/getAllUser", Controller.GetUsers);

/* ---------- STUDENT DEVELOPMENT ORGANIZATION ---------- */
router.get("/getAllOrganizationProfile", Controller.GetAllOrganizationProfile);
router.get(
  "/getAllOrganizationProfileCard",
  Controller.GetAllOrganizationProfileCard
);
router.get("/getAllOrganization/", Controller.GetAllOrganization);
router.get(
  "/getAllActiveOrganizationProfile/",
  Controller.GetAllActiveOrganizationsWithDetails
);
router.get(
  "/getPresidents",
  enforceRequirement("president-info"),
  Controller.GetAllPresidents
);
router.get(
  "/getProposalsBySdu/:id",
  enforceRequirement("action-plan"),
  Controller.getPpaBySdu
);
router.get(
  "/getAllProposedActionPlan",
  enforceRequirement("action-plan"),
  Controller.getAllProposedActionPlan
);

/* ---------- STUDENT DEVELOPMENT ACCREDITATION ---------- */
router.get("/getAllAccreditationId", Controller.GetAllAccreditationId);
router.get("/getAccreditation/:id", Controller.GetAccreditationById);
router.get(
  "/checkAccreditationApprovalStatuses/:orgProfileId",
  Controller.CheckAccreditationApprovalStatus
);

/* ---------- STUDENT DEVELOPMENT PRESIDENT ---------- */
router.get(
  "/getPresidents/:orgId",
  enforceRequirement("president-info"),
  Controller.GetPresidentByOrg
);
router.get(
  "/getPresident/:orgPresidentId",
  enforceRequirement("president-info"),
  Controller.GetPresidentById
);
router.get(
  "/getPreviousPresident/:orgId",
  enforceRequirement("president-info"),
  Controller.getPreviousPresidentsByOrg
);

/* ---------- STUDENT DEVELOPMENT ROSTER ---------- */
router.get(
  "/getAllroster",
  enforceRequirement("roster"),
  Controller.GetAllRostersWithMembers
);
router.get(
  "/getRosterByOrg/:orgProfileId",
  enforceRequirement("roster"),
  Controller.GetRosterMembersByOrganizationIdSDU
);

/* ---------- ADVISER ACCREDITATION ---------- */
router.get("/getAdviserProposals/:orgId", Controller.getAdviserProposal);

/* ---------- COLLABORATION & FINANCIAL ---------- */
router.get(
  "/getAllCollaboratingOrganizationProfile",
  Controller.GetAllOrganizationProfileStudent
);
router.get(
  "/getFinancialReport",
  enforceRequirement("financial-report"),
  Controller.getFinancialReportAll
);
router.get(
  "/getFinancialReport/:OrgProfileId",
  enforceRequirement("financial-report"),
  Controller.getFinancialReportByOrg
);

/* ---------- STUDENT LEADER ACCREDITATION ---------- */
router.get(
  "/getAccreditationInfo/:orgProfileId",
  Controller.GetAccreditationDetails
);
router.get("/getAllAccreditationInfo", Controller.GetAllAccreditationDetails);
router.get(
  "/getAccomplishment/:OrgProfileId",
  Controller.getAccomplishmentReportByOrg
);
router.get("/getAccomplishmentAll", Controller.getAccomplishmentReportAll);
router.get(
  "/getAccreditatationDocuments/:orgProfileId",
  enforceRequirement("accreditation-documents"),
  Controller.GetAccreditationDocumentsByOrg
);
router.get(
  "/getAccreditatationDocuments",
  enforceRequirement("accreditation-documents"),
  Controller.GetAccreditationDocumentsAll
);

/* ---------- STUDENT LEADER PROPOSALS ---------- */
router.get(
  "/getStudentLeaderProposalConduct/:orgProfileId",
  enforceRequirement("action-plan"),
  Controller.getProposalConductByOrgProfile
);
router.get(
  "/getAllSystemWideProposalConduct",
  enforceRequirement("action-plan"),
  Controller.getAllSystemWideProposal
);
router.get(
  "/getStudentLeaderAccomplishmentReady/:orgProfileId",
  enforceRequirement("action-plan"),
  Controller.getDoneProposalConductsByOrgProfile
);
router.get(
  "/getApprovedPPA/:orgId",
  enforceRequirement("action-plan"),
  Controller.getApprovedPPA
);
router.get(
  "/getStudentLeaderProposalById/:accreditationId",
  enforceRequirement("action-plan"),
  Controller.getStudentPpaByAccreditationId
);
router.get(
  "/getAllProposalConduct",
  enforceRequirement("action-plan"),
  Controller.getAllProposalConduct
);

/* ---------- STUDENT LEADER ROSTER MEMBERS ---------- */
router.get(
  "/getRosterMembers/:orgProfileId",
  enforceRequirement("roster"),
  Controller.GetRosterMemberByOrganization
);

/* ---------- REPORTS & NOTIFICATIONS ---------- */
router.get(
  "/generateReportAccreditationSdu",
  Controller.GenerateAccreditationReports
);
router.get("/getPublicPosts", Controller.getPostForPublic);
router.get("/getOrgProfilePosts/:orgProfileId", Controller.getPostByOrgProfile);
router.get(
  "/OrganizationNotification/:organizationProfileId",
  Controller.GetNotificationsByOrgProfile
);

/* ---------- ADMIN / AUDIT ---------- */
router.get(
  "/audit-logs",
  ensureAuthenticated,
  // SDU-only visibility; adjust roles here as needed
  requireRoles(["sdu", "sdu coordinator", "sdu-coordinator", "sdu-main"]),
  Controller.ListAuditLogs
);

/* ---------- ACCREDITATION REQUIREMENTS (Visibility) ---------- */
router.get(
  "/accreditation/requirements/visible",
  ensureAuthenticated,
  Controller.listVisibleRequirements
);
router.get(
  "/accreditation/requirements/:key/submission/:orgId",
  ensureAuthenticated,
  Controller.getRequirementSubmission
);
router.get(
  "/admin/accreditation/requirements/:key/submissions",
  ensureAuthenticated,
  // Allow adviser to view submissions for oversight of own org
  requireRoles(["sdu", "sdu coordinator", "sdu-coordinator", "sdu-main", "adviser"]),
  Controller.listRequirementSubmissions
);
router.patch(
  "/admin/accreditation/requirements/:key/submissions/:submissionId/status",
  ensureAuthenticated,
  // Extend status update capability to adviser
  requireRoles(["sdu", "sdu coordinator", "sdu-coordinator", "sdu-main", "adviser"]),
  Controller.updateRequirementSubmissionStatus
);

/* ---------- ROOMS / LOCATIONS ---------- */
// Public read (authenticated): active rooms filtered by optional campus
router.get("/rooms", ensureAuthenticated, Controller.listRooms);
// Admin management (SDU roles)
router.get(
  "/admin/rooms",
  ensureAuthenticated,
  requireRoles(["sdu", "sdu coordinator", "sdu-coordinator", "sdu-main"]),
  Controller.adminListRooms
);
router.post(
  "/admin/rooms",
  ensureAuthenticated,
  requireRoles(["sdu", "sdu coordinator", "sdu-coordinator", "sdu-main"]),
  Controller.createRoom
);
router.patch(
  "/admin/rooms/:id",
  ensureAuthenticated,
  requireRoles(["sdu", "sdu coordinator", "sdu-coordinator", "sdu-main"]),
  Controller.updateRoom
);
router.patch(
  "/admin/rooms/:id/active",
  ensureAuthenticated,
  requireRoles(["sdu", "sdu coordinator", "sdu-coordinator", "sdu-main"]),
  Controller.setRoomActive
);

/* ---------- ACCREDITATION REQUIREMENTS (Admin) ---------- */
router.get(
  "/admin/accreditation/requirements",
  ensureAuthenticated,
  requireRoles(["sdu", "sdu coordinator", "sdu-coordinator", "sdu-main"]),
  Controller.listAllRequirements
);
router.get(
  "/admin/accreditation/requirements/gating-status",
  ensureAuthenticated,
  requireRoles(["sdu", "sdu coordinator", "sdu-coordinator", "sdu-main"]),
  Controller.gatingStatus
);
router.post(
  "/admin/accreditation/requirements",
  ensureAuthenticated,
  requireRoles(["sdu", "sdu coordinator", "sdu-coordinator", "sdu-main"]),
  rateLimit("requirement-mod", { windowMs: 5 * 60 * 1000, max: 20 }),
  upload.single("file"),
  Controller.createCustomRequirement
);
router.patch(
  "/admin/accreditation/requirements/:id",
  ensureAuthenticated,
  requireRoles(["sdu", "sdu coordinator", "sdu-coordinator", "sdu-main"]),
  rateLimit("requirement-mod", { windowMs: 5 * 60 * 1000, max: 40 }),
  upload.single("file"),
  Controller.updateRequirement
);
router.patch(
  "/admin/accreditation/requirements/:id/enable",
  ensureAuthenticated,
  requireRoles(["sdu", "sdu coordinator", "sdu-coordinator", "sdu-main"]),
  rateLimit("requirement-mod", { windowMs: 5 * 60 * 1000, max: 60 }),
  Controller.toggleRequirement
);
router.delete(
  "/admin/accreditation/requirements/:id",
  ensureAuthenticated,
  requireRoles(["sdu", "sdu coordinator", "sdu-coordinator", "sdu-main"]),
  rateLimit("requirement-mod", { windowMs: 5 * 60 * 1000, max: 20 }),
  Controller.deleteRequirement
);

/* =========================================================
   ✉️ POST / PUT / DELETE ROUTES
========================================================= */

/* ---------- GENERAL ---------- */
router.post("/login", Controller.Login);
router.post("/logout", Controller.Logout);
router.post(
  "/updateStatusProposalConduct/:proposalConductId",
  Controller.updateProposalConductStatus
);

router.post(
  "/updateStatusAccomplishment/:accomplishmentId",
  Controller.updateAccomplishmentStatus
);

router.post("/sendVerification", Controller.SendRegistrationConfirmationCode);
router.post(
  "/confirmVerification",
  Controller.ConfirmRegistration,
  Controller.RegisterUser
);

router.post("/initialRegistration", Controller.PostInitialOrganizationProfile);
router.post("/reRegistration", Controller.ReRegisterOrganizationProfile);

router.post(
  "/uploadOrganizationLogo",
  Controller.uploadFileAndAddDocument,
  Controller.PostOrganizationalLogo
);

/* ---------- USERS ---------- */
router.post("/postNewUser", Controller.PostUser);
router.post("/UpdateUser/:id", Controller.UpdateUser);
router.delete("/deleteUser/:id", Controller.DeleteUser);

router.post(
  "/updateOrganizationProfileStatus",
  Controller.PostStatusUpdateOrganization
);
router.post("/adviserChangePassword/:userId", Controller.ChangePasswordAdviser);

/* ---------- STUDENT DEVELOPMENT ORGANIZATION ---------- */
router.post("/getOrganizations", Controller.GetOrganizationsByDeliveryUnit);

/* ---------- STUDENT DEVELOPMENT ACCREDITATION ---------- */
router.post("/UpdateDocument/:documentId", Controller.UpdateDocumentStatus);
router.post(
  "/DeactivateAllAccreditation",
  Controller.DeactivateAllAccreditations
);
router.post(
  "/sendAccreditationConfirmationEmail/:orgProfileId",
  Controller.SendAccreditationCompletionEmail
);
router.post(
  "/systemResetAccreditation",
  Controller.SystemResetAccreditation
);

/* ---------- STUDENT DEVELOPMENT PRESIDENT ---------- */
router.post(
  "/updateStatusPresident/:presidentId",
  enforceRequirement("president-info"),
  Controller.UpdatePresidentProfileStatus
);
router.post(
  "/addPresident",
  enforceRequirement("president-info"),
  Controller.AddPresident
);
router.post(
  "/addPresidentProfile/:presidentId",
  enforceRequirement("president-info"),
  Controller.uploadFileAndAddDocument,
  Controller.UpdatePresidentProfile
);

/* ---------- STUDENT DEVELOPMENT ROSTER ---------- */
router.post(
  "/CompleteStudentRoster/:rosterId",
  enforceRequirement("roster"),
  Controller.CompleteRosterList
);
router.post(
  "/ApproveRosterList/:rosterId",
  enforceRequirement("roster"),
  Controller.ApprovedRosterList
);
router.post(
  "/RevisionRosterList/:rosterId",
  enforceRequirement("roster"),
  Controller.revisionNoteRosterList
);
router.post("/gradeAccomplishment/", Controller.gradeAccomplishment);
router.post(
  "/resetAccomplishmentGrades/:OrgProfileId",
  Controller.resetAccomplishmentGradesForOrg
);

/* ---------- ADVISER ACCREDITATION ---------- */
router.post("/postUpdateProposal/:id", Controller.ApprovedProposal);
router.post("/sendNotificationRoster", Controller.SendEmailToOrgUsers);
router.post("/postApproveRoster/:rosterId", Controller.ApprovedRosterList);

/* ---------- COLLABORATION & FINANCIAL ---------- */
router.post(
  "/addReciept",
  enforceRequirement("financial-report"),
  Controller.uploadFileAndAddDocument,
  Controller.AddReceipt
);
router.post(
  "/financialReportInquiry",
  enforceRequirement("financial-report"),
  Controller.SendFinancialEmailInquiry
);

/* ---------- STUDENT LEADER ACCREDITATION ---------- */
router.post(
  "/addAccreditationDocument",
  enforceRequirement("accreditation-documents"),
  Controller.uploadFileAndAddDocument,
  Controller.AddAccreditationDocument
);
// Student leader submission for template/custom accreditation requirement
router.post(
  "/accreditation/requirements/:key/submit",
  ensureAuthenticated,
  upload.single("file"),
  Controller.submitRequirement
);

/* ---------- STUDENT LEADER PROPOSALS ---------- */
router.post(
  "/postStudentLeaderProposal",
  enforceRequirement("action-plan"),
  Controller.postStudentLeaderProposal
);
router.put(
  "/updateProposalConduct/:id",
  enforceRequirement("action-plan"),
  upload.single("file"),
  Controller.updateProposalConduct
);
router.delete(
  "/deleteProposalConduct/:id",
  enforceRequirement("action-plan"),
  Controller.deleteProposalConduct
);

router.post(
  "/postStudentLeaderProposalConduct",
  enforceRequirement("action-plan"),
  Controller.uploadFileAndAddDocument,
  Controller.postProposalConduct
);
router.post(
  "/postStudentLeaderNewProposalConduct",
  enforceRequirement("action-plan"),
  Controller.uploadFileAndAddDocument,
  Controller.postNewProposalConduct
);
router.post(
  "/postStudentLeaderAccomplishment",
  enforceRequirement("action-plan"),
  Controller.uploadFileAndAddDocument,
  Controller.postProposalConduct
);
router.post(
  "/UpdateStudentLeaderProposal/:ProposalId",
  enforceRequirement("action-plan"),
  Controller.updateStudentLeaderProposal
);

/* ---------- STUDENT LEADER ACCOMPLISHMENT ---------- */
router.post("/addAccomplishment", Controller.addAccomplishment);
router.put(
  "/StudentUpdateAccomplishmentDcument/:id",
  Controller.uploadFileAndUpdateDocument,
  Controller.updateAccomplishment
);
router.post(
  "/addDocumentAccomplishment",
  Controller.uploadFileAndAddDocument,
  Controller.AddDocumentToSubAccomplishment
);

/* ---------- STUDENT LEADER ROSTER MEMBERS ---------- */
router.post(
  "/addRosterMember",
  enforceRequirement("roster"),
  Controller.uploadFileAndAddDocument,
  Controller.AddNewRosterMember
);

/* ---------- REPORTS & NOTIFICATIONS ---------- */
router.post(
  "/SduMainAccreditationReset",
  Controller.NotifcationAccreditationReset
);
router.post(
  "/SduMainAccreditationWarning",
  Controller.NotifcationWarningAccreditation
);
router.post(
  "/SduMainAccreditationSuspension",
  Controller.NotifcationSuspensionAccreditation
);
router.post(
  "/UpdateDeadlineAcrreditation/",
  Controller.NotifcationAccreditationDeadlineSet
);
router.post("/NotifyPresidentOrganization", Controller.NotifyPresidentOrg);
router.post(
  "/accreditationEmailInquiry",
  Controller.SendAccreditationInquiryEmailInquiry
);
router.post(
  "/postPublicInformation",
  Controller.uploadFilesAndAddDocuments,
  Controller.addDocumentsToPost
);

export default router;
