import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../../App";
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
  Area,
  AreaChart,
} from "recharts";
import {
  Icon,
  Download,
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Calendar,
  X,
  Users,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

export function SduAccreditationOverview() {
  const [activeOrganization, setActiveOrganization] = useState([]);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_ROUTER}/getAllAccreditationId/`);
      console.log(res.data);
      setActiveOrganization(res.data);
    } catch (error) {
      console.error("Failed to fetch accreditation data", error);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Data processing functions
  const processStatusData = () => {
    const statusCounts = activeOrganization.reduce((acc, org) => {
      const status = org.overallStatus || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: ((count / activeOrganization.length) * 100).toFixed(1),
    }));
  };

  const processDepartmentData = () => {
    const deptCounts = activeOrganization.reduce((acc, org) => {
      const dept =
        org.organizationProfile?.orgDepartment || "Unknown Department";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(deptCounts).map(([department, count]) => ({
      department:
        department.length > 20
          ? department.substring(0, 20) + "..."
          : department,
      fullDepartment: department,
      count,
    }));
  };

  const processOrgClassData = () => {
    const classCounts = activeOrganization.reduce((acc, org) => {
      const orgClass = org.organizationProfile?.orgClass || "Unknown";
      acc[orgClass] = (acc[orgClass] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(classCounts).map(([className, count]) => ({
      className,
      count,
    }));
  };

  const processDocumentCompletionData = () => {
    return activeOrganization.map((org) => {
      const orgName =
        org.organizationProfile?.orgAcronym ||
        org.organizationProfile?.orgName ||
        "Unknown";
      let completedDocs = 0;
      const totalDocs = 5; // JointStatement, PledgeAgainstHazing, ConstitutionAndByLaws, Roster, PresidentProfile

      if (org.JointStatement && org.JointStatement.status === "Approved")
        completedDocs++;
      if (
        org.PledgeAgainstHazing &&
        org.PledgeAgainstHazing.status === "Approved"
      )
        completedDocs++;
      if (
        org.ConstitutionAndByLaws &&
        org.ConstitutionAndByLaws.status === "Approved"
      )
        completedDocs++;
      if (org.Roster && org.Roster.overAllStatus === "Approved")
        completedDocs++;
      if (
        org.PresidentProfile &&
        org.PresidentProfile.overAllStatus === "Approved"
      )
        completedDocs++;

      return {
        orgName:
          orgName.length > 10 ? orgName.substring(0, 10) + "..." : orgName,
        fullOrgName: orgName,
        completed: completedDocs,
        total: totalDocs,
        percentage: ((completedDocs / totalDocs) * 100).toFixed(1),
      };
    });
  };

  const processTimelineData = () => {
    return activeOrganization
      .map((org) => {
        const createdDate = new Date(
          org.organizationProfile?.createdAt || org.createdAt
        );
        return {
          month: createdDate.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          registrations: 1,
          date: createdDate,
        };
      })
      .reduce((acc, item) => {
        const existing = acc.find((entry) => entry.month === item.month);
        if (existing) {
          existing.registrations++;
        } else {
          acc.push(item);
        }
        return acc;
      }, [])
      .sort((a, b) => a.date - b.date);
  };

  // Chart data
  const statusData = processStatusData();
  const departmentData = processDepartmentData();
  const orgClassData = processOrgClassData();
  const documentCompletionData = processDocumentCompletionData();
  const timelineData = processTimelineData();
  const dropdownRef = useRef(null);

  const [manageAccreditation, setManageAccreditation] = useState(false);

  return (
    <div className="flex flex-col gap-6 p-6 pt-0 overflow-auto">
      {/* Header */}
      <div className="flex justify-between text-cnsc-primary-color bg-white p-6 rounded-2xl shadow-md">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            SDU Accreditation Analytics Dashboard
          </h1>
        </div>

        <div className="relative inline-block text-left" ref={dropdownRef}>
          <button
            onClick={() => setManageAccreditation((prev) => !prev)}
            className={`px-4 py-2 bg-cnsc-primary-color w-48 text-white transition-colors hover:bg-cnsc-primary-color-dark ${
              manageAccreditation ? "rounded-t-lg" : "rounded-lg"
            }`}
          >
            Manage Accreditation
          </button>

          {manageAccreditation && (
            <div className="absolute right-0 w-48 bg-white border rounded-b-lg shadow-lg z-10">
              <button
                onClick={() => console.log("approve")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
              >
                Approve
              </button>
              <button
                onClick={() => console.log("notes")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
              >
                Revision Notes
              </button>
              <button
                onClick={() => console.log("history")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
              >
                View Previous Presidents
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Organizations</p>
              <p className="text-3xl font-bold text-cnsc-primary-color">
                {activeOrganization.length}
              </p>
            </div>
            <Users className="w-10 h-10 text-cnsc-primary-color" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active</p>
              <p className="text-3xl font-bold text-cnsc-primary-color">
                {
                  activeOrganization.filter(
                    (org) => org.organizationProfile?.isActive
                  ).length
                }
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-cnsc-primary-color" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-3xl font-bold text-amber-600">
                {
                  activeOrganization.filter(
                    (org) => org.overallStatus === "Pending"
                  ).length
                }
              </p>
            </div>
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completion Rate</p>
              <p className="text-3xl font-bold text-cnsc-primary-color">
                {(
                  (activeOrganization.filter(
                    (org) => org.overallStatus === "Approved"
                  ).length /
                    activeOrganization.length) *
                  100
                ).toFixed(0)}
                %
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-cnsc-primary-color" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="40%" // move pie up a bit so legend has space
                labelLine={false}
                outerRadius={80}
                dataKey="count"
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index % 2 === 0 ? "#500000" : "#f59e0b"} // maroon & amber
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                verticalAlign="bottom"
                align="center"
                layout="horizontal"
                formatter={(value, entry, index) => {
                  const percentage = (
                    (statusData[index].count /
                      statusData.reduce((sum, d) => sum + d.count, 0)) *
                    100
                  ).toFixed(1);
                  return `${value}: ${percentage}%`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 col-span-2 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4">Organization Classes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orgClassData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="className" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill=" #500000" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg md:col-span-2">
          <h3 className="text-xl font-bold mb-4">Document Completion Status</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={documentCompletionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="orgName" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  value,
                  name === "completed"
                    ? "Completed Documents"
                    : "Total Documents",
                ]}
                labelFormatter={(label) => {
                  const org = documentCompletionData.find(
                    (item) => item.orgName === label
                  );
                  return org ? org.fullOrgName : label;
                }}
              />
              <Legend />
              <Bar dataKey="completed" fill="#500000" name="Completed" />
              <Bar dataKey="total" fill="#fbbf24" name="Total Required" />{" "}
              {/* amber-400 */}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6  col-span-5 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4">Registration Timeline</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="registrations"
                stroke="var(--cnsc-primary-color)"
                fill="#fbbf24" // amber for area fill
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
