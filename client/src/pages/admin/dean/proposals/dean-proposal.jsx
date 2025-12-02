import axios from "axios";
import { API_ROUTER } from "../../../../App";
import { useEffect, useState } from "react";
import { Eye, MapPin, Pencil, Plus, Trash } from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { ShowDeanDetailedProposal } from "./dean-detailed-proposal";

export function DeanProposalConduct({ orgData, user }) {
  const [proposalsConduct, setProposalsConduct] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null); // for details modal
  // Wrapped multi-line pie label (ported from SDU implementation)
  const renderWrappedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.5; // position slightly inward
    let x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    // Nudge horizontally away from edge
    const horizontalNudge = 8;
    x = x + (x > cx ? -horizontalNudge : horizontalNudge);

    // Split name into at most two lines
    const maxCharsPerLine = 12;
    const cleanName = String(name);
    let line1 = cleanName;
    let line2 = "";
    if (cleanName.length > maxCharsPerLine) {
      const idx = cleanName.lastIndexOf(" ", maxCharsPerLine);
      if (idx > 0) {
        line1 = cleanName.slice(0, idx);
        line2 = cleanName.slice(idx + 1);
      } else {
        line1 = cleanName.slice(0, maxCharsPerLine);
        line2 = cleanName.slice(maxCharsPerLine);
      }
    }
    const pctText = `(${(percent * 100).toFixed(0)}%)`;
    return (
      <text x={x} y={y} fill="#374151" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={10}>
        <tspan x={x} dy={-6}>{line1}</tspan>
        {line2 && <tspan x={x} dy={12}>{line2}</tspan>}
        <tspan x={x} dy={line2 ? 12 : 12} fill="#6B7280">{pctText}</tspan>
      </text>
    );
  };
  const fetchProposedPlanConduct = async () => {
    try {
      const { data } = await axios.get(
        `${API_ROUTER}/getStudentLeaderProposalConduct/${orgData._id}`,
        { withCredentials: true }
      );
      console.log(data);
      setProposalsConduct(data);
    } catch (err) {
      console.error("Error fetching proposals conduct:", err);
    }
  };
  console.log(`${API_ROUTER}/getStudentLeaderProposalConduct/${orgData._id}`);
  useEffect(() => {
    fetchProposedPlanConduct();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved For Conduct":
        return "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200 shadow-emerald-100";
      case "Pending":
        return "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200 shadow-amber-100";
      case "Ready For Accomplishments":
        return "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 shadow-blue-100";
      default:
        return "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200 shadow-gray-100";
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);

  const formatProposedDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Chart data calculations
  const getStatusStats = () => {
    const statusCounts = {};
    proposalsConduct.forEach((item) => {
      const status = item.overallStatus;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    return statusCounts;
  };

  const getBudgetStats = () => {
    if (proposalsConduct.length === 0)
      return { total: 0, average: 0, min: 0, max: 0 };

    const budgets = proposalsConduct.map(
      (item) => item.ProposedIndividualActionPlan.budgetaryRequirements || 0
    );

    return {
      total: budgets.reduce((sum, budget) => sum + budget, 0),
      average:
        budgets.reduce((sum, budget) => sum + budget, 0) / budgets.length,
      min: Math.min(...budgets),
      max: Math.max(...budgets),
    };
  };

  const getMonthlyStats = () => {
    const monthCounts = {};
    proposalsConduct.forEach((item) => {
      const month = new Date(item.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    return monthCounts;
  };

  const statusStats = getStatusStats();
  const budgetStats = getBudgetStats();
  const monthlyStats = getMonthlyStats();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page Header */}
      <div className="h-18 border-b bg-background flex items-center justify-between px-6 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold">Proposals</h1>
          <p className="text-sm text-muted-foreground">Review and manage activity proposals</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{orgData?.orgName || "Organization"}</p>
            <p className="text-xs text-muted-foreground">{orgData?.orgAcronym || ""}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6" style={{ backgroundColor: '#F5F5F9' }}>
        <div className="flex flex-col gap-6">

      {/* Charts Section */}
      {proposalsConduct.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Distribution Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Status Distribution
            </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={Object.entries(statusStats).map(([status, count]) => ({
                      name: status === "Approved For Conduct" ? "Approved" : status,
                      value: count,
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={renderWrappedPieLabel}
                    style={{ fontSize: "10px" }}
                  >
                    {Object.entries(statusStats).map(([status], idx) => {
                      const colors = {
                        "Approved For Conduct": "#10B981", // emerald
                        Pending: "#F59E0B", // amber
                        "Ready For Accomplishments": "#3B82F6", // blue
                      };
                      return (
                        <Cell
                          key={idx}
                          fill={colors[status] || "#6B7280"} // gray fallback
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Budget Overview Bar Chart */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Budget Overview
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={[
                    { name: "Total", value: budgetStats.total },
                    { name: "Average", value: budgetStats.average },
                    { name: "Min", value: budgetStats.min },
                    { name: "Max", value: budgetStats.max },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                  <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Activity Area Chart */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Monthly Activity
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={Object.entries(monthlyStats).map(([month, count]) => ({
                    month,
                    count,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#6366F1"
                    fill="#A5B4FC"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
        </div>
      )}

      {/* Enhanced Table Container */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Proposals</h3>
        </div>

          {/* Enhanced Table */}
          <div className="flex flex-col overflow-hidden">
            <table className="">
              <thead className="">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Proposed Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Venue
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/70 overflow-auto">
                {proposalsConduct.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-lg font-medium mb-2">
                          No proposals yet
                        </p>
                        <p className="text-sm">
                          Create your first proposal to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  proposalsConduct.map((item) => (
                    <tr
                      key={item._id}
                      className="group  cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.001]"
                      onClick={() => setSelectedProposal(item)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 capitalize group-hover:text-blue-700 transition-colors">
                            {item.ProposedIndividualActionPlan.activityTitle}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatProposedDate(
                          item.ProposedIndividualActionPlan.proposedDate
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {formatCurrency(
                          item.ProposedIndividualActionPlan
                            .budgetaryRequirements
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-2" />
                          {item.ProposedIndividualActionPlan.venue}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold shadow-md ${
                            item.overallStatus === "Approved For Conduct"
                              ? "bg-emerald-100"
                              : item.overallStatus === "Pending"
                              ? "bg-amber-100"
                              : item.overallStatus ===
                                "Ready For Accomplishments"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          } `}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              item.overallStatus === "Approved For Conduct"
                                ? "bg-emerald-500"
                                : item.overallStatus === "Pending"
                                ? "bg-amber-500"
                                : item.overallStatus ===
                                  "Ready For Accomplishments"
                                ? "bg-blue-500"
                                : "bg-gray-500"
                            }`}
                          ></div>
                          {item.overallStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm flex items-center justify-between text-gray-600">
                        {formatDate(item.createdAt)}
                        <div className="flex gap-4 items-center justify-center">
                          <Eye
                            size={16}
                            className="ml-4 text-blue-600 cursor-pointer hover:scale-125"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>

      {selectedProposal && (
        <ShowDeanDetailedProposal
          proposal={selectedProposal}
          orgData={orgData}
          user={user}
          onClose={() => setSelectedProposal(null)}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          getStatusColor={getStatusColor}
        />
      )}
    </div>
  );
}
