import React, { useState, useEffect, useMemo } from "react";
import { FileDown, Filter, X } from "lucide-react";
import { API_ROUTER } from "@/App";
import axios from "axios";
import { exportActionPlanToPDF } from "@/utils/export-reports";

export function CalendarReportsView() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState({
    status: "",
    department: "",
    dateFrom: "",
    dateTo: "",
    sdg: "",
  });

  // Sort state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${API_ROUTER}/getAllProposalConduct`,
          { withCredentials: true }
        );

        setLoading(false);
        console.log(response.data);
        // Ensure we always set an array
        setData(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        setData([]);
      }
    };

    fetchData();
  }, []);
  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const statuses = new Set();
    const departments = new Set();
    const sdgs = new Set();

    data.forEach((item) => {
      if (item.overallStatus) {
        statuses.add(item.overallStatus);
      }
      if (item.organizationProfile?.orgDepartment) {
        departments.add(item.organizationProfile.orgDepartment);
      }
      if (item.ProposedIndividualActionPlan?.alignedSDG) {
        item.ProposedIndividualActionPlan.alignedSDG.forEach((sdg) => {
          if (typeof sdg === "string") {
            try {
              const parsed = JSON.parse(sdg);
              parsed.forEach((s) => sdgs.add(s));
            } catch {
              sdgs.add(sdg);
            }
          }
        });
      }
    });

    return {
      statuses: Array.from(statuses).map((s) => ({ value: s, label: s })),
      departments: Array.from(departments).map((d) => ({ value: d, label: d })),
      sdgs: Array.from(sdgs)
        .sort()
        .map((s) => ({ value: s, label: s })),
    };
  }, [data]);

  // Apply filters
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Status filter
      if (filters.status && item.overallStatus !== filters.status) {
        return false;
      }

      // Department filter
      if (
        filters.department &&
        item.organizationProfile?.orgDepartment !== filters.department
      ) {
        return false;
      }

      // SDG filter
      if (filters.sdg) {
        const sdgs = item.ProposedIndividualActionPlan?.alignedSDG || [];
        let hasSDG = false;
        sdgs.forEach((sdg) => {
          if (typeof sdg === "string") {
            try {
              const parsed = JSON.parse(sdg);
              if (parsed.includes(filters.sdg)) hasSDG = true;
            } catch {
              if (sdg === filters.sdg) hasSDG = true;
            }
          }
        });
        if (!hasSDG) return false;
      }

      // Date range filter (using proposed date)
      if (filters.dateFrom || filters.dateTo) {
        const itemDate = new Date(
          item.ProposedIndividualActionPlan?.proposedDate
        );

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

      if (sortConfig.key.includes(".")) {
        const keys = sortConfig.key.split(".");
        aValue = keys.reduce((obj, key) => obj?.[key], a);
        bValue = keys.reduce((obj, key) => obj?.[key], b);
      } else {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      }

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortConfig.direction === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  }, [filteredData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: "",
      department: "",
      dateFrom: "",
      dateTo: "",
      sdg: "",
    });
  };

  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalBudget = data.reduce(
      (sum, item) =>
        sum + (item.ProposedIndividualActionPlan?.budgetaryRequirements || 0),
      0
    );
    const filteredBudget = sortedData.reduce(
      (sum, item) =>
        sum + (item.ProposedIndividualActionPlan?.budgetaryRequirements || 0),
      0
    );

    const statusCounts = sortedData.reduce((acc, item) => {
      const status = item.overallStatus || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalBudget,
      filteredBudget,
      statusCounts,
    };
  }, [data, sortedData]);

  // Table columns
  const columns = [
    {
      key: "organizationProfile.orgAcronym",
      label: "Org Acronym",
      className: "text-center font-medium",
      headerClassName: "text-center",
      render: (row) => row.organizationProfile?.orgAcronym || "-",
    },
    {
      key: "organizationProfile.orgName",
      label: "Organization Name",
      render: (row) => (
        <div className="font-medium text-gray-900">
          {row.organizationProfile?.orgName || "N/A"}
        </div>
      ),
    },
    {
      key: "ProposedIndividualActionPlan.activityTitle",
      label: "Activity Title",
      render: (row) => (
        <div className="max-w-xs">
          {row.ProposedIndividualActionPlan?.activityTitle || "N/A"}
        </div>
      ),
    },
    {
      key: "ProposedIndividualActionPlan.proposedDate",
      label: "Proposed Date",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => {
        const d = row.ProposedIndividualActionPlan?.proposedDate
          ? new Date(row.ProposedIndividualActionPlan.proposedDate)
          : null;
        return d
          ? d.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "-";
      },
    },
    {
      key: "ProposedIndividualActionPlan.venue",
      label: "Venue",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => row.ProposedIndividualActionPlan?.venue || "-",
    },
    {
      key: "ProposedIndividualActionPlan.budgetaryRequirements",
      label: "Budget",
      className: "text-right",
      headerClassName: "text-right",
      render: (row) => {
        const budget = row.ProposedIndividualActionPlan?.budgetaryRequirements;
        return budget != null ? `₱${budget.toLocaleString()}` : "-";
      },
    },
    {
      key: "ProposedIndividualActionPlan.alignedSDG",
      label: "Aligned SDGs",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => {
        const sdgs = row.ProposedIndividualActionPlan?.alignedSDG || [];
        let parsed = [];
        sdgs.forEach((sdg) => {
          if (typeof sdg === "string") {
            try {
              parsed = parsed.concat(JSON.parse(sdg));
            } catch {
              parsed.push(sdg);
            }
          }
        });
        return (
          <div className="flex flex-wrap gap-1 justify-center">
            {parsed.slice(0, 3).map((sdg, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded"
              >
                {sdg}
              </span>
            ))}
            {parsed.length > 3 && (
              <span className="text-xs text-gray-500">
                +{parsed.length - 3}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "overallStatus",
      label: "Status",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => {
        const status = row.overallStatus || "Unknown";
        const statusColors = {
          Pending: "bg-yellow-100 text-yellow-800",
          "Conduct Approved": "bg-green-100 text-green-800",
          "Approved by the Adviser": "bg-blue-100 text-blue-800",
          "Approved by the SDU": "bg-purple-100 text-purple-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              statusColors[status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "organizationProfile.orgDepartment",
      label: "Department",
      className: "text-center text-sm",
      headerClassName: "text-center",
      render: (row) => row.organizationProfile?.orgDepartment || "-",
    },
    {
      key: "createdAt",
      label: "Submission Date",
      className: "text-center text-sm",
      headerClassName: "text-center",
      render: (row) => {
        const d = row.createdAt ? new Date(row.createdAt) : null;
        return d
          ? d.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "-";
      },
    },
  ];

  return (
    <div className="space-y-4 w-full">
      {/* Header with Export Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Proposed Activities Calendar Report
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() =>
              exportActionPlanToPDF(
                sortedData,
                filters,
                "ACTIVITY CALENDAR REPORT"
              )
            }
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={sortedData.length === 0}
          >
            <FileDown className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              {filterOptions.statuses.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={filters.department}
              onChange={(e) =>
                setFilters({ ...filters, department: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Departments</option>
              {filterOptions.departments.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SDG
            </label>
            <select
              value={filters.sdg}
              onChange={(e) => setFilters({ ...filters, sdg: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All SDGs</option>
              {filterOptions.sdgs.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date To
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Proposals</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Filtered Results</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {sortedData.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Budget</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            ₱{stats.totalBudget.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Filtered Budget</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            ₱{stats.filteredBudget.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(stats.statusCounts).map(([status, count]) => (
            <div key={status} className="border border-gray-200 rounded p-3">
              <p className="text-xs text-gray-600 mb-1">{status}</p>
              <p className="text-xl font-bold text-gray-900">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() =>
                      col.sortable !== false && handleSort(col.key)
                    }
                    className={`px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                      col.headerClassName || ""
                    } ${
                      col.sortable !== false
                        ? "cursor-pointer hover:bg-gray-100"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-1 justify-center">
                      {col.label}
                      {sortConfig.key === col.key && (
                        <span className="text-blue-600">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No proposal records found
                  </td>
                </tr>
              ) : (
                sortedData.map((row, idx) => (
                  <tr key={row._id || idx} className="hover:bg-gray-50">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-sm text-gray-900 ${
                          col.className || ""
                        }`}
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
