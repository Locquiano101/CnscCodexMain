import {
  Adviser,
  cashInflows,
  collectibleFee,
  Organization,
  OrganizationProfile,
  ProposalConduct,
  Roster,
  RosterMember,
  User,
} from "../models/index.js";

export const getOrganizationSummary = async (req, res) => {
  try {
    const organizations = await Organization.find().populate({
      path: "organizationProfile",
      match: { isActive: true },
      populate: [{ path: "orgPresident" }, { path: "adviser" }],
    });

    const result = [];

    for (let org of organizations) {
      const profile = org.organizationProfile[0];
      if (!profile) continue;

      // Compute years of existence
      const years = profile.createdAt
        ? new Date().getFullYear() - new Date(profile.createdAt).getFullYear()
        : null;

      // Fetch approved activities
      const activities = await ProposalConduct.find({
        organizationProfile: profile._id,
        overallStatus: "Conduct Approved",
        isActive: true,
      });

      const programs = activities.map(
        (a) => a.ProposedIndividualActionPlan?.activityTitle
      );

      // ⭐ Fetch roster + officers
      // ⭐ Fetch roster + officers
      const roster = await Roster.findOne({
        organizationProfile: profile._id,
      });

      let officers = [];
      if (roster) {
        const rosterMembers = await RosterMember.find({
          roster: roster._id,
        });

        officers = rosterMembers
          .filter(
            (m) =>
              m.position &&
              m.position.trim() !== "" &&
              m.position.toLowerCase() !== "member" // Exclude "Member"
          )
          .map((m) => ({
            name: m.name,
            position: m.position,
            studentId: m.studentId,
            course: m.course,
            year: m.year,
            contactNumber: m.contactNumber,
            email: m.email,
            profilePicture: m.profilePicture,
          }));
      }

      // ⭐ NEW: Calculate total fees collected
      const inflows = await cashInflows.find({
        organizationProfile: profile._id,
      });

      const specializationFeeCollected = inflows.reduce(
        (total, inflow) => total + (inflow.amount || 0),
        0
      );

      // ⭐ NEW: Count collectible fees (optional)
      const collectibleFees = await collectibleFee.find({
        organizationProfile: profile._id,
      });

      result.push({
        organizationName: profile.orgName || org.currentName,
        yearsOfExistence: years,
        accreditedSince: profile.createdAt,

        adviserName: profile.adviser?.name || null,
        presidentName: profile.orgPresident?.name || null,

        officers,

        specialization: profile.orgSpecialization || null,
        specializationFeeCollected,

        programsUndertaken: programs || [],
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("❌ Error fetching organization summary:", err);
    return res.status(500).json({ message: "Server Error", error: err });
  }
};
