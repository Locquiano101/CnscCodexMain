import React, { useState, useRef } from "react";
import { Save } from "lucide-react";
import { ProportionCropTool } from "../../../../../components/image_uploader";
import axios from "axios";
import { API_ROUTER } from "../../../../../App";
import { departments } from "../../../../../components/department_arrays";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
    <>
      <DialogHeader className="px-6 py-6 border-b bg-white">
        <DialogTitle className="text-2xl font-bold text-gray-900">
          Add Roster Member
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="flex flex-col gap-6">
        <ProportionCropTool
          title="Crop Your Image"
          cropRef={cropRef}
          onCropComplete={handleCropComplete}
          maxImageHeight={500}
          showReset={true}
        />

        {/* Member Information */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-xl">Member Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Full Name */}
              <div>
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={rosterData.rosterMember.name}
                  onChange={(e) => updateMember("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                  placeholder="Enter full name"
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={rosterData.rosterMember.email}
                  onChange={(e) => updateMember("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                  placeholder="Enter email"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Student ID */}
              <div>
                <Label htmlFor="studentId">
                  Student ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="studentId"
                  type="text"
                  value={rosterData.rosterMember.studentId}
                  onChange={handleStudentIdChange}
                  className={errors.studentId ? "border-red-500" : ""}
                  placeholder="00-0000"
                  required
                />
                {errors.studentId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.studentId}
                  </p>
                )}
              </div>

              {/* Position */}
              <div>
                <Label>
                  Position <span className="text-red-500">*</span>
                </Label>

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
              <Label htmlFor="year">
                Year Level <span className="text-red-500">*</span>
              </Label>
              <Select
                value={rosterData.rosterMember.year}
                onValueChange={(value) => updateMember("year", value)}
                required
              >
                <SelectTrigger
                  id="year"
                  className={errors.year ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st Year">1st Year</SelectItem>
                  <SelectItem value="2nd Year">2nd Year</SelectItem>
                  <SelectItem value="3rd Year">3rd Year</SelectItem>
                  <SelectItem value="4th Year">4th Year</SelectItem>
                  <SelectItem value="Graduate">Graduate</SelectItem>
                </SelectContent>
              </Select>
              {errors.year && (
                <p className="text-red-500 text-sm mt-1">{errors.year}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <Label htmlFor="department">
                Department <span className="text-red-500">*</span>
              </Label>
              <Select
                value={rosterData.rosterMember.department}
                onValueChange={(value) => updateMember("department", value)}
                disabled
                required
              >
                <SelectTrigger
                  id="department"
                  className={`${errors.department ? "border-red-500" : ""} bg-gray-100`}
                >
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(departments).map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-red-500 text-sm mt-1">{errors.department}</p>
              )}
            </div>

            {/* Course */}
            <div>
              <Label htmlFor="course">
                Course <span className="text-red-500">*</span>
              </Label>
              <Select
                value={rosterData.rosterMember.course}
                onValueChange={(value) => updateMember("course", value)}
                disabled
                required
              >
                <SelectTrigger
                  id="course"
                  className={`${errors.course ? "border-red-500" : ""} bg-gray-100`}
                >
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  {rosterData.rosterMember.department &&
                    departments[rosterData.rosterMember.department]?.map(
                      (course) => (
                        <SelectItem key={course} value={course}>
                          {course}
                        </SelectItem>
                      )
                    )}
                </SelectContent>
              </Select>
              {errors.course && (
                <p className="text-red-500 text-sm mt-1">{errors.course}</p>
              )}
            </div>

            {/* Birth Date */}
            <div>
              <Label htmlFor="birthDate">
                Birth Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={rosterData.rosterMember.birthDate}
                onChange={(e) => updateMember("birthDate", e.target.value)}
                className={errors.birthDate ? "border-red-500" : ""}
                required
              />
              {errors.birthDate && (
                <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={rosterData.rosterMember.status || ""}
                onValueChange={(value) => updateMember("status", value)}
                required
              >
                <SelectTrigger
                  id="status"
                  className={errors.status ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
              )}
            </div>

            {/* Contact Number */}
            <div>
              <Label htmlFor="contactNumber">
                Contact Number <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center">
                <span className="px-3 py-2 border border-r-0 rounded-l-md bg-gray-100 text-gray-700 text-sm">
                  +63
                </span>
                <Input
                  id="contactNumber"
                  type="text"
                  value={
                    rosterData.rosterMember.contactNumber
                      ? rosterData.rosterMember.contactNumber.replace(
                          /^(\+?63)?\s?/,
                          ""
                        )
                      : ""
                  }
                  onChange={(e) => {
                    let input = e.target.value.replace(/\D/g, "");

                    if (/^9[0-9]{0,9}$/.test(input) || input === "") {
                      const formatted = input ? `+63 ${input}` : "";
                      updateMember("contactNumber", formatted);
                    }
                  }}
                  className={`rounded-l-none ${
                    errors.contactNumber ? "border-red-500" : ""
                  }`}
                  placeholder="9XXXXXXXXX"
                  required
                  inputMode="numeric"
                />
              </div>
              {errors.contactNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-3">
              <Label htmlFor="address">
                Address <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="address"
                value={rosterData.rosterMember.address}
                onChange={(e) => updateMember("address", e.target.value)}
                className={errors.address ? "border-red-500" : ""}
                placeholder="Enter address"
                required
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>

      {/* Footer with Buttons */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            onClick={resetForm}
            variant="outline"
          >
            Reset Form
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          >
            <Save size={20} />
            {isProcessing ? "Processing..." : "Save Roster"}
          </Button>
        </div>
      </div>
    </>
  );
}
