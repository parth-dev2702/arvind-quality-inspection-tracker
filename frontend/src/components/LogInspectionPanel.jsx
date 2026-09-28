import React, { useState } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

const DEFECT_TYPES = [
  'Weave Defect',
  'Shade Variation',
  'Hole/Tear',
  'Count Deviation',
  'Other'
];

const SEVERITY_OPTIONS = [
  { id: 'Critical', label: 'Critical', dotColor: 'bg-rose-500' },
  { id: 'Major', label: 'Major', dotColor: 'bg-amber-500' },
  { id: 'Minor', label: 'Minor', dotColor: 'bg-yellow-500' }
];

export default function LogInspectionPanel({ onSubmit, submitting }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [machineLineId, setMachineLineId] = useState('');
  const [defectType, setDefectType] = useState('Weave Defect');
  const [severity, setSeverity] = useState('Critical');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!machineLineId.trim()) {
      setError('Machine / Line ID is required');
      return;
    }
    if (date < todayStr) {
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

    // Reset form after successful submission
    setMachineLineId('');
    setRemarks('');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between sticky top-20">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Log New Inspection
        </h2>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold p-2.5 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Date (Cannot select past date!) */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Date <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              min={todayStr}
              value={date}
              onChange={(e) => {
                if (e.target.value < todayStr) {
                  setError('Inspection date cannot be in the past');
                } else {
                  setError('');
                }
                setDate(e.target.value);
              }}
              className="w-full p-2.5 pr-9 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Machine / Line ID */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Machine / Line ID <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Line 3, M/C 12"
            value={machineLineId}
            onChange={(e) => setMachineLineId(e.target.value)}
            className="w-full p-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Defect Type */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Defect Type <span className="text-rose-500">*</span>
          </label>
          <select
            value={defectType}
            onChange={(e) => setDefectType(e.target.value)}
            className="w-full p-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            {DEFECT_TYPES.map((dt) => (
              <option key={dt} value={dt}>
                {dt}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Radio Dots */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Severity <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center space-x-3 text-xs">
            {SEVERITY_OPTIONS.map((opt) => (
              <label key={opt.id} className="flex items-center space-x-1.5 cursor-pointer py-1">
                <input
                  type="radio"
                  name="panel_severity"
                  value={opt.id}
                  checked={severity === opt.id}
                  onChange={() => setSeverity(opt.id)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className={`w-2.5 h-2.5 rounded-full ${opt.dotColor} inline-block`}></span>
                <span className="font-semibold text-slate-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Remarks (Optional) */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Remarks (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Enter any additional details..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full p-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Inspection Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-[0.99] disabled:opacity-50 touch-manipulation min-h-[44px]"
        >
          {submitting ? 'Submitting...' : 'Submit Inspection'}
        </button>

      </form>
    </div>
  );
}
