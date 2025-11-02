import { useState } from "react";
import { API_ROUTER } from "../App";
import axios from "axios";
import { Award, FileText, AlertTriangle, CheckCircle } from "lucide-react";

export function UpdateStatusAccomplishment({
  accomplishment,
  statusModal, // { type: "approval" | "revision", status: string }
  setStatusModal,
  orgData,
  user,
  getCategoryIcon,
  getCategoryColor,
  formatDate,
}) {
  const [loading, setLoading] = useState(false);
  console.log("statusModal:", statusModal);
  const { type, status } = statusModal || {};

  // Required documents mapping
  const requiredDocuments = {
    "Programs, Projects, and Activities (PPAs)": [
      { label: "Attendance Sheet", required: true },
      { label: "Narrative Report", required: true },
      { label: "Photo Documentation", required: true },
      { label: "Financial/Liquidation Report", required: true },
      { label: "Summary of Evaluation", required: true },
      {
        label: "Compiled sample evaluation (Minimum Required: 10)",
        required: true,
      },
      { label: "Resolution", required: false },
    ],
    "Institutional Involvement": [
      { label: "Narrative Report", required: true },
      { label: "Attendance Sheet", required: true },
      { label: "Certificate of Participation", required: true },
      { label: "Photo Documentation", required: true },
    ],
    "External Activities": [
      { label: "Official Invitation", required: true },
      { label: "Narrative Report", required: true },
      { label: "Photo Documentation", required: true },
      { label: "CMO 63 s. 2017 documents", required: true },
      { label: "Liquidation Report", required: false },
      { label: "Echo Seminar/Training documents", required: false },
    ],
    "Meetings & Assemblies": [
      { label: "Minutes", required: true },
      { label: "Photo Documentation", required: true },
      { label: "Resolution", required: false },
    ],
  };

  // Email data state
  const [emailData, setEmailData] = useState({
    inquirySubject: `Revision of "${accomplishment.title}"`,
    inquiryText: "",
    userName: user.name,
    userPosition: user.position,
    orgProfileId: orgData._id,
    orgName: orgData.orgName,
  });

  const closeModal = () => setStatusModal(null);

  // Check document compliance
  const docsConfig = accomplishment
    ? requiredDocuments[accomplishment.category] || []
    : [];
  const uploadedLabels =
    accomplishment?.documents?.map((d) => d.label?.toLowerCase()) || [];
  const missingRequiredDocs = docsConfig.filter(
    (doc) => doc.required && !uploadedLabels.includes(doc.label.toLowerCase())
  );

  // Unified handler for approval and revision
  const handleSubmit = async (status) => {
    setLoading(true);

    const payload = {
      ...emailData,
      overallStatus: status,
      userName: user.name,
      userPosition: user.position,
      orgProfileId: orgData._id,
      orgName: orgData.orgName,
      accomplishmentId: accomplishment._id,
      accomplishmentTitle: accomplishment.title,
      category: accomplishment.category,
      awardedPoints: accomplishment.awardedPoints,
    };

    console.log("🔄 Submitting accomplishment status:", { payload });

    try {
      const response = await axios.post(
        `${API_ROUTER}/updateStatusAccomplishment/${accomplishment._id}`,
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
    <div className="fixed bg-black/50 backdrop-blur-sm inset-0 flex justify-center items-center z-50">
      <div className="max-h-[90vh] overflow-y-auto bg-white w-2/3 max-w-4xl flex flex-col rounded-2xl shadow-xl relative">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-1 shadow-md"
          disabled={loading}
        >
          ✕
        </button>

        {/* Accomplishment Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getCategoryColor(
                accomplishment.category
              )}`}
            >
              {getCategoryIcon(accomplishment.category)}
              <span>{accomplishment.category}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300">
              <Award className="w-4 h-4 text-yellow-700" />
              <span className="text-sm font-semibold text-yellow-800">
                {accomplishment.awardedPoints} Points
              </span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {accomplishment.title}
          </h2>
          <p className="text-gray-600 text-sm">{accomplishment.description}</p>
        </div>

        {/* Document Status Overview */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            Document Compliance Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Uploaded Documents */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">
                  Uploaded Documents ({accomplishment.documents?.length || 0})
                </h4>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {accomplishment.documents?.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700">{doc.label}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        doc.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                )) || (
                  <p className="text-gray-500 text-sm">No documents uploaded</p>
                )}
              </div>
            </div>

            {/* Missing Required Documents */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle
                  className={`w-5 h-5 ${
                    missingRequiredDocs.length > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                />
                <h4 className="font-semibold text-gray-900">
                  Required Documents Status
                </h4>
              </div>
              {missingRequiredDocs.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-red-600 text-sm font-medium mb-2">
                    Missing {missingRequiredDocs.length} required document(s):
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {missingRequiredDocs.map((doc, index) => (
                      <div
                        key={index}
                        className="text-sm text-red-700 bg-red-50 px-2 py-1 rounded"
                      >
                        • {doc.label}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    All required documents uploaded
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 ">
          {/* Approval Modal */}
          {type === "approval" && (
            <>
              <h1 className="text-xl font-semibold mb-4">
                Approve Accomplishment Report
              </h1>

              {missingRequiredDocs.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Warning</span>
                  </div>
                  <p className="text-yellow-700 text-sm">
                    This accomplishment is missing {missingRequiredDocs.length}{" "}
                    required document(s). Consider requesting revision before
                    approval.
                  </p>
                </div>
              )}

              <p className="mb-6 text-gray-700">
                By approving this accomplishment report, you confirm that you
                have reviewed all submitted documents and information. An
                approval notification will be sent to the organization.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleSubmit(status)}
                  disabled={loading}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {loading ? "Processing..." : "Confirm Approval"}
                </button>

                <button
                  onClick={closeModal}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
          {/* Revision Modal */}
          {type === "revision" && (
            <>
              <h3 className="text-xl font-semibold mb-4">
                Request Revision - Send Notification
              </h3>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 mb-2 block">
                    Subject:
                  </span>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                <label className="block">
                  <span className="text-sm font-medium text-gray-700 mb-2 block">
                    Revision Message:
                  </span>
                  <textarea
                    rows={6}
                    placeholder="Please specify what needs to be revised or corrected in this accomplishment report..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={emailData.inquiryText}
                    onChange={(e) =>
                      setEmailData({
                        ...emailData,
                        inquiryText: e.target.value,
                      })
                    }
                    disabled={loading}
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeModal}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmit(status)}
                  disabled={loading}
                  className={`px-4 py-2 text-sm rounded-lg transition ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-orange-600 hover:bg-orange-700 text-white"
                  }`}
                >
                  {loading ? "Sending..." : "Send Revision Request"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer with timestamps */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
          <span>Created: {formatDate(accomplishment.createdAt)}</span>
          {accomplishment.updatedAt !== accomplishment.createdAt && (
            <span>Last Updated: {formatDate(accomplishment.updatedAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
