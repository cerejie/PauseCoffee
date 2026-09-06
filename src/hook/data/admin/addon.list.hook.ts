import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Form } from "antd";
import { useCallback, useEffect, useMemo } from "react";
import { adminAddonFormModalKey } from "../../../keys/modal.keys";
import {
  adminAddonsQueryKey,
  adminCategoriesQueryKey,
  adminCategoryAddonsQueryKey,
  menuQueryKey,
} from "../../../keys/query.keys";
import type { IAddonRequest } from "../../../models/data/menu/menu.request";
import type { IAddon } from "../../../models/data/menu/menu.response";
import { adminServices } from "../../../services/data/admin/admin.services";
import { nextSortOrder } from "../../../utils/masterfile.utils";
import { supabaseError } from "../../../utils/supabase.utils";
import { useModal } from "../../common/modal.hook";

/// The sort order is not typed any more — a new add-on goes to the end.
type AddonFormValues = Omit<IAddonRequest, "sort_order">;

const blankAddon: AddonFormValues = {
  name: "",
  price: 0,
  is_active: true,
  category_ids: [],
};

/// Add-ons are a short, flat list — list and form live together rather than
/// splitting a five-row table across two hooks.
export const useAddonListHook = () => {
  const [form] = Form.useForm<AddonFormValues>();
  const queryClient = useQueryClient();
  const { notification, modal: confirm } = App.useApp();
  const { modal, openModal, closeModal } = useModal<IAddon>(adminAddonFormModalKey);

  const editing = modal.data;

  const query = useQuery({
    queryKey: [adminAddonsQueryKey],
    queryFn: () => adminServices.getAddons(),
  });

  const categoriesQuery = useQuery({
    queryKey: [adminCategoriesQueryKey],
    queryFn: () => adminServices.getCategories(),
  });

  /// Which categories offer which add-on. Read as raw link rows and grouped
  /// here, so both the table column and the form's multi-select read one query.
  const linksQuery = useQuery({
    queryKey: [adminCategoryAddonsQueryKey],
    queryFn: () => adminServices.getCategoryAddons(),
  });

  const categoryIdsByAddon = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const link of linksQuery.data ?? []) {
      map.set(link.addon_id, [...(map.get(link.addon_id) ?? []), link.category_id]);
    }
    return map;
  }, [linksQuery.data]);

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);

  const rows = useMemo(
    () =>
      (query.data ?? []).map((addon) => ({
        ...addon,
        categoryNames: (categoryIdsByAddon.get(addon.id) ?? [])
          .map((id) => categories.find((category) => category.id === id)?.name)
          .filter((name): name is string => Boolean(name))
          .sort((a, b) => a.localeCompare(b)),
      })),
    [query.data, categoryIdsByAddon, categories],
  );

  useEffect(() => {
    if (!modal.visible) return;
    form.setFieldsValue(
      editing
        ? {
            id: editing.id,
            name: editing.name,
            price: Number(editing.price),
            is_active: editing.is_active,
            category_ids: categoryIdsByAddon.get(editing.id) ?? [],
          }
        : blankAddon,
    );
  }, [modal.visible, editing, categoryIdsByAddon, form]);

  const mutation = useMutation({
    mutationFn: (values: AddonFormValues) =>
      adminServices.saveAddon({
        ...values,
        id: editing?.id,
        price: Number(values.price),
        category_ids: values.category_ids ?? [],
        sort_order: editing?.sort_order ?? nextSortOrder(query.data ?? []),
      }),

    onSuccess: (addon) => {
      form.resetFields();
      closeModal();
      void queryClient.invalidateQueries({ queryKey: [adminAddonsQueryKey] });
      void queryClient.invalidateQueries({ queryKey: [adminCategoryAddonsQueryKey] });
      void queryClient.invalidateQueries({ queryKey: [menuQueryKey] });

      notification.success({
        message: editing ? `${addon.name} updated` : `${addon.name} added`,
        placement: "bottomRight",
      });
    },

    onError: (error) => {
      notification.error({
        message: "Couldn't save that add-on",
        description: supabaseError(error),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (addon: IAddon) => adminServices.deleteAddon(addon.id),

    onSuccess: (_result, addon) => {
      void queryClient.invalidateQueries({ queryKey: [adminAddonsQueryKey] });
      void queryClient.invalidateQueries({ queryKey: [adminCategoryAddonsQueryKey] });
      void queryClient.invalidateQueries({ queryKey: [menuQueryKey] });

      notification.success({
        message: `${addon.name} deleted`,
        placement: "bottomRight",
      });
    },

    onError: (error) => {
      notification.error({
        message: "Couldn't delete that add-on",
        description: supabaseError(error),
      });
    },
  });

  /// No guard needed: the category links cascade, and an add-on already on a
  /// receipt was copied into order_items.addons as json when the order was
  /// placed, so deleting it cannot reach backwards into history.
  const remove = useCallback(
    (addon: IAddon) => {
      confirm.confirm({
        title: `Delete ${addon.name}?`,
        content:
          "It stops being offered on every category at once. Orders already placed keep their own copy. To pause it instead, untick Active.",
        okText: "Delete it",
        cancelText: "Cancel",
        okButtonProps: { danger: true },
        centered: true,
        onOk: () => deleteMutation.mutateAsync(addon),
      });
    },
    [confirm, deleteMutation],
  );

  return {
    rows,
    remove,
    /// The row being deleted, not a flag — a shared boolean would spin every
    /// bin in the table at once.
    removingId: deleteMutation.isPending ? (deleteMutation.variables?.id ?? null) : null,
    categoryOptions: categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
    isLoading: query.isLoading || categoriesQuery.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
    form,
    visible: modal.visible,
    isEditing: Boolean(editing),
    isSaving: mutation.isPending,
    openForm: (addon?: IAddon) => openModal(addon),
    close: () => {
      form.resetFields();
      closeModal();
    },
    onSubmit: (values: AddonFormValues) => mutation.mutate(values),
  };
};
