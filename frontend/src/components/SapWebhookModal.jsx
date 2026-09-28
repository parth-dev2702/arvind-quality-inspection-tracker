import React, { useState } from 'react';
import { X, Terminal, Code2, Send, CheckCircle, Copy } from 'lucide-react';

const SAP_TEMPLATES = [
  {
    name: 'Yarn Tension Telemetry Alert',
    payload: {
      plantId: 'NAG-IND-01 (Nagpur Plant)',
      equipmentId: 'FINISHING-STENTER-02',
      sapDefectCode: 'DEF-809',
      defectCategory: 'Hole/Tear',
      severity: 'Critical',
      timestamp: new Date().toISOString(),
      telemetry: { pinChainTension: 'HIGH', edgeDefectMm: 12 },
      description: 'SAP Quality Management webhook: Continuous tear detected at stenter pin line.'
    }
  },
  {
    name: 'Dyeing Temperature Fluctuation',
    payload: {
      plantId: 'GJ-SAN-02 (Santej Plant)',
      equipmentId: 'DYEING-UNIT-04',
      sapDefectCode: 'DEF-405',
      defectCategory: 'Shade Variation',
      severity: 'Critical',
      timestamp: new Date().toISOString(),
      telemetry: { bathTemperatureC: 98.4, targetTemperatureC: 85.0 },
      description: 'SAP ERP System Alert: Thermal sensor over-shooting threshold during indigo bath cycle.'
    }
  },
  {
    name: 'Yarn Sensor Warning',
    payload: {
      plantId: 'GJ-AHM-01 (Naroda Plant)',
      equipmentId: 'WEAVE-LINE-09',
      sapDefectCode: 'DEF-102',
      defectCategory: 'Shade Variation',
      severity: 'Major',
      timestamp: new Date().toISOString(),
      telemetry: { loomSpeedRpm: 620, tensionDeviation: '+4.2%' },
      description: 'Auto-flagged by SAP IoT Sensors: Yarn tension anomaly causing shade mismatch.'
    }
  }
];

export default function SapWebhookModal({ isOpen, onClose, onSendWebhook, loading }) {
  const [jsonString, setJsonString] = useState(
    JSON.stringify(SAP_TEMPLATES[0].payload, null, 2)
  );
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState(null);

  if (!isOpen) return null;

  const handleSelectTemplate = (templatePayload) => {
    setJsonString(JSON.stringify(templatePayload, null, 2));
    setResponse(null);
    setError('');
  };

  const handleSend = async () => {
    try {
      setError('');
      setResponse(null);
      const parsed = JSON.parse(jsonString);
      const res = await onSendWebhook(parsed);
      setResponse(res);
    } catch (err) {
      setError(err.message || 'Invalid JSON formatting in payload editor');
    }
  };

  const handleCopyCurl = () => {
    const curl = `curl -X POST http://localhost:5000/api/sap-webhook \\\n  -H "Content-Type: application/json" \\\n  -d '${jsonString.replace(/\n/g, '')}'`;
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-950 border border-slate-800 text-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">

            <div>
              <h3 className="font-bold text-base text-slate-100">Mock SAP Integration Tester</h3>
              <p className="text-xs text-slate-400">Trigger POST /api/sap-webhook to simulate ERP defect injection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto">

          {/* Template Chips */}
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1.5">Load Sample SAP Payloads:</span>
            <div className="flex flex-wrap gap-2">
              {SAP_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  onClick={() => handleSelectTemplate(tmpl.payload)}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-lg transition font-medium"
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* JSON Payload Editor */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">

                <span>JSON Payload Editor (POST /api/sap-webhook)</span>
              </label>
              <button
                onClick={handleCopyCurl}
                className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied cURL!' : 'Copy cURL'}</span>
              </button>
            </div>
            <textarea
              rows={10}
              value={jsonString}
              onChange={(e) => setJsonString(e.target.value)}
              className="w-full font-mono text-xs bg-slate-900 border border-slate-800 rounded-xl p-3 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-rose-950/60 border border-rose-800 text-rose-300 text-xs p-3 rounded-lg">
              ❌ {error}
            </div>
          )}

          {response && (
            <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs p-3 rounded-lg space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span>Webhook Processed Successfully!</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Created Record Code: <span className="font-mono text-white font-bold">{response.inspection?.inspection_code}</span>
              </p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Close
          </button>
          <button
            onClick={handleSend}
            disabled={loading}
            className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow transition flex items-center space-x-1.5 disabled:opacity-50"
          >

            <span>{loading ? 'Sending...' : 'Dispatch Webhook Payload'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
