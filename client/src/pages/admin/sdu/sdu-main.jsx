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

import { SduRosterOverview } from "./accreditation/roster/sdu-overall-roster";

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

function ProposalsOverview() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Proposals Overview</h2>
        <p className="text-gray-600">
          General statistics and trends for proposals
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            Proposal Submission Rates
          </h3>
          <div className="h-48 bg-white rounded border flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📋</div>
              <p>Submission trends</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            Approval Status Distribution
          </h3>
          <div className="h-48 bg-white rounded border flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">🥧</div>
              <p>Status pie chart</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccomplishmentsOverview() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Accomplishments Overview
        </h2>
        <p className="text-gray-600">
          General statistics and trends for accomplishments
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            Accomplishment Categories
          </h3>
          <div className="h-48 bg-white rounded border flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">🏅</div>
              <p>Categories chart</p>
            </div>
          </div>
        </div>
        <div className="bg-cyan-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Achievement Timeline</h3>
          <div className="h-48 bg-white rounded border flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📅</div>
              <p>Timeline chart</p>
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
// Component: OrganizationAccreditationHistory
function OrganizationAccreditationHistory({ selectedOrg }) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-1">
        {selectedOrg?.orgName || "Organization Name"}
      </h1>
      <p className="text-gray-600 mb-6">Organization Dashboard</p>

      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Organization Details
        </h3>
        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Adviser:</strong> {selectedOrg?.adviserName || "N/A"}
          </p>
          <p>
            <strong>Email:</strong>{" "}
            {selectedOrg?.adviserEmail ? (
              <a
                href={`mailto:${selectedOrg.adviserEmail}`}
                className="text-blue-600 hover:underline"
              >
                {selectedOrg.adviserEmail}
              </a>
            ) : (
              "N/A"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function OrganizationProposals({ selectedOrg }) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Proposals - {selectedOrg.orgName}
      </h1>
      <p className="text-gray-600 mb-6">
        Manage and view proposals for {selectedOrg.orgName}
      </p>
      <div className="bg-purple-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Proposal Management</h3>
        <p>
          Proposal content and management tools for {selectedOrg.orgName} will
          be displayed here.
        </p>
      </div>
    </div>
  );
}

function OrganizationAccomplishments({ selectedOrg }) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Accomplishments - {selectedOrg.orgName}
      </h1>
      <p className="text-gray-600 mb-6">
        Track and manage accomplishments for {selectedOrg.orgName}
      </p>
      <div className="bg-emerald-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Achievement Management</h3>
        <p>
          Accomplishment tracking for {selectedOrg.orgName} will be displayed
          here.
        </p>
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

export const departments = {
  "College of Arts and Sciences": [
    "Bachelor of Science in Biology",
    "Bachelor of Science in Applied Mathematics",
    "Bachelor of Science in Development Communication",
    "Bachelor of Arts in English Language Studies",
    "Bachelor of Arts in Sociology",
  ],
  "College of Computing and Multimedia Studies": [
    "Bachelor of Science in Information Technology",
    "Bachelor of Science in Information Systems",
  ],
  "College of Business and Public Administration": [
    "Bachelor of Science in Business Administration – Business Economics",
    "Bachelor of Science in Business Administration – Financial Management",
    "Bachelor of Science in Business Administration – Marketing Management",
    "Bachelor of Science in Business Administration – Human Resource Management",
    "Bachelor of Science in Accountancy",
    "Bachelor of Science in Hospitality Management",
    "Bachelor of Science in Office Administration",
    "Bachelor of Science in Entrepreneurship",
    "Bachelor in Public Administration",
  ],
  "College of Engineering": [
    "Bachelor of Science in Civil Engineering",
    "Bachelor of Science in Electrical Engineering",
    "Bachelor of Science in Mechanical Engineering",
  ],
  "College of Education": [
    "Bachelor of Elementary Education",
    "Bachelor of Secondary Education – Major in English",
    "Bachelor of Secondary Education – Major in Filipino",
    "Bachelor of Secondary Education – Major in Mathematics",
    "Bachelor of Secondary Education – Major in Social Studies",
    "Bachelor of Secondary Education – Major in Sciences",
    "Bachelor of Technology and Livelihood Education – Home Economics",
    "Bachelor of Physical Education",
  ],
  "College of Trades and Technology": [
    "Bachelor of Technical-Vocational Teacher Education – Garments Fashion and Design",
    "Bachelor of Technical-Vocational Teacher Education – Food Service and Management",
    "Bachelor of Technical-Vocational Teacher Education – Automotive Technology",
    "Bachelor of Technical-Vocational Teacher Education – Electrical Technology",
    "Bachelor of Science in Industrial Technology – Automotive Technology",
    "Bachelor of Science in Industrial Technology – Electrical Technology",
    "Bachelor of Science in Industrial Technology – Computer Technology",
    "Bachelor of Science in Industrial Technology – Electronics Technology",
  ],
  "College of Agriculture and Natural Resources": [
    "Bachelor of Science in Agriculture – Crop Science",
    "Bachelor of Science in Agriculture – Animal Science",
    "Bachelor of Science in Environmental Science",
    "Bachelor in Agricultural Technology",
    "Bachelor of Science in Agricultural and Biosystems Engineering",
  ],
  "Institute of Fisheries and Marine Sciences": [
    "Bachelor of Science in Fisheries",
  ],
  "Alternative Track": [
    "Bachelor of Science in Entrepreneurship (Agricultural Production Track)",
  ],
};

export const specializations = [
  "Academic",
  "Lifestyle",
  "Fraternity/Sorority",
  "Environmental",
  "Social-Civic",
  "Spiritual or religious",
  "Student government",
  "Adviser Academic Rank",
];

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
