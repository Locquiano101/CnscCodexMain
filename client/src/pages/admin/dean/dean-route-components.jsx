import { Routes, Route, useNavigate } from "react-router-dom";
import { DOCU_API_ROUTER } from "../../../App";
import PlaceholderLogo from "../../../assets/cnsc-codex.svg";
import { DeanAccreditationNavigationSubRoute } from "./dean-main";
import { DeanAccreditationMain } from "./individual-accreditation/dean-accreditation-main";
import { DeanPresident } from "./individual-accreditation/dean-accreditation-president";
import { DeanRosterData } from "./individual-accreditation/dean-accreditation-roster";
import { DeanFinancialReport } from "./individual-accreditation/dean-accreditation-financial-report";
import { DeanProposedPlan } from "./individual-accreditation/dean-accreditation-proposed-plan";
import { DeanAccreditationDocument } from "./individual-accreditation/dean-accreditation-documents";
import { X, School2 } from "lucide-react";
import { DeanProposalConduct } from "./proposals/dean-proposal";
import { DeanAccomplishmentReport } from "./accomplishment/dean-accomplishment";
import { useState, useMemo } from "react";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

export function DeanComponent({
  selectedOrg,
  orgs,
  onSelectOrg,
  loading,
  user,
}) {
  const activeOrgs = orgs.filter((org) => org.isActive === true);
  const inactiveOrgs = orgs.filter((org) => org.isActive === false);
  // Helper to get status badge styling
  const getStatusBadge = (status) => {
    const statusStyles = {
      Approved: "bg-green-100 text-green-700 border-green-200",
      Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Revision From SDU": "bg-red-100 text-red-700 border-red-200",
      Rejected: "bg-red-100 text-red-700 border-red-200",
      "Approved by the Adviser": "bg-blue-100 text-blue-700 border-blue-200",
    };
    return statusStyles[status] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  const renderOrganizationCard = (org) => {
    const overallStatus = org.overAllStatus || org.overallStatus;

    return (
      <div
        key={org._id}
        onClick={() =>
          selectedOrg === org._id ? onSelectOrg(null) : onSelectOrg(org)
        }
        className={`shadow-lg rounded-2xl border cursor-pointer transition-all duration-200 `}
      >
        <div className="p-4 ">
          {/* Header with Logo and Basic Info */}
          <div className="flex  gap-4">
            <div className="flex-shrink-0">
              {org.orgLogo ? (
                <img
                  key={`${DOCU_API_ROUTER}/${org._id}/${org.orgLogo}`}
                  src={`${DOCU_API_ROUTER}/${org._id}/${org.orgLogo}`}
                  alt={`${org.orgName} Logo`}
                  className="w-16 h-16 object-cover rounded-full border-3 border-white shadow-md"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = PlaceholderLogo;
                  }}
                />
              ) : (
                <div className="w-16 h-16 bg-cnsc-primary-color flex justify-center items-center text-white rounded-full border shadow-md">
                  <School2 className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className=" min-w-0">
              <div className="flex items-start gap-12 justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-800 leading-tight">
                  {org.orgName || "Unnamed Organization"}
                </h2>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                    overallStatus
                  )}`}
                >
                  {overallStatus}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">{org.orgAcronym}</span>
                {" • "}
                <span className="capitalize">{org.orgClass} Organization</span>
              </p>
            </div>
          </div>

          {/* Academic Information */}
          <div className="my-3 mb-4">
            {org.orgClass === "System-wide" ? (
              org.orgSpecialization?.toLowerCase() === "student government" ? (
                <>
                  <p>
                    <span className="font-bold ">Specialization:</span>{" "}
                    <span className="text-gray-800">
                      {org.orgSpecialization}
                    </span>
                  </p>
                  <p>
                    <span className="font-bold">Department:</span>{" "}
                    <span className="text-gray-800">
                      {org.orgDepartment || "N/A"}
                    </span>
                  </p>
                </>
              ) : (
                <p>
                  <span className="font-bold">Specialization:</span>{" "}
                  <span className="text-gray-800">
                    {org.orgSpecialization || "N/A"}
                  </span>
                </p>
              )
            ) : (
              <>
                <p>
                  <span className="font-bold">Course:</span>{" "}
                  <span className="text-gray-800">
                    {org.orgCourse || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="font-bold">Department:</span>{" "}
                  <span className="text-gray-800">
                    {org.orgDepartment || "N/A"}
                  </span>
                </p>
              </>
            )}
            <p>
              <span className="font-bold">Adviser:</span>{" "}
              <span className="text-gray-800">
                {org.adviser?.name || "Not assigned"}
                {org.adviser?.email && ` (${org.adviser.email})`}
              </span>
            </p>
          </div>

          {/* Timestamps */}
          <div className="text-xs text-gray-500 space-y-1 border-t mt-4 pt-3">
            <div className="flex justify-between">
              <span>Created:</span>
              <span>
                {new Date(org.createdAt).toLocaleDateString()} at{" "}
                {new Date(org.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span>
                {new Date(org.updatedAt).toLocaleDateString()} at{" "}
                {new Date(org.updatedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper component for organization selection
  const OrganizationSelector = ({ title }) => (
    <div className="p-6 overflow-auto space-y-8">
      <h1 className="text-2xl font-bold mb-6">
        {title} - Select an organization
      </h1>
      <div className="w-full h-[10rem] border">

      </div>





      {orgs.length === 0 ? (
        <div className="text-center py-12">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 text-lg">Loading organizations...</p>
            </>
          ) : (
            <>
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No organizations found.</p>
            </>
          )}
        </div>
      ) : (
        <div>
          {/* Active Organizations Section */}
          {activeOrgs.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">
                  Active Organizations
                </h3>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                  {activeOrgs.length} organization
                  {activeOrgs.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {activeOrgs.map(renderOrganizationCard)}
              </div>
            </div>
          )}

          {/* Inactive Organizations Section */}
          {inactiveOrgs.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">
                  Inactive Organizations
                </h3>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium border border-gray-200">
                  {inactiveOrgs.length} organization
                  {inactiveOrgs.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {inactiveOrgs.map(renderOrganizationCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col flex-1 w-full bg-white h-full overflow-hidden">
      {/* Selected Organization Display */}
      {selectedOrg && (
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={`${DOCU_API_ROUTER}/${selectedOrg._id}/${selectedOrg.orgLogo}`}
              alt="Selected Organization"
              className="w-16 aspect-square rounded-full"
            />
            <div className="flex flex-col">
              <span className="font-medium text-xl">{selectedOrg.orgName}</span>
              <span className="italic text-xs">Selected Organization</span>
            </div>
          </div>
          <X
            onClick={() => onSelectOrg(null)}
            size={32}
            strokeWidth={4}
            className="text-gray-500 text-3xl hover:text-gray-700 font-bold cursor-pointer"
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-col flex flex-1 h-full ">
        <Routes>
          {/* Dashboard/Home route */}
          <Route
            path="/"
            element={
              selectedOrg ? (
                <div>
                  <h1 className="text-2xl font-bold mb-4">
                    Dashboard - {selectedOrg.orgName}
                  </h1>
                  <p>Dashboard content for {selectedOrg.orgName}</p>
                </div>
              ) : (
                <div>
                  <OrganizationSelector title="Dashboard" />
                </div>
              )
            }
          />

          {/* Proposals route */}
          <Route
            path="/proposal"
            element={
              selectedOrg ? (
                <DeanProposalConduct orgData={selectedOrg} user={user} />
              ) : (
                <div>
                  <OrganizationSelector title="Proposal" />
                </div>
              )
            }
          />

          {/* Accreditation routes */}
          <Route
            path="/accreditation/*"
            element={
              <DeanAccreditationNavigationSubRoute
                selectedOrg={selectedOrg}
                onSelectOrg={onSelectOrg}
              />
            }
          >
            <Route
              index
              element={
                selectedOrg ? (
                  <DeanAccreditationMain selectedOrg={selectedOrg} />
                ) : (
                  <OrganizationSelector title="Accreditation" />
                )
              }
            />
            <Route
              path="financial-report"
              element={
                selectedOrg ? (
                  <DeanFinancialReport selectedOrg={selectedOrg} user={user} />
                ) : (
                  <OrganizationSelector title="Accreditation" />
                )
              }
            />
            <Route
              path="roster-of-members"
              element={
                selectedOrg ? (
                  <DeanRosterData selectedOrg={selectedOrg} />
                ) : (
                  <OrganizationSelector title="Accreditation" />
                )
              }
            />
            <Route
              path="document"
              element={
                selectedOrg ? (
                  <DeanAccreditationDocument selectedOrg={selectedOrg} />
                ) : (
                  <OrganizationSelector title="Accreditation" />
                )
              }
            />
            <Route
              path="proposed-action-plan"
              element={
                selectedOrg ? (
                  <DeanProposedPlan selectedOrg={selectedOrg} />
                ) : (
                  <div>
                    <OrganizationSelector title="Accreditation" />
                  </div>
                )
              }
            />
            <Route
              path="president-information"
              element={
                selectedOrg ? (
                  <DeanPresident selectedOrg={selectedOrg} />
                ) : (
                  <div>
                    <OrganizationSelector title="Accreditation" />
                  </div>
                )
              }
            />
            <Route
              path="settings"
              element={
                selectedOrg ? (
                  <div>
                    <h1 className="text-2xl font-bold mb-4">
                      Settings - {selectedOrg.orgName}
                    </h1>
                    <p>Settings for {selectedOrg.orgName}</p>
                  </div>
                ) : (
                  <div>
                    <OrganizationSelector title="Accreditation" />
                  </div>
                )
              }
            />
            <Route
              path="history"
              element={
                selectedOrg ? (
                  <div>
                    <h1 className="text-2xl font-bold mb-4">
                      History - {selectedOrg.orgName}
                    </h1>
                    <p>History for {selectedOrg.orgName}</p>
                  </div>
                ) : (
                  <div>
                    <OrganizationSelector title="Accreditation" />
                  </div>
                )
              }
            />
          </Route>

          {/* Accomplishments route */}
          <Route
            path="/accomplishment"
            element={
              selectedOrg ? (
                <DeanAccomplishmentReport orgData={selectedOrg} user={user} />
              ) : (
                <div>
                  <OrganizationSelector title="Accreditation" />
                </div>
              )
            }
          />

          {/* Posts route */}
          <Route
            path="/post"
            element={
              selectedOrg ? (
                <div>
                  <h1 className="text-2xl font-bold mb-4">
                    Posts - {selectedOrg.orgName}
                  </h1>
                  <p>Posts for {selectedOrg.orgName}</p>
                </div>
              ) : (
                <div>
                  <OrganizationSelector title="Accreditation" />
                </div>
              )
            }
          />

          {/* Logs route */}
          <Route
            path="/log"
            element={
              selectedOrg ? (
                <div>
                  <h1 className="text-2xl font-bold mb-4">
                    Logs - {selectedOrg.orgName}
                  </h1>
                  <p>Activity logs for {selectedOrg.orgName}</p>
                </div>
              ) : (
                <div>
                  <OrganizationSelector title="Accreditation" />
                </div>
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
}




export function DeanDashboard({ organizationSummary, orgs, onSelectOrg, loading }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 🔹 Deduplicate: pick only the latest profile per organization
  const latestOrgs = useMemo(() => {
    const keyOf = (o) =>
      o?.organization?._id ?? o?._id ?? o?.orgAcronym ?? o?.orgName ?? String(Math.random());

    const timeOf = (o) =>
      new Date(o?.updatedAt || o?.createdAt || 0).getTime();

    const map = new Map();
    for (const o of orgs || []) {
      const k = keyOf(o);
      const prev = map.get(k);
      if (!prev || timeOf(o) > timeOf(prev)) {
        map.set(k, o);
      }
    }
    return Array.from(map.values());
  }, [orgs]);

  // donut chart data
  const statusCounts = useMemo(() => {
    const counts = {};
    for (const o of latestOrgs) {
      const status = o.overAllStatus || o.status || "Unknown";
      counts[status] = (counts[status] || 0) + 1;
    }
    return Object.entries(counts).map(([status, value]) => ({ name: status, value }));
  }, [latestOrgs]);

  const COLORS = ["#4caf50", "#ff9800", "#f44336", "#2196f3", "#9c27b0"];

  // upcoming activities
  const upcomingActivities = useMemo(() => {
    return latestOrgs
      .flatMap((o) => o.activities || [])
      .filter((act) => new Date(act?.ProposedIndividualActionPlan?.proposedDate) > new Date())
      .sort((a, b) => new Date(a.ProposedIndividualActionPlan.proposedDate) - new Date(b.ProposedIndividualActionPlan.proposedDate))
      .slice(0, 5);
  }, [latestOrgs]);

  // expiring orgs
  const expiringOrgs = useMemo(() => {
    const soon = new Date();
    soon.setMonth(soon.getMonth() + 1);
    return latestOrgs
      .filter((o) => o.accreditation?.expiryDate && new Date(o.accreditation.expiryDate) < soon)
      .sort((a, b) => new Date(a.accreditation.expiryDate) - new Date(b.accreditation.expiryDate))
      .slice(0, 5);
  }, [latestOrgs]);

  // pagination
  const totalPages = Math.ceil(latestOrgs.length / itemsPerPage);
  const paginatedOrgs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return latestOrgs.slice(start, start + itemsPerPage);
  }, [latestOrgs, currentPage]);

  const getStatusBadge = (status) => {
    const statusStyles = {
      Approved: "bg-green-100 text-green-700 border-green-200",
      Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Revision From SDU": "bg-red-100 text-red-700 border-red-200",
      Rejected: "bg-red-100 text-red-700 border-red-200",
      "Approved by the Adviser": "bg-blue-100 text-blue-700 border-blue-200",
      Active: "bg-green-100 text-green-700 border-green-200",
      active: "bg-green-100 text-green-700 border-green-200",
    };
    return statusStyles[status] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: '#F5F5F9' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Dean Dashboard</h1>
        <p className="text-sm text-gray-600">Overview of organizations and activities</p>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Summary Cards Row */}
        <div className="grid grid-cols-5 gap-6 mb-6">
          {organizationSummary.map(({ label, value }, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-sm p-6 flex flex-col"
            >
              <span className="text-sm text-gray-600 font-medium mb-2">{label}</span>
              <span className="text-3xl font-bold text-gray-900">{value}</span>
            </div>
          ))}

          {/* Chart Card */}
          <div className="col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-base font-semibold mb-4 text-gray-900">
              Organization Statuses
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusCounts}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {statusCounts.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Upcoming Activities Card */}
          <div className="col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-base font-semibold mb-4 text-gray-900">Upcoming Activities</h2>
            <div className="flex-1 overflow-y-auto space-y-3">
              {upcomingActivities.map((act, idx) => (
                <div key={idx} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="font-medium text-sm text-gray-900">
                    {act.ProposedIndividualActionPlan?.activityTitle}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {new Date(
                      act.ProposedIndividualActionPlan.proposedDate
                    ).toLocaleDateString()}
                    {" • "}
                    {act.ProposedIndividualActionPlan?.venue}
                  </div>
                </div>
              ))}
              {upcomingActivities.length === 0 && (
                <div className="text-sm text-gray-400">No upcoming activities</div>
              )}
            </div>
          </div>

          {/* Expiring Orgs Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-base font-semibold mb-4 text-gray-900">Expiring Organizations</h2>
            <div className="flex-1 overflow-y-auto space-y-3">
              {expiringOrgs.map((o, idx) => (
                <div key={idx} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="font-medium text-sm text-gray-900">{o.orgName}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Expiry:{" "}
                    {new Date(o.accreditation.expiryDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {expiringOrgs.length === 0 && (
                <div className="text-sm text-gray-400">No expiring organizations</div>
              )}
            </div>
          </div>
        </div>

        {/* Organizations List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Local Organizations</h2>

            {/* pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center gap-2 text-sm">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                      : "bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
                  }`}
                >
                  Prev
                </button>
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                      : "bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {loading
              ? // Skeleton loaders
                Array.from({ length: itemsPerPage }).map((_, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4 animate-pulse"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-16 h-16 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))
              : paginatedOrgs.map((org, idx) => {
                  const overallStatus =
                    org.overAllStatus || org.overallStatus || org.status || "—";

                  return (
                    <div
                      key={idx}
                      onClick={() => onSelectOrg(org)}
                      className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <img
                          src={`${DOCU_API_ROUTER}/${org._id}/${org.orgLogo}`}
                          alt={`${org.orgName} logo`}
                          className="w-16 h-16 object-contain"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = PlaceholderLogo;
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-1">
                            {org.orgName}
                          </h3>
                          <p className="text-xs text-gray-600">{org.orgAcronym}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span
                          className={`${getStatusBadge(
                            overallStatus
                          )} inline-block px-2 py-1 border rounded-md text-xs font-medium`}
                        >
                          {overallStatus}
                        </span>
                        <div className="text-xs space-y-1 text-gray-600">
                          <div>
                            <span className="font-medium">Adviser:</span>{" "}
                            {org.adviser?.name || "No adviser"}
                          </div>
                          <div>
                            <span className="font-medium">Course:</span>{" "}
                            {org.orgCourse || "Not specified"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

            {!loading && paginatedOrgs.length === 0 && (
              <div className="col-span-3 text-center py-12 text-gray-500">
                No organizations available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
