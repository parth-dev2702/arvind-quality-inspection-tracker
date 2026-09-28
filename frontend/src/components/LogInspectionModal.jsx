import React, { useState } from 'react';
import { X, Calendar, AlertTriangle, Tag, Check, Factory } from 'lucide-react';

const DEFECT_TYPES = [
  'Weave Defect',
  'Shade Variation',
  'Hole/Tear',
  'Count Deviation',
  'Other'
];

const SEVERITY_OPTIONS = [
  { id: 'Critical', label: 'Critical', desc: 'Halts line / high scrap risk', color: 'border-rose-500 bg-rose-50 text-rose-800' },
  { id: 'Major', label: 'Major', desc: 'Quality variance / needs rework', color: 'border-amber-500 bg-amber-50 text-amber-800' },
  { id: 'Minor', label: 'Minor', desc: 'Acceptable tolerance deviation', color: 'border-blue-500 bg-blue-50 text-blue-800' }
];

const MACHINE_SUGGESTIONS = [
  'Weave Line 04 (Naroda Plant)',
  'Dyeing Unit 02 (Santej Plant)',
  'Finishing Line 01 (Naroda Plant)',
  'Spinning Mill B (Nagpur Plant)',
  'Weave Line 12 (Santej Plant)'
];

export default function LogInspectionModal({ isOpen, onClose, onSubmit, submitting }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const nowStr = new Date().toISOString().slice(0, 16);

  const [date, setDate] = useState(nowStr);
  const [machineLineId, setMachineLineId] = useState('');
  const [defectType, setDefectType] = useState('Weave Defect');
  const [severity, setSeverity] = useState('Major');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!machineLineId.trim()) {
      setError('Machine/Line ID is required');
      return;
    }
    const selectedDateStr = new Date(date).toISOString().split('T')[0];
    if (selectedDateStr < todayStr) {
      setError('Inspection date cannot be in the past');
      return;
    }
    setError('');

    onSubmit({
      date: new Date(date).toISOString(),
      machineLineId: machineLineId.trim(),
      defectType,
      severity,
      remarks: remarks.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Factory className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">Log Quality Inspection</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold p-3 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Date & Time Field (Disallow Past Dates) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Inspection Date & Time</span>
            </label>
            <input
              type="datetime-local"
              min={nowStr.slice(0, 10) + 'T00:00'}
              value={date}
              onChange={(e) => {
                const selDate = e.target.value ? e.target.value.split('T')[0] : '';
                if (selDate && selDate < todayStr) {
                  setError('Inspection date cannot be in the past');
                } else {
                  setError('');
                }
                setDate(e.target.value);
              }}
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
              required
            />
          </div>

          {/* Machine / Line ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Machine / Line ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Weave Line 04, Loom #12"
              value={machineLineId}
              onChange={(e) => setMachineLineId(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
              required
            />
            {/* Quick Suggestions */}
            <div className="mt-1.5 flex flex-wrap gap-1">
              <span className="text-[10px] text-slate-400 font-medium self-center mr-1">Quick Suggestions:</span>
              {MACHINE_SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setMachineLineId(sug)}
                  className="text-[10px] bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 px-2 py-0.5 rounded transition"
                >
                  {sug.split(' ')[0]} {sug.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          {/* Defect Type Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Defect Type</span>
            </label>
            <select
              value={defectType}
              onChange={(e) => setDefectType(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
            >
              {DEFECT_TYPES.map((dt) => (
                <option key={dt} value={dt}>
                  {dt}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Severity Level <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SEVERITY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSeverity(opt.id)}
                  className={`p-2.5 rounded-lg border text-center transition flex flex-col items-center justify-center ${
                    severity === opt.id
                      ? `${opt.color} ring-2 ring-blue-500 font-bold shadow-xs`
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold">{opt.label}</span>
                  <span className="text-[9px] opacity-75 mt-0.5 hidden sm:inline">{opt.desc.split('/')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Remarks (Optional Textarea) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Supervisor Remarks <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Provide specific notes regarding cause, yarn batch, roll number, or fabric sample observations..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Submit Action Buttons */}
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
              className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition flex items-center space-x-1.5 disabled:opacity-50 touch-manipulation min-h-[44px]"
            >
              {submitting ? (
                <span>Logging...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Submit Inspection</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
