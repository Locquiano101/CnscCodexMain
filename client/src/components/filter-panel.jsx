import React, { useState } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * FilterPanel Component
 * 
 * A reusable filter panel that supports multiple filter types:
 * - Status dropdown (single select)
 * - Department multi-select
 * - Date range picker
 * 
 * @param {Object} props
 * @param {Array} props.statusOptions - Array of status options [{value, label}]
 * @param {Array} props.departmentOptions - Array of department options [{value, label}]
 * @param {Object} props.filters - Current filter state
 * @param {Function} props.onFilterChange - Callback when filters change
 * @param {Function} props.onClearFilters - Callback to clear all filters
 * @param {Boolean} props.showDateRange - Whether to show date range picker
 * @param {Boolean} props.showDepartment - Whether to show department filter
 * @param {String} props.departmentLabel - Custom label for department field
 */
export function FilterPanel({
  statusOptions = [],
  departmentOptions = [],
  filters = {},
  onFilterChange,
  onClearFilters,
  showDateRange = true,
  showDepartment = true,
  departmentLabel = "Department",
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFilterChange = (filterName, value) => {
    onFilterChange({ ...filters, [filterName]: value });
  };

  const hasActiveFilters = Object.values(filters).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== "" && value !== null && value !== undefined;
  });

  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (Array.isArray(value) && value.length > 0) return count + 1;
    if (value && value !== "" && value !== null) return count + 1;
    return count;
  }, 0);

  return (
    <Card className="mb-6">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </div>

      {/* Filter Controls */}
      {isExpanded && (
        <CardContent className="pt-0 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {/* Status Filter */}
            {statusOptions.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={filters.status || "all"}
                  onValueChange={(value) => handleFilterChange("status", value === "all" ? "" : value)}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Department/Nature Filter */}
            {showDepartment && departmentOptions.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="department-filter">{departmentLabel}</Label>
                <Select
                  value={filters.department || "all"}
                  onValueChange={(value) => handleFilterChange("department", value === "all" ? "" : value)}
                >
                  <SelectTrigger id="department-filter">
                    <SelectValue placeholder={`All ${departmentLabel}s`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All {departmentLabel}s</SelectItem>
                    {departmentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date Range Filter */}
            {showDateRange && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="date-from">Date From</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={filters.dateFrom || ""}
                    onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-to">Date To</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={filters.dateTo || ""}
                    onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="gap-1"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
