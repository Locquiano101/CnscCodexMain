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
import SduAccreditationRequirementsManager from "./accreditation/requirements_manager";
import SduCustomRequirementViewer from "./accreditation/sdu-custom-requirement-viewer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <div className="p-4">
        <Skeleton className="h-4 w-32 mb-2" />
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
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
    <div className="flex flex-col h-full w-full overflow-hidden">
      {showSelector && (
        <div className="border-b bg-background">
          <OrganizationSelector
            orgs={orgs}
            selectedOrg={selectedOrg}
            onSelectOrg={(org) => {
              setSelectedOrg(org);
            }}
          />
        </div>
      )}
      <div className="flex-1 overflow-auto bg[rgb(245, 245, 249)]" >
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
            <Route
              path="requirements"
              element={<SduAccreditationRequirementsManager />}
            />
            <Route
              path="req/:reqKey"
              element={<SduCustomRequirementViewer selectedOrg={selectedOrg} />}
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
    setIsOpen(false);
  };

  const EmptyState = () => (
    <Card>
      <CardContent className="p-8 text-center">
        <BuildingIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">
          No Organizations Found
        </h3>
        <p className="text-muted-foreground text-sm">
          There are no active organizations available at the moment.
        </p>
      </CardContent>
    </Card>
  );

  const OrganizationOption = ({ org, isSelected = false }) => (
    <div
      className={cn(
        "flex items-center gap-4 p-4 cursor-pointer transition-all duration-200 border-l-4",
        isSelected
          ? "bg-primary/5 border-primary"
          : "bg-background border-transparent hover:bg-muted hover:border-border"
      )}
      onClick={() => handleSelect(org)}
    >
      <div className="relative">
        {org.orgLogo ? (
          <img
            src={`${DOCU_API_ROUTER}/${org._id}/${org.orgLogo}`}
            alt={org.orgAcronym}
            className="h-12 w-12 rounded-full object-cover border-2 border-border shadow-sm"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={cn(
            "h-12 w-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-semibold text-sm shadow-sm",
            org.orgLogo ? "hidden" : "flex",
            isSelected ? "from-primary to-primary" : "from-primary/80 to-primary"
          )}
        >
          {org.orgAcronym || org.orgName?.charAt(0) || "?"}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{org.orgName}</h3>
        {org.orgAcronym && (
          <p className="text-sm text-muted-foreground truncate">{org.orgAcronym}</p>
        )}
      </div>
      {isSelected && (
        <Check className="h-5 w-5 text-primary flex-shrink-0" />
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
      <label className="block text-sm font-semibold mb-2">
        Select Organization
      </label>

      <div className="relative">
        {/* Selected Organization Display */}
        <Card
          className={cn(
            "cursor-pointer transition-all duration-200",
            isOpen
              ? "border-primary rounded-t-2xl rounded-b-none shadow-lg"
              : "rounded-xl hover:shadow-lg"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <CardContent className="p-4 flex items-center gap-4">
            {selectedOrg ? (
              <>
                <div className="relative">
                  {selectedOrg.orgLogo ? (
                    <img
                      src={`${DOCU_API_ROUTER}/${selectedOrg._id}/${selectedOrg.orgLogo}`}
                      alt={selectedOrg.orgAcronym}
                      className="h-12 w-12 rounded-full object-cover border-2 border-border shadow-sm"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={cn(
                      "h-12 w-12 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white font-semibold text-sm shadow-sm",
                      selectedOrg.orgLogo ? "hidden" : "flex"
                    )}
                  >
                    {selectedOrg.orgAcronym ||
                      selectedOrg.orgName?.charAt(0) ||
                      "?"}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {selectedOrg.orgName}
                  </h3>
                  {selectedOrg.orgAcronym && (
                    <p className="text-sm text-muted-foreground truncate">
                      {selectedOrg.orgAcronym}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Building className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <span className="text-muted-foreground font-medium">
                    Choose an organization...
                  </span>
                </div>
              </>
            )}
            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </CardContent>
        </Card>

        {/* Dropdown Options */}
        {isOpen && (
          <Card className="absolute z-50 w-full rounded-t-none rounded-b-2xl shadow-2xl border-t-0 overflow-hidden">
            <div className="max-h-80 overflow-y-auto">
              {/* Clear Selection Option */}
              <div
                className={cn(
                  "flex items-center gap-4 p-4 cursor-pointer transition-all duration-200 border-b border-l-4",
                  !selectedOrg
                    ? "bg-destructive/5 border-destructive"
                    : "bg-background border-transparent hover:bg-destructive/5 hover:border-destructive"
                )}
                onClick={() => handleSelect(null)}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">None</h3>
                  <p className="text-sm text-muted-foreground">Clear selection</p>
                </div>
                {!selectedOrg && (
                  <Check className="h-5 w-5 text-destructive flex-shrink-0" />
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
          </Card>
        )}
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
