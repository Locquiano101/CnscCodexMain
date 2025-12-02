/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useRef, useState } from "react";
import {
  NavLink,
  Routes,
  Route,
  useOutletContext,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Home,
  FolderOpen,
  File,
  FileText,
  PenSquare,
  Clock,
  LogOut,
  X,
  Plus,
  Bell,
} from "lucide-react";

import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../App";
import { InitialRegistration, ReRegistration } from "./initial-registration";
import StudentLeaderPresidentListComponent from "./accreditation/presidents/president";
import StudentLeaderRosters from "./accreditation/roster-members/roster-member";
import StudentAccreditationMainComponent from "./accreditation/student-accreditation-main";
import StudentHomePage from "./home";
import FinancialReport from "./accreditation/financial-report.jsx/financial-report";
import { ProportionCropTool } from "../../../components/image_uploader";
import { AccreditationDocuments } from "./accreditation/accreditation-document";
import { StudentProposedPlan } from "./accreditation/propose-plan/proposed-plan";
import { StudentLeaderProposal } from "./proposal/student-leader-proposals";
import { StudentLeaderAccomplishmentReport } from "./accomplishment/student-leader-accomplishments";
import backgroundImage from "./../../../assets/cnsc-codex-2.svg";

import { StudentPost } from "./posts/student-post";
import { StudentLeaderNotification } from "./student-leader-notification";
import DocumentUploader from "../../../components/document_uploader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import cnscLogo from "../../../assets/cnsc-codex-2.svg";

export default function StudentLeaderMainPage() {
  // User and organization data
  const { user } = useOutletContext();
  const [userId, setUserId] = useState(user?.userId || user?._id);
  const [orgData, setOrgData] = useState({});
  const [orgProfileId, setOrgProfileId] = useState("");
  const [accreditationData, setAccreditationData] = useState({});

  // Modal state for initial registration
  const [showInitialRegistration, setShowInitialRegistration] = useState(false);
  const [showReRegistration, setShowReRegistration] = useState(false);

  // Loading and navigation states
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const isPosting = location.pathname === "/student-leader/post";

  // Update userId when user changes
  useEffect(() => {
    if (user?._id) {
      setUserId(user._id);
    }
  }, [user]);

  // Fetch user data and handle navigation
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        const response = await axios.get(`${API_ROUTER}/userInfo/${userId}`, {
          withCredentials: true,
        });

        const userData = response.data.organization;
        setOrgData(userData);

        // If no organization profile, show registration popup
        if (!userData || Object.keys(userData).length === 0) {
          setShowInitialRegistration(true);
        }

        // If org profile exists but is inactive, show re-registration
        if (!userData?.isActive) {
          setShowReRegistration(true);
        }

        // Set organization profile ID if available
        if (userData?._id && !orgProfileId) {
          setOrgProfileId(userData._id);
        }
      } catch (error) {
        console.log("Error fetching user data:", error.response?.data);
        if (!error.response?.data?.organization) {
          setShowInitialRegistration(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, location]);

  // Fetch accreditation data when organization profile ID changes
  useEffect(() => {
    const fetchAccreditationData = async () => {
      if (!orgProfileId) return;

      try {
        const response = await axios.get(
          `${API_ROUTER}/getAccreditationInfo/${orgProfileId}`,
          { withCredentials: true }
        );

        setAccreditationData(response.data);
      } catch (error) {
        console.error("Error fetching accreditation info:", error);
      }
    };

    fetchAccreditationData();
  }, [orgProfileId, location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      {/* Main content area */}
      <div className="flex h-full overflow-auto">
        {/* Sidebar */}
        {!isPosting && (
          <div className="w-64 flex-shrink-0">
            <StudentNavigation orgData={orgData} />
          </div>
        )}
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <StudentTopbar orgData={orgData} />
          {/* Page Content */}
          <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#F5F5F9' }}>
            <StudentRoutes
              orgData={orgData}
              accreditationData={accreditationData}
              user={user}
            />
          </div>
        </div>
      </div>

      {/* Initial Registration Popup */}
      {showInitialRegistration && (
        <InitialRegistration
          user={user}
          onComplete={() => setShowInitialRegistration(false)}
        />
      )}
      {showReRegistration && (
        <ReRegistration
          OrgData={orgData}
          user={user}
          onComplete={() => setShowReRegistration(false)}
        />
      )}
    </div>
  );
}

function StudentTopbar({ orgData }) {
  const location = useLocation();
  
  // Map routes to page info
  const getPageInfo = () => {
    const path = location.pathname;
    
    if (path === "/student-leader" || path === "/student-leader/") {
      return { title: "Dashboard", description: "Manage your organization's activities" };
    } else if (path.includes("/accreditation")) {
      return { title: "Accreditation", description: "Track and manage accreditation requirements" };
    } else if (path.includes("/accomplishment")) {
      return { title: "Accomplishments", description: "View and submit organizational accomplishments" };
    } else if (path.includes("/proposal")) {
      return { title: "Proposals", description: "Create and manage activity proposals" };
    } else if (path.includes("/post")) {
      return { title: "Posts", description: "Share updates and announcements" };
    } else if (path.includes("/notifications")) {
      return { title: "Notifications", description: "Stay updated with your organization" };
    }
    
    return { title: "CNSC Codex", description: "Student Leader Portal" };
  };

  const { title, description } = getPageInfo();
  const imageSrc = orgData._id && orgData.orgLogo
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
          <p className="text-sm font-medium">{orgData.orgName || "Organization"}</p>
          <p className="text-xs text-muted-foreground">{orgData.orgAcronym || ""}</p>
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

function StudentRoutes({ orgData, accreditationData, user }) {
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
        console.warn("StudentRoutes: failed to fetch visible requirements", err?.message);
      }
    }
    fetchVisible();
    return () => {
      ignore = true;
    };
  }, []);

  const customRequirementRoutes = visibleRequirements
    .filter((r) => r.type === "custom")
    .map((r) => (
      <Route
        key={r.key}
        path={`custom-${r.key}`}
        element={<StudentLeaderCustomRequirementViewer requirementKey={r.key} title={r.title} orgData={orgData} user={user} />}
      />
    ));

  return (
    <div className="flex flex-col w-full h-full overflow-hidden" style={{ backgroundColor: '#F5F5F9' }}>
      <Routes>
        <Route
          index
          element={
            <StudentHomePage
              orgData={orgData}
              accreditationData={accreditationData}
            />
          }
        />

        <Route
          path="proposal"
          element={<StudentLeaderProposal orgData={orgData} />}
        />

        <Route
          path="accreditation"
          element={<StudentAccreditationNavigationPage />}
        >
          <Route
            index
            element={
              <StudentAccreditationMainComponent
                orgId={orgData._id}
                accreditationData={accreditationData}
              />
            }
          />
          <Route
            path="financial-report"
            element={<FinancialReport orgData={orgData} />}
          />
          <Route
            path="roster-of-members"
            element={<StudentLeaderRosters orgData={orgData} />}
          />
          <Route
            path="president-information"
            element={
              <StudentLeaderPresidentListComponent
                orgData={orgData}
                accreditationData={accreditationData}
              />
            }
          />
          <Route
            path="Documents"
            element={
              <AccreditationDocuments
                orgData={orgData}
                accreditationData={accreditationData}
              />
            }
          />
          <Route
            path="PPA"
            element={
              <StudentProposedPlan
                orgData={orgData}
                accreditationData={accreditationData}
              />
            }
          />
          {customRequirementRoutes}
        </Route>

        <Route
          path="accomplishment"
          element={<StudentLeaderAccomplishmentReport orgData={orgData} />}
        />

        <Route
          path="notifications"
          element={<StudentLeaderNotification orgData={orgData} />}
        />

        <Route path="Post" element={<StudentPost orgData={orgData} />} />

        <Route
          path="log"
          element={
            <div className="p-4">
              <h1 className="text-2xl font-bold">Logs</h1>
              <p>Student logs section content</p>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

// Lightweight viewer for custom accreditation requirements for student leaders.
// Future enhancement: allow document upload per custom requirement.
function StudentLeaderCustomRequirementViewer({ requirementKey, title, orgData, user }) {
  const [submission, setSubmission] = useState(null); // { status, document { fileName } }
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  // Derive organization profile id directly from orgData passed down
  const orgProfileId = orgData?._id || user?.organization?._id;

  useEffect(() => {
    let ignore = false;
    async function fetchSubmission() {
      if (!orgProfileId) return;
      try {
        const { data } = await axios.get(
          `${API_ROUTER}/accreditation/requirements/${requirementKey}/submission/${orgProfileId}`,
          { withCredentials: true }
        );
        if (!ignore) setSubmission(data.submission);
      } catch (err) {
        console.warn("Failed to fetch requirement submission", err?.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchSubmission();
    return () => {
      ignore = true;
    };
  }, [orgProfileId, requirementKey]);

  const handleUpload = async () => {
    if (!file || !orgProfileId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("organizationProfile", orgProfileId);
      const { data } = await axios.post(
        `${API_ROUTER}/accreditation/requirements/${requirementKey}/submit`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );
      setSubmission(data.submission);
      setFile(null);
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const statusStyles = {
    Approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 border border-amber-200",
    Rejected: "bg-red-50 text-red-700 border border-red-200",
  };
  const pill = submission?.status ? (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[submission.status] || "bg-gray-100 text-gray-600 border"}`}>{submission.status}</span>
  ) : null;

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">{title} {pill}</h2>
        </div>
        <p className="text-sm text-gray-600">
          Upload the document corresponding to <code>{requirementKey}</code>. Re-uploading will replace the previous file and reset status to Pending.
        </p>
        {loading && <div className="text-gray-500 text-sm">Loading submission info...</div>}
        <div className="flex flex-col lg:flex-row gap-6 overflow-hidden">
          {/* Left: Uploader + logs */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            <DocumentUploader
              onFileSelect={setFile}
              acceptedFormats="application/pdf"
              title={submission ? "Select a document to replace" : "Select a document to upload"}
              showReset={true}
              className="mb-2"
            />
            <button
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                  Uploading...
                </>
              ) : submission ? (
                "Replace File"
              ) : (
                "Upload File"
              )}
            </button>
            {submission?.logs && submission.logs.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Document Logs</h4>
                <ul className="space-y-1 text-sm text-gray-700 max-h-32 overflow-y-auto">
                  {submission.logs.map((log, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mt-1"></span>
                      <span>{log}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {/* Right: Preview */}
          <div className="flex-1 min-h-[420px] flex flex-col">
            {!loading && submission?.document?.fileName ? (
              <div className="flex-1 flex flex-col gap-3">
                <div className="border rounded-lg overflow-hidden bg-white shadow-sm flex-1">
                  <iframe
                    className="w-full h-[520px]"
                    src={`${DOCU_API_ROUTER}/${orgProfileId}/${submission.document.fileName}#toolbar=0&navpanes=0&scrollbar=0`}
                    title="Requirement Submission Preview"
                    onError={() => setPreviewError(true)}
                  />
                </div>
                {previewError && (
                  <div className="p-4 text-sm rounded-md bg-red-50 border border-red-200 text-red-700 flex flex-col gap-2">
                    <span>File not found at the expected path.</span>
                    <span>It may be stored in a legacy folder. Use the fallback link or re-upload.</span>
                  </div>
                )}
                
              </div>
            ) : (
              !loading && (
                <div className="flex-1 border border-dashed rounded-xl text-center text-gray-500 bg-white flex items-center justify-center">
                  No submission yet.
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentNavigation({ orgData }) {
  // Add safety check for orgData
  if (!orgData) {
    return <div>Loading...</div>;
  }
  const imageSrc =
    orgData._id && orgData.orgLogo
      ? `${DOCU_API_ROUTER}/${orgData._id}/${orgData.orgLogo}`
      : "";
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [croppedData, setCroppedData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const cropRef = useRef();
  const navigate = useNavigate();

  const handleUploadClick = () => {
    setIsUploadingLogo(true);
  };

  const cancelUploadLogo = () => {
    setIsUploadingLogo(false);
    setSelectedFile(null);
    setCroppedData(null);
  };

  const handleCropComplete = (cropData) => {
    setCroppedData(cropData);
  };

  const handleSubmitOrgLogo = async () => {
    setIsUploading(true);

    try {
      let finalCropData = croppedData;

      // If there's an image uploaded but not cropped yet, crop it first
      if (cropRef.current && cropRef.current.hasImage && !croppedData) {
        console.log("Cropping image before submit...");
        const result = await cropRef.current.cropImage();
        if (result) {
          finalCropData = result;
          setCroppedData(result); // Fixed: was setCropData
          console.log("Crop completed:", result);
        }
      }

      const formData = new FormData();
      formData.append("orgId", orgData._id); // Add organization ID if needed
      formData.append("organizationProfile", orgData._id); // Add organization ID if needed

      // Add cropped image file to FormData (if available)
      if (finalCropData && finalCropData.croppedFile) {
        formData.append("file", finalCropData.croppedFile);
        formData.append("profilePicture", finalCropData.croppedFile.name);
      }

      console.log("=== FormData Contents ===");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      // Send to backend
      const response = await axios.post(
        `${API_ROUTER}/uploadOrganizationLogo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Logo uploaded successfully:", response.data);

      // Close modal on success
      setIsUploadingLogo(false);
      setSelectedFile(null);
      setCroppedData(null);

      // Optionally show success message
      alert("Logo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Error uploading logo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="h-full w-full flex flex-col bg-background border-r">
        {/* Logo and Brand Header */}
        <div className="h-18 border-b flex items-center px-6 gap-3">
          <img src={cnscLogo} alt="CNSC Codex" className="w-10 h-10" />
          <div className="flex flex-col">
            <h1 className="font-bold text-lg leading-tight">CNSC Codex</h1>
            <p className="text-xs text-muted-foreground">Student Leader</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {[
            {
              key: "home",
              icon: <Home className="w-5 h-5" />,
              label: "Dashboard",
              path: "/student-leader",
            },
            {
              key: "accreditations",
              icon: <FolderOpen className="w-5 h-5" />,
              label: "Accreditations",
              path: "/student-leader/accreditation",
            },
            {
              key: "accomplishments",
              icon: <File className="w-5 h-5" />,
              label: "Accomplishments",
              path: "/student-leader/accomplishment",
            },
            {
              key: "proposals",
              icon: <FileText className="w-5 h-5" />,
              label: "Proposals",
              path: "/student-leader/proposal",
            },
            {
              key: "Notifications",
              icon: <Bell className="w-5 h-5" />,
              label: "Notifications",
              path: "/student-leader/notifications",
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

      {/* Upload Logo Modal */}
      {isUploadingLogo && (
        <Dialog open={isUploadingLogo} onOpenChange={setIsUploadingLogo}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Organization Logo</DialogTitle>
            </DialogHeader>

            <ProportionCropTool
              cropRef={cropRef}
              file={selectedFile}
              onCropComplete={handleCropComplete}
              initialProportion="1:1"
              acceptedFormats="image/*"
              className="bg-muted rounded-lg"
            />

            <DialogFooter>
              <Button
                variant="outline"
                onClick={cancelUploadLogo}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitOrgLogo}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Crop & Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function LogoutButton() {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogoutClick = () => {
    setShowModal(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${API_ROUTER}/logout`, {}, { withCredentials: true });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoading(false);
    }
  };

  const handleCancelLogout = () => {
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={handleLogoutClick}
        className={cn(
          "w-full flex items-center gap-3 h-11 px-3 rounded-md cursor-pointer transition-colors",
          "text-destructive hover:bg-destructive/10"
        )}
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Logout</span>
      </button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to logout? You will need to sign in again to access your account.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelLogout}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmLogout}
              disabled={isLoading}
            >
              {isLoading ? "Logging out..." : "Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StudentAccreditationNavigationPage() {
  // Fetch all visible requirements so we can display both template and custom items.
  const [visibleRequirements, setVisibleRequirements] = useState(null); // null = loading; [] = none
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
        console.warn("StudentAccreditationNavigationPage: failed to fetch requirements", err?.message);
        setVisibleRequirements([]); // fallback show all templates by default below
      }
    }
    fetchVisible();
    return () => {
      ignore = true;
    };
  }, []);

  const templateMap = {
    "financial-report": { to: "financial-report", label: "Financial Report" },
    "accreditation-documents": { to: "documents", label: "Accreditation Documents" },
    roster: { to: "roster-of-members", label: "Roster of Members" },
    "president-info": { to: "president-information", label: "President's Information Sheet" },
    "action-plan": { to: "PPA", label: "Proposed Action Plan" },
  };
  const orderedTemplateKeys = [
    "financial-report",
    "accreditation-documents",
    "roster",
    "president-info",
    "action-plan",
  ];

  const enabledTemplateTabs = orderedTemplateKeys
    .filter((key) => {
      if (visibleRequirements === null) return true; // optimistic show while loading
      const anyDisabledFallback = visibleRequirements.length === 0; // we treat empty as error fallback
      if (anyDisabledFallback) return true;
      return visibleRequirements.some((r) => r.type === "template" && r.key === key);
    })
    .map((key) => templateMap[key]);

  const customTabs = (visibleRequirements || [])
    .filter((r) => r.type === "custom")
    .map((r) => ({ to: `custom-${r.key}`, label: r.title }));

  const tabs = [{ to: ".", label: "Overview", end: true }, ...enabledTemplateTabs, ...customTabs];

  return (
    <div className="h-full flex flex-col">
      {/* Navigation */}
      <nav className="flex gap-1 px-6 py-3 bg-background border-b overflow-x-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                "px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      {/* Tab Content (make scrollable) */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
