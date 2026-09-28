import React, { useState, useMemo } from 'react';
import { Search, Plus, Calendar, Check, ChevronLeft, ChevronRight } from 'lucide-react';

export default function InspectionTable({
  inspections,
  loading,
  filters,
  onFilterChange,
  onResetFilters,
  onResolveClick,
  onLogNewClick,
  title = "Recent Inspections"
}) {
  // Pagination State (Default 10 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reset to page 1 whenever filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [filters, inspections]);

  // Paginated Slice
  const totalItems = inspections.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedInspections = useMemo(() => {
    return inspections.slice(startIndex, endIndex);
  }, [inspections, startIndex, endIndex]);

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical':
        return (
          <span className="inline-flex items-center space-x-1 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
            <span>Critical</span>
          </span>
        );
      case 'Major':
        return (
          <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
            <span>Major</span>
          </span>
        );
      case 'Minor':
        return (
          <span className="inline-flex items-center space-x-1 bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0"></span>
            <span>Minor</span>
          </span>
        );
      default:
        return <span className="whitespace-nowrap">{severity}</span>;
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Resolved') {
      return (
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
          Resolved
        </span>
      );
    }
    return (
      <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
        Open
      </span>
    );
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoStr;
    }
  };

  const formatCode = (code) => {
    if (!code) return '';
    if (code.startsWith('INS-SAP-')) {
      const parts = code.split('-');
      return `SAP-${parts[parts.length - 1]}`;
    }
    return code;
  };

  const parseMachineInfo = (raw) => {
    if (!raw) return { name: '-', plant: '' };
    const match = raw.match(/^(.*?)(?:\s*\((.*?)\))?$/);
    if (match) {
      return {
        name: match[1].trim(),
        plant: match[2] ? match[2].trim() : ''
      };
    }
    return { name: raw, plant: '' };
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden w-full min-w-0">
      
      {/* Controls Header Bar */}
      <div className="p-4 border-b border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">
            {title}
          </h2>

          <button
            onClick={onLogNewClick}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Log New Inspection</span>
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          
          {/* Search Box */}
          <div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search machine, defect..."
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={filters.severity}
              onChange={(e) => onFilterChange('severity', e.target.value)}
              className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs font-medium"
            >
              <option value="all">All Severity</option>
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs font-medium"
            >
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onFilterChange('startDate', e.target.value)}
              className="w-full p-1.5 pr-7 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs"
            />
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
          </div>

        </div>
      </div>

      {/* Desktop & Tablet View (Scrollable Table) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 border-collapse min-w-[720px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
              <th className="py-3 px-3 w-[110px]">#</th>
              <th className="py-3 px-3 w-[95px]">Date</th>
              <th className="py-3 px-3 min-w-[160px]">Machine / Line</th>
              <th className="py-3 px-3 min-w-[110px]">Defect Type</th>
              <th className="py-3 px-3 w-[95px]">Severity</th>
              <th className="py-3 px-3 w-[85px]">Status</th>
              <th className="py-3 px-3 min-w-[140px]">Remarks</th>
              <th className="py-3 px-3 text-center w-[90px]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Loading inspections...
                </td>
              </tr>
            ) : paginatedInspections.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No inspection records found.
                </td>
              </tr>
            ) : (
              paginatedInspections.map((item) => {
                const machineInfo = parseMachineInfo(item.machine_line_id);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap" title={item.inspection_code}>
                      {formatCode(item.inspection_code)}
                    </td>

                    <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                      {formatDate(item.date)}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800" title={machineInfo.name}>
                        {machineInfo.name}
                      </div>
                      {machineInfo.plant && (
                        <div className="text-[10px] text-slate-400 font-medium" title={machineInfo.plant}>
                          {machineInfo.plant}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                      {item.defect_type}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {getSeverityBadge(item.severity)}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="py-3 px-3 text-slate-600 max-w-[180px] truncate" title={item.remarks}>
                      {item.remarks || '-'}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {item.status === 'Open' ? (
                        <button
                          onClick={() => onResolveClick(item)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold text-[11px] shadow-2xs transition inline-flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Resolve</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium italic">Done</span>
                      )}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View (390px Optimized Touch Card List) */}
      <div className="md:hidden p-3 space-y-3">
        {loading ? (
          <div className="py-6 text-center text-slate-400 text-xs">Loading...</div>
        ) : paginatedInspections.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">No records found</div>
        ) : (
          paginatedInspections.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-900">{item.inspection_code}</span>
                <div className="flex items-center space-x-1.5">
                  {getSeverityBadge(item.severity)}
                  {getStatusBadge(item.status)}
                </div>
              </div>

              <div className="text-xs">
                <div className="font-bold text-slate-900 text-sm">{item.machine_line_id}</div>
                <div className="text-slate-500 font-medium mt-0.5">{item.defect_type} · {formatDate(item.date)}</div>
              </div>

              {item.remarks && (
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {item.remarks}
                </div>
              )}

              {item.status === 'Open' && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => onResolveClick(item)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1 active:scale-98"
                  >
                    <Check className="w-4 h-4" />
                    <span>Resolve Defect</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer Controls (Default 10 items per page) */}
      {totalItems > 0 && (
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{startIndex + 1}</span> to{' '}
            <span className="font-bold text-slate-800">{endIndex}</span> of{' '}
            <span className="font-bold text-slate-800">{totalItems}</span> inspections
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                  currentPage === p
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
