import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { API_ROUTER } from "../../../../App";

import {
  Users,
  UserCheck,
  GraduationCap,
  Building,
  TrendingUp,
  Calendar,
  Mail,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  X,
  Save,
  User,
} from "lucide-react";
import { AddUserModal } from "./sdu-user-management-add";
import { EditUserModal } from "./sdu-user-management-edit";

export function SduUserManagement() {
  const [users, setUsers] = useState([]);
  const [organization, setOrganization] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [addUserModal, setAddUserModal] = useState(false);
  const [editUserModal, setEditUserModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const getAlluser = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_ROUTER}/getallUser`);
      console.log(res.data);
      setUsers(res.data.users);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const getAllOrganization = async () => {
    try {
      const res = await axios.get(`${API_ROUTER}/getAllOrganizationProfile`);
      console.log(res.data);
      setOrganization(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Log form data changes
  const logFormData = useCallback((action, data) => {
    console.log(`[${new Date().toISOString()}] ${action}:`, data);
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      logFormData("Deleting User", { userId });
      const res = await axios.delete(`${API_ROUTER}/deleteUser/${userId}`);

      if (res.data.success) {
        setUsers((prev) => prev.filter((user) => user._id !== userId));
        logFormData("User Deleted Successfully", { userId });
        alert("User deleted successfully!");
      }
    } catch (error) {
      console.error(error);
      logFormData("Delete User Error", error.response?.data || error.message);
      alert(error.response?.data?.message || "Error deleting user");
    } finally {
      getAlluser();
    }
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setEditUserModal(true);
    logFormData("Opening Edit Modal", user);
  };

  useEffect(() => {
    getAlluser();
    getAllOrganization();
  }, []);

  // Analytics calculations
  const analytics = React.useMemo(() => {
    const totalUsers = users.length;
    const positions = users.reduce((acc, user) => {
      const position = user.position.toLowerCase();
      acc[position] = (acc[position] || 0) + 1;
      return acc;
    }, {});

    const deliveryUnits = users.reduce((acc, user) => {
      if (user.deliveryUnit) {
        acc[user.deliveryUnit] = (acc[user.deliveryUnit] || 0) + 1;
      }
      return acc;
    }, {});

    const recentUsers = users.filter((user) => {
      const createdDate = new Date(user.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate >= thirtyDaysAgo;
    }).length;

    return {
      totalUsers,
      positions,
      deliveryUnits,
      recentUsers,
      positionDistribution: Object.entries(positions).map(([key, value]) => ({
        position: key,
        count: value,
        percentage: ((value / totalUsers) * 100).toFixed(1),
      })),
    };
  }, [users]);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition =
      selectedPosition === "all" ||
      user.position.toLowerCase() === selectedPosition.toLowerCase();
    return matchesSearch && matchesPosition;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPositionColor = (position) => {
    const colors = {
      dean: "bg-purple-100 text-purple-800",
      adviser: "bg-blue-100 text-blue-800",
      sdu: "bg-green-100 text-green-800",
      "student-leader": "bg-orange-100 text-orange-800",
    };
    return colors[position.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-200">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="w-8 h-8 text-cnsc-primary-color" />
          SDU User Management
        </h1>
      </div>
      <div className="grid  grid-cols-3 w-full gap-4 mb-4">
        {/* Analytics Cards */}
        <div className="grid grid-cols-2 h-full gap-4">
          <div className="bg-white shadow-md rounded-xl  p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-xl  p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Recent Users
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.recentUsers}
                </p>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-xl  p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Positions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(analytics.positions).length}
                </p>
                <p className="text-xs text-gray-500">Unique roles</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-xl  p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Delivery Units
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(analytics.deliveryUnits).length}
                </p>
                <p className="text-xs text-gray-500">Active units</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Position Distribution Chart */}
        <div className="h-full w-full col-span-2 bg-white shadow-md rounded-xl  p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Position Distribution
          </h3>
          <div className="space-y-4">
            {analytics.positionDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getPositionColor(
                      item.position
                    )}`}
                  >
                    {item.position === "sdu" ? "SDU" : item.position}
                  </div>
                  <span className="text-gray-600">{item.count} users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow-md rounded-xl  p-6 border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Positions</option>
                {Object.keys(analytics.positions).map((position) => (
                  <option
                    key={position}
                    value={position}
                    className="capitalize"
                  >
                    {position === "sdu" ? "SDU" : position}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={() => setAddUserModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-md rounded-xl  border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Users ({filteredUsers.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white shadow-md divide-y -200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || "No Name"}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getPositionColor(
                        user.position
                      )}`}
                    >
                      {user.position.toLowerCase() === "sdu"
                        ? "SDU"
                        : user.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No users found matching your criteria</p>
        </div>
      )}
      {addUserModal && (
        <AddUserModal
          organization={organization}
          onClose={() => setAddUserModal(false)}
          onUserAdded={() => getAlluser()}
        />
      )}
      {editUserModal && (
        <EditUserModal
          user={currentUser}
          organization={organization}
          onClose={() => setEditUserModal(false)}
          onUserAdded={() => getAlluser()}
        />
      )}
    </div>
  );
}
