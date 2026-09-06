import { useMutation } from "@tanstack/react-query";
import { App } from "antd";
import { useMemo } from "react";
import {
  menuImageMaxBytes,
  menuImageMimeTypes,
} from "../../../constants/image.constants";
import { adminServices } from "../../../services/data/admin/admin.services";
import { compressMenuImage } from "../../../utils/image.utils";
import { menuImageUrl } from "../../../utils/storage.utils";
import { supabaseError } from "../../../utils/supabase.utils";

const isAllowedType = (type: string): boolean =>
  (menuImageMimeTypes as readonly string[]).includes(type);

/// Picking a photo for an item: validate, downscale in the browser, put it in
/// the bucket, hand back the object path the product row stores. The resize is
/// not an optimisation — it is what keeps a menu's worth of photography inside
/// the free tier, since server-side transformation is a paid feature.
export const useProductImageHook = (path: string | null | undefined) => {
  const { notification } = App.useApp();

  const previewUrl = useMemo(() => menuImageUrl(path), [path]);

  const mutation = useMutation({
    mutationFn: async (file: File): Promise<string> => {
      if (!isAllowedType(file.type)) {
        throw new Error("That file isn't an image. Use a JPEG, PNG or WebP.");
      }
      if (file.size > menuImageMaxBytes) {
        throw new Error("That photo is too large. Try one straight from the camera roll.");
      }

      return adminServices.uploadProductImage(await compressMenuImage(file));
    },

    onError: (error) => {
      notification.error({
        message: "Couldn't upload that photo",
        description: supabaseError(error),
      });
    },
  });

  return {
    previewUrl,
    isUploading: mutation.isPending,
    /// Resolves to the stored path, or null when the upload was rejected — the
    /// caller only commits a value it actually got.
    upload: async (file: File): Promise<string | null> => {
      try {
        return await mutation.mutateAsync(file);
      } catch {
        return null;
      }
    },
  };
};
