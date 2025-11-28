import axios from "axios";
import { useEffect, useState } from "react";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../App";
import { useOutletContext, NavLink, Routes, Route, useLocation } from "react-router-dom";
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
  Building2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import cnscLogo from "../../../assets/cnsc-codex-2.svg";
import backgroundImage from "../../../assets/cnsc-codex-2.svg";

import { AdviserAccreditationNavigationPage } from "./accreditation/adviser-accreditation.main";
import AdviserCustomRequirementViewer from "./accreditation/adviser-custom-requirement-viewer";
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
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      {/* Main content area */}
      <div className="flex h-full overflow-auto">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <AdviserNavigation user={user} orgData={orgData} />
        </div>
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <AdviserTopbar orgData={orgData} />
          {/* Page Content */}
          <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#F5F5F9' }}>
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

function AdviserTopbar({ orgData }) {
  const location = useLocation();
  
  // Map routes to page info
  const getPageInfo = () => {
    const path = location.pathname;
    
    if (path === "/adviser" || path === "/adviser/") {
      return { title: "Dashboard", description: "Monitor and manage your organization" };
    } else if (path.includes("/accreditation")) {
      return { title: "Accreditation", description: "Review and approve accreditation requirements" };
    } else if (path.includes("/accomplishment")) {
      return { title: "Accomplishments", description: "Review organizational accomplishments" };
    } else if (path.includes("/proposal")) {
      return { title: "Proposals", description: "Review and approve activity proposals" };
    }
    
    return { title: "CNSC Codex", description: "Adviser Portal" };
  };

  const { title, description } = getPageInfo();
  const imageSrc = orgData?._id && orgData?.orgLogo
    ? `${DOCU_API_ROUTER}/${orgData._id}/${orgData.orgLogo}`
    : backgroundImage;

  return (
    <div className="h-18 border-b bg-background flex items-center justify-between px-6">
      {/* Left: Page Title & Description */}
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Right: Org Picture & Name */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">{orgData?.orgName || "Organization"}</p>
          <p className="text-xs text-muted-foreground">{orgData?.orgAcronym || ""}</p>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
          <img
            src={imageSrc}
            alt="Organization Logo"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

function AdviserNavigation({ orgData }) {
  // Handle case where orgData is null
  if (!orgData) {
    return (
      <div className="h-full w-full flex flex-col bg-background border-r">
        <div className="h-18 border-b flex items-center px-6 gap-3">
          <div className="animate-pulse bg-gray-300 rounded w-10 h-10"></div>
          <div className="flex flex-col gap-1">
            <div className="animate-pulse bg-gray-300 h-5 w-24 rounded"></div>
            <div className="animate-pulse bg-gray-300 h-3 w-16 rounded"></div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-gray-300 h-11 rounded-md"
              ></div>
            ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-background border-r">
      {/* Logo and Brand Header */}
      <div className="h-18 border-b flex items-center px-6 gap-3">
        <img src={cnscLogo} alt="CNSC Codex" className="w-10 h-10" />
        <div className="flex flex-col">
          <h1 className="font-bold text-lg leading-tight">CNSC Codex</h1>
          <p className="text-xs text-muted-foreground">Adviser</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {[
          {
            key: "home",
            icon: <Home className="w-5 h-5" />,
            label: "Dashboard",
            path: "/adviser",
          },
          {
            key: "accreditations",
            icon: <FolderOpen className="w-5 h-5" />,
            label: "Accreditations",
            path: "/adviser/accreditation",
          },
          {
            key: "accomplishments",
            icon: <File className="w-5 h-5" />,
            label: "Accomplishments",
            path: "/adviser/accomplishment",
          },
          {
            key: "proposals",
            icon: <FileText className="w-5 h-5" />,
            label: "Proposals",
            path: "/adviser/proposal",
          },
        ].map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            end={item.key === "home"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 h-11 px-3 rounded-md cursor-pointer transition-colors text-sm font-medium",
                isActive
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "text-foreground hover:bg-muted"
              )
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t">
        <LogoutButton />
      </div>
    </div>
  );
}
// AdviserRoutes.jsx
function AdviserRoutes({ orgData, user }) {
  // Fetch visible accreditation requirements for dynamic custom routes
  const [visibleRequirements, setVisibleRequirements] = useState([]);
  useEffect(() => {
    let ignore = false;
    async function fetchVisible() {
      try {
        const { data } = await axios.get(
          `${API_ROUTER}/accreditation/requirements/visible`,
          { withCredentials: true }
        );
        if (!ignore) setVisibleRequirements(data || []);
      } catch (err) {
        console.warn("AdviserRoutes: failed to fetch visible requirements", err?.message);
      }
    }
    fetchVisible();
    return () => { ignore = true; };
  }, []);

  const customRequirementRoutes = visibleRequirements
    .filter((r) => r.type === "custom")
    .map((r) => (
      <Route
        key={r.key}
        path={`custom-${r.key}`}
        element={<AdviserCustomRequirementViewer requirementKey={r.key} title={r.title} orgData={orgData} user={user} />}
      />
    ));

  return (
    <div className="w-full h-full">
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
          {customRequirementRoutes}
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
import { constructFrom } from "date-fns";

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
    <Dialog open={true} onOpenChange={(open) => !open && onFinish()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Change Password</DialogTitle>
          <DialogDescription>
            Please set a new password for your account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* New Password Field */}
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`pl-10 pr-12 ${
                  errors.password
                    ? "border-red-300 bg-red-50"
                    : ""
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
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`pl-10 pr-12 ${
                  errors.confirm
                    ? "border-red-300 bg-red-50"
                    : ""
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

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onFinish}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordChange}
            disabled={!isFormValid || loading}
            className={
              isFormValid && !loading
                ? "bg-blue-600 hover:bg-blue-700"
                : ""
            }
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

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
    </Dialog>
  );
}
