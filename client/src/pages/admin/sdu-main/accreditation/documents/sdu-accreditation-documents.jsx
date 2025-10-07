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

  const processData = () => {
    if (!accreditationDocuments) return [];

    // 🔍 Filter out entries with missing organizationProfile or orgName
    const validDocs = accreditationDocuments.filter(
      (item) =>
        item.organizationProfile &&
        item.organizationProfile.orgName &&
        item.organizationProfile.orgName.trim() !== ""
    );

    // 🧩 Map only valid organizations
    return validDocs.map((item) => {
      const org = item.organizationProfile;
      const documents = [
        item.JointStatement,
        item.PledgeAgainstHazing,
        item.ConstitutionAndByLaws,
      ].filter((doc) => doc !== null);

      return {
        ...org,
        documentsSubmitted: documents.length,
        totalDocuments: 3,
        completionRate: (documents.length / 3) * 100,
        originalData: item,
      };
    });
  };

  const summaryData = processData();

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

  return (
    <div className="p-4 pt-0 flex flex-col gap-4 overflow-auto">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 ">
        SDU Accreditation Document Overview
      </h1>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ">
        <StatCard
          title="Total Organizations"
          value={summaryData.length}
          color="blue"
        />
        <StatCard
          title="Pending Applications"
          value={
            summaryData.filter((org) => org.overAllStatus === "Pending").length
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
            Organization Accreditation Document Summary
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
  );
}
