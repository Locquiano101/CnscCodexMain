import React, { useState } from "react";
import { User, Building, CheckCircle } from "lucide-react";
import axios from "axios";
import { API_ROUTER } from "./../../../App";

export function InitialRegistration({ user, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
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
    studentGovDepartment: "",
    userId: user?.userId,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

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

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.orgName.trim())
      newErrors.orgName = "Organization name is required";
    if (!formData.orgAcronym.trim())
      newErrors.orgAcronym = "Organization acronym is required";
    if (!formData.orgClass)
      newErrors.orgClass = "Organization class is required";
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
    if (formData.orgEmail && !emailRegex.test(formData.orgEmail)) {
      newErrors.orgEmail = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.adviserName.trim())
      newErrors.adviserName = "Adviser name is required";
    if (!formData.adviserEmail.trim())
      newErrors.adviserEmail = "Adviser email is required";
    if (!formData.adviserDepartment.trim())
      newErrors.adviserDepartment = "Adviser department is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.adviserEmail && !emailRegex.test(formData.adviserEmail)) {
      newErrors.adviserEmail = "Please enter a valid email address";
    }

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

  const validateForm = () => {
    return validateStep1() && validateStep2();
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitError("");
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

        if (error.response?.status === 409) {
          setSubmitError("This organization is already registered.");
        } else {
          setSubmitError("Registration failed. Please try again.");
        }

        setLoading(false);
      }
    }
  };

  const StepIndicator = ({ stepNumber, title, isActive, isCompleted }) => (
    <div className="flex flex-col items-center flex-1 relative">
      <div className="flex items-center w-full relative">
        {/* Left connector line */}
        {stepNumber > 1 && (
          <div
            className={`absolute right-1/2 w-1/2 h-0.5 ${
              isActive || isCompleted ? "bg-red-800" : "bg-gray-300"
            }`}
          />
        )}

        {/* Circle - centered */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base border-2 relative z-10 mx-auto ${
            isActive
              ? "bg-red-800 text-white border-red-800"
              : isCompleted
              ? "bg-red-800 text-white border-red-800"
              : "bg-white text-gray-400 border-gray-300"
          }`}
        >
          {stepNumber}
        </div>

        {/* Right connector line */}
        {stepNumber < 3 && (
          <div
            className={`absolute left-1/2 w-1/2 h-0.5 ${
              isCompleted ? "bg-red-800" : "bg-gray-300"
            }`}
          />
        )}
      </div>

      {/* Label */}
      <span
        className={`text-xs font-medium mt-2 text-center ${
          isActive ? "text-gray-900" : "text-gray-500"
        }`}
      >
        {title}
      </span>
    </div>
  );

  return (
    <div className="absolute inset-0 h-screen w-screen overflow-hidden bg-gray-50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 to-red-600 text-white py-6 px-8">
          <h1 className="text-2xl font-bold text-center">
            INITIAL REGISTRATION
          </h1>
        </div>

        {/* Step Indicator */}
        <div className="bg-white border-b border-gray-300 px-8 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <StepIndicator
              stepNumber={1}
              title="Organization Information"
              isActive={currentStep === 1}
              isCompleted={currentStep > 1}
            />
            <StepIndicator
              stepNumber={2}
              title="Adviser Information"
              isActive={currentStep === 2}
              isCompleted={currentStep > 2}
            />
            <StepIndicator
              stepNumber={3}
              title="Submit"
              isActive={currentStep === 3}
              isCompleted={false}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 py-8 max-h-[500px] overflow-y-auto">
          {/* Step 1: Organization Information */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="orgName"
                    value={formData.orgName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.orgName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="(Example: Union of Supreme Student Government)"
                  />
                  {errors.orgName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.orgName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Acronym <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="orgAcronym"
                    value={formData.orgAcronym}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.orgAcronym ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="(Example: USSG)"
                  />
                  {errors.orgAcronym && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.orgAcronym}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Classification <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="orgClass"
                    value={formData.orgClass}
                    onChange={handleClassificationChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.orgClass ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="System-wide">System-wide</option>
                    <option value="Local">Local</option>
                  </select>
                  {errors.orgClass && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.orgClass}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="orgEmail"
                    value={formData.orgEmail}
                    readOnly
                    className={`w-full px-4 py-3 border rounded-lg bg-gray-100 cursor-not-allowed ${
                      errors.orgEmail ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="organization@email.com"
                  />
                  {errors.orgEmail && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.orgEmail}
                    </p>
                  )}
                </div>
              </div>

              {formData.orgClass === "Local" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="orgDepartment"
                      value={formData.orgDepartment}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        errors.orgDepartment
                          ? "border-red-500"
                          : "border-gray-300"
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
                      <p className="text-red-500 text-sm mt-1">
                        {errors.orgDepartment}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="orgCourse"
                      value={formData.orgCourse}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        errors.orgCourse ? "border-red-500" : "border-gray-300"
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
                      <p className="text-red-500 text-sm mt-1">
                        {errors.orgCourse}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {formData.orgClass === "System-wide" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="orgSpecialization"
                      value={formData.orgSpecialization}
                      onChange={handleSpecializationChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        errors.orgSpecialization
                          ? "border-red-500"
                          : "border-gray-300"
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
                      <p className="text-red-500 text-sm mt-1">
                        {errors.orgSpecialization}
                      </p>
                    )}
                  </div>

                  {formData.orgSpecialization === "Student government" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="studentGovDepartment"
                        value={formData.studentGovDepartment}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          errors.studentGovDepartment
                            ? "border-red-500"
                            : "border-gray-300"
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
                        <p className="text-red-500 text-sm mt-1">
                          {errors.studentGovDepartment}
                        </p>
                      )}
                      <p className="text-xs text-blue-600 mt-1">
                        Select Department of the Student Government.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Adviser Information */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adviser Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="adviserName"
                    value={formData.adviserName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.adviserName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter adviser's full name"
                  />
                  {errors.adviserName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.adviserName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adviser Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="adviserEmail"
                    value={formData.adviserEmail}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.adviserEmail ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="adviser@university.edu"
                  />
                  {errors.adviserEmail && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.adviserEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adviser Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="adviserDepartment"
                    value={formData.adviserDepartment}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.adviserDepartment
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={
                      (formData.orgClass === "Local" &&
                        formData.orgDepartment) ||
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
                    <p className="text-red-500 text-sm mt-1">
                      {errors.adviserDepartment}
                    </p>
                  )}
                  {formData.orgClass === "Local" && formData.orgDepartment && (
                    <p className="text-blue-600 text-sm mt-1">
                      Auto-populated from organization department
                    </p>
                  )}
                  {formData.orgClass === "System-wide" &&
                    formData.orgSpecialization === "Student government" &&
                    formData.studentGovDepartment && (
                      <p className="text-blue-600 text-sm mt-1">
                        Auto-populated from student government department
                      </p>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review and Submit */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Review Your Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <Building className="mr-2 h-4 w-4 text-amber-600" />
                      Organization Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm ml-6">
                      <div>
                        <span className="font-medium">Name:</span>{" "}
                        {formData.orgName}
                      </div>
                      <div>
                        <span className="font-medium">Acronym:</span>{" "}
                        {formData.orgAcronym}
                      </div>
                      <div>
                        <span className="font-medium">Classification:</span>{" "}
                        {formData.orgClass}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span>{" "}
                        {formData.orgEmail}
                      </div>
                      {formData.orgClass === "Local" && (
                        <>
                          <div>
                            <span className="font-medium">Department:</span>{" "}
                            {formData.orgDepartment}
                          </div>
                          <div>
                            <span className="font-medium">Course:</span>{" "}
                            {formData.orgCourse}
                          </div>
                        </>
                      )}
                      {formData.orgClass === "System-wide" && (
                        <>
                          <div>
                            <span className="font-medium">Specialization:</span>{" "}
                            {formData.orgSpecialization}
                          </div>
                          {formData.orgSpecialization ===
                            "Student government" && (
                            <div>
                              <span className="font-medium">Department:</span>{" "}
                              {formData.studentGovDepartment}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <User className="mr-2 h-4 w-4 text-blue-600" />
                      Adviser Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm ml-6">
                      <div>
                        <span className="font-medium">Name:</span>{" "}
                        {formData.adviserName}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span>{" "}
                        {formData.adviserEmail}
                      </div>
                      <div>
                        <span className="font-medium">Department:</span>{" "}
                        {formData.adviserDepartment}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 font-medium text-sm">
                    {submitError}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Navigation Buttons */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                >
                  Back
                </button>
              )}
            </div>
            <div>
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 font-medium"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-red-700 hover:bg-red-800 text-white"
                  }`}
                >
                  {loading ? "Registering..." : "Register Organization"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReRegistration({ OrgData, user, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
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
    studentGovDepartment: OrgData?.orgDepartment,
    userId: user?.userId,
  });

  console.log("tite", OrgData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

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

  const validateStep1 = () => {
    const newErrors = {};

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
          formData.orgSpecialization = formData.orgSpecialization;
          formData.orgDepartment = formData.studentGovDepartment;
        }
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.orgEmail && !emailRegex.test(formData.orgEmail)) {
      newErrors.orgEmail = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.adviserName.trim())
      newErrors.adviserName = "Adviser name is required";
    if (!formData.adviserEmail.trim())
      newErrors.adviserEmail = "Adviser email is required";
    if (!formData.adviserDepartment.trim())
      newErrors.adviserDepartment = "Adviser department is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.adviserEmail && !emailRegex.test(formData.adviserEmail)) {
      newErrors.adviserEmail = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    return validateStep1() && validateStep2();
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setLoading(true);
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

        setLoading(false);
        onComplete?.();
      } catch (error) {
        console.error("Registration failed:", error);
        setSubmitError("Registration failed. Please try again.");
        setLoading(false);
      }
    }
  };

  const StepIndicator = ({ stepNumber, title, isActive, isCompleted }) => (
    <div className="flex items-center flex-1">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
            isActive
              ? "bg-red-800 text-white border-red-800"
              : "bg-white text-gray-400 border-gray-300"
          }`}
        >
          {stepNumber}
        </div>
        <span
          className={`text-sm font-medium whitespace-nowrap ${
            isActive ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {title}
        </span>
      </div>
      {stepNumber < 3 && <div className="flex-1 h-px bg-gray-300 mx-4" />}
    </div>
  );

  return (
    <div className="absolute inset-0 h-screen w-screen overflow-hidden bg-gray-50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 to-red-600 text-white py-6 px-8">
          <h1 className="text-2xl font-bold text-center">RE-REGISTRATION</h1>
        </div>

        {/* Step Indicator */}
        <div className="bg-white border-b border-gray-300 px-8 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <StepIndicator
              stepNumber={1}
              title="Organization Information"
              isActive={currentStep === 1}
              isCompleted={currentStep > 1}
            />
            <StepIndicator
              stepNumber={2}
              title="Adviser Information"
              isActive={currentStep === 2}
              isCompleted={currentStep > 2}
            />
            <StepIndicator
              stepNumber={3}
              title="Submit"
              isActive={currentStep === 3}
              isCompleted={false}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 py-8 max-h-[500px] overflow-y-auto">
          {/* Step 1: Organization Information */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="orgName"
                    value={formData.orgName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.orgName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="(Example: Union of Supreme Student Government)"
                  />
                  {errors.orgName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.orgName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Acronym <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="orgAcronym"
                    value={formData.orgAcronym}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.orgAcronym ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="(Example: USSG)"
                  />
                  {errors.orgAcronym && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.orgAcronym}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Classification <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="orgClass"
                    value={formData.orgClass}
                    onChange={handleClassificationChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.orgClass ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="System-wide">System-wide</option>
                    <option value="Local">Local</option>
                  </select>
                  {errors.orgClass && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.orgClass}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="orgEmail"
                    value={formData.orgEmail}
                    readOnly
                    className={`w-full px-4 py-3 border rounded-lg bg-gray-100 cursor-not-allowed ${
                      errors.orgEmail ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="organization@email.com"
                  />
                  {errors.orgEmail && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.orgEmail}
                    </p>
                  )}
                </div>
              </div>

              {formData.orgClass === "Local" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="orgDepartment"
                      value={formData.orgDepartment}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        errors.orgDepartment
                          ? "border-red-500"
                          : "border-gray-300"
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
                      <p className="text-red-500 text-sm mt-1">
                        {errors.orgDepartment}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="orgCourse"
                      value={formData.orgCourse}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        errors.orgCourse ? "border-red-500" : "border-gray-300"
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
                      <p className="text-red-500 text-sm mt-1">
                        {errors.orgCourse}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {formData.orgClass === "System-wide" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="orgSpecialization"
                      value={formData.orgSpecialization}
                      onChange={handleSpecializationChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        errors.orgSpecialization
                          ? "border-red-500"
                          : "border-gray-300"
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
                      <p className="text-red-500 text-sm mt-1">
                        {errors.orgSpecialization}
                      </p>
                    )}
                  </div>

                  {formData.orgSpecialization === "Student government" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="studentGovDepartment"
                        value={formData.studentGovDepartment}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                          errors.studentGovDepartment
                            ? "border-red-500"
                            : "border-gray-300"
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
                        <p className="text-red-500 text-sm mt-1">
                          {errors.studentGovDepartment}
                        </p>
                      )}
                      <p className="text-xs text-blue-600 mt-1">
                        Select Department of the Student Government.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Adviser Information */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adviser Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="adviserName"
                    value={formData.adviserName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.adviserName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter adviser's full name"
                  />
                  {errors.adviserName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.adviserName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adviser Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="adviserEmail"
                    value={formData.adviserEmail}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.adviserEmail ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="adviser@university.edu"
                  />
                  {errors.adviserEmail && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.adviserEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adviser Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="adviserDepartment"
                    value={formData.adviserDepartment}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.adviserDepartment
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={
                      (formData.orgClass === "Local" &&
                        formData.orgDepartment) ||
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
                    <p className="text-red-500 text-sm mt-1">
                      {errors.adviserDepartment}
                    </p>
                  )}
                  {formData.orgClass === "Local" && formData.orgDepartment && (
                    <p className="text-blue-600 text-sm mt-1">
                      Auto-populated from organization department
                    </p>
                  )}
                  {formData.orgClass === "System-wide" &&
                    formData.orgSpecialization === "Student government" &&
                    formData.studentGovDepartment && (
                      <p className="text-blue-600 text-sm mt-1">
                        Auto-populated from student government department
                      </p>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review and Submit */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Review Your Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <Building className="mr-2 h-4 w-4 text-amber-600" />
                      Organization Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm ml-6">
                      <div>
                        <span className="font-medium">Name:</span>{" "}
                        {formData.orgName}
                      </div>
                      <div>
                        <span className="font-medium">Acronym:</span>{" "}
                        {formData.orgAcronym}
                      </div>
                      <div>
                        <span className="font-medium">Classification:</span>{" "}
                        {formData.orgClass}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span>{" "}
                        {formData.orgEmail}
                      </div>
                      {formData.orgClass === "Local" && (
                        <>
                          <div>
                            <span className="font-medium">Department:</span>{" "}
                            {formData.orgDepartment}
                          </div>
                          <div>
                            <span className="font-medium">Course:</span>{" "}
                            {formData.orgCourse}
                          </div>
                        </>
                      )}
                      {formData.orgClass === "System-wide" && (
                        <>
                          <div>
                            <span className="font-medium">Specialization:</span>{" "}
                            {formData.orgSpecialization}
                          </div>
                          {formData.orgSpecialization ===
                            "Student government" && (
                            <div>
                              <span className="font-medium">Department:</span>{" "}
                              {formData.studentGovDepartment}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <User className="mr-2 h-4 w-4 text-blue-600" />
                      Adviser Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm ml-6">
                      <div>
                        <span className="font-medium">Name:</span>{" "}
                        {formData.adviserName}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span>{" "}
                        {formData.adviserEmail}
                      </div>
                      <div>
                        <span className="font-medium">Department:</span>{" "}
                        {formData.adviserDepartment}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 font-medium text-sm">
                    {submitError}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Navigation Buttons */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                >
                  Back
                </button>
              )}
            </div>
            <div>
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 font-medium"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-red-700 hover:bg-red-800 text-white"
                  }`}
                >
                  {loading ? "Registering..." : "Register Organization"}
                </button>
              )}
            </div>
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
