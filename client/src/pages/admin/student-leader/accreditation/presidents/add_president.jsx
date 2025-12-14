import { Check, CodeSquare, X } from "lucide-react";
import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import { departments } from "@/components/department_arrays";

import axios from "axios";
import { API_ROUTER } from "../../../../../App";

export default function AddStudentPresident({
  orgInfo,
  onClose,
  AccreditationId,
  onSuccess,
}) {
  // Initialize birthdate to 18 years ago
  const getDefaultBirthdate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    middleName: "",
    lastName: "",
    birthDate: getDefaultBirthdate(),
    age: "",
    sex: "",
    religion: "",
    customReligion: "",
    nationality: "",
    birthPlace: "",

    // Academic Information
    department: "",
    course: "",
    yearLevel: "",

    // Address Information (handled by PhilippineAddressForm)

    // Guardian Information
    guardianFirstName: "",
    guardianMiddleName: "",
    guardianLastName: "",
    addressPhoneNo: "",

    // Contact & Financial Information
    sourceOfFinancialSupport: "",
    contactNo: "",
    facebookAccount: "",
  });
  const [addressFormData, setAddressFormData] = useState(null);

  const [classSchedules, setClassSchedules] = useState([
    { subject: "", place: "", time: { start: "", end: "" }, day: "" },
  ]);

  const [talentSkills, setTalentSkills] = useState([{ skill: "", level: "" }]);

  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadDone, setIsUploadDone] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const formRef = useRef();

  // Step configuration
  const steps = [
    { id: 1, title: "Personal Info", description: "Basic personal details" },
    {
      id: 2,
      title: "Guardian Info",
      description: "Guardian/Parent information",
    },
    { id: 3, title: "Address" },
    { id: 4, title: "Talents", description: "Skills and talents" },
    { id: 5, title: "Class Schedule", description: "Academic schedule" },
  ];

  const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

  // Initialize form data with org info
  useEffect(() => {
    if (orgInfo) {
      setFormData((prev) => ({
        ...prev,
        department: orgInfo.orgDepartment || "",
        course: orgInfo.orgCourse || "",
      }));
    }
  }, [orgInfo]);

  // Fetch countries for nationality dropdown
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,demonyms"
        );
        const data = await response.json();

        const nationalities = data
          .map((country) => country.demonyms?.eng?.m)
          .filter(Boolean)
          .sort();

        const uniqueNationalities = [...new Set(nationalities)];
        const countryList = uniqueNationalities.map((nationality) => ({
          value: nationality,
          label: nationality,
        }));

        setCountries(countryList);
      } catch (error) {
        console.error("Error fetching countries:", error);
        // Fallback list
        setCountries([
          { value: "Filipino", label: "Filipino" },
          { value: "American", label: "American" },
          { value: "Canadian", label: "Canadian" },
          { value: "British", label: "British" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Calculate age whenever birthdate changes
  useEffect(() => {
    if (formData.birthDate) {
      const age = calculateAge(formData.birthDate);
      setFormData((prev) => ({ ...prev, age }));
    }
  }, [formData.birthDate]);

  // Utility Functions
  const calculateAge = (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  const validateFacebookUrl = (url) => {
    if (!url) return true; // Optional field
    const fbPattern =
      /^(https?:\/\/)?(www\.)?(facebook|fb|m\.facebook)\.com\/.+/i;
    return fbPattern.test(url);
  };

  const validatePhoneNumber = (phone) => {
    if (!phone) return false;
    // Philippine mobile number format (11 digits starting with 09)
    const phonePattern = /^(09|\+639)\d{9}$/;
    return phonePattern.test(phone) || phone.length >= 10;
  };

  // Step-specific validation functions
  const validateStep1 = () => {
    const errors = {};

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.birthDate) errors.birthDate = "Birth date is required";
    if (!formData.sex) errors.sex = "Sex is required";
    if (!formData.nationality) errors.nationality = "Nationality is required";
    if (!formData.birthPlace.trim())
      errors.birthPlace = "Birthplace is required";
    if (!formData.department) errors.department = "Department is required";
    if (!formData.course) errors.course = "Course is required";
    if (!formData.yearLevel) errors.yearLevel = "Year level is required";

    // Age validation
    const age = calculateAge(formData.birthDate);
    if (age < 16) errors.birthDate = "Must be at least 16 years old";
    if (age > 100) errors.birthDate = "Please enter a valid birth date";

    // Religion validation
    if (formData.religion === "Other" && !formData.customReligion.trim()) {
      errors.customReligion = "Please specify religion";
    }

    // Contact information
    if (!formData.contactNo.trim()) {
      errors.contactNo = "Contact number is required";
    } else if (!validatePhoneNumber(formData.contactNo)) {
      errors.contactNo = "Please enter a valid phone number";
    }

    // Financial support
    if (!formData.sourceOfFinancialSupport) {
      errors.sourceOfFinancialSupport =
        "Source of financial support is required";
    }

    // Facebook URL validation
    if (
      formData.facebookAccount &&
      !validateFacebookUrl(formData.facebookAccount)
    ) {
      errors.facebookAccount = "Please enter a valid Facebook URL";
    }

    return errors;
  };

  const validateStep2 = () => {
    const errors = {};

    if (!formData.guardianFirstName.trim()) {
      errors.guardianFirstName = "Guardian first name is required";
    }
    if (!formData.guardianLastName.trim()) {
      errors.guardianLastName = "Guardian last name is required";
    }

    return errors;
  };

  const validateStep3 = () => {
    const errors = {};
    const addressData =
      addressFormData ||
      (formRef.current ? formRef.current.getFormData() : null);
    if (
      !addressData ||
      !addressData.presentAddress ||
      !addressData.permanentAddress
    ) {
      errors.address = "Both present and permanent addresses are required";
    }
    return errors;
  };

  const validateStep4 = () => {
    // Talents are optional, no required validation
    return {};
  };

  const validateStep5 = () => {
    const errors = {};

    // Class schedule validation (at least one complete entry)
    const validSchedules = classSchedules.filter(
      (cls) => cls.subject && cls.place && cls.time && cls.day
    );
    if (validSchedules.length === 0) {
      errors.classSchedule = "At least one complete class schedule is required";
    }

    return errors;
  };

  // Main validation function
  const validateCurrentStep = (step) => {
    switch (step) {
      case 1:
        return validateStep1();
      case 2:
        return validateStep2();
      case 3:
        return validateStep3();
      case 4:
        return validateStep4();
      case 5:
        return validateStep5();
      default:
        return {};
    }
  };

  // Full form validation for final submission
  const validateForm = () => {
    return {
      ...validateStep1(),
      ...validateStep2(),
      ...validateStep3(),
      ...validateStep4(),
      ...validateStep5(),
    };
  };

  // Event Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSkillChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...talentSkills];
    updated[index][name] = value;
    setTalentSkills(updated);

    // Add new blank row if current row is complete
    if (
      index === talentSkills.length - 1 &&
      updated[index].skill &&
      updated[index].level
    ) {
      setTalentSkills([...updated, { skill: "", level: "" }]);
    }
  };

  const handleClassChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...classSchedules];

    if (name === "timeStart" || name === "timeEnd") {
      const key = name === "timeStart" ? "start" : "end";
      updated[index] = {
        ...updated[index],
        time: { ...updated[index].time, [key]: value },
      };
    } else {
      updated[index] = { ...updated[index], [name]: value };
    }

    setClassSchedules(updated);

    // ✅ Auto-add new blank row if last row is complete
    if (
      index === classSchedules.length - 1 &&
      updated[index].subject &&
      updated[index].place &&
      updated[index].time.start &&
      updated[index].time.end &&
      updated[index].day
    ) {
      setClassSchedules([
        ...updated,
        { subject: "", place: "", time: { start: "", end: "" }, day: "" },
      ]);
    }

    // ✅ Clear validation errors for classSchedule
    if (validationErrors.classSchedule) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.classSchedule;
        return newErrors;
      });
    }
  };

  const removeClassSchedule = (index) => {
    if (classSchedules.length > 1) {
      setClassSchedules(classSchedules.filter((_, i) => i !== index));
    }
  };

  const removeSkill = (index) => {
    if (talentSkills.length > 1) {
      setTalentSkills(talentSkills.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous validation errors
    setValidationErrors({});

    // Validate form
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Scroll to first error
      const firstErrorElement = document.querySelector(".border-red-500");
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    try {
      setIsUploading(true);
      setIsUploadDone(false);

      const addressData = addressFormData || formRef.current?.getFormData();
      if (!addressData) {
        // handle missing address
        alert("Please complete address info.");
        return;
      }

      // Calculate final age
      const finalAge = calculateAge(formData.birthDate);

      // Prepare data for submission
      const mergedData = {
        organizationProfile: orgInfo._id,
        organization: orgInfo.organization,
        name: `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim(),
        department: formData.department,
        course: formData.course,
        year: formData.yearLevel,
        birthDate: formData.birthDate,
        age: finalAge,
        sex: formData.sex,
        religion:
          formData.religion === "Other"
            ? formData.customReligion
            : formData.religion,
        nationality: formData.nationality,
        birthplace: formData.birthPlace,
        currentAddress: addressData.presentAddress,
        permanentAddress: addressData.permanentAddress,
        parentGuardian:
          `${formData.guardianFirstName} ${formData.guardianMiddleName} ${formData.guardianLastName}`.trim(),
        addressPhoneNo: formData.addressPhoneNo || null,
        sourceOfFinancialSupport: formData.sourceOfFinancialSupport,
        contactNo: formData.contactNo,
        facebookAccount: formData.facebookAccount || null,
        talentSkills: talentSkills.filter(
          (skill) => skill.skill && skill.level
        ),
        classSchedule: classSchedules.filter(
          (cls) => cls.subject && cls.place && cls.time && cls.day
        ),
        AccreditationId: AccreditationId,
      };

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await axios.post(
        `${API_ROUTER}/addPresident`,
        mergedData
      );
      console.log("Success:", response.data);

      setIsUploading(false);
      setIsUploadDone(true);

      // Auto-hide success message and call onSuccess
      setTimeout(() => {
        setIsUploadDone(false);
        onSuccess();
      }, 3000);
    } catch (error) {
      console.error("Upload error:", error);
      setIsUploading(false);

      // Handle specific error cases
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("An error occurred while submitting the form. Please try again.");
      }
    }
  };

  // Helper function to get error styling
  const getFieldErrorClass = (fieldName) => {
    return validationErrors[fieldName]
      ? "border-red-500 ring-red-500"
      : "border-gray-300";
  };

  // Render error message
  const renderFieldError = (fieldName) => {
    if (validationErrors[fieldName]) {
      return (
        <p className="text-red-500 text-xs mt-1">
          {validationErrors[fieldName]}
        </p>
      );
    }
    return null;
  };

  if (isUploading) {
    return (
      <div className="max-w-3/4 min-w-1/4 min-h-1/4 flex flex-col items-center justify-center mx-auto p-6 bg-white shadow-lg rounded-lg">
        <div className="text-lg font-semibold text-gray-800 mb-4">
          Uploading...
        </div>
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isUploadDone) {
    return (
      <div className="max-w-3/4 min-w-1/4 min-h-1/4 flex flex-col items-center justify-center mx-auto p-6 bg-white shadow-lg rounded-lg">
        <div className="text-lg font-semibold text-gray-800 mb-4">
          Upload Complete!
        </div>
        <div className="p-4 rounded-full bg-green-200 text-green-700">
          <Check size={24} />
        </div>
      </div>
    );
  }

  const [step, setStep] = useState(1);

  const nextStep = () => {
    // Validate current step before proceeding
    const errors = validateCurrentStep(step);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);

      // Scroll to first error
      setTimeout(() => {
        const firstErrorElement = document.querySelector(".border-red-500");
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);

      return; // Don't proceed if there are validation errors
    }

    // Clear errors and proceed
    setValidationErrors({});
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    // Clear validation errors when going back
    setValidationErrors({});
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (step === 5) {
      handleSubmit(e);
    } else {
      nextStep();
    }
  };
  // Step Indicator Component
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-10">
      <div className="flex items-center space-x-4">
        {steps.map((stepItem, index) => (
          <div key={stepItem.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                  step === stepItem.id
                    ? "bg-blue-600 text-white ring-4 ring-blue-200"
                    : step > stepItem.id
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {step > stepItem.id ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  stepItem.id
                )}
              </div>
              <div className="mt-2 text-center">
                <div
                  className={`text-sm font-medium ${
                    step === stepItem.id ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  {stepItem.title}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-1 mx-2 transition-all duration-200 ${
                  step > stepItem.id ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative max-w-3xl w-full mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Title */}
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        President Profile Form
      </h2>

      {/* Step Indicator - Centered */}
      <div className="relative flex items-center justify-between w-full max-w-2xl mx-auto mb-8">
        {/* Background Line (behind all circles, trimmed to circle centers) */}
        <div
          className="absolute top-7 h-1 bg-gray-300 transform -translate-y-1/2 z-0"
          style={{
            left: "calc(6rem / 2)", // half of circle width (w-12 = 3rem)
            right: "calc(6rem / 2)", // trims at last circle center
          }}
        />

        {steps.map((stepItem) => {
          const isActive = step === stepItem.id;
          const isCompleted = step > stepItem.id;

          return (
            <div
              key={stepItem.id}
              className="relative flex flex-col items-center z-10 flex-1"
            >
              {/* Circle with number */}
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 text-lg font-bold
              ${
                isActive
                  ? "bg-blue-600 border-blue-600 text-white"
                  : isCompleted
                  ? "bg-green-500 border-green-500 text-white"
                  : "bg-gray-300 border-gray-300 text-gray-700"
              }
            `}
              >
                {isCompleted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  stepItem.id
                )}
              </div>

              {/* Step Title */}
              <span
                className={`mt-2 text-sm font-medium text-center ${
                  isActive ? "text-blue-600" : "text-gray-600"
                }`}
              >
                {stepItem.title}
              </span>
            </div>
          );
        })}

        {/* Progress Line Overlay (trimmed to circle centers) */}
        <div
          className={`absolute top-7 h-1 transform -translate-y-1/2 z-0 transition-all duration-300 ${
            step > 1 ? "bg-green-500" : "bg-blue-600"
          }`}
          style={{
            left: "calc(6rem / 2)", // start at first circle center
            width: `calc(((100% - 6rem) / (${steps.length - 1})) * ${
              step - 1
            })`,
          }}
        />
      </div>

      {/* Scrollable Form Wrapper */}
      <div className="max-h-[70vh] overflow-y-auto pr-2">
        {/* Current Step Title */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-gray-700">
            Step {step}: {steps[step - 1].title}
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            {steps[step - 1].description}
          </p>
        </div>

        <form
          onSubmit={handleFinalSubmit}
          className="flex flex-col gap-6 w-full"
        >
          {/* Step 1 */}
          {step === 1 && (
            <PresidentPersonalInfo
              formData={formData}
              getFieldErrorClass={getFieldErrorClass}
              handleInputChange={handleInputChange}
              renderFieldError={renderFieldError}
              loading={loading}
              countries={countries}
            />
          )}

          {/* Step 2 */}
          {step === 2 && (
            <PresidentGuardianInfo
              formData={formData}
              handleInputChange={handleInputChange}
              getFieldErrorClass={getFieldErrorClass}
              renderFieldError={renderFieldError}
            />
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <PhilippineAddressForm
                ref={formRef}
                initialData={formData.address}
                onChange={(data) => setAddressFormData(data)}
              />
              {validationErrors.address && (
                <div className="text-red-500 text-sm">
                  {validationErrors.address}
                </div>
              )}
            </>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <PresidentTalentInfo
              talentSkills={talentSkills}
              skillLevels={skillLevels}
              handleSkillChange={handleSkillChange}
              removeSkill={removeSkill}
              formData={formData}
              getFieldErrorClass={getFieldErrorClass}
              handleInputChange={handleInputChange}
              renderFieldError={renderFieldError}
              loading={loading}
              countries={countries}
            />
          )}

          {/* Step 5 */}
          {step === 5 && (
            <PresidentClassSchedInfo
              validationErrors={validationErrors}
              classSchedules={classSchedules}
              handleClassChange={handleClassChange}
              removeClassSchedule={removeClassSchedule}
              renderFieldError={renderFieldError}
              formData={formData}
              getFieldErrorClass={getFieldErrorClass}
              handleInputChange={handleInputChange}
              loading={loading}
              countries={countries}
            />
          )}

          {/* Validation Summary */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="border border-red-300 bg-red-50 p-4 rounded-lg">
              <h4 className="text-red-800 font-semibold mb-2">
                Please fix the following errors to continue:
              </h4>
              <ul className="text-red-700 text-sm space-y-1">
                {Object.entries(validationErrors).map(([field, error]) => (
                  <li key={field}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-8 rounded-lg transition duration-200"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={isUploading}
              className={`ml-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 focus:ring-4 focus:ring-blue-300 ${
                step === 1 ? "w-full" : ""
              }`}
            >
              {step === 5
                ? isUploading
                  ? "Submitting..."
                  : "Submit Application"
                : "Next"}
            </button>
          </div>
        </form>
      </div>

      {/* Close Button */}
      <X
        size={32}
        className="text-red-500 absolute top-4 right-4 cursor-pointer hover:text-red-600 transition-colors"
        onClick={onClose}
      />
    </div>
  );
}

function PresidentPersonalInfo({
  formData,
  handleInputChange,
  getFieldErrorClass,
  renderFieldError,
  loading,
  countries,
}) {
  const religionOptions = [
    "Christian",
    "Islam",
    "Hinduism",
    "Buddhism",
    "Judaism",
    "Atheism",
    "Agnosticism",
    "Other",
  ];
  // Constants
  const financialSupportOptions = [
    "Allowance",
    "Scholarship",
    "Part-time Job",
    "Student Loan",
    "Government Aid",
    "Self-funded",
    "Other",
  ];
  return (
    <div className="border p-6 rounded-lg bg-blue-50">
      <h3 className="text-xl font-semibold mb-6 text-blue-800">
        Personal Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${getFieldErrorClass(
              "firstName"
            )}`}
          />
          {renderFieldError("firstName")}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Middle Name
          </label>
          <input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${getFieldErrorClass(
              "lastName"
            )}`}
          />
          {renderFieldError("lastName")}
        </div>
      </div>
      {/* Demographic Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Birthplace *
          </label>
          <input
            type="text"
            name="birthPlace"
            value={formData.birthPlace}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${getFieldErrorClass(
              "birthPlace"
            )}`}
          />
          {renderFieldError("birthPlace")}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Birth Date *
          </label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleInputChange}
            max={new Date().toISOString().split("T")[0]}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${getFieldErrorClass(
              "birthDate"
            )}`}
          />
          {renderFieldError("birthDate")}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sex *
          </label>
          <select
            name="sex"
            value={formData.sex}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${getFieldErrorClass(
              "sex"
            )}`}
          >
            <option value="">Select...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {renderFieldError("sex")}
        </div>
      </div>

      {/* Facebook and Contact Information*/}
      <div className="flex w-full gap-4 justify-between">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-600">
            Facebook Account (URL)
          </label>
          <input
            type="url"
            name="facebookAccount"
            value={formData.facebookAccount}
            onChange={handleInputChange}
            placeholder="https://facebook.com/your-profile"
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 ${getFieldErrorClass(
              "facebookAccount"
            )}`}
          />
          {renderFieldError("facebookAccount")}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-600">
            Contact Number *
          </label>
          <div className="flex items-center">
            <span className="px-3 py-2 border border-r-0 rounded-l-md bg-gray-100 text-gray-700 text-sm">
              +63
            </span>
            <input
              type="tel"
              name="contactNo"
              value={formData.contactNo}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, ""); // Remove non-digits

                // Allow only if starts with 9 and up to 10 digits
                if (/^9[0-9]{0,9}$/.test(value) || value === "") {
                  handleInputChange({ target: { name: "contactNo", value } });
                }
              }}
              placeholder="9XXXXXXXXX"
              maxLength={10}
              className={`w-full p-2 border rounded-r-md focus:ring-2 focus:ring-purple-500 ${getFieldErrorClass(
                "contactNo"
              )}`}
              inputMode="numeric"
              required
            />
          </div>
          {renderFieldError("contactNo")}
        </div>
      </div>
      {/* Religion and Nationality */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Religion
          </label>
          <div className="flex flex-col gap-2 md:flex-row">
            <select
              name="religion"
              value={formData.religion}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a religion</option>
              {religionOptions.map((religion) => (
                <option key={religion} value={religion}>
                  {religion}
                </option>
              ))}
            </select>
            {formData.religion === "Other" && (
              <div className="w-full">
                <input
                  type="text"
                  name="customReligion"
                  placeholder="Please specify"
                  value={formData.customReligion}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${getFieldErrorClass(
                    "customReligion"
                  )}`}
                />
                {renderFieldError("customReligion")}
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nationality *
          </label>
          <select
            name="nationality"
            value={formData.nationality}
            onChange={handleInputChange}
            disabled={loading}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${getFieldErrorClass(
              "nationality"
            )}`}
          >
            <option value="">
              {loading ? "Loading..." : "Select Nationality..."}
            </option>
            {countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
          {renderFieldError("nationality")}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Source of Financial Support *
          </label>
          <select
            name="sourceOfFinancialSupport"
            value={formData.sourceOfFinancialSupport}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 ${getFieldErrorClass(
              "sourceOfFinancialSupport"
            )}`}
          >
            <option value="">Select...</option>
            {financialSupportOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {renderFieldError("sourceOfFinancialSupport")}
        </div>
      </div>
      {/* Academic Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Department *
          </label>
          <select
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-green-500 ${getFieldErrorClass(
              "department"
            )}`}
          >
            <option value="">Select Department...</option>
            {Object.keys(departments || {}).map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {renderFieldError("department")}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Course *
          </label>
          <select
            name="course"
            value={formData.course}
            onChange={handleInputChange}
            disabled={!formData.department}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 ${getFieldErrorClass(
              "course"
            )}`}
          >
            <option value="">Select Course...</option>
            {formData.department &&
              departments?.[formData.department]?.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
          </select>
          {renderFieldError("course")}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Year Level *
          </label>
          <select
            name="yearLevel"
            value={formData.yearLevel}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-green-500 ${getFieldErrorClass(
              "yearLevel"
            )}`}
          >
            <option value="">Select Year...</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
            <option value="5th Year">5th Year</option>
          </select>
          {renderFieldError("yearLevel")}
        </div>
      </div>
    </div>
  );
}

function PresidentGuardianInfo({
  formData,
  handleInputChange,
  getFieldErrorClass,
  renderFieldError,
}) {
  return (
    <div className="border p-4 rounded-lg bg-yellow-50">
      <h3 className="text-lg font-semibold mb-4 text-yellow-800">
        Guardian Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Guardian First Name *
          </label>
          <input
            type="text"
            name="guardianFirstName"
            value={formData.guardianFirstName}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Guardian Middle Name (optional)
          </label>
          <input
            type="text"
            name="guardianMiddleName"
            value={formData.guardianMiddleName}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Guardian Last Name *
          </label>
          <input
            type="text"
            name="guardianLastName"
            value={formData.guardianLastName}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600">
          Address Phone Number (Optional)
        </label>
        <input
          type="tel"
          name="addressPhoneNo"
          value={formData.addressPhoneNo}
          onChange={(e) => {
            let value = e.target.value.replace(/\D/g, ""); // remove non-digits
            if (value.startsWith("63")) value = value.slice(2); // remove duplicate 63
            if (value.length > 10) value = value.slice(0, 10); // limit to 10 digits

            // Only allow numbers starting with 9
            if (value && !value.startsWith("9")) {
              return; // ignore input if it doesn’t start with 9
            }

            const formatted = `+63 ${value.replace(
              /(\d{3})(\d{3})(\d{0,4})/,
              (_, a, b, c) => `${a} ${b}${c ? " " + c : ""}`
            )}`;

            handleInputChange({
              target: { name: "addressPhoneNo", value: formatted },
            });
          }}
          placeholder="+63 9XX XXX XXXX"
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
        />
      </div>
    </div>
  );
}

function PresidentTalentInfo({
  talentSkills,
  skillLevels,
  handleSkillChange, // ✅ add this
  removeSkill, // ✅ add this
}) {
  return (
    <div className="border p-4 rounded-lg bg-indigo-50">
      <h3 className="text-lg font-semibold mb-4 text-indigo-800">
        Talents & Skills (Optional)
      </h3>
      {talentSkills.map((skill, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            type="text"
            name="skill"
            placeholder="Skill/Talent"
            value={skill.skill}
            onChange={(e) => handleSkillChange(index, e)}
            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
          />
          <select
            name="level"
            value={skill.level}
            onChange={(e) => handleSkillChange(index, e)}
            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Level</option>
            {skillLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          {talentSkills.length > 1 && (
            <button
              type="button"
              onClick={() => removeSkill(index)}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:ring-2 focus:ring-red-500"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function PresidentClassSchedInfo({
  validationErrors,
  classSchedules,
  handleClassChange, // ✅ add this
  removeClassSchedule, // ✅ add this
}) {
  return (
    <div className="border p-4 rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Class Schedule *
      </h3>
      {validationErrors.classSchedule && (
        <div className="text-red-500 text-sm mb-2">
          {validationErrors.classSchedule}
        </div>
      )}
      <div className="overflow-auto">
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-2 text-left border">Subject</th>
              <th className="p-2 text-left border">Place/Room</th>
              <th className="p-2 text-left border">Time Start</th>
              <th className="p-2 text-left border">Time End</th>
              <th className="p-2 text-left border">Day</th>
              <th className="p-2 text-left border">Action</th>
            </tr>
          </thead>
          <tbody>
            {classSchedules.map((cls, index) => (
              <tr key={index} className="even:bg-white odd:bg-gray-50">
                <td className="p-2 border">
                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={cls.subject}
                    onChange={(e) => handleClassChange(index, e)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring focus:ring-gray-500"
                  />
                </td>
                <td className="p-2 border">
                  <input
                    type="text"
                    name="place"
                    placeholder="Place"
                    value={cls.place}
                    onChange={(e) => handleClassChange(index, e)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring focus:ring-gray-500"
                  />
                </td>
                <td className="p-2 border">
                  <input
                    type="time"
                    name="timeStart"
                    value={cls.time.start}
                    onChange={(e) => handleClassChange(index, e)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring focus:ring-gray-500"
                  />
                </td>
                <td className="p-2 border">
                  <input
                    type="time"
                    name="timeEnd"
                    value={cls.time.end}
                    onChange={(e) => handleClassChange(index, e)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring focus:ring-gray-500"
                  />
                </td>

                <td className="p-2 border">
                  <select
                    name="day"
                    value={cls.day}
                    onChange={(e) => handleClassChange(index, e)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring focus:ring-gray-500"
                  >
                    <option value="">Select Day</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </td>
                <td className="p-2 border text-center">
                  {classSchedules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeClassSchedule(index)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:ring-2 focus:ring-red-500"
                    >
                      ×
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-600 mt-2">
        * At least one complete class schedule entry is required
      </p>
    </div>
  );
}

export const PhilippineAddressForm = forwardRef(
  ({ initialData = null, onChange = () => {} }, ref) => {
    const defaultAddresses = {
      present: {
        region: "",
        province: "",
        city: "",
        barangay: "",
        purok: "",
        street: "",
        houseNumber: "",
      },
      permanent: {
        region: "",
        province: "",
        city: "",
        barangay: "",
        purok: "",
        street: "",
        houseNumber: "",
      },
    };

    const [addresses, setAddresses] = useState(
      initialData?.rawData || defaultAddresses
    );
    const [sameAsPresent, setSameAsPresent] = useState(
      !!initialData?.sameAsPresent
    );
    const [dropdownData, setDropdownData] = useState({
      regions: [],
      provinces: [],
      cities: [],
      barangays: [],
    });
    const [loading, setLoading] = useState({
      regions: false,
      provinces: false,
      cities: false,
      barangays: false,
    });

    // sync if parent supplies initialData later
    useEffect(() => {
      if (initialData?.rawData) {
        setAddresses(initialData.rawData);
      }
      if (typeof initialData?.sameAsPresent !== "undefined") {
        setSameAsPresent(initialData.sameAsPresent);
      }
    }, [initialData]);

    // API Base URL
    const PSGC_API_BASE = "https://psgc.gitlab.io/api";

    // Load regions on component mount
    useEffect(() => {
      loadRegions();
    }, []);

    useEffect(() => {
      try {
        onChange(getFormData());
      } catch (err) {}
    }, [addresses, sameAsPresent, dropdownData]);

    useImperativeHandle(ref, () => ({ getFormData }), [
      addresses,
      sameAsPresent,
      dropdownData,
    ]);

    const handleSameAsPresentChange = (checked) => {
      setSameAsPresent(checked);
      if (checked) {
        // Copy present address to permanent address
        setAddresses((prev) => ({
          ...prev,
          permanent: { ...prev.present },
        }));
      }
    };

    const loadRegions = async () => {
      setLoading((prev) => ({ ...prev, regions: true }));
      try {
        const response = await fetch(`${PSGC_API_BASE}/regions`);
        const data = await response.json();
        const formattedRegions = data.map((region) => {
          return {
            ...region,
            name: `${region.regionName} - ${region.name}`,
          };
        });
        setDropdownData((prev) => ({ ...prev, regions: formattedRegions }));
      } catch (error) {
        console.error("Error loading regions:", error);
      }
      setLoading((prev) => ({ ...prev, regions: false }));
    };

    const loadProvinces = async (regionCode) => {
      setLoading((prev) => ({ ...prev, provinces: true }));
      try {
        const response = await fetch(
          `${PSGC_API_BASE}/regions/${regionCode}/provinces`
        );
        const data = await response.json();
        setDropdownData((prev) => ({ ...prev, provinces: data }));
      } catch (error) {
        console.error("Error loading provinces:", error);
      }
      setLoading((prev) => ({ ...prev, provinces: false }));
    };

    const loadCities = async (provinceCode) => {
      setLoading((prev) => ({ ...prev, cities: true }));
      try {
        const response = await fetch(
          `${PSGC_API_BASE}/provinces/${provinceCode}/cities-municipalities`
        );
        const data = await response.json();
        setDropdownData((prev) => ({ ...prev, cities: data }));
      } catch (error) {
        console.error("Error loading cities:", error);
      }
      setLoading((prev) => ({ ...prev, cities: false }));
    };

    const loadBarangays = async (cityCode) => {
      setLoading((prev) => ({ ...prev, barangays: true }));
      try {
        const response = await fetch(
          `${PSGC_API_BASE}/cities-municipalities/${cityCode}/barangays`
        );
        const data = await response.json();
        console.log(data);
        setDropdownData((prev) => ({ ...prev, barangays: data }));
      } catch (error) {
        console.error("Error loading barangays:", error);
      }
      setLoading((prev) => ({ ...prev, barangays: false }));
    };

    const handleAddressChange = (addressType, field, value) => {
      setAddresses((prev) => ({
        ...prev,
        [addressType]: {
          ...prev[addressType],
          [field]: value,
        },
      }));

      // If permanent address is being changed directly, uncheck the checkbox
      if (addressType === "permanent" && sameAsPresent) {
        setSameAsPresent(false);
      }

      // If changing present address and checkbox is checked, update permanent too
      if (addressType === "present" && sameAsPresent) {
        setAddresses((prev) => ({
          ...prev,
          permanent: {
            ...prev.permanent,
            [field]: value,
          },
        }));
      }

      // Load dependent dropdowns based on selection
      if (field === "region") {
        loadProvinces(value);
        // Clear dependent fields
        const clearedFields = {
          province: "",
          city: "",
          barangay: "",
          purok: "",
          street: "",
        };

        setAddresses((prev) => ({
          ...prev,
          [addressType]: {
            ...prev[addressType],
            ...clearedFields,
          },
          ...(addressType === "present" &&
            sameAsPresent && {
              permanent: {
                ...prev.permanent,
                ...clearedFields,
              },
            }),
        }));
      } else if (field === "province") {
        loadCities(value);
        // Clear dependent fields
        const clearedFields = {
          city: "",
          barangay: "",
          purok: "",
          street: "",
        };

        setAddresses((prev) => ({
          ...prev,
          [addressType]: {
            ...prev[addressType],
            ...clearedFields,
          },
          ...(addressType === "present" &&
            sameAsPresent && {
              permanent: {
                ...prev.permanent,
                ...clearedFields,
              },
            }),
        }));
      } else if (field === "city") {
        loadBarangays(value);
        // Clear dependent fields
        const clearedFields = {
          barangay: "",
          purok: "",
          street: "",
        };

        setAddresses((prev) => ({
          ...prev,
          [addressType]: {
            ...prev[addressType],
            ...clearedFields,
          },
          ...(addressType === "present" &&
            sameAsPresent && {
              permanent: {
                ...prev.permanent,
                ...clearedFields,
              },
            }),
        }));
      } else if (field === "barangay") {
        // Clear dependent fields
        const clearedFields = {
          purok: "",
          street: "",
        };

        setAddresses((prev) => ({
          ...prev,
          [addressType]: {
            ...prev[addressType],
            ...clearedFields,
          },
          ...(addressType === "present" &&
            sameAsPresent && {
              permanent: {
                ...prev.permanent,
                ...clearedFields,
              },
            }),
        }));
      }
    };

    // In your render:

    const getFormData = () => {
      const getReadableAddress = (addressType) => {
        const addr = addresses[addressType];
        return {
          region:
            dropdownData.regions.find((r) => r.code === addr.region)?.name ||
            "",
          province:
            dropdownData.provinces.find((p) => p.code === addr.province)
              ?.name || "",
          city:
            dropdownData.cities.find((c) => c.code === addr.city)?.name || "",
          barangay:
            dropdownData.barangays.find((b) => b.code === addr.barangay)
              ?.name || "",
          purok: addr.purok,
          street: addr.street,
          houseNumber: addr.houseNumber,
          fullAddress: [
            addr.houseNumber,
            addr.street,
            addr.purok,
            dropdownData.barangays.find((b) => b.code === addr.barangay)?.name,
            dropdownData.cities.find((c) => c.code === addr.city)?.name,
            dropdownData.provinces.find((p) => p.code === addr.province)?.name,
            dropdownData.regions.find((r) => r.code === addr.region)?.name,
          ]
            .filter(Boolean)
            .join(", "),
        };
      };

      return {
        presentAddress: getReadableAddress("present"),
        permanentAddress: getReadableAddress("permanent"),
        sameAsPresent,
        rawData: { present: addresses.present, permanent: addresses.permanent },
      };
    };

    const renderAddressFields = (addressType, title) => {
      const addressData = addresses[addressType];
      const isDisabled = addressType === "permanent" && sameAsPresent;

      return (
        <div className="  rounded-lg ">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">{title}</h4>
            {addressType === "permanent" && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sameAsPresent"
                  checked={sameAsPresent}
                  onChange={(e) => handleSameAsPresentChange(e.target.checked)}
                  className="mr-2 rounded border-black bg-white text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="sameAsPresent"
                  className="text-sm text-gray-600"
                >
                  Same as present address
                </label>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region <span className="text-red-500">*</span>
              </label>
              <select
                value={addressData.region}
                onChange={(e) =>
                  handleAddressChange(addressType, "region", e.target.value)
                }
                required
                className="w-full border border-black bg-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={loading.regions || isDisabled}
              >
                <option value="">Select Region</option>
                {dropdownData.regions.map((region) => (
                  <option key={region.code} value={region.code}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Province */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Province <span className="text-red-500">*</span>
              </label>
              <select
                value={addressData.province}
                onChange={(e) =>
                  handleAddressChange(addressType, "province", e.target.value)
                }
                required
                className="w-full border border-black bg-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={
                  loading.provinces || !addressData.region || isDisabled
                }
              >
                <option value="">Select Province</option>
                {dropdownData.provinces.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City/Municipality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City/Municipality <span className="text-red-500">*</span>
              </label>
              <select
                value={addressData.city}
                onChange={(e) =>
                  handleAddressChange(addressType, "city", e.target.value)
                }
                required
                className="w-full border border-black bg-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={loading.cities || !addressData.province || isDisabled}
              >
                <option value="">Select City/Municipality</option>
                {dropdownData.cities.map((city) => (
                  <option key={city.code} value={city.code}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Barangay */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barangay <span className="text-red-500">*</span>
              </label>
              <select
                value={addressData.barangay}
                onChange={(e) =>
                  handleAddressChange(addressType, "barangay", e.target.value)
                }
                required
                className="w-full border border-black bg-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={loading.barangays || !addressData.city || isDisabled}
              >
                <option value="">Select Barangay</option>
                {dropdownData.barangays.map((barangay) => (
                  <option key={barangay.code} value={barangay.code}>
                    {barangay.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Purok */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purok/Street <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={addressData.purok}
                onChange={(e) =>
                  handleAddressChange(addressType, "purok", e.target.value)
                }
                required
                className="w-full border border-black bg-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter purok/street"
                disabled={isDisabled}
              />
            </div>

            {/* House No. / Residence (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                House No. / Residence (optional)
              </label>
              <input
                type="text"
                value={addressData.street}
                onChange={(e) =>
                  handleAddressChange(addressType, "street", e.target.value)
                }
                className="w-full border border-black bg-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter house number or residence (optional)"
                disabled={isDisabled}
              />
            </div>
          </div>
        </div>
      );
    };

    // Expose the getFormData function to parent component
    useImperativeHandle(ref, () => ({
      getFormData,
    }));

    return (
      <div className="bg-amber-100 p-4 border flex flex-col gap-4 rounded-lg">
        <h3 className="text-lg font-semibold  text-amber-800">
          Address Information
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Present Address */}
          {renderAddressFields("present", "Present Address")}

          {/* Permanent Address */}
          {renderAddressFields("permanent", "Permanent Address")}
        </div>
      </div>
    );
  }
);
