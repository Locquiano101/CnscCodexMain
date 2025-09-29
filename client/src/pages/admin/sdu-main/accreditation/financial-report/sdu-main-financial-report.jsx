import { useState, useEffect } from "react";
import axios from "axios";
import {
  Building,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Calendar,
  FileText,
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  Loader2,
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
} from "recharts";
import { API_ROUTER } from "../../../../../App";

export function SduMainFinancialReportOverall({ onSelectOrg }) {
  const [financialReport, setFinancialReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const GetFinancialReportApi = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_ROUTER}/getFinancialReport`);
      console.log(response.data);
      setFinancialReport(response.data);
    } catch (error) {
      console.error("Error fetching financial report:", error);
      setError("Failed to load financial report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetFinancialReportApi();
  }, []);
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading financial report...</p>
        </div>
      </div>
    );
  }

  // Calculate financial metrics for an organization
  const calculateFinancialMetrics = (orgData) => {
    const totalCollections =
      orgData.collections?.reduce(
        (sum, collection) => sum + (collection.amount || 0),
        0
      ) || 0;
    const totalDisbursements =
      orgData.disbursements?.reduce(
        (sum, disbursement) => sum + (disbursement.amount || 0),
        0
      ) || 0;
    const totalReimbursements =
      orgData.reimbursements?.reduce(
        (sum, reimbursement) => sum + (reimbursement.amount || 0),
        0
      ) || 0;
    const netFlow = totalCollections - totalDisbursements - totalReimbursements;

    return {
      totalCollections,
      totalDisbursements,
      totalReimbursements,
      netFlow,
      currentBalance: orgData.endingBalance || 0,
      initialBalance: orgData.initialBalance || 0,
    };
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: "⏳",
      },
      Active: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: "✅",
      },
      Inactive: { color: "bg-red-100 text-red-800 border-red-200", icon: "❌" },
    };

    const config = statusConfig[status] || statusConfig["Pending"];

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}
      >
        <span className="mr-1">{config.icon}</span>
        {status}
      </span>
    );
  };

  // Prepare data for charts
  const prepareChartData = () => {
    if (!financialReport || financialReport.length === 0) return [];

    return financialReport.map((org) => {
      const metrics = calculateFinancialMetrics(org);
      return {
        name: org.organizationProfile?.orgAcronym || "N/A",
        collections: metrics.totalCollections,
        disbursements: metrics.totalDisbursements,
        reimbursements: metrics.totalReimbursements,
        balance: metrics.currentBalance,
      };
    });
  };

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-red-500 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={GetFinancialReportApi}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const chartData = prepareChartData();

  return (
    <div className="h-full w-full overflow-auto bg-cnsc-white">
      {/* Header */}
      <div className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-cnsc-primary p-3 rounded-lg">
                <FileText className="w-7 h-7 text-cnsc-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-cnsc-black">
                  Financial Overview
                </h1>
                <p className="text-cnsc-blue text-sm">
                  Organization Financial Reports
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-cnsc-blue">Last Updated</p>
              <p className="text-cnsc-primary font-semibold">
                {financialReport?.length > 0 && financialReport[0]?.updatedAt
                  ? new Date(financialReport[0].updatedAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6  space-y-8">
        {/* Charts Section */}
        {financialReport?.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Balance Comparison Chart */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-cnsc-black mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-cnsc-secondary" />
                Organization Balances
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar
                      dataKey="balance"
                      name="Current Balance"
                      fill="#500000" // cnsc-primary
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Financial Distribution Chart */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-cnsc-black mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-cnsc-accent2" />
                Financial Activity Distribution
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={85}
                      dataKey="collections"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            [
                              "#500000", // primary
                              "#ee8f00", // secondary
                              "#003092", // accent1
                              "#00879e", // accent2
                            ][index % 4]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Organization Cards */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-cnsc-black mb-2 flex items-center">
              <Users className="w-6 h-6 mr-2 text-cnsc-primary" />
              Organizations ({financialReport?.length || 0})
            </h2>
            <p className="text-cnsc-blue text-sm">
              Detailed financial overview of each organization
            </p>
          </div>

          {!financialReport?.length ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-cnsc-black mb-2">
                No Financial Data Available
              </h3>
              <p className="text-cnsc-blue">
                Financial reports will appear here once data is loaded.
              </p>
              <button
                onClick={GetFinancialReportApi}
                className="mt-4 bg-cnsc-primary text-cnsc-white px-6 py-2 rounded-lg hover:bg-cnsc-secondary transition-colors inline-flex items-center"
              >
                <Loader2 className="w-4 h-4 mr-2" />
                Refresh Data
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {financialReport.map((org) => {
                const metrics = calculateFinancialMetrics(org);
                const profile = org.organizationProfile || {};

                return (
                  <div
                    key={org._id}
                    onClick={() => onSelectOrg?.(org)}
                    className="bg-white rounded-xl shadow hover:shadow-lg transition-transform duration-300 cursor-pointer hover:scale-105"
                  >
                    {/* Card Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="bg-cnsc-accent1 p-2 rounded-lg">
                            <Building className="w-6 h-6 text-cnsc-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-cnsc-black text-lg">
                              {profile.orgName || "N/A"}
                            </h3>
                            <p className="text-gray-500 text-sm">
                              {profile.orgAcronym || "N/A"}
                            </p>
                          </div>
                        </div>
                        <StatusBadge
                          status={profile.overAllStatus || "Pending"}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="bg-gray-100 text-cnsc-black px-2 py-1 rounded text-xs">
                          {profile.orgClass || "N/A"}
                        </span>
                        <span className="bg-cnsc-secondary/20 text-cnsc-secondary px-2 py-1 rounded text-xs">
                          {profile.orgSpecialization || "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Financial Metrics */}
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-cnsc-accent2/10 rounded-lg">
                          <ArrowUpCircle className="w-7 h-7 text-cnsc-accent2 mx-auto mb-1" />
                          <p className="text-xs text-cnsc-black">Collections</p>
                          <p className="font-bold text-cnsc-accent2">
                            {formatCurrency(metrics.totalCollections)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-cnsc-secondary/10 rounded-lg">
                          <ArrowDownCircle className="w-7 h-7 text-cnsc-secondary mx-auto mb-1" />
                          <p className="text-xs text-cnsc-black">
                            Disbursements
                          </p>
                          <p className="font-bold text-cnsc-secondary">
                            {formatCurrency(metrics.totalDisbursements)}
                          </p>
                        </div>
                      </div>

                      {/* Current Balance */}
                      <div
                        className={`p-4 rounded-lg mb-3 ${
                          metrics.currentBalance >= 0
                            ? "bg-cnsc-primary/10"
                            : "bg-cnsc-secondary/10"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Wallet
                              className={`w-5 h-5 mr-2 ${
                                metrics.currentBalance >= 0
                                  ? "text-cnsc-primary"
                                  : "text-cnsc-secondary"
                              }`}
                            />
                            <span className="font-semibold text-cnsc-black">
                              Current Balance
                            </span>
                          </div>
                          <span
                            className={`font-bold text-lg ${
                              metrics.currentBalance >= 0
                                ? "text-cnsc-primary"
                                : "text-cnsc-secondary"
                            }`}
                          >
                            {formatCurrency(metrics.currentBalance)}
                          </span>
                        </div>
                      </div>

                      {/* Net Flow */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-cnsc-black">Net Flow</span>
                        <span
                          className={`font-semibold flex items-center ${
                            metrics.netFlow >= 0
                              ? "text-cnsc-accent2"
                              : "text-cnsc-secondary"
                          }`}
                        >
                          {metrics.netFlow >= 0 ? (
                            <TrendingUp className="w-4 h-4 mr-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 mr-1" />
                          )}
                          {formatCurrency(metrics.netFlow)}
                        </span>
                      </div>
                    </div>

                    {/* Activity Summary */}
                    <div className="px-6 py-4 bg-cnsc-white border-t rounded-b-xl">
                      <div className="flex justify-between text-xs text-cnsc-blue">
                        <span>
                          Transactions:{" "}
                          {(org.collections?.length || 0) +
                            (org.disbursements?.length || 0) +
                            (org.reimbursements?.length || 0)}
                        </span>
                        <span>
                          Updated:{" "}
                          {org.updatedAt
                            ? new Date(org.updatedAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
