import axios from "axios";
import { useEffect, useState } from "react";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../App";
import { useOutletContext, NavLink, Routes, Route } from "react-router-dom";
import { DonePopUp, LogoutButton } from "../../../components/components";
import {
  Home,
  FolderOpen,
  File,
  X,
  FileText,
  PenSquare,
  Clock,
  Camera,
  Plus,
  LogOut,
} from "lucide-react";

import { AdviserAccreditationNavigationPage } from "./accreditation/adviser-accreditation.main";
import { AdviserFinancialReport } from "./accreditation/adviser-accreditation-financial-report";
import { AdviserAccreditationDocument } from "./accreditation/adviser-accreditation-documents";
import { AdviserRosterData } from "./accreditation/adviser-accreditation-roster";
import { AdviserPresident } from "./accreditation/adviser-accreditation-president";
import { AdviserProposal } from "./accreditation/adviser-accreditation-proposal";
import { AdviserAccreditationMainComponent } from "./accreditation/adviser-accreditation-overview";
import { AdviserProposalConduct } from "./proposal/adviser-proposals";
import { AdviserAccomplishmentReport } from "./accomplishment/adviser-accomplishment";

export function AdviserPage() {
  const { user } = useOutletContext();
  const [orgData, setOrgData] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchOrgInfo = async () => {
    try {
      const response = await axios.get(
        `${API_ROUTER}/getOrganizationProfile/${user.organizationProfile}`,
        { withCredentials: true }
      );

      setOrgData(response.data);

      if (response.data.adviser?.firstLogin) {
        setShowPasswordModal(true);
      }
    } catch (error) {
      console.error(
        "Error fetching organization data:",
        error.response || error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.organizationProfile) {
      fetchOrgInfo();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col h-screen w-screen overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-center bg-cnsc-secondary-color h-20 shadow-lg">
          <span className="font-bold text-xl text-cnsc-primary-color">
            CNSC CODEX
          </span>
        </div>

        {/* Main content area */}
        <div className="flex h-full overflow-auto">
          {/* Sidebar */}
          <div className="w-1/5 h-full flex flex-col bg-cnsc-primary-color">
            <AdviserNavigation user={user} orgData={orgData} />
          </div>

          {/* Main content */}
          <div className="flex-1 h-full overflow-y-auto">
            {!orgData ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-amber-600"></div>
              </div>
            ) : (
              <AdviserRoutes user={user} orgData={orgData} />
            )}
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <InitialSignInAdviser
          user={user}
          orgData={orgData}
          onFinish={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
}

function AdviserNavigation({ orgData }) {
  // Handle case where orgData is null
  if (!orgData) {
    return (
      <div className="h-full w-full flex-col">
        <div className="text-white mt-2 mb-4 font-bold flex items-center space-x-4">
          <div className="my-1 ml-3 w-15 aspect-square rounded-full bg-cnsc-secondary-color flex items-center justify-center text-2xl">
            <div className="animate-pulse bg-gray-300 rounded-full w-12 h-12"></div>
          </div>
          <div className="animate-pulse bg-gray-300 h-6 w-32 rounded"></div>
        </div>
        <nav className="flex flex-col gap-2">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-gray-300 h-12 mx-6 rounded-xl"
              ></div>
            ))}
        </nav>
      </div>
    );
  }

  const imageSrc =
    orgData._id && orgData.orgLogo
      ? `${DOCU_API_ROUTER}/${orgData._id}/${orgData.orgLogo}`
      : "";

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header with Org Logo + Name */}
      <div className="text-white mt-2 mb-4 font-bold flex items-center space-x-4 hover:cursor-pointer">
        {/* Logo */}
        <div
          className="my-1 ml-3 w-15 aspect-square rounded-full bg-cnsc-secondary-color 
                    flex items-center justify-center cursor-pointer overflow-hidden 
                    group relative"
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Organization Logo"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
          ) : null}
          <span
            className="relative inline-block"
            style={{ display: imageSrc ? "none" : "block" }}
          >
            <Camera size={48} />
            <Plus
              size={24}
              className="absolute top-0 right-0 transform translate-x-1/3 bg-cnsc-secondary-color rounded-full"
            />
          </span>
        </div>

        {/* Welcome message */}
        <div className="flex flex-col">
          <span className="text-white/80 text-sm font-medium">Welcome!</span>
          <h1 className="text-white font-extrabold text-lg tracking-wide drop-shadow-sm">
            {orgData.orgName || "Organization"} Adviser
          </h1>
        </div>
      </div>

      {/* Navigation + Logout */}
      <div className="flex flex-col flex-1">
        {/* Navigation */}
        <nav className="flex flex-col gap-1 mx-2">
          {[
            {
              key: "home",
              icon: <Home className="mr-3 w-5 h-5" />,
              label: "Dashboard",
              path: "/adviser",
            },
            {
              key: "accreditations",
              icon: <FolderOpen className="mr-3 w-5 h-5" />,
              label: "Accreditations",
              path: "/adviser/accreditation",
            },
            {
              key: "accomplishments",
              icon: <File className="mr-3 w-5 h-5" />,
              label: "Accomplishments",
              path: "/adviser/accomplishment",
            },
            {
              key: "proposals",
              icon: <FileText className="mr-3 w-5 h-5" />,
              label: "Proposals",
              path: "/adviser/proposal",
            },
            {
              key: "post",
              icon: <PenSquare className="mr-3 w-5 h-5" />,
              label: "Post",
              path: "/adviser/post",
            },
            // {
            //   key: "logs",
            //   icon: <Clock className="mr-3 w-5 h-5" />,
            //   label: "Logs",
            //   path: "/adviser/log",
            // },
          ].map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              end={item.key === "home"}
              className={({ isActive }) =>
                `flex items-center rounded-xl py-4 px-6 text-lg font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-white text-cnsc-primary-color shadow-md"
                    : "text-white hover:bg-amber-500/90 hover:pl-8"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button pinned at bottom */}
        <div className="mt-auto mx-2 mb-4">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
// AdviserRoutes.jsx
function AdviserRoutes({ orgData, user }) {
  return (
    <div className="flex flex-col w-full h-full bg-gray-200 overflow-hidden">
      <Routes>
        <Route
          index
          element={<AdviserHomePage orgData={orgData} user={user} />}
        />

        <Route
          path="proposal"
          element={<AdviserProposalConduct user={user} orgData={orgData} />}
        />

        <Route
          path="accreditation"
          element={<AdviserAccreditationNavigationPage />}
        >
          <Route
            index
            element={
              <AdviserAccreditationMainComponent
                user={user}
                orgId={orgData._id}
              />
            }
          />
          <Route
            path="financial-report"
            element={<AdviserFinancialReport user={user} orgData={orgData} />}
          />
          <Route
            path="roster-of-members"
            element={<AdviserRosterData user={user} orgData={orgData} />}
          />
          <Route
            path="president-information"
            element={<AdviserPresident user={user} orgData={orgData} />}
          />
          <Route
            path="documents"
            element={
              <AdviserAccreditationDocument user={user} orgData={orgData} />
            }
          />
          <Route
            path="ppa"
            element={<AdviserProposal user={user} orgData={orgData} />}
          />
        </Route>

        <Route
          path="accomplishment"
          element={
            <AdviserAccomplishmentReport orgData={orgData} user={user} />
          }
        />

        <Route
          path="post"
          element={
            <div className="p-4">
              <h1 className="text-2xl font-bold">Posts</h1>
              <p>Adviser post section content</p>
            </div>
          }
        />

        <Route
          path="log"
          element={
            <div className="p-4">
              <h1 className="text-2xl font-bold">Logs</h1>
              <p>Adviser logs section content</p>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

import { Eye, EyeOff, Lock } from "lucide-react";
import AdviserHomePage from "./adviser_home_page";

function InitialSignInAdviser({ user, orgData, onFinish }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Password validation
  const validatePassword = (password) => {
    const errors = {};
    if (password.length < 8) {
      errors.length = "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.lowercase = "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.uppercase = "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.number = "Password must contain at least one number";
    }
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      errors.special = "Password must contain at least one special character";
    }
    return errors;
  };

  const getPasswordStrength = (password) => {
    const validationErrors = validatePassword(password);
    const errorCount = Object.keys(validationErrors).length;

    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (errorCount >= 4)
      return { strength: 1, label: "Very Weak", color: "bg-red-500" };
    if (errorCount >= 3)
      return { strength: 2, label: "Weak", color: "bg-orange-500" };
    if (errorCount >= 2)
      return { strength: 3, label: "Fair", color: "bg-yellow-500" };
    if (errorCount === 1)
      return { strength: 4, label: "Good", color: "bg-blue-500" };
    return { strength: 5, label: "Strong", color: "bg-green-500" };
  };

  const handlePasswordChange = async () => {
    // Clear previous errors
    setErrors({});

    // Validate passwords

    if (newPassword !== confirmPassword) {
      setErrors({ confirm: "Passwords do not match" });
      setShowPopup({ type: "error", message: "Passwords do not match!" });
      return;
    }

    if (newPassword.length < 8) {
      setErrors({ password: "Password must be at least 8 characters long" });
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${API_ROUTER}/adviserChangePassword/${user.userId}`,
        {
          adviserId: orgData.adviser._id,
          newPassword,
        },
        { withCredentials: true }
      );

      setShowPopup({
        type: "success",
        message: "Password updated successfully!",
      });
    } catch (error) {
      console.error(error.response || error);
      const errorMessage =
        error.response?.data?.message || "Failed to update password";
      setShowPopup({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const isFormValid =
    newPassword && confirmPassword && newPassword === confirmPassword;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Change Password
        </h2>

        <div className="space-y-5">
          {/* New Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.password
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                      }}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      passwordStrength.strength <= 2
                        ? "text-red-600"
                        : passwordStrength.strength <= 3
                        ? "text-yellow-600"
                        : passwordStrength.strength <= 4
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>

                {/* Password Requirements */}
              </div>
            )}

            {errors.password && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <div className="w-1 h-1 bg-red-600 rounded-full" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.confirm
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>

            {/* Password Match Indicator */}
            {confirmPassword && newPassword && (
              <div
                className={`text-xs flex items-center gap-1 ${
                  newPassword === confirmPassword
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <div
                  className={`w-1 h-1 rounded-full ${
                    newPassword === confirmPassword
                      ? "bg-green-600"
                      : "bg-red-600"
                  }`}
                />
                {newPassword === confirmPassword
                  ? "Passwords match"
                  : "Passwords do not match"}
              </div>
            )}

            {errors.confirm && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <div className="w-1 h-1 bg-red-600 rounded-full" />
                {errors.confirm}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
            onClick={onFinish}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              isFormValid && !loading
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={handlePasswordChange}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </div>
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </div>

      {/* Success/Error Popup */}
      {showPopup && (
        <DonePopUp
          type={showPopup.type}
          message={showPopup.message}
          onClose={() => {
            setShowPopup(false);
            if (showPopup.type === "success") {
              onFinish();
            }
          }}
        />
      )}
    </div>
  );
}
