import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
// Corrected import path for API constants (previous path ../../../App was invalid)
import { API_ROUTER } from "../../../../config/api.js";

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
    { to: "PPA", label: "Proposed Action Plan", key: "action-plan" },
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
      {/* Navigation */}
      <nav
        className="flex gap-4 px-6 py-4 bg-white overflow-x-auto flex-nowrap nav-scroll"
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
              `text-lg font-semibold px-4 pt-2 whitespace-nowrap ${isActive ? 'border-b-2 border-cnsc-primary-color text-cnsc-primary-color' : 'text-gray-600 hover:text-cnsc-primary-color'}`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <div className="h-full overflow-y-auto flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
