import { useState } from "react";
import { Upload } from "lucide-react";
import { DonePopUp } from "../../../../components/components";
import { API_ROUTER } from "../../../../App";
import axios from "axios";

export function AddNewProposal({ onClose, orgData }) {
  const [formData, setFormData] = useState({
    activityTitle: "",
    briefDetails: "",
    alignedObjective: "",
    venue: "",
    date: "",
    budget: "",
    alignedSDG: [],
    organizationProfile: orgData._id || "",
    organization: orgData.organization || "",
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    if (name === "date" && value) {
      const date = new Date(value); // value is yyyy-MM-dd
      processedValue = date.toISOString(); // standard full ISO string
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSDGChange = (sdg) => {
    setFormData((prev) => ({
      ...prev,
      alignedSDG: prev.alignedSDG.includes(sdg)
        ? prev.alignedSDG.filter((item) => item !== sdg)
        : [...prev.alignedSDG, sdg],
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
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

  const handleRemoveFile = () => {
    setUploadedFile(null);
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

    // Fix: Convert budget to number and validate properly
    const budgetValue = parseFloat(formData.budget);
    if (!formData.budget.trim() || isNaN(budgetValue) || budgetValue <= 0) {
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

    if (!uploadedFile) {
      newErrors.file = "Please upload a proposal document";
    }

    setErrors(newErrors);

    // Log validation results
    const isValid = Object.keys(newErrors).length === 0;

    if (!isValid) {
      console.log("❌ Validation failed. Missing/invalid fields:");
      Object.entries(newErrors).forEach(([field, error]) => {
        console.log(`  - ${field}: ${error}`);
      });
      console.log("📋 Current form data:", formData);
      console.log("📄 Uploaded file:", uploadedFile);
    } else {
      console.log("✅ Validation passed successfully!");
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 handleSubmit triggered");

    if (!validateForm()) {
      console.log("handleSubmit not right");
      return;
    }

    console.log("📋 Form Data:", formData);
    console.log("📄 Uploaded File:", uploadedFile);

    try {
      // Build FormData to support file upload
      const fd = new FormData();

      // ✅ Append each field individually (not as nested proposalData object)
      fd.append("activityTitle", formData.activityTitle);
      fd.append("briefDetails", formData.briefDetails);
      fd.append("alignedObjective", formData.alignedObjective);
      fd.append("venue", formData.venue);
      fd.append("date", formData.date);
      fd.append("budget", parseFloat(formData.budget));
      fd.append("alignedSDG", JSON.stringify(formData.alignedSDG)); // Array needs to be stringified
      fd.append("organization", formData.organization);
      fd.append("organizationProfile", formData.organizationProfile);
      fd.append("overallStatus", "Pending");
      fd.append("submittedAt", new Date().toISOString());

      // Append uploaded file
      if (uploadedFile) {
        fd.append("file", uploadedFile);
      }

      const res = await axios.post(
        `${API_ROUTER}/postStudentLeaderNewProposalConduct`,
        fd,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ Upload response:", res.data);
      setShowPopup("success");
    } catch (err) {
      console.error("❌ Upload failed:", err);
      setShowPopup("error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            Create New Proposal
          </h2>
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
                    value={formData.date ? formData.date.split("T")[0] : ""}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (₱) *
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.budget ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                {errors.budget && (
                  <p className="text-red-500 text-sm mt-1">{errors.budget}</p>
                )}
              </div>
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
                {errors.alignedSDG && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.alignedSDG}
                  </p>
                )}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Proposal Document *
                </label>

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
              onClick={(e) => handleSubmit(e)}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Proposal
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
              onClose(); // ✅ after popup closes, close AddProposal modal
            }}
          />
        )}
      </div>
    </div>
  );
}
