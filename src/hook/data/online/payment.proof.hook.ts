import { useMutation } from "@tanstack/react-query";
import { App } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  paymentProofMaxBytes,
  paymentProofMimeTypes,
} from "../../../constants/payment.constants";
import { orderServices } from "../../../services/data/order/order.services";
import { compressPaymentProof } from "../../../utils/image.utils";
import { supabaseError } from "../../../utils/supabase.utils";

const isAllowedType = (type: string): boolean =>
  (paymentProofMimeTypes as readonly string[]).includes(type);

/// Uploading the receipt that pays for an online order.
///
/// The preview is a local object URL, not a bucket URL, and that is not an
/// optimisation — the payment-proofs bucket is PRIVATE and a guest has no
/// select policy on it (0014). The customer can see the file they just picked
/// because the browser still holds it; nobody else can see it at all until
/// staff mint a signed URL.
export const usePaymentProofHook = () => {
  const { notification } = App.useApp();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Held in a ref so the cleanup effect always revokes the URL that is
  // actually on screen, rather than one captured in a stale closure.
  const objectUrl = useRef<string | null>(null);

  const releasePreview = useCallback(() => {
    if (objectUrl.current) {
      URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = null;
    }
    setPreviewUrl(null);
  }, []);

  useEffect(() => releasePreview, [releasePreview]);

  const mutation = useMutation({
    mutationFn: async (file: File): Promise<string> => {
      if (!isAllowedType(file.type)) {
        throw new Error("That isn't an image. Send a screenshot or a photo.");
      }
      if (file.size > paymentProofMaxBytes) {
        throw new Error("That image is too large. A screenshot is plenty.");
      }

      return orderServices.uploadPaymentProof(await compressPaymentProof(file));
    },

    onError: (error) => {
      notification.error({
        message: "Couldn't upload that receipt",
        description: supabaseError(error),
        placement: "bottomRight",
      });
    },
  });

  return {
    previewUrl,
    isUploading: mutation.isPending,
    clear: releasePreview,

    /// Resolves to the stored object path, or null when the upload failed —
    /// the form only ever commits a path it actually got back, because the
    /// server will check that the object is really there before it accepts
    /// the order.
    upload: async (file: File): Promise<string | null> => {
      try {
        const path = await mutation.mutateAsync(file);

        releasePreview();
        const next = URL.createObjectURL(file);
        objectUrl.current = next;
        setPreviewUrl(next);

        return path;
      } catch {
        return null;
      }
    },
  };
};
