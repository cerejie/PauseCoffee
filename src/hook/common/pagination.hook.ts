import { useMemo } from "react";
import type { IPaginationRequest } from "../../models/common/pagination.model";
import { IPaginationRequestFormValues } from "../../models/common/pagination.model";
import { usePaginationStore } from "../../store/common/pagination.store";

export const usePagination = (key: string, defaultPagination?: IPaginationRequest) => {
  const entry = usePaginationStore((s) => s.paginations[key]);
  const setPaginationAt = usePaginationStore((s) => s.setPagination);
  const resetPaginationAt = usePaginationStore((s) => s.resetPagination);

  const fallback = useMemo(
    () => defaultPagination ?? new IPaginationRequestFormValues(),
    // Defaults are declared inline at the call site; only the key identifies them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  const pagination = entry ?? fallback;

  return useMemo(
    () => ({
      pagination,
      setPagination: (value: IPaginationRequest) => setPaginationAt(key, value),
      resetPagination: () => resetPaginationAt(key, fallback),
    }),
    [pagination, key, fallback, setPaginationAt, resetPaginationAt],
  );
};
