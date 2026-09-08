import { useMutation } from "@tanstack/react-query";
import { App } from "antd";
import { useMemo } from "react";
import {
  menuImageMaxBytes,
  menuImageMimeTypes,
} from "../../../constants/image.constants";
import {
  paymentQrFolder,
  paymentQrMaxBytes,
} from "../../../constants/payment.constants";
import { adminServices } from "../../../services/data/admin/admin.services";
import { compressMenuImage, compressPaymentQr } from "../../../utils/image.utils";
import { menuImageUrl } from "../../../utils/storage.utils";
import { supabaseError } from "../../../utils/supabase.utils";

/// What differs between one kind of upload and another: where it lands, how
/// large a raw file is accepted, and how hard it is squeezed. Everything else —
/// validate, compress in the browser, put it in the bucket, hand back the path
/// — is the same work, which is why it lives in one hook.
export interface IImageUploadPreset {
  folder: string;
  maxBytes: number;
  mimeTypes: readonly string[];
  compress: (file: File) => Promise<Blob>;
  /// Shown when the file is too big. Worded for the thing being uploaded.
  tooLargeMessage: string;
}

export const menuImagePreset: IImageUploadPreset = {
  folder: "products",
  maxBytes: menuImageMaxBytes,
  mimeTypes: menuImageMimeTypes,
  compress: compressMenuImage,
  tooLargeMessage: "That photo is too large. Try one straight from the camera roll.",
};

export const paymentQrPreset: IImageUploadPreset = {
  folder: paymentQrFolder,
  maxBytes: paymentQrMaxBytes,
  mimeTypes: menuImageMimeTypes,
  compress: compressPaymentQr,
  tooLargeMessage: "That image is too large. A screenshot of your QR is plenty.",
};

/// Picking an image: validate, downscale in the browser, put it in the bucket,
/// hand back the object path the row stores. The resize is not an optimisation
/// — it is what keeps the app inside the free tier, since server-side
/// transformation is a paid feature.
export const useImageUploadHook = (
  path: string | null | undefined,
  preset: IImageUploadPreset,
) => {
  const { notification } = App.useApp();

  const previewUrl = useMemo(() => menuImageUrl(path), [path]);

  const mutation = useMutation({
    mutationFn: async (file: File): Promise<string> => {
      if (!preset.mimeTypes.includes(file.type)) {
        throw new Error("That file isn't an image. Use a JPEG, PNG or WebP.");
      }
      if (file.size > preset.maxBytes) {
        throw new Error(preset.tooLargeMessage);
      }

      return adminServices.uploadMenuImage(await preset.compress(file), preset.folder);
    },

    onError: (error) => {
      notification.error({
        message: "Couldn't upload that image",
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
