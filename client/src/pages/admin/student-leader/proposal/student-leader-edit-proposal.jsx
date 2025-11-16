import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
import { useState, useEffect } from "react";
import { Upload, FileText, X } from "lucide-react";
import CurrencyInput from "../../../../components/currency-input";
import { Banknote } from "lucide-react";
import { DonePopUp } from "../../../../components/components";
export function EditProposal({ proposal, onClose, onUpdated }) {
  console.log(proposal);
  // Pre-fill values with consistent field names
  const [formData, setFormData] = useState({
    activityTitle: proposal.ProposedIndividualActionPlan.activityTitle || "",
    briefDetails: proposal.ProposedIndividualActionPlan.briefDetails || "",
    alignedObjective:
      proposal.ProposedIndividualActionPlan.AlignedObjective || "",
    date: proposal.ProposedIndividualActionPlan.proposedDate
      ? new Date(proposal.ProposedIndividualActionPlan.proposedDate)
          .toISOString()
          .split("T")[0]
      : "",
    budget: proposal.ProposedIndividualActionPlan.budgetaryRequirements || "",
    venue: proposal.ProposedIndividualActionPlan.venue || "",
    alignedSDG: proposal.ProposedIndividualActionPlan.alignedSDG || [],
    organizationProfile: proposal.organizationProfile || "",
    organization: proposal.organization || "",
    overallStatus: proposal.overallStatus || "Pending",
  });

  console.log(formData);
  const [pdfUrl, setPdfUrl] = useState(null);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(null);

  // Existing PDF URL if available
  const [existingPdfUrl] = useState(
    proposal.document?.[0]?.fileName
      ? `${DOCU_API_ROUTER}/${proposal.organizationProfile}/${proposal.document[0].fileName}`
      : null
  );

  // Handle SDG checkbox changes
  const handleSDGChange = (sdgValue) => {
    setFormData((prev) => ({
      ...prev,
      alignedSDG: prev.alignedSDG.includes(sdgValue)
        ? prev.alignedSDG.filter((sdg) => sdg !== sdgValue)
        : [...prev.alignedSDG, sdgValue],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      setPdfUrl(URL.createObjectURL(file)); // 👈 generate preview URL
      if (errors.file) {
        setErrors((prev) => ({
          ...prev,
          file: "",
        }));
      }
    } else if (file) {
      setErrors((prev) => ({
        ...prev,
        file: "Please upload a PDF file only",
      }));
    }
  };

  useEffect(() => {
    if (proposal.document?.[0]?.fileUrl) {
      setPdfUrl(proposal.document[0].fileUrl);
    }
  }, [proposal]);

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setPdfUrl(null); // 👈 reset preview
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.activityTitle.trim()) {
      newErrors.activityTitle = "Activity title is required";
    }

    if (!formData.briefDetails.trim()) {
      newErrors.briefDetails = "Brief details are required";
    }

    if (!formData.alignedObjective.trim()) {
      newErrors.alignedObjective = "Aligned objective is required";
    }

    if (!formData.venue.trim()) {
      newErrors.venue = "Venue is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.budget || formData.budget <= 0) {
      newErrors.budget = "Budget must be a positive number";
    }

    if (!formData.organization.trim()) {
      newErrors.organization = "Organization is required";
    }

    if (!formData.organizationProfile.trim()) {
      newErrors.organizationProfile = "Organization profile is required";
    }

    if (formData.alignedSDG.length === 0) {
      newErrors.alignedSDG = "Please select at least one SDG";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const data = new FormData();

    // Required identifiers
    data.append("ProposedActionPlanSchema", proposal.ProposedActionPlanSchema);
    data.append("organizationProfile", formData.organizationProfile);
    data.append("organization", formData.organization);

    // Editable fields
    data.append("activityTitle", formData.activityTitle);
    data.append("briefDetails", formData.briefDetails);
    data.append("AlignedObjective", formData.alignedObjective);
    data.append("proposedDate", formData.date);
    data.append("budgetaryRequirements", formData.budget);
    data.append("venue", formData.venue);
    formData.alignedSDG.forEach((sdg) => data.append("alignedSDG[]", sdg));
    data.append("overallStatus", formData.overallStatus);

    if (uploadedFile) {
      data.append("file", uploadedFile);
      data.append("label", "Proposal");
    }

    console.log(data);
    try {
      const res = await axios.put(
        `${API_ROUTER}/updateProposalConduct/${proposal._id}`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setShowPopup("success");
      if (onUpdated) onUpdated(res.data);
    } catch (err) {
      console.error(err);
      setShowPopup("error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Edit Proposal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Form Fields */}
            <div className="space-y-6">
              {/* Activity Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Title *
                </label>
                <input
                  type="text"
                  name="activityTitle"
                  value={formData.activityTitle}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.activityTitle ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter activity title"
                />
                {errors.activityTitle && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.activityTitle}
                  </p>
                )}
              </div>

              {/* Brief Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brief Details *
                </label>
                <textarea
                  name="briefDetails"
                  value={formData.briefDetails}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.briefDetails ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Provide brief details about the activity"
                />
                {errors.briefDetails && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.briefDetails}
                  </p>
                )}
              </div>

              {/* Aligned Objective */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aligned Objective *
                </label>
                <textarea
                  name="alignedObjective"
                  value={formData.alignedObjective}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.alignedObjective
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="What objectives does this activity align with?"
                />
                {errors.alignedObjective && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.alignedObjective}
                  </p>
                )}
              </div>

              {/* Venue and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue *
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.venue ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Event venue"
                  />
                  {errors.venue && (
                    <p className="text-red-500 text-sm mt-1">{errors.venue}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.date ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                  )}
                </div>
              </div>

              {/* Budget */}
              <CurrencyInput
                label="Budget *"
                Icon={Banknote}
                type="number"
                inputMode="decimal"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="0.00"
                min={0}
                step={0.01}
                inputClassName={`rounded-lg ${errors.budget ? "border-red-500" : "border-gray-300"} focus:ring-blue-500 focus:border-transparent`}
                error={errors.budget}
              />
            </div>

            {/* Right Side - SDG Selection and File Upload */}
            <div className="space-y-6">
              {/* Aligned SDG */}
              <div className="md:col-span-2 text-black">
                <label className="block text-sm font-medium text-black mb-2">
                  Aligned SDG *
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "SDG 1", label: "SDG 1: No Poverty" },
                    { value: "SDG 2", label: "SDG 2: Zero Hunger" },
                    {
                      value: "SDG 3",
                      label: "SDG 3: Good Health and Well-being",
                    },
                    { value: "SDG 4", label: "SDG 4: Quality Education" },
                    { value: "SDG 5", label: "SDG 5: Gender Equality" },
                    {
                      value: "SDG 6",
                      label: "SDG 6: Clean Water and Sanitation",
                    },
                    {
                      value: "SDG 7",
                      label: "SDG 7: Affordable and Clean Energy",
                    },
                    {
                      value: "SDG 8",
                      label: "SDG 8: Decent Work and Economic Growth",
                    },
                    {
                      value: "SDG 9",
                      label: "SDG 9: Industry, Innovation and Infrastructure",
                    },
                    { value: "SDG 10", label: "SDG 10: Reduced Inequalities" },
                    {
                      value: "SDG 11",
                      label: "SDG 11: Sustainable Cities and Communities",
                    },
                    {
                      value: "SDG 12",
                      label: "SDG 12: Responsible Consumption and Production",
                    },
                    { value: "SDG 13", label: "SDG 13: Climate Action" },
                    { value: "SDG 14", label: "SDG 14: Life Below Water" },
                    { value: "SDG 15", label: "SDG 15: Life on Land" },
                    {
                      value: "SDG 16",
                      label: "SDG 16: Peace, Justice and Strong Institutions",
                    },
                    {
                      value: "SDG 17",
                      label: "SDG 17: Partnerships for the Goals",
                    },
                  ].map((sdg) => (
                    <div key={sdg.value} className="bg-gray-200 rounded-full">
                      <label className="flex items-center space-x-1 p-2 hover:bg-gray-100 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.alignedSDG.includes(sdg.value)}
                          onChange={() => handleSDGChange(sdg.value)}
                          className="appearance-none h-5 w-5 rounded-full border border-gray-400 checked:bg-amber-500 cursor-pointer"
                        />
                        <span className="text-sm">{sdg.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Proposal Document *
                </label>

                {/* Show existing document info if available */}
                {existingPdfUrl &&
                  !uploadedFile &&
                  proposal.document?.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      {proposal.document.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between mb-2 last:mb-0"
                        >
                          <div className="flex items-center text-sm text-blue-700">
                            <div className="text-lg mr-2">📄</div>
                            <span>{doc.fileName}</span>
                          </div>
                          <a
                            href={doc.fileUrl} // 👈 make sure backend provides this per file
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                {!uploadedFile ? (
                  <div className="flex items-center justify-center w-full">
                    <label
                      className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer bg-white hover:bg-gray-100 transition-colors ${
                        errors.file ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-700">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
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
                  <div className="bg-white rounded-lg border-2 border-green-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">📄</div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-800 truncate">
                            {uploadedFile.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
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

                {errors.file && (
                  <p className="text-red-500 text-sm mt-1">{errors.file}</p>
                )}
              </div>
            </div>
          </div>
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
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Update Proposal
            </button>
          </div>
        </div>
      </div>

      {showPopup && (
        <DonePopUp
          type={showPopup}
          message={
            showPopup === "success"
              ? "Proposal updated successfully!"
              : "Something went wrong."
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
