import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { OrderStatusEnum } from "../../../enums/order.enum";
import { orderHistoryQueryKey } from "../../../keys/query.keys";
import { orderHistoryPaginationKey } from "../../../keys/table.keys";
import { orderServices } from "../../../services/data/order/order.services";
import { useOrderStore } from "../../../store/data/order/order.store";
import { usePagination } from "../../common/pagination.hook";

/// Paged, searchable history of every order. The pagination object is part of
/// the query key, so a page change is a cache entry rather than a refetch of
/// the same key.
export const useOrderHistoryHook = () => {
  const { pagination, setPagination } = usePagination(orderHistoryPaginationKey, {
    pageNumber: 1,
    pageSize: 10,
  });

  const search = useOrderStore((s) => s.historySearch);
  const setSearchValue = useOrderStore((s) => s.setHistorySearch);
  const status = useOrderStore((s) => s.historyStatus);
  const setStatusValue = useOrderStore((s) => s.setHistoryStatus);

  const query = useQuery({
    queryKey: [orderHistoryQueryKey, pagination, search, status],
    queryFn: () =>
      orderServices.getHistory({
        pageNumber: Number(pagination.pageNumber),
        pageSize: Number(pagination.pageSize),
        search,
        status,
      }),
    placeholderData: keepPreviousData,
  });

  // Any filter change has to drop back to page one, or a narrowed result set
  // leaves the table sitting on a page that no longer exists.
  const setSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      setPagination({ ...pagination, pageNumber: 1 });
    },
    [setSearchValue, setPagination, pagination],
  );

  const setStatus = useCallback(
    (value: OrderStatusEnum | null) => {
      setStatusValue(value);
      setPagination({ ...pagination, pageNumber: 1 });
    },
    [setStatusValue, setPagination, pagination],
  );

  const onTableChange = useCallback(
    (page: number, pageSize: number) => {
      setPagination({ ...pagination, pageNumber: page, pageSize });
    },
    [setPagination, pagination],
  );

  return {
    rows: query.data?.data ?? [],
    totalCount: query.data?.totalCount ?? 0,
    pagination,
    search,
    setSearch,
    status,
    setStatus,
    onTableChange,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};
