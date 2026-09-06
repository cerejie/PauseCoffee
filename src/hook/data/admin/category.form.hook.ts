import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Form } from "antd";
import { useEffect } from "react";
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

const blankCategory: CategoryFormValues = {
  menu_group: MenuGroupEnum.Drinks,
  name: "",
  tagline: "",
  accent_color: "#E9A13B",
  has_temperature: true,
  has_sweetness: false,
  is_active: true,
};

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
            has_temperature: editing.has_temperature,
            has_sweetness: editing.has_sweetness,
            is_active: editing.is_active,
          }
        : blankCategory,
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
