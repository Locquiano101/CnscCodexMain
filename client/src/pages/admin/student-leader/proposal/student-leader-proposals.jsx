import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
import { useEffect, useState } from "react";
import { MapPin, Pencil, Plus, Trash } from "lucide-react";

import { AddProposal } from "./student-leader-add-proposal";
import { AddNewProposal } from "./student-leader-add-new-proposal";
import { ShowDetailedProposal } from "./student-leader-detailed-proposal";
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
import { EditProposal } from "./student-leader-edit-proposal";

export function StudentLeaderProposal({ orgData }) {
  const [proposals, setProposals] = useState([]);
  const [proposalsConduct, setProposalsConduct] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null); // for details modal
  const [proposalToEdit, setProposalToEdit] = useState(null); // for edit modal
  const [showAddFormChoice, setShowAddFormChoice] = useState(false);
  const [selectedAddType, setSelectedAddType] = useState(null);

  const fetchApprovedProposedActionPlanData = async () => {
    try {
      const { data } = await axios.get(
        `${API_ROUTER}/getApprovedPPA/${orgData._id}`,
        { withCredentials: true }
      );
      console.log(data);
      setProposals(data);
    } catch (err) {
      console.error("Error fetching proposals:", err);
    }
  };

  const fetchProposedPlanConduct = async () => {
    try {
      const { data } = await axios.get(
        `${API_ROUTER}/getStudentLeaderProposalConduct/${orgData._id}`,
        { withCredentials: true }
      );
      setProposalsConduct(data);
    } catch (err) {
      console.error("Error fetching proposals conduct:", err);
    }
  };

  useEffect(() => {
    fetchApprovedProposedActionPlanData();
    fetchProposedPlanConduct();
  }, []);

  const handleAddLog = () => {
    fetchApprovedProposedActionPlanData();
  };

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

  // --- API Helpers --- //

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this?");

    if (!confirmed) return;

    try {
      await axios.delete(`${API_ROUTER}/deleteProposalConduct/${id}`, {
        withCredentials: true,
      });
      return true;
    } catch (err) {
      console.error("Error deleting proposal conduct:", err);
      return false;
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-auto bg-gray-200">
      {/* Enhanced Header with maroon gradient */}
      <div className="relative p-4 bg-slate-200">
        <div className="relative flex justify-between items-center">
          <h1 className="text-2xl font-bold drop-shadow-lg">
            Student Leader Proposals
          </h1>
          <button
            onClick={() => setShowAddFormChoice(true)}
            className="group relative bg-amber-500 px-6 py-2 rounded-xl flex items-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-amber-400 hover:border-amber-300"
          >
            <Plus
              size={22}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
            <span className="font-semibold">Add Proposal</span>
          </button>
        </div>
      </div>

      {/* Charts Section */}
      {proposalsConduct.length > 0 && (
        <div className="px-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Distribution Pie Chart */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={Object.entries(statusStats).map(
                      ([status, count]) => ({
                        name: status,
                        value: count,
                      })
                    )}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
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
        </div>
      )}

      {/* Enhanced Table Container */}
      <div className="flex-1 flex flex-col px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200/70">
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
                  proposalsConduct.map((item, index) => (
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
                          <Pencil
                            size={16}
                            className="text-yellow-600 cursor-pointer hover:scale-125"
                            onClick={(e) => {
                              e.stopPropagation(); // prevent row click
                              setProposalToEdit(item); // open edit modal separately
                            }}
                          />

                          <Trash
                            size={16}
                            className="text-red-600 cursor-pointer transition-transform duration-500 hover:scale-130"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item._id);
                            }}
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

      {showAddFormChoice && (
        <ProposalChoiceModal
          onClose={() => setShowAddFormChoice(false)}
          onSelect={(choice) => {
            setSelectedAddType(choice);
            setShowAddFormChoice(false);
          }}
        />
      )}

      {selectedAddType === "occurring" && (
        <AddProposal
          proposals={proposals}
          onClose={() => setSelectedAddType(null)}
          onAddLog={handleAddLog}
        />
      )}

      {selectedAddType === "new" && (
        <AddNewProposal
          onClose={() => setSelectedAddType(null)}
          orgData={orgData}
          onAddLog={handleAddLog}
        />
      )}

      {selectedProposal && (
        <ShowDetailedProposal
          proposal={selectedProposal}
          onClose={() => setSelectedProposal(null)}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          getStatusColor={getStatusColor}
        />
      )}

      {proposalToEdit && (
        <EditProposal
          proposal={proposalToEdit}
          onClose={() => setProposalToEdit(null)}
          onUpdated={fetchProposedPlanConduct}
        />
      )}
    </div>
  );
}

function ProposalChoiceModal({ onClose, onSelect }) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-80 text-center">
        <h2 className="text-lg font-bold mb-4">Choose Proposal Type</h2>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onSelect("occurring")}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Occurring Proposal
          </button>
          <button
            onClick={() => onSelect("new")}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
          >
            New Proposal
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
