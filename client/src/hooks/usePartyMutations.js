/**
 * usePartyMutations.js
 * Generic mutation hook for any party entity type.
 * Replaces the hardcoded useCustomerMutations.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createParty, updateParty, deleteParty } from '../api/party';
import { useMastersStore } from '../store/useMastersStore';

export function usePartyMutations() {
  const queryClient = useQueryClient();
  const closeModal  = useMastersStore((s) => s.closeModal);

  // ── CREATE ──────────────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: (payload) => createParty(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      closeModal();
    },
  });

  // ── UPDATE (with optimistic update) ─────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateParty(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['parties'] });
      const snapshot = queryClient.getQueriesData({ queryKey: ['parties'] });

      queryClient.setQueriesData({ queryKey: ['parties'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          listData: old.listData.map((item) =>
            item._id === id || item.id === id ? { ...item, ...payload } : item
          ),
        };
      });

      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      // Rollback on failure
      ctx?.snapshot?.forEach(([queryKey, value]) =>
        queryClient.setQueryData(queryKey, value)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      closeModal();
    },
  });

  // ── DELETE (with optimistic update) ─────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteParty(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['parties'] });
      const snapshot = queryClient.getQueriesData({ queryKey: ['parties'] });

      queryClient.setQueriesData({ queryKey: ['parties'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          listData: old.listData.filter((item) => item._id !== id && item.id !== id),
        };
      });

      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshot?.forEach(([queryKey, value]) =>
        queryClient.setQueryData(queryKey, value)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
    },
  });

  return {
    addParty:    addMutation.mutateAsync,
    updateParty: (id, payload) => updateMutation.mutateAsync({ id, payload }),
    deleteParty: deleteMutation.mutateAsync,
    isSaving:    addMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
