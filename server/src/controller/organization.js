import {
  Notification,
  Organization,
  OrganizationProfile,
  User,
} from "../models/index.js";
import { NodeEmail } from "../middleware/emailer.js";
const verificationStore = {};

export const PostOrganizationalLogo = async (req, res) => {
  try {
    const { orgId } = req.body;
    const orgLogo = res.locals.fileName;
    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required",
      });
    }

    if (!orgLogo) {
      return res.status(400).json({
        success: false,
        message: "Organization logo is required",
      });
    }

    // Find and update the organization with the new logo
    const updatedOrganization = await OrganizationProfile.findByIdAndUpdate(
      orgId,
      { orgLogo },
      { new: true, runValidators: true }
    );

    if (!updatedOrganization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Organization logo updated successfully",
      data: {
        orgId: updatedOrganization._id,
        orgLogo: updatedOrganization.orgLogo,
      },
    });
  } catch (error) {
    console.error("Error updating organization logo:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const PostStatusUpdateOrganization = async (req, res) => {
  try {
    const { orgId, overAllStatus, revisionNotes } = req.body;

    // Validate input
    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required",
      });
    }

    // Find organization
    const organization = await OrganizationProfile.findById(orgId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Update organization profile
    const updatedOrganization = await OrganizationProfile.findByIdAndUpdate(
      orgId,
      { overAllStatus, revisionNotes },
      { new: true, runValidators: true }
    );

    // 🔔 Create a new notification
    const notifMessage =
      overAllStatus === "Approved"
        ? `Your organization's accreditation has been approved.`
        : overAllStatus === "Disapproved"
        ? `Your organization's accreditation has been disapproved. Please check the revision notes for details.`
        : `Your organization's accreditation status has been updated to "${overAllStatus}".`;

    const notification = new Notification({
      organizationProfile: orgId,
      department: organization.department || "N/A",
      type: "Accreditation Update",
      message: notifMessage,
      data: { orgId, status: overAllStatus, revisionNotes },
    });

    await notification.save();

    // 🔍 Find ALL users linked to the organization
    const users = await User.find({
      organizationProfile: orgId,
    }).select("email name");

    if (!users.length) {
      console.warn(`⚠️ No users found for organization ${organization._id}`);
    } else {
      const emailSubject = `Organization Status Update: ${overAllStatus}`;
      const emailMessage = `
Dear ${organization.orgName || "Organization"},

${notifMessage}

${revisionNotes ? `Revision Notes: ${revisionNotes}` : ""}

Thank you,
CNSC CODEX Accreditation System
      `;

      // 📧 Send email to each user
      for (const user of users) {
        if (user.email) {
          try {
            await NodeEmail(user.email, emailSubject, emailMessage);
          } catch (emailErr) {
            console.error(
              `❌ Failed to send email to ${user.email}:`,
              emailErr
            );
          }
        }
      }
    }

    // ✅ Response
    res.status(200).json({
      success: true,
      message: "Organization status updated. Notifications and emails sent.",
      data: updatedOrganization,
    });
  } catch (error) {
    console.error("Error updating organization status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const GetAllActiveOrganizationsWithDetails = async (req, res) => {
  try {
    const organizations = await OrganizationProfile.find({ isActive: true }) // ✅ filter only active orgs
      .populate("organization") // populate Organization ref
      .populate("orgPresident") // populate PresidentProfile ref
      .sort({ createdAt: -1 });

    if (!organizations || organizations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No active organizations found",
      });
    }

    res.status(200).json({
      success: true,
      count: organizations.length,
      data: organizations,
    });
  } catch (error) {
    console.error("Error fetching active organizations with details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active organizations",
      error: error.message,
    });
  }
};

export const GetAllOrganizationProfileStudent = async (req, res) => {
  try {
    const search = req.query.search || "";
    const department = req.query.department || "";
    const program = req.query.program || "";
    const specialization = req.query.specialization || "";
    const scope = req.query.scope || "";

    const query = {
      isActive: true, // ✅ Only active documents
      orgStatus: "Active", // ✅ Ensure orgStatus is Active
    };

    // Search filters (name, acronym, etc.)
    if (search.trim() !== "") {
      query.$or = [
        { orgName: { $regex: search, $options: "i" } },
        { orgAcronym: { $regex: search, $options: "i" } },
        { orgClass: { $regex: search, $options: "i" } },
        { orgCourse: { $regex: search, $options: "i" } },
        { orgDepartment: { $regex: search, $options: "i" } },
        { adviserName: { $regex: search, $options: "i" } },
      ];
    }

    // Dropdown filters
    if (department) query.orgDepartment = department;
    if (program) query.orgCourse = program;
    if (specialization) query.orgSpecialization = specialization;

    // Scope filter
    if (scope === "local") {
      query.orgClass = "Local";
    } else if (scope === "systemwide") {
      query.orgClass = "System-wide";
    }

    const organizationProfiles = await OrganizationProfile.find(query);

    if (!organizationProfiles || organizationProfiles.length === 0) {
      return res.status(404).json({ error: "No active organizations found" });
    }

    res.status(200).json(organizationProfiles);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch organization profiles",
      details: error.message,
    });
  }
};

export const GetAllOrganizationProfileCard = async (req, res) => {
  try {
    const organizationProfiles = await OrganizationProfile.find();

    if (!organizationProfiles || organizationProfiles.length === 0) {
      return res.status(404).json({ error: "No active organizations found" });
    }

    res.status(200).json(organizationProfiles);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch organization profiles",
      details: error.message,
    });
  }
};

export const GetAllOrganizationProfile = async (req, res) => {
  try {
    const search = req.query.search || "";
    const department = req.query.department || "";
    const program = req.query.program || "";
    const specialization = req.query.specialization || "";
    const scope = req.query.scope || "";

    const query = {
      // isActive: true, // ✅ Only active documents
      // orgStatus: "Active", // ✅ Ensure orgStatus is Active
    };

    // Search filters (name, acronym, etc.)
    if (search.trim() !== "") {
      query.$or = [
        { orgName: { $regex: search, $options: "i" } },
        { orgAcronym: { $regex: search, $options: "i" } },
        { orgClass: { $regex: search, $options: "i" } },
        { orgCourse: { $regex: search, $options: "i" } },
        { orgDepartment: { $regex: search, $options: "i" } },
        { adviserName: { $regex: search, $options: "i" } },
      ];
    }

    // Dropdown filters
    if (department) query.orgDepartment = department;
    if (program) query.orgCourse = program;
    if (specialization) query.orgSpecialization = specialization;

    // Scope filter
    if (scope === "local") {
      query.orgClass = "Local";
    } else if (scope === "systemwide") {
      query.orgClass = "System-wide";
    }

    const organizationProfiles = await OrganizationProfile.find(query);

    if (!organizationProfiles || organizationProfiles.length === 0) {
      return res.status(404).json({ error: "No active organizations found" });
    }

    res.status(200).json(organizationProfiles);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch organization profiles",
      details: error.message,
    });
  }
};

export const GetAllOrganization = async (req, res) => {
  try {
    const search = req.query.search || "";

    // Build the query for the organization name fields
    const orgQuery = search
      ? {
          $or: [
            { originalName: { $regex: search, $options: "i" } },
            { currentName: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const organizations = await Organization.find(orgQuery)
      .populate("organizationProfile")
      .sort({ createdAt: -1 }); // optional: sorts by newest first

    if (!organizations || organizations.length === 0) {
      return res.status(404).json({ error: "No organizations found" });
    }

    res.status(200).json(organizations);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch organizations",
      details: error.message,
    });
  }
};

export const GetOrganizationProfileInformation = async (req, res) => {
  const { orgProfileId } = req.params;

  try {
    const organization = await OrganizationProfile.findById(orgProfileId)

      .populate("orgPresident")
      .populate("adviser");

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.status(200).json(organization);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch organization",
      details: error.message,
    });
  }
};

export const GetOrganizationsByDeliveryUnit = async (req, res) => {
  try {
    const { deliveryUnit } = req.body;
    const { search, orgDepartment, orgCourse, orgSpecialization, orgClass } =
      req.query;

    if (!deliveryUnit) {
      return res.status(400).json({
        success: false,
        message: "Delivery Unit is required",
      });
    }

    // Build dynamic filters
    const filters = { orgDepartment: deliveryUnit };

    if (orgDepartment) filters.orgDepartment = orgDepartment;
    if (orgCourse) filters.orgCourse = orgCourse;
    if (orgSpecialization) filters.orgSpecialization = orgSpecialization;
    if (orgClass) filters.orgClass = orgClass;

    // Text search (case-insensitive)
    if (search) {
      filters.orgName = { $regex: search, $options: "i" };
    }

    const organizations = await OrganizationProfile.find(filters)
      .populate("organization")
      .populate("orgPresident")
      .populate("adviser");

    if (!organizations || organizations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No organizations found",
      });
    }

    res.status(200).json(organizations);
  } catch (error) {
    console.error("Error fetching organizations by delivery unit:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch organizations",
      error: error.message,
    });
  }
};
