/**
 * AdminTableControls — Reusable search, filter, sort, date-range, and pagination for admin lists.
 * Wraps any list of items with client-side filtering, sorting, and pagination.
 */
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight, Filter, ArrowUpDown, ArrowUp, ArrowDown, Calendar } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export type SortDirection = "asc" | "desc";

export interface SortConfig<T> {
  key: string;
  label: string;
  compareFn: (a: T, b: T, direction: SortDirection) => number;
}

export interface DateRangeOption {
  value: string;
  label: string;
  /** Number of days back from now, or 0 for "Any" */
  days: number;
}

interface AdminTableControlsProps<T> {
  /** All items to filter/paginate */
  items: T[];
  /** Function to extract searchable text from an item */
  searchFn: (item: T) => string;
  /** Placeholder for search input */
  searchPlaceholder?: string;
  /** Filter configuration */
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
    getItemValue: (item: T) => string;
  }[];
  /** Sort configuration */
  sorts?: SortConfig<T>[];
  /** Default sort key */
  defaultSortKey?: string;
  /** Default sort direction */
  defaultSortDirection?: SortDirection;
  /** Date range filter configuration */
  dateRange?: {
    label?: string;
    options: DateRangeOption[];
    getItemDate: (item: T) => string | Date | null;
  };
  /** Items per page (default: 15) */
  pageSize?: number;
  /** Render function for the filtered/paginated items */
  children: (items: T[], totalCount: number) => React.ReactNode;
  /** Expose current sort state to parent (for column header rendering) */
  onSortChange?: (key: string, direction: SortDirection) => void;
  /** External sort state (controlled mode) */
  sortKey?: string;
  sortDirection?: SortDirection;
}

export function AdminTableControls<T>({
  items,
  searchFn,
  searchPlaceholder = "Search...",
  filters = [],
  sorts,
  defaultSortKey,
  defaultSortDirection = "desc",
  dateRange,
  pageSize = 15,
  children,
  onSortChange,
  sortKey: controlledSortKey,
  sortDirection: controlledSortDirection,
}: AdminTableControlsProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [internalSortKey, setInternalSortKey] = useState(defaultSortKey || sorts?.[0]?.key || "");
  const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(defaultSortDirection);
  const [dateRangeValue, setDateRangeValue] = useState("any");

  // Use controlled or internal sort state
  const activeSortKey = controlledSortKey ?? internalSortKey;
  const activeSortDirection = controlledSortDirection ?? internalSortDirection;

  // Apply search, filters, date range, and sort
  const filteredItems = useMemo(() => {
    let result = items;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) => searchFn(item).toLowerCase().includes(query));
    }

    // Category filters
    for (const filter of filters) {
      const activeValue = activeFilters[filter.key];
      if (activeValue && activeValue !== "all") {
        result = result.filter((item) => filter.getItemValue(item) === activeValue);
      }
    }

    // Date range filter
    if (dateRange && dateRangeValue !== "any") {
      const option = dateRange.options.find((o) => o.value === dateRangeValue);
      if (option && option.days > 0) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - option.days);
        result = result.filter((item) => {
          const itemDate = dateRange.getItemDate(item);
          if (!itemDate) return false;
          const d = typeof itemDate === "string" ? new Date(itemDate) : itemDate;
          return d >= cutoff;
        });
      }
    }

    // Sort
    if (sorts && activeSortKey) {
      const sortConfig = sorts.find((s) => s.key === activeSortKey);
      if (sortConfig) {
        result = [...result].sort((a, b) => sortConfig.compareFn(a, b, activeSortDirection));
      }
    }

    return result;
  }, [items, searchQuery, activeFilters, searchFn, filters, sorts, activeSortKey, activeSortDirection, dateRange, dateRangeValue]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Reset page when filters change
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSortChange = (key: string) => {
    let newDirection: SortDirection = "desc";
    if (activeSortKey === key) {
      newDirection = activeSortDirection === "desc" ? "asc" : "desc";
    }
    setInternalSortKey(key);
    setInternalSortDirection(newDirection);
    onSortChange?.(key, newDirection);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (value: string) => {
    setDateRangeValue(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Search + Filter Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Filters row */}
        {(filters.length > 0 || dateRange) && (
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            {filters.map((filter) => (
              <div key={filter.key} className="flex gap-1.5 flex-wrap items-center">
                <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div className="flex gap-1 flex-wrap">
                  <Button
                    size="sm"
                    variant={!activeFilters[filter.key] || activeFilters[filter.key] === "all" ? "default" : "outline"}
                    className="h-7 text-xs px-2"
                    onClick={() => handleFilterChange(filter.key, "all")}
                  >
                    All
                  </Button>
                  {filter.options.map((opt) => (
                    <Button
                      key={opt.value}
                      size="sm"
                      variant={activeFilters[filter.key] === opt.value ? "default" : "outline"}
                      className="h-7 text-xs px-2"
                      onClick={() => handleFilterChange(filter.key, opt.value)}
                    >
                      {opt.label}
                      {opt.count !== undefined && (
                        <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                          {opt.count}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            ))}

            {/* Date range filter */}
            {dateRange && (
              <div className="flex gap-1.5 flex-wrap items-center">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div className="flex gap-1 flex-wrap">
                  <Button
                    size="sm"
                    variant={dateRangeValue === "any" ? "default" : "outline"}
                    className="h-7 text-xs px-2"
                    onClick={() => handleDateRangeChange("any")}
                  >
                    {dateRange.label || "Any time"}
                  </Button>
                  {dateRange.options.filter(o => o.days > 0).map((opt) => (
                    <Button
                      key={opt.value}
                      size="sm"
                      variant={dateRangeValue === opt.value ? "default" : "outline"}
                      className="h-7 text-xs px-2"
                      onClick={() => handleDateRangeChange(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sort pills (mobile-friendly alternative to column headers) */}
        {sorts && sorts.length > 0 && (
          <div className="flex gap-1.5 flex-wrap items-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <div className="flex gap-1 flex-wrap">
              {sorts.map((sort) => (
                <Button
                  key={sort.key}
                  size="sm"
                  variant={activeSortKey === sort.key ? "default" : "outline"}
                  className="h-7 text-xs px-2 gap-1"
                  onClick={() => handleSortChange(sort.key)}
                >
                  {sort.label}
                  {activeSortKey === sort.key && (
                    activeSortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredItems.length === items.length
            ? `${items.length} total`
            : `${filteredItems.length} of ${items.length} shown`}
        </span>
        {totalPages > 1 && (
          <span>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Content */}
      {children(paginatedItems, filteredItems.length)}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let page: number;
              if (totalPages <= 7) {
                page = i + 1;
              } else if (currentPage <= 4) {
                page = i + 1;
              } else if (currentPage >= totalPages - 3) {
                page = totalPages - 6 + i;
              } else {
                page = currentPage - 3 + i;
              }
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
