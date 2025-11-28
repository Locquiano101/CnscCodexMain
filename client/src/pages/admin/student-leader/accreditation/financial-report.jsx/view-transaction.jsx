import { useState } from "react";
import { X, Calendar, User, FileText, Tag, Banknote } from "lucide-react";
import CurrencyInput from "../../../../../components/currency-input";
import DocumentUploader from "../../../../../components/document_uploader";
import { DOCU_API_ROUTER } from "../../../../../App";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ViewTransactionModal({ isOpen, onClose, transaction, type }) {
  if (!isOpen || !transaction) return null;

  const isReimbursement = type === "reimbursement";
  const isDisbursement = type === "disbursement";
  const isCollection = type === "collection";

  const fileUrl = transaction?.document?.fileName
    ? `${DOCU_API_ROUTER}/${transaction.organizationProfile}/${transaction.document.fileName}`
    : transaction?.file;

  const headerGradient = isReimbursement
    ? "bg-gradient-to-r from-emerald-500 to-teal-600"
    : isDisbursement
    ? "bg-gradient-to-r from-red-500 to-rose-600"
    : "bg-gradient-to-r from-yellow-500 to-orange-500";

  const headerTitle = isReimbursement
    ? "Reimbursement Details"
    : isDisbursement
    ? "Disbursement Details"
    : "Collection Details";

  const nameLabel = isReimbursement
    ? "Requestor"
    : isDisbursement
    ? "Recipient"
    : "Payer";

  const amountColor = isDisbursement ? "text-red-600" : "text-green-600";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-white">
          <DialogTitle className="text-xl font-bold text-gray-900">{headerTitle}</DialogTitle>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-600">Description</p>
            <p className="text-gray-900">{transaction.description}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600">Amount</p>
            <p className={`text-lg font-bold ${amountColor}`}>
              ₱
              {Number(transaction.amount).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600">Date</p>
            <p className="text-gray-900">
              {new Date(transaction.date).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600">Expense Type</p>
            <p className="text-gray-900">
              {transaction.expenseType || "Uncategorized"}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600">{nameLabel}</p>
            <p className="text-gray-900">{transaction.name}</p>
          </div>

          {fileUrl && (
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Document
              </p>
              <iframe
                src={fileUrl}
                className="w-full h-96 border rounded-lg"
                title="Transaction Document"
              />
              <div className="mt-2">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Open in New Tab
                </a>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="bg-gray-50 px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
              ? "Add Reimbursement"
              : isDisbursement
              ? "Add Disbursement"
              : "Add Collection"}
          </DialogTitle>
          <p className="text-gray-600 text-sm mt-1">
            {isReimbursement
              ? "Record collection of fees"
              : isDisbursement
              ? "Record disbursement transaction"
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
                    ? "Reimbursement"
                    : isDisbursement
                    ? "Disbursement"
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
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`text-white ${
                isReimbursement
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  : isDisbursement
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              } ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
