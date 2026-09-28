import { useState, useCallback, useEffect } from 'react';
import { fetchInspections, fetchSummary } from '../utils/api';

/**
 * Senior Dev Custom Hook: Manages inspection data fetching, filtering, and summary state
 */
export function useInspections(initialFilters) {
  const [inspections, setInspections] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [listRes, summaryRes] = await Promise.all([
        fetchInspections(filters),
        fetchSummary()
      ]);
      setInspections(listRes.inspections || []);
      setSummaryData(summaryRes);
    } catch (err) {
      console.error('Error fetching inspection data:', err);
      setError(err.message || 'Failed to load inspections');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return {
    inspections,
    summaryData,
    loading,
    error,
    filters,
    updateFilter,
    resetFilters,
    reload: loadData
  };
}
