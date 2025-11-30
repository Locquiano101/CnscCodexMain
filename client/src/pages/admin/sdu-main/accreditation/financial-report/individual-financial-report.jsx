import { useEffect, useState } from "react";
import { X, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
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
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../../App";
import axios from "axios";

export function SduMainFinancialReport({ selectedOrg, user }) {
  const [financialReport, setFinancialReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentBalance, setCurrentBalance] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [inquirePopupOpen, setInquirePopupOpen] = useState(false);
  const [inquiryText, setInquiryText] = useState("");
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  const GetFinancialReportApi = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_ROUTER}/getFinancialReport/${selectedOrg._id}`
      );
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
  }, []);

  const generateMonthlyData = () => {
    const monthlyStats = {};
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

    months.forEach((month) => {
      monthlyStats[month] = {
        month,
        cashInflow: 0,
        cashOutflow: 0,
        balance: currentBalance,
      };
    });

    // Add collections to cash inflow
    financialReport.collections?.forEach((item) => {
      const date = new Date(item.date);
      const monthIndex = date.getMonth();
      const monthName = months[monthIndex];
      monthlyStats[monthName].cashInflow += item.amount;
    });

    // Add reimbursements to cash inflow
    financialReport.reimbursements.forEach((item) => {
      const date = new Date(item.date);
      const monthIndex = date.getMonth();
      const monthName = months[monthIndex];
      monthlyStats[monthName].cashInflow += item.amount;
    });

    // Add disbursements to cash outflow
    financialReport.disbursements.forEach((item) => {
      const date = new Date(item.date);
      const monthIndex = date.getMonth();
      const monthName = months[monthIndex];
      monthlyStats[monthName].cashOutflow += item.amount;
    });

    let runningBalance = currentBalance;
    return months.map((month) => {
      const data = monthlyStats[month];
      runningBalance =
        runningBalance + data.cashInflow - data.cashOutflow;
      return {
        ...data,
        balance: runningBalance,
      };
    });
  };

  const monthlyData = financialReport ? generateMonthlyData() : [];

  // Format as Philippine Peso
  const formatCurrency = (amount) => {
    if (isNaN(amount)) return "₱0.00";
    return (
      "₱" +
      parseFloat(amount)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, "$&,")
    );
  };

  const handleTransactionClick = (item, type) => {
    setSelectedTransaction({ ...item, type });
  };

  const handleInquirySubmit = async () => {
    if (!inquiryText.trim()) return;

    setSubmittingInquiry(true);

    try {
      const response = await axios.post(
        `${API_ROUTER}/financialReportInquiry`,
        {
          userPosition: user.position,
          userName: user.name,
          inquiryText,
          selectedTransaction,
          orgId: selectedOrg._id,
          orgName: selectedOrg.orgName,
        }
      );

      console.log("✅ Inquiry submitted:", response.data);
      alert("Inquiry submitted successfully!");
      setInquirePopupOpen(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error("❌ Inquiry submission failed:", error);
      alert("Failed to submit inquiry. Please try again.");
    } finally {
      setSubmittingInquiry(false);
      GetFinancialReportApi();
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full pt-4 bg-transparent rounded-2xl flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading financial report...</div>
      </div>
    );
  }

  if (!financialReport) {
    return (
      <div className="h-full w-full pt-4 bg-transparent rounded-2xl flex items-center justify-center">
        <div className="text-lg text-red-600">
          Failed to load financial report
        </div>
      </div>
    );
  }

  const totalCollections = financialReport.collections?.reduce(
    (sum, item) => sum + item.amount,
    0
  ) || 0;

  const totalReimbursements = financialReport.reimbursements.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalCashInflow = totalCollections + totalReimbursements;

  const totalDisbursements = financialReport.disbursements.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const createExpenseBreakdown = () => {
    const reimbursementTypes = {};
    const disbursementTypes = {};

    financialReport.reimbursements.forEach((reimbursement) => {
      const expenseType = reimbursement.expenseType || "Uncategorized";
      reimbursementTypes[expenseType] =
        (reimbursementTypes[expenseType] || 0) + reimbursement.amount;
    });

    financialReport.disbursements.forEach((disbursement) => {
      const expenseType = disbursement.expenseType || "Uncategorized";
      disbursementTypes[expenseType] =
        (disbursementTypes[expenseType] || 0) + disbursement.amount;
    });

    const greenShades = [
      "#22c55e",
      "#16a34a",
      "#15803d",
      "#10b981",
      "#34d399",
      "#6ee7b7",
    ];

    const redShades = [
      "#ef4444",
      "#dc2626",
      "#b91c1c",
      "#f87171",
      "#fca5a5",
      "#fecaca",
    ];

    const result = [];

    Object.entries(reimbursementTypes).forEach(
      ([expenseType, amount], index) => {
        result.push({
          name: `${expenseType} (Reimbursement)`,
          value: amount,
          color: greenShades[index % greenShades.length],
        });
      }
    );

    Object.entries(disbursementTypes).forEach(
      ([expenseType, amount], index) => {
        result.push({
          name: `${expenseType} (Disbursement)`,
          value: amount,
          color: redShades[index % redShades.length],
        });
      }
    );

    return result;
  };

  const expenseBreakdown = financialReport ? createExpenseBreakdown() : [];

  return (
    <div className="h-full w-full p-6 flex gap-4 overflow-auto" style={{ backgroundColor: '#F5F5F9' }}>
      <div className="bg-white shadow-lg flex flex-col flex-1 p-6 rounded-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg w-10 flex justify-center">
              <span className="text-blue-600 text-2xl font-bold">₱</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Financial Report
            </h2>
          </div>

          <button className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 font-semibold rounded-lg">
            Summarize Report
          </button>
        </div>

        {/* Summary Cards */}
        <div className="flex flex-wrap gap-4">
          <div className="bg-gradient-to-r from-green-50 to-green-100 flex-1 min-w-[200px] p-4 rounded-lg border border-green-200 shadow-sm">
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
          </div>

          <div className="bg-gradient-to-r from-red-50 to-red-100 flex-1 min-w-[200px] p-4 rounded-lg border border-red-200 shadow-sm">
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
          </div>

          <div className="bg-amber-100 flex-1 min-w-[200px] p-4 rounded-lg border border-amber-200 shadow-sm mb-6">
            <div className="flex items-center justify-between">
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
          </div>
        </div>

        {/* Charts Section */}
        <div className="flex flex-col gap-6 overflow-auto max-h-[600px]">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Monthly Comparison
            </h3>
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
          </div>

          {expenseBreakdown.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Expense Breakdown
                </h3>
              </div>
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
            </div>
          )}
        </div>
      </div>

      {/* Right Panel (Transactions) */}
      <div className="flex flex-col flex-1 gap-6 h-full overflow-hidden">
        {/* Cash Inflow */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden flex-1 flex flex-col border border-gray-100">
          <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center gap-3 justify-between">
            <div className="flex gap-2 items-center">
              <div className="p-2.5 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Cash Inflow
              </h2>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-auto flex flex-col gap-3">
            {financialReport.reimbursements.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No cash inflow found
              </div>
            ) : (
              financialReport.reimbursements.map((item, index) => (
                <div
                  key={`reimbursement-${index}`}
                  onClick={() => handleTransactionClick(item, "Reimbursement")}
                  className="bg-green-50 p-4 rounded-md border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">
                      {item.description}
                    </h3>
                    <span className="text-green-600 font-bold">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Date Reimbursed: {new Date(item.date).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cash Outflow */}
        <div className="bg-white shadow-lg flex-1 flex flex-col overflow-hidden border border-gray-100 rounded-lg">
          <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between rounded-lg">
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-red-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Cash Outflow</h2>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-auto flex flex-col gap-3">
            {financialReport.disbursements.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No cash outflow found
              </div>
            ) : (
              financialReport.disbursements.map((item, index) => (
                <div
                  key={`disbursement-${index}`}
                  className="bg-red-50 p-4 rounded-md border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
                  onClick={() => handleTransactionClick(item, "Disbursement")}
                >
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
                </div>
              ))
            )}

            {selectedTransaction && (
              <ViewTransactionModal
                isOpen={!!selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
                transaction={selectedTransaction}
                type={selectedTransaction.type}
                onInquire={() => setInquirePopupOpen(true)}
              />
            )}

            {inquirePopupOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white w-96 p-6 rounded-xl shadow-lg relative">
                  <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setInquirePopupOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Submit Inquiry
                  </h3>
                  <textarea
                    className="w-full border rounded-lg p-2 text-gray-700"
                    rows="4"
                    placeholder="Type your inquiry here..."
                    value={inquiryText}
                    onChange={(e) => setInquiryText(e.target.value)}
                  />
                  <button
                    onClick={handleInquirySubmit}
                    disabled={submittingInquiry}
                    className={`mt-4 w-full px-4 py-2 rounded-lg text-white ${
                      submittingInquiry
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {submittingInquiry ? "Submitting..." : "Done"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
