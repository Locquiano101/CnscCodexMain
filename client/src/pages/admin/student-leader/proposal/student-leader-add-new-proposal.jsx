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
    otherVenue: "",
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
      const date = new Date(value);
      processedValue = date.toISOString();
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
    } else if (formData.venue === "Other" && !formData.otherVenue.trim()) {
      newErrors.venue = "Please specify the venue";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    const budgetValue = parseFloat(formData.budget.replace(/,/g, ""));
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

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const fd = new FormData();

      fd.append("activityTitle", formData.activityTitle);
      fd.append("briefDetails", formData.briefDetails);
      fd.append("alignedObjective", formData.alignedObjective);
      fd.append(
        "venue",
        formData.venue === "Other" ? formData.otherVenue : formData.venue
      );
      fd.append("date", formData.date);
      fd.append("budget", parseFloat(formData.budget.replace(/,/g, "")));
      fd.append("alignedSDG", JSON.stringify(formData.alignedSDG));
      fd.append("organization", formData.organization);
      fd.append("organizationProfile", formData.organizationProfile);
      fd.append("overallStatus", "Pending");
      fd.append("submittedAt", new Date().toISOString());

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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side */}
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
                {/* Venue Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue *
                  </label>
                  <select
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.venue ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">-- Select Venue --</option>
                    <option value="Covered Court">Covered Court</option>
                    <option value="Student Activity Center">
                      Student Activity Center
                    </option>
                    <option value="Pavilion">Pavilion</option>
                    <option value="Student Park">Student Park</option>
                    <option value="Cafeteria">Cafeteria</option>
                    <option value="Other">Other</option>
                  </select>

                  {formData.venue === "Other" && (
                    <input
                      type="text"
                      name="otherVenue"
                      value={formData.otherVenue}
                      onChange={handleInputChange}
                      placeholder="Enter other venue"
                      className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    />
                  )}

                  {errors.venue && (
                    <p className="text-red-500 text-sm mt-1">{errors.venue}</p>
                  )}
                </div>

                {/* Date */}
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
                  type="text"
                  name="budget"
                  value={formData.budget}
                  onChange={(e) => {
                    let rawValue = e.target.value.replace(/,/g, "");
                    if (!isNaN(rawValue) && rawValue !== "") {
                      const formatted =
                        parseFloat(rawValue).toLocaleString("en-US");
                      setFormData((prev) => ({ ...prev, budget: formatted }));
                    } else {
                      setFormData((prev) => ({ ...prev, budget: "" }));
                    }
                    if (errors.budget) {
                      setErrors((prev) => ({ ...prev, budget: "" }));
                    }
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.budget ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                />
                {errors.budget && (
                  <p className="text-red-500 text-sm mt-1">{errors.budget}</p>
                )}
              </div>
            </div>

            {/* Right Side - SDG Selection and File Upload */}
            <div className="space-y-6">
              {/* SDG Section */}
              <div className="md:col-span-2 text-black">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Aligned Sustainable Development Goals (SDGs){" "}
                  <span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                  {[
                    { value: "SDG 1", label: "No Poverty" },
                    { value: "SDG 2", label: "Zero Hunger" },
                    { value: "SDG 3", label: "Good Health & Well-being" },
                    { value: "SDG 4", label: "Quality Education" },
                    { value: "SDG 5", label: "Gender Equality" },
                    { value: "SDG 6", label: "Clean Water & Sanitation" },
                    { value: "SDG 7", label: "Affordable & Clean Energy" },
                    { value: "SDG 8", label: "Decent Work & Economic Growth" },
                    {
                      value: "SDG 9",
                      label: "Industry, Innovation & Infrastructure",
                    },
                    { value: "SDG 10", label: "Reduced Inequalities" },
                    {
                      value: "SDG 11",
                      label: "Sustainable Cities & Communities",
                    },
                    {
                      value: "SDG 12",
                      label: "Responsible Consumption & Production",
                    },
                    { value: "SDG 13", label: "Climate Action" },
                    { value: "SDG 14", label: "Life Below Water" },
                    { value: "SDG 15", label: "Life on Land" },
                    {
                      value: "SDG 16",
                      label: "Peace, Justice & Strong Institutions",
                    },
                    { value: "SDG 17", label: "Partnerships for the Goals" },
                  ].map((sdg) => {
                    const isSelected = formData.alignedSDG.includes(sdg.value);
                    return (
                      <button
                        key={sdg.value}
                        type="button"
                        onClick={() => handleSDGChange(sdg.value)}
                        className={`flex flex-col items-start text-left gap-1 px-4 py-3 rounded-lg border transition-all duration-200
            ${
              isSelected
                ? "border-amber-500 bg-amber-50 text-amber-700 shadow-sm"
                : "border-gray-200 bg-gray-50 text-gray-800 hover:border-gray-300 hover:bg-gray-100"
            }`}
                      >
                        <span className="font-semibold text-sm">
                          {sdg.value}
                        </span>
                        <span className="text-xs text-gray-600">
                          {sdg.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {errors.alignedSDG && (
                  <p className="text-red-500 text-sm mt-2">
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

        {/* Footer */}
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
              Submit Proposal
            </button>
          </div>
        </div>
      </div>

      {showPopup && (
        <DonePopUp
          type={showPopup}
          onClose={() => {
            setShowPopup(null);
            if (showPopup === "success") {
              onClose();
            }
          }}
        />
      )}
    </div>
  );
}
