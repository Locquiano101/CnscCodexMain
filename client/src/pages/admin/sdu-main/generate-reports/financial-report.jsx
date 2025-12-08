import { API_ROUTER } from "@/App";
import axios from "axios";
import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  X,
  FileDown,
} from "lucide-react";
import { exportFinancialReportToPDF } from "@/utils/export-reports";

export function FinancialReportsView() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    status: "",
    department: "",
    dateFrom: "",
    dateTo: "",
    sdg: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_ROUTER}/getFinancialReportWithRosterMembers`,
          {
            withCredentials: true,
          }
        );

        console.log("Fetched data:", response.data);
        // Ensure we always set an array
        setData(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load financial report data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate collectible vs actual for each organization
  const processedData = useMemo(() => {
    return data.map((item) => {
      const expected = (item.approvedFee || 0) * (item.payees || 0);
      const collected = item.collectedAmount || 0;
      const variance = collected - expected;

      const rate = expected > 0 ? (collected / expected) * 100 : 0;

      let status = "Equal";
      if (variance > 0) status = "Over";
      else if (variance < 0) status = "Under";

      return {
        ...item,
        totalCollectible: expected,
        totalCollected: collected,
        variance,
        collectionRate: rate,
        status,
      };
    });
  }, [data]);

  // Filter data
  const filteredData = useMemo(() => {
    return processedData.filter((item) => {
      if (
        filters.department &&
        item.organizationProfile?.orgDepartment !== filters.department
      ) {
        return false;
      }
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      // Add date filters if needed
      if (filters.dateFrom || filters.dateTo) {
        // Assuming there's a date field in the data
        // You'll need to adjust this based on your actual data structure
        const itemDate = item.date ? new Date(item.date) : null;
        if (filters.dateFrom && new Date(filters.dateFrom) > itemDate)
          return false;
        if (filters.dateTo && new Date(filters.dateTo) < itemDate) return false;
      }
      return true;
    });
  }, [processedData, filters]);

  // Extract unique departments
  const departments = useMemo(() => {
    const depts = new Set();
    data.forEach((item) => {
      if (item.organizationProfile?.orgDepartment) {
        depts.add(item.organizationProfile.orgDepartment);
      }
    });
    return Array.from(depts).sort();
  }, [data]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalExpected = filteredData.reduce(
      (sum, item) => sum + item.totalCollectible,
      0
    );
    const totalActual = filteredData.reduce(
      (sum, item) => sum + item.totalCollected,
      0
    );
    const totalVariance = totalActual - totalExpected;
    const overallCollectionRate =
      totalExpected > 0 ? (totalActual / totalExpected) * 100 : 0;

    const statusCounts = filteredData.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalExpected,
      totalActual,
      totalVariance,
      overallCollectionRate,
      statusCounts,
    };
  }, [filteredData]);

  const handleClearFilters = () => {
    setFilters({
      department: "",
      status: "",
      dateFrom: "",
      dateTo: "",
      sdg: "",
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      Over: "bg-green-100 text-green-800",
      Under: "bg-red-100 text-red-800",
      Equal: "bg-blue-100 text-blue-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    if (status === "Over") return <TrendingUp className="w-4 h-4" />;
    if (status === "Under") return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading financial report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">{error}</p>
          <p className="text-sm mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Accomplishment Report
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing {filteredData.length} of {data.length} organizations
          </p>
        </div>
        <button
          onClick={() =>
            exportFinancialReportToPDF(
              filteredData,
              filters,
              "FINANCIAL REPORT"
            )
          }
          disabled={filteredData.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileDown className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Collection Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Over">Over-collected</option>
              <option value="Equal">Equal</option>
              <option value="Under">Under-collected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
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
              To Date
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
          <div className="md:col-span-4 flex justify-end">
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Expected</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ₱{stats.totalExpected.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Average: ₱
            {filteredData.length > 0
              ? (stats.totalExpected / filteredData.length).toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2 }
                )
              : "0.00"}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Collected</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            ₱{stats.totalActual.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Average: ₱
            {filteredData.length > 0
              ? (stats.totalActual / filteredData.length).toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2 }
                )
              : "0.00"}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Variance</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              stats.totalVariance > 0
                ? "text-green-600"
                : stats.totalVariance < 0
                ? "text-red-600"
                : "text-gray-900"
            }`}
          >
            {stats.totalVariance >= 0 ? "+" : ""}₱
            {stats.totalVariance.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.totalVariance > 0
              ? "Surplus"
              : stats.totalVariance < 0
              ? "Deficit"
              : "Balanced"}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Collection Rate</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {stats.overallCollectionRate.toFixed(1)}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full ${
                stats.overallCollectionRate >= 100
                  ? "bg-green-500"
                  : stats.overallCollectionRate >= 80
                  ? "bg-green-400"
                  : stats.overallCollectionRate >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{
                width: `${Math.min(stats.overallCollectionRate, 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">
          Status Distribution
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="border border-green-200 bg-green-50 rounded p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-green-700">Over-collected</p>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xl font-bold text-green-800 mt-1">
              {stats.statusCounts.Over || 0}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {filteredData.length > 0
                ? (
                    ((stats.statusCounts.Over || 0) / filteredData.length) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </p>
          </div>
          <div className="border border-blue-200 bg-blue-50 rounded p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-blue-700">Equal</p>
              <Minus className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-blue-800 mt-1">
              {stats.statusCounts.Equal || 0}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {filteredData.length > 0
                ? (
                    ((stats.statusCounts.Equal || 0) / filteredData.length) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </p>
          </div>
          <div className="border border-red-200 bg-red-50 rounded p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-red-700">Under-collected</p>
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-xl font-bold text-red-800 mt-1">
              {stats.statusCounts.Under || 0}
            </p>
            <p className="text-xs text-red-600 mt-1">
              {filteredData.length > 0
                ? (
                    ((stats.statusCounts.Under || 0) / filteredData.length) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  President
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Expected Amount
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Collected Amount
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Variance
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Collection Rate
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    {data.length === 0
                      ? "No data available"
                      : "No records match your filters"}
                  </td>
                </tr>
              ) : (
                filteredData.map((org) => (
                  <tr key={org._id || org.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {org.date
                          ? new Date(org.date).toLocaleDateString("en-US", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {org.organization || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {org.organizationProfile?.orgAcronym || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">
                      {org.president || "???"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      ₱
                      {org.totalCollectible.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-blue-600">
                      ₱
                      {org.totalCollected.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td
                      className={`px-4 py-3 text-right text-sm font-medium ${
                        org.variance > 0
                          ? "text-green-600"
                          : org.variance < 0
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {org.variance >= 0 ? "+" : ""}₱
                      {org.variance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {org.collectionRate.toFixed(1)}%
                        </span>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 max-w-[80px]">
                          <div
                            className={`h-1.5 rounded-full ${
                              org.collectionRate >= 100
                                ? "bg-green-500"
                                : org.collectionRate >= 80
                                ? "bg-green-400"
                                : org.collectionRate >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(org.collectionRate, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusBadge(
                          org.status
                        )}`}
                      >
                        {getStatusIcon(org.status)}
                        {org.status === "Over"
                          ? "Over"
                          : org.status === "Under"
                          ? "Under"
                          : "Equal"}
                      </span>
                    </td>
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
