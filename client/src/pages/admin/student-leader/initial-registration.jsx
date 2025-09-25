import React, { useState } from "react";
import { User, Building } from "lucide-react";
import axios from "axios";
import { API_ROUTER } from "./../../../App";

export function InitialRegistration({ user, onComplete }) {
  const [formData, setFormData] = useState({
    adviserName: "",
    adviserEmail: "",
    adviserDepartment: "",
    orgName: "",
    orgAcronym: "",
    orgEmail: user?.email,
    orgClass: "System-wide",
    orgDepartment: "",
    orgCourse: "",
    orgSpecialization: "",
    studentGovDepartment: "", // New field for student government department
    userId: user?.userId,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // 🔄 Loading state
  const [submitError, setSubmitError] = useState(""); // ❌ Server error/conflict

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "orgDepartment" && formData.orgClass === "Local") {
      setFormData((prev) => ({
        ...prev,
        orgDepartment: value,
        adviserDepartment: value,
      }));
    }

    if (
      name === "studentGovDepartment" &&
      formData.orgSpecialization === "Student government"
    ) {
      setFormData((prev) => ({
        ...prev,
        studentGovDepartment: value,
        orgDepartment: value,
        adviserDepartment: value,
      }));
    }
  };

  const handleClassificationChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      orgClass: value,
      orgDepartment: "",
      orgCourse: "",
      orgSpecialization: "",
      studentGovDepartment: "",
      adviserDepartment: "",
    }));
  };

  const handleSpecializationChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      orgSpecialization: value,
      studentGovDepartment: "",
      orgDepartment: value === "Student government" ? "" : prev.orgDepartment,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.adviserName.trim())
      newErrors.adviserName = "Adviser name is required";
    if (!formData.adviserEmail.trim())
      newErrors.adviserEmail = "Adviser email is required";
    if (!formData.adviserDepartment.trim())
      newErrors.adviserDepartment = "Adviser department is required";
    if (!formData.orgName.trim())
      newErrors.orgName = "Organization name is required";
    if (!formData.orgClass)
      newErrors.orgClass = "Organization class is required";
    if (!formData.orgAcronym.trim())
      newErrors.orgAcronym = "Organization acronym is required";
    if (!formData.orgEmail.trim())
      newErrors.orgEmail = "Organization email is required";

    if (formData.orgClass === "Local") {
      if (!formData.orgDepartment)
        newErrors.orgDepartment = "Organization department is required";
      if (!formData.orgCourse)
        newErrors.orgCourse = "Organization course is required";
    } else if (formData.orgClass === "System-wide") {
      if (!formData.orgSpecialization.trim())
        newErrors.orgSpecialization = "Specialization is required";

      if (formData.orgSpecialization === "Student government") {
        if (!formData.studentGovDepartment.trim()) {
          newErrors.studentGovDepartment =
            "Department is required for student government";
        } else {
          formData.orgDepartment = formData.studentGovDepartment;
        }
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.adviserEmail && !emailRegex.test(formData.adviserEmail)) {
      newErrors.adviserEmail = "Please enter a valid email address";
    }
    if (formData.orgEmail && !emailRegex.test(formData.orgEmail)) {
      newErrors.orgEmail = "Please enter a valid email address";
    }

    // 🚨 Prevent adviser and org from having the same email
    if (
      formData.adviserEmail.trim() &&
      formData.orgEmail.trim() &&
      formData.adviserEmail.trim().toLowerCase() ===
        formData.orgEmail.trim().toLowerCase()
    ) {
      newErrors.adviserEmail =
        "Adviser email cannot be the same as organization email";
      newErrors.orgEmail =
        "Organization email cannot be the same as adviser email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitError(""); // clear old errors
    if (validateForm()) {
      try {
        setLoading(true);
        console.log("Form submitted:", formData);

        const result = await axios.post(
          `${API_ROUTER}/initialRegistration`,
          formData,
          { withCredentials: true }
        );
        console.log("Registration successful:", result);

        setLoading(false);
        onComplete?.();
      } catch (error) {
        console.error("Error submitting initial registration:", error);

        // If conflict (409), show special error
        if (error.response?.status === 409) {
          setSubmitError("This organization is already registered.");
        } else {
          setSubmitError("Registration failed. Please try again.");
        }

        setLoading(false);
      }
    }
  };

  return (
    <div className="absolute inset-0 h-screen w-screen overflow-hidden backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="max-h-9/10 h-fit flex-col max-w-5xl rounded-xl gap-4 w-full p border-gray-500 bg-gray-300 flex  items-center px-8 py-6 overflow-hidden">
        <h1 className="text-3xl font-bold text-b">
          WELCOME TO INITIAL REGISTRATION OF YOUR ORGANIZATION
        </h1>

        <div className="h-full w-full overflow-y-auto">
          {/* Organization Information */}
          <div className="w-full border border-gray-300 rounded-xl bg-white px-6 py-4 mb-4">
            <h1 className="text-xl font-semibold mb-4 flex items-center">
              <Building className="mr-2 h-5 w-5 text-amber-600" />
              Organization Information
            </h1>

            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              <div className="flex flex-col col-span-2 gap-2">
                <label className="block text-lg font-medium text-gray-700">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="orgName"
                  value={formData.orgName}
                  onChange={handleInputChange}
                  className={`${"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"} ${
                    errors.orgName ? "border-red-500" : ""
                  }`}
                  placeholder="(Example: Union of Supreme Student Government)"
                />
                {errors.orgName && (
                  <p className="text-red-500 text-sm px-4">{errors.orgName}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="block text-lg font-medium text-gray-700">
                  Acronym <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="orgAcronym"
                  value={formData.orgAcronym}
                  onChange={handleInputChange}
                  className={`${"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"} ${
                    errors.orgAcronym ? "border-red-500" : ""
                  }`}
                  placeholder="(Example: USSG)"
                />
                {errors.orgAcronym && (
                  <p className="text-red-500 text-sm px-4">
                    {errors.orgAcronym}
                  </p>
                )}
              </div>

              {/* Classification */}
              <div className=" flex flex-col gap-2">
                <label className="block text-lg font-medium text-gray-700">
                  Classification <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4 px-4 py-3 rounded-lg border-gray-300 border bg-gray-100 ">
                  {["System-wide", "Local"].map((option) => (
                    <div key={option} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`orgClass${option}`}
                        name="orgClass"
                        value={option}
                        checked={formData.orgClass === option}
                        onChange={handleClassificationChange}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor={`orgClass${option}`} className="text-lg">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.orgClass && (
                  <p className="text-red-500 text-sm px-4">{errors.orgClass}</p>
                )}
              </div>

              <div className="flex col-span-2 flex-col gap-2">
                <label className="block text-lg font-medium text-gray-700">
                  Organization Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="orgEmail"
                  value={formData.orgEmail}
                  readOnly
                  className={`${"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"} bg-gray-100 cursor-not-allowed ${
                    errors.orgEmail ? "border-red-500" : ""
                  }`}
                  placeholder="organization@email.com"
                />
                {errors.orgEmail && (
                  <p className="text-red-500 text-sm px-4">{errors.orgEmail}</p>
                )}
              </div>

              {/* For Local Classification */}
              {formData.orgClass === "Local" && (
                <div className="flex col-span-3 gap-6 ">
                  <div className="flex flex-1 flex-col gap-2">
                    <label className="block text-lg font-medium text-gray-700">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="orgDepartment"
                      value={formData.orgDepartment}
                      onChange={handleInputChange}
                      className={`${"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"} ${
                        errors.orgDepartment ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select Department</option>
                      {Object.keys(departments).map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    {errors.orgDepartment && (
                      <p className="text-red-500 text-sm px-4">
                        {errors.orgDepartment}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 gap-2">
                    <label className="block text-lg font-medium text-gray-700">
                      Course <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="orgCourse"
                      value={formData.orgCourse}
                      onChange={handleInputChange}
                      className={`${"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"} ${
                        errors.orgCourse ? "border-red-500" : ""
                      }`}
                      disabled={!formData.orgDepartment}
                    >
                      <option value="">Select Course</option>
                      {formData.orgDepartment &&
                        departments[formData.orgDepartment]?.map((course) => (
                          <option key={course} value={course}>
                            {course}
                          </option>
                        ))}
                    </select>
                    {errors.orgCourse && (
                      <p className="text-red-500 text-sm px-4">
                        {errors.orgCourse}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* For System-wide Classification */}
              {formData.orgClass === "System-wide" && (
                <div className="flex  col-span-3 gap-4">
                  <div className="flex flex-col flex-1 gap-2">
                    <label className="block text-lg font-medium text-gray-700">
                      Specialization <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="orgSpecialization"
                      value={formData.orgSpecialization}
                      onChange={handleSpecializationChange}
                      className={`${"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"} ${
                        errors.orgSpecialization ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select Specialization</option>
                      {orgSpecializations.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                    {errors.orgSpecialization && (
                      <p className="text-red-500 text-sm px-4">
                        {errors.orgSpecialization}
                      </p>
                    )}
                  </div>

                  {/* Student Government Department Field */}
                  {formData.orgSpecialization === "Student government" && (
                    <div className="flex flex-col flex-1  gap-2">
                      <label className="block text-lg font-medium text-gray-700">
                        Department <span className="text-red-500">*</span>{" "}
                      </label>

                      <select
                        name="studentGovDepartment"
                        value={formData.studentGovDepartment}
                        onChange={handleInputChange}
                        className={`${"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"} ${
                          errors.studentGovDepartment ? "border-red-500" : ""
                        }`}
                      >
                        <option value="">Select Department</option>
                        {Object.keys(departments).map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                      {errors.studentGovDepartment && (
                        <p className="text-red-500 text-sm px-4">
                          {errors.studentGovDepartment}
                        </p>
                      )}
                      <span className="text-xs text-cnsc-accent-1-color">
                        Select Department of the Student Government.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Adviser Information */}
          <div className="w-full border border-gray-300 rounded-xl bg-white px-6 py-4 mb-4">
            <h1 className="text-xl font-semibold mb-4 flex items-center">
              <User className="mr-2 h-5 w-5 text-blue-600" />
              Adviser Information
            </h1>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex flex-col gap-2">
                <label className="block text-lg font-medium text-gray-700">
                  Adviser Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="adviserName"
                  value={formData.adviserName}
                  onChange={handleInputChange}
                  className={`${"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"} ${
                    errors.adviserName ? "border-red-500" : ""
                  }`}
                  placeholder="Enter adviser's full name"
                />
                {errors.adviserName && (
                  <p className="text-red-500 text-sm px-4">
                    {errors.adviserName}
                  </p>
                )}
              </div>

              <div className="flex flex-col col-span-2 gap-2">
                <label className="block text-lg font-medium text-gray-700">
                  Adviser Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="adviserEmail"
                  value={formData.adviserEmail}
                  onChange={handleInputChange}
                  className={`${"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"} ${
                    errors.adviserEmail ? "border-red-500" : ""
                  }`}
                  placeholder="adviser@university.edu"
                />
                {errors.adviserEmail && (
                  <p className="text-red-500 text-sm px-4">
                    {errors.adviserEmail}
                  </p>
                )}
              </div>

              <div className="flex flex-col col-span-3 gap-2">
                <label className="block text-lg font-medium text-gray-700">
                  Adviser Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="adviserDepartment"
                  value={formData.adviserDepartment}
                  onChange={handleInputChange}
                  className={`${"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"} ${
                    errors.adviserDepartment ? "border-red-500" : ""
                  }`}
                  disabled={
                    (formData.orgClass === "Local" && formData.orgDepartment) ||
                    (formData.orgClass === "System-wide" &&
                      formData.orgSpecialization === "Student government" &&
                      formData.studentGovDepartment)
                  }
                >
                  <option value="">Select department</option>
                  {Object.keys(departments).map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.adviserDepartment && (
                  <p className="text-red-500 text-sm px-4">
                    {errors.adviserDepartment}
                  </p>
                )}
                {formData.orgClass === "Local" && formData.orgDepartment && (
                  <p className="text-blue-600 text-sm px-4">
                    Auto-populated from organization department
                  </p>
                )}
                {formData.orgClass === "System-wide" &&
                  formData.orgSpecialization === "Student government" &&
                  formData.studentGovDepartment && (
                    <p className="text-blue-600 text-sm px-4">
                      Auto-populated from student government department
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {/* Submit Button */}
          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`px-8 py-4 rounded-xl font-bold ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-amber-300 hover:bg-amber-400"
              }`}
            >
              {loading ? "Registering..." : "Register Organization"}
            </button>

            {/* Error or Conflict Message */}
            {submitError && (
              <p className="text-red-600 font-medium text-sm">{submitError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReRegistration({ OrgData, user, onComplete }) {
  const [formData, setFormData] = useState({
    adviserName: OrgData.adviserName,
    adviserEmail: OrgData.adviserEmail,
    adviserDepartment: OrgData.adviserDepartment,
    orgName: OrgData.orgName,
    orgAcronym: OrgData.orgAcronym,
    orgEmail: user?.email,
    orgClass: OrgData.orgClass,
    orgDepartment: OrgData?.orgDepartment,
    orgCourse: OrgData?.orgCourse,
    orgSpecialization: OrgData?.orgSpecialization,
    studentGovDepartment: OrgData?.orgDepartment, // New field for student government department
    userId: user?.userId,
  });

  console.log("tite", OrgData);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "orgDepartment" && formData.orgClass === "Local") {
      setFormData((prev) => ({
        ...prev,
        orgDepartment: value,
        adviserDepartment: value,
      }));
    }

    // Auto-populate adviser department when student government department is selected
    if (
      name === "studentGovDepartment" &&
      formData.orgSpecialization === "Student government"
    ) {
      setFormData((prev) => ({
        ...prev,
        studentGovDepartment: value,
        orgDepartment: value,
        adviserDepartment: value,
      }));
    }
  };

  const handleClassificationChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      orgClass: value,
      orgDepartment: "",
      orgCourse: "",
      orgSpecialization: "",
      studentGovDepartment: "", // Reset student government department
      adviserDepartment: "",
    }));
  };

  const handleSpecializationChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      orgSpecialization: value,
      studentGovDepartment: "",
      orgDepartment: value === "Student government" ? "" : prev.orgDepartment, // Reset if "Student government"
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // General required fields
    if (!formData.adviserName.trim())
      newErrors.adviserName = "Adviser name is required";
    if (!formData.adviserEmail.trim())
      newErrors.adviserEmail = "Adviser email is required";
    if (!formData.adviserDepartment.trim())
      newErrors.adviserDepartment = "Adviser department is required";
    if (!formData.orgName.trim())
      newErrors.orgName = "Organization name is required";
    if (!formData.orgClass)
      newErrors.orgClass = "Organization class is required";
    if (!formData.orgAcronym.trim())
      newErrors.orgAcronym = "Organization acronym is required";
    if (!formData.orgEmail.trim())
      newErrors.orgEmail = "Organization email is required";

    // Conditional validations
    if (formData.orgClass === "Local") {
      if (!formData.orgDepartment)
        newErrors.orgDepartment = "Organization department is required";
      if (!formData.orgCourse)
        newErrors.orgCourse = "Organization course is required";
    } else if (formData.orgClass === "System-wide") {
      if (!formData.orgSpecialization.trim())
        newErrors.orgSpecialization = "Specialization is required";

      // Handle Student Government case
      if (formData.orgSpecialization === "Student government") {
        if (!formData.studentGovDepartment.trim()) {
          newErrors.studentGovDepartment =
            "Department is required for student government";
        } else {
          // ✅ Assign studentGovDepartment to orgDepartment
          formData.orgSpecialization = formData.orgSpecialization;
          formData.orgDepartment = formData.studentGovDepartment;
        }
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.adviserEmail && !emailRegex.test(formData.adviserEmail)) {
      newErrors.adviserEmail = "Please enter a valid email address";
    }
    if (formData.orgEmail && !emailRegex.test(formData.orgEmail)) {
      newErrors.orgEmail = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        console.log("Form submitted:", formData);

        try {
          const result = await axios.post(
            `${API_ROUTER}/reRegistration`,
            formData,
            { withCredentials: true }
          );
          console.log("Registration successful:", result);
        } catch (error) {
          console.error("Error submitting initial registration:", error);
          throw error;
        }

        onComplete?.();
      } catch (error) {
        console.error("Registration failed:", error);
        // You might want to show an error message to the user here
        // setErrors({ submit: "Registration failed. Please try again." });
      }
    }
  };
  return (
    <div className="absolute inset-0 h-screen w-screen overflow-hidden backdrop-blur-3xl z-50 flex items-center justify-center">
      <div className="max-h-9/10 h-fit flex-col max-w-5xl rounded-xl gap-4 w-full p border-gray-500 bg-gray-300 flex  items-center px-8 py-6 overflow-hidden">
        <h1 className="text-3xl font-bold text-cnsc-primary-color">
          WELCOME TO RE-REGISTRATION OF YOUR ORGANIAZTION
        </h1>

        <div className="h-full w-full overflow-y-auto">
          {/* Organization Information */}
          <div className="w-full border border-gray-300 rounded-xl bg-white px-6 py-4 mb-4">
            <h1 className="text-xl font-semibold mb-4 flex items-center">
              <Building className="mr-2 h-5 w-5 text-amber-600" />
              Organization Information
            </h1>

            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              <div className="flex flex-col col-span-2 gap-2">
                <label className="block text-lg font-medium text-gray-700">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="orgName"
                  value={formData.orgName}
                  onChange={handleInputChange}
                  className={`${"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"} ${
                    errors.orgName ? "border-red-500" : ""
                  }`}
                  placeholder="(Example: Union of Supreme Student Government)"
                />
                {errors.orgName && (
                  <p className="text-red-500 text-sm px-4">{errors.orgName}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="block text-lg font-medium text-gray-700">
                  Acronym <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="orgAcronym"
                  value={formData.orgAcronym}
                  onChange={handleInputChange}
                  className={`${"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"} ${
                    errors.orgAcronym ? "border-red-500" : ""
                  }`}
                  placeholder="(Example: USSG)"
                />
                {errors.orgAcronym && (
                  <p className="text-red-500 text-sm px-4">
                    {errors.orgAcronym}
                  </p>
                )}
              </div>

              {/* Classification */}
              <div className=" flex flex-col gap-2">
                <label className="block text-lg font-medium text-gray-700">
                  Classification <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4 px-4 py-3 rounded-lg border-gray-300 border bg-gray-100 ">
                  {["System-wide", "Local"].map((option) => (
                    <div key={option} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`orgClass${option}`}
                        name="orgClass"
                        value={option}
                        checked={formData.orgClass === option}
                        onChange={handleClassificationChange}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor={`orgClass${option}`} className="text-lg">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.orgClass && (
                  <p className="text-red-500 text-sm px-4">{errors.orgClass}</p>
                )}
              </div>

              <div className="flex col-span-2 flex-col gap-2">
                <label className="block text-lg font-medium text-gray-700">
                  Organization Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="orgEmail"
                  value={formData.orgEmail}
                  readOnly
                  className={`${"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"} bg-gray-100 cursor-not-allowed ${
                    errors.orgEmail ? "border-red-500" : ""
                  }`}
                  placeholder="organization@email.com"
                />
                {errors.orgEmail && (
                  <p className="text-red-500 text-sm px-4">{errors.orgEmail}</p>
                )}
              </div>

              {/* For Local Classification */}
              {formData.orgClass === "Local" && (
                <div className="flex col-span-3 gap-6 ">
                  <div className="flex flex-1 flex-col gap-2">
                    <label className="block text-lg font-medium text-gray-700">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="orgDepartment"
                      value={formData.orgDepartment}
                      onChange={handleInputChange}
                      className={`${"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"} ${
                        errors.orgDepartment ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select Department</option>
                      {Object.keys(departments).map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    {errors.orgDepartment && (
                      <p className="text-red-500 text-sm px-4">
                        {errors.orgDepartment}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 gap-2">
                    <label className="block text-lg font-medium text-gray-700">
                      Course <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="orgCourse"
                      value={formData.orgCourse}
                      onChange={handleInputChange}
                      className={`${"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"} ${
                        errors.orgCourse ? "border-red-500" : ""
                      }`}
                      disabled={!formData.orgDepartment}
                    >
                      <option value="">Select Course</option>
                      {formData.orgDepartment &&
                        departments[formData.orgDepartment]?.map((course) => (
                          <option key={course} value={course}>
                            {course}
                          </option>
                        ))}
                    </select>
                    {errors.orgCourse && (
                      <p className="text-red-500 text-sm px-4">
                        {errors.orgCourse}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* For System-wide Classification */}
              {formData.orgClass === "System-wide" && (
                <div className="flex  col-span-3 gap-4">
                  <div className="flex flex-col flex-1 gap-2">
                    <label className="block text-lg font-medium text-gray-700">
                      Specialization <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="orgSpecialization"
                      value={formData.orgSpecialization}
                      onChange={handleSpecializationChange}
                      className={`${"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"} ${
                        errors.orgSpecialization ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select Specialization</option>
                      {orgSpecializations.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                    {errors.orgSpecialization && (
                      <p className="text-red-500 text-sm px-4">
                        {errors.orgSpecialization}
                      </p>
                    )}
                  </div>

                  {/* Student Government Department Field */}
                  {formData.orgSpecialization === "Student government" && (
                    <div className="flex flex-col flex-1  gap-2">
                      <label className="block text-lg font-medium text-gray-700">
                        Department <span className="text-red-500">*</span>{" "}
                      </label>

                      <select
                        name="studentGovDepartment"
                        value={formData.studentGovDepartment}
                        onChange={handleInputChange}
                        className={`${"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"} ${
                          errors.studentGovDepartment ? "border-red-500" : ""
                        }`}
                      >
                        <option value="">Select Department</option>
                        {Object.keys(departments).map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                      {errors.studentGovDepartment && (
                        <p className="text-red-500 text-sm px-4">
                          {errors.studentGovDepartment}
                        </p>
                      )}
                      <span className="text-xs text-cnsc-accent-1-color">
                        Select Department of the Student Government.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Adviser Information */}
          <div className="w-full border border-gray-300 rounded-xl bg-white px-6 py-4 mb-4">
            <h1 className="text-xl font-semibold mb-4 flex items-center">
              <User className="mr-2 h-5 w-5 text-blue-600" />
              Adviser Information
            </h1>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex flex-col gap-2">
                <label className="block text-lg font-medium text-gray-700">
                  Adviser Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="adviserName"
                  value={formData.adviserName}
                  onChange={handleInputChange}
                  className={`${"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"} ${
                    errors.adviserName ? "border-red-500" : ""
                  }`}
                  placeholder="Enter adviser's full name"
                />
                {errors.adviserName && (
                  <p className="text-red-500 text-sm px-4">
                    {errors.adviserName}
                  </p>
                )}
              </div>

              <div className="flex flex-col col-span-2 gap-2">
                <label className="block text-lg font-medium text-gray-700">
                  Adviser Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="adviserEmail"
                  value={formData.adviserEmail}
                  onChange={handleInputChange}
                  className={`${"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"} ${
                    errors.adviserEmail ? "border-red-500" : ""
                  }`}
                  placeholder="adviser@university.edu"
                />
                {errors.adviserEmail && (
                  <p className="text-red-500 text-sm px-4">
                    {errors.adviserEmail}
                  </p>
                )}
              </div>

              <div className="flex flex-col col-span-3 gap-2">
                <label className="block text-lg font-medium text-gray-700">
                  Adviser Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="adviserDepartment"
                  value={formData.adviserDepartment}
                  onChange={handleInputChange}
                  className={`${"w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"} ${
                    errors.adviserDepartment ? "border-red-500" : ""
                  }`}
                  disabled={
                    (formData.orgClass === "Local" && formData.orgDepartment) ||
                    (formData.orgClass === "System-wide" &&
                      formData.orgSpecialization === "Student government" &&
                      formData.studentGovDepartment)
                  }
                >
                  <option value="">Select department</option>
                  {Object.keys(departments).map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.adviserDepartment && (
                  <p className="text-red-500 text-sm px-4">
                    {errors.adviserDepartment}
                  </p>
                )}
                {formData.orgClass === "Local" && formData.orgDepartment && (
                  <p className="text-blue-600 text-sm px-4">
                    Auto-populated from organization department
                  </p>
                )}
                {formData.orgClass === "System-wide" &&
                  formData.orgSpecialization === "Student government" &&
                  formData.studentGovDepartment && (
                    <p className="text-blue-600 text-sm px-4">
                      Auto-populated from student government department
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end ">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-8 py-4 rounded-xl bg-amber-300  font-bold"
            >
              Register Organization
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const departments = {
  "College of Arts and Sciences": [
    "Bachelor of Science in Biology",
    "Bachelor of Science in Applied Mathematics",
    "Bachelor of Science in Development Communication",
    "Bachelor of Arts in English Language Studies",
    "Bachelor of Arts in Sociology",
  ],
  "College of Computing and Multimedia Studies": [
    "Bachelor of Science in Information Technology",
    "Bachelor of Science in Information Systems",
  ],
  "College of Business and Public Administration": [
    "Bachelor of Science in Business Administration – Business Economics",
    "Bachelor of Science in Business Administration – Financial Management",
    "Bachelor of Science in Business Administration – Marketing Management",
    "Bachelor of Science in Business Administration – Human Resource Management",
    "Bachelor of Science in Accountancy",
    "Bachelor of Science in Hospitality Management",
    "Bachelor of Science in Office Administration",
    "Bachelor of Science in Entrepreneurship",
    "Bachelor in Public Administration",
  ],
  "College of Engineering": [
    "Bachelor of Science in Civil Engineering",
    "Bachelor of Science in Electrical Engineering",
    "Bachelor of Science in Mechanical Engineering",
  ],
  "College of Education": [
    "Bachelor of Elementary Education",
    "Bachelor of Secondary Education – Major in English",
    "Bachelor of Secondary Education – Major in Filipino",
    "Bachelor of Secondary Education – Major in Mathematics",
    "Bachelor of Secondary Education – Major in Social Studies",
    "Bachelor of Secondary Education – Major in Sciences",
    "Bachelor of Technology and Livelihood Education – Home Economics",
    "Bachelor of Physical Education",
  ],
  "College of Trades and Technology": [
    "Bachelor of Technical-Vocational Teacher Education – Garments Fashion and Design",
    "Bachelor of Technical-Vocational Teacher Education – Food Service and Management",
    "Bachelor of Technical-Vocational Teacher Education – Automotive Technology",
    "Bachelor of Technical-Vocational Teacher Education – Electrical Technology",
    "Bachelor of Science in Industrial Technology – Automotive Technology",
    "Bachelor of Science in Industrial Technology – Electrical Technology",
    "Bachelor of Science in Industrial Technology – Computer Technology",
    "Bachelor of Science in Industrial Technology – Electronics Technology",
  ],
  "College of Agriculture and Natural Resources": [
    "Bachelor of Science in Agriculture – Crop Science",
    "Bachelor of Science in Agriculture – Animal Science",
    "Bachelor of Science in Environmental Science",
    "Bachelor in Agricultural Technology",
    "Bachelor of Science in Agricultural and Biosystems Engineering",
  ],
  "Institute of Fisheries and Marine Sciences": [
    "Bachelor of Science in Fisheries",
  ],
  "Alternative Track": [
    "Bachelor of Science in Entrepreneurship (Agricultural Production Track)",
  ],
};

const orgSpecializations = [
  "Academic",
  "Lifestyle",
  "Fraternity/Sorority",
  "Environmental",
  "Social-Civic",
  "Spiritual or religious",
  "Student government",
  "Adviser Academic Rank",
];
