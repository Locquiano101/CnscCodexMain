import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_ROUTER } from "../../../../config/api.js";
import { FilterPanel } from "../../../../components/filter-panel.jsx";
import { SortableTable } from "../../../../components/sortable-table.jsx";
import { 
  exportAccomplishmentToPDF, 
  exportAccomplishmentToExcel 
} from "../../../../utils/export-reports.js";
import { FileDown, FileSpreadsheet } from "lucide-react";

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

  // Table columns
  const columns = [
    {
      key: "index",
      label: "No.",
      sortable: false,
      className: "text-center font-medium",
      headerClassName: "text-center",
      render: (row, index) => index + 1,
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
      key: "organizationProfile.orgClass",
      label: "Nature",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => row.organizationProfile?.orgClass || "-",
    },
    {
      key: "organizationProfile.orgDepartment",
      label: "Department",
      render: (row) => row.organizationProfile?.orgDepartment || "-",
    },
    {
      key: "accomplishmentCount",
      label: "Total Accomplishments",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => (
        <span className="font-medium">
          {row.accomplishments?.length || 0}
        </span>
      ),
    },
    {
      key: "grandTotal",
      label: "Total Points",
      className: "text-center font-medium",
      headerClassName: "text-center",
      render: (row) => (
        <span className="text-blue-600 font-bold">
          {row.grandTotal || 0}
        </span>
      ),
    },
    {
      key: "categories",
      label: "Categories",
      render: (row) => {
        const categories = new Set();
        row.accomplishments?.forEach((acc) => {
          if (acc.category) categories.add(acc.category);
        });
        const categoryList = Array.from(categories);
        
        if (categoryList.length === 0) return "-";
        
        return (
          <div className="flex flex-wrap gap-1">
            {categoryList.slice(0, 3).map((cat, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded"
              >
                {cat}
              </span>
            ))}
            {categoryList.length > 3 && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                +{categoryList.length - 3}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "organizationProfile.status",
      label: "Status",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => {
        const status = row.organizationProfile?.status || "N/A";
        const statusColors = {
          Active: "bg-green-100 text-green-800",
          Inactive: "bg-gray-100 text-gray-800",
          Pending: "bg-yellow-100 text-yellow-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </span>
        );
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
    <div className="space-y-4">
      {/* Header with Export Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Accomplishment Report</h2>
        <div className="flex gap-2">
          <button
            onClick={() => exportAccomplishmentToPDF(sortedData, filters)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            disabled={sortedData.length === 0}
          >
            <FileDown className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={() => exportAccomplishmentToExcel(sortedData, filters)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            disabled={sortedData.length === 0}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
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
      />
    </div>
  );
}
