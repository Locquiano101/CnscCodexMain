import { useEffect, useState } from "react";
import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
import {
  ChevronDown,
  Building2,
  Users,
  Award,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
export function SduMainOrganizationsComponent({ selectedOrg, onSelectOrg }) {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  const fetchOrganizations = async () => {
    try {
      const res = await axios.get(`${API_ROUTER}/getAllOrganizationProfile`);
      const orgs = Array.isArray(res.data) ? res.data : [];
      const activeOrgs = orgs.filter((org) => org?.isActive);
      setOrganizations(activeOrgs);
    } catch (err) {
      console.error("Error fetching organizations:", err);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  if (loading) {
    return <div className="p-4">Loading organizations...</div>;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="w-4 h-4" />;
      case "Pending":
        return <Clock className="w-4 h-4" />;
      case "Rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "text-emerald-600 bg-emerald-50";
      case "Pending":
        return "text-amber-600 bg-amber-50";
      case "Rejected":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="p-4 rounded">
      <div className="p-8 bg-white">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
          </div>
          <p className="text-gray-600">
            Manage and monitor organizational accreditation status
          </p>
        </div>

        {organizations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No active organizations found.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Organizations will appear here once they are registered.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 p-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                <div className="col-span-5">Organization</div>
                <div className="col-span-3">Classification</div>
                <div className="col-span-2">Accreditation</div>
                <div className="col-span-2">Status</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {organizations.map((org, index) => (
                <div
                  key={org._id}
                  onClick={() => {
                    console.log("Selected org:", org);
                    onSelectOrg?.(org);
                  }}
                  className={`grid grid-cols-12 gap-4 p-6 cursor-pointer transition-all duration-200 hover:bg-amber-25 hover:shadow-sm ${
                    selectedOrg?._id === org._id
                      ? "bg-amber-50 border-l-4 border-l-amber-500"
                      : index % 2 === 0
                      ? "bg-white"
                      : "bg-gray-25"
                  }`}
                >
                  {/* Organization Info */}
                  <div className="col-span-5">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {org.orgLogo ? (
                          <img
                            src={`${DOCU_API_ROUTER}/${org._id}/${org.orgLogo}`}
                            alt={org.orgAcronym}
                            className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-200"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {org.orgAcronym?.substring(0, 2) ||
                                org.orgName?.substring(0, 2)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {org.orgName}
                        </h3>
                        <p className="text-gray-500 font-medium">
                          {org.orgAcronym}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Classification */}
                  <div className="col-span-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900 capitalize">
                          {org.orgClass}
                        </span>
                      </div>

                      {org.orgClass?.toLowerCase() === "system-wide" &&
                        org.orgSpecialization && (
                          <div className="text-sm text-gray-600 ml-6">
                            <span className="font-medium">Specialization:</span>{" "}
                            {org.orgSpecialization}
                          </div>
                        )}

                      {org.orgClass?.toLowerCase() === "local" && (
                        <div className="space-y-1 ml-6 text-sm text-gray-600">
                          {org.orgCourse && (
                            <div>
                              <span className="font-medium">Course:</span>{" "}
                              {org.orgCourse}
                            </div>
                          )}
                          {org.orgDepartment && (
                            <div>
                              <span className="font-medium">Department:</span>{" "}
                              {org.orgDepartment}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Accreditation Eligibility */}
                  <div className="col-span-2 relative">
                    <div
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === org._id ? null : org._id);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span
                          className={`font-medium ${
                            org.isAllowedForAccreditation
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {org.isAllowedForAccreditation
                            ? "Eligible"
                            : "Not Eligible"}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          openMenuId === org._id ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {openMenuId === org._id && (
                      <div
                        className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="w-full px-4 py-3 text-left hover:bg-green-50 hover:text-green-700 transition-colors flex items-center gap-2"
                          onClick={() => {
                            console.log("Allow Accreditation for", org.orgName);
                            setOpenMenuId(null);
                          }}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Allow Accreditation
                        </button>
                        <button
                          className="w-full px-4 py-3 text-left hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2 border-t border-gray-100"
                          onClick={() => {
                            console.log(
                              "Revoke Accreditation for",
                              org.orgName
                            );
                            setOpenMenuId(null);
                          }}
                        >
                          <XCircle className="w-4 h-4" />
                          Revoke Accreditation
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full font-medium text-sm ${getStatusColor(
                        org.overAllStatus
                      )}`}
                    >
                      {getStatusIcon(org.overAllStatus)}
                      {org.overAllStatus}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
