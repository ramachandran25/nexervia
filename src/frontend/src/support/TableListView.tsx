import { useMemo, useState } from "react";
import type { TableConfig, TableSortConfig } from "@/types/support";

export type TableFiltersState = Record<string, string>;

export interface TableListViewProps<TRecord extends { id: string }> {
  tableConfig: TableConfig;
  rows: TRecord[];
  totalCount: number;
  loading?: boolean;
  errorMessage?: string;

  page?: number;
  pageSize?: number;
  sort?: TableSortConfig;
  filters?: TableFiltersState;

  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSortChange?: (sort: TableSortConfig) => void;
  onFiltersChange?: (filters: TableFiltersState) => void;

  onRowClick?: (record: TRecord) => void;
  onNewClick?: () => void;
  onRefreshClick?: () => void;
  onExportClick?: () => void;
}

function getCellDisplayValue(record: Record<string, unknown>, key: string): string {
  const raw = record[key];

  if (raw == null) return "";

  if (raw instanceof Date) {
    return raw.toLocaleString();
  }

  if (typeof raw === "string") {
    // Heuristic: format common ISO datetime strings nicely
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw)) {
      const date = new Date(raw);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleString();
      }
    }

    return raw;
  }

  if (typeof raw === "number" || typeof raw === "boolean") {
    return String(raw);
  }

  return "";
}

function sortRows<TRecord extends { id: string }>(
  rows: TRecord[],
  sort?: TableSortConfig
): TRecord[] {
  if (!sort || !sort.columnKey) return rows;

  const { columnKey, direction } = sort;
  const factor = direction === "desc" ? -1 : 1;

  return [...rows].sort((a, b) => {
    const av = (a as Record<string, unknown>)[columnKey];
    const bv = (b as Record<string, unknown>)[columnKey];

    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;

    if (av === bv) return 0;

    if (typeof av === "number" && typeof bv === "number") {
      return (av - bv) * factor;
    }

    const as = String(av).toLowerCase();
    const bs = String(bv).toLowerCase();

    if (as < bs) return -1 * factor;
    if (as > bs) return 1 * factor;
    return 0;
  });
}

function getInitialSort(config: TableConfig): TableSortConfig | undefined {
  return config.list.defaultSort;
}

export function TableListView<TRecord extends { id: string }>({
  tableConfig,
  rows,
  totalCount,
  loading,
  errorMessage,
  page,
  pageSize,
  sort,
  filters,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onFiltersChange,
  onRowClick,
  onNewClick,
  onRefreshClick,
  onExportClick,
}: TableListViewProps<TRecord>) {
  const listConfig = tableConfig.list;

  // Allow the component to be used in both controlled and semi-controlled modes.
  const [localSort, setLocalSort] = useState<TableSortConfig | undefined>(() => getInitialSort(tableConfig));
  const [localFilters, setLocalFilters] = useState<TableFiltersState>({});
  const [localPage, setLocalPage] = useState<number>(1);
  const [localPageSize, setLocalPageSize] = useState<number>(listConfig.defaultPageSize ?? 25);

  const activeSort = sort ?? localSort;
  const activeFilters = filters ?? localFilters;
  const currentPage = page ?? localPage;
  const currentPageSize = pageSize ?? localPageSize;

  const sortedRows = useMemo(() => sortRows(rows, activeSort), [rows, activeSort]);

  const pageCount = Math.max(1, Math.ceil(totalCount / currentPageSize));
  const clampedPage = Math.min(currentPage, pageCount);

  const pagedRows = useMemo(() => {
    const start = (clampedPage - 1) * currentPageSize;
    const end = start + currentPageSize;
    return sortedRows.slice(start, end);
  }, [sortedRows, clampedPage, currentPageSize]);

  const handleSortClick = (columnKey: string, sortable?: boolean) => {
    if (!sortable) return;

    const current = activeSort?.columnKey === columnKey ? activeSort : undefined;
    const nextDirection: TableSortConfig["direction"] =
      current?.direction === "asc" ? "desc" : "asc";

    const nextSort: TableSortConfig = {
      columnKey,
      direction: nextDirection,
    };

    setLocalSort(nextSort);
    onSortChange?.(nextSort);
  };

  const handleFilterChange = (key: string, value: string) => {
    const nextFilters: TableFiltersState = {
      ...(activeFilters ?? {}),
      [key]: value,
    };

    setLocalFilters(nextFilters);
    onFiltersChange?.(nextFilters);
  };

  const handlePageChangeInternal = (nextPage: number) => {
    const safePage = Math.min(Math.max(1, nextPage), pageCount);
    setLocalPage(safePage);
    onPageChange?.(safePage);
  };

  const handlePageSizeChangeInternal = (nextSize: number) => {
    const safeSize = nextSize > 0 ? nextSize : 10;
    setLocalPageSize(safeSize);
    setLocalPage(1);
    onPageSizeChange?.(safeSize);
  };

  const from = totalCount === 0 ? 0 : (clampedPage - 1) * currentPageSize + 1;
  const to = Math.min(totalCount, clampedPage * currentPageSize);

  return (
    <div className="flex flex-col h-full">
      {/* Header: title, description, actions */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{tableConfig.name}</h1>
          {tableConfig.description && (
            <p className="text-xs text-gray-500 mt-1 max-w-2xl">{tableConfig.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefreshClick}
            className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={onExportClick}
            className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Export
          </button>
          <button
            type="button"
            onClick={onNewClick}
            className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700"
          >
            New
          </button>
        </div>
      </div>

      {/* Filters row */}
      {listConfig.filters && listConfig.filters.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3 items-end">
          {listConfig.filters.map((filter) => {
            const value = activeFilters?.[filter.key] ?? "";

            if (filter.type === "search") {
              return (
                <div key={filter.key} className="flex-1 min-w-[220px]">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {filter.label}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    placeholder={filter.placeholder}
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              );
            }

            if (filter.type === "select") {
              return (
                <div key={filter.key} className="w-40">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {filter.label}
                  </label>
                  <select
                    value={value}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All</option>
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}

      {/* Table container */}
      <div className="flex-1 flex flex-col border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="flex-1 overflow-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {listConfig.columns.map((column) => {
                  const isActive = activeSort?.columnKey === column.key;
                  const sortDirection = isActive ? activeSort?.direction : undefined;

                  return (
                    <th
                      key={column.key}
                      scope="col"
                      className={`text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide border-b border-gray-200 px-3 py-2 bg-gray-50 ${
                        column.widthClass ?? ""
                      } ${column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left"}`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSortClick(column.key, column.sortable)}
                        className={`flex items-center gap-1 select-none ${
                          column.align === "right"
                            ? "justify-end"
                            : column.align === "center"
                              ? "justify-center"
                              : "justify-start"
                        } ${column.sortable ? "cursor-pointer hover:text-gray-900" : "cursor-default"}`}
                      >
                        <span>{column.label}</span>
                        {column.sortable && (
                          <span className="text-[10px] text-gray-400">
                            {sortDirection === "asc" && "▲"}
                            {sortDirection === "desc" && "▼"}
                            {!sortDirection && "▵▿"}
                          </span>
                        )}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={listConfig.columns.length}
                    className="px-3 py-4 text-center text-xs text-gray-500 border-b border-gray-100"
                  >
                    Loading records…
                  </td>
                </tr>
              )}

              {!loading && errorMessage && (
                <tr>
                  <td
                    colSpan={listConfig.columns.length}
                    className="px-3 py-4 text-center text-xs text-red-600 border-b border-red-100 bg-red-50"
                  >
                    {errorMessage}
                  </td>
                </tr>
              )}

              {!loading && !errorMessage && pagedRows.length === 0 && (
                <tr>
                  <td
                    colSpan={listConfig.columns.length}
                    className="px-3 py-6 text-center text-xs text-gray-500"
                  >
                    No records found. Adjust filters or try a different search.
                  </td>
                </tr>
              )}

              {!loading &&
                !errorMessage &&
                pagedRows.map((record) => (
                  <tr
                    key={record.id}
                    onClick={() => onRowClick?.(record)}
                    className="text-xs text-gray-800 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    {listConfig.columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-3 py-2 border-b border-gray-100 whitespace-nowrap ${
                          column.align === "right"
                            ? "text-right"
                            : column.align === "center"
                              ? "text-center"
                              : "text-left"
                        }`}
                      >
                        {getCellDisplayValue(record as Record<string, unknown>, column.key)}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Footer: pagination & summary */}
        <div className="h-[44px] border-t border-gray-200 bg-gray-50 flex items-center justify-between px-3">
          <div className="text-[11px] text-gray-600">
            Showing{" "}
            <span className="font-medium text-gray-900">
              {from.toLocaleString()}–{to.toLocaleString()}
            </span>{" "}
            of <span className="font-medium text-gray-900">{totalCount.toLocaleString()}</span>{" "}
            records
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[11px] text-gray-600">
              <span>Rows per page</span>
              <select
                value={currentPageSize}
                onChange={(e) => handlePageSizeChangeInternal(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={clampedPage <= 1}
                onClick={() => handlePageChangeInternal(clampedPage - 1)}
                className="px-2 py-1 text-[11px] border border-gray-300 rounded-md bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Prev
              </button>
              <span className="text-[11px] text-gray-600">
                Page{" "}
                <span className="font-medium text-gray-900">
                  {clampedPage.toLocaleString()} / {pageCount.toLocaleString()}
                </span>
              </span>
              <button
                type="button"
                disabled={clampedPage >= pageCount}
                onClick={() => handlePageChangeInternal(clampedPage + 1)}
                className="px-2 py-1 text-[11px] border border-gray-300 rounded-md bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

