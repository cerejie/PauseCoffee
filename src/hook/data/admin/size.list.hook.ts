import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Form } from "antd";
import { useEffect, useMemo } from "react";
import { adminSizeFormModalKey } from "../../../keys/modal.keys";
import {
  adminProductsQueryKey,
  adminSizesQueryKey,
  menuQueryKey,
} from "../../../keys/query.keys";
import type { ISizeRequest } from "../../../models/data/menu/menu.request";
import type { ISize } from "../../../models/data/menu/menu.response";
import { adminServices } from "../../../services/data/admin/admin.services";
import { nextSortOrder } from "../../../utils/masterfile.utils";
import { supabaseError } from "../../../utils/supabase.utils";
import { useModal } from "../../common/modal.hook";

/// The sort order is not typed any more — a new size goes to the end.
type SizeFormValues = Omit<ISizeRequest, "sort_order">;

const blankSize: SizeFormValues = {
  name: "",
  menu_group: null,
  is_active: true,
};

/// Sizes are a short, flat masterfile — list and form live together, the same
/// shape as add-ons. A size carries no price: the price is per product.
export const useSizeListHook = () => {
  const [form] = Form.useForm<SizeFormValues>();
  const queryClient = useQueryClient();
  const { notification } = App.useApp();
  const { modal, openModal, closeModal } = useModal<ISize>(adminSizeFormModalKey);

  const editing = modal.data;

  const query = useQuery({
    queryKey: [adminSizesQueryKey],
    queryFn: () => adminServices.getSizes(),
  });

  const productsQuery = useQuery({
    queryKey: [adminProductsQueryKey],
    queryFn: () => adminServices.getProducts(),
  });

  /// How many products price against each size — renaming or retiring one is a
  /// different decision when eleven drinks use it.
  const rows = useMemo(() => {
    const usage = new Map<string, number>();
    for (const product of productsQuery.data ?? []) {
      for (const size of product.product_sizes) {
        if (!size.size_id) continue;
        usage.set(size.size_id, (usage.get(size.size_id) ?? 0) + 1);
      }
    }

    return (query.data ?? []).map((size) => ({
      ...size,
      usedBy: usage.get(size.id) ?? 0,
    }));
  }, [query.data, productsQuery.data]);

  useEffect(() => {
    if (!modal.visible) return;
    form.setFieldsValue(
      editing
        ? {
            id: editing.id,
            name: editing.name,
            menu_group: editing.menu_group,
            is_active: editing.is_active,
          }
        : blankSize,
    );
  }, [modal.visible, editing, form]);

  const mutation = useMutation({
    mutationFn: (values: SizeFormValues) =>
      adminServices.saveSize({
        ...values,
        id: editing?.id,
        name: values.name.trim(),
        menu_group: values.menu_group ?? null,
        sort_order: editing?.sort_order ?? nextSortOrder(query.data ?? []),
      }),

    onSuccess: (size) => {
      form.resetFields();
      closeModal();
      void queryClient.invalidateQueries({ queryKey: [adminSizesQueryKey] });
      void queryClient.invalidateQueries({ queryKey: [menuQueryKey] });

      notification.success({
        message: editing ? `${size.name} updated` : `${size.name} added`,
        placement: "bottomRight",
      });
    },

    onError: (error) => {
      notification.error({
        message: "Couldn't save that size",
        description: supabaseError(error),
      });
    },
  });

  return {
    rows,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
    form,
    visible: modal.visible,
    isEditing: Boolean(editing),
    isSaving: mutation.isPending,
    openForm: (size?: ISize) => openModal(size),
    close: () => {
      form.resetFields();
      closeModal();
    },
    onSubmit: (values: SizeFormValues) => mutation.mutate(values),
  };
};
