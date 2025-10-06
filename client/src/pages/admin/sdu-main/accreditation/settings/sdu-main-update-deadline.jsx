import { useState } from "react";
import axios from "axios";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { API_ROUTER } from "./../../../../../App";

export function SduMainUpdateAccreditationDeadline({ onCancel }) {
  const [step, setStep] = useState(1); // Step 1 = warning, Step 2 = final confirm
  const [isProcessing, setIsProcessing] = useState(false);

  const deadline = localStorage.getItem("selectedDeadline");

  // Format date to "Month Day, Year"
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formattedDeadline = formatDate(deadline);

  const handleConfirm = async () => {
    if (step === 1) {
      setStep(2); // move to final confirmation step
      return;
    }

    try {
      setIsProcessing(true);

      // ✅ align with backend controller
      const res = await axios.post(
        `${API_ROUTER}/UpdateDeadlineAcrreditation`,
        { deadline }
      );

      console.log("Deadline update response:", res.data);

      alert(
        `📅 Accreditation deadline successfully updated to ${formattedDeadline}.
        Notifications have been sent to all active organizations.`
      );
      onCancel(); // close modal
    } catch (err) {
      console.error("Error updating deadline:", err);
      alert("❌ Failed to update deadline. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
        {step === 1 ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-yellow-500" size={24} />
              <h3 className="text-lg font-semibold">Confirm Update</h3>
            </div>
            <p className="text-gray-700 mb-6">
              You are about to set the accreditation deadline to{" "}
              <span className="font-semibold">{formattedDeadline}</span>.
              Continue?
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-green-600" size={24} />
              <h3 className="text-lg font-semibold">Final Confirmation</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Please confirm again to officially submit the new accreditation
              deadline of{" "}
              <span className="font-semibold">{formattedDeadline}</span>.
            </p>
          </>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {isProcessing
              ? "Processing..."
              : step === 1
              ? "Proceed"
              : "Confirm & Submit"}
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
}
