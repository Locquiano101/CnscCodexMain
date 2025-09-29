import axios from "axios";
import {
  Home,
  FolderOpen,
  File,
  FileText,
  PenSquare,
  BookMarked,
  LogOut,
  X,
  Search,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { API_ROUTER, DOCU_API_ROUTER } from "./../../../App";
import { SduAccreditationSettings } from "./accreditation/sdu-accreditation-settings";
import { SduAccreditationNavigation } from "./accreditation/sdu-accreditation-overview";
import { LogoutButton } from "../../../components/components";
import { SduRosterOverview } from "./accreditation/roster/sdu-overall-roster";
import {
  departments,
  specializations,
} from "../../../components/department_arrays";

import {
  SduAccreditationDocumentOrganization,
  SduAccreditationDocumentOverview,
} from "./accreditation/sdu-accreditation-documents";

import { SduUserManagement } from "./user-management/sdu-user-management";
import { SduIndividualOrganizationPresident } from "./accreditation/president/sdu-individual-president";
import { SduOverallPresident } from "./accreditation/president/sdu-overall-president";
import { SduIndividualOrganizationProfile } from "./accreditation/organization-profile/sdu-individual-organization-profile";
import { SduOverallOrganizationProfile } from "./accreditation/organization-profile/sdu-overall-organization-profile";
import { SduIndividualOrganizationRoster } from "./accreditation/roster/sdu-individual-roster";
import { SduFinancialReport } from "./accreditation/financial-report/individual-financial-report";
import SduOverallFinancialReport from "./accreditation/financial-report/overall-financial-report";
import { SduOverallProposedActioPlan } from "./accreditation/proposed-action-plan/overall-proposed-action-plan";
import { SduProposedActionPlanOrganization } from "./accreditation/proposed-action-plan/individual-proposed-action-plan";
import { SduAccomplishmentMain } from "./accomplishment/sdu-accomplishment-main";
import { SduAccomplishmentOrganization } from "./accomplishment/sdu-individual-accomplishment";
import { SduSystemWideProposal } from "./proposal/sdu-overall-proposal";
import { SduIndividualProposalConduct } from "./proposal/sdu-individual-proposal";

// ✅ Main Layout Wrapper
export default function StudentDevMainLayout() {
  const [selectedOrg, setSelectedOrg] = useState(null);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="min-w-64 bg-cnsc-primary-color flex flex-col">
        <StudentDevMainNavigation />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <StudentDevUnitComponent
          selectedOrg={selectedOrg}
          onSelectOrg={setSelectedOrg}
        />
      </main>
    </div>
  );
}

function StudentDevMainNavigation() {
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
      label: "Reports/Dashboard",
      path: "/SDU",
    },
    {
      key: "accreditations",
      icon: <FolderOpen className="w-5 h-5" />,
      label: "Accreditations",
      path: "/SDU/accreditation",
    },
    {
      key: "users",
      icon: <User className="w-5 h-5" />,
      label: "User management",
      path: "/SDU/user-management",
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
      key: "post",
      icon: <PenSquare className="w-5 h-5" />,
      label: "Posts",
      path: "/SDU/post",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top header with welcome text */}
      <div className="h-28 bg-cnsc-secondary-color flex flex-col items-center justify-center shadow-md">
        <h1 className="text-white text-xl font-bold tracking-wide">
          Welcome SDU Admin
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

function StudentDevUnitComponent({ selectedOrg, onSelectOrg }) {
  const renderRoute = (orgComponent, overviewComponent) =>
    selectedOrg ? orgComponent : overviewComponent;

  return (
    <div className="h-full w-full ">
      <Routes>
        {/* Dashboard/Home */}
        <Route
          path="/"
          element={renderRoute(
            <OrganizationDashboard selectedOrg={selectedOrg} />,
            <DashboardOverview />
          )}
        />

        {/* Proposals */}
        <Route
          path="/proposal"
          element={renderRoute(
            <SduIndividualProposalConduct orgData={selectedOrg} />,
            <SduSystemWideProposal onSelectOrg={onSelectOrg} />
          )}
        />

        {/* Accreditation */}
        <Route
          path="/accreditation"
          element={
            <SduAccreditationNavigation
              selectedOrg={selectedOrg}
              onSelectOrg={onSelectOrg}
            />
          }
        >
          <Route
            index
            element={renderRoute(
              <SduIndividualOrganizationProfile selectedOrg={selectedOrg} />,
              <SduOverallOrganizationProfile
                selectedOrg={selectedOrg}
                onSelectOrg={onSelectOrg}
              />
            )}
          />
          <Route
            path="financial-report"
            element={renderRoute(
              <SduFinancialReport selectedOrg={selectedOrg} />,
              <SduOverallFinancialReport onSelectOrg={onSelectOrg} />
            )}
          />
          <Route
            path="roster-of-members"
            element={renderRoute(
              <SduIndividualOrganizationRoster selectedOrg={selectedOrg} />,
              <SduRosterOverview onSelectOrg={onSelectOrg} />
            )}
          />
          <Route
            path="document"
            element={renderRoute(
              <SduAccreditationDocumentOrganization
                selectedOrg={selectedOrg}
              />,
              <SduAccreditationDocumentOverview />
            )}
          />
          <Route
            path="proposed-action-plan"
            element={renderRoute(
              <SduProposedActionPlanOrganization selectedOrg={selectedOrg} />,
              <SduOverallProposedActioPlan
                selectedOrg={selectedOrg}
                onSelectOrg={onSelectOrg}
              />
            )}
          />
          <Route
            path="president-information"
            element={renderRoute(
              <SduIndividualOrganizationPresident selectedOrg={selectedOrg} />,
              <SduOverallPresident onSelectOrg={onSelectOrg} />
            )}
          />
          <Route path="settings" element={<SduAccreditationSettings />} />
        </Route>

        {/* Accomplishments */}
        <Route
          path="/accomplishment"
          element={renderRoute(
            <SduAccomplishmentOrganization selectedOrg={selectedOrg} />,
            <SduAccomplishmentMain onSelectOrg={onSelectOrg} />
          )}
        />

        {/* Posts */}
        <Route
          path="/post"
          element={renderRoute(
            <OrganizationPosts selectedOrg={selectedOrg} />,
            <PostsOverview />
          )}
        />

        {/* User Management */}
        <Route path="/user-management" element={<SduUserManagement />} />
      </Routes>
    </div>
  );
}
// Dashboard Overview Components
function DashboardOverview() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <p className="text-gray-600">General statistics and trends</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            Organization Registration Trends
          </h3>
          <div className="h-48 bg-white rounded border flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p>Registration trends chart</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Active Organizations</h3>
          <div className="h-48 bg-white rounded border flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📈</div>
              <p>Active organizations chart</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostsOverview() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Posts Overview</h2>
        <p className="text-gray-600">General statistics and trends for posts</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-violet-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            Post Engagement Metrics
          </h3>
          <div className="h-48 bg-white rounded border flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">💬</div>
              <p>Engagement chart</p>
            </div>
          </div>
        </div>
        <div className="bg-rose-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Publishing Frequency</h3>
          <div className="h-48 bg-white rounded border flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📝</div>
              <p>Frequency chart</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Organization-specific Components
function OrganizationDashboard({ selectedOrg }) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {selectedOrg.orgName}
      </h1>
      <p className="text-gray-600 mb-6">Organization Dashboard</p>
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Organization Details</h3>
        <div className="space-y-2">
          <p>
            <strong className="text-gray-700">Adviser:</strong>{" "}
            {selectedOrg.adviserName}
          </p>
          <p>
            <strong className="text-gray-700">Email:</strong>{" "}
            <a
              href={`mailto:${selectedOrg.adviserEmail}`}
              className="text-blue-600 hover:underline"
            >
              {selectedOrg.adviserEmail}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function OrganizationPosts({ selectedOrg }) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Posts - {selectedOrg.orgName}
      </h1>
      <p className="text-gray-600 mb-6">
        Manage posts and announcements for {selectedOrg.orgName}
      </p>
      <div className="bg-violet-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Post Management</h3>
        <p>
          Post creation and management for {selectedOrg.orgName} will be
          displayed here.
        </p>
      </div>
    </div>
  );
}

export function StudentDevOrganizationProfileCard({
  selectedOrg,
  onSelectOrg,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [searchScope, setSearchScope] = useState("");

  // Function to fetch data
  const fetchData = async () => {
    try {
      if (searchTerm.trim() !== "") {
        setSearching(true);
      } else {
        setLoading(true);
      }
      const res = await axios.get(
        `${API_ROUTER}/getAllOrganizationProfile?search=${encodeURIComponent(
          searchTerm
        )}&department=${encodeURIComponent(
          selectedDepartment
        )}&program=${encodeURIComponent(
          selectedProgram
        )}&specialization=${encodeURIComponent(
          selectedSpecialization
        )}&scope=${encodeURIComponent(searchScope)}`
      );
      setOrgs(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setOrgs([]);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  // Effect for search term with debounce
  useEffect(() => {
    if (timeoutId) clearTimeout(timeoutId);

    const delay = setTimeout(() => {
      fetchData();
    }, 300);

    setTimeoutId(delay);

    return () => {
      if (delay) clearTimeout(delay);
    };
  }, [searchTerm]);

  // Effect for immediate search on dropdown changes and scope changes
  useEffect(() => {
    fetchData();
  }, [
    selectedDepartment,
    selectedProgram,
    selectedSpecialization,
    searchScope,
  ]);

  // Reset filters when scope changes
  useEffect(() => {
    setSelectedDepartment("");
    setSelectedProgram("");
    setSelectedSpecialization("");
  }, [searchScope]);

  return (
    <div className=" border-l border-gray-700 w-full h-full">
      <h1 className="text-center pt-4 text-2xl text-black font-bold">
        CNSC Organizations
      </h1>
      <div className="flex h-full overflow-auto flex-1  flex-col p-4 w-full gap-4">
        {/* Radio buttons for search scope */}
        <div className="flex justify-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="searchScope"
              value="local"
              checked={searchScope === "local"}
              onChange={(e) => setSearchScope(e.target.value)}
              className="w-4 h-4 text-amber-500 border-amber-400 focus:ring-amber-500"
            />
            <span className="text-gray-700 font-medium">Local</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="searchScope"
              value="systemwide"
              checked={searchScope === "systemwide"}
              onChange={(e) => setSearchScope(e.target.value)}
              className="w-4 h-4 text-amber-500 border-amber-400 focus:ring-amber-500"
            />
            <span className="text-gray-700 font-medium">System Wide</span>
          </label>
        </div>

        {/* Conditional dropdowns based on search scope */}
        {searchScope === "local" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department Dropdown */}
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setSelectedProgram(""); // reset program on department change
              }}
              className="border-2 border-amber-400 rounded-lg px-4 py-2 w-full focus:outline-none"
            >
              <option value="">Select Department</option>
              {Object.keys(departments).map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Program Dropdown */}
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              disabled={!selectedDepartment}
              className="border-2 border-amber-400 rounded-lg px-4 py-2 w-full focus:outline-none"
            >
              <option value="">Select Program</option>
              {selectedDepartment &&
                departments[selectedDepartment].map((prog) => (
                  <option key={prog} value={prog}>
                    {prog}
                  </option>
                ))}
            </select>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {/* Specialization Dropdown for System Wide */}
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="border-2 border-amber-400 rounded-lg px-4 py-2 w-full focus:outline-none"
            >
              <option value="">Select Specialization</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="relative ">
          <input
            type="text"
            placeholder="Search organization..."
            className="w-full px-4 py-3 pr-10 border-2 border-amber-400 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            size={20}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-500"
          />
        </div>

        {/* Scrollable Organization List */}
        <div className="flex flex-col gap-2  overflow-auto">
          {loading || searching ? (
            <div className="flex items-center justify-center">
              <div className="text-gray-500 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-2"></div>
                <p>{searching ? "Searching..." : "Loading..."}</p>
              </div>
            </div>
          ) : orgs.length > 0 ? (
            orgs.map((org) => (
              <div
                key={org._id}
                onClick={() =>
                  selectedOrg?._id === org._id
                    ? onSelectOrg(null)
                    : onSelectOrg(org)
                }
                className={`flex gap-4 items-center  rounded-lg p-4 border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedOrg?._id === org._id
                    ? " border-cnsc-primary-color border-4 bg-amber-300 "
                    : " hover:border-gray-300"
                }`}
              >
                <img
                  src={`${DOCU_API_ROUTER}/${org._id}/${org.orgLogo}`}
                  alt="Organization Logo"
                  className="w-12 h-12 object-cover rounded-full"
                />
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                  {org.orgName}
                </h3>
                <div className="text-sm text-gray-600"></div>
              </div>
            ))
          ) : (
            <div className="text-center p-8 text-gray-500">
              <Search size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No organizations found</p>
              {searchTerm && (
                <p className="text-sm mt-1">Try adjusting your search terms</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
