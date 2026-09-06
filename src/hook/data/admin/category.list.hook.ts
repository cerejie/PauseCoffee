import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { useCallback, useMemo } from "react";
import { adminCategoryFormModalKey } from "../../../keys/modal.keys";
import {
  adminCategoriesQueryKey,
  adminProductsQueryKey,
  menuQueryKey,
} from "../../../keys/query.keys";
import type { ICategory } from "../../../models/data/menu/menu.response";
import { adminServices } from "../../../services/data/admin/admin.services";
import { supabaseError } from "../../../utils/supabase.utils";
import { useModal } from "../../common/modal.hook";

/// The category masterfile: the level between drinks/food and a product. The
/// product count per row comes from the products query so hiding a category
/// can say how many drinks go with it.
export const useCategoryListHook = () => {
  const queryClient = useQueryClient();
  const { notification, modal: confirm } = App.useApp();
  const { openModal } = useModal<ICategory>(adminCategoryFormModalKey);

  const categoriesQuery = useQuery({
    queryKey: [adminCategoriesQueryKey],
    queryFn: () => adminServices.getCategories(),
  });

  const productsQuery = useQuery({
    queryKey: [adminProductsQueryKey],
    queryFn: () => adminServices.getProducts(),
  });

  const rows = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of productsQuery.data ?? []) {
      counts.set(product.category_id, (counts.get(product.category_id) ?? 0) + 1);
    }

    return (categoriesQuery.data ?? []).map((category) => ({
      ...category,
      productCount: counts.get(category.id) ?? 0,
    }));
  }, [categoriesQuery.data, productsQuery.data]);

  const activeMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminServices.setCategoryActive(id, isActive),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [adminCategoriesQueryKey] });
      void queryClient.invalidateQueries({ queryKey: [menuQueryKey] });
    },

    onError: (error) => {
      notification.error({
        message: "Couldn't update that category",
        description: supabaseError(error),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (category: ICategory) => adminServices.deleteCategory(category.id),

    onSuccess: (_result, category) => {
      void queryClient.invalidateQueries({ queryKey: [adminCategoriesQueryKey] });
      void queryClient.invalidateQueries({ queryKey: [menuQueryKey] });

      notification.success({
        message: `${category.name} deleted`,
        placement: "bottomRight",
      });
    },

    onError: (error) => {
      notification.error({
        message: "Couldn't delete that category",
        description: supabaseError(error),
      });
    },
  });

  /// A category with items on it is refused by the database (0010). Catching it
  /// here first turns a foreign-key error into a sentence that says which items
  /// are in the way.
  const remove = useCallback(
    (category: ICategory & { productCount: number }) => {
      if (category.productCount) {
        confirm.warning({
          title: `${category.name} still has items`,
          content: `Move or delete its ${category.productCount} item(s) first. Deleting a category never takes its drinks with it.`,
          okText: "Got it",
          centered: true,
        });
        return;
      }

      confirm.confirm({
        title: `Delete ${category.name}?`,
        content:
          "The category and the add-ons offered under it go for good. To take it off the customer menu for a while, use the On menu switch instead.",
        okText: "Delete it",
        cancelText: "Cancel",
        okButtonProps: { danger: true },
        centered: true,
        onOk: () => deleteMutation.mutateAsync(category),
      });
    },
    [confirm, deleteMutation],
  );

  const toggleActive = useCallback(
    (category: ICategory & { productCount: number }) => {
      if (category.is_active) {
        confirm.confirm({
          title: `Hide ${category.name}?`,
          content: category.productCount
            ? `${category.productCount} item(s) under it leave the customer menu too.`
            : "It disappears from the customer menu straight away.",
          okText: "Hide it",
          cancelText: "Keep it",
          centered: true,
          onOk: () => activeMutation.mutateAsync({ id: category.id, isActive: false }),
        });
        return;
      }
      activeMutation.mutate({ id: category.id, isActive: true });
    },
    [confirm, activeMutation],
  );

  return {
    rows,
    isLoading: categoriesQuery.isLoading,
    isFetching: categoriesQuery.isFetching,
    refetch: categoriesQuery.refetch,
    openForm: (category?: ICategory) => openModal(category),
    toggleActive,
    isToggling: activeMutation.isPending,
    remove,
    /// The row being deleted, not a flag — a shared boolean would spin every
    /// bin in the table at once.
    removingId: deleteMutation.isPending ? (deleteMutation.variables?.id ?? null) : null,
  };
};
