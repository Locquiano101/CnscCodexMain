import axios from "axios";
import { API_ROUTER } from "../../../../App";
import { useState } from "react";
import { Upload } from "lucide-react";
import { DonePopUp } from "../../../../components/components";

export function AddProposal({ proposals = [], onClose, onAddLog }) {
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl  flex flex-col">
        {/* Header */}
        <div className="flex justify-between  items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Add New Proposal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Activity Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Activity
            </label>
            <select
              value={selectedActivity?._id || ""}
              onChange={handleActivitySelection}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            >
              <option value="">Choose an approved activity...</option>
              {proposals.map((activity) => (
                <option key={activity._id} value={activity._id}>
                  {activity.activityTitle || activity.orgName}
                </option>
              ))}
            </select>
          </div>

          {/* Proposed Date Input - Show only when activity is selected */}
          {selectedActivity && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Proposed Date
              </label>
              <input
                type="date"
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                required
              />
            </div>
          )}

          {selectedActivity &&
            (console.log(selectedActivity),
            (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Left Side - Activity Details */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-3">
                    Activity Details
                  </h3>
                  <div className="space-y-6">
                    {selectedActivity?.activityTitle && (
                      <div>
                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                          Title
                        </span>
                        <p className="text-gray-800 mt-1 text-base leading-relaxed">
                          {selectedActivity.activityTitle}
                        </p>
                      </div>
                    )}

                    {selectedActivity?.briefDetails && (
                      <div>
                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                          Brief Details
                        </span>
                        <p className="text-gray-800 mt-1 text-base leading-relaxed">
                          {selectedActivity.briefDetails}
                        </p>
                      </div>
                    )}

                    {selectedActivity?.AlignedObjective && (
                      <div>
                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                          Aligned Objectives
                        </span>
                        <p className="text-gray-800 mt-1 text-base leading-relaxed">
                          {selectedActivity.AlignedObjective}
                        </p>
                      </div>
                    )}

                    {/* Show the current proposed date value */}
                    {proposedDate && (
                      <div>
                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                          Proposed Date
                        </span>
                        <p className="text-gray-800 mt-1 text-base leading-relaxed">
                          {new Date(proposedDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedActivity?.venue && (
                        <div>
                          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                            Venue
                          </span>
                          <p className="text-gray-800 mt-1">
                            {selectedActivity.venue}
                          </p>
                        </div>
                      )}

                      {selectedActivity?.date && (
                        <div>
                          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                            Date
                          </span>
                          <p className="text-gray-800 mt-1">
                            {selectedActivity.date}
                          </p>
                        </div>
                      )}
                    </div>

                    {selectedActivity?.budget && (
                      <div>
                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                          Budget
                        </span>
                        <p className="text-gray-800 mt-1 text-lg font-semibold">
                          ₱{selectedActivity.budget.toLocaleString()}
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        Status
                      </span>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            selectedActivity?.overallStatus === "Approved"
                              ? "bg-green-100 text-green-800"
                              : selectedActivity?.overallStatus === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : selectedActivity?.overallStatus ===
                                "Approved For Conduct"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {selectedActivity?.overallStatus}
                        </span>
                      </div>
                    </div>

                    {selectedActivity?.alignedSDG &&
                      selectedActivity.alignedSDG.length > 0 && (
                        <div>
                          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                            Aligned SDG
                          </span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedActivity.alignedSDG.map((sdg, index) => (
                              <span
                                key={index}
                                className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium"
                              >
                                SDG {sdg}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Right Side - File Upload/Preview */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-3">
                    Document Upload
                  </h3>

                  {!uploadedFile ? (
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-8 pb-8">
                          <Upload className="w-16 h-16 mb-4 text-gray-400" />
                          <p className="mb-2 text-base text-gray-700">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-sm text-gray-500">
                            PDF files only (MAX. 10MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,application/pdf"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* File Info */}
                      <div className="bg-white rounded-lg border-2 border-green-200 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-3xl">📄</div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-gray-800 truncate">
                                {uploadedFile.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {(uploadedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleRemoveFile}
                            className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 hover:bg-red-50 rounded transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* PDF Preview */}
                      <div
                        className="bg-white rounded-lg border overflow-hidden"
                        style={{ height: "500px" }}
                      >
                        <iframe
                          src={pdfUrl}
                          className="w-full h-full"
                          title="PDF Preview"
                          frameBorder="0"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Footer - Action Buttons */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex gap-4 justify-end">
            <button
              onClick={onClose}
              className="px-8 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={!selectedActivity || !uploadedFile || !proposedDate}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                selectedActivity && uploadedFile && proposedDate
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Submit Proposal
            </button>
          </div>
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
            onClose(); // ✅ after popup closes, close AddProposal modal
          }}
        />
      )}
    </div>
  );
}
