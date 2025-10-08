import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ROUTER } from "../../../../App";

export function SduMainAccomplishment({ onSelectOrg }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const GetAccomplishmentData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_ROUTER}/getAccomplishmentAll`);

      // Enhanced failsafe: Ensure it's an array and has valid data
      const safeData = Array.isArray(response.data) ? response.data : [];

      // Filter out any invalid entries
      const validData = safeData.filter(
        (org) =>
          org && typeof org === "object" && org._id && org.organizationProfile
      );

      setData(validData);
      setError(null);
    } catch (error) {
      console.error("Error fetching accomplishment data:", error);
      setError("Failed to fetch accomplishment data");
      setData([]); // fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetAccomplishmentData();
  }, []);

  // Analytics calculations with enhanced null checking
  const getAccomplishmentsByCategory = () => {
    if (!data || data.length === 0) return [];

    const categoryCount = {};
    data.forEach((org) => {
      if (org.accomplishments && Array.isArray(org.accomplishments)) {
        org.accomplishments.forEach((acc) => {
          if (acc && acc.category) {
            categoryCount[acc.category] =
              (categoryCount[acc.category] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
    }));
  };

  const getPointsByOrganization = () => {
    if (!data || data.length === 0) return [];

    return data
      .map((org) => ({
        orgId: org._id,
        orgName: org.organizationProfile?.orgName || "Unknown Organization",
        totalPoints: org.grandTotal || 0,
        accomplishmentCount: org.accomplishments?.length || 0,
      }))
      .filter((org) => org.totalPoints > 0);
  };

  const getDocumentTypeBreakdown = () => {
    if (!data || data.length === 0) return [];

    const docTypes = {};
    data.forEach((org) => {
      if (org.accomplishments && Array.isArray(org.accomplishments)) {
        org.accomplishments.forEach((acc) => {
          if (acc.documents && Array.isArray(acc.documents)) {
            acc.documents.forEach((doc) => {
              if (doc && doc.label) {
                docTypes[doc.label] = (docTypes[doc.label] || 0) + 1;
              }
            });
          }
        });
      }
    });
    return Object.entries(docTypes).map(([type, count]) => ({
      type,
      count,
    }));
  };

  const getPointsDistribution = () => {
    if (!data || data.length === 0) return [];

    const pointRanges = {
      "0-5": 0,
      "6-10": 0,
      "11-20": 0,
      "21+": 0,
    };

    data.forEach((org) => {
      if (org.accomplishments && Array.isArray(org.accomplishments)) {
        org.accomplishments.forEach((acc) => {
          const points = acc.awardedPoints || 0;
          if (points <= 5) pointRanges["0-5"]++;
          else if (points <= 10) pointRanges["6-10"]++;
          else if (points <= 20) pointRanges["11-20"]++;
          else pointRanges["21+"]++;
        });
      }
    });

    return Object.entries(pointRanges).map(([range, count]) => ({
      range,
      count,
    }));
  };

  // Calculate total statistics
  const calculateTotalStats = () => {
    if (!data || data.length === 0) {
      return {
        totalOrganizations: 0,
        totalAccomplishments: 0,
        totalPoints: 0,
        totalDocuments: 0,
      };
    }

    const totalAccomplishments = data.reduce(
      (sum, org) => sum + (org.accomplishments?.length || 0),
      0
    );

    const totalPoints = data.reduce(
      (sum, org) => sum + (org.grandTotal || 0),
      0
    );

    const totalDocuments = data.reduce((sum, org) => {
      if (org.accomplishments && Array.isArray(org.accomplishments)) {
        return (
          sum +
          org.accomplishments.reduce((accSum, acc) => {
            return accSum + (acc.documents?.length || 0);
          }, 0)
        );
      }
      return sum;
    }, 0);

    return {
      totalOrganizations: data.length,
      totalAccomplishments,
      totalPoints,
      totalDocuments,
    };
  };

  // Check if we have any meaningful data
  const hasData = data && data.length > 0;
  const hasAccomplishments =
    hasData &&
    data.some((org) => org.accomplishments && org.accomplishments.length > 0);

  const stats = calculateTotalStats();
  const categoryData = getAccomplishmentsByCategory();
  const orgPointsData = getPointsByOrganization();
  const docTypeData = getDocumentTypeBreakdown();
  const pointsDistData = getPointsDistribution();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-600">
          Loading accomplishment data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-red-600 mb-4">{error}</div>
        <button
          onClick={GetAccomplishmentData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SDU Accomplishment Analytics
          </h1>
          <p className="text-gray-600">
            Comprehensive view of organizational accomplishments and performance
            metrics
          </p>
        </header>

        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-center">
            <div className="text-6xl text-gray-300 mb-4">📊</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No Data Available Yet
            </h2>
            <p className=" mb-6">
              There are currently no accomplishment records to display. Data
              will appear here once organizations start submitting their
              accomplishments.
            </p>
            <button
              onClick={GetAccomplishmentData}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If we have organizations but no accomplishments
  if (!hasAccomplishments) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SDU Accomplishment Analytics
          </h1>
          <p className="text-gray-600">
            Comprehensive view of organizational accomplishments and performance
            metrics
          </p>
        </header>

        {/* Summary Stats - showing organizations but no accomplishments */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-bold mb-1">Total Organizations</h3>
            <p className="text-3xl font-bold text-blue-600">
              {stats.totalOrganizations}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-bold mb-1">Total Accomplishments</h3>
            <p className="text-3xl font-bold text-gray-400">
              {stats.totalAccomplishments}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-bold mb-1">Total Points Awarded</h3>
            <p className="text-3xl font-bold text-gray-400">
              {stats.totalPoints}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-bold mb-1">Total Documents</h3>
            <p className="text-3xl font-bold text-gray-400">
              {stats.totalDocuments}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <div className="text-5xl text-gray-300 mb-4">📋</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No Accomplishments Yet
            </h2>
            <p className=" mb-6">
              Organizations are registered but haven't submitted any
              accomplishments yet.
            </p>
          </div>
        </div>

        {/* Show registered organizations */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">
            Registered Organizations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((org) => (
              <div
                key={org._id}
                onClick={() => onSelectOrg(org.organizationProfile)}
                className="bg-white rounded-lg hover:scale-105 transition-all border border-white hover:border-amber-500 duration-200 shadow hover:shadow-lg p-6 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {org.organizationProfile.orgName || "Unnamed Organization"}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-sm font-boldbg-gray-100 ">
                    No data
                  </span>
                </div>
                <div className="text-center py-4">
                  <p className=" text-sm">No accomplishments submitted yet</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main component with data
  return (
    <div className="overflow-auto flex flex-col p-4 pt-0 gap-4">
      <h1 className="text-3xl font-bold text-gray-900 ">SDU Accomplishment</h1>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-bold mb-1">Total Organizations</h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats.totalOrganizations}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-bold mb-1">Total Accomplishments</h3>
          <p className="text-3xl font-bold text-green-600">
            {stats.totalAccomplishments}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-bold mb-1">Total Points Awarded</h3>
          <p className="text-3xl font-bold text-orange-600">
            {stats.totalPoints}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-bold mb-1">Total Documents</h3>
          <p className="text-3xl font-bold text-purple-600">
            {stats.totalDocuments}
          </p>
        </div>
      </div>
      {/* Numerical Data Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Accomplishments by Category */}
        {categoryData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Accomplishments by Category
            </h2>
            <div className="space-y-3">
              {categoryData.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <span className="font-boldtext-gray-700">
                    {item.category}
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Types Distribution */}
        {docTypeData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Document Types Distribution
            </h2>
            <div className="space-y-3">
              {docTypeData.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <span className="font-boldtext-gray-700">{item.type}</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Points Distribution */}
        {pointsDistData.some((d) => d.count > 0) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Points Distribution Range
            </h2>
            <div className="space-y-3">
              {pointsDistData
                .filter((d) => d.count > 0)
                .map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <span className="font-boldtext-gray-700">{item.range}</span>
                    <span className="text-2xl font-bold text-green-600">
                      {item.count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Organization Performance Summary */}
        {orgPointsData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Organization Performance Summary
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between p-2 border-b">
                <span className="font-boldtext-gray-600">Total Points:</span>
                <span className="text-xl font-bold text-blue-600">
                  {orgPointsData.reduce((sum, org) => sum + org.totalPoints, 0)}
                </span>
              </div>
              <div className="flex justify-between p-2 border-b">
                <span className="font-boldtext-gray-600">
                  Total Accomplishments:
                </span>
                <span className="text-xl font-bold text-green-600">
                  {orgPointsData.reduce(
                    (sum, org) => sum + org.accomplishmentCount,
                    0
                  )}
                </span>
              </div>
              <div className="flex justify-between p-2">
                <span className="font-boldtext-gray-600">
                  Average Points/Org:
                </span>
                <span className="text-xl font-bold text-orange-600">
                  {(
                    orgPointsData.reduce(
                      (sum, org) => sum + org.totalPoints,
                      0
                    ) / orgPointsData.length
                  ).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}
        {/* Top Performing Organizations */}
        {orgPointsData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 col-span-2">
            <h2 className="text-xl font-semibold mb-4">
              Top Performing Organizations
            </h2>
            <div className="space-y-4">
              {orgPointsData
                .sort((a, b) => b.totalPoints - a.totalPoints)
                .slice(0, 5)
                .map((org, index) => (
                  <div
                    key={org.orgId}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-700 mr-4">
                        #{index + 1}
                      </span>
                      <span className="font-boldtext-gray-900">
                        {org.orgName}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600">
                        {org.totalPoints} pts
                      </div>
                      <div className="text-sm ">
                        {org.accomplishmentCount} accomplishments
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <table className="min-w-full min-h-fit divide-gray-200 rounded-xl">
        <thead className="bg-gray-100 ">
          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
            Organization Name
          </th>
          <th className="px-6 py-6 text-left text-xs font-bold uppercase tracking-wider">
            Accomplishments
          </th>
          <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
            Points
          </th>
          <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
            Status
          </th>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((org) => {
            const orgAccomplishments = org.accomplishments?.length || 0;
            const orgPoints = org.grandTotal || 0;

            return (
              <tr
                key={org._id}
                onClick={() => onSelectOrg(org.organizationProfile)}
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-boldtext-gray-900">
                    {org.organizationProfile.orgName || "Unnamed Organization"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {orgAccomplishments} accomplishment
                    {orgAccomplishments !== 1 ? "s" : ""}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-blue-600">
                    {orgPoints} points
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-bold${
                      orgAccomplishments > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 "
                    }`}
                  >
                    {orgAccomplishments > 0 ? "Active" : "No data"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
