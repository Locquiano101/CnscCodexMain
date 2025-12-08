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
            deparment: m.department,
            year: m.year,
            contactNumber: m.contactNumber,
            email: m.email,
            profilePicture: m.profilePicture,
          }));
      }
      // ⭐ Include President as an officer
      if (profile.orgPresident) {
        officers.unshift({
          name: profile.orgPresident.name,
          position: "President",
          studentId: profile.orgPresident.studentId || null,
          course: profile.orgPresident.course || null,
          department: profile.orgPresident.department || null,
          year: profile.orgPresident.year || null,
          contactNumber: profile.orgPresident.contactNumber || null,
          email: profile.orgPresident.email || null,
          profilePicture: profile.orgPresident.profilePicture || null,
        });
      }
      // ⭐ NEW: Fetch collected fees titles
      const inflows = await cashInflows
        .find({
          organizationProfile: profile._id,
        })
        .populate("collectibleFee");

      const collectedFeeTitles = inflows
        .filter((inflow) => inflow.collectibleFee) // make sure collectibleFee exists
        .map((inflow) => inflow.collectibleFee.title);

      result.push({
        organizationName: profile.orgName || org.currentName,
        yearsOfExistence: years,
        accreditedSince: profile.createdAt,

        adviserName: profile.adviser?.name || null,
        presidentName: profile.orgPresident?.name || null,

        officers,

        specialization: profile.orgSpecialization || null,
        collectedFeeTitles, // ✅ include fee titles here

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
