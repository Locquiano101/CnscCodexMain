import { useState, useEffect, useRef } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import axios from "axios";
import { Routes, Route } from "react-router-dom";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../App";
import { useNavigate, useLocation, NavLink, useParams } from "react-router-dom";
import {
  Home,
  FolderOpen,
  FileText,
  PenSquare,
  Clock,
  BookMarked,
  ClipboardList,
  Search,
  ChevronDown,
  LogOut,
  Users,
  Check,
  X,
  Phone,
  FileArchive,
} from "lucide-react";
import { DeanComponent } from "./dean-route-components";

export function DeanPage() {
  const { user } = useOutletContext();
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch organizations
  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_ROUTER}/getOrganizations`, {
        deliveryUnit: user.deliveryUnit,
      });
      console.log(res.data);
      setOrgs(res.data);
    } catch (err) {
      console.error("Error fetching organizations:", err);
      setOrgs([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch organizations on component mount
  useEffect(() => {
    fetchOrganizations();
  }, []);

  return (
    <div className="flex h-screen w-screen bg-gray-50">
      <div className="flex h-full w-1/5 justify-between bg-cnsc-primary-color overflow-hidden">
        <DeanMainNavigation />
      </div>
      <div className="w-full h-full">
        <DeanComponent
          selectedOrg={selectedOrg}
          orgs={orgs}
          onSelectOrg={setSelectedOrg}
          setLoading={setLoading}
          loading={loading}
          user={user}
        />
      </div>
    </div>
  );
}

function DeanMainNavigation() {
  const [activeKey, setActiveKey] = useState("home");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path === "/dean" || path === "/dean/") {
      setActiveKey("home");
    } else if (path.includes("/dean/accreditation")) {
      setActiveKey("accreditations");
    } else if (path.includes("/dean/accomplishment")) {
      setActiveKey("accomplishments");
    } else if (path.includes("/dean/proposal")) {
      setActiveKey("proposals");
    } else if (path.includes("/dean/post")) {
      setActiveKey("post");
    } else if (path.includes("/dean/log")) {
      setActiveKey("logs");
    }
  }, [location.pathname]);

  const navigationItems = [
    {
      key: "home",
      icon: <Home className="w-5 h-5" />,
      label: "Reports/Dashboard",
      path: "/dean",
    },
    {
      key: "accreditations",
      icon: <FolderOpen className="w-5 h-5" />,
      label: "Accreditations",
      path: "/dean/accreditation",
    },
    {
      key: "accomplishments",
      icon: <BookMarked className="w-5 h-5" />,
      label: "Accomplishments",
      path: "/dean/accomplishment",
    },
    {
      key: "proposals",
      icon: <FileText className="w-5 h-5" />,
      label: "Proposals",
      path: "/dean/proposal",
    },

    {
      key: "logs",
      icon: <Clock className="w-5 h-5" />,
      label: "Logs",
      path: "/dean/log",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top header with welcome text */}
      <div className="h-28 bg-cnsc-secondary-color flex flex-col items-center justify-center shadow-md">
        <h1 className="text-white text-xl font-bold tracking-wide">
          Welcome Dean
        </h1>
        <p className="text-amber-300 text-sm font-medium">
          Manage your dashboard
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 w-full flex-grow mt-5 px-2">
        {navigationItems.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setActiveKey(item.key);
              navigate(item.path);
            }}
            className={`flex items-center rounded-xl py-4 px-6 text-base font-medium transition-all duration-300 shadow-sm ${
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

export function DeanAccreditationNavigationSubRoute({ selectedOrg }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [accreditationStatus, setAccreditationStatus] = useState(null);
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
      path: `/dean/accreditation/`,
      description: "General information and status",
    },
    {
      key: "president",
      label: "President's Information Sheet",
      shortLabel: "President's Info",
      icon: <FileText className="w-4 h-4" />,
      path: `/dean/accreditation/president-information`,
      description: "President details and information",
    },
    {
      key: "financial",
      label: "Financial Report",
      shortLabel: "Financial Report",
      icon: <ClipboardList className="w-4 h-4" />,
      path: `/dean/accreditation/financial-report`,
      description: "Financial statements and reports",
    },
    {
      key: "roster",
      label: "Roster of Members",
      shortLabel: "Members Roster",
      icon: <Users className="w-4 h-4" />,
      path: `/dean/accreditation/roster-of-members`,
      description: "Complete list of organization members",
    },
    {
      key: "plan",
      label: "Proposed Action Plan",
      shortLabel: "Action Plan",
      icon: <FolderOpen className="w-4 h-4" />,
      path: `/dean/accreditation/proposed-action-plan`,
      description: "Strategic plans and proposals",
    },
    {
      key: "documents",
      label: "Accreditation Documents",
      shortLabel: "Documents",
      icon: <FileArchive className="w-4 h-4" />,
      path: `/dean/accreditation/document`,
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
      setAccreditationStatus(res.data);

      if (res.data.isEverythingApproved) {
        setShowApprovalPopup(true);
      }
    } catch (error) {
      console.error("Failed to fetch accreditation data", error);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [location, selectedOrg]);

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
      <div className="bg-white border-b border-gray-500">
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
                  {navigationItems.map((item, index) => (
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
