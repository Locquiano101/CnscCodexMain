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
      {/* Header */}

      <div className="flex items-center justify-center bg-cnsc-secondary-color h-fit w-full px-4 shadow-2xl">
        {/* Left: Logo + Title */}
        <div className="w-full h-full flex justify-start items-center">
          {isPosting && (
            <Home
              onClick={() => navigate("/student-leader")}
              size={32}
              className="hover:cursor-pointer"
            />
          )}
        </div>
        <div className="flex min-w-fit items-center space-x-2 p-4">
          <img
            src={backgroundImage} // replace with your actual logo path
            alt="CNSC Codex Logo"
            className="h-12 aspect-square rounded-full bg-white"
          />
          <span className="font-bold text-xl text-cnsc-primary-color">
            CNSC CODEX
          </span>
        </div>
        <div className="w-full h-full" />

        {/* Right: Manual + Icons */}
        {/* <div className="flex items-center space-x-4">
        <button className="flex items-center space-x-1 bg-amber-100 text-amber-600 px-2 py-1 rounded text-sm font-medium hover:bg-amber-200 transition">
          <HelpCircle size={16} />
          <span>Manual</span>
        </button>

        <Bell
          size={20}
          className="text-cnsc-primary-color cursor-pointer hover:scale-110 transition"
        />
      </div> */}
      </div>

      {/* Main content area */}
      <div className="flex h-full overflow-auto">
        {/* Sidebar */}
        {!isPosting && (
          <div className="w-1/5 h-full flex flex-col bg-cnsc-primary-color">
            <StudentNavigation orgData={orgData} />
            <LogoutButton />
          </div>
        )}
        {/* Main content */}
        <div className="flex-1 h-full overflow-y-auto">
          <StudentRoutes
            orgData={orgData}
            accreditationData={accreditationData}
          />
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

function StudentRoutes({ orgData, accreditationData }) {
  return (
    <div className="flex flex-col w-full h-full bg-gray-200 overflow-hidden">
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
      <div className="h-full w-full flex-col">
        <div className="mt-2 mb-4 flex items-center space-x-4 cursor-pointer group">
          {/* Logo container */}
          <div
            className="relative my-1 ml-3 w-16 aspect-square rounded-full 
                    bg-cnsc-secondary-color flex items-center justify-center 
                    overflow-hidden shadow-md ring-2 ring-white/40 
                    transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Organization Logo"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div
                onClick={handleUploadClick}
                className="w-full h-full relative"
              >
                {/* Background image */}
                <img
                  src={backgroundImage}
                  alt="Organization Logo"
                  className="w-full h-full object-cover rounded-full"
                />
                {/* Plus icon on hover */}
                <Plus
                  size={44}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                       text-white drop-shadow-md opacity-0 
                       group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            )}
          </div>

          {/* Welcome + Org name */}
          <div className="flex flex-col">
            <span className="text-white/80 text-sm font-medium">Welcome!</span>
            <h1
              onClick={() => navigate("/student-leader/post")}
              className="text-white font-extrabold text-lg tracking-wide drop-shadow-sm 
                     transition-colors duration-300 group-hover:text-cnsc-secondary-color"
            >
              {orgData.orgName} Organization
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 mx-2 ">
          {[
            {
              key: "home",
              icon: <Home className="mr-3 w-5 h-5" />,
              label: "Reports / Dashboard",
              path: "/student-leader",
            },
            {
              key: "accreditations",
              icon: <FolderOpen className="mr-3 w-5 h-5" />,
              label: "Accreditations",
              path: "/student-leader/accreditation",
            },
            {
              key: "accomplishments",
              icon: <File className="mr-3 w-5 h-5" />,
              label: "Accomplishments",
              path: "/student-leader/accomplishment",
            },
            {
              key: "proposals",
              icon: <FileText className="mr-3 w-5 h-5" />,
              label: "Proposals",
              path: "/student-leader/proposal",
            },
            {
              key: "Notifications",
              icon: <Bell className="mr-3 w-5 h-5" />,
              label: "Notifications",
              path: "/student-leader/notifications",
            },
            {
              key: "logs",
              icon: <Clock className="mr-3 w-5 h-5" />,
              label: "Logs",
              path: "/student-leader/log",
            },
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
      </div>

      {/* Upload Logo Modal */}
      {isUploadingLogo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-[420px] relative animate-fadeIn">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-xl font-bold text-cnsc-primary-color">
                Upload Organization Logo
              </h2>
              <X
                size={28}
                onClick={cancelUploadLogo}
                className="cursor-pointer hover:text-red-500 transition-colors"
              />
            </div>

            {/* Crop Tool */}
            <ProportionCropTool
              cropRef={cropRef}
              file={selectedFile}
              onCropComplete={handleCropComplete}
              initialProportion="1:1"
              acceptedFormats="image/*"
              className="bg-gray-100 rounded-lg shadow-inner"
            />

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={cancelUploadLogo}
                className="bg-gray-400 text-white px-5 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitOrgLogo}
                className="bg-cnsc-primary-color text-white px-5 py-2 rounded-lg shadow hover:bg-cnsc-secondary-color disabled:opacity-50 transition-colors"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Crop & Upload"}
              </button>
            </div>
          </div>
        </div>
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
      // Replace with your actual API call
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulated API call
      await axios.post(`${API_ROUTER}/logout`, {}, { withCredentials: true });

      // Optional: redirect or update UI after logout
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
      {/* Logout Button */}
      <div
        onClick={handleLogoutClick}
        className=" rounded-2xl flex gap-2 items-center justify-center text-2xl text-white font-bold px-4 w-full   border-cnsc-primary-color py-2  hover:text-cnsc-secondary-color transition-all duration-500 cursor-pointer  hover:bg-red-700 "
      >
        <LogOut size={16} />
        Logout
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {/* Modal Content */}
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Logout
              </h3>
              <button
                onClick={handleCancelLogout}
                className="text-gray-400 text-2xl hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                <X />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <LogOut size={24} className="text-red-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">
                    Are you sure you want to log out?
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    You'll need to sign in again to access your account.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={handleCancelLogout}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut size={16} />
                    Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
function StudentAccreditationNavigationPage() {
  const tabs = [
    { to: ".", label: "Overview", end: true },
    { to: "financial-report", label: "Financial Report" },
    { to: "documents", label: "Accreditation Documents" },
    { to: "roster-of-members", label: "Roster of Members" },
    { to: "president-information", label: "President's Information Sheet" },
    { to: "PPA", label: "Proposed Action Plan" },
  ];

  return (
    <div className="h-full flex flex-col ">
      {/* Navigation */}
      <nav className="flex gap-4 px-6 py-4 bg-white  ">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `text-lg font-semibold px-4 pt-2 ${
                isActive
                  ? "border-b-2 border-cnsc-primary-color text-cnsc-primary-color"
                  : "text-gray-600 hover:text-cnsc-primary-color"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      {/* Tab Content */}
      <div className="h-full overflow-hidden  flex flex-col ">
        <Outlet />
      </div>
    </div>
  );
}
