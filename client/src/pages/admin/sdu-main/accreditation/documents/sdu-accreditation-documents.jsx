import axios from "axios";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  File,
  FileQuestion,
  TriangleAlert,
  Upload,
  XCircle,
  FileText,
  Users,
  Calendar,
  AlertCircle,
  Building2,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import { API_ROUTER } from "../../../../../App";

export function SduMainAccreditationDocumentOverview({ onSelectOrg }) {
  const [accreditationDocuments, setAccreditationDocuments] = useState(null);
  const [activeView, setActiveView] = useState("overview");

  const fetchAccreditationInfo = async () => {
    try {
      const { data } = await axios.get(
        `${API_ROUTER}/getAccreditatationDocuments`,
        { withCredentials: true }
      );
      console.log("Raw data:", data);
      setAccreditationDocuments(data);
    } catch (err) {
      console.error("Error fetching accreditation info:", err);
    }
  };

  useEffect(() => {
    fetchAccreditationInfo();
  }, []);

  // Process data while keeping the original structure intact
  const processData = () => {
    if (!accreditationDocuments) return [];

    return accreditationDocuments.map((item) => {
      const org = item.organizationProfile;
      const documents = [
        item.JointStatement,
        item.PledgeAgainstHazing,
        item.ConstitutionAndByLaws,
      ].filter((doc) => doc !== null);

      return {
        // Keep the entire organization profile data
        ...org,
        // Add document information
        documentsSubmitted: documents.length,
        totalDocuments: 3,
        completionRate: (documents.length / 3) * 100,
        // Keep reference to the original item if needed
        originalData: item,
      };
    });
  };

  const summaryData = processData();

  // Chart data preparations - use the actual data structure
  const documentCompletionData = summaryData.map((org) => ({
    name: org.orgAcronym,
    completed: org.documentsSubmitted,
    remaining: org.totalDocuments - org.documentsSubmitted,
    completionRate: org.completionRate,
  }));

  const statusDistribution = [
    {
      name: "Pending",
      value: summaryData.filter((org) => org.overAllStatus === "Pending")
        .length,
    },
    {
      name: "Approved",
      value: summaryData.filter((org) => org.overAllStatus === "Approved")
        .length,
    },
    {
      name: "Rejected",
      value: summaryData.filter((org) => org.overAllStatus === "Rejected")
        .length,
    },
  ];

  const orgClassDistribution = [
    {
      name: "Local",
      value: summaryData.filter((org) => org.orgClass === "Local").length,
    },
    {
      name: "System-wide",
      value: summaryData.filter((org) => org.orgClass === "System-wide").length,
    },
  ];

  const COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B"];

  const StatCard = ({ title, value, color = "blue" }) => (
    <div
      className={`bg-white p-6 rounded-lg shadow-sm border-l-4 border-${color}-500`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          SDU Accreditation Document Overview
        </h1>
        <p className="text-gray-600">
          Comprehensive overview of organization accreditation documents and
          status
        </p>
      </div>

      {/* Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveView("overview")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === "overview"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView("charts")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === "charts"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Charts
          </button>
          <button
            onClick={() => setActiveView("detailed")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === "detailed"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Detailed Table
          </button>
        </div>
      </div>

      {activeView === "overview" && (
        <div className="space-y-6">
          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Organizations"
              value={summaryData.length}
              color="blue"
            />
            <StatCard
              title="Pending Applications"
              value={
                summaryData.filter((org) => org.overAllStatus === "Pending")
                  .length
              }
              color="yellow"
            />
            <StatCard
              title="Active Organizations"
              value={summaryData.filter((org) => org.isActive).length}
              color="green"
            />
            <StatCard
              title="Avg. Completion Rate"
              value={`${
                summaryData.length > 0
                  ? Math.round(
                      summaryData.reduce(
                        (acc, org) => acc + org.completionRate,
                        0
                      ) / summaryData.length
                    )
                  : 0
              }%`}
              color="purple"
            />
          </div>

          {/* Quick Summary Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Organization Summary
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documents
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {summaryData.map((org, index) => (
                    <tr
                      onClick={() => onSelectOrg(org)}
                      key={index}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {org.orgName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {org.orgAcronym}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            org.orgClass === "Local"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {org.orgClass}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            org.overAllStatus === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : org.overAllStatus === "Approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {org.overAllStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {org.documentsSubmitted}/{org.totalDocuments}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                org.completionRate === 100
                                  ? "bg-green-500"
                                  : org.completionRate >= 50
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${org.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-500">
                            {Math.round(org.completionRate)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeView === "charts" && (
        <div className="space-y-8">
          {/* Document Completion Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Document Completion by Organization
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={documentCompletionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="completed"
                  fill="#10B981"
                  name="Completed Documents"
                />
                <Bar
                  dataKey="remaining"
                  fill="#EF4444"
                  name="Remaining Documents"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
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

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Organization Class Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={orgClassDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orgClassDistribution.map((entry, index) => (
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
          </div>

          {/* Completion Rate Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Document Completion Rate
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={documentCompletionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Completion Rate"]}
                />
                <Bar
                  dataKey="completionRate"
                  fill="#3B82F6"
                  name="Completion Rate %"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeView === "detailed" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Detailed Organization Information
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leadership
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summaryData.map((org, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {org.orgName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {org.orgAcronym} • {org.orgDepartment || "N/A"}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {org.orgCourse || "No course specified"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          org.orgClass === "Local"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {org.orgClass}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        Status:{" "}
                        <span
                          className={`font-medium ${
                            org.overAllStatus === "Pending"
                              ? "text-yellow-600"
                              : org.overAllStatus === "Approved"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {org.overAllStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        President:{" "}
                        <span className="text-gray-600">
                          {org.orgPresident ? "Assigned" : "Not Assigned"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Active:{" "}
                        <span
                          className={
                            org.isActive ? "text-green-600" : "text-red-600"
                          }
                        >
                          {org.isActive ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Adviser: {org.adviser ? "Assigned" : "Not Assigned"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center mb-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              org.completionRate === 100
                                ? "bg-green-500"
                                : org.completionRate >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${org.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {Math.round(org.completionRate)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {org.documentsSubmitted}/{org.totalDocuments} documents
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(org.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
