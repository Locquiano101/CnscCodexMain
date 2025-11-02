import { NavLink, Routes, Route, Outlet } from "react-router-dom";

export function AdviserAccreditationNavigationPage() {
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
