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

import { ResetAccreditationModal } from "./sdu-main-reset-accreditation";
import { SuspendAccreditationProcess } from "./sdu-main-suspend-accreditation";
import { SduMainUpdateAccreditationDeadline } from "./sdu-main-update-deadline";
import { SduMainAccreditationWarning } from "./sdu-main-warning-accreditation";

export function SduMainAccreditationSettings() {
  const [deadline, setDeadline] = useState("2024-12-31");
  const [lastDeadlineUpdate, setLastDeadlineUpdate] = useState("2024-09-15");
  const [previousDeadline, setPreviousDeadline] = useState("2024-11-30");

  const [resetAccreditationModal, setResetAccreditationModal] = useState(false);
  const [deadlineAccreditationModal, setDeadlineAccreditationModal] =
    useState(false);
  const [warningAccreditationModal, setWarningAccreditationModal] =
    useState(false);
  const [suspendAccreditationModal, setSuspendAccreditationModal] =
    useState(false);

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <div className="h-full w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
          <div className="flex items-center gap-3">
            <Shield size={32} />
            <div>
              <h1 className="text-2xl font-bold">Accreditation Management</h1>
              <p className="text-red-100">
                Manage institutional accreditation settings
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-6 ">
          {/* Reset Accreditation */}
          <div className="flex items-center justify-between p-4 border border-blue-200 bg-blue-50 rounded-lg">
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
              onClick={() => setWarningAccreditationModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <RotateCcw size={16} />
              Reset Settings
            </button>
          </div>

          {/* Accreditation Warning */}
          <div className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
            <div>
              <h3 className="font-semibold text-gray-900">
                Accreditation Compliance Warning
              </h3>
              <p className="text-sm text-gray-600">
                Issue a formal warning regarding the organization’s
                accreditation status.
              </p>
            </div>
            <button
              onClick={() => setWarningAccreditationModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <AlertTriangle size={16} />
              Issue Warning
            </button>
          </div>

          {/* Accreditation Suspension */}
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h3 className="font-semibold text-gray-900">
                Accreditation Suspension
              </h3>
              <p className="text-sm text-gray-600">
                Suspend the organization’s current accreditation privileges
                until further review.
              </p>
            </div>
            <button
              onClick={() => setSuspendAccreditationModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={16} />
              Suspend Accreditation
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
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => {
                    localStorage.setItem("selectedDeadline", deadline); // 🔑 store deadline
                    setDeadlineAccreditationModal(true);
                  }}
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
                  window.URL.suspendObjectURL(url);
                } catch (err) {
                  console.error("Error generating report:", err);
                  alert("Failed to generate report. Please try again.");
                }
              }}
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

      {resetAccreditationModal && <ResetAccreditationModal />}
      {suspendAccreditationModal && (
        <SuspendAccreditationProcess
          onCancel={() => setSuspendAccreditationModal(false)}
        />
      )}
      {warningAccreditationModal && (
        <SduMainAccreditationWarning
          onCancel={() => setWarningAccreditationModal(false)}
        />
      )}
      {deadlineAccreditationModal && <SduMainUpdateAccreditationDeadline />}
    </div>
  );
}
