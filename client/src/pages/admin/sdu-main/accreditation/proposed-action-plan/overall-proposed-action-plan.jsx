import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../../App";

import React, { useState, useEffect } from "react";
import {
  FileText,
  School,
  ChevronRight,
  Calendar,
  DollarSign,
  MapPin,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
} from "lucide-react";
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
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export function SduMainOverallProposedActioPlan({ onSelectOrg }) {
  const [proposals, setProposals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        // Simulating API call - replace with your actual API call
        const response = await axios.get(
          `${API_ROUTER}/getAllProposedActionPlan`
        );
        // setProposals(response.data);

        // Using mock data for demonstration
        console.log(response.data);
        setProposals(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch proposals:", err);
        if (err.status === 404 || err.response?.status === 404) {
          setProposals([]);
        } else {
          setError("Failed to load proposals");
        }
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate statistics
  const getStatistics = () => {
    const totalProposals = proposals.length;
    const activeOrgs = proposals.filter((p) => p.isActive).length;
    const totalPlans = proposals.reduce(
      (sum, p) => sum + p.ProposedIndividualActionPlan.length,
      0
    );
    const approvedPlans = proposals.reduce(
      (sum, p) =>
        sum +
        p.ProposedIndividualActionPlan.filter(
          (plan) => plan.overallStatus === "Approved"
        ).length,
      0
    );
    const pendingPlans = proposals.reduce(
      (sum, p) =>
        sum +
        p.ProposedIndividualActionPlan.filter(
          (plan) => plan.overallStatus === "Pending"
        ).length,
      0
    );
    const rejectedPlans = proposals.reduce(
      (sum, p) =>
        sum +
        p.ProposedIndividualActionPlan.filter(
          (plan) => plan.overallStatus === "Rejected"
        ).length,
      0
    );
    const totalBudget = proposals.reduce(
      (sum, p) =>
        sum +
        p.ProposedIndividualActionPlan.reduce(
          (planSum, plan) => planSum + plan.budgetaryRequirements,
          0
        ),
      0
    );

    return {
      totalProposals,
      activeOrgs,
      totalPlans,
      approvedPlans,
      pendingPlans,
      rejectedPlans,
      totalBudget,
    };
  };

  const stats = proposals.length > 0 ? getStatistics() : null;

  const sdgCount = {};
  proposals.forEach((p) => {
    p.ProposedIndividualActionPlan.forEach((plan) => {
      plan.alignedSDG?.forEach((sdg) => {
        sdgCount[sdg] = (sdgCount[sdg] || 0) + 1;
      });
    });
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
        dot: "bg-yellow-500",
      },
      Approved: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        dot: "bg-green-500",
      },
      Rejected: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        dot: "bg-red-500",
      },
      "In Review": {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        dot: "bg-blue-500",
      },
    };

    const config = statusConfig[status] || {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      dot: "bg-gray-500",
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}
      >
        <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
        {status}
      </span>
    );
  };

  const getActiveBadge = (isActive) => {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${
          isActive
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-gray-50 text-gray-600 border-gray-200"
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isActive ? "bg-green-500" : "bg-gray-400"
          }`}
        ></span>
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  const handleRowClick = (proposal) => {
    if (expandedRow === proposal._id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(proposal._id);
      onSelectOrg?.(proposal.organizationProfile);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-80"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold text-lg">
            Error Loading Proposals
          </h3>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 pt-0">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Organizations
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalProposals}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              {stats.activeOrgs} active organizations
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Action Plans
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalPlans}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              {stats.approvedPlans} approved
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Review
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.pendingPlans}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-yellow-600 mt-2">Awaiting approval</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Budget
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats.totalBudget)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Across all plans</p>
          </div>
        </div>
      )}

      {/* Proposals List */}
      <div className="bg-white rounded-xl shadow-sm overflow-auto border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          All Proposals
        </h2>

        {proposals.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-gray-900 font-semibold text-lg mb-2">
              No Proposals Found
            </h3>
            <p className="text-gray-600">
              There are currently no proposed action plans to display.
            </p>
          </div>
        ) : (
          <div className="space-y-4 ">
            {proposals.map((proposal) => (
              <div
                key={proposal._id}
                className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleRowClick(proposal)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {proposal.organizationProfile.orgLogo ? (
                        <img
                          src={proposal.organizationProfile.orgLogo}
                          alt={`${proposal.organizationProfile.orgName} Logo`}
                          className="w-16 h-16 object-cover rounded-full border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-blue-600 flex items-center justify-center text-white rounded-full border-2 border-blue-700">
                          <School className="w-8 h-8" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {proposal.organizationProfile.orgName}
                          </h3>
                          <span className="text-sm font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded">
                            {proposal.organizationProfile.orgAcronym}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {proposal.organizationProfile.orgDepartment}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 ml-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">Status</div>
                        {getStatusBadge(proposal.overallStatus)}
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">Active</div>
                        {getActiveBadge(proposal.isActive)}
                      </div>

                      <div className="text-center min-w-20">
                        <div className="text-sm text-gray-500 mb-1">Plans</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {proposal.ProposedIndividualActionPlan.length}
                        </div>
                      </div>

                      <div className="text-center min-w-28">
                        <div className="text-sm text-gray-500 mb-1">
                          Created
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(proposal.createdAt)}
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedRow === proposal._id ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {expandedRow === proposal._id &&
                  proposal.ProposedIndividualActionPlan.length > 0 && (
                    <div className="border-t border-gray-200 bg-gray-50 p-5">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase mb-4">
                        Action Plans (
                        {proposal.ProposedIndividualActionPlan.length})
                      </h4>
                      <div className="space-y-3">
                        {proposal.ProposedIndividualActionPlan.map((plan) => (
                          <div
                            key={plan._id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900 mb-1">
                                  {plan.activityTitle}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  {plan.briefDetails}
                                </p>
                              </div>
                              {getStatusBadge(plan.overallStatus)}
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">
                                  {formatDate(plan.proposedDate)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 font-medium">
                                  {formatCurrency(plan.budgetaryRequirements)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">
                                  {plan.venue}
                                </span>
                              </div>
                            </div>

                            {plan.alignedSDG && plan.alignedSDG.length > 0 && (
                              <div className="flex items-center gap-2 mt-3">
                                <span className="text-xs font-medium text-gray-500">
                                  SDGs:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {plan.alignedSDG.map((sdg, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full"
                                    >
                                      {sdg}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
