import axios from "axios";
import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
import { School2 } from "lucide-react";
import { StudentDevOrganizationProfileCard } from "../sdu-main";

export function SduAccreditationOverview({ selectedOrg, onSelectOrg }) {
  const [activeOrganization, setActiveOrganization] = useState([]);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_ROUTER}/getAllAccreditationId/`);
      console.log(res.data);
      setActiveOrganization(res.data);
    } catch (error) {
      console.error("Failed to fetch accreditation data", error);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Helper to get status badge styling
  const getStatusBadge = (status) => {
    const statusStyles = {
      Approved: "bg-green-100 text-green-700 border-green-200",
      Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Revision From SDU": "bg-red-100 text-red-700 border-red-200",
      Rejected: "bg-red-100 text-red-700 border-red-200",
    };

    return statusStyles[status] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  // Helper to handle specialization/department display
  const renderAcademicInfo = (org) => {
    const profile = org.organizationProfile;
    if (!profile) return null;

    if (profile.orgClass === "System-wide") {
      if (profile.orgSpecialization?.toLowerCase() === "student government") {
        return (
          <>
            <p>
              <span className="font-medium text-gray-600">Specialization:</span>{" "}
              <span className="text-gray-800">{profile.orgSpecialization}</span>
            </p>
            <p>
              <span className="font-medium text-gray-600">Department:</span>{" "}
              <span className="text-gray-800">
                {profile.orgDepartment || "N/A"}
              </span>
            </p>
          </>
        );
      }
      return (
        <p>
          <span className="font-medium text-gray-600">Specialization:</span>{" "}
          <span className="text-gray-800">
            {profile.orgSpecialization || "N/A"}
          </span>
        </p>
      );
    }

    // Local and other orgClass types
    return (
      <>
        <p>
          <span className="font-medium text-gray-600">Course:</span>{" "}
          <span className="text-gray-800">{profile.orgCourse || "N/A"}</span>
        </p>
        <p>
          <span className="font-medium text-gray-600">Department:</span>{" "}
          <span className="text-gray-800">
            {profile.orgDepartment || "N/A"}
          </span>
        </p>
      </>
    );
  };

  // Helper to render president information
  const renderPresidentInfo = (org) => {
    const president = org.PresidentProfile;
    if (!president) {
      return (
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-500">👤 No president assigned</p>
        </div>
      );
    }

    return (
      <div className="bg-blue-50 p-3 rounded-lg space-y-1">
        <div className="flex items-center gap-2">
          {president.profilePicture ? (
            <img
              src={`${DOCU_API_ROUTER}/${org.organizationProfile._id}/${president.profilePicture}`}
              alt="President"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xs font-medium">👤</span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-800">
              {president.name}
            </p>
            <p className="text-xs text-gray-600">
              {president.year} - {president.course}
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-gray-600">
          <span>📞 {president.contactNo}</span>
          <span
            className={`px-2 py-1 rounded text-xs font-medium border ${getStatusBadge(
              president.overAllStatus
            )}`}
          >
            {president.overAllStatus}
          </span>
        </div>
      </div>
    );
  };

  // Helper to render document status
  const renderDocumentStatus = (org) => {
    const documents = [
      { name: "Joint Statement", data: org.JointStatement },
      { name: "Constitution & By-Laws", data: org.ConstitutionAndByLaws },
      { name: "Pledge Against Hazing", data: org.PledgeAgainstHazing },
    ];

    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">📄 Document Status</p>
        <div className="grid grid-cols-1 gap-1 text-xs">
          {documents.map((doc, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-gray-600">{doc.name}:</span>
              {doc.data ? (
                <span
                  className={`px-2 py-1 rounded text-xs font-medium border ${getStatusBadge(
                    doc.data.status
                  )}`}
                >
                  {doc.data.status}
                </span>
              ) : (
                <span className="text-gray-400">Not submitted</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper to render financial information
  const renderFinancialInfo = (org) => {
    const financial = org.FinancialReport;
    if (!financial) return null;

    const balance = financial.initialBalance || 0;
    const reimbursements = financial.reimbursements?.length || 0;
    const disbursements = financial.disbursements?.length || 0;

    return (
      <div className="bg-green-50 p-3 rounded-lg space-y-1">
        <p className="text-sm font-medium text-gray-700">
          💰 Financial Overview
        </p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <p className="text-gray-600">Balance</p>
            <p
              className={`font-medium ${
                balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ₱{balance.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Reimbursements</p>
            <p className="font-medium text-blue-600">{reimbursements}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Disbursements</p>
            <p className="font-medium text-orange-600">{disbursements}</p>
          </div>
        </div>
      </div>
    );
  };

  // Separate organizations by active status
  const activeOrgs = activeOrganization.filter(
    (org) => org.organizationProfile?.isActive === true
  );
  const inactiveOrgs = activeOrganization.filter(
    (org) => org.organizationProfile?.isActive === false
  );

  const renderOrganizationCard = (org) => {
    const isSelected = selectedOrg?._id === org._id;
    const isActive = org.organizationProfile?.isActive;
    const overallStatus =
      org.overallStatus || org.organizationProfile?.overAllStatus;

    return (
      <div
        key={org._id}
        onClick={() =>
          selectedOrg === org.organizationProfile._id
            ? onSelectOrg(null)
            : onSelectOrg(org.organizationProfile)
        }
        className={`shadow-lg   rounded-2xl border bg-white cursor-pointer transition-all duration-200 ${
          isSelected
            ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200 transform scale-[1.02]"
            : isActive
            ? "border-gray-200 hover:shadow-xl hover:border-blue-300"
            : "border-gray-300 hover:shadow-lg hover:border-gray-400 opacity-90"
        }`}
      >
        <div className="p-5 space-y-4">
          {/* Header with Logo and Basic Info */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {org.organizationProfile.orgLogo ? (
                <img
                  src={`${DOCU_API_ROUTER}/${org.organizationProfile._id}/${org.organizationProfile.orgLogo}`}
                  alt={`${org.organizationProfile.orgName} Logo`}
                  className="w-16 h-16 object-cover rounded-full border-3 border-white shadow-md"
                />
              ) : (
                <div className="w-16 h-16 bg-cnsc-primary-color flex justify-center items-center text-white rounded-full border shadow-md">
                  <School2 className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-bold text-gray-800 leading-tight">
                  {org.organizationProfile?.orgName || "Unnamed Organization"}
                </h2>
                <div className="flex flex-col gap-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                      overallStatus
                    )}`}
                  >
                    {overallStatus}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isActive
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {isActive ? "🟢 Active" : "🔴 Inactive"}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">
                  {org.organizationProfile?.orgAcronym}
                </span>
                {" • "}
                <span className="capitalize">
                  {org.organizationProfile?.orgClass}
                </span>
              </p>
            </div>
          </div>

          {/* Academic Information */}
          <div className="text-sm space-y-1 ">
            {renderAcademicInfo(org)}
            <p>
              <span className="font-medium text-gray-600">Adviser:</span>{" "}
              <span className="text-gray-800">
                {org.organizationProfile?.adviserName || "Not assigned"}
                {org.organizationProfile?.adviserEmail &&
                  ` (${org.organizationProfile.adviserEmail})`}
              </span>
            </p>
          </div>

          {/* President Information */}
          <div>{renderPresidentInfo(org)}</div>

          {/* Roster Status */}
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  📋 Roster Status
                </p>
                <div className="flex gap-4 text-xs text-gray-600 mt-1">
                  <span
                    className={`px-2 py-1 rounded font-medium border ${getStatusBadge(
                      org.Roster?.overAllStatus || "N/A"
                    )}`}
                  >
                    {org.Roster?.overAllStatus || "N/A"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded font-medium ${
                      org.Roster?.isComplete
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-orange-100 text-orange-700 border-orange-200"
                    }`}
                  >
                    {org.Roster?.isComplete ? "✅ Complete" : "⏳ Incomplete"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Document Status */}
          <div>{renderDocumentStatus(org)}</div>

          {/* Financial Information */}
          <div>{renderFinancialInfo(org)}</div>

          {/* Timestamps */}
          <div className="text-xs text-gray-500 space-y-1 border-t pt-3">
            <div className="flex justify-between">
              <span>Created:</span>
              <span>
                {new Date(org.createdAt).toLocaleDateString()} at{" "}
                {new Date(org.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span>
                {new Date(org.updatedAt).toLocaleDateString()} at{" "}
                {new Date(org.updatedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 overflow-auto space-y-8">
      {activeOrganization.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">No accreditation data found.</p>
          <p className="text-gray-400 text-sm mt-2">
            Organizations will appear here once they submit their accreditation
            requirements.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Statistics */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              📊 Accreditation Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {activeOrganization.length}
                </div>
                <div className="text-sm text-gray-600">Total Organizations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {activeOrgs.length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {inactiveOrgs.length}
                </div>
                <div className="text-sm text-gray-600">Inactive</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {
                    activeOrganization.filter(
                      (org) => org.overallStatus === "Pending"
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">Pending Review</div>
              </div>
            </div>
          </div>

          {/* Active Organizations Section */}
          {activeOrgs.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">
                  Active Organizations
                </h3>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                  {activeOrgs.length} organization
                  {activeOrgs.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {activeOrgs.map(renderOrganizationCard)}
              </div>
            </div>
          )}

          {/* Inactive Organizations Section */}
          {inactiveOrgs.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">
                  Inactive Organizations
                </h3>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium border border-gray-200">
                  {inactiveOrgs.length} organization
                  {inactiveOrgs.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {inactiveOrgs.map(renderOrganizationCard)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function SduAccreditationNavigation({ selectedOrg, onSelectOrg }) {
  const tabs = [
    { to: ".", label: "Overview", end: true },
    { to: "president-information", label: "President's Information Sheet" },
    { to: "financial-report", label: "Financial Report" },
    { to: "roster-of-members", label: "Roster of Members" },
    { to: "proposed-action-plan", label: "Proposed Action Plan" },
    { to: "document", label: "Accreditation Documents" },
  ];

  const dropdownLinks = [
    { to: "history", label: "History" },
    { to: "settings", label: "Settings" },
  ];

  console.log("what");
  const [isTabsOpen, setTabsOpen] = useState(false);
  const [isManageRosterOpen, setManageRosterOpen] = useState(false);
  const [accreditationStatus, setAccreditationStatus] = useState(null);
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(
        `${API_ROUTER}/checkAccreditationApprovalStatuses/${selectedOrg._id}`
      );

      console.log(res);
      setAccreditationStatus(res.data);

      if (res.data.isEverythingApproved) {
        setShowApprovalPopup(true);
      }
    } catch (error) {
      console.error("Failed to fetch accreditation data", error);
    }
  };

  const location = useLocation();
  useEffect(() => {
    if (selectedOrg?._id) {
      fetchStatus();
    }
  }, [location, selectedOrg]);

  const sendApprovalLetter = async () => {
    try {
      const res = await axios.post(
        `${API_ROUTER}/sendAccreditationConfirmationEmail/${selectedOrg._id}`,
        {
          orgName: selectedOrg.orgName,
          orgId: selectedOrg._id,
        }
      );

      console.log("Approval letter sent:", res.data);
      setShowApprovalPopup(false);
      alert("Approval letter has been sent successfully!");
    } catch (error) {
      console.error("Failed to send approval letter:", error);
      alert("Something went wrong while sending the approval letter.");
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden transition-all duration-1000">
      <div className="h-full w-full flex flex-col">
        {/* Navigation */}
        <nav className="flex justify-end gap-4 px-6 p-4 items-center  bg-white border-b">
          {/* Tabs Dropdown */}
          <div className="relative inline-block text-left">
            <button
              onClick={() => setTabsOpen((prev) => !prev)}
              className={`px-4 py-2 bg-cnsc-primary-color  w-56 text-white  transition-colors hover:bg-cnsc-secondary-color ${
                isTabsOpen ? "rounded-t-lg" : "rounded-lg"
              }`}
            >
              Accreditation Tabs
            </button>

            {isTabsOpen && (
              <div className="absolute left-0 z-10 bg-white border border-gray-200 rounded-b-lg shadow-lg w-56">
                {tabs.map((tab) => (
                  <NavLink
                    key={tab.to}
                    to={tab.to}
                    end={tab.end}
                    className={({ isActive }) =>
                      `block w-full text-left px-4 py-2 text-sm ${
                        isActive
                          ? "bg-gray-200 text-blue-600 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                    onClick={() => setTabsOpen(false)}
                  >
                    {tab.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Manage Accreditation Dropdown */}
          <div className="relative inline-block text-left">
            <button
              onClick={() => setManageRosterOpen((prev) => !prev)}
              className={`px-4 py-2 bg-cnsc-primary-color w-56 text-white transition-colors hover:bg-cnsc-primary-color-dark ${
                isManageRosterOpen ? "rounded-t-lg" : "rounded-lg"
              }`}
            >
              Manage Accreditation
            </button>

            {isManageRosterOpen && (
              <div className="absolute right-0 z-10 bg-white border border-gray-200 rounded-b-lg shadow-lg w-56">
                {dropdownLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `block w-full text-left px-4 py-2 text-sm ${
                        isActive
                          ? "bg-gray-200 text-blue-600 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                    onClick={() => setManageRosterOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Tab Content */}
        <div className="h-full overflow-hidden flex flex-col">
          <Outlet context={{ accreditationStatus, selectedOrg }} />
        </div>

        {/* ✅ Popup Modal */}
        {showApprovalPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96 text-center">
              <p>
                This Accreditation of "{selectedOrg.orgName}" is done. Do you
                want to notify them?
              </p>

              <button
                onClick={sendApprovalLetter}
                className="mt-4 px-4 py-2 bg-cnsc-primary-color text-white rounded-lg hover:bg-cnsc-primary-color-dark"
              >
                Send Approval Letter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Sliding Sidebar */}
      <div
        className={`transition-all duration-500 transform ${
          selectedOrg ? "translate-x-0 w-[23%]" : "translate-x-full w-0"
        }`}
      >
        {selectedOrg && (
          <StudentDevOrganizationProfileCard
            selectedOrg={selectedOrg}
            onSelectOrg={onSelectOrg}
          />
        )}
      </div>
    </div>
  );
}
