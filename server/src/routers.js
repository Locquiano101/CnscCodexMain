import express from "express";
import multer from "multer";
import * as Controller from "./controller/index.js";

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
router.get("/getPresidents", Controller.GetAllPresidents);
router.get("/getProposalsBySdu/:id", Controller.getPpaBySdu);
router.get("/getAllProposedActionPlan", Controller.getAllProposedActionPlan);

/* ---------- STUDENT DEVELOPMENT ACCREDITATION ---------- */
router.get("/getAllAccreditationId", Controller.GetAllAccreditationId);
router.get("/getAccreditation/:id", Controller.GetAccreditationById);
router.get(
  "/checkAccreditationApprovalStatuses/:orgProfileId",
  Controller.CheckAccreditationApprovalStatus
);

/* ---------- STUDENT DEVELOPMENT PRESIDENT ---------- */
router.get("/getPresidents/:orgId", Controller.GetPresidentByOrg);
router.get("/getPresident/:orgPresidentId", Controller.GetPresidentById);
router.get(
  "/getPreviousPresident/:orgId",
  Controller.getPreviousPresidentsByOrg
);

/* ---------- STUDENT DEVELOPMENT ROSTER ---------- */
router.get("/getAllroster", Controller.GetAllRostersWithMembers);
router.get(
  "/getRosterByOrg/:orgProfileId",
  Controller.GetRosterMembersByOrganizationIdSDU
);

/* ---------- ADVISER ACCREDITATION ---------- */
router.get("/getAdviserProposals/:orgId", Controller.getAdviserProposal);

/* ---------- COLLABORATION & FINANCIAL ---------- */
router.get(
  "/getAllCollaboratingOrganizationProfile",
  Controller.GetAllOrganizationProfileStudent
);
router.get("/getFinancialReport", Controller.getFinancialReportAll);
router.get(
  "/getFinancialReport/:OrgProfileId",
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
  Controller.GetAccreditationDocumentsByOrg
);
router.get(
  "/getAccreditatationDocuments",
  Controller.GetAccreditationDocumentsAll
);

/* ---------- STUDENT LEADER PROPOSALS ---------- */
router.get(
  "/getStudentLeaderProposalConduct/:orgProfileId",
  Controller.getProposalConductByOrgProfile
);
router.get(
  "/getAllSystemWideProposalConduct",
  Controller.getAllSystemWideProposal
);
router.get(
  "/getStudentLeaderAccomplishmentReady/:orgProfileId",
  Controller.getDoneProposalConductsByOrgProfile
);

router.get(
  "/getStudentLeaderProposalById/:accreditationId",
  Controller.getStudentPpaByAccreditationId
);
router.get("/getAllProposalConduct", Controller.getAllProposalConduct);

/* ---------- STUDENT LEADER ROSTER MEMBERS ---------- */
router.get(
  "/getRosterMembers/:orgProfileId",
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

/* ---------- STUDENT DEVELOPMENT PRESIDENT ---------- */
router.post(
  "/updateStatusPresident/:presidentId",
  Controller.UpdatePresidentProfileStatus
);
router.post("/addPresident", Controller.AddPresident);
router.post(
  "/addPresidentProfile/:presidentId",
  Controller.uploadFileAndAddDocument,
  Controller.UpdatePresidentProfile
);

/* ---------- STUDENT DEVELOPMENT ROSTER ---------- */
router.post("/CompleteStudentRoster/:rosterId", Controller.CompleteRosterList);
router.post("/ApproveRosterList/:rosterId", Controller.ApprovedRosterList);
router.post("/RevisionRosterList/:rosterId", Controller.revisionNoteRosterList);
router.post("/gradeAccomplishment/", Controller.gradeAccomplishment);

/* ---------- ADVISER ACCREDITATION ---------- */
router.post("/postUpdateProposal/:id", Controller.ApprovedProposal);
router.post("/sendNotificationRoster", Controller.SendEmailToOrgUsers);
router.post("/postApproveRoster/:rosterId", Controller.ApprovedRosterList);

/* ---------- COLLABORATION & FINANCIAL ---------- */
router.post(
  "/addReciept",
  Controller.uploadFileAndAddDocument,
  Controller.AddReceipt
);
router.post("/financialReportInquiry", Controller.SendFinancialEmailInquiry);

/* ---------- STUDENT LEADER ACCREDITATION ---------- */
router.post(
  "/addAccreditationDocument",
  Controller.uploadFileAndAddDocument,
  Controller.AddAccreditationDocument
);

/* ---------- STUDENT LEADER PROPOSALS ---------- */
router.post("/postStudentLeaderProposal", Controller.postStudentLeaderProposal);
router.put(
  "/updateProposalConduct/:id",
  upload.single("file"),
  Controller.updateProposalConduct
);
router.delete("/deleteProposalConduct/:id", Controller.deleteProposalConduct);

router.post(
  "/postStudentLeaderProposalConduct",
  Controller.uploadFileAndAddDocument,
  Controller.postProposalConduct
);
router.post(
  "/postStudentLeaderNewProposalConduct",
  Controller.uploadFileAndAddDocument,
  Controller.postNewProposalConduct
);
router.post(
  "/postStudentLeaderAccomplishment",
  Controller.uploadFileAndAddDocument,
  Controller.postProposalConduct
);
router.post(
  "/UpdateStudentLeaderProposal/:ProposalId",
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
