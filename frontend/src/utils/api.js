import { saveToOfflineQueue, getOfflineQueue } from './offlineStorage';

const API_BASE_URL = ''; // Uses Vite proxy in dev, relative URL in prod

export async function request(endpoint, method = 'GET', data = null, customHeaders = {}) {
  const token = localStorage.getItem('arvind_token');
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    // Check if network error (offline) and method is mutation
    const isNetworkError = !window.navigator.onLine || err.message.includes('Failed to fetch') || err.name === 'TypeError';
    
    if (isNetworkError && (method === 'POST' || method === 'PATCH')) {
      if (endpoint === '/api/inspections' && method === 'POST') {
        const queued = saveToOfflineQueue('CREATE_INSPECTION', data);
        return {
          isOffline: true,
          message: 'Offline mode active: Inspection saved locally and queued for automatic sync.',
          inspection: {
            id: queued.id,
            inspection_code: 'INS-OFFLINE-LOCAL',
            date: data.date || new Date().toISOString(),
            machine_line_id: data.machineLineId,
            defect_type: data.defectType,
            severity: data.severity,
            status: 'Open',
            remarks: data.remarks ? `${data.remarks} (Logged Offline)` : '(Logged Offline)',
            source: 'offline_queue'
          }
        };
      }

      if (endpoint.includes('/resolve') && method === 'PATCH') {
        const parts = endpoint.split('/');
        const inspectionId = parts[3];
        saveToOfflineQueue('RESOLVE_INSPECTION', { inspectionId, resolutionNote: data.resolutionNote });
        return {
          isOffline: true,
          message: 'Offline mode active: Resolution queued for sync when online.'
        };
      }
    }

    throw err;
  }
}

// API functions
export function fetchSummary() {
  return request('/api/inspections/summary');
}

export function fetchInspections(filters = {}) {
  const params = new URLSearchParams();
  if (filters.severity && filters.severity !== 'all') params.append('severity', filters.severity);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.search) params.append('search', filters.search);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const queryStr = params.toString();
  return request(`/api/inspections${queryStr ? `?${queryStr}` : ''}`);
}

export function createInspection(data) {
  return request('/api/inspections', 'POST', data);
}

export function resolveInspection(id, resolutionNote) {
  return request(`/api/inspections/${id}/resolve`, 'PATCH', { resolutionNote });
}

export function triggerSapWebhook(payload) {
  return request('/api/sap-webhook', 'POST', payload);
}

export function loginUser(email, password) {
  return request('/api/auth/login', 'POST', { email, password });
}
