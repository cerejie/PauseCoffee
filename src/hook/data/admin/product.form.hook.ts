import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Form } from "antd";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { MenuGroupEnum, menuGroupLabels } from "../../../enums/menu.group.enum";
import { ServeTemperatureEnum } from "../../../enums/order.enum";
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

/// A fresh price row. Drinks are offered both ways until the admin narrows it;
/// food is never asked about temperature at all.
const blankSize = (menuGroup: MenuGroupEnum, sortOrder: number) => ({
  size_id: "",
  label: "",
  price: 0,
  serve_temperature:
    menuGroup === MenuGroupEnum.Drinks ? ServeTemperatureEnum.Both : null,
  sort_order: sortOrder,
});

const blankProduct: IProductRequest = {
  menu_group: MenuGroupEnum.Drinks,
  category_id: "",
  name: "",
  description: "",
  badge: "",
  image_path: null,
  sort_order: 99,
  is_active: true,
  sizes: [blankSize(MenuGroupEnum.Drinks, 1)],
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

  /// Every path this modal session put in the bucket. An upload happens the
  /// moment a photo is picked, so cancelling — or replacing it twice before
  /// saving — would otherwise leave files no row will ever point at.
  const uploadedPaths = useRef<string[]>([]);

  const trackUpload = useCallback((path: string) => {
    uploadedPaths.current.push(path);
  }, []);

  /// Best effort on purpose: an orphan costs a few dozen kilobytes, and a
  /// failed cleanup must never turn a saved item into an error.
  const discardImages = useCallback((paths: readonly string[]) => {
    paths.forEach((path) => {
      void adminServices.deleteMenuImage(path).catch(() => undefined);
    });
    uploadedPaths.current = [];
  }, []);

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

  /// Every category, grouped under the menu it belongs to, rather than only the
  /// ones matching a menu picked further up the form. Filtering them left the
  /// picker empty and disabled the moment a menu had no categories yet — which
  /// is exactly the state a shop is in when it adds its first food item, and no
  /// way out of it from inside the form.
  const categoryOptions = useMemo(
    () =>
      Object.values(MenuGroupEnum)
        .map((menuGroup) => ({
          label: menuGroupLabels[menuGroup],
          options: categories
            .filter((category) => category.menu_group === menuGroup)
            .map((category) => ({ value: category.id, label: category.name })),
        }))
        .filter((entry) => entry.options.length > 0),
    [categories],
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
        image_path: editing.image_path,
        sort_order: editing.sort_order,
        is_active: editing.is_active,
        sizes: editing.product_sizes.map((size) => ({
          id: size.id,
          size_id: size.size_id ?? "",
          label: size.label,
          price: Number(size.price),
          serve_temperature: size.serve_temperature,
          sort_order: size.sort_order,
          is_active: size.is_active,
        })),
      });
      return;
    }

    form.setFieldsValue(blankProduct);
  }, [modal.visible, editing, categories, form]);

  useEffect(() => {
    if (modal.visible) uploadedPaths.current = [];
  }, [modal.visible]);

  /// The category carries the menu group, so picking one settles which menu the
  /// item is on and which vocabulary the price rows use. Crossing between the
  /// two menus starts those rows over: a 16oz means nothing on a cookie.
  const onCategoryChange = useCallback(
    (categoryId: string) => {
      const next =
        categories.find((row) => row.id === categoryId)?.menu_group ??
        MenuGroupEnum.Drinks;
      const previous = form.getFieldValue("menu_group");

      form.setFieldsValue({ menu_group: next });

      if (previous && previous !== next) {
        form.setFieldsValue({ sizes: [blankSize(next, 1)] });
      }
    },
    [categories, form],
  );

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
          // Only drinks are served hot or iced; a row that changed menus keeps
          // no temperature it can no longer be asked about.
          serve_temperature:
            values.menu_group === MenuGroupEnum.Drinks
              ? (size.serve_temperature ?? ServeTemperatureEnum.Both)
              : null,
          sort_order: index + 1,
        })),
      }),

    onSuccess: (product) => {
      // The photo the item kept stays; everything else this session uploaded —
      // a first pick that was replaced, or the previous one being swapped out
      // — no longer has a row pointing at it.
      const replaced = editing?.image_path;
      discardImages([
        ...uploadedPaths.current.filter((path) => path !== product.image_path),
        ...(replaced && replaced !== product.image_path ? [replaced] : []),
      ]);

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
    /// Drinks or food, settled by the chosen category — the item form asks for
    /// sizes or types off the back of it.
    menuGroup: group,
    /// The row factory the form's "Add a size" button reaches for, so a new row
    /// starts with the temperature the current menu group expects.
    blankSize,
    categoryOptions,
    sizeOptions,
    hasCategories: categories.length > 0,
    onCategoryChange,
    trackUpload,
    close: () => {
      discardImages(uploadedPaths.current);
      form.resetFields();
      closeModal();
    },
    onSubmit: (values: IProductRequest) => mutation.mutate(values),
  };
};
