import { useOutletContext, useLocation } from "react-router-dom";
import { SduMainNavigation } from "./sdu-main-navigation";
import { SduMainComponents } from "./sdu-route-components";

export function SduMainPage() {
  const { user } = useOutletContext();

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0">
        <SduMainNavigation />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Topbar */}
        <SduTopbar />
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#F5F5F9' }}>
          <SduMainComponents user={user} />
        </div>
      </main>
    </div>
  );
}

function SduTopbar() {
  const location = useLocation();
  
  // Map routes to page info
  const getPageInfo = () => {
    const path = location.pathname;
    
    if (path === "/SDU" || path === "/SDU/") {
      return { title: "Dashboard", description: "Overview of organizations and activities" };
    } else if (path.includes("/accreditation/president-information")) {
      return { title: "President Information", description: "Manage president profiles" };
    } else if (path.includes("/accreditation/financial-report")) {
      return { title: "Financial Reports", description: "Review financial documentation" };
    } else if (path.includes("/accreditation/roster-of-members")) {
      return { title: "Members Roster", description: "Manage organization members" };
    } else if (path.includes("/accreditation/proposed-action-plan")) {
      return { title: "Action Plan", description: "Review proposed action plans" };
    } else if (path.includes("/accreditation/document")) {
      return { title: "Accreditation Documents", description: "Manage accreditation documents" };
    } else if (path.includes("/accreditation/settings")) {
      return { title: "Accreditation Settings", description: "Configure accreditation requirements" };
    } else if (path.includes("/accreditation/requirements")) {
      return { title: "Requirements Management", description: "Manage accreditation requirements" };
    } else if (path.includes("/accreditation")) {
      return { title: "Accreditation", description: "Monitor organization accreditation status" };
    } else if (path.includes("/accomplishment")) {
      return { title: "Accomplishments", description: "Review organizational accomplishments" };
    } else if (path.includes("/proposal/approval")) {
      return { title: "Proposal Approval", description: "Review and approve proposals" };
    } else if (path.includes("/proposal")) {
      return { title: "Proposals", description: "Manage activity proposals" };
    } else if (path.includes("/user-management")) {
      return { title: "User Management", description: "Manage system users and permissions" };
    } else if (path.includes("/reports")) {
      return { title: "Reports", description: "Generate and view system reports" };
    } else if (path.includes("/rooms")) {
      return { title: "Rooms / Locations", description: "Manage venue bookings and locations" };
    } else if (path.includes("/logs")) {
      return { title: "Activity Logs", description: "View system activity and audit logs" };
    }
    
    return { title: "SDU Administration", description: "Student Development Unit" };
  };

  const { title, description } = getPageInfo();

  return (
    <div className="h-18 border-b bg-background flex items-center px-6">
      {/* Left: Page Title & Description */}
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
