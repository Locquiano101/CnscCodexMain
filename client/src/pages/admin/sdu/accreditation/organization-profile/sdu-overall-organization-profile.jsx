import axios from "axios";
import { useState, useEffect } from "react";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../../App";
import { School2, User } from "lucide-react";

export function SduOverallOrganizationProfile({ selectedOrg, onSelectOrg }) {
  const [activeOrganization, setActiveOrganization] = useState([]);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_ROUTER}/getAllAccreditationId/`);
      setActiveOrganization(res.data);
    } catch (error) {
      console.error("Failed to fetch accreditation data", error);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Status badge
  const getStatusBadge = (status) => {
    const styles = {
      Approved: "bg-green-100 text-green-700 border-green-200",
      Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Revision From SDU": "bg-red-100 text-red-700 border-red-200",
      Rejected: "bg-red-100 text-red-700 border-red-200",
    };
    return styles[status] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  // Academic info
  const renderAcademicInfo = (org) => {
    const profile = org.organizationProfile;
    if (!profile) return null;

    if (profile.orgClass === "System-wide") {
      return (
        <>
          <p>
            <span className="font-medium text-gray-600">Specialization:</span>{" "}
            {profile.orgSpecialization || "N/A"}
          </p>
          {profile.orgSpecialization?.toLowerCase() ===
            "student government" && (
            <p>
              <span className="font-medium text-gray-600">Department:</span>{" "}
              {profile.orgDepartment || "N/A"}
            </p>
          )}
        </>
      );
    }

    return (
      <>
        <p>
          <span className="font-medium text-gray-600">Course:</span>{" "}
          {profile.orgCourse || "N/A"}
        </p>
        <p>
          <span className="font-medium text-gray-600">Department:</span>{" "}
          {profile.orgDepartment || "N/A"}
        </p>
      </>
    );
  };

  // President info
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
      <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-3">
        {president.profilePicture ? (
          <img
            src={`${DOCU_API_ROUTER}/${org.organizationProfile._id}/${president.profilePicture}`}
            alt="President"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-700" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-800">{president.name}</p>
          <p className="text-xs text-gray-600">
            {president.year} - {president.course}
          </p>
          <p className="text-xs text-gray-600">📞 {president.contactNo}</p>
        </div>
      </div>
    );
  };

  // Document status
  const renderDocumentStatus = (org) => {
    const docs = [
      { name: "Joint Statement", data: org.JointStatement },
      { name: "Constitution & By-Laws", data: org.ConstitutionAndByLaws },
      { name: "Pledge Against Hazing", data: org.PledgeAgainstHazing },
    ];

    return (
      <div className="bg-amber-50 p-3 rounded-lg space-y-2">
        <p className="text-sm font-semibold text-gray-700">📄 Documents</p>
        {docs.map((doc, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>{doc.name}</span>
            {doc.data ? (
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(
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
    );
  };

  // Financial info
  const renderFinancialInfo = (org) => {
    const financial = org.FinancialReport;
    if (!financial) return null;

    const balance = financial.initialBalance || 0;
    const reimbursements = financial.reimbursements?.length || 0;
    const disbursements = financial.disbursements?.length || 0;

    return (
      <div className="bg-green-50 p-3 rounded-lg grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <p className="text-gray-600">Balance</p>
          <p className={balance >= 0 ? "text-green-600" : "text-red-600"}>
            ₱{balance.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Reimbursements</p>
          <p className="text-blue-600">{reimbursements}</p>
        </div>
        <div>
          <p className="text-gray-600">Disbursements</p>
          <p className="text-orange-600">{disbursements}</p>
        </div>
      </div>
    );
  };

  const activeOrgs = activeOrganization.filter(
    (o) => o.organizationProfile?.isActive
  );
  const inactiveOrgs = activeOrganization.filter(
    (o) => !o.organizationProfile?.isActive
  );

  const renderOrganizationCard = (org) => {
    const overallStatus =
      org.overallStatus || org.organizationProfile?.overAllStatus;

    return (
      <div
        key={org._id}
        className="bg-white shadow-sm rounded-xl p-4 flex flex-col gap-3 border hover:shadow-md transition"
        onClick={() => onSelectOrg(org.organizationProfile)}
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          {org.organizationProfile?.orgLogo ? (
            <img
              src={`${DOCU_API_ROUTER}/${org.organizationProfile._id}/${org.organizationProfile.orgLogo}`}
              alt="Logo"
              className="w-14 h-14 rounded-full object-cover border"
            />
          ) : (
            <div className="w-14 h-14 bg-gray-200 flex justify-center items-center rounded-full">
              <School2 className="w-6 h-6 text-gray-500" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-base font-bold text-gray-800">
              {org.organizationProfile?.orgName}
            </h2>
            <p className="text-xs text-gray-600">
              {org.organizationProfile?.orgAcronym} •{" "}
              {org.organizationProfile?.orgClass}
            </p>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
              overallStatus
            )}`}
          >
            {overallStatus}
          </span>
        </div>

        {/* Info blocks */}
        <div className="text-sm space-y-2">
          {renderAcademicInfo(org)}
          <p>
            <span className="font-medium text-gray-600">Adviser:</span>{" "}
            {org.organizationProfile?.adviserName || "Not assigned"}
          </p>
        </div>

        {renderPresidentInfo(org)}
        {renderDocumentStatus(org)}
        {renderFinancialInfo(org)}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-100 space-y-8 overflow-auto">
      {activeOrganization.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No accreditation data found.
        </div>
      ) : (
        <>
          {/* Overview */}
          <div className="bg-white shadow-sm rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">
              Accreditation Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {activeOrganization.length}
                </p>
                <p className="text-sm text-gray-600">Total Organizations</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {activeOrgs.length}
                </p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">
                  {inactiveOrgs.length}
                </p>
                <p className="text-sm text-gray-600">Inactive</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {
                    activeOrganization.filter(
                      (o) => o.overallStatus === "Pending"
                    ).length
                  }
                </p>
                <p className="text-sm text-gray-600">Pending Review</p>
              </div>
            </div>
          </div>

          {/* Active */}
          {activeOrgs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-green-500 pl-3">
                Active Organizations
              </h3>
              <div className="flex flex-col gap-6 overflow-auto">
                {activeOrgs.map(renderOrganizationCard)}
              </div>
            </div>
          )}

          {/* Inactive */}
          {inactiveOrgs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-gray-500 pl-3">
                Inactive Organizations
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {inactiveOrgs.map(renderOrganizationCard)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
