import {
  Accreditation,
  OrganizationProfile,
  PresidentProfile,
} from "../models/index.js";

export const UpdatePresidentProfileStatus = async (req, res) => {
  const { presidentId } = req.params;
  const { overallStatus, revisionNotes } = req.body;

  if (!presidentId) {
    return res.status(400).json({ message: "President ID is required." });
  }

  if (!overallStatus) {
    return res.status(400).json({ message: "Overall status is required." });
  }

  try {
    const profile = await PresidentProfile.findById(presidentId);

    if (!profile) {
      return res.status(404).json({ message: "President profile not found." });
    }

    // ✅ Update status
    profile.overAllStatus = overallStatus;

    // ✅ Save revision notes if provided
    if (revisionNotes && revisionNotes.trim() !== "") {
      profile.revisionNotes = revisionNotes;
    }

    await profile.save();

    return res.status(200).json({
      message: `President profile ${overallStatus.toLowerCase()} successfully.`,
      updatedProfile: profile,
    });
  } catch (error) {
    console.log("❌ Error updating president profile:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const AddPresident = async (req, res) => {
  try {
    const {
      name,
      organizationProfile,
      department,
      course,
      year,
      age,
      sex,
      religion,
      organization,
      nationality,
      birthplace,
      permanentAddress,
      parentGuardian,
      addressPhoneNo,
      sourceOfFinancialSupport,
      talentSkills,
      currentAddress,
      AccreditationId,
      contactNo,
      facebookAccount,
      classSchedule, // should be an array of { subject, place, time, day }
    } = req.body;

    const newPresidentProfile = new PresidentProfile({
      name,
      organizationProfile,
      organization,
      department,
      course,
      year,
      age,
      sex,
      profilePicture: null,
      religion,
      nationality,
      birthplace,
      presentAddress: currentAddress,
      permanentAddress,
      parentGuardian,
      addressPhoneNo,
      sourceOfFinancialSupport,
      talentSkills,
      contactNo,
      facebookAccount,
      classSchedule,
    });

    // Basic validation
    if (!organizationProfile) {
      console.error("Missing organization ID");
      return res
        .status(400)
        .json({ message: "organization Profile ID is required." });
    }

    const FindOrg = await OrganizationProfile.findById(organizationProfile);

    if (!FindOrg) {
      console.error("Organization not found:", organizationProfile);
      return res.status(404).json({ message: "Organization not found." });
    }

    const findAccreditation = await Accreditation.findById(AccreditationId);
    if (!findAccreditation) {
      console.error("Accreditation not found:", findAccreditation);
      return res.status(404).json({ message: "Accreditation not found." });
    }

    const savedProfile = await newPresidentProfile.save();

    await OrganizationProfile.findByIdAndUpdate(
      organizationProfile,
      { orgPresident: savedProfile._id },
      { new: true }
    );

    await Accreditation.findByIdAndUpdate(
      AccreditationId,
      { PresidentProfile: savedProfile._id },
      { new: true }
    );

    res.status(200).json({
      message: "Student profile created successfually.",
      profile: savedProfile,
    });
  } catch (error) {
    console.error("Error in PostStudentProfile:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const UpdatePresidentProfile = async (req, res) => {
  const file = res.locals.fileName;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { presidentId } = req.params; // assuming the president's profile ID is passed as a URL param

  if (!presidentId) {
    return res
      .status(400)
      .json({ message: "President profile ID is required." });
  }

  try {
    // Update the president profile with the uploaded file's filename
    const updatedProfile = await PresidentProfile.findByIdAndUpdate(
      presidentId,
      { profilePicture: file }, // or file.originalname if you prefer the original name
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "President profile not found." });
    }

    res.json({
      message: "Profile picture updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.log("Error updating profile picture:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const GetAllPresidents = async (req, res) => {
  try {
    const presidents = await PresidentProfile.find().populate({
      path: "organizationProfile",
    });

    res.status(200).json(presidents);
  } catch (error) {
    console.error("Error fetching all presidents:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const GetPresidentByOrg = async (req, res) => {
  const { orgId } = req.params;

  try {
    const president = await PresidentProfile.find({ organization: orgId });
    if (!president) {
      return res
        .status(404)
        .json({ message: "President not found for this organization." });
    }
    res.status(200).json(president);
  } catch (error) {
    console.error("Error fetching president by organization:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const GetPresidentById = async (req, res) => {
  const { orgPresidentId } = req.params;

  try {
    const president = await PresidentProfile.findById(orgPresidentId);
    if (!president) {
      return res.status(404).json({ message: "President not found." });
    }
    res.status(200).json(president);
  } catch (error) {
    console.error("Error fetching president by ID:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getPreviousPresidentsByOrg = async (req, res) => {
  const { orgId } = req.params;

  try {
    // Find all presidents for the org whose status indicates they are no longer serving
    const previousPresidents = await PresidentProfile.find({
      organization: orgId,
      overAllStatus: { $ne: "Active" }, // Only non-active presidents
    }).sort({ createdAt: -1 }); // Most recent first

    if (!previousPresidents.length) {
      return res.status(404).json({
        message: "No previous presidents found for this organization.",
      });
    }

    res.status(200).json(previousPresidents);
  } catch (error) {
    console.error("Error fetching previous presidents:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
