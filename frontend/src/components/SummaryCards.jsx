import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SummaryCards({ summaryData, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5 animate-pulse">
        <div className="h-24 bg-slate-200 rounded-2xl"></div>
        <div className="h-24 bg-slate-200 rounded-2xl"></div>
        <div className="h-24 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  const summary = summaryData?.summary || {
    Critical: { open: 0, resolved: 0, total: 0 },
    Major: { open: 0, resolved: 0, total: 0 },
    Minor: { open: 0, resolved: 0, total: 0 }
  };

  const totals = summaryData?.totals || {
    totalOpen: 0,
    totalResolved: 0,
    grandTotal: 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
      
      {/* 1. Open Inspections Card */}
      <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <div className="text-3xl font-extrabold text-slate-900 leading-tight">
            {totals.totalOpen}
          </div>
          <div className="text-xs font-semibold text-rose-700 mt-1">
            Open Inspections
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 fill-rose-600 text-rose-100" />
        </div>
      </div>

      {/* 2. Resolved Inspections Card */}
      <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <div className="text-3xl font-extrabold text-slate-900 leading-tight">
            {totals.totalResolved}
          </div>
          <div className="text-xs font-semibold text-emerald-700 mt-1">
            Resolved Inspections
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-emerald-100" />
        </div>
      </div>

      {/* 3. Inspections by Severity Breakdown Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
          <span>Inspections by Severity</span>
          <span className="text-[10px] text-slate-400 font-medium">(Open / Resolved)</span>
        </div>

        <div className="space-y-1.5 text-xs">
          
          {/* Critical */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              <span className="font-semibold text-slate-700">Critical</span>
            </div>
            <span className="font-mono font-bold text-slate-800">
              {summary.Critical.open} / {summary.Critical.resolved}
            </span>
          </div>

          {/* Major */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              <span className="font-semibold text-slate-700">Major</span>
            </div>
            <span className="font-mono font-bold text-slate-800">
              {summary.Major.open} / {summary.Major.resolved}
            </span>
          </div>

          {/* Minor */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>
              <span className="font-semibold text-slate-700">Minor</span>
            </div>
            <span className="font-mono font-bold text-slate-800">
              {summary.Minor.open} / {summary.Minor.resolved}
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}
