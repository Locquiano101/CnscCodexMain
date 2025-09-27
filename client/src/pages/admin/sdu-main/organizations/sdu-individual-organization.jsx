import axios from "axios";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // If using React Router

import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
import {
  Briefcase,
  Building2,
  Check,
  ChevronDown,
  Clock,
  Edit,
  Settings,
  User,
  FileText,
  Users,
  DollarSign,
  Calendar,
  Award,
  BookOpen,
  Layers,
  Building,
  CheckCircle,
  XCircle,
  GraduationCap,
} from "lucide-react";

export function SduIndividualOrganizationView({ selectedOrg }) {
  const [isManagePresidentProfileOpen, setManagePresidentProfileOpen] =
    useState(false);
  const [AccreditationData, setAccreditationData] = useState(null);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setManagePresidentProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Actions for dropdown
  const handleButtonClick = (action) => {
    switch (action) {
      case "approve":
        console.log("Approve clicked for org:", selectedOrg._id);
        // TODO: Call approve API here
        break;
      case "notes":
        console.log("Revision Notes clicked for org:", selectedOrg._id);
        // TODO: Open revision notes modal
        break;
      case "history":
        console.log(
          "View Previous Organizations clicked for org:",
          selectedOrg._id
        );
        // TODO: Fetch and show previous organizations
        break;
      default:
        break;
    }
    setManagePresidentProfileOpen(false);
  };

  // Helper function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
    <div className="overflow-auto w-full h-full ">
      {/* Header with gradient background */}
      <div className="bg-cnsc-primary-color p-6">
        <div className="flex justify-between items-start">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            {orgProfile.orgLogo ? (
              <div className="relative">
                <img
                  src={`${DOCU_API_ROUTER}/${orgProfile._id}/${orgProfile.orgLogo}`}
                  alt={`${orgProfile.orgName} Logo`}
                  className="h-24 aspect-square object-cover rounded-full border border-white shadow-lg"
                />
              </div>
            ) : (
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full border-4 border-white flex items-center justify-center">
                <Building2 className="w-10 h-10 text-white" />
              </div>
            )}

            <div className="text-white">
              <h1 className="text-2xl font-bold leading-tight">
                {orgProfile.orgName}
              </h1>
              {orgProfile.orgAcronym && (
                <p className="text-white text-opacity-90 text-lg">
                  ({orgProfile.orgAcronym})
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-white text-opacity-80 text-sm font-medium">
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
                onClick={() => setManagePresidentProfileOpen((prev) => !prev)}
                className={`px-6 py-2 bwhite backdrop-blur-sm text-cnsc-primary-color bg-white transition-all duration-200 hover:bg-opacity-30 flex items-center gap-2 ${
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
                    onClick={() => handleButtonClick("approve")}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-green-50 text-sm text-gray-700 transition-colors duration-200"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleButtonClick("notes")}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-blue-50 text-sm text-gray-700 transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Revision Notes
                  </button>
                  <button
                    onClick={() => handleButtonClick("history")}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-purple-50 text-sm text-gray-700 transition-colors duration-200"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    View Previous Organizations
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="flex flex-wrap h-full ">
        <div className="h-full w-1/3 flex flex-col p-4 ">
          <span className="text-xl font-black mb-4">Organization Details:</span>
          <div className="flex flex-col gap-4">
            {/* Classification */}
            {orgProfile.orgClass && (
              <div className="flex justify-between gap-2">
                <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Classification
                </span>
                <span className="text-gray-900 font-semibold text-sm sm:text-base text-right sm:text-left">
                  {orgProfile.orgClass}
                </span>
              </div>
            )}

            {/* Active Status */}
            <div className="flex justify-between ">
              <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Active Status
              </span>
              <div className="flex items-center gap-1">
                <div
                  className={`w-2 aspect-square rounded-full ${
                    orgProfile.isActive
                      ? "bg-green-500 shadow-lg shadow-green-400/30"
                      : "bg-red-500 shadow-lg shadow-red-400/30"
                  } animate-pulse`}
                />
                <span
                  className={`font-semibold text-sm ${
                    orgProfile.isActive ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {orgProfile.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Department */}
            {orgProfile?.orgDepartment && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Department
                </span>
                <span className="text-gray-900 font-semibold text-sm sm:text-base text-right sm:text-left">
                  {orgProfile.orgDepartment}
                </span>
              </div>
            )}

            {/* Specialization */}
            {orgProfile?.orgSpecialization && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Specialization
                </span>
                <span className="text-gray-900 font-semibold text-sm sm:text-base text-right sm:text-left">
                  {orgProfile.orgSpecialization}
                </span>
              </div>
            )}

            {/* Course */}
            {orgProfile?.orgCourse && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Course
                </span>
                <span className="text-gray-900 font-semibold text-sm sm:text-base text-right sm:text-left">
                  {orgProfile.orgCourse}
                </span>
              </div>
            )}

            {/* Adviser */}
            {orgProfile.adviser?.name && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Adviser
                </span>
                <span className="text-gray-900 font-semibold text-sm sm:text-base text-right sm:text-left">
                  {orgProfile.adviser.name}
                </span>
              </div>
            )}
            <div className="flex border flex-col gap-4 p-4  rounded-lg">
              {/* Roster */}
              <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Accreditation Requirements
              </span>
              <button
                onClick={() => navigate(`/SDU/accreditation/roster-of-members`)}
                className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-gray-800">
                      Organization Roster
                    </h4>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      AccreditationData?.Roster
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {AccreditationData?.Roster ? "Available" : "Missing"}
                  </span>
                </div>
              </button>

              {/* Constitution and By-Laws */}
              <button
                onClick={() => navigate(`/SDU/accreditation/document`)}
                className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-gray-800">
                      Constitution and By-Laws
                    </h4>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      AccreditationData?.ConstitutionAndByLaws
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {AccreditationData?.ConstitutionAndByLaws
                      ? "Available"
                      : "Missing"}
                  </span>
                </div>
              </button>

              {/* Joint Statement */}
              <button
                onClick={() => navigate(`/SDU/accreditation/document`)}
                className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <h4 className="font-medium text-gray-800">
                      Joint Statement
                    </h4>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      AccreditationData?.JointStatement
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {AccreditationData?.JointStatement
                      ? "Available"
                      : "Missing"}
                  </span>
                </div>
              </button>

              {/* Pledge Against Hazing */}
              <button
                onClick={() => navigate(`/SDU/accreditation/document`)}
                className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-red-600" />
                    <h4 className="font-medium text-gray-800">
                      Pledge Against Hazing
                    </h4>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      AccreditationData?.PledgeAgainstHazing
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {AccreditationData?.PledgeAgainstHazing
                      ? "Available"
                      : "Missing"}
                  </span>
                </div>
              </button>

              {/* Financial Report */}
              <button
                onClick={() => navigate(`/SDU/accreditation/financial-report`)}
                className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Financial Report
                      </h4>
                      {AccreditationData?.FinancialReport ? (
                        <p className="text-sm text-gray-600">
                          Initial Balance: ₱
                          {AccreditationData.FinancialReport.initialBalance?.toLocaleString() ||
                            "0"}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600 italic">
                          No report uploaded
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      AccreditationData?.FinancialReport
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {AccreditationData?.FinancialReport
                      ? "Available"
                      : "Missing"}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* President Profile */}
        <div className="h-full w-2/3 flex flex-col ">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-cnsc-primary-color" />
            President Profile
          </h2>

          {AccreditationData?.PresidentProfile ? (
            <div className=" border-gray-200 ">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
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
                    <span className="text-sm font-medium text-gray-500">
                      Age
                    </span>
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
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Status
                    </span>
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold ${getStatusBadgeColor(
                        AccreditationData.PresidentProfile.overAllStatus
                      )}`}
                    >
                      {AccreditationData.PresidentProfile.overAllStatus}
                    </span>
                  </div>
                </div>

                {/* Talents/Skills */}
                {AccreditationData.PresidentProfile.talentSkills?.length >
                  0 && (
                  <div className="mt-6">
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
                  <div className="mt-6">
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
          ) : (
            <div className="bg-cnsc-secondary-color/10 h-full  flex justify-center items-center text-red-700 p-4 rounded-xl">
              No president profile has been submitted.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
