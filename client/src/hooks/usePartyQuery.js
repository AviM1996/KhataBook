/**
 * usePartyQuery.js
 * Generic React Query hook for fetching any party type.
 * Replaces the hardcoded useCustomersQuery.
 * Uses ENTITY_CONFIG[recordType].summaryMapper to normalize API data.
 */
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getParties, getPartyCard } from '../api/party';
import { ENTITY_CONFIG } from '../config/entityConfig';
import { useAuth } from '../context/AuthContext';

const DEFAULT_PAGINATION = {
  itemCount: 0, currentPage: 1, pageCount: 1, hasNext: false, hasPrev: false,
};

const DEFAULT_SUMMARY = {
  totalCount: 0, totalSalesOrPurchase: 0, totalPayment: 0, totalOutstanding: 0,
};

export function usePartyQuery({ recordType = 'CUSTOMER', page = 1, limit = 10, search = '' }) {
  const { user, loading: authLoading } = useAuth();
  const config = ENTITY_CONFIG[recordType];

  const query = useQuery({
    queryKey: ['parties', recordType, page, limit, search.trim().toLowerCase()],
    queryFn: async () => {
      const [listRes, cardRes] = await Promise.all([
        getParties({ recordType, page, limit, search }),
        getPartyCard({ recordType }),
      ]);

      const listData = listRes?.itemsList || [];

      const paginationData = {
        itemCount:   listRes?.itemCount   || 0,
        currentPage: listRes?.currentPage || page,
        pageCount:   listRes?.pageCount   || 1,
        hasNext:     listRes?.hasNext     || false,
        hasPrev:     listRes?.hasPrev     || false,
      };

      const rawSummary = cardRes?.data || {};
      
      const mappedSummary = config?.summaryMapper(rawSummary) ?? DEFAULT_SUMMARY;

      return { listData, paginationData, mappedSummary };
    },
    enabled: !authLoading && !!user,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  return {
    data:         query.data?.listData      || [],
    pagination:   query.data?.paginationData || DEFAULT_PAGINATION,
    summary:      query.data?.mappedSummary  || DEFAULT_SUMMARY,
    loading:      query.isLoading || authLoading,
    isFetching:   query.isFetching,
    error:        query.isError ? query.error?.message : null,
  };
}
