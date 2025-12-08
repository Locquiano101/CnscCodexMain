import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_ROUTER } from "../../../../config/api.js";
import { FilterPanel } from "../../../../components/filter-panel.jsx";
import { SortableTable } from "../../../../components/sortable-table.jsx";
import {
  exportRQATOfficersToPDF,
  exportRQATToPDF,
} from "../../../../utils/export-reports.js";
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
    organizationName: "",
    adviser: "",
    president: "",
    minYearsOfExistence: "",
    maxYearsOfExistence: "",
    minFeeCollected: "",
    maxFeeCollected: "",
    minOfficers: "",
    maxOfficers: "",
    minPrograms: "",
    maxPrograms: "",
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
        console.log(response.data);
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
    const advisers = new Set();
    const presidents = new Set();

    data.forEach((item) => {
      if (item.specialization) {
        specializations.add(item.specialization);
      }
      if (item.adviserName) {
        advisers.add(item.adviserName);
      }
      if (item.presidentName) {
        presidents.add(item.presidentName);
      }
    });

    return {
      specializations: Array.from(specializations).map((s) => ({
        value: s,
        label: s,
      })),
      advisers: Array.from(advisers).map((a) => ({
        value: a,
        label: a,
      })),
      presidents: Array.from(presidents).map((p) => ({
        value: p,
        label: p,
      })),
    };
  }, [data]);

  // Apply filters
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Organization name filter
      if (
        filters.organizationName &&
        !item.organizationName
          ?.toLowerCase()
          .includes(filters.organizationName.toLowerCase())
      ) {
        return false;
      }

      // Specialization filter
      if (
        filters.specialization &&
        item.specialization !== filters.specialization
      ) {
        return false;
      }

      // Adviser filter
      if (filters.adviser && item.adviserName !== filters.adviser) {
        return false;
      }

      // President filter
      if (filters.president && item.presidentName !== filters.president) {
        return false;
      }

      // Years of existence filter
      if (filters.minYearsOfExistence) {
        const minYears = parseInt(filters.minYearsOfExistence);
        if ((item.yearsOfExistence || 0) < minYears) return false;
      }
      if (filters.maxYearsOfExistence) {
        const maxYears = parseInt(filters.maxYearsOfExistence);
        if ((item.yearsOfExistence || 0) > maxYears) return false;
      }

      // Fee collected filter
      if (filters.minFeeCollected) {
        const minFee = parseFloat(filters.minFeeCollected);
        if ((item.specializationFeeCollected || 0) < minFee) return false;
      }
      if (filters.maxFeeCollected) {
        const maxFee = parseFloat(filters.maxFeeCollected);
        if ((item.specializationFeeCollected || 0) > maxFee) return false;
      }

      // Officers count filter
      if (filters.minOfficers) {
        const minOff = parseInt(filters.minOfficers);
        if ((item.officers?.length || 0) < minOff) return false;
      }
      if (filters.maxOfficers) {
        const maxOff = parseInt(filters.maxOfficers);
        if ((item.officers?.length || 0) > maxOff) return false;
      }

      // Programs count filter
      if (filters.minPrograms) {
        const minProg = parseInt(filters.minPrograms);
        if ((item.programsUndertaken?.length || 0) < minProg) return false;
      }
      if (filters.maxPrograms) {
        const maxProg = parseInt(filters.maxPrograms);
        if ((item.programsUndertaken?.length || 0) > maxProg) return false;
      }

      // Date range filter
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
      key: "organizationName",
      label: "Name of the Organization",
      render: (row) => (
        <div className="font-medium text-gray-900">
          {row.organizationName || "N/A"}
        </div>
      ),
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
      key: "specialization",
      label: "Specialization",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => row.specialization || "-",
    },
    {
      key: "officers",
      label: "Total Officers",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => row.officers?.length || 0,
    },
    {
      key: "collectedFeeTitles",
      label: "Collected Fees",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => {
        if (!row.collectedFeeTitles || row.collectedFeeTitles.length === 0)
          return "-";

        // Display as comma-separated
        return row.collectedFeeTitles.length;
      },
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
      organizationName: "",
      adviser: "",
      president: "",
      minYearsOfExistence: "",
      maxYearsOfExistence: "",
      minFeeCollected: "",
      maxFeeCollected: "",
      minOfficers: "",
      maxOfficers: "",
      minPrograms: "",
      maxPrograms: "",
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">Error loading data</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full min-h-screen">
      {/* Header with Export Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Accreditation Report
        </h2>
        <div className="flex gap-2">
          {/* Export Overall PDF */}
          <button
            onClick={() => exportRQATToPDF(sortedData, filters, "RQAT REPORT")}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={sortedData.length === 0}
          >
            <FileDown className="w-4 h-4" />
            Export Overall PDF
          </button>

          {/* Export Officers Only PDF */}
          <button
            onClick={() =>
              exportRQATOfficersToPDF(
                sortedData,
                filters,
                "RQAT OFFICERS REPORT"
              )
            }
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
            disabled={sortedData.length === 0}
          >
            <FileDown className="w-4 h-4" />
            Export PDF (Student Officers Only)
          </button>
        </div>
      </div>

      {/* Filters */}
      <FilterPanel
        specializationOptions={filterOptions.specializations}
        adviserOptions={filterOptions.advisers}
        presidentOptions={filterOptions.presidents}
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
