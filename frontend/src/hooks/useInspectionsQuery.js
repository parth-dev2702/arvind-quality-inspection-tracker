import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchInspections,
  fetchSummary,
  createInspection,
  resolveInspection,
  triggerSapWebhook
} from '../utils/api';

/**
 * Custom TanStack Query Hook for fetching filterable inspection list
 */
export function useInspectionsQuery(filters) {
  return useQuery({
    queryKey: ['inspections', filters],
    queryFn: () => fetchInspections(filters),
    keepPreviousData: true
  });
}

/**
 * Custom TanStack Query Hook for fetching summary matrix metrics
 */
export function useSummaryQuery() {
  return useQuery({
    queryKey: ['inspectionSummary'],
    queryFn: fetchSummary,
    refetchInterval: 30000 // Background refresh every 30 seconds
  });
}

/**
 * Custom TanStack Query Hook for mutations (Create, Resolve, SAP Webhook)
 */
export function useInspectionMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['inspections'] });
    queryClient.invalidateQueries({ queryKey: ['inspectionSummary'] });
  };

  // Mutation for creating new inspection
  const createMutation = useMutation({
    mutationFn: (data) => createInspection(data),
    onSuccess: () => {
      invalidateAll();
    }
  });

  // Mutation for resolving an open inspection
  const resolveMutation = useMutation({
    mutationFn: ({ id, resolutionNote }) => resolveInspection(id, resolutionNote),
    onSuccess: () => {
      invalidateAll();
    }
  });

  // Mutation for triggering mock SAP webhook payload
  const sapMutation = useMutation({
    mutationFn: (payload) => triggerSapWebhook(payload),
    onSuccess: () => {
      invalidateAll();
    }
  });

  return {
    createMutation,
    resolveMutation,
    sapMutation,
    invalidateAll
  };
}
