import React, { useState, useRef } from "react";
import { Save, X } from "lucide-react";
import { ProportionCropTool } from "../../../../../components/image_uploader";
import axios from "axios";
import { API_ROUTER } from "../../../../../App";
import { departments } from "../../../../../components/department_arrays";

export default function AddRosterForm({ onClose, orgData, onMemberAdded }) {
  const initialState = {
    organizationProfile: "",
    isComplete: false,
    overAllStatus: "Pending",
    rosterMember: {
      name: "",
      email: "",
      address: "",
      department: orgData?.orgDepartment || "",
      course: orgData?.orgCourse || "",
      year: "",
      basePosition: "", // <- added
      position: "",
      birthDate: "",
      studentId: "",
      contactNumber: "",
      status: "",
    },
  };

  const [rosterData, setRosterData] = useState(initialState);
  const [cropData, setCropData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const cropRef = useRef();

  const resetForm = () => {
    setRosterData(initialState);
    setCropData(null);
    setErrors({});
    if (cropRef.current && cropRef.current.reset) {
      cropRef.current.reset();
    }
  };

  const updateMember = (field, value) => {
    setRosterData((prev) => ({
      ...prev,
      rosterMember: {
        ...prev.rosterMember,
        [field]: value,
      },
    }));

    setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
  };

  const handleBasePositionChange = (value) => {
    // update basePosition and position together to avoid transient inconsistent state
    setRosterData((prev) => ({
      ...prev,
      rosterMember: {
        ...prev.rosterMember,
        basePosition: value,
        position: value === "Member" ? "Member" : "",
      },
    }));

    setErrors((prev) => ({ ...prev, position: "" }));
  };

  // 🔹 Auto-format Student ID to "00-0000"
  const handleStudentIdChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // remove non-numeric
    if (value.length > 6) value = value.slice(0, 6);
    if (value.length > 2) {
      value = value.slice(0, 2) + "-" + value.slice(2);
    }
    updateMember("studentId", value);
  };

  const validateForm = () => {
    const newErrors = {};
    const member = rosterData.rosterMember;

    if (!member.name.trim()) newErrors.name = "Full name is required";
    if (!member.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!member.studentId.trim()) {
      newErrors.studentId = "Student ID is required";
    } else if (!/^\d{2}-\d{4}$/.test(member.studentId)) {
      newErrors.studentId = "Format must be 00-0000";
    }

    // Position is required only when Officer is selected
    if (member.basePosition === "Officer" && !member.position.trim()) {
      newErrors.position = "Officer position is required";
    }

    if (!member.basePosition)
      newErrors.basePosition = "Select Member or Officer";
    if (!member.year) newErrors.year = "Year level is required";
    if (!member.department) newErrors.department = "Department is required";
    if (!member.course) newErrors.course = "Course is required";
    if (!member.birthDate) newErrors.birthDate = "Birth date is required";
    if (!member.status) newErrors.status = "Status is required";
    if (!member.address.trim()) newErrors.address = "Address is required";
    if (!member.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^[+]?[\d\s\-()]+$/.test(member.contactNumber)) {
      newErrors.contactNumber = "Enter a valid contact number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCropComplete = (result) => {
    setCropData(result);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert("Please fix the errors in the form before submitting.");
      return;
    }

    setIsProcessing(true);
    try {
      let finalCropData = cropData;
      if (cropRef.current && cropRef.current.hasImage && !cropData) {
        const result = await cropRef.current.cropImage();
        if (result) {
          finalCropData = result;
          setCropData(result);
        }
      }

      const formData = new FormData();
      formData.append("organization", orgData.organization);
      formData.append("organizationProfile", orgData._id);
      formData.append("isComplete", String(rosterData.isComplete));
      formData.append("overAllStatus", rosterData.overAllStatus);

      const member = rosterData.rosterMember;
      Object.keys(member).forEach((key) =>
        formData.append(key, member[key] || "")
      );

      if (finalCropData && finalCropData.croppedFile) {
        formData.append("file", finalCropData.croppedFile);
        formData.append("profilePicture", finalCropData.croppedFile.name);
      }

      formData.append("submittedAt", new Date().toISOString());
      formData.append("totalMembers", "1");

      await axios.post(`${API_ROUTER}/addRosterMember`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Roster submitted successfully!");
      resetForm();
      onMemberAdded ? onMemberAdded() : onClose();
    } catch (error) {
      console.error("Error:", error);
      alert("Error submitting form.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-4xl max-h-[90vh] overflow-auto relative mx-auto p-6 rounded-xl bg-white">
      <X
        size={20}
        className="text-red absolute top-4 right-4 cursor-pointer hover:text-red-700"
        onClick={onClose}
      />

      <h1 className="text-3xl text-center font-bold text-gray-900 mb-6">
        Add Roster Member
      </h1>

      <div className="flex flex-col gap-6">
        <ProportionCropTool
          title="Crop Your Image"
          cropRef={cropRef}
          onCropComplete={handleCropComplete}
          maxImageHeight={500}
          showReset={true}
        />

        {/* Member Information */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={rosterData.rosterMember.name}
                onChange={(e) => updateMember("name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter full name"
                required
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={rosterData.rosterMember.email}
                onChange={(e) => updateMember("email", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter email"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={rosterData.rosterMember.studentId}
                onChange={handleStudentIdChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.studentId ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="00-0000"
                required
              />
              {errors.studentId && (
                <p className="text-red-500 text-sm">{errors.studentId}</p>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position <span className="text-red-500">*</span>
              </label>

              <div className="flex items-center gap-6 mb-2">
                {/* Member Radio */}
                <label
                  htmlFor="basePositionMember"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    id="basePositionMember"
                    type="radio"
                    name="basePosition"
                    value="Member"
                    checked={rosterData.rosterMember.basePosition === "Member"}
                    onChange={() => handleBasePositionChange("Member")}
                    className="h-4 w-4"
                  />
                  <span>Member</span>
                </label>

                {/* Officer Radio */}
                <label
                  htmlFor="basePositionOfficer"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    id="basePositionOfficer"
                    type="radio"
                    name="basePosition"
                    value="Officer"
                    checked={rosterData.rosterMember.basePosition === "Officer"}
                    onChange={() => handleBasePositionChange("Officer")}
                    className="h-4 w-4"
                  />
                  <span>Officer</span>
                </label>
              </div>

              {/* Officer’s Specific Position Input */}
              {rosterData.rosterMember.basePosition === "Officer" && (
                <input
                  type="text"
                  value={rosterData.rosterMember.position}
                  onChange={(e) => updateMember("position", e.target.value)}
                  placeholder="Enter officer position"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.position ? "border-red-500" : "border-gray-300"
                  }`}
                  required={rosterData.rosterMember.basePosition === "Officer"}
                />
              )}

              {errors.basePosition && (
                <p className="text-red-500 text-sm">{errors.basePosition}</p>
              )}
              {errors.position && (
                <p className="text-red-500 text-sm">{errors.position}</p>
              )}
            </div>

            {/* Year Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Level <span className="text-red-500">*</span>
              </label>
              <select
                value={rosterData.rosterMember.year}
                onChange={(e) => updateMember("year", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.year ? "border-red-500" : "border-gray-300"
                }`}
                required
              >
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Graduate">Graduate</option>
              </select>
              {errors.year && (
                <p className="text-red-500 text-sm">{errors.year}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={rosterData.rosterMember.department}
                onChange={(e) => updateMember("department", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.department ? "border-red-500" : "border-gray-300"
                }`}
                required
              >
                <option value="">Select Department</option>
                {Object.keys(departments).map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-red-500 text-sm">{errors.department}</p>
              )}
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                value={rosterData.rosterMember.course}
                onChange={(e) => updateMember("course", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.course ? "border-red-500" : "border-gray-300"
                }`}
                required
              >
                <option value="">Select Course</option>
                {rosterData.rosterMember.department &&
                  departments[rosterData.rosterMember.department]?.map(
                    (course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    )
                  )}
              </select>
              {errors.course && (
                <p className="text-red-500 text-sm">{errors.course}</p>
              )}
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birth Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={rosterData.rosterMember.birthDate}
                onChange={(e) => updateMember("birthDate", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.birthDate ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.birthDate && (
                <p className="text-red-500 text-sm">{errors.birthDate}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={rosterData.rosterMember.status || ""}
                onChange={(e) => updateMember("status", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.status ? "border-red-500" : "border-gray-300"
                }`}
                required
              >
                <option value="" disabled>
                  Select a status
                </option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>

              {errors.status && (
                <p className="text-red-500 text-sm">{errors.status}</p>
              )}
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={rosterData.rosterMember.contactNumber}
                onChange={(e) => {
                  if (
                    /^[0-9]*$/.test(e.target.value) &&
                    e.target.value.length <= 11
                  ) {
                    updateMember("contactNumber", e.target.value);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.contactNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter 11-digit contact number"
                required
                inputMode="numeric"
              />
              {errors.contactNumber && (
                <p className="text-red-500 text-sm">{errors.contactNumber}</p>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rosterData.rosterMember.address}
                onChange={(e) => updateMember("address", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.address ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter address"
                required
              />
              {errors.address && (
                <p className="text-red-500 text-sm">{errors.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Reset Form
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <Save size={20} />
            {isProcessing ? "Processing..." : "Save Roster"}
          </button>
        </div>
      </div>
    </div>
  );
}
