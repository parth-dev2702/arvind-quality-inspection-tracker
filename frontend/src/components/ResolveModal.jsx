import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Check } from 'lucide-react';

export default function ResolveModal({ inspection, isOpen, onClose, onSubmit, submitting }) {
  const [resolutionNote, setResolutionNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !inspection) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!resolutionNote.trim()) {
      setError('Resolution note is mandatory to mark an inspection as resolved');
      return;
    }
    setError('');
    onSubmit(inspection.id, resolutionNote.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-bold text-base">Resolve Inspection Defect</h3>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-full hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Defect Preview Banner */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-800">{inspection.inspection_code}</span>
              <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">
                {inspection.severity} Severity
              </span>
            </div>
            <p className="font-bold text-slate-900">{inspection.machine_line_id}</p>
            <p className="text-slate-600">Defect: {inspection.defect_type}</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold p-2.5 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Mandatory Resolution Note Field */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Mandatory Resolution Note <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Describe corrective actions taken (e.g. yarn beam replaced, loom recalibrated, tension re-set, affected segment discarded)..."
              value={resolutionNote}
              onChange={(e) => {
                setResolutionNote(e.target.value);
                if (e.target.value.trim()) setError('');
              }}
              className="w-full p-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>Must provide action log for auditing</span>
              <span>{resolutionNote.length} chars</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <span>Updating...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm Resolution</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
