import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

/**
 * SortableTable Component
 * 
 * A reusable table component with sortable columns
 * 
 * @param {Object} props
 * @param {Array} props.columns - Array of column definitions [{key, label, sortable, render, className}]
 * @param {Array} props.data - Array of data objects to display
 * @param {Object} props.sortConfig - Current sort configuration {key, direction}
 * @param {Function} props.onSort - Callback when column header is clicked
 * @param {String} props.emptyMessage - Message to display when no data
 * @param {Boolean} props.loading - Whether data is loading
 * @param {String} props.className - Additional className for table container
 */
export function SortableTable({
  columns = [],
  data = [],
  sortConfig = { key: null, direction: null },
  onSort,
  emptyMessage = "No data available",
  loading = false,
  className = "",
}) {
  const handleSort = (columnKey) => {
    if (!columnKey) return;

    let direction = "asc";
    if (sortConfig.key === columnKey && sortConfig.direction === "asc") {
      direction = "desc";
    }

    onSort({ key: columnKey, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }

    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-blue-600" />
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider ${
                    column.sortable !== false
                      ? "cursor-pointer hover:bg-gray-100 select-none"
                      : ""
                  } ${column.headerClassName || ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable !== false && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row._id || row.id || rowIndex}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={`${rowIndex}-${column.key}`}
                      className={`px-4 py-3 text-sm ${column.className || ""}`}
                    >
                      {column.render
                        ? column.render(row, rowIndex)
                        : row[column.key] || "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with row count */}
      {data.length > 0 && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{data.length}</span> {data.length === 1 ? "result" : "results"}
          </p>
        </div>
      )}
    </div>
  );
}
