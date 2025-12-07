import { useState, useEffect, useRef } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import axios from "axios";
import { API_ROUTER } from "../../../App";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  FolderOpen,
  FileText,
  PenSquare,
  Clock,
  BookMarked,
  ClipboardList,
  ChevronDown,
  LogOut,
  Users,
  Check,
  FileArchive,
  Send,
  Bell,
} from "lucide-react";
import { SduCoordinatorComponent } from "./sdu-coordinator-components";

export function SduCoordinatorPage() {
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
        <SduCoordinatorMainNavigation />
      </div>
      <div className="w-full h-full">
        <SduCoordinatorComponent
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

function SduCoordinatorMainNavigation() {
  const [activeKey, setActiveKey] = useState("home");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path === "/sdu-coordinator" || path === "/sdu-coordinator/") {
      setActiveKey("home");
    } else if (path.includes("/sdu-coordinator/accreditation")) {
      setActiveKey("accreditations");
    } else if (path.includes("/sdu-coordinator/accomplishment")) {
      setActiveKey("accomplishments");
    } else if (path.includes("/sdu-coordinator/proposal")) {
      setActiveKey("proposals");
    } else if (path.includes("/sdu-coordinator/post")) {
      setActiveKey("post");
    } else if (path.includes("/sdu-coordinator/log")) {
      setActiveKey("logs");
    }
  }, [location.pathname]);

  const navigationItems = [
    {
      key: "home",
      icon: <Home className="w-5 h-5" />,
      label: "Reports/Dashboard",
      path: "/sdu-coordinator",
    },
    {
      key: "accreditations",
      icon: <FolderOpen className="w-5 h-5" />,
      label: "Accreditations",
      path: "/sdu-coordinator/accreditation",
    },
    {
      key: "accomplishments",
      icon: <BookMarked className="w-5 h-5" />,
      label: "Accomplishments",
      path: "/sdu-coordinator/accomplishment",
    },
    {
      key: "proposals",
      icon: <FileText className="w-5 h-5" />,
      label: "Proposals",
      path: "/sdu-coordinator/proposal",
    },
    {
      key: "logs",
      icon: <Clock className="w-5 h-5" />,
      label: "Logs",
      path: "/sdu-coordinator/log",
    },
  ];

  return (
    <div className="w-full flex flex-col h-full">
      {/* Header */}
      <div className="h-24 bg-gradient-to-r from-cnsc-secondary-color to-amber-600 flex items-center px-8 shadow-lg">
        {/* Welcome Text */}
        <div className="ml-4">
          <h1 className="text-white text-2xl font-bold">Welcome!</h1>
          <p className="text-white/90 text-sm tracking-wide">SDU Coordinator</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col w-full transition-all duration-500 flex-1 p-2 gap-2 mt-2">
        {navigationItems.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setActiveKey(item.key);
              navigate(item.path);
            }}
            className={`flex items-center w-full py-4 px-6 gap-3 text-sm font-semibold tracking-wide transition-all duration-300 
          ${
            activeKey === item.key
              ? "bg-white text-cnsc-primary-color shadow-md rounded-xl"
              : "text-white hover:bg-amber-500/90 hover:pl-8 rounded-xl"
          }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <LogoutButton />
    </div>
  );
}

export function SduCoordinatorAccreditationNavigationSubRoute({ selectedOrg }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [accreditationStatus, setAccreditationStatus] = useState(null);
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const navigationItems = [
    {
      key: "overview",
      label: "Overview",
      shortLabel: "Overview",
      icon: <Home className="w-4 h-4" />,
      path: `/sdu-coordinator/accreditation/`,
    },
    {
      key: "president",
      label: "President's Information Sheet",
      shortLabel: "President's Info",
      icon: <FileText className="w-4 h-4" />,
      path: `/sdu-coordinator/accreditation/president-information`,
    },
    {
      key: "financial",
      label: "Financial Report",
      shortLabel: "Financial Report",
      icon: <ClipboardList className="w-4 h-4" />,
      path: `/sdu-coordinator/accreditation/financial-report`,
    },
    {
      key: "roster",
      label: "Roster of Members",
      shortLabel: "Members Roster",
      icon: <Users className="w-4 h-4" />,
      path: `/sdu-coordinator/accreditation/roster-of-members`,
    },
    {
      key: "plan",
      label: "Proposed Action Plan",
      shortLabel: "Action Plan",
      icon: <FolderOpen className="w-4 h-4" />,
      path: `/sdu-coordinator/accreditation/proposed-action-plan`,
    },
    {
      key: "documents",
      label: "Accreditation Documents",
      shortLabel: "Documents",
      icon: <FileArchive className="w-4 h-4" />,
      path: `/sdu-coordinator/accreditation/document`,
    },
  ];

  const activeItem =
    navigationItems.find((item) => location.pathname === item.path) ||
    navigationItems.find((item) => location.pathname.startsWith(item.path)) ||
    navigationItems[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-gray-50">
      {/* Dropdown Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-2">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all ${
                isDropdownOpen ? "shadow-md" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                {activeItem.icon}
                <span className="font-semibold">{activeItem.label}</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full bg-white border rounded-xl shadow-md mt-1 z-50">
                {navigationItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      navigate(item.path);
                      setIsDropdownOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-3 gap-3 text-left text-sm transition-colors rounded-xl
                      ${
                        activeItem.key === item.key
                          ? "bg-amber-100 text-cnsc-primary-color font-medium"
                          : "hover:bg-gray-100"
                      }`}
                  >
                    {item.icon}
                    {item.shortLabel}
                    {activeItem.key === item.key && (
                      <Check className="ml-auto w-4 h-4 text-cnsc-primary-color" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

function LogoutButton() {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogoutClick = () => setShowModal(true);
  const handleCancelLogout = () => setShowModal(false);

  const handleConfirmLogout = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await axios.post(`${API_ROUTER}/logout`, {}, { withCredentials: true });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={handleLogoutClick}
        className="flex gap-2 items-center justify-evenly text-xl text-cnsc-primary-color font-bold px-4 w-full bg-white border-t py-3 hover:text-cnsc-secondary-color transition-all cursor-pointer"
      >
        <LogOut size={16} />
        Logout
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Logout
              </h3>
              <button
                onClick={handleCancelLogout}
                className="text-gray-400 text-2xl hover:text-gray-600"
              >
                <X />
              </button>
            </div>
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
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={handleCancelLogout}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
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
