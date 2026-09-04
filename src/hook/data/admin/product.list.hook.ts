import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { useCallback, useMemo } from "react";
import {
  adminCategoriesQueryKey,
  adminProductsQueryKey,
  menuQueryKey,
} from "../../../keys/query.keys";
import { adminProductFormModalKey } from "../../../keys/modal.keys";
import type { IProduct } from "../../../models/data/menu/menu.response";
import { adminServices } from "../../../services/data/admin/admin.services";
import { supabaseError } from "../../../utils/supabase.utils";
import { useModal } from "../../common/modal.hook";

/// The menu masterfile table: products with their sizes, tagged with the
/// category and group they sit under. The form owns its own pickers.
export const useProductListHook = () => {
  const queryClient = useQueryClient();
  const { notification, modal: confirm } = App.useApp();
  const { openModal } = useModal<IProduct>(adminProductFormModalKey);

  const categoriesQuery = useQuery({
    queryKey: [adminCategoriesQueryKey],
    queryFn: () => adminServices.getCategories(),
  });

  const productsQuery = useQuery({
    queryKey: [adminProductsQueryKey],
    queryFn: () => adminServices.getProducts(),
  });

  const categoriesById = useMemo(
    () => new Map((categoriesQuery.data ?? []).map((c) => [c.id, c])),
    [categoriesQuery.data],
  );

  const rows = useMemo(
    () =>
      (productsQuery.data ?? []).map((product) => ({
        ...product,
        product_sizes: [...product.product_sizes].sort(
          (a, b) => a.sort_order - b.sort_order,
        ),
        categoryName: categoriesById.get(product.category_id)?.name ?? "—",
        categoryAccent: categoriesById.get(product.category_id)?.accent_color,
        menuGroup: categoriesById.get(product.category_id)?.menu_group ?? null,
      })),
    [productsQuery.data, categoriesById],
  );

  const activeMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminServices.setProductActive(id, isActive),

    onSuccess: () => {
      // The customer menu reads the same rows, so both caches have to go.
      void queryClient.invalidateQueries({ queryKey: [adminProductsQueryKey] });
      void queryClient.invalidateQueries({ queryKey: [menuQueryKey] });
    },

    onError: (error) => {
      notification.error({
        message: "Couldn't update that item",
        description: supabaseError(error),
      });
    },
  });

  const toggleActive = useCallback(
    (product: IProduct) => {
      if (product.is_active) {
        confirm.confirm({
          title: `Hide ${product.name}?`,
          content: "It disappears from the customer menu straight away.",
          okText: "Hide it",
          cancelText: "Keep it",
          centered: true,
          onOk: () =>
            activeMutation.mutateAsync({ id: product.id, isActive: false }),
        });
        return;
      }
      activeMutation.mutate({ id: product.id, isActive: true });
    },
    [confirm, activeMutation],
  );

  return {
    rows,
    isLoading: productsQuery.isLoading || categoriesQuery.isLoading,
    isFetching: productsQuery.isFetching,
    refetch: productsQuery.refetch,
    openForm: (product?: IProduct) => openModal(product),
    toggleActive,
    isToggling: activeMutation.isPending,
  };
};
