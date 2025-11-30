import { useEffect, useState } from "react";
import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../../App";
import {
  Users,
  Calendar,
  MapPin,
  Phone,
  Award,
  BarChart3,
  UserMinus,
  CircleSlash,
  CircleOff,
  UserX,
  Bell,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export function SduMainOverallPresident({ onSelectOrg }) {
  const [presidentList, setPresidentList] = useState([]);
  const [filterBy, setFilterBy] = useState("all");

  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const fetchPresident = async () => {
      try {
        const res = await axios.get(`${API_ROUTER}/getPresidents`);

        console.log(res.data);
        setPresidentList(res.data);
      } catch (error) {
        console.error("Failed to fetch president data", error);
      }
    };

    fetchPresident();
  }, []);

  // Filter presidents based on selected filter
  const filteredPresidents = presidentList.filter((president) => {
    switch (filterBy) {
      case "approved":
        return president.overAllStatus === "Approved";
      case "pending":
        return president.overAllStatus === "Pending";
      case "rejected":
        return president.overAllStatus === "Rejected";
      case "active_org":
        return president.organizationProfile.isActive;
      case "inactive_org":
        return !president.organizationProfile.isActive;
      default:
        return true; // "all"
    }
  });

  // Chart data calculations
  const statusData = presidentList.reduce((acc, president) => {
    const status = president.overAllStatus;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusData).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const yearData = presidentList.reduce((acc, president) => {
    const year = president.year;
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(yearData).map(([year, count]) => ({
    year,
    count,
  }));
  // Helper function to convert department names to acronyms
  const getDepartmentAcronym = (department) => {
    const acronyms = {
      "College of Education": "COE",
      "College of Engineering": "COEng",
      "College of Arts and Sciences": "CAS",
      "College of Business": "COB",
      "College of Technology": "COT",
      "College of Agriculture": "COA",
      "College of Nursing": "CON",
      "College of Medicine": "COM",
    };
    return acronyms[department] || department;
  };

  // Step 1: Prepare department data
  const departmentCounts = presidentList.reduce((acc, p) => {
    acc[p.department] = (acc[p.department] || 0) + 1;
    return acc;
  }, {});

  const departmentData = Object.entries(departmentCounts).map(
    ([dept, count]) => ({
      department: getDepartmentAcronym(dept),
      count,
    })
  );

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

  const handleNotifyAll = async () => {
    try {
      // Show the notification popup (like a "Sending..." message)
      setShowNotification({
        visible: true,
        message: "Sending notifications...",
      });

      // 📨 Send POST request to backend
      const res = await axios.post(API_ROUTER);

      console.log("✅ Notification Sent:", res.data.message);

      // ✅ Show success message in your popup
      setShowNotification({
        visible: true,
        message: res.data.message || "Notifications sent successfully!",
      });
    } catch (error) {
      console.error("❌ Error sending notifications:", error);

      // ❌ Show error message in your popup
      setShowNotification({
        visible: true,
        message:
          error.response?.data?.message || "Failed to send notifications.",
      });
    } finally {
      // Hide the notification popup after 3 seconds
      setTimeout(
        () => setShowNotification({ visible: false, message: "" }),
        3000
      );
    }
  };

  if (presidentList.length === 0) {
    return (
      <div className="h-full p-12 bg-gray-50 flex flex-col items-center justify-center">
        <div
          onClick={handleNotifyAll}
          className="h-full w-full border border-dashed border-gray-400 hover:border-cnsc-primary-color hover:bg-amber-300/20 transition duration-300 cursor-pointer flex flex-col justify-center items-center rounded-xl"
        >
          <Bell size={32} className="text-cnsc-primary-color mt-4" />
          <p className="text-gray-600 text-lg font-mdium">No President Found</p>
          <p className="text-sm text-gray-500 mt-1">
            Click to notify all organizations
          </p>
        </div>

        {/* 🔔 Floating notification toast */}
        {showNotification.visible && (
          <div className="fixed top-4 right-4 bg-white border shadow-lg rounded-lg p-4 z-50 transition-all">
            <p className="text-gray-800 font-medium">
              {showNotification.message}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className=" overflow-auto flex flex-col gap-4 bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Student Development Unit President Overview
      </h1>

      <div className="flex w-full justify-between gap-4">
        <div className="bg-white rounded-2xl w-full flex items-center shadow-md p-4">
          <Users className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              Total Presidents
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {presidentList.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl w-full flex items-center shadow-md p-4">
          <Award className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              Active Organizations
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {
                presidentList.filter((p) => p.organizationProfile.isActive)
                  .length
              }
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl w-full flex items-center shadow-md p-4">
          <Calendar className="h-8 w-8 text-orange-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-gray-900">
              {
                presidentList.filter((p) => p.overAllStatus === "Pending")
                  .length
              }
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl w-full flex items-center shadow-md p-4">
          {" "}
          <BarChart3 className="h-8 w-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-gray-900">
              {
                presidentList.filter((p) => p.overAllStatus === "Approved")
                  .length
              }
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 w-full">
        <div className="w-full bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Year Level Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
          {" "}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Department Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="department"
                className="text-xs"
                interval={0}
                textAnchor="end"
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
          {" "}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((entry, index) => (
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

      <div className="flex justify-between  ">
        <h1 className="text-3xl font-bold  text-center text-gray-900 ">
          PRESIDENTS
        </h1>

        {/* Filter Dropdown */}
        <div className="flex justify-center ">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Presidents ({presidentList.length})</option>
            <option value="approved">
              Approved (
              {
                presidentList.filter((p) => p.overAllStatus === "Approved")
                  .length
              }
              )
            </option>
            <option value="pending">
              Pending (
              {
                presidentList.filter((p) => p.overAllStatus === "Pending")
                  .length
              }
              )
            </option>
            <option value="rejected">
              Rejected (
              {
                presidentList.filter((p) => p.overAllStatus === "Rejected")
                  .length
              }
              )
            </option>
            <option value="active_org">
              Active Organizations (
              {
                presidentList.filter((p) => p.organizationProfile.isActive)
                  .length
              }
              )
            </option>
            <option value="inactive_org">
              Inactive Organizations (
              {
                presidentList.filter((p) => !p.organizationProfile.isActive)
                  .length
              }
              )
            </option>
          </select>
        </div>
      </div>

      {/* President Cards */}
      {/* Presidents Table */}
      {filteredPresidents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Presidents Found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full border-collapse">
            <thead className="bg-cnsc-primary text-cnsc-white text-sm uppercase">
              <tr>
                <th className="px-4 py-3 text-left">President</th>
                <th className="px-4 py-3 text-left">Course / Year</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Organization</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Org Activity</th>
                <th className="px-4 py-3 text-center">Updated</th>
              </tr>
            </thead>

            <tbody className="text-sm text-gray-800 divide-y divide-gray-100">
              {filteredPresidents.map((president) => {
                const org = president.organizationProfile || {};

                return (
                  <tr
                    key={president._id}
                    onClick={() => onSelectOrg(org)}
                    className="hover:bg-cnsc-primary/5 transition cursor-pointer"
                  >
                    {/* President Info */}
                    <td className="px-4 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                        {president.profilePicture ? (
                          <img
                            src={`${DOCU_API_ROUTER}/${org._id}/${president.profilePicture}`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-xs text-gray-500">
                            N/A
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {president.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Age: {president.age} • {president.sex}
                        </p>
                      </div>
                    </td>

                    {/* Course / Year */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700">
                          {president.course || "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {president.year || "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm">{president.contactNo}</span>
                        <span className="text-xs text-gray-500">
                          {president.nationality}
                        </span>
                      </div>
                    </td>

                    {/* Organization */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">
                        {org.orgName || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {org.orgAcronym ? `(${org.orgAcronym})` : ""}
                      </p>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3">{org.orgDepartment || "N/A"}</td>

                    {/* President Status */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          president.overAllStatus === "Approved"
                            ? "bg-green-100 text-green-800"
                            : president.overAllStatus === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {president.overAllStatus}
                      </span>
                    </td>

                    {/* Active Org */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          org.isActive
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {org.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Updated Date */}
                    <td className="px-4 py-3 text-center text-gray-500">
                      {new Date(president.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredPresidents.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">
            No presidents found for the selected filter
          </p>
        </div>
      )}
    </div>
  );
}
