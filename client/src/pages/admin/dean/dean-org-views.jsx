import { useState, useMemo, useRef, useEffect } from "react";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../App";
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

export function OrgHome({ org }) {
  const [tab, setTab] = useState("Overview");
  const [underlineStyle, setUnderlineStyle] = useState({});
  const tabsRef = useRef([]);
  const [accreditationData, setAccreditationData] = useState({});
  const [financialGago, setFinancialNgGago] = useState({});
  const [orgProfiles, setOrgProfiles] = useState([]);
  const [activities, setActivities] = useState([]);

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

  // fetch accreditation + all profiles (NOT financial here!)
  useEffect(() => {
    fetchAccreditationData();
    fetchAllProfiles();

  }, [org.organization._id]);

  const fetchAccreditationData = async () => {
    try {
      const response = await axios.get(
        `${API_ROUTER}/getAccreditationInfo/${org.organization._id}`,
        { withCredentials: true }
      );
      setAccreditationData(response.data);
    } catch (error) {
      console.error("Error fetching accreditation info:", error);
    }
  };

  const fetchAllProfiles = async () => {
    try {
      const res = await axios.get(
        `${API_ROUTER}/getAllOrganizationProfile`,
        { withCredentials: true }
      );
      setOrgProfiles(res.data);
    } catch (err) {
      console.error("Error fetching all profiles:", err);
    }
  };

  // ---- latest active profile resolver ----
  const getLatestActiveProfile = (org, allProfiles) => {
    if (!org?.organization?.organizationProfile?.length) return null;

    const related = allProfiles.filter((p) =>
      org.organization.organizationProfile.includes(p._id)
    );
    const activeOnes = related.filter((p) => p.isActive);

    if (activeOnes.length === 0) return null;

    return activeOnes.reduce((latest, p) =>
      new Date(p.createdAt) > new Date(latest.createdAt) ? p : latest
    );
  };

  const latestActiveProfile = getLatestActiveProfile(org, orgProfiles);
  const displayOrg = latestActiveProfile || org;

  // fetch financials ONLY for latest active
  useEffect(() => {
    if (latestActiveProfile) {
      fetchFinancialReports(latestActiveProfile._id);
      fetchACtivities(latestActiveProfile._id)
    }
  }, [latestActiveProfile]);

  const fetchFinancialReports = async (profileId) => {
    try {
      const response = await axios.get(
        `${API_ROUTER}/getFinancialReport/${profileId}`,
        { withCredentials: true }
      );
      setFinancialNgGago(response.data);
    } catch (error) {
      console.error("Error fetching financial reports:", error);
    }
  };

    const fetchACtivities = async (profileId) => {
    try {
      const response = await axios.get(
        `${API_ROUTER}/getStudentLeaderProposalConduct/${profileId}`,
        { withCredentials: true }
      );
      setActivities(response.data);
    } catch (error) {
      console.error("Error fetching financial reports:", error);
    }
  };

  console.log("testd", activities);

  // ---- UI data ----
  const orgDetails = [
    { label: "Type", value: org.orgClass },
    { label: "Department", value: org.orgCourse },
    { label: "Delivery Unit", value: org.orgDepartment },
    { label: "Email", value: org.adviser?.email },
  ];

  const requirements = [
    {
      name: "Joint Statement",
      status: accreditationData.JointStatement?.status || "Not Submitted",
    },
    {
      name: "Pledge Against Hazing",
      status: accreditationData.PledgeAgainstHazing?.status || "Not Submitted",
    },
    {
      name: "Constitution And By-Laws",
      status:
        accreditationData.ConstitutionAndByLaws?.status || "Not Submitted",
    },
    {
      name: "Roster Members",
      status: accreditationData.Roster?.overAllStatus || "Incomplete",
    },
    {
      name: "President Profile",
      status:
        accreditationData.PresidentProfile?.overAllStatus || "Not Submitted",
    },
    {
      name: "Financial Report",
      status: accreditationData.FinancialReport?.isActive
        ? "Active"
        : "Inactive",
    },
  ];

  const completedRequirements = requirements.filter((req) =>
    ["approved", "submitted", "active", "complete"].includes(
      req.status?.toLowerCase()
    )
  ).length;

  const totalRequirements = requirements.length;
  const progressPercentage =
    totalRequirements > 0
      ? Math.round((completedRequirements / totalRequirements) * 100)
      : 0;

  const formatMonth = (dateString) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  // Group data by month
  const monthlyDataMap = {};

  financialGago.collections?.forEach((item) => {
    const month = formatMonth(item.date);
    if (!monthlyDataMap[month]) {
      monthlyDataMap[month] = { month, collections: 0, reimbursements: 0, disbursements: 0 };
    }
    monthlyDataMap[month].collections += item.amount;
  });

  financialGago.reimbursements?.forEach((item) => {
    const month = formatMonth(item.date);
    if (!monthlyDataMap[month]) {
      monthlyDataMap[month] = { month, collections: 0, reimbursements: 0, disbursements: 0 };
    }
    monthlyDataMap[month].reimbursements += item.amount;
  });

  financialGago.disbursements?.forEach((item) => {
    const month = formatMonth(item.date);
    if (!monthlyDataMap[month]) {
      monthlyDataMap[month] = { month, collections: 0, reimbursements: 0, disbursements: 0 };
    }
    monthlyDataMap[month].disbursements += item.amount;
  });


const financialChartData = Object.values(monthlyDataMap)
  .map(d => ({
    ...d,
    collections: d.collections || 0,
    reimbursements: d.reimbursements || 0,
    disbursements: d.disbursements || 0,
  }))
  .sort((a, b) => new Date(a.month) - new Date(b.month));

// console.log("Chart Data", financialChartData);


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
              {/* Org Logo + Name */}
              <div className="flex items-center gap-x-3 w-1/2">
                <img
                  src={`${DOCU_API_ROUTER}/${displayOrg._id}/${displayOrg.orgLogo}`}
                  alt={displayOrg.orgAcronym}
                  className="h-20 w-20 object-contain"
                />
                <h1 className="text-3xl font-bold">
                  {displayOrg.orgName}{" "}
                  <span className="text-gray-600">
                    ({displayOrg.orgAcronym})
                  </span>
                </h1>
              </div>

              <div className="w-1/2 space-y-1">
                <div className="flex justify-between items-center font-semibold">
                  <h2 className="text-lg">Accreditation Status</h2>
                  <span className="text-gray-700">
                    {displayOrg.overAllStatus}
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
                  <span className="text-black">
                    {displayOrg.orgPresident || "Not yet available"}
                  </span>
                </div>
                <div className="w-full h-1/2 rounded-md p-2 bg-gray-200 flex flex-col">
                  <span className="text-gray-500 text-[12px]">Adviser</span>
                  <span className="text-black">{org.adviser?.name}</span>
                </div>
              </div>
            </div>

            <div className="w-full h-75 flex items-center justify-between  text-gray-500">
                <div className="w-[47.5%] h-75 flex-wrap flex flex-col">
                    <h1 className="text-lg text-black font-semibold mb-1">Upcoming Activities</h1>

                    <div className=" grid grid-cols-3 pb-1 border-b-1 ">
                        {[{label:"Title"},{label:"Venue"},{label:"Date"}].map(({label},idx)=>{
                            return(
                            <div key={idx} className="pl-2">
                                <h1>{label}</h1>
                            </div>
                            )
                        })}

                    </div>
<div className="w-full h-57 flex flex-col overflow-y-auto">
  {activities.map((act, idx) => (
    <div
      key={ idx}
      className="grid grid-cols-3 py-2 text-sm text-black hover:bg-gray-300 cursor-pointer"
    >
      <div className="pl-2 capitalize">{act.ProposedIndividualActionPlan.activityTitle}</div>
      <div className="pl-2 capitalize">{act.ProposedIndividualActionPlan.venue}</div>
      <div className="pl-2">
        {new Date(act.ProposedIndividualActionPlan.proposedDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </div>
    </div>
  ))}
</div>

                </div>
                <div className="w-[51%] h-75 bg-white rounded-md  flex flex-col">
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
          <div>President Info for {displayOrg.orgName}</div>
        )}
        {tab === "Roster of Members" && <div>Roster of Members here…</div>}
        {tab === "Documents" && <div>Documents list here…</div>}
      </div>
    </>
  );
}


export function OrgAccreditation({ org }) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Accreditation</h2>
      <p>
        {org.isAllowedForAccreditation
          ? "This organization is allowed for accreditation."
          : "Not allowed for accreditation."}
      </p>
    </div>
  );
}

export function OrgActivities({ org }) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Activities</h2>
      <p>Activities will go here for {org.orgAcronym}.</p>
    </div>
  );
}

export function OrgFinancial({ org }) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Financial Statement</h2>
      <p>No financial records yet for {org.orgAcronym}.</p>
    </div>
  );
}


export function OrgAccomplishments({ org }) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Accomplishment Records</h2>
      <p>No accomplishment records yet for {org.orgAcronym}.</p>
    </div>
  );
}
