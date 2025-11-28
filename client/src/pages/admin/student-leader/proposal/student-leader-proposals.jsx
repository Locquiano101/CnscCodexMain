import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
import { useEffect, useState } from "react";
import { MapPin, Pencil, Plus, Trash, FileText } from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
    console.log("useEffect triggered", orgData);
    if (orgData?._id) {
      fetchApprovedProposedActionPlanData();
      fetchProposedPlanConduct();
    }
  }, [orgData]);

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
    <div className="flex flex-col h-full w-full overflow-auto p-6 space-y-6" style={{ backgroundColor: '#F5F5F9' }}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Proposals</CardTitle>
            <Button onClick={() => setShowAddFormChoice(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Proposal
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Charts Section */}
      {proposalsConduct.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Budget Overview Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Budget Overview</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Monthly Activity Area Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Activity</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* Proposals Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Proposed Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Venue
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {proposalsConduct.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-medium mb-2">
                          No proposals yet
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Create your first proposal to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  proposalsConduct.map((item, index) => (
                    <tr
                      key={item._id}
                      className="hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedProposal(item)}
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium capitalize">
                          {item.ProposedIndividualActionPlan.activityTitle}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatProposedDate(
                          item.ProposedIndividualActionPlan.proposedDate
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {formatCurrency(
                          item.ProposedIndividualActionPlan
                            .budgetaryRequirements
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground capitalize">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          {item.ProposedIndividualActionPlan.venue}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            item.overallStatus === "Approved For Conduct"
                              ? "approved"
                              : item.overallStatus === "Pending"
                              ? "pending"
                              : item.overallStatus === "Ready For Accomplishments"
                              ? "secondary"
                              : "default"
                          }
                          className="text-white whitespace-nowrap"
                        >
                          {item.overallStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>{formatDate(item.createdAt)}</span>
                          <div className="flex gap-3">
                            <Pencil
                              size={16}
                              className="text-yellow-600 cursor-pointer hover:scale-125 transition-transform"
                              onClick={(e) => {
                                e.stopPropagation(); // prevent row click
                                setProposalToEdit(item); // open edit modal separately
                              }}
                            />
                            <Trash
                              size={16}
                              className="text-red-600 cursor-pointer hover:scale-125 transition-transform"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item._id);
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Choose Proposal Type</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <Button
            onClick={() => onSelect("occurring")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Occurring Proposal
          </Button>
          <Button
            onClick={() => onSelect("new")}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            New Proposal
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
