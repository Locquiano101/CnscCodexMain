import { useState } from "react";
import { API_ROUTER } from "../App";
import axios from "axios";

export function UpdateStatusProposal({
  proposal,
  statusModal, // { type: "approval" | "alert", status: string }
  setStatusModal,
  orgData,
  user,
}) {
  const [loading, setLoading] = useState(false);
  const { type, status } = statusModal || {};

  // Fallback user if not provided
  const safeUser = user || { name: "SDU HEAD", position: "SDU" };

  const [emailData, setEmailData] = useState({
    inquirySubject: `Revision of "${proposal.ProposedIndividualActionPlan.activityTitle}"`,
    inquiryText: "",
    userName: safeUser.name,
    userPosition: safeUser.position,
    orgProfileId: orgData._id,
    orgName: orgData.orgName,
  });

  const closeModal = () => setStatusModal(null);

  const handleSubmit = async (status) => {
    setLoading(true);

    const payload = {
      ...emailData,
      overallStatus: status,
      userName: safeUser.name,
      userPosition: safeUser.position,
      orgProfileId: orgData._id,
      orgName: orgData.orgName,
    };

    console.log("🔄 Submitting:", { payload });

    try {
      const response = await axios.post(
        `${API_ROUTER}/updateStatusProposalConduct/${proposal._id}`,
        payload
      );
      console.log("✅ Server response:", response.data);
      closeModal();
    } catch (err) {
      console.error("❌ Submission failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!statusModal) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-[99999]">
      <div className="h-fit bg-white w-1/3 flex flex-col px-6 py-6 rounded-2xl shadow-xl relative">
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          disabled={loading}
        >
          ✕
        </button>

        {type === "approval" && (
          <>
            <h1 className="text-lg font-semibold mb-4">
              Approval: Proposal "
              {proposal.ProposedIndividualActionPlan.activityTitle}"
            </h1>
            <p className="text-gray-700">
              By approving this section you confirm that you have reviewed the
              information provided and consent to its approval.
            </p>
            <button
              onClick={() => handleSubmit(status)}
              disabled={loading}
              className={`mt-6 px-6 py-2 rounded-lg text-sm font-medium shadow-md transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {loading ? "Processing..." : "Confirm Approval & Send Email"}
            </button>
          </>
        )}

        {type === "alert" && (
          <>
            <h3 className="text-lg font-semibold mb-4">
              Compose Email – President Notification
            </h3>
            <div className="flex flex-col gap-4">
              <label>
                <p>Subject:</p>
                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={emailData.inquirySubject}
                  onChange={(e) =>
                    setEmailData({
                      ...emailData,
                      inquirySubject: e.target.value,
                    })
                  }
                  disabled={loading}
                />
              </label>
              <label>
                <p>Message:</p>
                <textarea
                  placeholder="Message"
                  rows={5}
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={emailData.inquiryText}
                  onChange={(e) =>
                    setEmailData({ ...emailData, inquiryText: e.target.value })
                  }
                  disabled={loading}
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                onClick={closeModal}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit(status)}
                disabled={loading}
                className={`px-4 py-2 text-sm rounded ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {loading ? "Sending..." : "Send Revision Email"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
