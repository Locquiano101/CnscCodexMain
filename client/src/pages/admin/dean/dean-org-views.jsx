// dean-org-views.jsx
import { useState, useMemo, useRef, useEffect } from "react";
import { DOCU_API_ROUTER } from "../../../App";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import axios from "axios";
import { API_ROUTER } from "../../../App";
// TODO: Migrate API_ROUTER import to central config if available (parity with adviser pages)

import { DeanFinancialReport } from "./individual-accreditation/dean-accreditation-financial-report";
import { DeanRosterData } from "./individual-accreditation/dean-accreditation-roster";
import { DeanPresident } from "./individual-accreditation/dean-accreditation-president";
import { DeanAccreditationDocument } from "./individual-accreditation/dean-accreditation-documents";
import { DeanAccomplishmentReport } from "./accomplishment/dean-accomplishment";
import { DeanProposalConduct } from "./proposals/dean-proposal";
import { DeanProposedPlan } from "./individual-accreditation/dean-accreditation-proposed-plan";
import DeanCustomRequirementViewer from "./individual-accreditation/dean-custom-requirement-viewer";

export function OrgHome({
  displayOrg, // latest active profile OR baseOrg
  accreditationData, // fetched in parent
  financial, // fetched in parent (for latest profile)
  activities, // fetched in parent (for latest profile)
}) {
  const [tab, setTab] = useState("Overview");
  const [underlineStyle, setUnderlineStyle] = useState({});
  const tabsRef = useRef([]);
  // Visible accreditation requirements (template + custom) for dynamic dean tabs
  const [visibleRequirements, setVisibleRequirements] = useState(null); // null = loading, [] = loaded none/error
  // Dean header tabs: start with templates then append custom requirement titles
  const templateHeadertabs = useMemo(
    () => [
      { label: "Overview" },
      { label: "President Information" },
      { label: "Roster of Members" },
      { label: "Documents" },
      { label: "Proposed Action Plan" },
    ],
    []
  );
  const customHeadertabs = useMemo(
    () => (visibleRequirements || [])
      .filter(r => r.type === 'custom')
      .map(r => ({ label: r.title, key: r.key })),
    [visibleRequirements]
  );
  const headertabs = useMemo(
    () => [...templateHeadertabs, ...customHeadertabs],
    [templateHeadertabs, customHeadertabs]
  );

  // Fetch visible requirements once (global list) to build dean custom tabs
  useEffect(() => {
    let ignore = false;
    async function fetchVisible() {
      try {
        const { data } = await axios.get(`${API_ROUTER}/accreditation/requirements/visible`, { withCredentials: true });
        if (!ignore) setVisibleRequirements(data || []);
      } catch (e) {
        if (!ignore) setVisibleRequirements([]);
        console.warn("Dean OrgHome: failed to fetch visible requirements", e?.message);
      }
    }
    fetchVisible();
    return () => { ignore = true; };
  }, []);

  // underline animation
  useEffect(() => {
    const activeIndex = headertabs.findIndex((t) => t.label === tab);
    const activeEl = tabsRef.current[activeIndex];
    if (activeEl) {
      const next = { left: activeEl.offsetLeft, width: activeEl.offsetWidth };
      setUnderlineStyle(prev => (prev.left === next.left && prev.width === next.width) ? prev : next);
    }
  }, [tab, headertabs]);

  // ---- UI data ----
  const orgDetails = [
    { label: "Type", value: displayOrg?.orgClass ?? "—" },
    { label: "Department", value: displayOrg?.orgCourse ?? "—" },
    { label: "Delivery Unit", value: displayOrg?.orgDepartment ?? "—" },
    { label: "Email", value: displayOrg?.adviser?.email ?? "—" },
  ];

  const requirements = [
    {
      name: "Joint Statement",
      status: accreditationData?.JointStatement?.status || "Not Submitted",
    },
    {
      name: "Pledge Against Hazing",
      status: accreditationData?.PledgeAgainstHazing?.status || "Not Submitted",
    },
    {
      name: "Constitution And By-Laws",
      status:
        accreditationData?.ConstitutionAndByLaws?.status || "Not Submitted",
    },
    {
      name: "Roster Members",
      status: accreditationData?.Roster?.overAllStatus || "Incomplete",
    },
    {
      name: "President Profile",
      status:
        accreditationData?.PresidentProfile?.overAllStatus || "Not Submitted",
    },
    {
      name: "Financial Report",
      status: accreditationData?.FinancialReport?.isActive
        ? "Active"
        : "Inactive",
    },
  ];

  // Normalize and count completed statuses (case-insensitive + supports variations)
  const completedRequirements = requirements.filter((req) => {
    const status = (req.status || "").toLowerCase();
    return (
      status.includes("approved") ||
      status.includes("submitted") ||
      status.includes("active") ||
      status.includes("complete") ||
      status.includes("accredited") ||
      status.includes("renewal")
    );
  }).length;

  const totalRequirements = requirements.length;
  const progressPercentage =
    totalRequirements > 0
      ? Math.round((completedRequirements / totalRequirements) * 100)
      : 0;

  const formatMonth = (dateString) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  // Build monthly chart data
  const monthlyDataMap = {};
  financial?.collections?.forEach((item) => {
    const month = formatMonth(item.date);
    if (!monthlyDataMap[month]) {
      monthlyDataMap[month] = {
        month,
        collections: 0,
        reimbursements: 0,
        disbursements: 0,
      };
    }
    monthlyDataMap[month].collections += item.amount || 0;
  });
  financial?.reimbursements?.forEach((item) => {
    const month = formatMonth(item.date);
    if (!monthlyDataMap[month]) {
      monthlyDataMap[month] = {
        month,
        collections: 0,
        reimbursements: 0,
        disbursements: 0,
      };
    }
    monthlyDataMap[month].reimbursements += item.amount || 0;
  });
  financial?.disbursements?.forEach((item) => {
    const month = formatMonth(item.date);
    if (!monthlyDataMap[month]) {
      monthlyDataMap[month] = {
        month,
        collections: 0,
        reimbursements: 0,
        disbursements: 0,
      };
    }
    monthlyDataMap[month].disbursements += item.amount || 0;
  });
  const financialChartData = Object.values(monthlyDataMap).sort(
    (a, b) => new Date(a.month) - new Date(b.month)
  );

  console.log(financial);

  const presidentName =
    typeof displayOrg?.orgPresident === "object"
      ? displayOrg?.orgPresident?.name ?? "Not available!"
      : displayOrg?.orgPresident ?? "Not available!";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page Header */}
      <div className="h-18 border-b bg-background flex items-center justify-between px-6 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold">Organization Overview</h1>
          <p className="text-sm text-muted-foreground">View organization details and accreditation status</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{displayOrg?.orgName || "Organization"}</p>
            <p className="text-xs text-muted-foreground">{displayOrg?.orgAcronym || ""}</p>
          </div>
          {displayOrg?._id && displayOrg?.orgLogo && (
            <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
              <img
                src={`${DOCU_API_ROUTER}/${displayOrg._id}/${displayOrg.orgLogo}`}
                alt="Organization Logo"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tabs Header (includes dynamic custom requirement tabs) */}
      <header className="relative flex h-14 w-full border-b border-gray-200 overflow-x-auto custom-scroll whitespace-nowrap flex-shrink-0 bg-background">
        {headertabs.map(({ label }, idx) => (
          <button
            key={label}
            ref={(el) => (tabsRef.current[idx] = el)}
            onClick={() => setTab(label)}
            className={`flex-shrink-0 w-40 text-sm font-semibold px-4 py-2 flex items-center justify-center transition-colors duration-300 ${tab === label ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
          >
            {label}
          </button>
        ))}
        <span className="absolute bottom-0 h-[2px] bg-primary transition-all duration-500 ease-in-out" style={underlineStyle} />
      </header>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#F5F5F9' }}>
        {tab === "Overview" && (
          <>
            <div className="flex w-full items-center gap-x-6 mb-6">
              <div className="flex items-center gap-x-3 w-1/2">
                {displayOrg?._id && displayOrg?.orgLogo ? (
                  <img
                    src={`${DOCU_API_ROUTER}/${displayOrg._id}/${displayOrg.orgLogo}`}
                    alt={displayOrg?.orgAcronym || "Org Logo"}
                    className="h-20 min-w-20 object-contain"
                  />
                ) : (
                  <div className="h-20 w-20 bg-gray-200 rounded" />
                )}
                <h1 className="text-3xl font-bold">
                  {displayOrg?.orgName || "Organization"}{" "}
                  {displayOrg?.orgAcronym && (
                    <span className="text-gray-600">
                      ({displayOrg.orgAcronym})
                    </span>
                  )}
                </h1>
              </div>

              <div className="w-1/2 space-y-1">
                <div className="flex justify-between items-center font-semibold">
                  <h2 className="text-lg">Accreditation Status</h2>
                  <span className="text-gray-700">
                    {displayOrg?.overAllStatus || "—"}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700">Progress</span>
                    <span className="text-sm text-gray-700">
                      {completedRequirements}/{totalRequirements} completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-full rounded-sm overflow-hidden shadow-[inset_0_2px_6px_rgba(0,0,0,0.2)]">
                    <div
                      className="bg-cnsc-primary-color h-5 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full h-50 flex items-center justify-between mb-6 text-gray-500">
              <div className="w-[47.5%] h-full flex-wrap flex gap-3">
                {orgDetails.map(({ label, value }, idx) => (
                  <div
                    key={idx}
                    className="w-[48.9%] h-[46.3%] flex flex-col rounded-md bg-gray-200 py-2 px-3"
                  >
                    <h1>{label}</h1>
                    <span className="ml-3 text-black leading-tight">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="w-[51%] h-full rounded-md bg-cnsc-primary-color flex flex-col font-bold text-xl text-white pt-2 pb-3 px-3 gap-y-3">
                <h1 className="">Key Personnel</h1>
                <div className="w-full h-1/2 rounded-md p-2 bg-gray-200 flex flex-col">
                  <span className="text-gray-500 text-[12px]">President</span>
                  <span className="text-black">{presidentName}</span>
                </div>
                <div className="w-full h-1/2 rounded-md p-2 bg-gray-200 flex flex-col">
                  <span className="text-gray-500 text-[12px]">Adviser</span>
                  <span className="text-black">
                    {displayOrg?.adviser?.name ?? "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full h-75 flex items-center justify-between text-gray-500">
              <div className="w-[47.5%] h-75 flex-wrap flex flex-col">
                <h1 className="text-lg text-black font-semibold mb-1">
                  Upcoming Activities
                </h1>

                <div className="grid grid-cols-3 pb-1 border-b-1">
                  {["Title", "Venue", "Date"].map((label) => (
                    <div key={label} className="pl-2">
                      <h1>{label}</h1>
                    </div>
                  ))}
                </div>

                <div className="w-full h-57 flex flex-col overflow-y-auto">
                  {activities?.map((act, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-3 py-2 text-sm text-black hover:bg-gray-300 cursor-pointer"
                    >
                      <div className="pl-2 capitalize">
                        {act?.ProposedIndividualActionPlan?.activityTitle ??
                          "—"}
                      </div>
                      <div className="pl-2 capitalize">
                        {act?.ProposedIndividualActionPlan?.venue ?? "—"}
                      </div>
                      <div className="pl-2">
                        {act?.ProposedIndividualActionPlan?.proposedDate
                          ? new Date(
                              act.ProposedIndividualActionPlan.proposedDate
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-[51%] h-75 bg-white rounded-md flex flex-col">
                <h1 className="text-lg text-black font-semibold">
                  Financial Report
                </h1>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={financialChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="collections"
                      fill="#4caf50"
                      name="Collections"
                    />
                    <Bar
                      dataKey="reimbursements"
                      fill="#2196f3"
                      name="Reimbursements"
                    />
                    <Bar
                      dataKey="disbursements"
                      fill="#f44336"
                      name="Disbursements"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {tab === "President Information" && (
          <div className="w-full h-full">
            <DeanPresident selectedOrg={displayOrg} />
          </div>
        )}
        {tab === "Roster of Members" && (
          <DeanRosterData selectedOrg={displayOrg} />
        )}

        {tab === "Documents" && (
          <div className="w-full h-full">
            <DeanAccreditationDocument selectedOrg={displayOrg} />
          </div>
        )}
        {tab === "Proposed Action Plan" && (
          <div className="w-full h-full">
            <DeanProposedPlan selectedOrg={displayOrg} />
          </div>
        )}
        {/* Dynamic Custom Requirement Viewer Tabs */}
        {customHeadertabs.map(cr => (
          tab === cr.label ? (
            <div key={cr.key} className="w-full h-full">
              <DeanCustomRequirementViewer
                requirementKey={cr.key}
                title={cr.label}
                selectedOrg={displayOrg}
              />
            </div>
          ) : null
        ))}
      </div>
    </div>
  );
}

export function OrgAccreditation({ org, accreditationData, baseOrg }) {
  const [accomplishment, setAccomplishment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //  Determine the organization profile ID
  const orgProfileId =
    org?._id ||
    org?.organizationProfile ||
    baseOrg?._id ||
    baseOrg?.organizationProfile;

  useEffect(() => {
    if (!orgProfileId) {
      setLoading(false);
      return;
    }

    const fetchAccomplishment = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `${API_ROUTER}/getAccomplishment/${orgProfileId}`
        );
        setAccomplishment(res.data);
      } catch (err) {
        console.error(" Error fetching accomplishment report:", err);
        setError("Failed to load accomplishment report.");
      } finally {
        setLoading(false);
      }
    };

    fetchAccomplishment();
  }, [orgProfileId]);

  // ----------------------
  // Prepare Data for Table
  // ----------------------
  const orgData = [
    {
      name: org?.orgName || baseOrg?.orgName || "N/A",
      nature: org?.orgClass || baseOrg?.orgClass || "N/A",
      accreditationStatus:
        accreditationData?.overallStatus ||
        baseOrg?.accreditation?.overallStatus ||
        "Pending",
      adviser: org?.adviser?.name || baseOrg?.adviser?.name || "N/A",
      president:
        org?.orgPresident?.name || baseOrg?.orgPresident?.name || "N/A",
      validationDate: accreditationData?.updatedAt
        ? new Date(accreditationData.updatedAt).toLocaleDateString()
        : "N/A",
      apesocTotal:
        accomplishment?.grandTotal || baseOrg?.latestProfile?.apesocTotal || 0,
      finalStatus:
        baseOrg?.latestProfile?.overAllStatus ||
        accreditationData?.overallStatus ||
        "Pending",
    },
  ];

  // ----------------------
  // UI RENDERING
  // ----------------------
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page Header */}
      <div className="h-18 border-b bg-background flex items-center justify-between px-6 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold">Accreditation Status</h1>
          <p className="text-sm text-muted-foreground">Monitor organization accreditation details</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{org?.orgName || baseOrg?.orgName || "Organization"}</p>
            <p className="text-xs text-muted-foreground">{org?.orgAcronym || baseOrg?.orgAcronym || ""}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#F5F5F9' }}>
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-gray-600 font-medium">
                Loading accomplishment data...
              </span>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <p className="text-red-600 font-medium text-center">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <AccreditationTable data={orgData} />
        )}
      </div>
    </div>
  );
}

// ----------------------
// TABLE COMPONENT
// ----------------------
export default function AccreditationTable({ data = [] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          {/* Table Header */}
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">
                NO.
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                NAME OF THE ORGANIZATION
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                NATURE
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-40">
                STATUS OF ACCREDITATION
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-36">
                ADVISER
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-36">
                PRESIDENT
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-40">
                VALIDATION OF ACCREDITATION
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                APESOC RESULT (TOTAL)
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                FINAL STATUS
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-12 text-gray-500 text-sm"
                >
                  No accreditation records available.
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4 text-center text-sm font-medium text-gray-900">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    {row.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {row.nature}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full
                        ${
                          row.accreditationStatus === "Accredited"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : row.accreditationStatus === "Pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                    >
                      {row.accreditationStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {row.adviser}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {row.president}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {row.validationDate}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-blue-600 text-center">
                    {row.apesocTotal}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full
                        ${
                          row.finalStatus === "Approved"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : row.finalStatus === "For Review"
                            ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            : row.finalStatus === "Pending"
                            ? "bg-gray-50 text-gray-700 border border-gray-200"
                            : "bg-gray-50 text-gray-700 border border-gray-200"
                        }`}
                    >
                      {row.finalStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function OrgActivities({ org, activities, user }) {
  //   console.log(activities)
  //   const [selected, setSelected] = useState(null);
  //   const [statusModal, setStatusModal] = useState(null); // for UpdateStatusProposal

  //   // Group activities
  // const pending = activities.filter((a) =>
  //   a.overallStatus?.toLowerCase().includes("pending")
  // );
  // const ongoing = activities.filter((a) =>
  //   a.overallStatus?.toLowerCase().includes("approved")
  // );
  // const completed = activities.filter((a) =>
  //   a.overallStatus?.toLowerCase().includes("completed")
  // );

  //   const chartData = [
  //     { name: "Pending", value: pending.length },
  //     { name: "Ongoing", value: ongoing.length },
  //     { name: "Completed", value: completed.length },
  //   ];
  //   const COLORS = ["#facc15", "#60a5fa", "#34d399"];

  //   const openModal = (activity) => setSelected(activity);
  //   const closeModal = () => setSelected(null);

  //   const handleAction = (type) => {
  //     // open UpdateStatusProposal modal
  //     if (type === "approve") {
  //       setStatusModal({ type: "approval", status: "Approved" });
  //     } else {
  //       setStatusModal({ type: "alert", status: "Returned" });
  //     }
  //   };

  return <DeanProposalConduct orgData={org} user={user} />;
}

export function OrgFinancial({ org, user, financial, displayOrg }) {
  return (
    <DeanFinancialReport
      selectedOrg={displayOrg}
      user={user}
      financial={financial}
    />
  );
}
export function OrgAccomplishments({ org, user, displayOrg }) {
  return <DeanAccomplishmentReport orgData={displayOrg} user={user} />;
}
