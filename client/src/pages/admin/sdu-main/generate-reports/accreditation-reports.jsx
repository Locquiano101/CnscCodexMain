import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_ROUTER } from "../../../../config/api.js";
import { FilterPanel } from "../../../../components/filter-panel.jsx";
import { SortableTable } from "../../../../components/sortable-table.jsx";
import { exportAccreditationToPDF } from "../../../../utils/export-reports.js";
import { FileDown } from "lucide-react";
import { Button } from "../../../../components/ui/button.jsx";
import { Card, CardContent } from "../../../../components/ui/card.jsx";
import { Badge } from "../../../../components/ui/badge.jsx";
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert.jsx";
import { AlertCircle } from "lucide-react";

export function AccreditationReportsView() {
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
        const response = await axios.get(`${API_ROUTER}/getAllAccreditationId`);
        setData(response.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching accreditation data:", err);
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
      if (item.calculatedAccreditationStatus) {
        statuses.add(item.calculatedAccreditationStatus);
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
      // Status filter (using calculated accreditation status)
      if (filters.status && item.calculatedAccreditationStatus !== filters.status) {
        return false;
      }

      // Department filter
      if (
        filters.department &&
        item.organizationProfile?.orgDepartment !== filters.department
      ) {
        return false;
      }

      // Date range filter (based on createdAt or updatedAt)
      if (filters.dateFrom) {
        const itemDate = new Date(item.createdAt || item.updatedAt);
        const fromDate = new Date(filters.dateFrom);
        if (itemDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const itemDate = new Date(item.createdAt || item.updatedAt);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (itemDate > toDate) return false;
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

  // Table columns based on the Word document format
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
      key: "overallStatus",
      label: "Status",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => {
        const status = row.overallStatus || "Pending";
        const statusColors = {
          Active: "bg-green-100 text-green-800",
          Inactive: "bg-gray-100 text-gray-800",
          Pending: "bg-yellow-100 text-yellow-800",
          Approved: "bg-green-100 text-green-800",
          Rejected: "bg-red-100 text-red-800",
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
    {
      key: "organizationProfile.adviser.name",
      label: "Adviser/s",
      render: (row) => {
        const adviser = row.organizationProfile?.adviser;
        if (!adviser) return "-";
        // Handle if adviser is populated as an object
        if (typeof adviser === 'object' && adviser.name) {
          return adviser.name;
        }
        // Handle if it's just the ID string
        return adviser.toString ? adviser.toString() : "-";
      },
    },
    {
      key: "PresidentProfile.name",
      label: "President",
      render: (row) => {
        const president = row.PresidentProfile;
        // Handle null/undefined or unpopulated reference
        if (!president || typeof president !== 'object') return "-";
        // Handle populated president object
        if (president.name) return president.name;
        // Fallback to ID if name not available
        return president._id ? `ID: ${president._id.toString().slice(-6)}` : "-";
      },
    },
    {
      key: "updatedAt",
      label: "Validity",
      className: "text-center text-xs",
      headerClassName: "text-center",
      render: (row) => {
        // Use updatedAt as validation start date, add 1 year for end date
        if (row.updatedAt) {
          const startDate = new Date(row.updatedAt);
          const endDate = new Date(row.updatedAt);
          endDate.setFullYear(endDate.getFullYear() + 1);
          
          const formatDate = (date) => {
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
            return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
          };
          
          return (
            <div className="text-xs">
              <div>{formatDate(startDate)}</div>
              <div className="text-gray-400">to</div>
              <div>{formatDate(endDate)}</div>
            </div>
          );
        }
        return "N/A";
      },
    },
    {
      key: "accomplishmentData.firstSemPoints",
      label: "1st Sem",
      className: "text-center font-medium",
      headerClassName: "text-center",
      render: (row) => {
        const points = row.accomplishmentData?.firstSemPoints || 0;
        const hasNoSemesterData = points === 0 && row.accomplishmentData?.secondSemPoints === 0 && row.accomplishmentData?.grandTotal > 0;
        
        if (hasNoSemesterData) {
          return <span className="text-gray-400 text-xs">No dates</span>;
        }
        
        return (
          <span className="text-blue-600 font-semibold">
            {points > 0 ? points.toFixed(1) : "0"}
          </span>
        );
      },
    },
    {
      key: "accomplishmentData.secondSemPoints",
      label: "2nd Sem",
      className: "text-center font-medium",
      headerClassName: "text-center",
      render: (row) => {
        const points = row.accomplishmentData?.secondSemPoints || 0;
        const hasNoSemesterData = points === 0 && row.accomplishmentData?.firstSemPoints === 0 && row.accomplishmentData?.grandTotal > 0;
        
        if (hasNoSemesterData) {
          return <span className="text-gray-400 text-xs">No dates</span>;
        }
        
        return (
          <span className="text-blue-600 font-semibold">
            {points > 0 ? points.toFixed(1) : "0"}
          </span>
        );
      },
    },
    {
      key: "accomplishmentData.grandTotal",
      label: "Total",
      className: "text-center font-bold text-blue-600",
      headerClassName: "text-center",
      render: (row) => {
        const total = row.accomplishmentData?.grandTotal || 0;
        return total > 0 ? total.toFixed(1) : "0";
      },
    },
    {
      key: "calculatedAccreditationStatus",
      label: "Status of Accreditation",
      className: "text-center",
      headerClassName: "text-center",
      render: (row) => {
        const status = row.calculatedAccreditationStatus || "No Data";
        const points = row.accomplishmentData?.grandTotal || 0;
        
        let variant = "outline";
        
        if (points >= 90) {
          variant = "default"; // Outstanding and Fully Accredited - purple/primary
        } else if (points >= 70) {
          variant = "approved"; // Eligible for Renewal - green
        } else if (points >= 69) {
          variant = "pending"; // Under Probation - yellow
        } else if (points > 0) {
          variant = "rejected"; // Ineligible for Renewal - red
        }
        
        return (
          <div className="flex flex-col items-center gap-1">
            <Badge variant={variant} className="text-xs">
              {status}
            </Badge>
            {points > 0 && (
              <span className="text-xs text-muted-foreground">
                ({points.toFixed(1)} pts)
              </span>
            )}
          </div>
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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading data</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Export Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Accreditation Report</h2>
        <Button
          onClick={() => exportAccreditationToPDF(sortedData, filters)}
          disabled={sortedData.length === 0}
          className="gap-2"
        >
          <FileDown className="w-4 h-4" />
          Export PDF
        </Button>
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
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Organizations</p>
            <p className="text-3xl font-bold mt-2">{data.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Filtered Results</p>
            <p className="text-3xl font-bold text-primary mt-2">
              {sortedData.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Outstanding & Fully Accredited</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {data.filter((d) => (d.accomplishmentData?.grandTotal || 0) >= 90).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Eligible for Renewal</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {data.filter((d) => {
                const pts = d.accomplishmentData?.grandTotal || 0;
                return pts >= 70 && pts < 90;
              }).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <SortableTable
        columns={columns}
        data={sortedData}
        sortConfig={sortConfig}
        onSort={setSortConfig}
        loading={loading}
        emptyMessage="No accreditation records found"
      />
    </div>
  );
}
