import { Routes, Route, useLocation, Outlet } from "react-router-dom";
import { UnderDevelopment } from "../../../components/components";
import { SduUserManagement } from "./user-management/sdu-user-management";
import { SduMainOrganizationsComponent } from "./organizations/sdu-organizations";
import { SduIndividualOrganizationView } from "./organizations/sdu-individual-organization";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../App";
import { useEffect, useState } from "react";
import { Building, BuildingIcon, ChevronDown } from "lucide-react";
import { SduMainAccreditationSettings } from "./accreditation/settings/sdu-main-accreditation-settings";
import axios from "axios";
import { SduMainOverallPresident } from "./accreditation/president/sdu-overall-president";
import { SduMainIndividualOrganizationPresident } from "./accreditation/president/sdu-individual-president";
import { SduAccreditationOverview } from "./accreditation/overview/sdu-main-accreditation-overview";
import { SduMainIndividualAccreditationView } from "./accreditation/overview/sdu-main-individual-accreditation";
import { SduMainRosterOverview } from "./accreditation/roster-members/sdu-overall-roster";
import { SduMainIndividualRosterView } from "./accreditation/roster-members/sdu-individual-roster";
import { SduMainOverallProposedActioPlan } from "./accreditation/proposed-action-plan/overall-proposed-action-plan";
import { SduMainAccreditationDocumentOverview } from "./accreditation/documents/sdu-accreditation-documents";
import { SduMainAccreditationDocumentIndividualOrganization } from "./accreditation/documents/sdu-main-accreditation-indivual";
import { SduMainProposedActionPlanOrganization } from "./accreditation/proposed-action-plan/individual-proposed-action-plan";
import { SduMainFinancialReportOverall } from "./accreditation/financial-report/sdu-main-financial-report";
import { SduMainFinancialReport } from "./accreditation/financial-report/individual-financial-report";
import { SduMainAccomplishment } from "./accomplishment/sdu-accomplishment-main";
import { SduMainAccomplishmentOrganization } from "./accomplishment/sdu-individual-accomplishment";
import { SduMainOverallProposedActioPlanConduct } from "./proposal-conduct/sdu-main-overall-proposed-action-plan";
import { SduMainIndividualProposeActionPlan } from "./proposal-conduct/sdu-main-individual-proposed-action-plan";
import { SduGenerateReports } from "./generate-reports/sdu-generate-report";
import SduAuditLogsPage from "./logs/sdu-audit-logs";
import SduRoomsLocations from "./rooms/sdu-rooms-locations";

export function SduMainComponents({ user }) {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [orgs, setOrgs] = useState([]); // ✅ keep org list

  const getAllOrganizationProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_ROUTER}/getAllOrganizationProfile`);
      setOrgs(res.data || []); // ✅ save to state
    } catch (error) {
      console.error("Error fetching orgs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllOrganizationProfile(); // fetch once when mounted
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2 mt-2"></div>
            </div>
            <div className="h-5 w-5 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const renderRoute = (orgComponent, overviewComponent) =>
    selectedOrg ? orgComponent : overviewComponent;

  const shouldShowOrgSelector = [
    "/SDU/proposal",
    "/SDU/accreditation",
    "/SDU/report",
    "/SDU/accomplishment",
    "/SDU/organization",
    "/SDU/organization",
  ].some((prefix) => location.pathname.startsWith(prefix));

  const showSelector =
    shouldShowOrgSelector &&
    !(
      // hide when inside organization route but no org selected
      (
        (location.pathname.startsWith("/SDU/organization") && !selectedOrg) ||
        location.pathname.startsWith("/SDU/reports") ||
        // hide when system-wide route has NO selected org
        (location.pathname.startsWith("/SDU/proposal/system-wide") &&
          !selectedOrg) ||
        // hide when accreditation settings route but no org selected
        (location.pathname.startsWith("/SDU/accreditation/settings") &&
          !selectedOrg)
      )
    );

  return (
    <div className="flex flex-col  h-full w-full overflow-hidden bg-gray-300">
      {showSelector && (
        <OrganizationSelector
          orgs={orgs}
          selectedOrg={selectedOrg}
          onSelectOrg={(org) => {
            setSelectedOrg(org);
          }}
        />
      )}
      <div className="flex flex-col  h-full w-full overflow-hidden bg-gray-300">
        <Routes>
          {/* Dashboard/Home */}
          <Route path="/" element={<UnderDevelopment />} />

          {/* Proposals */}
          <Route path="/proposal">
            <Route
              index
              element={renderRoute(
                <SduMainIndividualProposeActionPlan
                  selectedOrg={selectedOrg}
                />,
                <SduMainOverallProposedActioPlanConduct
                  onSelectOrg={setSelectedOrg}
                />
              )}
            />
            <Route path="system-wide" element={<UnderDevelopment />} />
          </Route>

          {/* Accreditation */}
          <Route path="/accreditation" element={<Outlet />}>
            <Route
              index
              element={renderRoute(
                <SduMainIndividualAccreditationView
                  selectedOrg={selectedOrg}
                />,
                <SduAccreditationOverview onSelectOrg={setSelectedOrg} />
              )}
            />

            <Route
              path="financial-report"
              element={renderRoute(
                <SduMainFinancialReport selectedOrg={selectedOrg} />,
                <SduMainFinancialReportOverall
                  orgs={orgs}
                  selectedOrg={selectedOrg}
                  onSelectOrg={setSelectedOrg}
                />
              )}
            />

            <Route
              path="roster-of-members"
              element={renderRoute(
                <SduMainIndividualRosterView selectedOrg={selectedOrg} />,
                <SduMainRosterOverview
                  orgs={orgs}
                  selectedOrg={selectedOrg}
                  onSelectOrg={setSelectedOrg}
                />
              )}
            />

            <Route
              path="document"
              element={renderRoute(
                <SduMainAccreditationDocumentIndividualOrganization
                  selectedOrg={selectedOrg}
                  user={user}
                />,
                <SduMainAccreditationDocumentOverview
                  orgs={orgs}
                  selectedOrg={selectedOrg}
                  onSelectOrg={setSelectedOrg}
                />
              )}
            />

            <Route
              path="proposed-action-plan"
              element={renderRoute(
                <SduMainProposedActionPlanOrganization
                  selectedOrg={selectedOrg}
                />,
                <SduMainOverallProposedActioPlan onSelectOrg={setSelectedOrg} />
              )}
            />

            <Route
              path="president-information"
              element={renderRoute(
                <SduMainIndividualOrganizationPresident
                  selectedOrg={selectedOrg}
                />,
                <SduMainOverallPresident onSelectOrg={setSelectedOrg} />
              )}
            />

            <Route
              path="settings"
              element={<SduMainAccreditationSettings selectedOrg={selectedOrg} />}
            />
          </Route>

          <Route path="reports" element={<SduGenerateReports />} />
          {/* Accomplishments */}
          <Route
            path="/accomplishment"
            element={renderRoute(
              <SduMainAccomplishmentOrganization selectedOrg={selectedOrg} />,
              <SduMainAccomplishment
                orgs={orgs}
                selectedOrg={selectedOrg}
                onSelectOrg={setSelectedOrg}
              />
            )}
          />
          {/* Organizations */}
          <Route
            path="/organization"
            element={renderRoute(
              <SduIndividualOrganizationView selectedOrg={selectedOrg} />,
              <SduMainOrganizationsComponent
                orgs={orgs}
                selectedOrg={selectedOrg}
                onSelectOrg={setSelectedOrg}
              />
            )}
          />

          {/* Reports */}
          <Route path="/report" element={<UnderDevelopment />} />

          {/* Posts */}
          <Route path="/post" element={<UnderDevelopment />} />

          {/* Activity Logs (SDU-only) */}
          <Route path="/logs" element={<SduAuditLogsPage />} />

          {/* Rooms / Locations Management */}
          <Route path="/rooms" element={<SduRoomsLocations />} />

          {/* User Management */}
          <Route path="/user-management" element={<SduUserManagement />} />
        </Routes>
      </div>
    </div>
  );
}

export function OrganizationSelector({ orgs, selectedOrg, onSelectOrg }) {
  const [isOpen, setIsOpen] = useState(false);
  const handleSelect = (org) => {
    onSelectOrg(org);
  };

  const EmptyState = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
      <BuildingIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No Organizations Found
      </h3>
      <p className="text-gray-500">
        There are no active organizations available at the moment.
      </p>
    </div>
  );

  const OrganizationOption = ({ org, isSelected = false }) => (
    <div
      className={`
        flex items-center gap-4 p-4 cursor-pointer transition-all duration-200
        hover:bg-blue-50 hover:border-l-4 hover:border-l-blue-500
        ${isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}
      `}
      onClick={() => handleSelect(org)}
    >
      <div className="relative">
        {org.orgLogo ? (
          <img
            src={`${DOCU_API_ROUTER}/${org._id}/${org.orgLogo}`}
            alt={org.orgAcronym}
            className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 shadow-sm"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={`h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm ${
            org.orgLogo ? "hidden" : "flex"
          }`}
        >
          {org.orgAcronym || org.orgName?.charAt(0) || "?"}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{org.orgName}</h3>
        {org.orgAcronym && (
          <p className="text-sm text-gray-500 truncate">{org.orgAcronym}</p>
        )}
      </div>
      {isSelected && (
        <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
          <svg
            className="h-3 w-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );

  if (orgs.length === 0) {
    return (
      <div className="p-4">
        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Organization
          </label>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="p-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Select Organization
      </label>

      <div className="relative">
        {/* Selected Organization Display */}
        <div
          className={`
            bg-white  shadow-lg border-2 cursor-pointer transition-all duration-200
            ${
              isOpen
                ? "border-blue-500 rounded-t-2xl "
                : "border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg"
            }
          `}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="p-4 flex items-center gap-4">
            {selectedOrg ? (
              <>
                <div className="relative">
                  {selectedOrg.orgLogo ? (
                    <img
                      src={`${DOCU_API_ROUTER}/${selectedOrg._id}/${selectedOrg.orgLogo}`}
                      alt={selectedOrg.orgAcronym}
                      className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm ${
                      selectedOrg.orgLogo ? "hidden" : "flex"
                    }`}
                  >
                    {selectedOrg.orgAcronym ||
                      selectedOrg.orgName?.charAt(0) ||
                      "?"}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {selectedOrg.orgName}
                  </h3>
                  {selectedOrg.orgAcronym && (
                    <p className="text-sm text-gray-500 truncate">
                      {selectedOrg.orgAcronym}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Building className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <span className="text-gray-500 font-medium">
                    Choose an organization...
                  </span>
                </div>
              </>
            )}
            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute z-50 w-full rounded-b-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
            <div className="max-h-80 overflow-y-auto">
              {/* Clear Selection Option */}
              <div
                className={`
                  flex items-center gap-4 p-4 cursor-pointer transition-all duration-200
                  hover:bg-red-50 hover:border-l-4 hover:border-l-red-500 border-b border-gray-100
                  ${!selectedOrg ? "bg-red-50 border-l-4 border-l-red-500" : ""}
                `}
                onClick={() => handleSelect(null)}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-700">None</h3>
                  <p className="text-sm text-gray-500">Clear selection</p>
                </div>
                {!selectedOrg && (
                  <div className="h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Organization Options */}
              {orgs.map((org) => (
                <OrganizationOption
                  key={org._id}
                  org={org}
                  isSelected={selectedOrg?._id === org._id}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
