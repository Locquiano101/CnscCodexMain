import axios from "axios";
import { useState, useEffect } from "react";
import {
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  Building2,
  GraduationCap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { API_ROUTER } from "../../../../../App";

export function SduAccreditationOverview({ onSelectOrg }) {
  const [activeOrganization, setActiveOrganization] = useState([]);
  const [activeReport, setActiveReport] = useState(null);

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

  // Helper function to check if value should be displayed
  const shouldDisplay = (value) => {
    return (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "Unknown" &&
      value !== "Unknown Class" &&
      value !== "Unknown Dept" &&
      value !== "Unknown Course" &&
      value !== "Unknown Spec"
    );
  };

  const processStatusData = () => {
    const statusCounts = activeOrganization.reduce((acc, org) => {
      const status = org.overallStatus || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: ((count / activeOrganization.length) * 100).toFixed(1),
    }));
  };

  const processOrgClassData = () => {
    const classCounts = activeOrganization.reduce((acc, org) => {
      const val = org.organizationProfile?.orgClass || "Unknown Class";
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(classCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: ((count / activeOrganization.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count);
  };

  const processOrgDeptCourseData = () => {
    const deptCourseCounts = activeOrganization.reduce((acc, org) => {
      const dept = org.organizationProfile?.orgDepartment || "Unknown Dept";
      const course = org.organizationProfile?.orgCourse || "Unknown Course";
      const label = `${dept} - ${course}`;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(deptCourseCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: ((count / activeOrganization.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count);
  };

  const processOrgSpecData = () => {
    const specCounts = activeOrganization.reduce((acc, org) => {
      const val = org.organizationProfile?.orgSpecialization || "Unknown Spec";
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(specCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: ((count / activeOrganization.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count);
  };

  const toggleReport = (reportType) => {
    setActiveReport(activeReport === reportType ? null : reportType);
  };

  const statusData = processStatusData();
  const orgClassData = processOrgClassData();
  const deptCourseData = processOrgDeptCourseData();
  const specData = processOrgSpecData();

  return (
    <div className="flex flex-col gap-6 p-6 overflow-auto bg-gray-50">
      <h1 className="text-3xl font-bold text-cnsc-primary-color">
        SDU Accreditation Analytics Dashboard
      </h1>

      {/* Reports Section */}
      <div>
        {/* Toggle Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
          <button
            onClick={() => toggleReport("status")}
            className={`p-4 rounded-xl shadow border-2 transition-all ${
              activeReport === "status"
                ? "border-blue-900 bg-blue-50"
                : "border-gray-200 bg-white hover:border-blue-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-blue-900" />
                <span className="font-semibold text-gray-800">
                  Status Distribution
                </span>
              </div>
              {activeReport === "status" ? (
                <ChevronUp className="w-5 h-5 text-blue-900" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>

          <button
            onClick={() => toggleReport("class")}
            className={`p-4 rounded-xl shadow border-2 transition-all ${
              activeReport === "class"
                ? "border-blue-900 bg-blue-50"
                : "border-gray-200 bg-white hover:border-blue-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-blue-900" />
                <span className="font-semibold text-gray-800">
                  Classes & Specializations
                </span>
              </div>
              {activeReport === "class" ? (
                <ChevronUp className="w-5 h-5 text-blue-900" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>

          <button
            onClick={() => toggleReport("dept")}
            className={`p-4 rounded-xl shadow border-2 transition-all ${
              activeReport === "dept"
                ? "border-blue-900 bg-blue-50"
                : "border-gray-200 bg-white hover:border-blue-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-blue-900" />
                <span className="font-semibold text-gray-800">
                  Department & Course
                </span>
              </div>
              {activeReport === "dept" ? (
                <ChevronUp className="w-5 h-5 text-blue-900" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>
        </div>

        {/* Collapsible Report Content */}
        {activeReport === "status" && (
          <div className="border-t-2 border-blue-900 pt-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Status Distribution
            </h3>
            <div className="space-y-3">
              {statusData.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <span className="font-medium text-gray-700">
                    {item.status}
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-900">
                      {item.count}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeReport === "class" && (
          <div className="border-t-2 border-blue-900 pt-6 animate-fadeIn">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Organization Classes
              </h3>
              <div className="space-y-3">
                {orgClassData.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <span className="font-medium text-gray-700">
                      {item.name}
                    </span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-blue-900">
                        {item.count}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Specializations
              </h3>
              <div className="space-y-3">
                {specData.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <span className="font-medium text-gray-700">
                      {item.name}
                    </span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-blue-900">
                        {item.count}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeReport === "dept" && (
          <div className="border-t-2 border-blue-900 pt-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Department & Course Distribution
            </h3>
            <div className="space-y-3">
              {deptCourseData.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-900">
                      {item.count}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Organization Accreditation Section */}
      <h1 className="text-3xl font-bold text-cnsc-primary-color">
        Organization Accreditation
      </h1>

      {/* Accreditation Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">
            Accreditation Overview
          </h3>
          <span className="text-sm text-gray-500">
            Showing {activeOrganization.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 font-semibold">Organization Name</th>
                <th className="px-6 py-3 font-semibold">Acronym</th>
                <th className="px-6 py-3 font-semibold">Classification</th>
                <th className="px-6 py-3 font-semibold">Overall Status</th>
                <th className="px-6 py-3 font-semibold">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeOrganization
                .filter(
                  (org) =>
                    org &&
                    org.organizationProfile &&
                    org.organizationProfile.orgName &&
                    org.overallStatus
                )
                .map((org, index) => {
                  const profile = org.organizationProfile;
                  return (
                    <tr
                      key={index}
                      onClick={() => {
                        console.log("Selected org:", org);
                        onSelectOrg?.(org.organizationProfile);
                      }}
                      className="hover:bg-gray-50 transition cursor-pointer"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {shouldDisplay(profile?.orgName)
                          ? profile.orgName
                          : "—"}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {shouldDisplay(profile?.orgAcronym)
                          ? profile.orgAcronym
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        {profile?.orgClass === "Local" ? (
                          <>
                            {shouldDisplay(profile?.orgDepartment) && (
                              <div className="font-medium text-gray-800">
                                {profile.orgDepartment}
                              </div>
                            )}
                            {shouldDisplay(profile?.orgCourse) && (
                              <div className="text-sm text-gray-500">
                                {profile.orgCourse}
                              </div>
                            )}
                            {!shouldDisplay(profile?.orgDepartment) &&
                              !shouldDisplay(profile?.orgCourse) && (
                                <div className="text-gray-400">—</div>
                              )}
                          </>
                        ) : profile?.orgClass === "System-wide" ? (
                          <>
                            {shouldDisplay(profile?.orgSpecialization) && (
                              <div className="font-medium text-gray-800">
                                {profile.orgSpecialization}
                              </div>
                            )}
                            {shouldDisplay(profile?.orgClass) && (
                              <div className="text-sm text-gray-500">
                                {profile.orgClass}
                              </div>
                            )}
                            {!shouldDisplay(profile?.orgSpecialization) &&
                              !shouldDisplay(profile?.orgClass) && (
                                <div className="text-gray-400">—</div>
                              )}
                          </>
                        ) : (
                          <div className="text-gray-400">—</div>
                        )}
                      </td>
                      <td
                        className={`px-6 py-4 font-semibold ${
                          org.overallStatus === "Pending"
                            ? "text-amber-600"
                            : org.overallStatus === "Approved"
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      >
                        {shouldDisplay(org.overallStatus)
                          ? org.overallStatus
                          : "—"}
                      </td>

                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {shouldDisplay(org.createdAt)
                          ? new Date(org.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
