import { Routes, Route } from "react-router-dom";
import { DOCU_API_ROUTER } from "../../../App";
import { X } from "lucide-react";
import { UnderDevelopment } from "../../../components/components";
import { SduCoordinatorAccreditationNavigationSubRoute } from "./sdu-coor-main";
import { SduCoorMainAccreditation } from "./accreditation/sdu-coor-accreditation-main";
import { SduCoorPresident } from "./accreditation/sdu-coor-accreditation-president-info";
import { SduCoorFinancialReport } from "./accreditation/sdu-coor-accreditation-financial-report";
import { SduCoorRosterData } from "./accreditation/sdu-coor-accreditation-roster";
import { SduCoorProposedPlan } from "./accreditation/sdu-coor-proposed-action-plan";
import { SduCoorAccreditationDocument } from "./accreditation/sdu-coor-accreditation-document";
import { SduCoorProposalConduct } from "./proposals/sdu-coor-proposal";
import { SduCoorAccomplishmentReport } from "./accomplishment/sdu-coor-accomplishment";
import { School2 } from "lucide-react"; // you used <School2 /> but didn’t import it

export function SduCoordinatorComponent({
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
                  src={`${DOCU_API_ROUTER}/${org._id}/${org.orgLogo}`}
                  alt={`${org.orgName} Logo`}
                  className="w-16 h-16 object-cover rounded-full border-3 border-white shadow-md"
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

      <div className="flex-col flex flex-1 min-h-0 w-full overflow-auto ">
        <Routes>
          {/* Dashboard/Home route */}
          <Route
            path="/"
            element={
              selectedOrg ? (
                <UnderDevelopment />
              ) : (
                <OrganizationSelector title="Dashboard" />
              )
            }
          />

          {/* Proposals route */}
          <Route
            path="/proposal"
            element={
              selectedOrg ? (
                <SduCoorProposalConduct orgData={selectedOrg} user={user} />
              ) : (
                <OrganizationSelector title="Proposals" />
              )
            }
          />

          {/* Accreditation routes */}
          <Route
            path="/accreditation/*"
            element={
              <SduCoordinatorAccreditationNavigationSubRoute
                selectedOrg={selectedOrg}
              />
            }
          >
            <Route
              index
              element={
                selectedOrg ? (
                  <SduCoorMainAccreditation selectedOrg={selectedOrg} />
                ) : (
                  <OrganizationSelector title="Accreditation" />
                )
              }
            />
            <Route
              path="financial-report"
              element={
                selectedOrg ? (
                  <SduCoorFinancialReport
                    selectedOrg={selectedOrg}
                    user={user}
                  />
                ) : (
                  <OrganizationSelector title="Financial Report" />
                )
              }
            />
            <Route
              path="roster-of-members"
              element={
                selectedOrg ? (
                  <SduCoorRosterData selectedOrg={selectedOrg} />
                ) : (
                  <OrganizationSelector title="Roster of Members" />
                )
              }
            />
            <Route
              path="document"
              element={
                selectedOrg ? (
                  <SduCoorAccreditationDocument selectedOrg={selectedOrg} />
                ) : (
                  <OrganizationSelector title="Documents" />
                )
              }
            />
            <Route
              path="proposed-action-plan"
              element={
                selectedOrg ? (
                  <SduCoorProposedPlan selectedOrg={selectedOrg} />
                ) : (
                  <OrganizationSelector title="Proposed Action Plan" />
                )
              }
            />
            <Route
              path="president-information"
              element={
                selectedOrg ? (
                  <SduCoorPresident selectedOrg={selectedOrg} />
                ) : (
                  <OrganizationSelector title="President Information" />
                )
              }
            />
            <Route
              path="settings"
              element={
                selectedOrg ? (
                  <UnderDevelopment />
                ) : (
                  <OrganizationSelector title="Settings" />
                )
              }
            />
            <Route
              path="history"
              element={
                selectedOrg ? (
                  <UnderDevelopment />
                ) : (
                  <OrganizationSelector title="History" />
                )
              }
            />
          </Route>

          {/* Accomplishments route */}
          <Route
            path="/accomplishment"
            element={
              selectedOrg ? (
                <SduCoorAccomplishmentReport
                  orgData={selectedOrg}
                  user={user}
                />
              ) : (
                <OrganizationSelector title="Accomplishments" />
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
                <OrganizationSelector title="Posts" />
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
                <OrganizationSelector title="Logs" />
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
}
