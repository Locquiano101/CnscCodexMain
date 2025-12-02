import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_ROUTER } from "../../../../config/api.js";
import { FilterPanel } from "../../../../components/filter-panel.jsx";
import { SortableTable } from "../../../../components/sortable-table.jsx";
import { 
  exportAccomplishmentToPDF
} from "../../../../utils/export-reports.js";
import { FileDown } from "lucide-react";

export function AccomplishmentReportsView() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    status: "",
    department: "",
    dateFrom: "",
    dateTo: "",
  });

  // Sort state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_ROUTER}/getAccomplishmentAll`);
        setData(response.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching accomplishment data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const statuses = new Set();
    const departments = new Set();

    data.forEach((item) => {
      if (item.organizationProfile?.status) {
        statuses.add(item.organizationProfile.status);
      }
      if (item.organizationProfile?.orgDepartment) {
        departments.add(item.organizationProfile.orgDepartment);
      }
    });

    return {
      statuses: Array.from(statuses).map((s) => ({ value: s, label: s })),
      departments: Array.from(departments).map((d) => ({ value: d, label: d })),
    };
  }, [data]);

  // Apply filters
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Status filter
      if (
        filters.status &&
        item.organizationProfile?.status !== filters.status
      ) {
        return false;
      }

      // Department filter
      if (
        filters.department &&
        item.organizationProfile?.orgDepartment !== filters.department
      ) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const itemDate = new Date(item.createdAt || item.updatedAt);

        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          if (itemDate < fromDate) return false;
        }

        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (itemDate > toDate) return false;
        }
      }

      return true;
    });
  }, [data, filters]);

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      let aValue, bValue;

      // Handle nested properties
      if (sortConfig.key.includes(".")) {
        const keys = sortConfig.key.split(".");
        aValue = keys.reduce((obj, key) => obj?.[key], a);
        bValue = keys.reduce((obj, key) => obj?.[key], b);
      } else {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      }

      // Handle null/undefined
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // String comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Numeric comparison
      if (sortConfig.direction === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  }, [filteredData, sortConfig]);

  // Table columns (updated to required fields)
  const columns = [
    {
      key: "index",
      label: "Org ID No.",
      sortable: false,
      className: "text-center font-medium",
      headerClassName: "text-center",
      render: (row) => row.organizationProfile?.orgID || row.organizationProfile?._id || "-",
    },
    {
      key: "organizationProfile.orgName",
      label: "Name of the Organization",
      render: (row) => (
        <div className="font-medium text-gray-900">
          {row.organizationProfile?.orgName || "N/A"}
        </div>
      ),
    },
    {
      key: "organizationProfile.orgClass",
      label: "Nature",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => row.organizationProfile?.orgClass || "-",
    },
    {
      key: "calculatedAccreditationStatus",
      label: "Status of Accreditation",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => {
        // Fallback: derive status from APESOC total when calculatedAccreditationStatus is missing
        let status = row.calculatedAccreditationStatus;
        if (!status) {
          const pts = row.accomplishmentData?.grandTotal || 0;
          if (pts >= 90) status = "Outstanding & Fully Accredited";
          else if (pts >= 70) status = "Eligible for Renewal";
          else status = "Ineligible for Renewal";
        }
        const statusColors = {
          "Outstanding & Fully Accredited": "text-purple-800",
          "Eligible for Renewal": " text-blue-800",
          "Ineligible for Renewal": "text-gray-800",
          Pending: "bg-yellow-100 text-yellow-800",
        };
        return (
          <span
            className={`px-2 py-1  text-xs font-medium ${
              statusColors[status] || "text-gray-800"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "organizationProfile.totalMembers",
      label: "Total Members",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => {
        // Support multiple possible sources for members count
        const fromProfile = row.organizationProfile?.totalMembers;
        const fromCount = row.organizationProfile?.membersCount ?? row.membersCount;
        const fromArrayLen = Array.isArray(row.organizationProfile?.members)
          ? row.organizationProfile.members.length
          : undefined;
        const fromRosterLen = Array.isArray(row.organizationProfile?.roster?.members)
          ? row.organizationProfile.roster.members.length
          : Array.isArray(row.roster?.members)
          ? row.roster.members.length
          : undefined;
        const fromMemberListLen = Array.isArray(row.organizationProfile?.memberList)
          ? row.organizationProfile.memberList.length
          : undefined;
        const fromTopLevel = row.totalMembers;
        const value = fromTopLevel ?? fromProfile ?? fromCount ?? fromArrayLen ?? fromRosterLen ?? fromMemberListLen;
        return value != null ? value : "-";
      },
    },
    {
      key: "organizationProfile.totalOfficers",
      label: "Total No. of Officers",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => {
        // Support multiple possible sources for officers count
        const fromProfile = row.organizationProfile?.totalOfficers;
        const fromCount = row.organizationProfile?.officersCount ?? row.officersCount;
        const fromArrayLen = Array.isArray(row.organizationProfile?.officers)
          ? row.organizationProfile.officers.length
          : undefined;
        const fromRosterLen = Array.isArray(row.organizationProfile?.roster?.officers)
          ? row.organizationProfile.roster.officers.length
          : Array.isArray(row.roster?.officers)
          ? row.roster.officers.length
          : undefined;
        const fromOfficerListLen = Array.isArray(row.organizationProfile?.officerList)
          ? row.organizationProfile.officerList.length
          : undefined;
        const fromTopLevel = row.totalOfficers;
        const value = fromTopLevel ?? fromProfile ?? fromCount ?? fromArrayLen ?? fromRosterLen ?? fromOfficerListLen;
        return value != null ? value : "-";
      },
    },
    {
      key: "organizationProfile.adviser.name",
      label: "Adviser/s",
      render: (row) => {
        // Prefer top-level provided name if present
        if (row.adviserName) return row.adviserName;
        const adviser = row.organizationProfile?.adviser;
        if (!adviser) return "-";
        if (typeof adviser === "object" && adviser.name) return adviser.name;
        return adviser.toString ? adviser.toString() : "-";
      },
    },
    {
      key: "PresidentProfile.name",
      label: "President",
      render: (row) => {
        if (row.presidentName) return row.presidentName;
        const president = row.organizationProfile?.orgPresident;
        if (!president || typeof president !== "object") return "-";
        return president.name || (president._id ? `ID: ${president._id.toString().slice(-6)}` : "-");
      },
    },
    {
      key: "accomplishmentData.grandTotal",
      label: "APESOC Results (Total)",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => {
        const total = row.accomplishmentData?.grandTotal || 0;
        return (
          <span className="font-bold text-blue-600">{total}</span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date of Submission",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => {
        const d = row.createdAt ? new Date(row.createdAt) : null;
        return d ? d.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) : "-";
      },
    },
    {
      key: "updatedAt",
      label: "Validity of Accreditation",
      className: "text-center text-xs",
      headerClassName: "text-center",
      render: (row) => {
        const sourceDate = row.updatedAt || row.organizationProfile?.updatedAt || row.organizationProfile?.createdAt;
        if (sourceDate) {
          const startDate = new Date(sourceDate);
          const endDate = new Date(sourceDate);
          endDate.setFullYear(endDate.getFullYear() + 1);
          const fmt = (date) => {
            const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
          };
          return (
            <div className="text-xs">
              <div>{fmt(startDate)}</div>
              <div className="text-gray-400">to</div>
              <div>{fmt(endDate)}</div>
            </div>
          );
        }
        return "N/A";
      },
    },
  ];

  const handleClearFilters = () => {
    setFilters({
      status: "",
      department: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalAccomplishments = data.reduce(
      (sum, org) => sum + (org.accomplishments?.length || 0),
      0
    );
    const totalPoints = data.reduce((sum, org) => sum + (org.grandTotal || 0), 0);
    const filteredPoints = sortedData.reduce(
      (sum, org) => sum + (org.grandTotal || 0),
      0
    );

    return {
      totalAccomplishments,
      totalPoints,
      filteredPoints,
    };
  }, [data, sortedData]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">Error loading data</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* Header with Export Buttons */}
      <div className="flex justify-between items-center">
  <h2 className="text-2xl font-bold tracking-tight">Accreditation Report</h2>
        <div className="flex gap-2">
          <button
            onClick={() => exportAccomplishmentToPDF(sortedData, filters)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            disabled={sortedData.length === 0}
          >
            <FileDown className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <FilterPanel
        statusOptions={filterOptions.statuses}
        departmentOptions={filterOptions.departments}
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
        showDateRange={true}
        showDepartment={true}
        departmentLabel="Department"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Organizations</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Filtered Results</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {sortedData.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Accomplishments</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {stats.totalAccomplishments}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Filtered Points</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {stats.filteredPoints.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}

      <SortableTable
        columns={columns}
        data={sortedData}
        sortConfig={sortConfig}
        onSort={setSortConfig}
        loading={loading}
        emptyMessage="No accomplishment records found"
        className="w-full"
      />


    </div>
  );
}
