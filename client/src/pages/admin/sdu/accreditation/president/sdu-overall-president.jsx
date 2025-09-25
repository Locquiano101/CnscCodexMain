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

export function SduOverallPresident({ onSelectOrg }) {
  const [presidentList, setPresidentList] = useState([]);
  const [filterBy, setFilterBy] = useState("all");

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
  // Step 1: Prepare department data
  const departmentCounts = presidentList.reduce((acc, p) => {
    acc[p.department] = (acc[p.department] || 0) + 1;
    return acc;
  }, {});

  const departmentData = Object.entries(departmentCounts).map(
    ([dept, count]) => ({
      department: dept,
      count,
    })
  );

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

  if (presidentList.length === 0) {
    return (
      <div className="min-h-screen  bg-gray-50 flex flex-col items-center justify-center">
        <CircleOff size={32} />
        <p className="mt-4 text-gray-600">No President Complied</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto flex flex-col gap-4 bg-gray-100 p-6">
      <h1 className="text-3xl font-bold  text-center text-gray-900 mb-2">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 ">
        {filteredPresidents.map((president) => (
          <div
            key={president._id}
            className="bg-white  rounded-lg shadow-md overflow-hidden"
            onClick={() => {
              onSelectOrg(president.organizationProfile);
            }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    {president.profilePicture ? (
                      <img
                        src={`${DOCU_API_ROUTER}/${president.organizationProfile._id}/${president.profilePicture}`}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No Image
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {president.name}
                    </h3>
                    <p className="text-sm text-gray-600">{president.course}</p>
                    <p className="text-sm text-gray-500">{president.year}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      president.overAllStatus === "Approved"
                        ? "bg-green-100 text-green-800"
                        : president.overAllStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {president.overAllStatus}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      president.organizationProfile.isActive
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {president.organizationProfile.isActive
                      ? "Active Org"
                      : "Inactive Org"}
                  </span>
                </div>
              </div>

              {/* Organization Info */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {president.organizationProfile.orgName} (
                  {president.organizationProfile.orgAcronym})
                </h4>
                <p className="text-sm text-gray-600">
                  {president.organizationProfile.orgDepartment}
                </p>
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Age: {president.age}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{president.sex}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {president.nationality}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {president.contactNo}
                  </span>
                </div>
              </div>

              {/* Address */}
              <div className="mb-4">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Present Address:
                    </p>
                    <p className="text-sm text-gray-600">
                      {president.presentAddress.fullAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {president.talentSkills && president.talentSkills.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    Skills & Talents:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {president.talentSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-md"
                      >
                        {skill.skill} ({skill.level})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Class Schedule */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  Class Schedule:
                </h5>
                <div className="space-y-2">
                  {president.classSchedule.map((schedule) => (
                    <div
                      key={schedule._id}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          {schedule.subject}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          @ {schedule.place}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {schedule.day}
                        </div>
                        <div className="text-xs text-gray-500">
                          {typeof schedule.time === "object"
                            ? `${schedule.time.start} - ${schedule.time.end}`
                            : schedule.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  Financial Support: {president.sourceOfFinancialSupport}
                </span>
                <span className="text-xs text-gray-500">
                  Updated: {new Date(president.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredPresidents.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            No presidents found for the selected filter
          </p>
        </div>
      )}
    </div>
  );
}
