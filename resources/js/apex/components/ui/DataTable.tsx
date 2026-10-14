import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Trash2,
} from 'lucide-react';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { Dropdown } from './Dropdown';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  isLoading?: boolean;
  title?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  onBulkDelete?: (selectedKeys: string[]) => void;
  customFilters?: React.ReactNode;
  actions?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  initialPageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  isLoading = false,
  title,
  searchPlaceholder = 'Search records...',
  searchable = true,
  selectable = true,
  onRowClick,
  onBulkDelete,
  customFilters,
  actions,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filter parameters.',
  initialPageSize = 10,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map(c => c.key));

  // Search filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(term)
      )
    );
  }, [data, searchTerm]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const result = aVal > bVal ? 1 : -1;
      return sortDirection === 'asc' ? result : -result;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Handle Sort
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Row selection
  const isAllSelected = paginatedData.length > 0 && paginatedData.every(row => selectedKeys.includes(String(row[keyField])));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const paginatedKeySet = new Set(paginatedData.map(r => String(r[keyField])));
      setSelectedKeys(prev => prev.filter(k => !paginatedKeySet.has(k)));
    } else {
      const keysToAdd = paginatedData.map(r => String(r[keyField]));
      setSelectedKeys(prev => Array.from(new Set([...prev, ...keysToAdd])));
    }
  };

  const toggleSelectRow = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Export CSV mock
  const handleExportCSV = () => {
    const headers = columns.filter(c => visibleColumns.includes(c.key)).map(c => c.header).join(',');
    const rows = sortedData.map(row =>
      columns
        .filter(c => visibleColumns.includes(c.key))
        .map(c => `"${String(row[c.key] ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeColumns = columns.filter(c => visibleColumns.includes(c.key));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Table Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {title && <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">{title}</h3>}
          {selectedKeys.length > 0 && (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-md text-xs font-medium border border-indigo-200 dark:border-indigo-800/60">
              <span>{selectedKeys.length} selected</span>
              {onBulkDelete && (
                <button
                  onClick={() => {
                    onBulkDelete(selectedKeys);
                    setSelectedKeys([]);
                  }}
                  className="hover:text-rose-600 flex items-center gap-1 ml-1 text-slate-500 hover:dark:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Search, Filter & Actions Toolbar */}
        <div className="flex items-center flex-wrap gap-2.5">
          {searchable && (
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={searchPlaceholder}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          {customFilters}

          {/* Column Visibility Selector */}
          <Dropdown
            align="right"
            trigger={
              <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                Columns
              </Button>
            }
            items={columns.map(c => ({
              label: `${visibleColumns.includes(c.key) ? '✓ ' : '   '}${c.header}`,
              onClick: () => {
                setVisibleColumns(prev =>
                  prev.includes(c.key)
                    ? prev.length > 1
                      ? prev.filter(k => k !== c.key)
                      : prev
                    : [...prev, c.key]
                );
              },
            }))}
          />

          {/* Export Button */}
          <Button variant="outline" size="sm" onClick={handleExportCSV} leftIcon={<Download className="w-3.5 h-3.5" />}>
            Export
          </Button>

          {actions}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold tracking-wide">
              {selectable && (
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
              )}
              {activeColumns.map(col => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`py-3 px-4 select-none ${
                      col.sortable ? 'cursor-pointer hover:text-slate-800 dark:hover:text-slate-200' : ''
                    } ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                  >
                    <div className={`inline-flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : ''}`}>
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-slate-400">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  {selectable && (
                    <td className="py-3.5 px-4 text-center">
                      <Skeleton className="w-4 h-4 mx-auto" />
                    </td>
                  )}
                  {activeColumns.map(col => (
                    <td key={col.key} className="py-3.5 px-4">
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={activeColumns.length + (selectable ? 1 : 0)} className="py-12">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const rowKey = String(row[keyField]);
                const isSelected = selectedKeys.includes(rowKey);

                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors duration-100 ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${
                      isSelected
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {selectable && (
                      <td className="py-3 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={e => toggleSelectRow(rowKey, e as any)}
                          className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                    )}
                    {activeColumns.map(col => (
                      <td
                        key={col.key}
                        className={`py-3.5 px-4 text-slate-700 dark:text-slate-300 ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        }`}
                      >
                        {col.render ? col.render(row, index) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && sortedData.length > 0 && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 text-xs focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
            <span className="hidden sm:inline text-slate-400 ml-2">|</span>
            <span className="hidden sm:inline">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
