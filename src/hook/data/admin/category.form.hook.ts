import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Form } from "antd";
import { useEffect, useRef } from "react";
import { categoryAccents } from "../../../constants/brand.constants";
import { MenuGroupEnum } from "../../../enums/menu.group.enum";
import { adminCategoryFormModalKey } from "../../../keys/modal.keys";
import { adminCategoriesQueryKey, menuQueryKey } from "../../../keys/query.keys";
import type { ICategoryRequest } from "../../../models/data/menu/menu.request";
import type { ICategory } from "../../../models/data/menu/menu.response";
import { adminServices } from "../../../services/data/admin/admin.services";
import { slugify } from "../../../utils/formatter.utils";
import { nextSortOrder, uniqueSlug } from "../../../utils/masterfile.utils";
import { supabaseError } from "../../../utils/supabase.utils";
import { useModal } from "../../common/modal.hook";

/// The slug and the sort order are columns the admin never sees: the slug is
/// derived from the name, the order puts a new category at the end of the list.
type CategoryFormValues = Omit<ICategoryRequest, "slug" | "sort_order">;

/// The first accent no category is wearing yet, so the menu stays colour-coded
/// without the admin having to think about it. Past the end of the palette it
/// wraps — six categories in, a repeat is better than a blank field.
const nextAccent = (categories: readonly ICategory[]): string => {
  const taken = new Set(categories.map((category) => category.accent_color.toLowerCase()));
  return (
    categoryAccents.find((color) => !taken.has(color.toLowerCase())) ??
    categoryAccents[categories.length % categoryAccents.length]
  );
};

const blankCategory = (categories: readonly ICategory[]): CategoryFormValues => ({
  menu_group: MenuGroupEnum.Drinks,
  name: "",
  tagline: "",
  accent_color: nextAccent(categories),
  has_sweetness: false,
  is_active: true,
});

/// Create and update in one hook — `modal.data` presence is what decides which.
export const useCategoryFormHook = () => {
  const [form] = Form.useForm<CategoryFormValues>();
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const { modal, closeModal } = useModal<ICategory>(adminCategoryFormModalKey);

  const editing = modal.data;

  // Already in cache from the table behind this modal; read here so the slug
  // and the sort order can be worked out against the categories that exist.
  const categoriesQuery = useQuery({
    queryKey: [adminCategoriesQueryKey],
    queryFn: () => adminServices.getCategories(),
  });

  // Read at open time, not depended on: a background refetch landing mid-edit
  // must not reset the form under the admin.
  const categoriesRef = useRef<readonly ICategory[]>([]);
  useEffect(() => {
    categoriesRef.current = categoriesQuery.data ?? [];
  }, [categoriesQuery.data]);

  useEffect(() => {
    if (!modal.visible) return;

    form.setFieldsValue(
      editing
        ? {
            id: editing.id,
            menu_group: editing.menu_group,
            name: editing.name,
            tagline: editing.tagline ?? "",
            accent_color: editing.accent_color,
            has_sweetness: editing.has_sweetness,
            is_active: editing.is_active,
          }
        : blankCategory(categoriesRef.current),
    );
  }, [modal.visible, editing, form]);

  const mutation = useMutation({
    mutationFn: (values: CategoryFormValues) => {
      const categories = categoriesQuery.data ?? [];

      return adminServices.saveCategory({
        ...values,
        id: editing?.id,
        // An existing slug is left alone: the customer menu anchors on it, and
        // renaming a category should not break a link that is already out there.
        slug:
          editing?.slug ??
          uniqueSlug(
            slugify(values.name),
            categories.map((category) => category.slug),
          ),
        sort_order: editing?.sort_order ?? nextSortOrder(categories),
        tagline: values.tagline?.trim() || null,
      });
    },

    onSuccess: (category) => {
      form.resetFields();
      closeModal();
      void queryClient.invalidateQueries({ queryKey: [adminCategoriesQueryKey] });
      void queryClient.invalidateQueries({ queryKey: [menuQueryKey] });

      notification.success({
        message: editing ? `${category.name} updated` : `${category.name} added`,
        placement: "bottomRight",
      });
    },

    onError: (error) => {
      notification.error({
        message: "Couldn't save that category",
        description: supabaseError(error),
      });
    },
  });

  return {
    form,
    visible: modal.visible,
    isEditing: Boolean(editing),
    isSaving: mutation.isPending,
    close: () => {
      form.resetFields();
      closeModal();
    },
    onSubmit: (values: CategoryFormValues) => mutation.mutate(values),
  };
};
