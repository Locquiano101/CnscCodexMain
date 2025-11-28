import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

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
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
    }

    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-4 h-4 text-primary" />
    ) : (
      <ArrowDown className="w-4 h-4 text-primary" />
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Spinner className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-2 text-muted-foreground">Loading data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  className={cn(
                    column.sortable !== false && "cursor-pointer hover:bg-accent select-none",
                    column.headerClassName
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="uppercase tracking-wider">{column.label}</span>
                    {column.sortable !== false && getSortIcon(column.key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground py-8"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow key={row._id || row.id || rowIndex}>
                  {columns.map((column) => (
                    <TableCell
                      key={`${rowIndex}-${column.key}`}
                      className={column.className}
                    >
                      {column.render
                        ? column.render(row, rowIndex)
                        : row[column.key] || "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Footer with row count */}
      {data.length > 0 && (
        <CardFooter className="bg-muted/50 px-4 py-3 border-t">
          <p className="text-sm text-foreground">
            Showing <span className="font-medium">{data.length}</span> {data.length === 1 ? "result" : "results"}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
