import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import axios from "axios";
import { API_ROUTER } from "../../../../../App";

export function ResetAccreditationModal({ action = "Reset Accreditation Settings", onCancel }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [step, setStep] = useState(1);

  const handleConfirm = async () => {
    if (confirmationText !== "RESET") return;
    setIsProcessing(true);

    try {
      const res = await axios.post(
        `${API_ROUTER}/systemResetAccreditation`,
        { initiatedBy: "SDU Admin", reason: "manual reset from settings" }
      );
      console.log("Axios response:", res.data);
      alert("All accreditations have been reset.");
      onCancel && onCancel();
    } catch (error) {
      console.error("Axios error:", error);
      alert("Failed to reset accreditations.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-red-600" size={28} />
          <h3 className="text-xl font-semibold">Critical Confirmation</h3>
        </div>

        {step === 1 && (
          <>
            <p className="text-gray-700 mb-6">
              You are about to <span className="font-semibold">{action}</span> for the entire system.
              This will deactivate all accreditations and organization profiles and reset all accomplishment points to 0.
              Previous grades will be archived for viewing. This action is
              <span className="text-red-600 font-semibold"> permanent</span> and cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Continue
              </button>
              <button
                onClick={onCancel}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-gray-700 mb-4">
              To confirm, please type{" "}
              <span className="font-mono font-semibold">RESET</span> below.
            </p>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type RESET to confirm"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                disabled={isProcessing || confirmationText !== "RESET"}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Confirm"}
              </button>
              <button
                onClick={onCancel}
                disabled={isProcessing}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
