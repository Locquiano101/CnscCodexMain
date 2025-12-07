import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_ROUTER } from "../../../../config/api.js";
import { FilterPanel } from "../../../../components/filter-panel.jsx";
import { SortableTable } from "../../../../components/sortable-table.jsx";
import { exportAccomplishmentToPDF } from "../../../../utils/export-reports.js";
import { FileDown } from "lucide-react";

export function RQATReportView() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    specialization: "",
    dateFrom: "",
    dateTo: "",
  });

  // Sort state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });

  // Fetch data (using mock data for demo)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const response = await axios.get(`${API_ROUTER}/rqatReport`);
        setData(response.data || []);

        setData(response.data);
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
    const specializations = new Set();

    data.forEach((item) => {
      if (item.specialization) {
        specializations.add(item.specialization);
      }
    });

    return {
      specializations: Array.from(specializations).map((s) => ({
        value: s,
        label: s,
      })),
    };
  }, [data]);

  // Apply filters
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Specialization filter
      if (
        filters.specialization &&
        item.specialization !== filters.specialization
      ) {
        return false;
      }

      // Date range filter (if you add createdAt/updatedAt fields later)
      if (filters.dateFrom || filters.dateTo) {
        const itemDate = new Date(item.createdAt || item.accreditedSince);

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
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

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

  // Table columns (updated to match actual data structure)
  const columns = [
    {
      key: "index",
      label: "No.",
      sortable: false,
      className: "text-center font-medium",
      headerClassName: "text-center",
      render: (row, idx) => idx + 1,
    },
    {
      key: "organizationName",
      label: "Name of the Organization",
      render: (row) => (
        <div className="font-medium text-gray-900">
          {row.organizationName || "N/A"}
        </div>
      ),
    },
    {
      key: "specialization",
      label: "Specialization",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => row.specialization || "-",
    },
    {
      key: "yearsOfExistence",
      label: "Years of Existence",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => row.yearsOfExistence ?? "-",
    },
    {
      key: "accreditedSince",
      label: "Accredited Since",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => {
        if (!row.accreditedSince) return "-";

        const date = new Date(row.accreditedSince);
        return date.toLocaleString("en-US", {
          month: "long",
          year: "numeric",
        });
      },
    },
    {
      key: "officers",
      label: "Total Officers",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => row.officers?.length || 0,
    },
    {
      key: "adviserName",
      label: "Adviser",
      render: (row) => row.adviserName || "-",
    },
    {
      key: "presidentName",
      label: "President",
      render: (row) => row.presidentName || "-",
    },
    {
      key: "specializationFeeCollected",
      label: "Fee Collected",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => (
        <span className="font-medium">
          ₱{(row.specializationFeeCollected || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "programsUndertaken",
      label: "Programs",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => row.programsUndertaken?.length || 0,
    },
  ];

  const handleClearFilters = () => {
    setFilters({
      specialization: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalOfficers = data.reduce(
      (sum, org) => sum + (org.officers?.length || 0),
      0
    );
    const totalPrograms = data.reduce(
      (sum, org) => sum + (org.programsUndertaken?.length || 0),
      0
    );
    const totalFees = data.reduce(
      (sum, org) => sum + (org.specializationFeeCollected || 0),
      0
    );

    return {
      totalOfficers,
      totalPrograms,
      totalFees,
    };
  }, [data]);

  const exportToPDF = () => {
    alert("PDF export functionality would be implemented here");
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">Error loading data</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full p-6 bg-gray-50 min-h-screen">
      {/* Header with Export Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Accreditation Report
        </h2>
        <div className="flex gap-2">
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={sortedData.length === 0}
          >
            <FileDown className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <FilterPanel
        specializationOptions={filterOptions.specializations}
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
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
          <p className="text-sm text-gray-600">Total Officers</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {stats.totalOfficers}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Fees Collected</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            ₱{stats.totalFees.toLocaleString()}
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
