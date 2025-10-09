import axios from "axios";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // If using React Router

import { API_ROUTER, DOCU_API_ROUTER } from "../../../../../App";
import {
  Building2,
  Check,
  ChevronDown,
  Edit,
  Settings,
  User,
  FileText,
  Users,
  DollarSign,
  Award,
  BookOpen,
  Layers,
  Building,
  CheckCircle,
  XCircle,
  GraduationCap,
  Earth,
  MoreHorizontal,
} from "lucide-react";

export function SduMainIndividualAccreditationView({ selectedOrg }) {
  const [isManagePresidentProfileOpen, setManagePresidentProfileOpen] =
    useState(false);
  const [AccreditationData, setAccreditationData] = useState(null);
  const [presidentMoreHorizontal, setPresidentMoreHorizontal] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [organizationProfileApproval, setOrganizationProfileApproval] =
    useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [organizationProfileRevision, setOrganizationProfileRevision] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate(); // ✅ call hook here once

  const fetchAccreditation = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_ROUTER}/getAccreditation/${selectedOrg._id}`
      );
      setAccreditationData(res.data);
    } catch (error) {
      console.error("Failed to fetch accreditation data", error);
    } finally {
      setLoading(false);
    }
  };
  const checkAccreditationApprovalStatuses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_ROUTER}/checkAccreditationApprovalStatuses/${selectedOrg._id}`
      );
      console.log(res);
    } catch (error) {
      console.error("Failed to fetch accreditation data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedOrg?._id) {
      fetchAccreditation();
      checkAccreditationApprovalStatuses();
    }
  }, [selectedOrg?._id]);

  const submitUpdate = async ({ status, revisionNotes }) => {
    try {
      setActionLoading(true); // ⏳ Show loading modal

      const payload = { orgId: selectedOrg._id, overAllStatus: status };
      if (revisionNotes && revisionNotes.trim() !== "") {
        payload.revisionNotes = revisionNotes;
      }

      const response = await axios.post(
        `${API_ROUTER}/updateOrganizationProfileStatus/`,
        payload
      );

      console.log("✅ Update success:", response.data);

      // Refetch updated data
      await fetchAccreditation();
    } catch (error) {
      console.log("❌ Update failed:", error);
    } finally {
      setActionLoading(false); // ✅ Hide loading modal
      setOrganizationProfileRevision(false);
      setOrganizationProfileApproval(false);
    }
  };

  // Helper function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "approved":
      case "rejected":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderDocumentStatus = (document, title, icon, path) => {
    if (!document) {
      return (
        <button
          onClick={() => navigate(path)}
          className="w-full text-left p-4 border border-red-200 bg-red-50 rounded-lg hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon}
              <div>
                <h4 className="font-medium text-gray-900">{title}</h4>
                <p className="text-sm text-red-600">Not submitted</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
              Missing
            </span>
          </div>
        </button>
      );
    }

    const {
      isComplete = false,
      overAllStatus = "Pending",
      revisionNotes,
    } = document;
    const isApproved = overAllStatus.toLowerCase().includes("approve");

    return (
      <button
        onClick={() => navigate(path)}
        className="w-full text-left p-4 border border-gray-200 bg-white rounded-lg hover:shadow-sm transition-shadow"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <h4 className="font-medium text-gray-900">{title}</h4>
              <p className="text-sm text-gray-600">
                {isComplete ? "Complete" : "Incomplete"}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(
              overAllStatus
            )}`}
          >
            {overAllStatus}
          </span>
        </div>

        {revisionNotes && !isApproved && (
          <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-blue-800">
            <strong>Notes:</strong> {revisionNotes}
          </div>
        )}
      </button>
    );
  };

  // Helper function for status colors
  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("approve")) return "bg-green-100 text-green-800";
    if (statusLower.includes("reject") || statusLower.includes("deny"))
      return "bg-red-100 text-red-800";
    if (statusLower.includes("pending")) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };
  if (!selectedOrg) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 text-center">
        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Building2 className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">No organization selected</p>
        <p className="text-gray-400 text-sm mt-1">
          Select an organization to view details
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-cnsc-primary-color border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">Loading organization details...</p>
      </div>
    );
  }

  const orgProfile = AccreditationData?.organizationProfile || selectedOrg;

  return (
    <div className="overflow-auto w-full h-full  bg-gray-200 p-4 flex flex-col gap-4">
      {/* Header with gradient background */}
      <div className=" p-6  bg-white rounded-xl shadow-md">
        <div className="flex justify-between items-start">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            {orgProfile.orgLogo ? (
              <div className="relative">
                <img
                  src={`${DOCU_API_ROUTER}/${orgProfile._id}/${orgProfile.orgLogo}`}
                  alt={`${orgProfile.orgName} Logo`}
                  className="w-20 h-20 object-cover rounded-full border-white shadow-lg"
                />
              </div>
            ) : (
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full border-4 border-white flex items-center justify-center">
                <Building2 className="w-10 h-10" />
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold leading-tight">
                {orgProfile.orgName}
              </h1>
              {orgProfile.orgAcronym && (
                <p className=" text-opacity-90 text-lg">
                  ({orgProfile.orgAcronym})
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-opacity-80 text-sm font-medium">
                  Status:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                    orgProfile.overAllStatus
                  )}`}
                >
                  {orgProfile.overAllStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Dropdown Menu - Only show for active organizations */}
          {orgProfile.isActive && (
            <div className="relative inline-block text-left" ref={dropdownRef}>
              <button
                onClick={() => setManagePresidentProfileOpen(true)}
                className={`px-6 py-2 border backdrop-blur-sm text-black transition-all duration-200 hover:bg-opacity-30 flex items-center gap-2 ${
                  isManagePresidentProfileOpen ? "rounded-t-lg" : "rounded-lg"
                }`}
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Organization Profile
                <ChevronDown
                  className={`w-4 h-4 mr-2 transition-transform duration-200 ${
                    isManagePresidentProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isManagePresidentProfileOpen && (
                <div className="absolute w-full right-0 bg-white border border-gray-200 rounded-b-lg shadow-xl z-10 overflow-hidden">
                  <button
                    onClick={() => {
                      setOrganizationProfileApproval(true);
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-green-50 text-sm text-gray-700 transition-colors duration-200"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve Organization Profile
                  </button>
                  <button
                    onClick={() => {
                      setOrganizationProfileRevision(true);
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-blue-50 text-sm text-gray-700 transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Revision Notes For Organization Profile
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Content Body */}
      <div className="flex flex-col gap-6 h-full w-full  overflow-y-auto">
        {/* Top Section — Organization & President */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Organization Details */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Earth className="text-cnsc-primary-color" />
              Organization Details
            </h2>

            <div className="space-y-3">
              {[
                {
                  key: "orgClass",
                  label: "Classification",
                  value: orgProfile.orgClass,
                  icon: <Layers className="w-4 h-4 text-blue-500" />,
                },
                {
                  key: "orgDepartment",
                  label: "Department",
                  value: orgProfile.orgDepartment,
                  icon: <Building className="w-4 h-4 text-purple-500" />,
                },
                {
                  key: "isActive",
                  label: "Active Status",
                  value: orgProfile.isActive,
                  icon: orgProfile.isActive ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ),
                },
                {
                  key: "orgSpecialization",
                  label: "Specialization",
                  value: orgProfile.orgSpecialization,
                  icon: <GraduationCap className="w-4 h-4 text-indigo-500" />,
                },
                {
                  key: "orgCourse",
                  label: "Course",
                  value: orgProfile.orgCourse,
                  icon: <GraduationCap className="w-4 h-4 text-emerald-500" />,
                },
                {
                  key: "adviser",
                  label: "Adviser",
                  value: orgProfile.adviser?.name,
                  icon: <User className="w-4 h-4 text-orange-500" />,
                },
              ]
                .filter(
                  (item) =>
                    item.value &&
                    !(typeof item.value === "string" && !item.value.trim())
                )
                .map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {item.icon}
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {item.label}
                      </p>
                      {item.key === "isActive" ? (
                        <span
                          className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                            item.value
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.value ? "Active" : "Inactive"}
                        </span>
                      ) : (
                        <p className="text-gray-900 font-semibold text-sm">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* President Profile */}
          <div className="lg:col-span-3 flex flex-col bg-white rounded-xl shadow-md p-4 border-gray-100 relative">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <User className="text-cnsc-primary-color" />
              President Profile
            </h2>

            {AccreditationData?.PresidentProfile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-800">
                {[
                  ["Name", AccreditationData.PresidentProfile.name],
                  [
                    "Year & Course",
                    `${AccreditationData.PresidentProfile.year} - ${AccreditationData.PresidentProfile.course}`,
                  ],
                  [
                    "Age",
                    `${AccreditationData.PresidentProfile.age} years old`,
                  ],
                  ["Contact", AccreditationData.PresidentProfile.contactNo],
                  ["Religion", AccreditationData.PresidentProfile.religion],
                  ["Status", AccreditationData.PresidentProfile.overAllStatus],
                ].map(([label, value], idx) => (
                  <div key={idx}>
                    <p className="text-gray-500 font-medium">{label}</p>
                    <p className="font-semibold mt-1">{value}</p>
                  </div>
                ))}

                <div className="col-span-3 flex flex-wrap justify-between gap-6 mt-2">
                  {AccreditationData.PresidentProfile.talentSkills?.length >
                    0 && (
                    <div>
                      <p className="text-gray-500 font-medium">
                        Talents & Skills
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {AccreditationData.PresidentProfile.talentSkills.map(
                          (talent, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold"
                            >
                              {talent.skill} ({talent.level})
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {AccreditationData.PresidentProfile.presentAddress && (
                    <div>
                      <p className="text-gray-500 font-medium">
                        Present Address
                      </p>
                      <p className="font-semibold mt-1">
                        {
                          AccreditationData.PresidentProfile.presentAddress
                            .fullAddress
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-red-600 bg-red-50 rounded-lg p-6">
                No president profile has been submitted.
              </div>
            )}

            {/* Action Button */}
            {AccreditationData?.PresidentProfile && (
              <div className="absolute top-4 right-4">
                <button
                  onClick={() =>
                    setPresidentMoreHorizontal(!presidentMoreHorizontal)
                  }
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <MoreHorizontal />
                </button>

                {presidentMoreHorizontal && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => navigate("./president-information")}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      View More
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Accreditation Requirements */}
        <div className="bg-white rounded-xl  shadow-md p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-cnsc-primary-color" />
            Accreditation Requirements
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {renderDocumentStatus(
              AccreditationData?.Roster,
              "Organization Roster",
              <Users className="w-5 h-5 text-blue-600" />,
              `/sdu/accreditation/roster-of-members`
            )}

            {renderDocumentStatus(
              AccreditationData?.ConstitutionAndByLaws,
              "Constitution and By-Laws",
              <BookOpen className="w-5 h-5 text-green-600" />,
              `/sdu/accreditation/document`
            )}

            {renderDocumentStatus(
              AccreditationData?.JointStatement,
              "Joint Statement",
              <FileText className="w-5 h-5 text-purple-600" />,
              `/sdu/accreditation/document`
            )}

            {renderDocumentStatus(
              AccreditationData?.PledgeAgainstHazing,
              "Pledge Against Hazing",
              <Award className="w-5 h-5 text-red-600" />,
              `/sdu/accreditation/document`
            )}

            {AccreditationData?.FinancialReport && (
              <button
                onClick={() => navigate(`/sdu/accreditation/financial-report`)}
                className="flex flex-col items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Financial Report
                    </h4>
                    <p className="text-sm text-gray-600">
                      Initial Balance: ₱
                      {AccreditationData.FinancialReport.initialBalance?.toLocaleString() ||
                        "0"}
                    </p>
                  </div>
                </div>
                <span className="self-end px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">
                  Available
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Revision Modal */}
      {organizationProfileRevision && (
        <div className="absolute z-100 bg-black/10 backdrop-blur-xs inset-0 flex justify-center items-center">
          <div className="h-fit bg-white w-1/3 flex flex-col px-6 py-6 rounded-2xl shadow-xl relative">
            {/* Close Button */}
            <button
              onClick={() => setOrganizationProfileRevision(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h1 className="text-lg font-semibold mb-4">
              Revision: Organization Profile
            </h1>

            <div className="flex flex-col gap-4 w-full">
              {/* Message */}
              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  className="border rounded-lg w-full h-28 p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() =>
                submitUpdate({
                  status: "Revision From the SDU",
                  revisionNotes,
                })
              }
              disabled={actionLoading}
              className={`mt-6 px-6 py-2 rounded-lg text-sm font-medium shadow-md transition
    ${
      actionLoading
        ? "bg-indigo-400 cursor-not-allowed opacity-70 blur-[0.3px]"
        : "bg-indigo-600 hover:bg-indigo-700 text-white"
    }`}
            >
              {actionLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {organizationProfileApproval && (
        <div className="absolute bg-black/10 backdrop-blur-xs inset-0 flex justify-center items-center z-100">
          <div className="h-fit bg-white w-1/3 flex flex-col px-6 py-6 rounded-2xl shadow-xl relative">
            {/* Close Button */}
            <button
              onClick={() => setOrganizationProfileApproval(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h1 className="text-lg font-semibold mb-4">
              Approval: Profile of the Organization "{selectedOrg.orgName}"
            </h1>

            <p className="mb-4 text-gray-700">
              By approving this section of the accreditation, you confirm that
              you have reviewed the information provided and consent to its
              approval. Would you like to proceed?
            </p>

            <button
              onClick={() =>
                submitUpdate({
                  status: "Approved",
                })
              }
              disabled={actionLoading}
              className={`mt-6 flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-medium shadow-md transition
    ${
      actionLoading
        ? "bg-indigo-400 cursor-not-allowed opacity-70 blur-[0.3px]"
        : "bg-indigo-600 hover:bg-indigo-700 text-white"
    }`}
            >
              {actionLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {actionLoading ? "Processing..." : "Confirm Approval"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
