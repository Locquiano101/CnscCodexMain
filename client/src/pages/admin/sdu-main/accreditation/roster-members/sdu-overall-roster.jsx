import { useState, useEffect } from "react";
import axios from "axios";

import {
  Users,
  User,
  Mail,
  MapPin,
  Phone,
  Calendar,
  Building2,
  GraduationCap,
  TrendingUp,
  BarChart3,
  PieChart,
  Filter,
  Search,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  Pie,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

import { API_ROUTER } from "../../../../../App";

export function SduMainRosterOverview({ onSelectOrg }) {
  const [rosters, setRosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getAllRosterApi = async () => {
    try {
      const res = await axios.get(`${API_ROUTER}/getAllRoster`);
      console.log("API Response:", res.data);

      // Check if data is in res.data or res.data.data
      const rosterData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      setRosters(rosterData);
    } catch (err) {
      console.error("Error fetching roster:", err);
      setRosters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllRosterApi();
  }, []);

  // Analytics data preparation
  const analyticsData = {
    statusDistribution: [
      {
        name: "Pending",
        value: rosters.filter((r) => r.overAllStatus === "Pending").length,
        color: "#FCD34D",
      },
      {
        name: "Approved",
        value: rosters.filter((r) => r.overAllStatus === "Approved").length,
        color: "#10B981",
      },
      {
        name: "Under Revision",
        value: rosters.filter(
          (r) => r.overAllStatus === "Revision From the Sdu Coordinator"
        ).length,
        color: "#EF4444",
      },
    ],
    completionStats: [
      {
        name: "Complete",
        value: rosters.filter((r) => r.isComplete).length,
        color: "#10B981",
      },
      {
        name: "Incomplete",
        value: rosters.filter((r) => !r.isComplete).length,
        color: "#F59E0B",
      },
    ],
    departmentDistribution: rosters.reduce((acc, roster) => {
      const dept = roster.organizationProfile?.orgDepartment || "Unknown";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {}),
    membersByOrg: rosters.map((roster) => ({
      name: roster.organizationProfile?.orgAcronym || "Unknown",
      members: roster.members?.length || 0,
      status: roster.overAllStatus,
    })),
    monthlyGrowth: [
      { month: "Aug", organizations: 8, members: 45 },
      {
        month: "Sep",
        organizations: rosters.length,
        members: rosters.reduce((sum, r) => sum + (r.members?.length || 0), 0),
      },
      {
        month: "Oct",
        organizations: rosters.length + 2,
        members:
          rosters.reduce((sum, r) => sum + (r.members?.length || 0), 0) + 15,
      },
    ],
  };

  const departmentData = Object.entries(
    analyticsData.departmentDistribution
  ).map(([dept, count]) => ({
    department: dept.replace("College of ", ""),
    count,
  }));

  const filteredRosters = rosters.filter((roster) => {
    const matchesSearch =
      roster.organizationProfile?.orgName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      roster.organizationProfile?.orgAcronym
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || roster.overAllStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-auto p-4 pt-0 ">
      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-lg  border-gray-100 ">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Revision From the Sdu Coordinator">
                Under Revision
              </option>
            </select>
          </div>
        </div>
      </div>
      {/* Analytics Section */}
      <div className="flex flex-col gap-4 p-6 bg-white rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900  flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Analytics Overview
        </h2>

        <div className="flex gap-4">
          {/* Status Distribution Pie Chart */}
          <div className="flex-1 rounded-xl p-6  border border-gray-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={analyticsData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analyticsData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Department Distribution */}
          <div className="flex-1 rounded-xl p-6  border border-gray-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Organizations by Department
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="department"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 rounded-xl p-6  border border-gray-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Members by Organization
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData.membersByOrg}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="members" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Growth Trend */}
          <div className="flex-1 rounded-xl p-6  border border-gray-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Growth Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analyticsData.monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="organizations"
                  stackId="1"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.6}
                  name="Organizations"
                />
                <Area
                  type="monotone"
                  dataKey="members"
                  stackId="2"
                  stroke="#06B6D4"
                  fill="#06B6D4"
                  fillOpacity={0.6}
                  name="Members"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Organizations List */}
      <div className="p-6 bg-white rounded-xl shadow-xl">
        <div className="flex items-center mb-6">
          <Users size={32} className="mr-2 text-cnsc-primary" />
          <h2 className="text-2xl font-bold text-gray-900">
            Organizations Rosters
          </h2>
        </div>

        {filteredRosters.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No organizations found
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No organization rosters are currently available."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full border-collapse">
              <thead className="bg-cnsc-primary text-cnsc-white text-sm uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Organization</th>
                  <th className="px-4 py-3 text-left">Acronym</th>
                  <th className="px-4 py-3 text-left">Class</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Total Members</th>
                  <th className="px-4 py-3 text-center">Active</th>
                  <th className="px-4 py-3 text-center">Inactive</th>
                  <th className="px-4 py-3 text-center">Unique Positions</th>
                </tr>
              </thead>

              <tbody className="text-sm text-gray-800 divide-y divide-gray-100">
                {filteredRosters.map((roster) => {
                  const profile = roster.organizationProfile || {};
                  const members = roster.members || [];

                  const totalMembers = members.length;
                  const activeMembers = members.filter(
                    (m) => m.status === "Active"
                  ).length;
                  const inactiveMembers = totalMembers - activeMembers;
                  const uniquePositions = new Set(
                    members.map((m) => m.position)
                  ).size;

                  return (
                    <tr
                      key={roster._id}
                      onClick={() => onSelectOrg(roster.organizationProfile)}
                      className="hover:bg-cnsc-primary/5 transition cursor-pointer"
                    >
                      <td className="px-4 py-3 font-semibold flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-cnsc-primary" />
                        {profile.orgName || "No organization name"}
                      </td>
                      <td className="px-4 py-3">
                        {profile.orgAcronym || "N/A"}
                      </td>
                      <td className="px-4 py-3">{profile.orgClass || "N/A"}</td>
                      <td className="px-4 py-3">
                        {profile.orgDepartment || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            roster.isComplete
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {roster.isComplete ? "Complete" : "Incomplete"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center font-bold text-blue-600">
                        {totalMembers}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-green-600">
                        {activeMembers}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-gray-600">
                        {inactiveMembers}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-amber-600">
                        {uniquePositions}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
