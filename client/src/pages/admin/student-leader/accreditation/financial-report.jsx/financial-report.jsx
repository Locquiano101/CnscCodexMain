import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { API_ROUTER } from "../../../../../App";
import axios from "axios";
import { StudentCashOutflow } from "./cash-out-flow";
import { StudentCashInflow } from "./cash-in-flow";
import { ViewTransactionModal } from "./view-transaction";
import { AddCollectionFees } from "./collection-fees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionModal } from "./add-transaction";

export default function StudentFinancialReport({ orgData }) {
  const [financialReport, setFinancialReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentBalance, setCurrentBalance] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState(null);

  // NEW: view modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const GetFinancialReportApi = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_ROUTER}/getFinancialReport/${orgData._id}`
      );
      console.log(response.data);
      setFinancialReport(response.data);
      setCurrentBalance(response.data.initialBalance);
    } catch (error) {
      console.error("Error fetching financial report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetFinancialReportApi();
  }, [orgData._id]);

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

    // Initialize months
    const monthlyStats = {};
    months.forEach((m) => {
      monthlyStats[m] = {
        month: m,
        cashInflow: 0,
        cashOutflow: 0,
        balance: 0,
      };
    });
    // 🟩 Add Cash Inflows (STUDENTS PAYING)
    financialReport.cashInflows?.forEach((item) => {
      const month = months[new Date(item.date).getMonth()];
      monthlyStats[month].cashInflow += Number(item.amount) || 0;
    });

    // 🔴 Add Disbursements to Cash Outflow
    financialReport.disbursements?.forEach((item) => {
      const month = months[new Date(item.date).getMonth()];
      monthlyStats[month].cashOutflow += Number(item.amount) || 0;
    });

    // 💰 Compute running balance per month
    let runningBalance = Number(financialReport.initialBalance) || 0;
    return months.map((month) => {
      const data = monthlyStats[month];
      runningBalance = runningBalance + data.cashInflow - data.cashOutflow;
      return { ...data, balance: runningBalance };
    });
  };

  const monthlyData = financialReport ? generateMonthlyData() : [];

  // ✅ Updated to PHP (₱) instead of USD ($)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleAddClick = (type) => {
    setTransactionType(type);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setTransactionType(null);
  };

  const handleTransactionSubmit = async (formData) => {
    try {
      const response = await axios.post(`${API_ROUTER}/addReciept`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Successfully submitted:", response.data);
      window.location.reload();
    } catch (error) {
      console.error(
        "❌ Error submitting transaction:",
        error.response?.data || error.message
      );
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full pt-4 bg-transparent rounded-2xl flex items-center justify-center">
        <Card className="bg-white">
          <CardContent className="p-8 text-center">
            <div className="text-lg text-gray-600">
              Loading financial report...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!financialReport) {
    return (
      <div className="h-full w-full pt-4 bg-transparent rounded-2xl flex items-center justify-center">
        <Card className="bg-white">
          <CardContent className="p-8 text-center">
            <div className="text-lg text-red-600">
              Failed to load financial report
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalCashInflow = financialReport.cashInflows.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalDisbursements = financialReport.disbursements.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const createExpenseBreakdown = () => {
    const reimbursementTypes = {};
    const disbursementTypes = {};

    financialReport.reimbursements.forEach((reimbursement) => {
      const expenseType = reimbursement.expenseType || "uncategorized";
      if (!reimbursementTypes[expenseType]) {
        reimbursementTypes[expenseType] = 0;
      }
      reimbursementTypes[expenseType] += reimbursement.amount;
    });

    financialReport.disbursements.forEach((disbursement) => {
      const expenseType = disbursement.expenseType || "uncategorized";
      if (!disbursementTypes[expenseType]) {
        disbursementTypes[expenseType] = 0;
      }
      disbursementTypes[expenseType] += disbursement.amount;
    });

    const greenShades = ["#22c55e", "#16a34a", "#15803d", "#166534", "#14532d"];
    const redShades = ["#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d"];

    const result = [];

    Object.entries(reimbursementTypes).forEach(
      ([expenseType, amount], index) => {
        result.push({
          name: `${expenseType}`,
          value: amount,
          color: greenShades[index % greenShades.length],
        });
      }
    );

    Object.entries(disbursementTypes).forEach(
      ([expenseType, amount], index) => {
        result.push({
          name: `${expenseType}`,
          value: amount,
          color: redShades[index % redShades.length],
        });
      }
    );

    return result;
  };

  const expenseBreakdown = financialReport ? createExpenseBreakdown() : [];

  return (
    <div
      className="w-full p-6 flex gap-6"
      style={{ backgroundColor: "#F5F5F9" }}
    >
      <Card className="bg-white flex flex-col flex-1 gap-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-2 bg-amber-100 rounded w-10">
              <span className="text-amber-600 font-bold text-xl flex justify-center">
                ₱
              </span>
            </div>
            <CardTitle className="text-2xl">Financial Report</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Cards */}
          <div className="flex flex-wrap gap-6">
            <Card className="bg-gradient-to-r from-green-50 to-green-100 flex-1 min-w-[200px] border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
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
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
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
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600 font-medium">
                      Current Balance
                    </p>
                    <p className="text-2xl font-bold text-amber-800">
                      {formatCurrency(currentBalance)}
                    </p>
                  </div>
                  {/* Peso sign instead of DollarSign */}
                  <div className="w-8 h-8 flex items-center justify-center">
                    <span className="text-amber-600 text-2xl font-bold">₱</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="flex mt-4 flex-col gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Monthly Comparison</CardTitle>
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
              <Card className="bg-white">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded w-10 flex justify-center">
                      <span className="text-amber-600 font-bold text-xl">
                        ₱
                      </span>
                    </div>
                    <CardTitle className="text-lg">Expense Breakdown</CardTitle>
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
                            <Cell key={`cell-${index}`} fill={entry.color} />
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

      {/* Reimbursements and Disbursements */}
      <div className="flex flex-col flex-1 gap-6">
        <AddCollectionFees
          financialReport={financialReport}
          handleAddClick={handleAddClick}
          setSelectedTransaction={setSelectedTransaction}
          setSelectedType={setSelectedType}
          orgData={orgData}
          collectibleFees={financialReport.collectibleFees}
          setViewModalOpen={setViewModalOpen}
          formatCurrency={formatCurrency}
        />

        <StudentCashInflow
          financialReport={financialReport}
          orgData={orgData}
          cashInFlow={financialReport.cashInflows}
          setSelectedTransaction={setSelectedTransaction}
          formatCurrency={formatCurrency}
        />

        <StudentCashOutflow
          financialReport={financialReport}
          handleAddClick={handleAddClick}
          setSelectedTransaction={setSelectedTransaction}
          setSelectedType={setSelectedType}
          setViewModalOpen={setViewModalOpen}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        type={transactionType}
        onSubmit={handleTransactionSubmit}
        orgData={orgData}
        financialReportId={financialReport._id}
      />

      <ViewTransactionModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        transaction={selectedTransaction}
        type={selectedType}
      />
    </div>
  );
}
