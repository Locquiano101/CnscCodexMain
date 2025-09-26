/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_ROUTER } from "../../../App";
import { Outlet } from "react-router-dom";
import {
  Home,
  FolderOpen,
  FileText,
  User,
  PenSquare,
  BookMarked,
  ClipboardList,
  ChevronDown,
  Users,
  Check,
  FileArchive,
  PenBox,
} from "lucide-react";
import { LogoutButton } from "../../../components/components";

export function SduMainNavigation() {
  const [activeKey, setActiveKey] = useState("home");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path === "/SDU" || path === "/SDU/" || path === "/") {
      setActiveKey("home");
    } else if (path.includes("/accreditation")) {
      setActiveKey("accreditations");
    } else if (path.includes("/accomplishment")) {
      setActiveKey("accomplishments");
    } else if (path.includes("/proposal")) {
      setActiveKey("proposals");
    } else if (path.includes("/post")) {
      setActiveKey("post");
    } else if (path.includes("/log")) {
      setActiveKey("logs");
    }
  }, [location.pathname]);

  const navigationItems = [
    {
      key: "home",
      icon: <Home className="w-5 h-5" />,
      label: "Dashboard",
      path: "/SDU",
    },
    {
      key: "accreditations",
      icon: <FolderOpen className="w-5 h-5" />,
      label: "Accreditations",
      path: "/SDU/accreditation",
    },

    {
      key: "accomplishments",
      icon: <BookMarked className="w-5 h-5" />,
      label: "Accomplishments",
      path: "/SDU/accomplishment",
    },
    {
      key: "proposals",
      icon: <FileText className="w-5 h-5" />,
      label: "Proposals",
      path: "/SDU/proposal",
    },
    {
      key: "users",
      icon: <User className="w-5 h-5" />,
      label: "User management",
      path: "/SDU/user-management",
    },
    {
      key: "post",
      icon: <PenBox className="w-5 h-5" />,
      label: "Posts & Announcements",
      path: "/SDU/post",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top header with welcome text */}
      <div className="h-18 bg-cnsc-secondary-color flex flex-col items-center justify-center shadow-md">
        <h1 className="text-white text-xl font-bold tracking-wide">
          Welcome SDU Admin
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col  w-full flex-grow ">
        {navigationItems.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setActiveKey(item.key);
              navigate(item.path);
            }}
            className={`flex items-center py-6 px-6 text-base font-medium transition-all duration-300 ${
              activeKey === item.key
                ? "bg-white text-cnsc-primary-color shadow-md"
                : "text-white hover:bg-amber-500/90 hover:pl-8"
            }`}
          >
            <span className="mr-3 w-5 h-5">{item.icon}</span>
            <span className="tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout at bottom */}
      <div className="px-2 mb-4">
        <LogoutButton />
      </div>
    </div>
  );
}

export function SduMainAccreditationNavigation({ selectedOrg }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Navigation items with enhanced styling data
  const navigationItems = [
    {
      key: "overview",
      label: "Overview",
      shortLabel: "Overview",
      icon: <Home className="w-4 h-4" />,
      path: `/sdu/accreditation/`,
      description: "General information and status",
    },
    {
      key: "president",
      label: "President's Information Sheet",
      shortLabel: "President's Info",
      icon: <FileText className="w-4 h-4" />,
      path: `/sdu/accreditation/president-information`,
      description: "President details and information",
    },
    {
      key: "financial",
      label: "Financial Report",
      shortLabel: "Financial Report",
      icon: <ClipboardList className="w-4 h-4" />,
      path: `/sdu/accreditation/financial-report`,
      description: "Financial statements and reports",
    },
    {
      key: "roster",
      label: "Roster of Members",
      shortLabel: "Members Roster",
      icon: <Users className="w-4 h-4" />,
      path: `/sdu/accreditation/roster-of-members`,
      description: "Complete list of organization members",
    },
    {
      key: "plan",
      label: "Proposed Action Plan",
      shortLabel: "Action Plan",
      icon: <FolderOpen className="w-4 h-4" />,
      path: `/sdu/accreditation/proposed-action-plan`,
      description: "Strategic plans and proposals",
    },
    {
      key: "documents",
      label: "Accreditation Documents",
      shortLabel: "Documents",
      icon: <FileArchive className="w-4 h-4" />,
      path: `/sdu/accreditation/document`,
      description: "All supporting documents",
    },
  ];

  // Find current active item
  const activeItem =
    navigationItems.find((item) => location.pathname === item.path) ||
    navigationItems.find((item) => location.pathname.startsWith(item.path)) ||
    navigationItems[0];
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch accreditation status
  const fetchStatus = async () => {
    if (!selectedOrg?._id) return;

    try {
      const res = await axios.get(
        `${API_ROUTER}/checkAccreditationApprovalStatuses/${selectedOrg._id}`
      );

      if (res.data.isEverythingApproved) {
        setShowApprovalPopup(true);
      }
    } catch (error) {
      console.error("Failed to fetch accreditation data", error);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus, location, selectedOrg]);

  // Send approval letter
  const sendApprovalLetter = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `${API_ROUTER}/sendAccreditationConfirmationEmail/${selectedOrg._id}`,
        {
          orgName: selectedOrg.orgName,
          orgId: selectedOrg._id,
        }
      );
      console.log("Approval letter sent:", res.data);
      setShowApprovalPopup(false);

      // Success notification
      const notification = document.createElement("div");
      notification.innerHTML = `
        <div class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          Approval letter sent successfully!
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (error) {
      console.error("Failed to send approval letter:", error);

      // Error notification
      const notification = document.createElement("div");
      notification.innerHTML = `
        <div class="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          Failed to send approval letter. Please try again.
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigate = (item) => {
    navigate(item.path);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-gray-50">
      {/* Enhanced Navigation Header */}
      <div className="  border-gray-500">
        <div className="px-4 py-2">
          {/* Dropdown Navigation */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`group w-85 border max-w-md px-4 py-3 flex items-center justify-between 
      ${isDropdownOpen ? "rounded-t-xl" : "rounded-xl"}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg`}>{activeItem.icon}</div>
                <div className="text-left">
                  <div className="font-semibold text-lg ">
                    {activeItem.label}
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                className={`absolute w-85 top-full left-0 right-0 rounded-b-xl border border-gray-500 bg-white  z-50 overflow-hidden max-w-md`}
              >
                <div className="py-2">
                  {navigationItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => handleNavigate(item)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-150 flex items-center gap-4 group `}
                    >
                      <div className={` rounded-lg`}>{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-lg ${
                            activeItem.key === item.key
                              ? "text-blue-700"
                              : "text-gray-900"
                          }`}
                        >
                          {item.shortLabel}
                        </div>
                      </div>
                      {activeItem.key === item.key && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TESTING AREA  */}
      <button
        onClick={async () => {
          try {
            const res = await axios.post(`${API_ROUTER}/sendTestNotification`, {
              recipientId: "68d59b4fbcfb5416f3af63c1",
              message: "Admin pressed the button 🚀",
            });
            console.log("✅ Response:", res.data);
          } catch (err) {
            console.error("❌ Error:", err);
          }
        }}
        className="bg-red-500 p-12"
      >
        awkejhasdkjh
      </button>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>

      {/* Enhanced Approval Modal */}
      {showApprovalPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform scale-100 transition-all">
            <div className="p-6 text-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-green-600" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Accreditation Complete!
              </h3>
              <p className="text-gray-600 mb-6">
                The accreditation process for{" "}
                <span className="font-semibold text-gray-900">
                  "{selectedOrg.orgName}"
                </span>{" "}
                has been completed successfully. Would you like to notify them
                with an approval letter?
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApprovalPopup(false)}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  disabled={isSubmitting}
                >
                  Later
                </button>
                <button
                  onClick={sendApprovalLetter}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cnsc-primary-color to-cnsc-secondary-color text-white rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Letter
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
