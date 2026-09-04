import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Form } from "antd";
import { useEffect, useMemo } from "react";
import { MenuGroupEnum } from "../../../enums/menu.group.enum";
import { adminProductFormModalKey } from "../../../keys/modal.keys";
import {
  adminCategoriesQueryKey,
  adminProductsQueryKey,
  adminSizesQueryKey,
  menuQueryKey,
} from "../../../keys/query.keys";
import type { IProductRequest } from "../../../models/data/menu/menu.request";
import type { IProduct } from "../../../models/data/menu/menu.response";
import { adminServices } from "../../../services/data/admin/admin.services";
import { supabaseError } from "../../../utils/supabase.utils";
import { useModal } from "../../common/modal.hook";

const blankProduct: IProductRequest = {
  menu_group: MenuGroupEnum.Drinks,
  category_id: "",
  name: "",
  description: "",
  badge: "",
  sort_order: 99,
  is_active: true,
  sizes: [{ size_id: "", label: "", price: 0, sort_order: 1 }],
};

/// Create and update in one hook — `modal.data` presence is what decides which.
/// The group is a form-only field: it narrows the category and size pickers so
/// a pastry cannot be filed under Matcha or priced in 16oz.
export const useProductFormHook = () => {
  const [form] = Form.useForm<IProductRequest>();
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const { modal, closeModal } = useModal<IProduct>(adminProductFormModalKey);

  const editing = modal.data;
  const watchedGroup = Form.useWatch("menu_group", form);

  const categoriesQuery = useQuery({
    queryKey: [adminCategoriesQueryKey],
    queryFn: () => adminServices.getCategories(),
  });

  const sizesQuery = useQuery({
    queryKey: [adminSizesQueryKey],
    queryFn: () => adminServices.getSizes(),
  });

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const sizes = useMemo(() => sizesQuery.data ?? [], [sizesQuery.data]);

  /// The watch is empty for the first render after the modal opens. Falling
  /// back to the edited item's own group keeps its category out of a picker
  /// that would otherwise have nothing to render its id as.
  const group =
    watchedGroup ??
    (editing
      ? categories.find((row) => row.id === editing.category_id)?.menu_group
      : undefined) ??
    MenuGroupEnum.Drinks;

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((category) => category.menu_group === group)
        .map((category) => ({ value: category.id, label: category.name })),
    [categories, group],
  );

  /// A size with no group is offered everywhere — 12oz is a drinks size, but
  /// "Regular" serves both sides of the menu.
  const sizeOptions = useMemo(
    () =>
      sizes
        .filter((size) => size.is_active && (!size.menu_group || size.menu_group === group))
        .map((size) => ({ value: size.id, label: size.name })),
    [sizes, group],
  );

  useEffect(() => {
    if (!modal.visible) return;

    if (editing) {
      const category = categories.find((row) => row.id === editing.category_id);

      form.setFieldsValue({
        id: editing.id,
        menu_group: category?.menu_group ?? MenuGroupEnum.Drinks,
        category_id: editing.category_id,
        name: editing.name,
        description: editing.description ?? "",
        badge: editing.badge ?? "",
        sort_order: editing.sort_order,
        is_active: editing.is_active,
        sizes: editing.product_sizes.map((size) => ({
          id: size.id,
          size_id: size.size_id ?? "",
          label: size.label,
          price: Number(size.price),
          sort_order: size.sort_order,
          is_active: size.is_active,
        })),
      });
      return;
    }

    form.setFieldsValue(blankProduct);
  }, [modal.visible, editing, categories, form]);

  /// Switching group invalidates whatever was picked under the old one.
  const onGroupChange = () => {
    form.setFieldsValue({
      category_id: "",
      sizes: [{ size_id: "", label: "", price: 0, sort_order: 1 }],
    });
  };

  const mutation = useMutation({
    mutationFn: (values: IProductRequest) =>
      adminServices.saveProduct({
        ...values,
        id: editing?.id,
        description: values.description?.trim() || null,
        badge: values.badge?.trim() || null,
        // The label is copied from the masterfile at save time: the receipt has
        // to keep saying "16oz" even if the size is renamed next month.
        sizes: values.sizes.map((size, index) => ({
          ...size,
          label: sizes.find((row) => row.id === size.size_id)?.name ?? size.label,
          price: Number(size.price),
          sort_order: index + 1,
        })),
      }),

    onSuccess: (product) => {
      form.resetFields();
      closeModal();
      void queryClient.invalidateQueries({ queryKey: [adminProductsQueryKey] });
      void queryClient.invalidateQueries({ queryKey: [menuQueryKey] });

      notification.success({
        message: editing ? `${product.name} updated` : `${product.name} added`,
        placement: "bottomRight",
      });
    },

    onError: (error) => {
      notification.error({
        message: "Couldn't save that item",
        description: supabaseError(error),
      });
    },
  });

  return {
    form,
    visible: modal.visible,
    isEditing: Boolean(editing),
    isSaving: mutation.isPending,
    categoryOptions,
    sizeOptions,
    hasCategories: categories.length > 0,
    onGroupChange,
    close: () => {
      form.resetFields();
      closeModal();
    },
    onSubmit: (values: IProductRequest) => mutation.mutate(values),
  };
};
