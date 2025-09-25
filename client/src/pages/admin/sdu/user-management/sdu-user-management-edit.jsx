import axios from "axios";
import { useState, useCallback, useEffect } from "react";
import { API_ROUTER } from "../../../../App";

import { GraduationCap, Building, Mail, X, Save, User } from "lucide-react";
import { departments } from "../sdu-main";

export function EditUserModal({ user, onClose, onUserUpdated, organization }) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    position: user?.position?.toLowerCase() || "",
    deliveryUnit: user?.deliveryUnit || "",
    organizationId: user?.organizationProfile || "",
    password: user?.password || "", // in case you’re showing disabled password
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        position: user.position?.toLowerCase() || "",
        deliveryUnit: user.deliveryUnit || "",
        organizationId: user.organizationProfile || "",
        password: user.password || "",
      });

      // 🔑 auto-detect the department based on the deliveryUnit
      if (user.deliveryUnit) {
        const department = Object.keys(departments).find((departmentName) =>
          departments[departmentName].includes(user.deliveryUnit)
        );
        if (department) {
          setSelectedDepartment(department);
        }
      }
    }
  }, [user]);

  const logFormData = useCallback((action, data) => {
    console.log(`[${action}]`, data);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "position" && {
        organizationId: "",
        deliveryUnit: "",
      }),
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    logFormData("Form Input Change", { field: name, value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.position) newErrors.position = "Position is required";

    if (
      formData.position === "student-leader" ||
      formData.position === "adviser"
    ) {
      if (!formData.organizationId) {
        newErrors.organizationId = "Organization is required";
      }
    }

    if (
      formData.position === "sdu" ||
      (formData.position === "dean" && !formData.deliveryUnit.trim())
    ) {
      newErrors.deliveryUnit = "Delivery Unit is required";
    }

    setErrors(newErrors);
    logFormData("Form Validation", {
      errors: newErrors,
      isValid: Object.keys(newErrors).length === 0,
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        position: formData.position,
      };

      if (
        formData.position === "student-leader" ||
        formData.position === "adviser"
      ) {
        userData.organizationProfile = formData.organizationId;
      } else if (formData.position === "sdu" || formData.position === "dean") {
        userData.deliveryUnit = formData.deliveryUnit.trim();
      }

      logFormData("Sending Update Request", userData);

      const response = await axios.post(
        `${API_ROUTER}/updateUser/${user._id}`,
        userData
      );

      logFormData("User Updated Successfully", response.data);

      if (onUserUpdated) onUserUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      alert(
        error.response?.data?.message ||
          "Error updating user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderConditionalFields = () => {
    switch (formData.position) {
      case "student-leader":
      case "adviser":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="w-4 h-4 inline mr-2" />
              Organization *
            </label>
            <select
              name="organizationId"
              value={formData.organizationId}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.organizationId ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Organization</option>
              {organization.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.orgName}
                </option>
              ))}
            </select>
            {errors.organizationId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.organizationId}
              </p>
            )}
          </div>
        );

      case "dean":
      case "sdu-coordinator":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Unit *
            </label>
            <select
              name="deliveryUnit"
              value={formData.deliveryUnit}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.deliveryUnit ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Department</option>
              {Object.keys(departments).map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {errors.deliveryUnit && (
              <p className="mt-1 text-sm text-red-600">{errors.deliveryUnit}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Edit User
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position *
            </label>
            <select
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.position ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Position</option>
              <option value="student-leader">Student</option>
              <option value="adviser">Adviser</option>
              <option value="dean">Dean</option>
              <option value="sdu">SDU</option>
              <option value="sdu-coordinator">SDU Coordinator</option>
            </select>
            {errors.position && (
              <p className="mt-1 text-sm text-red-600">{errors.position}</p>
            )}
          </div>

          {/* Conditional Fields */}
          {renderConditionalFields()}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              {loading ? "Updating..." : "Update User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
