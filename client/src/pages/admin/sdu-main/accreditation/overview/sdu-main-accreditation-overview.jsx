import axios from "axios";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  Award,
  Building2,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { API_ROUTER } from "../../../../../App";

export function SduAccreditationOverview({ onSelectOrg }) {
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

  const statusData = processStatusData();
  const orgClassData = processOrgClassData();
  const deptCourseData = processOrgDeptCourseData();
  const specData = processOrgSpecData();

  return (
    <div className="flex flex-col gap-6 p-6 overflow-auto">
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold text-cnsc-primary-color">
          SDU Accreditation Analytics Dashboard
        </h1>
      </div>

      {/* Summary Cards + Main Panels */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Summary Cards Column */}
        <div className="flex flex-row lg:flex-col gap-4 overflow-x-auto lg:overflow-x-visible lg:min-w-[280px]">
          {/* Total Organizations */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 min-w-[240px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">
                  Total Organizations
                </p>
                <p className="text-3xl font-bold text-cnsc-primary-color">
                  {activeOrganization.length}
                </p>
              </div>
              <Users className="w-12 h-12 text-cnsc-primary-color" />
            </div>
          </div>

          {/* Active */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 min-w-[240px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Active</p>
                <p className="text-3xl font-bold text-cnsc-primary-color">
                  {
                    activeOrganization.filter(
                      (org) => org.organizationProfile?.isActive
                    ).length
                  }
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-cnsc-primary-color" />
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 min-w-[240px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Pending</p>
                <p className="text-3xl font-bold text-amber-600">
                  {
                    activeOrganization.filter(
                      (org) => org.overallStatus === "Pending"
                    ).length
                  }
                </p>
              </div>
              <Clock className="w-12 h-12 text-amber-500" />
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 min-w-[240px]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Completion Rate</p>
                <p className="text-3xl font-bold text-cnsc-primary-color">
                  {(
                    (activeOrganization.filter(
                      (org) => org.overallStatus === "Approved"
                    ).length /
                      activeOrganization.length) *
                    100
                  ).toFixed(0)}
                  %
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-cnsc-primary-color" />
            </div>
          </div>
        </div>

        {/* Main Data Panels */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Status Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-6 h-6 text-blue-900" />
              <h3 className="text-xl font-bold text-gray-800">
                Status Distribution
              </h3>
            </div>
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

          {/* Organization Classes & Specializations */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-6 h-6 text-blue-900" />
              <h3 className="text-xl font-bold text-gray-800">
                Organization Classes
              </h3>
            </div>
            <div className="space-y-3 mb-6">
              {orgClassData.map((item, index) => (
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

            <div className="flex items-center gap-2 mb-4 mt-6">
              <Briefcase className="w-6 h-6 text-blue-900" />
              <h3 className="text-xl font-bold text-gray-800">
                Specializations
              </h3>
            </div>
            <div className="space-y-3">
              {specData.map((item, index) => (
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

          {/* Department & Course Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap className="w-6 h-6 text-blue-900" />
              <h3 className="text-xl font-bold text-gray-800">
                Department & Course
              </h3>
            </div>
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
        </div>
      </div>

      {/* Organization Accreditation Section */}
      <div className="bg-white p-6 rounded-2xl shadow-md min">
        <h1 className="text-3xl font-bold text-blue-900">
          Organization Accreditation
        </h1>
      </div>

      {/* Accreditation Table */}
      <div className="bg-white rounded-xl shadow-lg border min-h-screen border-gray-100 overflow-hidden">
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
                <th className="px-6 py-3 font-semibold">Roster Status</th>
                <th className="px-6 py-3 font-semibold">Financial Report</th>
                <th className="px-6 py-3 font-semibold">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeOrganization
                .filter(
                  (org) =>
                    org &&
                    org.organizationProfile &&
                    org.organizationProfile.orgName && // Must have org name
                    org.overallStatus // Must have a status
                )
                .map((org, index) => {
                  const profile = org.organizationProfile;
                  const roster = org.Roster;
                  const financial = org.FinancialReport;
                  return (
                    <tr
                      key={index}
                      onClick={() => {
                        console.log("Selected org:", org);
                        onSelectOrg(org.organizationProfile);
                      }}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {profile?.orgName || "—"}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {profile?.orgAcronym || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {profile?.orgClass === "Local" ? (
                          <>
                            <div className="font-medium text-gray-800">
                              {profile?.orgDepartment || "—"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {profile?.orgCourse || "—"}
                            </div>
                          </>
                        ) : profile?.orgClass === "System-wide" ? (
                          <>
                            <div className="font-medium text-gray-800">
                              {profile?.orgSpecialization || "—"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {profile?.orgClass || "—"}
                            </div>
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
                        {org.overallStatus}
                      </td>
                      <td className="px-6 py-4">
                        {roster?.isComplete ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Incomplete
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        ₱{financial?.endingBalance?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(org.createdAt).toLocaleDateString()}
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
