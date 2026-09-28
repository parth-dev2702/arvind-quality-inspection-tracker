const STORAGE_KEY = 'arvind_offline_inspection_queue';

/**
 * Get all pending offline requests
 */
export function getOfflineQueue() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading offline queue from localStorage:', err);
    return [];
  }
}

/**
 * Save item to offline queue
 */
export function saveToOfflineQueue(type, payload) {
  const queue = getOfflineQueue();
  const newItem = {
    id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    type, // 'CREATE_INSPECTION' or 'RESOLVE_INSPECTION'
    payload,
    timestamp: new Date().toISOString()
  };
  queue.push(newItem);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  return newItem;
}

/**
 * Remove an item from the offline queue
 */
export function removeFromOfflineQueue(id) {
  let queue = getOfflineQueue();
  queue = queue.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

/**
 * Clear full offline queue
 */
export function clearOfflineQueue() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Synchronize offline queue with backend API server
 */
export async function syncOfflineQueue(apiCallFn) {
  const queue = getOfflineQueue();
  if (queue.length === 0) return { syncedCount: 0, errors: [] };

  let syncedCount = 0;
  const errors = [];

  for (const item of queue) {
    try {
      if (item.type === 'CREATE_INSPECTION') {
        await apiCallFn('/api/inspections', 'POST', item.payload);
        removeFromOfflineQueue(item.id);
        syncedCount++;
      } else if (item.type === 'RESOLVE_INSPECTION') {
        const { inspectionId, resolutionNote } = item.payload;
        await apiCallFn(`/api/inspections/${inspectionId}/resolve`, 'PATCH', { resolutionNote });
        removeFromOfflineQueue(item.id);
        syncedCount++;
      }
    } catch (err) {
      console.error(`Failed to sync item ${item.id}:`, err);
      errors.push({ id: item.id, error: err.message });
    }
  }

  return { syncedCount, errors };
}
