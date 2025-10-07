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
  PieChart,
  Pie,
  Cell
} from "recharts";

import { UpdateStatusProposal } from "../../../components/update-status-proposal";
import { DeanFinancialReport } from "./individual-accreditation/dean-accreditation-financial-report";
import { DeanRosterData } from "./individual-accreditation/dean-accreditation-roster";
import { DeanPresident } from "./individual-accreditation/dean-accreditation-president";
import { DeanAccreditationDocument } from "./individual-accreditation/dean-accreditation-documents";
import { DeanAccomplishmentReport } from "./accomplishment/dean-accomplishment";
import { DeanProposedPlan } from "./individual-accreditation/dean-accreditation-proposed-plan";
import { DeanAccreditationMain } from "./individual-accreditation/dean-accreditation-main";


export function OrgHome({
  baseOrg,           // original org from list
  displayOrg,        // latest active profile OR baseOrg
  accreditationData, // fetched in parent
  financial,         // fetched in parent (for latest profile)
  activities,        // fetched in parent (for latest profile)
}) {
  const [tab, setTab] = useState("Overview");
  const [underlineStyle, setUnderlineStyle] = useState({});
  const tabsRef = useRef([]);

  const headertabs = useMemo(
    () => [
      { label: "Overview" },
      { label: "President Information" },
      { label: "Roster of Members" },
      { label: "Documents" },
    ],
    []
  );

  // underline animation
  useEffect(() => {
    const activeIndex = headertabs.findIndex((t) => t.label === tab);
    const activeEl = tabsRef.current[activeIndex];
    if (activeEl) {
      setUnderlineStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
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
      status: accreditationData?.FinancialReport?.isActive ? "Active" : "Inactive",
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
      monthlyDataMap[month] = { month, collections: 0, reimbursements: 0, disbursements: 0 };
    }
    monthlyDataMap[month].collections += item.amount || 0;
  });
  financial?.reimbursements?.forEach((item) => {
    const month = formatMonth(item.date);
    if (!monthlyDataMap[month]) {
      monthlyDataMap[month] = { month, collections: 0, reimbursements: 0, disbursements: 0 };
    }
    monthlyDataMap[month].reimbursements += item.amount || 0;
  });
  financial?.disbursements?.forEach((item) => {
    const month = formatMonth(item.date);
    if (!monthlyDataMap[month]) {
      monthlyDataMap[month] = { month, collections: 0, reimbursements: 0, disbursements: 0 };
    }
    monthlyDataMap[month].disbursements += item.amount || 0;
  });
  const financialChartData = Object.values(monthlyDataMap).sort(
    (a, b) => new Date(a.month) - new Date(b.month)
  );

  console.log(financial)

  const presidentName =
    typeof displayOrg?.orgPresident === "object"
      ? displayOrg?.orgPresident?.name ?? "Not available!"
      : displayOrg?.orgPresident ?? "Not available!";

  return (
    <>
      {/* Tabs Header */}
      <header className="relative flex h-14 w-full border-b border-gray-400">
        {headertabs.map(({ label }, idx) => (
          <button
            key={label}
            ref={(el) => (tabsRef.current[idx] = el)}
            onClick={() => setTab(label)}
            className={`w-40 text-sm font-semibold px-4 py-2 flex items-center justify-center transition-colors duration-300 ${
              tab === label
                ? "text-cnsc-primary-color"
                : "text-gray-600 hover:text-cnsc-primary-color hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}
        <span
          className="absolute bottom-0 h-[2px] bg-cnsc-primary-color transition-all duration-500 ease-in-out"
          style={underlineStyle}
        />
      </header>

      {/* Tab Content */}
      <div className="p-4">
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
                    <span className="text-gray-600">({displayOrg.orgAcronym})</span>
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
                  <span className="text-black">{displayOrg?.adviser?.name  ?? "—"}</span>
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
                        {act?.ProposedIndividualActionPlan?.activityTitle ?? "—"}
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
                <h1 className="text-lg text-black font-semibold">Financial Report</h1>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={financialChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="collections" fill="#4caf50" name="Collections" />
                    <Bar dataKey="reimbursements" fill="#2196f3" name="Reimbursements" />
                    <Bar dataKey="disbursements" fill="#f44336" name="Disbursements" />
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

      </div>
    </>
  );
}


export default function AccreditationTable({ data = [] }) {
  return (
    <div className="w-full overflow-x-auto border border-gray-400  shadow-sm">


      <div className="max-h-[400px] overflow-y-auto">
        <table className="min-w-[1100px] w-full table-fixed border-separate border-spacing-0">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th
                className="border border-gray-400 px-3 py-2 text-[11px] font-semibold uppercase text-gray-700 text-center"
                rowSpan={2}
              >
                NO.
              </th>
              <th
                className="border border-gray-400 px-3 py-2 text-[11px] font-semibold uppercase text-gray-700 text-center"
                rowSpan={2}
              >
                Name of the Organization
              </th>
              <th
                className="border border-gray-400 px-3 py-2 text-[11px] font-semibold uppercase text-gray-700 text-center"
                rowSpan={2}
              >
                Nature
              </th>
              <th
                className="border border-gray-400 px-3 py-2 text-[11px] font-semibold uppercase text-gray-700 text-center"
                rowSpan={2}
              >
                Status of Accreditation
              </th>
              <th
                className="border border-gray-400 px-3 py-2 text-[11px] font-semibold uppercase text-gray-700 text-center"
                rowSpan={2}
              >
                Adviser/s
              </th>
              <th
                className="border border-gray-400 px-3 py-2 text-[11px] font-semibold uppercase text-gray-700 text-center"
                rowSpan={2}
              >
                President
              </th>
              <th
                className="border border-gray-400 px-3 py-2 text-[11px] font-semibold uppercase text-gray-700 text-center"
                rowSpan={2}
              >
                Validation of Accreditation
              </th>
              <th
                colSpan={3}
                className="border border-gray-400 px-3 py-2 text-[11px] font-semibold uppercase text-gray-700 text-center"
              >
                APESOC Result
              </th>
              <th
                className="border border-gray-400 px-3 py-2 text-[11px] font-semibold uppercase text-gray-700 text-center"
                rowSpan={2}
              >
                Status of Accreditation
              </th>
            </tr>
            <tr>
              <th className="border border-gray-400 px-3 py-2 text-[11px] font-semibold uppercase text-gray-700 text-center">
                1st Sem
              </th>
              <th className="border border-gray-400 px-3 py-2 text-[11px] font-semibold uppercase text-gray-700 text-center">
                2nd Sem
              </th>
              <th className="border border-gray-400 px-3 py-2 text-[11px] font-semibold uppercase text-gray-700 text-center">
                Total
              </th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-6 text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={idx} className="odd:bg-white even:bg-gray-50/40">
                  <td className="border border-gray-400 px-3 py-2 text-center">
                    {idx + 1}
                  </td>
                  <td className="border border-gray-400 px-3 py-2">{row.name}</td>
                  <td className="border border-gray-400 px-3 py-2">{row.nature}</td>
                  <td className="border border-gray-400 px-3 py-2">
                    {row.accreditationStatus}
                  </td>
                  <td className="border border-gray-400 px-3 py-2">{row.adviser}</td>
                  <td className="border border-gray-400 px-3 py-2">{row.president}</td>
                  <td className="border border-gray-400 px-3 py-2">{row.validationDate}</td>
                  <td className="border border-gray-400 px-3 py-2 text-center">{row.apesoc1}</td>
                  <td className="border border-gray-400 px-3 py-2 text-center">{row.apesoc2}</td>
                  <td className="border border-gray-400 px-3 py-2 text-center">{row.apesocTotal}</td>
                  <td className="border border-gray-400 px-3 py-2">{row.finalStatus}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function OrgAccreditation({ org, accreditationData, baseOrg }) {
  // Parse/normalize the data
  const orgData = [
    {
      name: org?.orgName || baseOrg?.orgName || "N/A",
      nature: org?.orgClass || baseOrg?.orgClass || "N/A",
      accreditationStatus:
        accreditationData?.overallStatus ||
        baseOrg?.accreditation?.overallStatus ||
        "Pending",
      adviser:
        org?.adviser?.name ||
        baseOrg?.adviser?.name ||
        "N/A",
      president:
        org?.orgPresident?.name ||
        baseOrg?.orgPresident?.name ||
        "N/A",
      validationDate: accreditationData?.updatedAt
        ? new Date(accreditationData.updatedAt).toLocaleDateString()
        : "N/A",
      apesoc1: baseOrg?.latestProfile?.apesoc1 || 0,
      apesoc2: baseOrg?.latestProfile?.apesoc2 || 0,
      apesocTotal:
        (baseOrg?.latestProfile?.apesoc1 || 0) +
        (baseOrg?.latestProfile?.apesoc2 || 0),
      finalStatus:
        baseOrg?.latestProfile?.overAllStatus ||
        accreditationData?.overallStatus ||
        "Pending",
    },
  ];

  return (
    <>
      <div className="p-4">
        <h2 className="text-xl font-semibold">Accreditations</h2>
        <p>
          {org?.isAllowedForAccreditation
            ? "This organization is allowed for accreditation."
            : "Not allowed for accreditation."}
        </p>
      </div>

      <div className="px-4 w-full h-fit">
        <AccreditationTable data={orgData} />
      </div>
    </>
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

  return (
<DeanProposedPlan selectedOrg={org} />
  );
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
  return (
<DeanAccomplishmentReport orgData={displayOrg} user={user} />
    
  );
}
