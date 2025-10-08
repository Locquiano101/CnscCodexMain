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
    <div className="p-8 bg-white flex flex-col h-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Organizations</h1>

      {organizations.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-gray-200 rounded-2xl shadow-sm text-center flex-1">
          <Building2 className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg font-medium">
            No active organizations found.
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Registered organizations will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col border border-gray-200 rounded-2xl shadow-sm flex-1 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b text-sm font-semibold text-gray-700 uppercase flex-shrink-0">
            <div className="col-span-5">Organization</div>
            <div className="col-span-3">Classification</div>
            <div className="col-span-2">Status</div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {organizations.map((org, index) => {
              const isSelected = selectedOrg?._id === org._id;
              const bgColor = isSelected
                ? "bg-amber-50 border-l-4 border-amber-500"
                : index % 2
                ? "bg-gray-50"
                : "bg-white";

              return (
                <div
                  key={org._id}
                  onClick={() => onSelectOrg?.(org)}
                  className={`grid grid-cols-12 gap-4 p-4 cursor-pointer transition hover:bg-amber-25 ${bgColor}`}
                >
                  {/* Organization Info */}
                  <div className="col-span-5 flex items-center gap-4">
                    {org.orgLogo ? (
                      <img
                        src={`${DOCU_API_ROUTER}/${org._id}/${org.orgLogo}`}
                        alt={org.orgAcronym}
                        className="h-14 w-14 rounded-full object-cover ring-2 ring-gray-200"
                      />
                    ) : (
                      <div className="h-14 w-14 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-purple-600 text-white font-semibold text-lg">
                        {(org.orgAcronym || org.orgName)?.substring(0, 2)}
                      </div>
                    )}
                    <div className="truncate">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {org.orgName}
                      </h3>
                      <p className="text-gray-500 text-sm">{org.orgAcronym}</p>
                    </div>
                  </div>

                  {/* Classification */}
                  <div className="col-span-3 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold capitalize">
                        {org.orgClass}
                      </span>
                    </div>

                    <div className="ml-6 text-sm text-gray-600 space-y-1">
                      {org.orgClass?.toLowerCase() === "system-wide" &&
                        org.orgSpecialization && (
                          <p>
                            <span className="font-medium">Specialization:</span>{" "}
                            {org.orgSpecialization}
                          </p>
                        )}
                      {org.orgClass?.toLowerCase() === "local" && (
                        <>
                          {org.orgCourse && (
                            <p>
                              <span className="font-medium">Course:</span>{" "}
                              {org.orgCourse}
                            </p>
                          )}
                          {org.orgDepartment && (
                            <p>
                              <span className="font-medium">Department:</span>{" "}
                              {org.orgDepartment}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex items-center">
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                        org.overAllStatus
                      )}`}
                    >
                      {getStatusIcon(org.overAllStatus)}
                      {org.overAllStatus}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
