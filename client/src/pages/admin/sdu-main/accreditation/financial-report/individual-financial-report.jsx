import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, X } from "lucide-react";
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
} from "recharts";
import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "@/App";

export function SduMainFinancialReport({ selectedOrg, user, orgData }) {
  const [financialReport, setFinancialReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const GetFinancialReportApi = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_ROUTER}/getFinancialReport/${selectedOrg._id}`
      );
      setFinancialReport(response.data);
      setCurrentBalance(response.data.initialBalance || 0);
    } catch (error) {
      console.error("Error fetching financial report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedOrg?._id) GetFinancialReportApi();
  }, [selectedOrg?._id]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount || 0);

  // Generate monthly data for chart
  const generateMonthlyData = () => {
    if (!financialReport) return [];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyStats = {};
    months.forEach(
      (m) =>
        (monthlyStats[m] = {
          month: m,
          cashInflow: 0,
          cashOutflow: 0,
          balance: 0,
        })
    );

    // Add cash inflows
    financialReport.cashInflows?.forEach((item) => {
      const month = months[new Date(item.date).getMonth()];
      monthlyStats[month].cashInflow += Number(item.amount) || 0;
    });

    // Add cash outflows
    financialReport.cashoutflows?.forEach((item) => {
      const month = months[new Date(item.date).getMonth()];
      monthlyStats[month].cashOutflow += Number(item.amount) || 0;
    });

    // Add disbursements
    financialReport.disbursements?.forEach((item) => {
      const month = months[new Date(item.date).getMonth()];
      monthlyStats[month].cashOutflow += Number(item.amount) || 0;
    });

    let runningBalance = Number(financialReport.initialBalance) || 0;
    return months.map((month) => {
      const data = monthlyStats[month];
      runningBalance = runningBalance + data.cashInflow - data.cashOutflow;
      return { ...data, balance: runningBalance };
    });
  };

  const monthlyData = financialReport ? generateMonthlyData() : [];

  // Expense breakdown for pie chart
  const createExpenseBreakdown = () => {
    const reimbursementTypes = {};
    const disbursementTypes = {};

    financialReport?.reimbursements?.forEach((r) => {
      const type = r.expenseType || "Uncategorized";
      reimbursementTypes[type] = (reimbursementTypes[type] || 0) + r.amount;
    });

    financialReport?.disbursements?.forEach((d) => {
      const type = d.expenseType || "Uncategorized";
      disbursementTypes[type] = (disbursementTypes[type] || 0) + d.amount;
    });

    const greenShades = ["#22c55e", "#16a34a", "#15803d", "#166534", "#14532d"];
    const redShades = ["#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d"];
    const result = [];

    Object.entries(reimbursementTypes).forEach(([name, value], i) =>
      result.push({
        name,
        value,
        color: greenShades[i % greenShades.length],
      })
    );
    Object.entries(disbursementTypes).forEach(([name, value], i) =>
      result.push({
        name,
        value,
        color: redShades[i % redShades.length],
      })
    );

    return result;
  };

  const expenseBreakdown = financialReport ? createExpenseBreakdown() : [];

  if (loading)
    return (
      <div className="h-full w-full pt-4 flex items-center justify-center">
        <Card className="bg-white p-8 text-center">
          <p className="text-lg text-gray-600">Loading financial report...</p>
        </Card>
      </div>
    );

  if (!financialReport)
    return (
      <div className="h-full w-full pt-4 flex items-center justify-center">
        <Card className="bg-white p-8 text-center">
          <p className="text-lg text-red-600">
            Failed to load financial report
          </p>
        </Card>
      </div>
    );

  const totalCashInflow =
    financialReport.cashInflows?.reduce((sum, i) => sum + i.amount, 0) || 0;
  const totalDisbursements =
    financialReport.disbursements?.reduce((sum, i) => sum + i.amount, 0) || 0;

  return (
    <div
      className="w-full p-6 flex gap-6"
      style={{ backgroundColor: "#F5F5F9" }}
    >
      {/* Left Column - Summary & Charts */}
      <Card className="bg-white flex flex-col flex-1 gap-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-2 bg-amber-100 rounded w-10 flex justify-center">
              <span className="text-amber-600 font-bold text-xl">₱</span>
            </div>
            <CardTitle className="text-2xl">Financial Report</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Cards */}
          <div className="flex flex-wrap gap-6">
            <Card className="bg-gradient-to-r from-green-50 to-green-100 flex-1 min-w-[200px] border-green-200">
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-green-600 font-medium">
                      Cash Inflow
                    </p>
                    <p className="text-2xl font-bold text-green-800">
                      {formatCurrency(totalCashInflow)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-50 to-red-100 flex-1 min-w-[200px] border-red-200">
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-red-600 font-medium">
                      Cash Outflow
                    </p>
                    <p className="text-2xl font-bold text-red-800">
                      {formatCurrency(totalDisbursements)}
                    </p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-100 flex-1 min-w-[200px] border-amber-200">
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-amber-600 font-medium">
                      Current Balance
                    </p>
                    <p className="text-2xl font-bold text-amber-800">
                      {formatCurrency(currentBalance)}
                    </p>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center">
                    <span className="text-amber-600 text-2xl font-bold">₱</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="flex flex-col gap-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar
                        dataKey="cashInflow"
                        fill="#22c55e"
                        name="Cash Inflow"
                      />
                      <Bar
                        dataKey="cashOutflow"
                        fill="#ef4444"
                        name="Cash Outflow"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {expenseBreakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded w-10 flex justify-center">
                      <span className="text-amber-600 font-bold text-xl">
                        ₱
                      </span>
                    </div>
                    <CardTitle>Expense Breakdown</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseBreakdown}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          labelLine={false}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {expenseBreakdown.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right Column - Transaction Lists */}
      <div className="flex flex-col flex-1 gap-6">
        <ViewCollectionFees
          financialReport={financialReport}
          setSelectedTransaction={setSelectedTransaction}
          setSelectedType={setSelectedType}
          setViewModalOpen={setViewModalOpen}
          formatCurrency={formatCurrency}
          collectibleFees={financialReport.collectibleFees}
        />

        <ViewCashInflow
          financialReport={financialReport}
          cashInFlow={financialReport.cashInflows}
          setSelectedTransaction={setSelectedTransaction}
          setSelectedType={setSelectedType}
          setViewModalOpen={setViewModalOpen}
          formatCurrency={formatCurrency}
        />

        <ViewCashOutflow
          financialReport={financialReport}
          setSelectedTransaction={setSelectedTransaction}
          setSelectedType={setSelectedType}
          setViewModalOpen={setViewModalOpen}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* View Modal */}
      <ViewTransactionModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        transaction={selectedTransaction}
        type={selectedType}
      />
    </div>
  );
}

export function ViewCashInflow({
  setSelectedTransaction,
  setSelectedType,
  setViewModalOpen,
  formatCurrency,
  cashInFlow,
}) {
  return (
    <Card className="bg-white overflow-hidden flex-1 flex flex-col">
      <CardHeader className="sticky top-0 z-10 bg-white border-b">
        <div className="flex gap-2 items-center">
          <div className="p-2.5 bg-green-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <CardTitle className="text-xl">Cash Inflow</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 overflow-auto flex flex-col gap-3">
        {cashInFlow?.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No cash inflow found
          </div>
        ) : (
          cashInFlow?.map((item, index) => (
            <Card
              key={`cash-inflow-${index}`}
              className="bg-green-50 border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => {
                setSelectedTransaction(item);
                setSelectedType("cashInflow");
                setViewModalOpen(true);
              }}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800">
                    {item.collectibleFee?.title || "Cash Inflow"}
                  </h3>
                  <span className="text-green-600 font-bold">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                {item.paidRosterMembers && (
                  <div className="text-sm text-gray-600 mb-1">
                    Paid Roster Members: {item.paidRosterMembers}
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  Date: {new Date(item.date).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function ViewCashOutflow({
  financialReport,
  setSelectedTransaction,
  setSelectedType,
  setViewModalOpen,
  formatCurrency,
}) {
  return (
    <Card className="bg-white flex-1 flex flex-col overflow-hidden">
      <CardHeader className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-red-100 rounded-lg">
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <CardTitle className="text-xl">Cash Outflow</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-auto flex flex-col gap-3">
        {financialReport.disbursements?.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No cash outflow found
          </div>
        ) : (
          financialReport.disbursements?.map((item, index) => (
            <Card
              key={`disbursement-${index}`}
              className="bg-red-50 border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
              onClick={() => {
                setSelectedTransaction(item);
                setSelectedType("disbursement");
                setViewModalOpen(true);
              }}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800">
                    {item.description}
                  </h3>
                  <span className="text-red-600 font-bold">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Date Disbursed: {new Date(item.date).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function ViewCollectionFees({
  financialReport,
  setSelectedTransaction,
  setSelectedType,
  formatCurrency,
  setViewModalOpen,
  collectibleFees,
}) {
  const collectionData = collectibleFees || financialReport?.collections || [];

  return (
    <Card className="bg-white overflow-hidden flex-1 flex flex-col">
      <CardHeader className="sticky top-0 z-10 bg-white border-b">
        <div className="flex gap-2 items-center">
          <div className="p-2.5 bg-amber-100 rounded-lg">
            <span className="text-amber-600 font-bold text-lg">₱</span>
          </div>
          <CardTitle className="text-xl">Collection Fees</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 overflow-auto flex flex-col gap-3">
        {collectionData.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No collections found
          </div>
        ) : (
          collectionData.map((item, index) => (
            <Card
              key={`collection-${index}-${item._id}`}
              className={`cursor-pointer hover:opacity-90 transition-colors ${
                item.isCollected
                  ? "bg-green-50 border-green-200"
                  : "bg-amber-50 border-amber-200"
              }`}
              onClick={() => {
                setSelectedTransaction(item);
                setSelectedType("collections");
                setViewModalOpen(true);
              }}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {item.title || item.description || "Untitled Collection"}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg">
                      {formatCurrency(item.amount)}
                    </span>
                    <div className="text-xs mt-1">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          item.isCollected
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.isCollected ? "Collected" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
                  <div>
                    {item.date && (
                      <>Date: {new Date(item.date).toLocaleDateString()}</>
                    )}
                  </div>
                  {item.status && (
                    <div>
                      Status: <span className="font-medium">{item.status}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function ViewTransactionModal({
  isOpen,
  onClose,
  transaction,
  type,
  onInquire,
}) {
  if (!isOpen || !transaction) return null;

  const isReimbursement = type === "reimbursement";

  // Build file URL (adjust base path if needed for your backend)
  const fileUrl = transaction?.document?.fileName
    ? `${DOCU_API_ROUTER}/${transaction.organizationProfile}/${transaction.document.fileName}`
    : transaction?.file;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white flex flex-col w-1/2 h-9/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className={`px-6 py-4 ${
            isReimbursement ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              {isReimbursement ? "Cash Inflow Details" : "Cash Outflow Details"}
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-full overflow-y-auto">
          <div className="flex w-1/4 p-4 flex-col gap-4">
            <p className="text-sm font-semibold text-gray-600">Description</p>
            <p className="text-gray-900">{transaction.description}</p>
            <p className="text-sm font-semibold text-gray-600">Amount</p>
            <p
              className={`text-lg font-bold ${
                isReimbursement ? "text-green-600" : "text-red-600"
              }`}
            >
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(transaction.amount)}
            </p>
            <p className="text-sm font-semibold text-gray-600">Date</p>
            <p className="text-gray-900">
              {new Date(transaction.date).toLocaleDateString()}
            </p>
            <p className="text-sm font-semibold text-gray-600">Expense Type</p>
            <p className="text-gray-900">
              {transaction.expenseType || "Uncategorized"}
            </p>
          </div>

          <div>
            <p className="text-gray-900">{transaction.name}</p>
          </div>

          {fileUrl && (
            <iframe
              key={fileUrl}
              src={fileUrl}
              className="w-full full border"
              title="Transaction Document"
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition"
          >
            Close
          </button>
          <button
            onClick={() => {
              onInquire();
            }}
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Submit Inquiry
          </button>
        </div>
      </div>
    </div>
  );
}
