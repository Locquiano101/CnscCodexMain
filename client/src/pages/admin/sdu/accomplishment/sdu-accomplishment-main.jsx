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
      setData(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching accomplishment data:", error);
      setError("Failed to fetch accomplishment data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetAccomplishmentData();
  }, []);

  // Analytics calculations
  const getAccomplishmentsByCategory = () => {
    const categoryCount = {};
    data.forEach((org) => {
      org.accomplishments?.forEach((acc) => {
        categoryCount[acc.category] = (categoryCount[acc.category] || 0) + 1;
      });
    });
    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
    }));
  };

  const getPointsByOrganization = () => {
    return data
      .map((org) => ({
        orgId: org._id,
        totalPoints: org.grandTotal || 0,
        accomplishmentCount: org.accomplishments?.length || 0,
      }))
      .filter((org) => org.totalPoints > 0);
  };

  const getDocumentTypeBreakdown = () => {
    const docTypes = {};
    data.forEach((org) => {
      org.accomplishments?.forEach((acc) => {
        acc.documents?.forEach((doc) => {
          docTypes[doc.label] = (docTypes[doc.label] || 0) + 1;
        });
      });
    });
    return Object.entries(docTypes).map(([type, count]) => ({
      type,
      count,
    }));
  };

  const getPointsDistribution = () => {
    const pointRanges = {
      "0-5": 0,
      "6-10": 0,
      "11-20": 0,
      "21+": 0,
    };

    data.forEach((org) => {
      org.accomplishments?.forEach((acc) => {
        const points = acc.awardedPoints || 0;
        if (points <= 5) pointRanges["0-5"]++;
        else if (points <= 10) pointRanges["6-10"]++;
        else if (points <= 20) pointRanges["11-20"]++;
        else pointRanges["21+"]++;
      });
    });

    return Object.entries(pointRanges).map(([range, count]) => ({
      range,
      count,
    }));
  };

  const getTotalStats = () => {
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
        org.accomplishments?.reduce(
          (docSum, acc) => docSum + (acc.documents?.length || 0),
          0
        ),
      0
    );

    return { totalOrgs, totalAccomplishments, totalPoints, totalDocuments };
  };

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-red-600">{error}</div>
      </div>
    );
  }

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
                ...new Set(org.accomplishments?.map((acc) => acc.category)),
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
              console.log(org);
              return (
                <div
                  key={org._id}
                  onClick={() => onSelectOrg(org.organizationProfile)}
                  className="bg-white rounded-lg hover:scale-105 transition-all border border-white hover:border-amber-500 duration-200 shadow hover:shadow-lg  p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      Organization {org.organizationProfile.orgName}
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
                      {org.grandTotal} pts
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

        {data.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No accomplishment data available
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
