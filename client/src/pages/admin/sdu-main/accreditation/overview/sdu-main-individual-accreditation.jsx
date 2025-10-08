import axios from "axios";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // If using React Router

import { API_ROUTER, DOCU_API_ROUTER } from "../../../../../App";
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
  Award,
  BookOpen,
} from "lucide-react";

export function SduMainIndividualAccreditationView({ selectedOrg }) {
  const [isManagePresidentProfileOpen, setManagePresidentProfileOpen] =
    useState(false);
  const [AccreditationData, setAccreditationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setManagePresidentProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleButtonClick = (action) => {
    switch (action) {
      case "approve":
        console.log("Approve clicked for org:", selectedOrg._id);
        break;
      case "notes":
        console.log("Revision Notes clicked for org:", selectedOrg._id);
        break;
      case "history":
        console.log(
          "View Previous Organizations clicked for org:",
          selectedOrg._id
        );
        break;
      default:
        break;
    }
    setManagePresidentProfileOpen(false);
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  if (!selectedOrg) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center shadow-sm border border-gray-200">
        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center shadow-inner">
          <Building2 className="w-10 h-10 text-gray-500" />
        </div>
        <p className="text-gray-600 font-semibold text-lg mb-2">
          No organization selected
        </p>
        <p className="text-gray-500 text-base">
          Select an organization to view details
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
        <div className="animate-spin w-12 h-12 border-4 border-cnsc-primary-color border-t-transparent rounded-full mx-auto mb-6"></div>
        <p className="text-gray-600 font-medium">
          Loading organization details...
        </p>
      </div>
    );
  }

  const orgProfile = AccreditationData?.organizationProfile || selectedOrg;

  return (
    <div className="overflow-auto w-full h-full bg-gray-50">
      {/* Header Section */}
      <div className="bg-cnsc-primary-color p-6 shadow-lg">
        <div className="flex justify-between items-start">
          {/* Logo and Title */}
          <div className="flex items-center gap-6">
            {orgProfile.orgLogo ? (
              <div className="relative">
                <img
                  src={`${DOCU_API_ROUTER}/${orgProfile._id}/${orgProfile.orgLogo}`}
                  alt={`${orgProfile.orgName} Logo`}
                  className="h-28 aspect-square object-cover rounded-2xl border-4 border-white shadow-2xl"
                />
              </div>
            ) : (
              <div className="w-28 h-28 bg-white bg-opacity-20 rounded-2xl border-4 border-white flex items-center justify-center shadow-2xl">
                <Building2 className="w-12 h-12 text-white" />
              </div>
            )}

            <div className="text-white">
              <h1 className="text-3xl font-bold leading-tight mb-1">
                {orgProfile.orgName}
              </h1>
              {orgProfile.orgAcronym && (
                <p className="text-white text-opacity-90 text-xl font-medium mb-3">
                  ({orgProfile.orgAcronym})
                </p>
              )}
              <div className="flex items-center gap-3">
                <span className="text-white text-opacity-90 text-base font-medium">
                  Status:
                </span>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusBadgeColor(
                    orgProfile.overAllStatus
                  )}`}
                >
                  {orgProfile.overAllStatus?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Dropdown Menu */}
          {orgProfile.isActive && (
            <div className="relative inline-block text-left" ref={dropdownRef}>
              <button
                onClick={() => setManagePresidentProfileOpen((prev) => !prev)}
                className={`px-8 py-3 bg-white backdrop-blur-sm text-cnsc-primary-color font-semibold rounded-2xl transition-all duration-200 hover:bg-opacity-90 hover:shadow-lg flex items-center gap-3 border border-blue-200 ${
                  isManagePresidentProfileOpen
                    ? "rounded-b-none shadow-lg"
                    : "shadow-md"
                }`}
              >
                <Settings className="w-5 h-5" />
                Manage Profile
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isManagePresidentProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isManagePresidentProfileOpen && (
                <div className="absolute w-full right-0 bg-white border border-gray-200 rounded-b-2xl shadow-2xl z-10 overflow-hidden">
                  <button
                    onClick={() => handleButtonClick("approve")}
                    className="flex items-center gap-3 w-full text-left px-6 py-4 hover:bg-green-50 text-base text-gray-700 transition-all duration-200 border-b border-gray-100"
                  >
                    <Check className="w-5 h-5 text-green-600" />
                    Approve Accreditation
                  </button>
                  <button
                    onClick={() => handleButtonClick("notes")}
                    className="flex items-center gap-3 w-full text-left px-6 py-4 hover:bg-blue-50 text-base text-gray-700 transition-all duration-200 border-b border-gray-100"
                  >
                    <Edit className="w-5 h-5 text-blue-600" />
                    Revision Notes
                  </button>
                  <button
                    onClick={() => handleButtonClick("history")}
                    className="flex items-center gap-3 w-full text-left px-6 py-4 hover:bg-purple-50 text-base text-gray-700 transition-all duration-200"
                  >
                    <Clock className="w-5 h-5 text-purple-600" />
                    View Previous Organizations
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="flex flex-col lg:flex-row h-full p-6 gap-6">
        {/* Left Panel - Organization Details */}
        <div className="lg:w-2/5 flex flex-col">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-100">
              Organization Details
            </h2>
            <div className="space-y-5">
              {/* Classification */}
              {orgProfile.orgClass && (
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    Classification
                  </span>
                  <span className="text-gray-900 font-bold text-sm text-right">
                    {orgProfile.orgClass}
                  </span>
                </div>
              )}

              {/* Active Status */}
              <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Active Status
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      orgProfile.isActive
                        ? "bg-green-500 shadow-lg shadow-green-400/50"
                        : "bg-red-500 shadow-lg shadow-red-400/50"
                    } animate-pulse`}
                  />
                  <span
                    className={`font-bold text-sm ${
                      orgProfile.isActive ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {orgProfile.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Department */}
              {orgProfile?.orgDepartment && (
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    Department
                  </span>
                  <span className="text-gray-900 font-bold text-sm text-right">
                    {orgProfile.orgDepartment}
                  </span>
                </div>
              )}

              {/* Specialization */}
              {orgProfile?.orgSpecialization && (
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    Specialization
                  </span>
                  <span className="text-gray-900 font-bold text-sm text-right">
                    {orgProfile.orgSpecialization}
                  </span>
                </div>
              )}

              {/* Course */}
              {orgProfile?.orgCourse && (
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    Course
                  </span>
                  <span className="text-gray-900 font-bold text-sm text-right">
                    {orgProfile.orgCourse}
                  </span>
                </div>
              )}

              {/* Adviser */}
              {orgProfile.adviser?.name && (
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    Adviser
                  </span>
                  <span className="text-gray-900 font-bold text-sm text-right">
                    {orgProfile.adviser.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Accreditation Requirements */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-100">
              Accreditation Requirements
            </h2>
            <div className="space-y-4">
              {/* Roster */}
              <button
                onClick={() => navigate(`/SDU/accreditation/roster-of-members`)}
                className="w-full text-left bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-lg">
                        Organization Roster
                      </h4>
                      <p className="text-gray-500 text-sm">
                        Member list and details
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-2 text-sm rounded-full font-bold ${getStatusBadgeColor(
                      AccreditationData?.Roster ? "approved" : "rejected"
                    )}`}
                  >
                    {AccreditationData?.Roster ? "Available" : "Missing"}
                  </span>
                </div>
              </button>

              {/* Constitution and By-Laws */}
              <button
                onClick={() => navigate(`/SDU/accreditation/document`)}
                className="w-full text-left bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-green-300 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <BookOpen className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-lg">
                        Constitution and By-Laws
                      </h4>
                      <p className="text-gray-500 text-sm">
                        Governing documents
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-2 text-sm rounded-full font-bold ${getStatusBadgeColor(
                      AccreditationData?.ConstitutionAndByLaws
                        ? "approved"
                        : "rejected"
                    )}`}
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
                className="w-full text-left bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-purple-300 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-lg">
                        Joint Statement
                      </h4>
                      <p className="text-gray-500 text-sm">
                        Collaborative agreements
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-2 text-sm rounded-full font-bold ${getStatusBadgeColor(
                      AccreditationData?.JointStatement
                        ? "approved"
                        : "rejected"
                    )}`}
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
                className="w-full text-left bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-red-300 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 rounded-xl">
                      <Award className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-lg">
                        Pledge Against Hazing
                      </h4>
                      <p className="text-gray-500 text-sm">Safety commitment</p>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-2 text-sm rounded-full font-bold ${getStatusBadgeColor(
                      AccreditationData?.PledgeAgainstHazing
                        ? "approved"
                        : "rejected"
                    )}`}
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
                className="w-full text-left bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-yellow-300 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 rounded-xl">
                      <DollarSign className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-lg">
                        Financial Report
                      </h4>
                      {AccreditationData?.FinancialReport ? (
                        <p className="text-gray-600 text-sm">
                          Initial Balance: ₱
                          {AccreditationData.FinancialReport.initialBalance?.toLocaleString() ||
                            "0"}
                        </p>
                      ) : (
                        <p className="text-gray-500 text-sm italic">
                          No report uploaded
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-4 py-2 text-sm rounded-full font-bold ${getStatusBadgeColor(
                      AccreditationData?.FinancialReport
                        ? "approved"
                        : "rejected"
                    )}`}
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

        {/* Right Panel - President Profile */}
        <div className="lg:w-3/5 flex flex-col">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-cnsc-primary-color rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              President Profile
            </h2>

            {AccreditationData?.PresidentProfile ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                      <span className="text-sm font-semibold text-gray-500 block mb-2">
                        Name
                      </span>
                      <p className="text-gray-800 font-bold text-lg">
                        {AccreditationData.PresidentProfile.name}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                      <span className="text-sm font-semibold text-gray-500 block mb-2">
                        Year & Course
                      </span>
                      <p className="text-gray-800 font-bold text-lg">
                        {AccreditationData.PresidentProfile.year} -{" "}
                        {AccreditationData.PresidentProfile.course}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                      <span className="text-sm font-semibold text-gray-500 block mb-2">
                        Age
                      </span>
                      <p className="text-gray-800 font-bold text-lg">
                        {AccreditationData.PresidentProfile.age} years old
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                      <span className="text-sm font-semibold text-gray-500 block mb-2">
                        Contact
                      </span>
                      <p className="text-gray-800 font-bold text-lg">
                        {AccreditationData.PresidentProfile.contactNo}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                      <span className="text-sm font-semibold text-gray-500 block mb-2">
                        Religion
                      </span>
                      <p className="text-gray-800 font-bold text-lg">
                        {AccreditationData.PresidentProfile.religion}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                      <span className="text-sm font-semibold text-gray-500 block mb-2">
                        Status
                      </span>
                      <span
                        className={`px-4 py-2 text-sm rounded-full font-bold ${getStatusBadgeColor(
                          AccreditationData.PresidentProfile.overAllStatus
                        )}`}
                      >
                        {AccreditationData.PresidentProfile.overAllStatus?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Talents/Skills */}
                  {AccreditationData.PresidentProfile.talentSkills?.length >
                    0 && (
                    <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <span className="text-sm font-semibold text-gray-500 block mb-3">
                        Talents & Skills
                      </span>
                      <div className="flex flex-wrap gap-3">
                        {AccreditationData.PresidentProfile.talentSkills.map(
                          (talent, index) => (
                            <span
                              key={index}
                              className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 text-sm font-semibold rounded-full border border-indigo-200"
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
                    <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <span className="text-sm font-semibold text-gray-500 block mb-3">
                        Present Address
                      </span>
                      <p className="text-gray-800 font-medium text-lg">
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
              <div className="bg-gradient-to-br from-cnsc-secondary-color/10 to-red-50 h-full rounded-2xl flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-red-200">
                <User className="w-16 h-16 text-red-400 mb-4" />
                <h3 className="text-xl font-bold text-red-700 mb-2">
                  No President Profile Submitted
                </h3>
                <p className="text-red-600 text-lg">
                  The organization hasn't submitted a president profile yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
