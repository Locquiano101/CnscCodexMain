import { useEffect, useState } from "react";
import { X, Calendar, User, FileText, Tag, Banknote } from "lucide-react";
import CurrencyInput from "../../../../../components/currency-input";
import DocumentUploader from "../../../../../components/document_uploader";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { API_ROUTER } from "@/config/api";

export function AddCashInflowModal({
  orgData,
  isOpen,
  onClose,
  financialReportId,
}) {
  const [formData, setFormData] = useState({
    organizationProfile: orgData?._id || "",
    collectibleFee: "",
    paidRosterMembers: 0,
    amount: "",
    date: new Date().toISOString().split("T")[0],
    status: "UNCHECKED",
  });

  const [rosterCount, setRosterCount] = useState(0);
  const [collectibleFees, setCollectibleFees] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchRosterCount(), fetchCollectibleFees()]);
    } catch (err) {
      console.error(err);
      setError("Failed to load required data.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRosterCount = async () => {
    try {
      const response = await axios.get(
        `${API_ROUTER}/getRosterMemberNumbers/${orgData._id}`
      );
      setRosterCount(response.data.count || 0);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const fetchCollectibleFees = async () => {
    try {
      const response = await axios.get(
        `${API_ROUTER}/getCollectibleFees/${orgData._id}`
      );
      setCollectibleFees(response.data || []);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate paidRosterMembers
    if (name === "paidRosterMembers") {
      const val = parseInt(value, 10);
      if (val > rosterCount) {
        setError(`Cannot exceed roster count of ${rosterCount}`);
      } else if (val < 1) {
        setError("Number of payees must be at least 1");
      } else {
        setError("");
      }
    }
  };

  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/[^0-9.]/g, "");
    const parts = value.split(".");
    if (parts[1]?.length > 2) parts[1] = parts[1].slice(0, 2);
    if (parts[0]) parts[0] = parseInt(parts[0], 10).toLocaleString();
    setFormData((prev) => ({ ...prev, amount: parts.join(".") }));
  };

  const resetForm = () => {
    setFormData({
      organizationProfile: orgData?._id || "",
      collectibleFee: "",
      paidRosterMembers: 0,
      amount: "",
      date: new Date().toISOString().split("T")[0],
      status: "UNCHECKED",
    });
    setError("");
  };

  const validateForm = () => {
    if (!formData.collectibleFee) {
      setError("Please select a category");
      return false;
    }

    const heads = parseInt(formData.paidRosterMembers, 10);
    if (isNaN(heads) || heads < 1) {
      setError("Please enter a valid number of payees");
      return false;
    }
    if (heads > rosterCount) {
      setError(`Cannot exceed roster count of ${rosterCount}`);
      return false;
    }

    if (
      !formData.amount ||
      parseFloat(formData.amount.replace(/,/g, "")) <= 0
    ) {
      setError("Please enter a valid amount");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const submissionData = {
        organizationProfile: orgData._id,
        collectibleFee: formData.collectibleFee,
        paidRosterMembers: parseInt(formData.paidRosterMembers, 10),
        amount: parseFloat(formData.amount.replace(/,/g, "")), // per head
        date: formData.date,
        status: "UNCHECKED",
        financialReportId,
      };

      console.log("Submitting cash inflow:", submissionData);

      const response = await axios.post(
        `${API_ROUTER}/addCashInflow`,
        submissionData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Cash inflow added:", response.data);
      resetForm();
      onClose();
    } catch (err) {
      console.error(
        "Error adding cash inflow:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.error || err.message || "Failed to submit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-6 border-b bg-white">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Add Cash Inflow
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
              ) : (
                <>
                  {/* Amount */}
                  <CurrencyInput
                    label="Amount (per head)"
                    Icon={Banknote}
                    name="amount"
                    value={formData.amount}
                    onChange={handleAmountChange}
                    required
                    placeholder="0.00"
                    disabled={isSubmitting}
                  />

                  {/* Paid Roster Members */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User className="inline h-4 w-4 mr-2" />
                      Number of Payees
                    </label>
                    <input
                      type="number"
                      name="paidRosterMembers"
                      placeholder={`Max ${rosterCount}`}
                      className={`w-full px-4 py-3 border rounded-xl ${
                        error ? "border-red-500" : ""
                      }`}
                      value={formData.paidRosterMembers}
                      onChange={handleChange}
                      required
                      min="1"
                      max={rosterCount}
                      disabled={isSubmitting}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Roster count: {rosterCount}
                    </p>
                    {error && (
                      <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-2" />
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      className="w-full px-4 py-3 border rounded-xl"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Tag className="inline h-4 w-4 mr-2" />
                      Collection Category
                    </label>
                    <select
                      name="collectibleFee"
                      className="w-full px-4 py-3 border rounded-xl"
                      value={formData.collectibleFee}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting || collectibleFees.length === 0}
                    >
                      <option value="" disabled>
                        {collectibleFees.length === 0
                          ? "No categories available"
                          : "Select a category"}
                      </option>
                      {collectibleFees.map((fee) => (
                        <option key={fee._id} value={fee._id}>
                          {fee.title}
                        </option>
                      ))}
                    </select>
                    {collectibleFees.length === 0 && (
                      <p className="text-sm text-yellow-600 mt-1">
                        No collectible fees found. Please add fees first.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="bg-gray-50 px-6 py-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting || isLoading || collectibleFees.length === 0
                }
                className={`!text-white bg-gradient-to-r from-emerald-500 to-teal-600 ${
                  isSubmitting || isLoading || collectibleFees.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Cash Inflow"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function TransactionModal({
  orgData = { _id: "demo-org", organization: "Demo Organization" },
  isOpen = true,
  onClose = () => {},
  type = "reimbursement",
  financialReportId = "demo-report",
  onSubmit = (data) => console.log("Form submitted:", data),
}) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    name: "",
    date: new Date().toISOString().split("T")[0],
    expenseType: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState(false);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    if (file) setFileError(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // New handler for amount with numeric + comma formatting
  const handleAmountChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9.]/g, ""); // Remove non-numeric
    const parts = value.split(".");
    if (parts[1]?.length > 2) parts[1] = parts[1].slice(0, 2); // Limit decimals
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Add commas
    setFormData((prev) => ({ ...prev, amount: parts.join(".") }));
  };

  const expenseOptions = {
    reimbursement: [
      { value: "Membership Fee", label: "Membership Fee" },
      { value: "Transportation", label: "Transportation" },
      { value: "Meals", label: "Meals" },
      {
        value: "Materials Purchased by Member",
        label: "Materials Purchased by Member",
      },
      { value: "others", label: "Others" },
    ],
    disbursement: [
      { value: "Supplies", label: "Supplies" },
      { value: "Venue Reservation", label: "Venue Reservation" },
      { value: "Equipment Rental", label: "Equipment Rental" },
      { value: "Accommodation", label: "Accommodation" },
      { value: "Honorarium", label: "Honorarium" },
      { value: "Others", label: "Others" },
    ],
    collection: [
      { value: "Membership Fee", label: "Membership Fee" },
      { value: "Event Ticket", label: "Event Ticket" },
      { value: "Donations", label: "Donations" },
      { value: "Merchandise Sale", label: "Merchandise Sale" },
      { value: "Others", label: "Others" },
    ],
  };

  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      name: "",
      date: new Date().toISOString().split("T")[0],
      expenseType: "",
    });
    setSelectedFile(null);
    setFileError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setFileError(true);
      return;
    }
    setIsSubmitting(true);

    try {
      const multiForm = new FormData();
      multiForm.append("description", formData.description);
      multiForm.append("expenseType", formData.expenseType);
      multiForm.append("organizationProfile", orgData._id);
      multiForm.append("organization", orgData.organization);
      // Remove commas before submitting
      const numericAmount = formData.amount.replace(/,/g, "");
      multiForm.append("amount", numericAmount);
      multiForm.append("financialReportId", financialReportId);
      multiForm.append("name", formData.name);
      multiForm.append("date", formData.date);
      multiForm.append("type", type);

      if (selectedFile) multiForm.append("file", selectedFile);

      await onSubmit(multiForm);
      resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const isReimbursement = type === "reimbursement";
  const isDisbursement = type === "disbursement";
  const isCollection = type === "collection";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-6 border-b bg-white">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {isReimbursement
              ? "Add Cash Inflow"
              : isDisbursement
              ? "Add Cash Outflow"
              : "Add Collection"}
          </DialogTitle>
          <p className="text-gray-600 text-sm mt-1">
            {isReimbursement
              ? "Record cash inflow transaction"
              : isDisbursement
              ? "Record cash outflow transaction"
              : "Record collection of fees"}
          </p>
        </DialogHeader>

        {/* Form Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {/* File Upload */}
              <div className="h-fit">
                <DocumentUploader
                  onFileSelect={handleFileSelect}
                  title={`Upload ${
                    isReimbursement
                      ? "Cash Inflow"
                      : isDisbursement
                      ? "Cash Outflow"
                      : "Collection"
                  } Document`}
                  className="w-full"
                />
                {fileError && (
                  <div className="mt-2 text-sm text-red-600 flex items-center">
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Please upload a document to proceed with the transaction.
                  </div>
                )}
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="inline h-4 w-4 mr-2" />
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    placeholder="Enter transaction description..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Amount */}
                <CurrencyInput
                  label="Amount"
                  Icon={Banknote}
                  name="amount"
                  value={formData.amount}
                  onChange={handleAmountChange}
                  required
                  placeholder="0.00"
                />

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Expense Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Tag className="inline h-4 w-4 mr-2" />
                    {isCollection ? "Type of Collection" : "Type of Expense"}
                  </label>
                  <select
                    name="expenseType"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                    value={formData.expenseType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      {isCollection
                        ? "Select collection type"
                        : "Select expense type"}
                    </option>
                    {expenseOptions[type]?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-2" />
                    {isReimbursement
                      ? "Requested by"
                      : isDisbursement
                      ? "Recipient"
                      : "Payee"}
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder={`Enter ${
                      isReimbursement
                        ? "requestor"
                        : isDisbursement
                        ? "recipient"
                        : "payer"
                    } name...`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="bg-gray-50 px-6 py-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`!text-white ${
                isReimbursement
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  : isDisbursement
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? "Submitting..." : "Submit Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddCollectionFeeModal({
  orgData,
  financialReportId,
  isOpen = true,
  onClose = () => {},
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      amount: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert amount to number and remove commas
      const numericAmount = Number(
        formData.amount.toString().replace(/,/g, "")
      );

      const payload = {
        organizationProfile: orgData._id,
        title: formData.title,
        description: formData.description,
        amount: numericAmount,
        isCollected: false, // default
        financialReport: financialReportId,
        status: "UNCHECKED", // default
      };
      console.log("asdsa", payload);
      try {
        const response = await axios.post(
          `${API_ROUTER}/AddCollectibleFees`, // your backend endpoint
          payload
        );
        return response.data;
      } catch (error) {
        console.error("Error creating approved fee:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl flex flex-col p-0">
        <DialogHeader className="px-6 py-6 border-b bg-white">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Add Collection Fee
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 px-6 ">
          <div className="flex-1 overflow-y-auto flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="mt-1 px-2 py-4 block w-full rounded-md border-2 border-gray-500 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1 block w-full p-4 rounded-md border-2 border-gray-500  shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="mt-1 px-2 py-4 block w-full rounded-md border-2 border-gray-500 shadow-sm"
                required
              />
            </div>
          </div>

          <DialogFooter className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`!text-white bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600
              ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? "Submitting..." : "Submit Fee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
