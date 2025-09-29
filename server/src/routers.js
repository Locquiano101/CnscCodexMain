import multer from "multer";
import express from "express";
import * as Controller from "./controller/index.js";

const router = express.Router();
const storage = multer.memoryStorage();
export const upload = multer({ storage });

router.get(
  "/generateReportAccreditationSdu",
  Controller.GenerateAccreditationReports
);
router.post("/getOrganizations", Controller.GetOrganizationsByDeliveryUnit);
router.get("/getPublicPosts", Controller.getPostForPublic);
router.get("/getOrgProfilePosts/:orgProfileId", Controller.getPostByOrgProfile);

router.post(
  "/updateStatusProposalConduct/:proposalConductId",
  Controller.updateProposalConductStatus
);
router.post(
  "/updateStatusAccomplishment/:accomplishmentId",
  Controller.updateAccomplishmentStatus
);

router.post("/financialReportInquiry", Controller.SendFinancialEmailInquiry);
router.post(
  "/postPublicInformation",
  Controller.uploadFilesAndAddDocuments,
  Controller.addDocumentsToPost
);
router.post(
  "/accreditationEmailInquiry",
  Controller.SendAccreditationInquiryEmailInquiry
);
router.get("/getAllUser", Controller.GetUsers);
router.post(
  "/updateOrganizationProfileStatus",
  Controller.PostStatusUpdateOrganization
);
router.post("/postNewUser", Controller.PostUser);
router.post("/UpdateUser/:id", Controller.UpdateUser);
router.delete("/deleteUser/:id", Controller.DeleteUser);

/* ********** STUDENT DEVELOPMENT ORGANIZATION ********** */
router.get("/getAllOrganizationProfile", Controller.GetAllOrganizationProfile);
router.get(
  "/getAllOrganizationProfileCard",
  Controller.GetAllOrganizationProfileCard
);
router.get("/getPresidents", Controller.GetAllPresidents);
router.get("/getProposalsBySdu/:id", Controller.getPpaBySdu);
router.get("/getOrganizationProfile", Controller.GetAllOrganizationProfile);
router.get("/getAllProposedActionPlan", Controller.getAllProposedActionPlan);
router.get("/getAllOrganization/", Controller.GetAllOrganization);
router.get(
  "/getAllActiveOrganizationProfile/",
  Controller.GetAllActiveOrganizationsWithDetails
);

/* ********** STUDENT DEVELOPMENT ACCREDITATION ********** */
router.post("/UpdateDocument/:documentId", Controller.UpdateDocumentStatus);
router.post(
  "/DeactivateAllAccreditation/",
  Controller.DeactivateAllAccreditations
);

/* ********** STUDENT DEVELOPMENT DOCUMENTS ********** */
router.get("/getAllAccreditationId", Controller.GetAllAccreditationId);
router.get("/getAccreditation/:id", Controller.GetAccreditationById);
router.post(
  "/sendAccreditationConfirmationEmail/:orgProfileId",
  Controller.SendAccreditationCompletionEmail
);
router.get(
  "/checkAccreditationApprovalStatuses/:orgProfileId",
  Controller.CheckAccreditationApprovalStatus
);
/* ********** STUDENT DEVELOPMENT PRESIDENT ********** */
router.post(
  "/updateStatusPresident/:presidentId",
  Controller.UpdatePresidentProfileStatus
);

/* ********** STUDENT DEVELOPMENT ROSTER ********** */
router.get("/getAllroster", Controller.GetAllRostersWithMembers);
router.get(
  "/getRosterByOrg/:orgProfileId",
  Controller.GetRosterMembersByOrganizationIdSDU
);
router.post("/CompleteStudentRoster/:rosterId", Controller.CompleteRosterList);
router.post("/ApproveRosterList/:rosterId", Controller.ApprovedRosterList);
router.post("/RevisionRosterList/:rosterId", Controller.revisionNoteRosterList);
router.post("/gradeAccomplishment/", Controller.gradeAccomplishment);

router.post("/adviserChangePassword/:userId", Controller.ChangePasswordAdviser);
router.post("/adviserChangePassword/:userId", Controller.ChangePasswordAdviser);

/* **********  ADVISER ACCREDITATION ********** */
router.get("/getAdviserProposals/:orgId", Controller.getAdviserProposal);
router.post("/postUpdateProposal/:id", Controller.ApprovedProposal);
router.post("/sendNotificationRoster", Controller.SendEmailToOrgUsers);
router.post("/postApproveRoster/:rosterId", Controller.ApprovedRosterList);
/* **********  ADVISER ACCREDITATION ********** */

router.get("/notifications", async (req, res) => {
  try {
    const userId = req.session.userId; // or use query param if not session based
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const notifications = await Notification.find({ recipient: userId }).sort({
      createdAt: -1,
    });

    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/*             **********
**********              **********
          STUDENT LEADER
**********              **********
**********              ********** 
*/
router.get(
  "/getAllCollaboratingOrganizationProfile",
  Controller.GetAllOrganizationProfileStudent
);

router.get(
  "/getFinancialReport/:OrgProfileId",
  Controller.getFinancialReportByOrg
);
router.get("/getFinancialReport", Controller.getFinancialReportAll);
router.get("/getApprovedPPA/:orgId", Controller.getApprovedPPA);
router.post(
  "/addReciept",
  Controller.uploadFileAndAddDocument,
  Controller.AddReceipt
);
router.post(
  "/addReciept",
  Controller.uploadFileAndAddDocument,
  Controller.AddReceipt
);

/* **********  STUDENT LEADER ACCREDITATION ********** */
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

/* ********** STUDENT LEADER PROPOSAL ********** */
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

router.post("/postStudentLeaderProposal", Controller.postStudentLeaderProposal);
router.delete("/deleteProposalConduct/:id", Controller.deleteProposalConduct);
router.put(
  "/updateProposalConduct/:id",
  upload.single("file"), // 👈 this parses multipart/form-data

  Controller.updateProposalConduct
);

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
/* ********** STUDENT LEADER DOCUMENTS ********** */
router.post(
  "/addAccreditationDocument",
  Controller.uploadFileAndAddDocument,
  Controller.AddAccreditationDocument
);

/* ********** STUDENT LEADER ROSTER MEMBER ********** */
router.get(
  "/getRosterMembers/:orgProfileId",
  Controller.GetRosterMemberByOrganization
);
router.post(
  "/addRosterMember",
  Controller.uploadFileAndAddDocument,
  Controller.AddNewRosterMember
);

/* ********** STUDENT LEADER ACCOMPLISHMENT ********** */
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

/* ********** STUDENT LEADER PRESIDENT ********** */
router.post("/addPresident", Controller.AddPresident);
router.post(
  "/addPresidentProfile/:presidentId",
  Controller.uploadFileAndAddDocument,
  Controller.UpdatePresidentProfile
);
router.get("/getPresidents/:orgId", Controller.GetPresidentByOrg);
router.get("/getPresident/:orgPresidentId", Controller.GetPresidentById);
router.get(
  "/getPreviousPresident/:orgId",
  Controller.getPreviousPresidentsByOrg
);
/* ********** GENERAL ********** */
router.post(
  "/uploadOrganizationLogo",
  Controller.uploadFileAndAddDocument,
  Controller.PostOrganizationalLogo
);
router.get("/userInfo/:userId", Controller.GetUserInformation);

router.get(
  "/getOrganizationProfile/:orgProfileId",
  Controller.GetOrganizationProfileInformation
);

router.post("/login", Controller.Login);
router.post("/logout", Controller.Logout);
router.get("/session-check", Controller.CheckSession);

router.post("/sendVerification", Controller.SendRegistrationConfirmationCode);
router.post(
  "/confirmVerification",
  Controller.ConfirmRegistration,
  Controller.RegisterUser
);
router.post("/initialRegistration", Controller.PostInitialOrganizationProfile);
router.post("/reRegistration", Controller.ReRegisterOrganizationProfile);
router.get("/documents/:id", Controller.getDocumentById);
router.get("/getAllProposalConduct", Controller.getAllProposalConduct);
router.get("/documents/:id", Controller.getDocumentById);

export default router;
