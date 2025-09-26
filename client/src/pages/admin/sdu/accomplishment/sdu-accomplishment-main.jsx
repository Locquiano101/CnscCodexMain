import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { API_ROUTER } from "../../../../App";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00ff00",
  "#ff00ff",
  "#00ffff",
  "#ff8042",
];

export function SduAccomplishmentMain({ onSelectOrg }) {
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

  const getTotalStats = () => {
    if (!data || data.length === 0) {
      return {
        totalOrgs: 0,
        totalAccomplishments: 0,
        totalPoints: 0,
        totalDocuments: 0,
      };
    }

    const totalOrgs = data.length;
    const totalAccomplishments = data.reduce(
      (sum, org) => sum + (org.accomplishments?.length || 0),
      0
    );
    const totalPoints = data.reduce(
      (sum, org) => sum + (org.grandTotal || 0),
      0
    );
    const totalDocuments = data.reduce(
      (sum, org) =>
        sum +
        (org.accomplishments?.reduce(
          (docSum, acc) => docSum + (acc.documents?.length || 0),
          0
        ) || 0),
      0
    );

    return { totalOrgs, totalAccomplishments, totalPoints, totalDocuments };
  };

  // Check if we have any meaningful data
  const hasData = data && data.length > 0;
  const hasAccomplishments =
    hasData &&
    data.some((org) => org.accomplishments && org.accomplishments.length > 0);

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

  // Enhanced no data state
  if (!hasData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              SDU Accomplishment Analytics
            </h1>
            <p className="text-gray-600">
              Comprehensive view of organizational accomplishments and
              performance metrics
            </p>
          </header>

          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center">
              <div className="text-6xl text-gray-300 mb-4">📊</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                No Data Available Yet
              </h2>
              <p className="text-gray-500 mb-6">
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
      </div>
    );
  }

  // If we have organizations but no accomplishments
  if (!hasAccomplishments) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              SDU Accomplishment Analytics
            </h1>
            <p className="text-gray-600">
              Comprehensive view of organizational accomplishments and
              performance metrics
            </p>
          </header>

          {/* Summary Stats - showing organizations but no accomplishments */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Total Organizations
              </h3>
              <p className="text-3xl font-bold text-blue-600">{data.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Total Accomplishments
              </h3>
              <p className="text-3xl font-bold text-gray-400">0</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Total Points Awarded
              </h3>
              <p className="text-3xl font-bold text-gray-400">0</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Total Documents
              </h3>
              <p className="text-3xl font-bold text-gray-400">0</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <div className="text-5xl text-gray-300 mb-4">📋</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                No Accomplishments Yet
              </h2>
              <p className="text-gray-500 mb-6">
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
                  className="bg-white rounded-lg hover:scale-105 transition-all border border-white hover:border-amber-500 duration-200 shadow hover:shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {org.organizationProfile.orgName ||
                        "Unnamed Organization"}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-500">
                      No data
                    </span>
                  </div>
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">
                      No accomplishments submitted yet
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original component logic for when data exists
  const categoryData = getAccomplishmentsByCategory();
  const orgPointsData = getPointsByOrganization();
  const docTypeData = getDocumentTypeBreakdown();
  const pointsDistData = getPointsDistribution();
  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SDU Accomplishment Analytics
          </h1>
          <p className="text-gray-600">
            Comprehensive view of organizational accomplishments and performance
            metrics
          </p>
        </header>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Total Organizations
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {stats.totalOrgs}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Total Accomplishments
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {stats.totalAccomplishments}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Total Points Awarded
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {stats.totalPoints}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Total Documents
            </h3>
            <p className="text-3xl font-bold text-orange-600">
              {stats.totalDocuments}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Accomplishments by Category */}
          {categoryData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Accomplishments by Category
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Document Types Distribution */}
          {docTypeData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Document Types Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={docTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percent }) =>
                      `${type} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {docTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Points Distribution */}
          {pointsDistData.some((d) => d.count > 0) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Points Distribution Range
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pointsDistData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Organization Performance */}
          {orgPointsData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Organization Performance
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={orgPointsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="orgId" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalPoints"
                    stroke="#8884d8"
                    name="Total Points"
                  />
                  <Line
                    type="monotone"
                    dataKey="accomplishmentCount"
                    stroke="#82ca9d"
                    name="Accomplishments"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Organization Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Organization Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((org) => {
              const accomplishmentCount = org.accomplishments?.length || 0;
              const categories = [
                ...new Set(
                  org.accomplishments
                    ?.map((acc) => acc.category)
                    .filter(Boolean)
                ),
              ];
              const documentCount =
                org.accomplishments?.reduce(
                  (sum, acc) => sum + (acc.documents?.length || 0),
                  0
                ) || 0;
              const avgPointsPerAccomplishment =
                accomplishmentCount > 0
                  ? (org.grandTotal / accomplishmentCount).toFixed(1)
                  : 0;

              return (
                <div
                  key={org._id}
                  onClick={() => onSelectOrg(org.organizationProfile)}
                  className="bg-white rounded-lg hover:scale-105 transition-all border border-white hover:border-amber-500 duration-200 shadow hover:shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {org.organizationProfile?.orgName ||
                        "Unnamed Organization"}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        org.grandTotal > 50
                          ? "bg-green-100 text-green-800"
                          : org.grandTotal > 20
                          ? "bg-yellow-100 text-yellow-800"
                          : org.grandTotal > 0
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {org.grandTotal || 0} pts
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Accomplishments:</span>
                      <span className="font-medium">{accomplishmentCount}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Documents:</span>
                      <span className="font-medium">{documentCount}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Points:</span>
                      <span className="font-medium">
                        {avgPointsPerAccomplishment}
                      </span>
                    </div>

                    {categories.length > 0 && (
                      <div className="pt-2 border-t">
                        <span className="text-sm text-gray-500 mb-2 block">
                          Categories:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {categories.slice(0, 3).map((category, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {category.length > 15
                                ? `${category.substring(0, 15)}...`
                                : category}
                            </span>
                          ))}
                          {categories.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{categories.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
