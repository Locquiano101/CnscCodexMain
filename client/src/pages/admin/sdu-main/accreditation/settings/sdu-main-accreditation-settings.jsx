import { useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  Calendar,
  RotateCcw,
  Shield,
  CheckCircle,
  X,
} from "lucide-react";
import { API_ROUTER, DOCU_API_ROUTER } from "./../../../../../App";

import { ResetAccreditationModal } from "./sdu-reset-accreditation";
import { RevokeAccreditationProcess } from "./sdu-revoke-accreditation-process";
export function SduMainAccreditationSettings() {
  const [showConfirmation, setShowConfirmation] = useState(null);
  const [deadline, setDeadline] = useState("2024-12-31");
  const [accreditationStatus, setAccreditationStatus] = useState("active");
  const [lastReset, setLastReset] = useState("2024-01-15");
  const [lastDeadlineUpdate, setLastDeadlineUpdate] = useState("2024-09-15");
  const [previousDeadline, setPreviousDeadline] = useState("2024-11-30");
  const [isProcessing, setIsProcessing] = useState(false);
  const [resetAccreditationModal, setResetAccreditationModal] = useState(false);
  const [revokeAccreditationModal, setRevokeAccreditationModal] =
    useState(false);

  const handleAction = async (actionType) => {
    setIsProcessing(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    switch (actionType) {
      case "reset":
        setLastReset(new Date().toISOString().split("T")[0]);
        setAccreditationStatus("active");
        break;
      case "revoke":
        setAccreditationStatus("revoked");
        break;
      case "setDeadline":
        setPreviousDeadline(deadline);
        setLastDeadlineUpdate(new Date().toISOString().split("T")[0]);
        break;
    }

    setIsProcessing(false);
    setShowConfirmation(null);
  };

  const ConfirmationModal = ({ action, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-red-600" size={24} />
          <h3 className="text-lg font-semibold">Confirm Action</h3>
        </div>
        <p className="text-gray-700 mb-6">
          Are you sure you want to {action}? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Confirm"}
          </button>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const StatusBadge = () => (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
        accreditationStatus === "active"
          ? "bg-green-100 text-green-800"
          : accreditationStatus === "revoked"
          ? "bg-red-100 text-red-800"
          : "bg-yellow-100 text-yellow-800"
      }`}
    >
      {accreditationStatus === "active" && <CheckCircle size={16} />}
      {accreditationStatus === "revoked" && <X size={16} />}
      {accreditationStatus === "pending" && <AlertTriangle size={16} />}
      <span className="capitalize">{accreditationStatus}</span>
    </div>
  );

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <div className="h-full w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-6 text-white">
          <div className="flex items-center gap-3">
            <Shield size={32} />
            <div>
              <h1 className="text-2xl font-bold">Accreditation Management</h1>
              <p className="text-amber-100">
                Manage institutional accreditation settings
              </p>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Current Status:</span>
              <StatusBadge />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Reset:</span>
              <span className="font-medium">{lastReset}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Next Deadline:</span>
              <span className="font-medium">{deadline}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-6 ">
          {/* Reset Accreditation */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900">
                Reset Accreditation Settings
              </h3>
              <p className="text-sm text-gray-600">
                Reset all accreditation records and initialize a new
                accreditation process.
              </p>
            </div>
            <button
              onClick={() => setResetAccreditationModal(true)}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <RotateCcw size={16} />
              Reset Settings
            </button>
          </div>

          {/* Revoke Accreditation */}
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h3 className="font-semibold text-gray-900">
                Revoke Accreditation
              </h3>
              <p className="text-sm text-gray-600">
                Permanently revoke the current accreditation status
              </p>
            </div>
            <button
              onClick={() => setRevokeAccreditationModal(true)}
              disabled={isProcessing || accreditationStatus === "revoked"}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={16} />
              Revoke Accreditation
            </button>
          </div>

          {/* Set Deadline */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 mr-4">
                <h3 className="font-semibold text-gray-900">
                  Set Accreditation Deadline
                </h3>
                <p className="text-sm text-gray-600">
                  Update the deadline for accreditation renewal
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setRevokeAccreditationModal(true)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  Update Deadline
                </button>
              </div>
            </div>

            {/* Deadline History */}
            <div className="bg-gray-50 p-3 rounded-md border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 font-medium">
                    Last Deadline Update:
                  </span>
                  <div className="text-gray-700 mt-1">{lastDeadlineUpdate}</div>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">
                    Previous Deadline:
                  </span>
                  <div className="text-gray-700 mt-1">{previousDeadline}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900">Generate Report</h3>
              <p className="text-sm text-gray-600">
                Generate a comprehensive accreditation status report
              </p>
            </div>
            <button
              onClick={async () => {
                try {
                  const response = await axios.get(
                    `${API_ROUTER}/generateReportAccreditationSdu`,
                    {
                      responseType: "blob", // 👈 important so axios handles PDF properly
                    }
                  );

                  // Create blob from response
                  const url = window.URL.createObjectURL(
                    new Blob([response.data])
                  );
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute("download", "accreditation-report.pdf"); // filename
                  document.body.appendChild(link);
                  link.click();

                  // Cleanup
                  link.remove();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error("Error generating report:", err);
                  alert("Failed to generate report. Please try again.");
                }
              }}
              disabled={isProcessing}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Generate Report
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      {resetAccreditationModal && (
        <ResetAccreditationModal
          action={showConfirmation}
          onCancel={() => setResetAccreditationModal(false)}
        />
      )}
      {revokeAccreditationModal && (
        <RevokeAccreditationProcess
          action={showConfirmation}
          onCancel={() => setRevokeAccreditationModal(null)}
        />
      )}
      {showConfirmation && (
        <ConfirmationModal
          action={showConfirmation}
          onConfirm={() => handleAction(showConfirmation.split(" ")[0])}
          onCancel={() => setShowConfirmation(null)}
        />
      )}
    </div>
  );
}
