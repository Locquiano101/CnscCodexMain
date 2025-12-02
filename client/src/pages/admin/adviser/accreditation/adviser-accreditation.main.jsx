import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_ROUTER } from "../../../../config/api.js";
import { cn } from "@/lib/utils";

export function AdviserAccreditationNavigationPage() {
  // Fetch visible requirements to augment tabs with custom ones
  const [visibleRequirements, setVisibleRequirements] = useState(null); // null = loading
  useEffect(() => {
    let ignore = false;
    async function fetchVisible() {
      try {
        const { data } = await axios.get(`${API_ROUTER}/accreditation/requirements/visible`, { withCredentials: true });
        if (!ignore) setVisibleRequirements(data || []);
      } catch (e) {
        if (!ignore) setVisibleRequirements([]);
        console.warn("AdviserAccreditationNavigationPage: failed to load visible requirements", e.message);
      }
    }
    fetchVisible();
    return () => { ignore = true; };
  }, []);

  const templateTabs = [
    { to: ".", label: "Overview", end: true, key: "overview" },
    { to: "financial-report", label: "Financial Report", key: "financial-report" },
    { to: "documents", label: "Accreditation Documents", key: "accreditation-documents" },
    { to: "roster-of-members", label: "Roster of Members", key: "roster" },
    { to: "president-information", label: "President's Information Sheet", key: "president-info" },
    { to: "ppa", label: "Proposed Action Plan", key: "action-plan" },
  ];

  // Determine which template tabs are enabled (optimistically show while loading)
  const enabledTemplateTabs = templateTabs.filter(tab => {
    if (visibleRequirements === null) return true; // optimistic
    if (visibleRequirements.length === 0) return true; // fallback show all if error
    return visibleRequirements.some(r => r.type === 'template' && r.key === tab.key);
  });

  // Add custom tabs (enabled custom requirements)
  const customTabs = (visibleRequirements || [])
    .filter(r => r.type === 'custom')
    .map(r => ({ to: `custom-${r.key}`, label: r.title, key: r.key }));

  const tabs = [...enabledTemplateTabs, ...customTabs];

  return (
    <div className="h-full flex flex-col">
      {/* Navigation Tabs */}
      <nav
        className="flex gap-1 px-6 py-3 bg-background border-b overflow-x-auto"
        role="tablist"
        aria-label="Accreditation Sections"
      >
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            role="tab"
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
      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
