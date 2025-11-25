/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { API_ROUTER } from "../../../config/api.js";
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
  ChevronRight,
  Check,
  FileArchive,
  PenBox,
  Users2,
  BarChart,
  BarChart3,
  FileBarChart,
  CheckCircle,
  Settings,
  File,
  Building,
} from "lucide-react";
import { LogoutButton } from "../../../components/components";

export function SduMainNavigation() {
  const [activeKey, setActiveKey] = useState("home");
  const navigate = useNavigate();
  const location = useLocation();
  const [requirementsLoading, setRequirementsLoading] = useState(true);
  const [visibleRequirements, setVisibleRequirements] = useState(new Set());
  const [requirementsError, setRequirementsError] = useState(null);

  useEffect(() => {
    const path = location.pathname;
    if (path === "/SDU" || path === "/SDU/" || path === "/") {
      setActiveKey("home");
    } else if (
      path === "/SDU/accreditation" ||
      path === "/SDU/accreditation/"
    ) {
      setActiveKey("accreditations");
    } else if (path.includes("/accreditation/president-information")) {
      setActiveKey("accreditation-president");
    } else if (path.includes("/accreditation/financial-report")) {
      setActiveKey("accreditation-financial");
    } else if (path.includes("/accreditation/roster-of-members")) {
      setActiveKey("accreditation-roster");
    } else if (path.includes("/accreditation/proposed-action-plan")) {
      setActiveKey("accreditation-plan");
    } else if (path.includes("/accreditation/document")) {
      setActiveKey("accreditation-documents");
    } else if (path.includes("/accomplishment")) {
      setActiveKey("accomplishments");
    } else if (path === "/SDU/proposal" || path === "/SDU/proposal/") {
      setActiveKey("proposals");
    } else if (path.includes("/proposal/reports")) {
      setActiveKey("proposal-reports");
    } else if (path.includes("/proposal/approval")) {
      setActiveKey("proposal-approval");
    } else if (path.includes("/proposal")) {
      setActiveKey("proposals");
    } else if (path.includes("/post")) {
      setActiveKey("post");
    } else if (path.includes("/log")) {
      setActiveKey("logs");
    } else if (path.includes("/rooms")) {
      setActiveKey("rooms");
    }
  }, [location.pathname]);

  // Fetch enabled accreditation requirements to drive dynamic menu filtering
  useEffect(() => {
    let canceled = false;
    async function loadVisibleRequirements() {
      try {
        setRequirementsLoading(true);
        setRequirementsError(null);
        const res = await axios.get(`${API_ROUTER}/accreditation/requirements/visible`, { withCredentials: true });
        if (canceled) return;
        const keys = new Set((res.data || []).map(r => r.key));
        setVisibleRequirements(keys);
      } catch (err) {
        if (!canceled) setRequirementsError(err.response?.data?.message || err.message);
      } finally {
        if (!canceled) setRequirementsLoading(false);
      }
    }
    loadVisibleRequirements();
    const interval = setInterval(loadVisibleRequirements, 60_000); // refresh every minute
    return () => {
      canceled = true;
      clearInterval(interval);
    };
  }, []);

  const navigationItems = [
    {
      key: "organizations",
      icon: <Users className="w-5 h-5" />,
      label: "Organizations",
      path: "/SDU/organization",
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
    // {
    //   key: "reports",
    //   icon: <BarChart3 className="w-5 h-5" />,
    //   label: "Reports",
    //   path: "/SDU/report",
    // },
    {
      key: "users",
      icon: <User className="w-5 h-5" />,
      label: "User management",
      path: "/SDU/user-management",
    },
    {
      key: "reports",
      icon: <File className="w-5 h-5" />,
      label: "Reports",
      path: "/SDU/reports",
    },
    {
      key: "rooms",
      icon: <Building className="w-5 h-5" />,
      label: "Rooms / Locations",
      path: "/SDU/rooms",
    },
    {
      key: "post",
      icon: <PenBox className="w-5 h-5" />,
      label: "Posts & Announcements",
      path: "/SDU/post",
    },
    {
      key: "logs",
      icon: <ClipboardList className="w-5 h-5" />,
      label: "Activity Logs",
      path: "/SDU/logs",
    },
  ];

  const subProposalItems = [
    // {
    //   key: "proposal-reports",
    //   icon: <FileBarChart className="w-4 h-4" />,
    //   label: "Proposal Reports",
    //   path: "/SDU/proposal/reports",
    // },
    {
      key: "proposal-approval",
      icon: <CheckCircle className="w-4 h-4" />,
      label: "System-wide Approval",
      path: "/SDU/proposal/system-wide",
    },
  ];

  // Map nav items to requirement keys; items without mapping always shown
  const subAccreditationItemsAll = [
    {
      key: "accreditation-president",
      label: "Organizations President's Information",
      icon: <FileText className="w-4 h-4" />,
      path: `/SDU/accreditation/president-information`,
    },
    {
      key: "accreditation-financial",
      label: "Financial Report",
      icon: <ClipboardList className="w-4 h-4" />,
      path: `/SDU/accreditation/financial-report`,
    },
    {
      key: "accreditation-roster",
      label: "Members Roster",
      icon: <Users className="w-4 h-4" />,
      path: `/SDU/accreditation/roster-of-members`,
    },
    {
      key: "accreditation-plan",
      label: "Action Plan",
      icon: <FolderOpen className="w-4 h-4" />,
      path: `/SDU/accreditation/proposed-action-plan`,
    },
    {
      key: "accreditation-documents",
      label: "Accreditation Documents",
      icon: <FileArchive className="w-4 h-4" />,
      path: `/SDU/accreditation/document`,
    },
    {
      key: "settings",
      label: "Accreditation Settings",
      icon: <Settings className="w-4 h-4" />,
      path: `/SDU/accreditation/settings`,
    },
    {
      key: "accreditation-requirements",
      label: "Requirements Management",
      icon: <File className="w-4 h-4" />,
      path: `/SDU/accreditation/requirements`,
    },
  ];

  const requirementKeyMap = {
    "accreditation-president": "president-info",
    "accreditation-financial": "financial-report",
    "accreditation-roster": "roster",
    "accreditation-plan": "action-plan",
    "accreditation-documents": "accreditation-documents",
    // settings & requirements manager always shown
  };

  // Build dynamic custom requirement submenu items (enabled custom requirements not mapped above)
  const dynamicCustomItems = [];
  if (!requirementsLoading && visibleRequirements.size > 0) {
    // We need raw list of visible requirements with types; refetch lightweight if necessary
    // We'll store the response objects in state instead of only keys; using an effect below.
  }

  // We actually need requirement meta (title/type). We'll keep a separate state.
  const [visibleRequirementMeta, setVisibleRequirementMeta] = useState([]);
  useEffect(() => {
    // Separate meta fetch (already have keys but need titles for dynamic custom items)
    let cancel = false;
    async function loadMeta() {
      try {
        const res = await axios.get(`${API_ROUTER}/accreditation/requirements/visible`, { withCredentials: true });
        if (cancel) return;
        setVisibleRequirementMeta(res.data || []);
      } catch (_) {
        // ignore
      }
    }
    loadMeta();
  }, []);

  const customMeta = visibleRequirementMeta.filter(r => r.type === 'custom');
  customMeta.forEach(r => {
    // Create navigation entry if not already mapped
    dynamicCustomItems.push({
      key: `custom-${r.key}`,
      label: r.title,
      icon: <FileText className="w-4 h-4" />, // generic file icon
      path: `/SDU/accreditation/req/${r.key}`,
      __customRequirementKey: r.key,
    });
  });

  // Filter base (template) items by visibility, then inject custom items BEFORE 'settings'
  const filteredBaseItems = subAccreditationItemsAll.filter(item => {
    const reqKey = requirementKeyMap[item.key];
    if (!reqKey) return true; // settings & requirements manager always shown
    return visibleRequirements.has(reqKey);
  });
  const subAccreditationItems = [];
  filteredBaseItems.forEach(item => {
    if (item.key === 'settings') {
      // Insert all dynamic custom requirement tabs before the settings item
      subAccreditationItems.push(...dynamicCustomItems);
    }
    subAccreditationItems.push(item);
  });

  // Check if any sub-proposal item is active
  const isAnySubProposalActive = subProposalItems.some(
    (item) => activeKey === item.key
  );
  const shouldShowSubProposals =
    activeKey === "proposals" || isAnySubProposalActive;

  const isAnySubAccreditationActive = subAccreditationItems.some(
    (item) => activeKey === item.key
  );

  const shouldShowSubAccreditations =
    activeKey === "accreditations" || isAnySubAccreditationActive;

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Top header with welcome text */}
      <div className="h-16 bg-cnsc-secondary-color flex items-center justify-center shadow-md transition-all duration-300">
        <h1 className="text-white text-xl font-bold tracking-wide transform transition-transform duration-300 hover:scale-105">
          Welcome SDU Admin
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col flex-grow overflow-auto">
        {navigationItems.map((item) => (
          <div key={item.key} className="relative">
            <button
              onClick={() => {
                setActiveKey(item.key);
                navigate(item.path);
              }}
              className={`flex items-center py-4 px-6 gap-4 text-base font-medium transition-all duration-500 ease-out w-full relative group ${
                activeKey === item.key ||
                (item.key === "proposals" && isAnySubProposalActive)
                  ? "bg-white text-cnsc-primary-color shadow-lg transform "
                  : "text-white hover:bg-amber-500/90 hover:shadow-md hover:transform hover:translate-x-2"
              }`}
            >
              <span
                className={` w-5 h-5 flex items-center transition-all duration-300 group-hover:scale-110 ${
                  activeKey === item.key ? "transform scale-110" : ""
                }`}
              >
                {item.icon}
              </span>
              <span className="tracking-wide transition-all duration-300">
                {item.label}
              </span>

              {/* Chevron icons for dropdowns with smooth rotation */}
              {item.key === "accreditations" && (
                <span className="ml-auto transition-transform duration-700 ease-out">
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-700 ${
                      shouldShowSubAccreditations ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </span>
              )}

              {item.key === "proposals" && (
                <span className="ml-auto transition-transform duration-700 ease-out">
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-700 ${
                      shouldShowSubProposals ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </span>
              )}
            </button>

            {/* Sub-navigation with smooth slide animation */}
            <div
              className={`overflow-hidden transition-all  duration-700 ease-out ${
                item.key === "accreditations" && shouldShowSubAccreditations
                  ? "max-h-96 h-autoopacity-100"
                  : item.key === "accreditations"
                  ? "max-h-0 opacity-0"
                  : ""
              }`}
            >
              {item.key === "accreditations" && (
                <div className="border-l-4 border-amber-500 ml-4">
                  {requirementsError && (
                    <div className="text-xs text-red-600 px-4 py-2">Failed to load requirements: {requirementsError}</div>
                  )}
                  {requirementsLoading && (
                    <div className="text-xs text-gray-500 px-4 py-2">Loading requirements...</div>
                  )}
                  {subAccreditationItems.map((subItem) => (
                    <button
                      key={subItem.key}
                      onClick={() => {
                        setActiveKey(subItem.key);
                        navigate(subItem.path);
                      }}
                      className={`flex items-center py-3 px-6  text-sm font-medium w-full relative group duration-500 transition-all  ease-out ${
                        activeKey === subItem.key
                          ? "bg-amber-500/80 text-white "
                          : "text-white  hover:bg-white hover:text-cnsc-primary-color"
                      }`}
                    >
                      <span
                        className={`mr-3 w-4 h-4 transition-all duration-300 group-hover:scale-110 ${
                          activeKey === subItem.key ? "scale-110" : ""
                        }`}
                      >
                        {subItem.icon}
                      </span>
                      <span className="tracking-wide">{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div
              className={`overflow-hidden transition-all duration-700 ease-out ${
                item.key === "proposals" && shouldShowSubProposals
                  ? "max-h-96 opacity-100"
                  : item.key === "proposals"
                  ? "max-h-0 opacity-0"
                  : ""
              }`}
            >
              {item.key === "proposals" && (
                <div className="border-l-4 border-amber-500 ml-4">
                  {subProposalItems.map((subItem) => (
                    <button
                      key={subItem.key}
                      onClick={() => {
                        setActiveKey(subItem.key);
                        navigate(subItem.path);
                      }}
                      className={`flex items-center py-3 px-6  text-sm font-medium w-full relative group duration-500 transition-all  ease-out ${
                        activeKey === subItem.key
                          ? "bg-amber-500/80 text-white "
                          : "text-white  hover:bg-white hover:text-cnsc-primary-color"
                      }`}
                    >
                      <span
                        className={`mr-3 w-4 h-4 transition-all duration-300 group-hover:scale-110 ${
                          activeKey === subItem.key ? "scale-110" : ""
                        }`}
                      >
                        {subItem.icon}
                      </span>
                      <span className="tracking-wide">{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout at bottom */}
      <div className="p-4 bg-cnsc-secondary-color transition-all duration-300">
        <LogoutButton />
      </div>
    </div>
  );
}
