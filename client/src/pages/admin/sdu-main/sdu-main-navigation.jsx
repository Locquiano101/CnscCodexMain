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
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import cnscLogo from "../../../assets/cnsc-codex-2.svg";

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
      key: "logs",
      icon: <ClipboardList className="w-5 h-5" />,
      label: "Activity Logs",
      path: "/SDU/logs",
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

  const isAnySubAccreditationActive = subAccreditationItems.some(
    (item) => activeKey === item.key
  );

  const shouldShowSubAccreditations =
    activeKey === "accreditations" || isAnySubAccreditationActive;

  return (
    <div className="flex flex-col h-screen w-full bg-background border-r">
      {/* Logo and Brand Header */}
      <div className="h-18 border-b flex items-center px-6 gap-3">
        <img src={cnscLogo} alt="CNSC Codex" className="w-10 h-10" />
        <div className="flex flex-col">
          <h1 className="font-bold text-lg leading-tight">CNSC Codex</h1>
          <p className="text-xs text-muted-foreground">SDU Administration</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col flex-grow overflow-auto px-3 py-4">
        {navigationItems.map((item) => (
          <div key={item.key} className="relative mb-1">
            <button
              onClick={() => {
                setActiveKey(item.key);
                navigate(item.path);
              }}
              className={cn(
                "w-full justify-start gap-3 h-11 px-3 text-sm font-medium transition-all rounded-lg cursor-pointer flex items-center",
                activeKey === item.key ||
                (item.key === "accreditations" && isAnySubAccreditationActive)
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </span>
              <span className="flex-1 text-left truncate">{item.label}</span>

              {/* Chevron icons for dropdowns */}
              {item.key === "accreditations" && (
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-200 flex-shrink-0",
                    shouldShowSubAccreditations ? "rotate-0" : "-rotate-90"
                  )}
                />
              )}
            </button>

            {/* Accreditation submenu */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                item.key === "accreditations" && shouldShowSubAccreditations
                  ? "max-h-[600px] opacity-100 mb-2"
                  : item.key === "accreditations"
                  ? "max-h-0 opacity-0"
                  : ""
              )}
            >
              {item.key === "accreditations" && (
                <div className="space-y-1 pt-2 pl-3">
                  {requirementsError && (
                    <Alert variant="destructive" className="text-xs py-2 mx-3">
                      <AlertDescription>Failed to load requirements</AlertDescription>
                    </Alert>
                  )}
                  {requirementsLoading && (
                    <div className="space-y-2 py-2 px-3">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-3/4" />
                    </div>
                  )}
                  {subAccreditationItems.map((subItem) => (
                    <button
                      key={subItem.key}
                      onClick={() => {
                        setActiveKey(subItem.key);
                        navigate(subItem.path);
                      }}
                      className={cn(
                        "w-full justify-start h-10 pl-11 pr-3 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center",
                        activeKey === subItem.key
                          ? "bg-primary/10 text-primary hover:bg-primary/15"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <span className="mr-2 w-4 h-4 flex items-center justify-center flex-shrink-0">
                        {subItem.icon}
                      </span>
                      <span className="truncate text-left flex-1">{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Proposals dropdown removed - now a regular navigation item */}
          </div>
        ))}
    </nav>

      {/* Bottom Section - Logout */}
      <div className="border-t p-3">
        <LogoutButton />
      </div>
    </div>
);

}
