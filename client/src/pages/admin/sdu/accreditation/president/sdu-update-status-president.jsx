import { useState } from "react";
import axios from "axios";
import { API_ROUTER } from "../../../../../App";

export function ApprovePresidentProfile({ presidentData, setShowPopup }) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const HandleSubmitApprovalOfPresidentProfile = async () => {
    console.log(
      "Submitting approval for president profile:",
      presidentData._id
    );
    try {
      setIsLoading(true);
      const res = await axios.post(
        `${API_ROUTER}/updateStatusPresident/${presidentData._id}`,
        {
          overallStatus: "Approved", // ✅ Fixed: Send the correct field name
        }
      );
      console.log("Approval response:", res.data);

      setConfirmationMessage("✅ Approved successfully!");
      setShowConfirmation(true);

      // auto-close popup after 1s
      setTimeout(() => {
        setShowConfirmation(false);
        setShowPopup({ show: false, type: "", member: null });
      }, 1000);
    } catch (error) {
      console.error("Failed to approve president profile", error);

      setConfirmationMessage("❌ Failed to approve president profile.");
      setShowConfirmation(true);

      // auto-close popup after 1s
      setTimeout(() => {
        setShowConfirmation(false);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const CancelSubmissionOfPresidentProfile = () => {
    console.log("Cancelling submission for president profile");
    setShowPopup({ show: false, type: "", member: null });
  };

  return (
    <div className="flex flex-col gap-2 w-full justify-start">
      <h1 className="text-lg font-semibold text-gray-800">
        Approve President Profile of {presidentData?.name}?
      </h1>

      <button
        onClick={HandleSubmitApprovalOfPresidentProfile}
        className="border px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? "Approving..." : "Approve"}
      </button>

      <button
        onClick={CancelSubmissionOfPresidentProfile}
        className="border px-4 py-2 bg-gray-300 text-black rounded disabled:opacity-50"
        disabled={isLoading}
      >
        Cancel
      </button>

      {/* Confirmation popup */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white flex items-center justify-center min-w-[300px] px-6 py-4 rounded shadow-lg">
            <p className="text-center text-lg">{confirmationMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function RevisePresidentProfile({ presidentData, setShowPopup }) {
  const [isLoading, setIsLoading] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const HandleSubmitRevisionOfPresidentProfile = async () => {
    console.log(
      "Submitting revision for president profile:",
      presidentData._id,
      "Notes:",
      revisionNotes
    );
    try {
      setIsLoading(true);
      const res = await axios.post(
        `${API_ROUTER}/updateStatusPresident/${presidentData._id}`,
        {
          overallStatus: "Revision From the SDU", // ✅ Fixed: Send correct field name
          revisionNotes: revisionNotes.trim(), // ✅ Fixed: Send revision notes correctly
        }
      );
      console.log("Revision response:", res.data);

      setConfirmationMessage("✅ Revision notes sent successfully!");
      setShowConfirmation(true);

      // auto-close popup after 1.5s
      setTimeout(() => {
        setShowConfirmation(false);
        setShowPopup({ show: false, type: "", member: null });
      }, 1500);
    } catch (error) {
      console.error("Failed to revise president profile", error);

      setConfirmationMessage("❌ Failed to submit revision notes.");
      setShowConfirmation(true);

      // auto-close popup after 1.5s
      setTimeout(() => {
        setShowConfirmation(false);
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  const CancelSubmissionOfPresidentProfile = () => {
    console.log("Cancelling revision for president profile");
    setShowPopup({ show: false, type: "", member: null });
  };

  return (
    <div className="flex flex-col gap-3 w-full justify-start">
      <h1 className="text-lg font-semibold text-gray-800">
        Send Revision Notes for {presidentData?.name}
      </h1>

      <textarea
        className="border rounded p-2 w-full min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your revision notes here..."
        value={revisionNotes}
        onChange={(e) => setRevisionNotes(e.target.value)}
      />

      <div className="flex gap-2">
        <button
          onClick={HandleSubmitRevisionOfPresidentProfile}
          className="border px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
          disabled={isLoading || !revisionNotes.trim()}
        >
          {isLoading ? "Sending..." : "Send Revision Notes"}
        </button>
        <button
          onClick={CancelSubmissionOfPresidentProfile}
          className="border px-4 py-2 bg-gray-300 text-black rounded disabled:opacity-50"
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>

      {/* Confirmation popup */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white flex items-center justify-center min-w-[300px] px-6 py-4 rounded shadow-lg">
            <p className="text-center text-lg">{confirmationMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
