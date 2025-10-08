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
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
import axios from "axios";

export function DeanFinancialReport({ selectedOrg, user }) {
  const [financialReport, setFinancialReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentBalance, setCurrentBalance] = useState(""); // You might want to get this from the backend as well
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

  // Generate monthly data from actual backend data
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

    // Initialize all months with zero values
    months.forEach((month) => {
      monthlyStats[month] = {
        month,
        reimbursements: 0,
        disbursements: 0,
        balance: currentBalance, // You might want to calculate this differently
      };
    });

    // Process reimbursements
    financialReport.reimbursements.forEach((item) => {
      const date = new Date(item.date);
      const monthIndex = date.getMonth();
      const monthName = months[monthIndex];
      monthlyStats[monthName].reimbursements += item.amount;
    });

    // Process disbursements
    financialReport.disbursements.forEach((item) => {
      const date = new Date(item.date);
      const monthIndex = date.getMonth();
      const monthName = months[monthIndex];
      monthlyStats[monthName].disbursements += item.amount;
    });

    // Calculate running balance (simplified - you might want to implement proper balance calculation)
    let runningBalance = currentBalance;
    return months.map((month) => {
      const data = monthlyStats[month];
      runningBalance =
        runningBalance - data.disbursements + data.reimbursements;
      return {
        ...data,
        balance: runningBalance,
      };
    });
  };

  const monthlyData = financialReport ? generateMonthlyData() : [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "php",
    }).format(amount);
  };

  const handleTransactionClick = (item, type) => {
    setSelectedTransaction({ ...item, type });
  };

  // Submit the inquiry
  const handleInquirySubmit = async () => {
    if (!inquiryText.trim()) return; // optional: prevent empty submissions

    setSubmittingInquiry(true); // start loading

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

      // Show success message (you can use toast or alert)
      alert("Inquiry submitted successfully!");

      // Close inquiry popup and transaction modal
      setInquirePopupOpen(false);
      setSelectedTransaction(null);

      // Refresh page or refetch data
    } catch (error) {
      console.error("❌ Inquiry submission failed:", error);
      alert("Failed to submit inquiry. Please try again.");
    } finally {
      setSubmittingInquiry(false); // stop loading
      GetFinancialReportApi();
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="h-full w-full pt-4 bg-transparent rounded-2xl flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading financial report...</div>
      </div>
    );
  }

  // Show error state if no data
  if (!financialReport) {
    return (
      <div className="h-full w-full pt-4 bg-transparent rounded-2xl flex items-center justify-center">
        <div className="text-lg text-red-600">
          Failed to load financial report
        </div>
      </div>
    );
  }

  // Calculate totals from actual data
  const totalReimbursements = financialReport.reimbursements.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const totalDisbursements = financialReport.disbursements.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  // Create expense breakdown from actual data based on expenseType total amount
  const createExpenseBreakdown = () => {
    const reimbursementTypes = {};
    const disbursementTypes = {};

    // Process reimbursements
    financialReport.reimbursements.forEach((reimbursement) => {
      console.log(reimbursement);
      const expenseType = reimbursement.expenseType || "uncategorized";
      if (!reimbursementTypes[expenseType]) {
        reimbursementTypes[expenseType] = 0;
      }
      reimbursementTypes[expenseType] += reimbursement.amount;
    });

    // Process disbursements
    financialReport.disbursements.forEach((disbursement) => {
      const expenseType = disbursement.expenseType || "uncategorized";
      if (!disbursementTypes[expenseType]) {
        disbursementTypes[expenseType] = 0;
      }
      disbursementTypes[expenseType] += disbursement.amount;
    });

    // Green shades for reimbursements
    const greenShades = [
      "#22c55e",
      "#16a34a",
      "#15803d",
      "#166534",
      "#14532d",
      "#10b981",
      "#059669",
      "#047857",
      "#065f46",
      "#064e3b",
      "#4ade80",
      "#34d399",
      "#6ee7b7",
      "#a7f3d0",
      "#d1fae5",
    ];

    // Red shades for disbursements
    const redShades = [
      "#ef4444",
      "#dc2626",
      "#b91c1c",
      "#991b1b",
      "#7f1d1d",
      "#f87171",
      "#fca5a5",
      "#fecaca",
      "#fee2e2",
      "#fef2f2",
      "#e11d48",
      "#be185d",
      "#9d174d",
      "#831843",
      "#881337",
    ];

    const result = [];

    // Add reimbursement types with green shades
    Object.entries(reimbursementTypes).forEach(
      ([expenseType, amount], index) => {
        result.push({
          name: `${expenseType}`,
          value: amount,
          color: greenShades[index % greenShades.length],
        });
      }
    );

    // Add disbursement types with red shades
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
    <div className="h-full max-h-240  w-full pt-4 bg-gray-200 p-4 flex gap-4 ">
      <div className="bg-white shadow-lg flex flex-col flex-1 p-6    border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          {/* Left Section: Icon and Title */}
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 ">
              <span className="w-8 h-8 text-blue-600 text-2xl font-bold">₱</span>

            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Financial Report
            </h2>
          </div>

          {/* Right Section: Button */}
          {/* <button className="bg-amber-500 text-white px-5 py-2.5 font-semibold ">
            Summarize Report
          </button> */}
        </div>

        {/* Summary Cards */}
        <div className="flex flex-wrap gap-4">
          {/* Current Balance */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 flex-1 min-w-[200px] p-4 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">
                  Current Balance
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {formatCurrency(currentBalance)}
                </p>
              </div>
             <span className="w-8 h-8 text-blue-600 text-2xl font-bold">₱</span>

            </div>
          </div>

          {/* Reimbursements */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 flex-1 min-w-[200px] p-4  border border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">
                  Total Reimbursements
                </p>
                <p className="text-2xl font-bold text-green-800">
                  {formatCurrency(totalReimbursements)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Disbursements */}
          <div className="bg-gradient-to-r from-red-50 to-red-100 flex-1 min-w-[200px] p-4  border border-red-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">
                  Total Disbursements
                </p>
                <p className="text-2xl font-bold text-red-800">
                  {formatCurrency(totalDisbursements)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="flex flex-col gap-6 overflow-auto max-h-[600px]">
          {/* Monthly Comparison Bar Chart */}
          <div className="bg-white p-4 rounded-2xl shadow border border-gray-200">
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
                    dataKey="reimbursements"
                    fill="#22c55e"
                    name="Reimbursements"
                  />
                  <Bar
                    dataKey="disbursements"
                    fill="#ef4444"
                    name="Disbursements"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense Breakdown Pie Chart */}
          {expenseBreakdown.length > 0 && (
            <div className="bg-white p-4 rounded-2xl shadow border border-gray-200">
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

      {/* Reimbursements and Disbursements */}
      <div className="flex flex-col flex-1 gap-4 h-full overflow-hidden">
        {/* Reimbursements */}
        <div className="bg-white p-0 shadow-lg border overflow-hidden border-gray-100 flex-1 flex flex-col">
          <div className="sticky flex justify-between w-full top-0 z-10 bg-white p-6 border-b border-gray-400 items-center gap-3">
            <div className="flex gap-2 items-center">
              <div className="p-2.5 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Reimbursements
              </h2>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-auto flex flex-col gap-3">
            {financialReport.reimbursements.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No reimbursements found
              </div>
            ) : (
              financialReport.reimbursements.map((item, index) => (
                <div
                  key={`reimbursement-${index}`}
                  onClick={() => handleTransactionClick(item, "Reimbursement")}
                  className="bg-green-50 p-4  border border-green-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">
                      {item.description}
                    </h3>
                    <span className="text-green-600 font-bold">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>
                      Date Reimbursed:
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1"></div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Disbursements */}
        <div className="bg-white  shadow-lg border border-gray-100 flex-1 flex flex-col overflow-hidden">
          <div className="sticky justify-between top-0 z-10 bg-white  p-4 border-b border-gray-400 flex items-center">
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-red-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Disbursements</h2>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-auto flex flex-col gap-3">
            {financialReport.disbursements.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No disbursements found
              </div>
            ) : (
              financialReport.disbursements.map((item, index) => (
                <div
                  key={`disbursement-${index}`}
                  className="bg-red-50 p-4  border border-red-200"
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
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>
                      Date Disbursed: {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1"></div>
                </div>
              ))
            )}

            {selectedTransaction &&
              (console.log(selectedTransaction),
              (
                <ViewTransactionModal
                  isOpen={!!selectedTransaction}
                  onClose={() => setSelectedTransaction(null)}
                  transaction={selectedTransaction}
                  type={selectedTransaction.type}
                  onInquire={() => {
                    setInquirePopupOpen(true);
                  }}
                />
              ))}

            {/* Inquiry Popup */}
            {inquirePopupOpen &&
              (console.log(selectedTransaction),
              (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white w-96 p-6 rounded-xl shadow-lg relative">
                    {/* Close */}
                    <button
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                      onClick={() => setInquirePopupOpen(false)}
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {/* Inquiry form */}
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
              ))}
          </div>
        </div>
      </div>
    </div>
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
      <div className="bg-white flex flex-col w-1/2 h-9/10   shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className={`px-6 py-4 ${
            isReimbursement ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              {isReimbursement
                ? "Reimbursement Details"
                : "Disbursement Details"}
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
        <div className=" flex h-full overflow-y-auto ">
          <div className="flex w-1/4 p-4  flex-col gap-4">
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
