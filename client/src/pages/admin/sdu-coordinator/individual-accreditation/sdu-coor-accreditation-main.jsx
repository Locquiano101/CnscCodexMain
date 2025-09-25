import axios from "axios";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // If using React Router

import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
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

export function SduCoorMainAccreditation({ selectedOrg }) {
  const [isManagePresidentProfileOpen, setManagePresidentProfileOpen] =
    useState(false);
  const [AccreditationData, setAccreditationData] = useState(null);
  const [presidentMoreHorizontal, setPresidentMoreHorizontal] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [popup, setPopup] = useState(null); // holds type & message
  const [organizationProfileApproval, setOrganizationProfileApproval] =
    useState(false);
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

  useEffect(() => {
    if (selectedOrg?._id) {
      fetchAccreditation();
    }
  }, [selectedOrg?._id]);

  const submitUpdate = async ({ status }) => {
    try {
      const payload = { orgId: selectedOrg._id, overAllStatus: status };

      if (revisionNotes && revisionNotes.trim() !== "") {
        payload.revisionNotes = revisionNotes;
      }

      const response = await axios.post(
        `${API_ROUTER}/updateOrganizationProfileStatus/`, // 👈 change to correct proposal/org id
        payload
      );

      console.log("✅ Update success:", response.data);
    } catch (error) {
      console.log("❌ Update failed:", error);
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
          className="flex-1  border-12 bg-red-500 text-left rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon}
              <div>
                <h4 className="font-medium text-gray-800">{title}</h4>
                <p className="text-sm text-red-600">Not submitted</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              Missing
            </span>
          </div>
        </button>
      );
    }

    const isComplete = document.isComplete || false;
    const status = document.overAllStatus || "Pending";

    return (
      <button
        onClick={() => navigate(path)}
        className=" flex flex-col flex-1 text-left shadow-md rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div className="h-full w-full flex flex-col justify-evenly">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <h4 className="font-medium text-gray-800">{title}</h4>
              <p className="text-sm text-gray-600">
                {isComplete ? "Complete" : "Incomplete"}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 text-xs rounded-full font-semibold ${getStatusBadgeColor(
              status
            )}`}
          >
            {status}
          </span>
        </div>

        {document.revisionNotes &&
          !status.toLowerCase().includes("approve") && (
            <div className="mt-3 p-2 rounded text-sm text-blue-700">
              <strong>Notes:</strong> {document.revisionNotes}
            </div>
          )}
      </button>
    );
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
                    onClick={(e) => {
                      setOrganizationProfileApproval(true);
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-green-50 text-sm text-gray-700 transition-colors duration-200"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve Organization Profile
                  </button>
                  <button
                    onClick={(e) => {
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
      <div className="grid grid-cols-5 gap-4 h-full w-full ">
        {/* Organization Details Grid */}
        <div className="col-span-2 flex flex-col bg-white shadow-md rounded-xl p-4">
          <h2 className="p-1 text-xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Earth />
            Organization Details
          </h2>

          {/* Main content card */}
          <div className="h-full flex flex-col rounded-lg ">
            {[
              {
                key: "orgClass",
                label: "Classification",
                value: orgProfile.orgClass,
                icon: <Layers className="w-4 h-4 mr-2 text-blue-500" />,
              },
              {
                key: "orgDepartment",
                label: "Department",
                value: orgProfile.orgDepartment,
                icon: <Building className="w-4 h-4 mr-2 text-purple-500" />,
              },
              {
                key: "isActive",
                label: "Active Status",
                value: orgProfile.isActive,
                icon: orgProfile.isActive ? (
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2 text-red-500" />
                ),
              },
              {
                key: "orgSpecialization",
                label: "Specialization",
                value: orgProfile.orgSpecialization,
                icon: (
                  <GraduationCap className="w-4 h-4 mr-2 text-indigo-500" />
                ),
              },
              {
                key: "orgCourse",
                label: "Course",
                value: orgProfile.orgCourse,
                icon: (
                  <GraduationCap className="w-4 h-4 mr-2 text-emerald-500" />
                ),
              },
              {
                key: "adviser",
                label: "Adviser",
                value: orgProfile.adviser?.name,
                icon: <User className="w-4 h-4 mr-2 text-orange-500" />,
              },
            ].map((item, index) => {
              // Skip rendering if value doesn't exist or is empty
              if (
                !item.value ||
                (typeof item.value === "string" && !item.value.trim())
              ) {
                return null;
              }

              return (
                <div
                  key={item.key}
                  className="group  flex items-center px-4 py-2  rounded-lg"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">{item.icon}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                        {item.label}
                      </span>

                      {/* Value rendering */}
                      <div className="flex items-center gap-2">
                        {item.key === "isActive" ? (
                          <>
                            <div
                              className={`w-3 h-3 rounded-full  animate-pulse`}
                            />
                            <span
                              className={`font-semibold text-sm px-3 py-1 rounded-full ${
                                item.value
                                  ? "text-green-800 bg-green-100"
                                  : "text-red-800 bg-red-100"
                              }`}
                            >
                              {item.value ? "Active" : "Inactive"}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-900 font-semibold text-sm sm:text-base text-right sm:text-left">
                            {item.value}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* President Profile */}
        <div className="col-span-3 relative flex flex-col p-6 bg-white rounded-xl shadow-md">
          <h2 className="p-1 text-xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <User />
            President Profile
          </h2>
          {AccreditationData?.PresidentProfile ? (
            <div className="flex flex-col ">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Name
                  </span>
                  <p className="text-gray-800 font-semibold mt-1">
                    {AccreditationData.PresidentProfile.name}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Year & Course
                  </span>
                  <p className="text-gray-800 font-semibold mt-1">
                    {AccreditationData.PresidentProfile.year} -{" "}
                    {AccreditationData.PresidentProfile.course}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Age</span>
                  <p className="text-gray-800 font-semibold mt-1">
                    {AccreditationData.PresidentProfile.age} years old
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Contact
                  </span>
                  <p className="text-gray-800 font-semibold mt-1">
                    {AccreditationData.PresidentProfile.contactNo}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Religion
                  </span>
                  <p className="text-gray-800 font-semibold mt-1">
                    {AccreditationData.PresidentProfile.religion}
                  </p>
                </div>
                <div className="flex flex-col text-sm">
                  <span className="text-sm font-medium text-gray-500">
                    Status
                  </span>
                  <span className="font-bold">
                    {AccreditationData.PresidentProfile.overAllStatus}
                  </span>
                </div>
                <div className="col-span-3  flex justify-between items-start ">
                  {AccreditationData.PresidentProfile.talentSkills?.length >
                    0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Talents & Skills
                      </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {AccreditationData.PresidentProfile.talentSkills.map(
                          (talent, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
                            >
                              {talent.skill} ({talent.level})
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {AccreditationData.PresidentProfile.presentAddress && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Present Address
                      </span>
                      <p className="text-gray-800 mt-1">
                        {
                          AccreditationData.PresidentProfile.presentAddress
                            .fullAddress
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {/* Action menu */}
              <div className="absolute top-4 right-4" ref={dropdownRef}>
                <button
                  onClick={() => setPresidentMoreHorizontal(true)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <MoreHorizontal />
                </button>
                {presidentMoreHorizontal && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => navigate("./president-information")}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      View More
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-cnsc-secondary-color/10 h-full  flex justify-center items-center text-red-700 p-4 rounded-xl">
              No president profile has been submitted.
            </div>
          )}
        </div>

        <div className="col-span-5 flex flex-col h-fit p-4 bg-white rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-cnsc-primary-color" />
            Accreditation Requirements
          </h2>

          <div className="flex flex-wrap gap-4">
            {renderDocumentStatus(
              AccreditationData?.Roster,
              "Organization Roster",
              <Users className="w-5 h-5 text-blue-600" />,
              `/sdu-coordinator/accreditation/roster-of-members`
            )}

            {renderDocumentStatus(
              AccreditationData?.ConstitutionAndByLaws,
              "Constitution and By-Laws",
              <BookOpen className="w-5 h-5 text-green-600" />,
              `/sdu-coordinator/accreditation/document`
            )}

            {renderDocumentStatus(
              AccreditationData?.JointStatement,
              "Joint Statement",
              <FileText className="w-5 h-5 text-purple-600" />,
              `/sdu-coordinator/accreditation/document`
            )}

            {renderDocumentStatus(
              AccreditationData?.PledgeAgainstHazing,
              "Pledge Against Hazing",
              <Award className="w-5 h-5 text-red-600" />,
              `/sdu-coordinator/accreditation/document`
            )}

            {/* Financial Report */}
            {AccreditationData?.FinancialReport && (
              <button
                onClick={() =>
                  navigate(`/sdu-coordinator/accreditation/financial-report`)
                }
                className=" text-left bg-white shadow-md rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col flex-1 items-center justify-evenly h-full w-full">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Financial Report
                      </h4>
                      <p className="text-sm text-gray-600">
                        Initial Balance: ₱
                        {AccreditationData.FinancialReport.initialBalance?.toLocaleString() ||
                          "0"}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">
                    Available
                  </span>
                </div>
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
              onClick={() => {
                submitUpdate({
                  status: "Revision From the SDU Coordinator",
                  revisionNotes,
                }); // 👈 call with "Revision"
              }}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md transition"
            >
              Send
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
              onClick={() => {
                submitUpdate({
                  status: "Approved by the SDU Coordinator",
                }); // 👈 call with "Revision" // 👈 call with "Approved"
              }}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md transition"
            >
              Confirm Approval
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
