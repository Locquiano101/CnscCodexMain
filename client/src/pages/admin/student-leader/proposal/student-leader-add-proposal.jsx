import axios from "axios";
import { API_ROUTER } from "../../../../App";
import { useState } from "react";
import { Upload } from "lucide-react";
import { DonePopUp } from "../../../../components/components";

export function AddProposal({ proposals = [], onClose }) {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPopup, setShowPopup] = useState(null);
  const [proposedDate, setProposedDate] = useState(""); // New state for proposed date

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      // Create object URL for PDF preview
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    }
  };

  // Handle activity selection and set initial proposed date
  const handleActivitySelection = (e) => {
    const activity = proposals.find((a) => a._id === e.target.value);
    setSelectedActivity(activity || null);

    // Set the initial proposed date from the selected activity
    if (activity && activity.proposedDate) {
      setProposedDate(activity.proposedDate);
    } else {
      setProposedDate("");
    }
  };

  const handleSubmit = async () => {
    if (!selectedActivity || !uploadedFile) return;

    const formData = new FormData();

    // required fields for ProposalConduct
    formData.append(
      "ProposedActionPlanSchema",
      selectedActivity.ProposedActionPlanSchema
    );
    formData.append("ProposedIndividualActionPlan", selectedActivity._id); // if needed
    formData.append(
      "organizationProfile",
      selectedActivity.organizationProfile
    ); // if needed
    formData.append("organization", selectedActivity.organization); // if needed

    formData.append("label", "Proposal");
    formData.append("file", uploadedFile);

    // Add the proposed date to FormData
    formData.append("proposedDate", proposedDate);

    try {
      const res = await axios.post(
        `${API_ROUTER}/postStudentLeaderProposalConduct`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ Upload response:", res.data);

      setShowPopup("success");
    } catch (err) {
      console.error(err);
      setShowPopup("error");
    }
  };

  const handleRemoveFile = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setUploadedFile(null);
    setPdfUrl(null);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-blue-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-blue-600">📄</span> Add New Proposal
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50">
          {/* Select Activity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Activity
            </label>
            <select
              value={selectedActivity?._id || ""}
              onChange={handleActivitySelection}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option value="">Choose an approved activity...</option>
              {proposals.map((activity) => (
                <option key={activity._id} value={activity._id}>
                  {activity.activityTitle || activity.orgName}
                </option>
              ))}
            </select>
          </div>

          {/* Proposed Date */}
          {selectedActivity && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proposed Date
              </label>
              <input
                type="date"
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                required
              />
            </div>
          )}

          {/* Activity & Upload Section */}
          {selectedActivity && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left - Activity Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-base font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                  Activity Details
                </h3>

                <div className="space-y-3 text-sm text-gray-700">
                  {selectedActivity?.activityTitle && (
                    <div>
                      <p className="font-medium text-gray-600">Title</p>
                      <p className="mt-0.5">{selectedActivity.activityTitle}</p>
                    </div>
                  )}

                  {selectedActivity?.briefDetails && (
                    <div>
                      <p className="font-medium text-gray-600">Brief Details</p>
                      <p className="mt-0.5">{selectedActivity.briefDetails}</p>
                    </div>
                  )}

                  {selectedActivity?.AlignedObjective && (
                    <div>
                      <p className="font-medium text-gray-600">
                        Aligned Objectives
                      </p>
                      <p className="mt-0.5">
                        {selectedActivity.AlignedObjective}
                      </p>
                    </div>
                  )}

                  {proposedDate && (
                    <div>
                      <p className="font-medium text-gray-600">Proposed Date</p>
                      <p className="text-blue-700 mt-0.5">
                        {new Date(proposedDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {selectedActivity?.venue && (
                      <div>
                        <p className="font-medium text-gray-600">Venue</p>
                        <p className="mt-0.5">{selectedActivity.venue}</p>
                      </div>
                    )}

                    {selectedActivity?.date && (
                      <div>
                        <p className="font-medium text-gray-600">Date</p>
                        <p className="mt-0.5">{selectedActivity.date}</p>
                      </div>
                    )}
                  </div>

                  {selectedActivity?.budget && (
                    <div>
                      <p className="font-medium text-gray-600">Budget</p>
                      <p className="mt-0.5 font-semibold text-green-700">
                        ₱{selectedActivity.budget.toLocaleString()}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="font-medium text-gray-600">Status</p>
                    <span
                      className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedActivity?.overallStatus === "Approved"
                          ? "bg-green-100 text-green-800"
                          : selectedActivity?.overallStatus === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedActivity?.overallStatus ===
                            "Approved For Conduct"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedActivity?.overallStatus}
                    </span>
                  </div>

                  {selectedActivity?.alignedSDG?.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-600">Aligned SDG</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedActivity.alignedSDG.map((sdg, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium"
                          >
                            SDG {sdg}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right - File Upload */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-base font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                  Document Upload
                </h3>

                {!uploadedFile ? (
                  <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                    <Upload className="w-10 h-10 text-blue-400 mb-2" />
                    <p className="text-gray-700 text-sm font-medium">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF files only (MAX. 10MB)
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,application/pdf"
                      onChange={handleFileUpload}
                    />
                  </label>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">📄</div>
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm">
                            {uploadedFile.name}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="text-red-600 hover:text-red-700 text-xs font-medium px-2 py-0.5 hover:bg-red-50 rounded"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="border rounded-lg overflow-hidden h-[300px]">
                      <iframe
                        src={pdfUrl}
                        className="w-full h-full"
                        title="PDF Preview"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedActivity || !uploadedFile || !proposedDate}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              selectedActivity && uploadedFile && proposedDate
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Submit Proposal
          </button>
        </div>
      </div>

      {showPopup && (
        <DonePopUp
          type={showPopup}
          message={
            showPopup === "success"
              ? "Proposal uploaded successfully!"
              : showPopup === "error"
              ? "Something went wrong."
              : "Check your input again."
          }
          onClose={() => {
            setShowPopup(null);
            onClose();
          }}
        />
      )}
    </div>
  );
}
