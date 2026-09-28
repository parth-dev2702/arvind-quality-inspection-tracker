import React from 'react';
import { Search, Filter, ArrowUpDown, Calendar, CheckCircle2, AlertTriangle, Cpu, Tag, FileText, Check } from 'lucide-react';

export default function InspectionList({
  inspections,
  loading,
  filters,
  onFilterChange,
  onResetFilters,
  onResolveClick,
  onLogNewClick
}) {
  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
      case 'Major':
        return 'bg-amber-100 text-amber-800 border-amber-200 font-semibold';
      case 'Minor':
        return 'bg-blue-100 text-blue-800 border-blue-200 font-medium';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Resolved') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold';
    }
    return 'bg-rose-50 text-rose-700 border-rose-300 font-bold animate-pulse-slow';
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden my-4">

      {/* Header & Main Action Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span>Inspection Log Records</span>
            <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-semibold">
              {inspections.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500">Filter, search, and manage fabric quality logs</p>
        </div>

        {/* Primary Log Button */}
        <button
          onClick={onLogNewClick}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg shadow transition flex items-center justify-center space-x-2 active:scale-[0.99]"
        >
          <span className="text-lg leading-none">+</span>
          <span>Log Inspection</span>
        </button>
      </div>

      {/* Filter & Controls Panel */}
      <div className="p-3 sm:p-4 bg-slate-100/50 border-b border-slate-200 space-y-3">

        {/* Row 1: Search & Sorting */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">

          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search machine, defect type, remarks or code..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-2">
            <div className="relative w-full">
              <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <select
                value={filters.sortBy}
                onChange={(e) => onFilterChange('sortBy', e.target.value)}
                className="w-full pl-8 pr-2 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="severity">Sort by Severity</option>
                <option value="machine">Sort by Machine</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
            <button
              onClick={() => onFilterChange('sortOrder', filters.sortOrder === 'desc' ? 'asc' : 'desc')}
              className="bg-white border border-slate-300 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shrink-0"
              title="Toggle Sort Order"
            >
              {filters.sortOrder === 'desc' ? 'DESC' : 'ASC'}
            </button>
          </div>

        </div>

        {/* Row 2: Severity, Status & Date Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">

          {/* Severity Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Severity</label>
            <select
              value={filters.severity}
              onChange={(e) => onFilterChange('severity', e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical Only</option>
              <option value="Major">Major Only</option>
              <option value="Minor">Minor Only</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open Only</option>
              <option value="Resolved">Resolved Only</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">From Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onFilterChange('startDate', e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">To Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => onFilterChange('endDate', e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>

        {/* Reset Filters button if any filter is active */}
        {(filters.severity !== 'all' || filters.status !== 'all' || filters.search || filters.startDate || filters.endDate) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={onResetFilters}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
            >
              Clear All Filters
            </button>
          </div>
        )}

      </div>

      {/* Inspections Cards List (Mobile 390px First!) */}
      <div className="p-3 sm:p-4 bg-slate-50/30">

        {loading ? (
          <div className="space-y-3 py-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-slate-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : inspections.length === 0 ? (
          <div className="text-center py-12 px-4">
            <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No Inspection Logs Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No defect logs match your current filter parameters. Try adjusting the search query or date filters.
            </p>
            <button
              onClick={onResetFilters}
              className="mt-3 text-xs bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-300"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {inspections.map((item) => (
              <div
                key={item.id}
                className={`bg-white border rounded-xl p-3.5 sm:p-4 shadow-xs transition-all ${item.status === 'Open'
                    ? item.severity === 'Critical'
                      ? 'border-rose-300 hover:border-rose-400 bg-rose-50/10'
                      : 'border-slate-300 hover:border-slate-400'
                    : 'border-emerald-200 bg-emerald-50/10'
                  }`}
              >
                {/* Header Row: Code, Date & Source */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {item.inspection_code}
                    </span>
                    {item.source === 'sap_webhook' && (
                      <span className="flex items-center space-x-1 bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        <Cpu className="w-3 h-3" />
                        <span>SAP Webhook</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(item.date)}</span>
                  </div>
                </div>

                {/* Main Machine & Defect Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {item.machine_line_id}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs font-semibold text-slate-700 flex items-center space-x-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span>{item.defect_type}</span>
                      </span>
                    </div>
                  </div>

                  {/* Badges: Severity & Status */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getSeverityBadge(item.severity)}`}>
                      {item.severity}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Remarks Section */}
                {item.remarks && (
                  <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700">
                    <span className="font-bold text-slate-800">Remarks: </span>
                    <span>{item.remarks}</span>
                  </div>
                )}

                {/* Resolution Details if Resolved */}
                {item.status === 'Resolved' && (
                  <div className="mt-2 text-xs bg-emerald-50/80 border border-emerald-200 p-2.5 rounded-lg text-emerald-900">
                    <div className="flex items-center justify-between font-bold text-emerald-800 mb-1">
                      <span className="flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Resolution Note</span>
                      </span>
                      {item.resolved_at && (
                        <span className="text-[10px] text-emerald-700 font-normal">
                          {formatDate(item.resolved_at)} ({item.resolved_by || 'Supervisor'})
                        </span>
                      )}
                    </div>
                    <p className="text-slate-800">{item.resolution_note}</p>
                  </div>
                )}

                {/* Action Footer for Open Inspections */}
                {item.status === 'Open' && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => onResolveClick(item)}
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-xs transition flex items-center justify-center space-x-1.5 active:scale-[0.98]"
                    >
                      <Check className="w-4 h-4" />
                      <span>Mark as Resolved</span>
                    </button>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
