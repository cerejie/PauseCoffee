import { useMutation, useQueryClient } from "@tanstack/react-query";
import { App, Form } from "antd";
import { useEffect } from "react";
import { MenuGroupEnum } from "../../../enums/menu.group.enum";
import { adminCategoryFormModalKey } from "../../../keys/modal.keys";
import { adminCategoriesQueryKey, menuQueryKey } from "../../../keys/query.keys";
import type { ICategoryRequest } from "../../../models/data/menu/menu.request";
import type { ICategory } from "../../../models/data/menu/menu.response";
import { adminServices } from "../../../services/data/admin/admin.services";
import { slugify } from "../../../utils/formatter.utils";
import { supabaseError } from "../../../utils/supabase.utils";
import { useModal } from "../../common/modal.hook";

const blankCategory: ICategoryRequest = {
  slug: "",
  menu_group: MenuGroupEnum.Drinks,
  name: "",
  tagline: "",
  accent_color: "#E9A13B",
  has_temperature: true,
  has_sweetness: false,
  sort_order: 99,
  is_active: true,
};

/// Create and update in one hook — `modal.data` presence is what decides which.
export const useCategoryFormHook = () => {
  const [form] = Form.useForm<ICategoryRequest>();
  const { notification } = App.useApp();
  const queryClient = useQueryClient();
  const { modal, closeModal } = useModal<ICategory>(adminCategoryFormModalKey);

  const editing = modal.data;

  useEffect(() => {
    if (!modal.visible) return;

    form.setFieldsValue(
      editing
        ? {
            id: editing.id,
            slug: editing.slug,
            menu_group: editing.menu_group,
            name: editing.name,
            tagline: editing.tagline ?? "",
            accent_color: editing.accent_color,
            has_temperature: editing.has_temperature,
            has_sweetness: editing.has_sweetness,
            sort_order: editing.sort_order,
            is_active: editing.is_active,
          }
        : blankCategory,
    );
  }, [modal.visible, editing, form]);

  const mutation = useMutation({
    mutationFn: (values: ICategoryRequest) =>
      adminServices.saveCategory({
        ...values,
        id: editing?.id,
        // The slug is what the customer menu anchors and scrolls to, so it is
        // derived rather than asked for when the admin leaves it blank.
        slug: slugify(values.slug || values.name),
        tagline: values.tagline?.trim() || null,
      }),

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
    onSubmit: (values: ICategoryRequest) => mutation.mutate(values),
  };
};
