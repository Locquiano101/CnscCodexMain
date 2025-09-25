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

export function SduRosterOverview({ onSelectOrg }) {
  const [rosters, setRosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAnalytics, setShowAnalytics] = useState(true);

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

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Revision From the Sdu Coordinator":
        return "bg-red-100 text-red-800 border-red-200";
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "Invalid date";
    }
  };

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

  const totalMembers = rosters.reduce(
    (sum, roster) => sum + (roster.members?.length || 0),
    0
  );
  const averageMembersPerOrg =
    rosters.length > 0 ? (totalMembers / rosters.length).toFixed(1) : 0;

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
    <div className="flex flex-col gap-4 overflow-auto bg-gray-300 p-4 ">
      {/* Header */}
      <div className="flex justify-between items-start ">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          SDU Roster Analytics Dashboard
        </h1>

        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
        >
          {showAnalytics ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          {showAnalytics ? "Hide" : "Show"} Analytics
        </button>
      </div>

      {/* Key Metrics */}
      <div className="flex w-full gap-4">
        <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Organizations</p>
              <p className="text-3xl font-bold text-blue-600">
                {rosters.length}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Members</p>
              <p className="text-3xl font-bold text-green-600">
                {totalMembers}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Members/Org</p>
              <p className="text-3xl font-bold text-purple-600">
                {averageMembersPerOrg}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Approved Orgs</p>
              <p className="text-3xl font-bold text-emerald-600">
                {rosters.filter((r) => r.overAllStatus === "Approved").length}
              </p>
            </div>
            <GraduationCap className="h-8 w-8 text-emerald-500" />
          </div>
        </div>
      </div>

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
      {showAnalytics && (
        <div className="flex flex-col gap-4 bg-gray-100 rounded-xl shadow-md p-4">
          <h2 className="text-2xl font-bold text-gray-900  flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics Overview
          </h2>

          <div className="flex gap-4 ">
            {/* Status Distribution Pie Chart */}
            <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
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
            <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
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

            <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
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
            <div className="bg-white flex-1 rounded-xl p-6 shadow-lg border border-gray-100">
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
      )}

      {/* Organizations List */}
      <div className="flex flex-col gap-4 bg-gray-100 rounded-xl shadow-md p-4">
        <h2 className="text-2xl font-bold text-gray-900 text-center">
          ORGANIZATION'S ROSTERS
        </h2>

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
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-2">
            {filteredRosters.map((roster) => (
              <div
                key={roster._id}
                onClick={() => onSelectOrg(roster.organizationProfile)}
                className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                {/* Organization Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {roster.organizationProfile?.orgName ||
                          "No organization name"}
                      </h2>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-lg italic rounded-full">
                          {roster.organizationProfile?.orgAcronym || "N/A"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span>
                            <strong>Class:</strong>{" "}
                            {roster.organizationProfile?.orgClass || "N/A"}
                          </span>
                        </div>
                        {roster.organizationProfile?.orgDepartment && (
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-gray-400" />
                            <span>
                              <strong>Dept:</strong>{" "}
                              {roster.organizationProfile?.orgDepartment}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          roster.isComplete
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {roster.isComplete ? "Complete" : "Incomplete"}
                      </span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex justify-between text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                    <span>
                      <strong>Created:</strong> {formatDate(roster.createdAt)}
                    </span>
                    <span>
                      <strong>Updated:</strong> {formatDate(roster.updatedAt)}
                    </span>
                  </div>
                </div>

                {/* Members Section */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      Members ({roster.members?.length || 0})
                    </h3>
                  </div>

                  {!roster.members || roster.members.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <User className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-500">No members added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {roster.members.slice(0, 3).map((member) => (
                        <div
                          key={member._id}
                          className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-100"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {member.name || "Unnamed Member"}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                member.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {member.status || "Unknown"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-gray-400" />
                              <span>{member.position || "No position"}</span>
                            </div>

                            {member.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span className="truncate text-xs">
                                  {member.email}
                                </span>
                              </div>
                            )}

                            {member.contactNumber && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span className="text-xs">
                                  {member.contactNumber}
                                </span>
                              </div>
                            )}

                            {member.address && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                <span className="text-xs">
                                  {member.address}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {roster.members.length > 3 && (
                        <div className="text-center py-2">
                          <span className="text-sm text-gray-500">
                            +{roster.members.length - 3} more members
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
